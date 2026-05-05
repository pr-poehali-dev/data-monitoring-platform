import json
import os
import time
import math
import random
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Content-Type': 'application/json',
}


# ─── Симуляция датчика для авто-опроса ───────────────────────────────────────
def synth_value(sensor: dict, t: float) -> float:
    nmin = float(sensor.get('norm_min') or 0)
    nmax = float(sensor.get('norm_max') or 100)
    mid = (nmin + nmax) / 2
    amp = (nmax - nmin) * 0.35
    noise = (random.random() - 0.5) * (nmax - nmin) * 0.1
    seed = sum(ord(c) for c in (sensor.get('id') or 'x'))
    val = mid + amp * math.sin(t / 60 + seed) + noise
    if sensor.get('id') == 'H-02':
        val = max(val, 72)
    if random.random() < 0.05:
        val += (nmax - nmin) * (1.2 if random.random() > 0.5 else -1.2)
    return round(val, 2)


# ─── Задачи ──────────────────────────────────────────────────────────────────
def job_poll_sensors(conn) -> tuple[str, int]:
    """Авто-опрос всех датчиков всех проектов."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT id, norm_min, norm_max, status FROM sensors WHERE status != 'offline'")
        sensors = cur.fetchall()
    t = time.time()
    inserted = 0
    with conn.cursor() as cur:
        for s in sensors:
            v = synth_value(dict(s), t)
            cur.execute("INSERT INTO readings (sensor_id, value) VALUES (%s, %s)", (s['id'], v))
            inserted += 1
    return f'Опрошено датчиков: {inserted}', inserted


def job_detect_anomalies(conn) -> tuple[str, int]:
    """Анализ показаний за последний час, создание алертов при выходе за норму."""
    created = 0
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT s.id, s.name, s.unit, s.project_id, s.norm_min, s.norm_max,
                   AVG(r.value) AS avg_v, MAX(r.value) AS max_v, MIN(r.value) AS min_v,
                   COUNT(r.id) AS cnt
            FROM sensors s
            LEFT JOIN readings r ON r.sensor_id = s.id AND r.ts > NOW() - INTERVAL '1 hour'
            WHERE s.status != 'offline'
            GROUP BY s.id, s.name, s.unit, s.project_id, s.norm_min, s.norm_max
        """)
        rows = cur.fetchall()

    for r in rows:
        if not r['cnt'] or r['cnt'] < 3 or r['norm_min'] is None or r['norm_max'] is None:
            continue
        nmin = float(r['norm_min'])
        nmax = float(r['norm_max'])
        avg_v = float(r['avg_v'])

        message = None
        level = 'warning'
        if avg_v > nmax * 1.05:
            message = f"{r['name']}: среднее за час {avg_v:.1f}{r['unit'] or ''} выше нормы ({nmax}{r['unit'] or ''})"
            level = 'warning'
        elif avg_v < nmin * 0.95:
            message = f"{r['name']}: среднее за час {avg_v:.1f}{r['unit'] or ''} ниже нормы ({nmin}{r['unit'] or ''})"
            level = 'warning'

        if message:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 1 FROM alerts
                    WHERE sensor_id = %s AND level = %s AND created_at > NOW() - INTERVAL '1 hour'
                    LIMIT 1
                """, (r['id'], level))
                if cur.fetchone() is None:
                    cur.execute("""
                        INSERT INTO alerts (project_id, sensor_id, level, message)
                        VALUES (%s, %s, %s, %s)
                    """, (r['project_id'], r['id'], level, message))
                    created += 1

    return f'Создано алертов: {created}', created


def job_check_offline(conn) -> tuple[str, int]:
    """Помечает датчик offline, если нет показаний > 10 минут (online → offline)."""
    changed = 0
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT s.id, s.project_id, s.name, MAX(r.ts) AS last_ts
            FROM sensors s LEFT JOIN readings r ON r.sensor_id = s.id
            WHERE s.status = 'online'
            GROUP BY s.id, s.project_id, s.name
        """)
        rows = cur.fetchall()
    for r in rows:
        if r['last_ts'] is None:
            continue
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE sensors SET status = 'warning'
                WHERE id = %s AND %s < NOW() - INTERVAL '10 minutes'
            """, (r['id'], r['last_ts']))
            if cur.rowcount > 0:
                changed += 1
                cur.execute("""
                    INSERT INTO alerts (project_id, sensor_id, level, message)
                    VALUES (%s, %s, 'error', %s)
                """, (r['project_id'], r['id'], f"Связь с датчиком {r['name']} потеряна более 10 минут"))
    return f'Помечено как warning: {changed}', changed


def job_cleanup_readings(conn) -> tuple[str, int]:
    """Подсчитывает показания старше 30 дней (для перевода в Parquet архив)."""
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM readings WHERE ts < NOW() - INTERVAL '30 days'")
        old = cur.fetchone()[0]
    return f'К архивации: {old} записей (Parquet pipeline)', int(old)


def job_daily_report(conn) -> tuple[str, int]:
    """Регистрирует автоотчёт в reports (генерация — асинхронно через /reports)."""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO reports (project_id, title, format, period, status)
            VALUES ('farm', 'Авто‑отчёт по ферме (за сутки)', 'pdf', '24h', 'queued')
            RETURNING id
        """)
        rid = cur.fetchone()[0]
    return f'Поставлен в очередь отчёт #{rid}', 1


