import json
import os
import random
import math
import time
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}


def synth_value(sensor: dict, t: float) -> float:
    """Симуляция показаний датчика — синусоида в пределах нормы + шум."""
    nmin = float(sensor.get('norm_min') or 0)
    nmax = float(sensor.get('norm_max') or 100)
    mid = (nmin + nmax) / 2
    amp = (nmax - nmin) * 0.35
    noise = (random.random() - 0.5) * (nmax - nmin) * 0.08
    seed = sum(ord(c) for c in (sensor.get('id') or 'x'))
    val = mid + amp * math.sin(t / 60 + seed) + noise
    if sensor['id'] == 'H-02':
        val = max(val, 72)  # симуляция аномалии — постоянно выше нормы
    return round(val, 2)


def handler(event: dict, context) -> dict:
    """Получение текущих показаний датчиков и истории за период."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'snapshot')

        if action == 'snapshot':
            project = params.get('project', 'farm')
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, name, unit, device, norm_min, norm_max, status FROM sensors WHERE project_id = %s ORDER BY id",
                    (project,),
                )
                sensors = cur.fetchall()

            t = time.time()
            result = []
            for s in sensors:
                val = synth_value(dict(s), t) if s['status'] != 'offline' else None
                result.append({
                    'id': s['id'],
                    'name': s['name'],
                    'unit': s['unit'],
                    'device': s['device'],
                    'norm_min': float(s['norm_min']) if s['norm_min'] is not None else None,
                    'norm_max': float(s['norm_max']) if s['norm_max'] is not None else None,
                    'value': val,
                    'status': s['status'],
                })

            # Сохраняем показания для истории (sample)
            with conn.cursor() as cur:
                for r in result:
                    if r['value'] is not None:
                        cur.execute(
                            "INSERT INTO readings (sensor_id, value) VALUES (%s, %s)",
                            (r['id'], r['value']),
                        )

            cpu = round(35 + random.random() * 30, 1)
            mem = round(58 + random.random() * 20, 1)
            net = round(15 + random.random() * 40, 1)
            disk = round(40 + random.random() * 15, 1)

            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'ts': int(t * 1000),
                'sensors': result,
                'system': {'cpu': cpu, 'memory': mem, 'network': net, 'disk': disk},
            })}

        if action == 'history':
            sensor_id = params.get('sensor_id')
            period = params.get('period', '1h')
            mapping = {'1h': 60, '24h': 24 * 60, '7d': 7 * 24 * 60, '30d': 30 * 24 * 60}
            minutes = mapping.get(period, 60)

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT EXTRACT(EPOCH FROM ts)::bigint AS ts, value FROM readings "
                    "WHERE sensor_id = %s AND ts > NOW() - (%s || ' minutes')::interval "
                    "ORDER BY ts ASC LIMIT 500",
                    (sensor_id, str(minutes)),
                )
                rows = cur.fetchall()

            # Если истории мало — генерим синтетику
            if len(rows) < 10:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT id, norm_min, norm_max FROM sensors WHERE id = %s", (sensor_id,))
                    s = cur.fetchone()
                if s:
                    now = time.time()
                    points = 50
                    rows = []
                    for i in range(points):
                        ts = now - (points - i) * (minutes * 60 / points)
                        rows.append({'ts': int(ts), 'value': synth_value(dict(s), ts)})

            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'sensor_id': sensor_id,
                'period': period,
                'points': [{'ts': int(r['ts']), 'value': float(r['value'])} for r in rows],
            })}

        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}
    finally:
        conn.close()