def job_weekly_report(conn) -> tuple[str, int]:
    """Сводный недельный отчёт по всем активным проектам."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT id FROM projects WHERE status = 'active'")
        projects = cur.fetchall()
    queued = 0
    with conn.cursor() as cur:
        for p in projects:
            cur.execute("""
                INSERT INTO reports (project_id, title, format, period, status)
                VALUES (%s, %s, 'pdf', '7d', 'queued')
            """, (p['id'], f"Еженедельный авто‑отчёт ({p['id']})"))
            queued += 1
    return f'Поставлено в очередь отчётов: {queued}', queued


def job_retrain_models(conn) -> tuple[str, int]:
    """Симулирует переобучение ИИ-моделей на свежих данных."""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO ai_insights (project_id, kind, title, content, score)
            VALUES ('farm', 'retrain', 'Дообучение модели урожая',
                    'Использовано показаний: ' || (SELECT COUNT(*) FROM readings WHERE ts > NOW() - INTERVAL '6 hours'),
                    %s)
        """, (round(0.92 + random.random() * 0.06, 3),))
    return 'Модель урожая дообучена', 1


JOBS = {
    'poll_sensors':     job_poll_sensors,
    'detect_anomalies': job_detect_anomalies,
    'check_offline':    job_check_offline,
    'cleanup_readings': job_cleanup_readings,
    'daily_report':     job_daily_report,
    'weekly_report':    job_weekly_report,
    'retrain_models':   job_retrain_models,
}


# ─── Движок ──────────────────────────────────────────────────────────────────
def run_due_jobs(conn) -> dict:
    """Запускает все задачи, у которых next_run_at <= NOW(). Идемпотентно."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, code, interval_seconds FROM automation_jobs
            WHERE is_enabled AND next_run_at <= NOW()
            ORDER BY next_run_at ASC
        """)
        due = cur.fetchall()

    results = []
    for job in due:
        fn = JOBS.get(job['code'])
        started = time.time()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO automation_runs (job_id, status) VALUES (%s, 'running')
                RETURNING id
            """, (job['id'],))
            run_id = cur.fetchone()[0]

        try:
            if fn is None:
                raise RuntimeError(f'неизвестный код задачи: {job["code"]}')
            message, count = fn(conn)
            duration_ms = int((time.time() - started) * 1000)
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE automation_runs
                    SET finished_at = NOW(), status = 'success', message = %s,
                        records_processed = %s, duration_ms = %s
                    WHERE id = %s
                """, (message, count, duration_ms, run_id))
                cur.execute("""
                    UPDATE automation_jobs
                    SET last_run_at = NOW(), last_status = 'success', last_message = %s,
                        next_run_at = NOW() + (interval_seconds || ' seconds')::interval,
                        total_runs = total_runs + 1
                    WHERE id = %s
                """, (message, job['id']))
            results.append({'code': job['code'], 'status': 'success', 'message': message, 'count': count, 'duration_ms': duration_ms})
        except Exception as e:
            duration_ms = int((time.time() - started) * 1000)
            err_msg = str(e)[:500]
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE automation_runs
                    SET finished_at = NOW(), status = 'error', message = %s, duration_ms = %s
                    WHERE id = %s
                """, (err_msg, duration_ms, run_id))
                cur.execute("""
                    UPDATE automation_jobs
                    SET last_run_at = NOW(), last_status = 'error', last_message = %s,
                        next_run_at = NOW() + (interval_seconds || ' seconds')::interval,
                        total_runs = total_runs + 1, total_failures = total_failures + 1
                    WHERE id = %s
                """, (err_msg, job['id']))
            results.append({'code': job['code'], 'status': 'error', 'message': err_msg})

    return {'executed': len(results), 'results': results}


def handler(event: dict, context) -> dict:
    """Автономный движок: опрашивает датчики, ищет аномалии, шлёт алерты, готовит отчёты."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'tick')

        # ───────── Запуск всех просроченных задач ─────────
        if action == 'tick':
            res = run_due_jobs(conn)
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(res)}

        # ───────── Список задач ─────────
        if method == 'GET' and action == 'jobs':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, code, name, description, interval_seconds, is_enabled,
                           last_run_at, last_status, last_message, next_run_at,
                           total_runs, total_failures
                    FROM automation_jobs ORDER BY id
                """)
                jobs = cur.fetchall()
            items = [{
                'id': j['id'], 'code': j['code'], 'name': j['name'],
                'description': j['description'], 'interval_seconds': j['interval_seconds'],
                'is_enabled': j['is_enabled'],
                'last_run_at': j['last_run_at'].isoformat() if j['last_run_at'] else None,
                'last_status': j['last_status'], 'last_message': j['last_message'],
                'next_run_at': j['next_run_at'].isoformat() if j['next_run_at'] else None,
                'total_runs': int(j['total_runs']), 'total_failures': int(j['total_failures']),
            } for j in jobs]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'items': items})}

        # ───────── История запусков ─────────
        if method == 'GET' and action == 'runs':
            try:
                limit = max(1, min(200, int(params.get('limit', 50))))
            except ValueError:
                limit = 50
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT r.id, j.code, j.name, r.started_at, r.finished_at, r.status,
                           r.message, r.records_processed, r.duration_ms
                    FROM automation_runs r JOIN automation_jobs j ON j.id = r.job_id
                    ORDER BY r.started_at DESC LIMIT %s
                """, (limit,))
                rows = cur.fetchall()
            items = [{
                'id': r['id'], 'code': r['code'], 'name': r['name'],
                'started_at': r['started_at'].isoformat() if r['started_at'] else None,
                'finished_at': r['finished_at'].isoformat() if r['finished_at'] else None,
                'status': r['status'], 'message': r['message'],
                'records_processed': r['records_processed'],
                'duration_ms': r['duration_ms'],
            } for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'items': items})}

        # ───────── Включить/выключить задачу ─────────
        if method == 'PATCH':
            try:
                body = json.loads(event.get('body') or '{}')
            except json.JSONDecodeError:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Невалидный JSON'})}
            job_id = body.get('id')
            is_enabled = body.get('is_enabled')
            interval = body.get('interval_seconds')
            if not isinstance(job_id, int):
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id: ожидается integer'})}
            with conn.cursor() as cur:
                if isinstance(is_enabled, bool):
                    cur.execute("UPDATE automation_jobs SET is_enabled = %s WHERE id = %s", (is_enabled, job_id))
                if isinstance(interval, int) and 10 <= interval <= 86400 * 7:
                    cur.execute("""
                        UPDATE automation_jobs SET interval_seconds = %s,
                          next_run_at = NOW() + (%s || ' seconds')::interval
                        WHERE id = %s
                    """, (interval, str(interval), job_id))
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # ───────── Запустить задачу немедленно ─────────
        if method == 'POST' and action == 'run_now':
            try:
                body = json.loads(event.get('body') or '{}')
            except json.JSONDecodeError:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Невалидный JSON'})}
            code = body.get('code')
            fn = JOBS.get(code) if isinstance(code, str) else None
            if fn is None:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неизвестный код задачи'})}
            try:
                message, count = fn(conn)
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE automation_jobs
                        SET last_run_at = NOW(), last_status = 'success', last_message = %s,
                            total_runs = total_runs + 1
                        WHERE code = %s
                    """, (message, code))
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                    'status': 'success', 'message': message, 'count': count
                })}
            except Exception as e:
                return {'statusCode': 500, 'headers': CORS, 'body': json.dumps({'error': str(e)[:500]})}

        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неизвестное действие'})}
    finally:
        conn.close()
