import json
import os
import math
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}


def stats(values):
    n = len(values)
    if n == 0:
        return 0.0, 0.0
    mean = sum(values) / n
    var = sum((v - mean) ** 2 for v in values) / n
    return mean, math.sqrt(var)


def detect_anomalies(points: list, z_threshold: float = 2.0):
    """Z-score детектор аномалий."""
    values = [p['value'] for p in points]
    if len(values) < 5:
        return []
    mean, std = stats(values)
    if std < 1e-9:
        return []
    anomalies = []
    for p in points:
        z = (p['value'] - mean) / std
        if abs(z) >= z_threshold:
            anomalies.append({'ts': p['ts'], 'value': p['value'], 'z_score': round(z, 2)})
    return anomalies


def linear_forecast(points: list, horizon: int = 12):
    """Линейная регрессия и прогноз на N точек вперёд."""
    n = len(points)
    if n < 5:
        return []
    xs = list(range(n))
    ys = [p['value'] for p in points]
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((xs[i] - mx) * (ys[i] - my) for i in range(n))
    den = sum((xs[i] - mx) ** 2 for i in range(n)) or 1
    slope = num / den
    intercept = my - slope * mx
    last_ts = points[-1]['ts']
    step = (points[-1]['ts'] - points[0]['ts']) / max(n - 1, 1)
    return [{
        'ts': int(last_ts + step * (i + 1)),
        'value': round(intercept + slope * (n + i), 2),
    } for i in range(horizon)]


def handler(event: dict, context) -> dict:
    """ИИ-инсайты: детектор аномалий, прогнозы, рекомендации."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'insights')

        if action == 'insights':
            project = params.get('project', 'farm')
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT s.id, s.name, s.unit, s.norm_min, s.norm_max, "
                    "ROUND(AVG(r.value)::numeric, 2) AS avg_v, "
                    "COUNT(r.id) AS cnt "
                    "FROM sensors s LEFT JOIN readings r ON r.sensor_id = s.id AND r.ts > NOW() - INTERVAL '6 hours' "
                    "WHERE s.project_id = %s GROUP BY s.id, s.name, s.unit, s.norm_min, s.norm_max",
                    (project,),
                )
                stats_rows = cur.fetchall()

            insights = []
            for s in stats_rows:
                avg_v = float(s['avg_v'] or 0)
                nmin = float(s['norm_min'] or 0)
                nmax = float(s['norm_max'] or 0)
                if avg_v == 0 and s['cnt'] == 0:
                    continue
                if avg_v > nmax:
                    insights.append({
                        'level': 'warning',
                        'icon': 'TrendingUp',
                        'color': '#F59E0B',
                        'title': f"{s['name']}: выше нормы",
                        'text': f"Среднее за 6ч {avg_v}{s['unit'] or ''} (норма ≤ {nmax}). Рекомендую снизить параметр.",
                    })
                elif avg_v < nmin:
                    insights.append({
                        'level': 'warning',
                        'icon': 'TrendingDown',
                        'color': '#3b82f6',
                        'title': f"{s['name']}: ниже нормы",
                        'text': f"Среднее за 6ч {avg_v}{s['unit'] or ''} (норма ≥ {nmin}). Рекомендую повысить параметр.",
                    })
                else:
                    insights.append({
                        'level': 'success',
                        'icon': 'CheckCircle2',
                        'color': '#10B981',
                        'title': f"{s['name']}: в норме",
                        'text': f"Среднее за 6ч {avg_v}{s['unit'] or ''} в пределах {nmin}–{nmax}.",
                    })

            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'insights': insights})}

        if action == 'anomalies':
            sensor_id = params.get('sensor_id', 'T-01')
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT EXTRACT(EPOCH FROM ts)::bigint AS ts, value FROM readings "
                    "WHERE sensor_id = %s AND ts > NOW() - INTERVAL '24 hours' ORDER BY ts",
                    (sensor_id,),
                )
                rows = cur.fetchall()
            points = [{'ts': int(r['ts']), 'value': float(r['value'])} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'sensor_id': sensor_id,
                'anomalies': detect_anomalies(points),
                'samples': len(points),
            })}

        if action == 'forecast':
            sensor_id = params.get('sensor_id', 'T-01')
            horizon = int(params.get('horizon', 12))
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT EXTRACT(EPOCH FROM ts)::bigint AS ts, value FROM readings "
                    "WHERE sensor_id = %s ORDER BY ts DESC LIMIT 100",
                    (sensor_id,),
                )
                rows = cur.fetchall()
            points = list(reversed([{'ts': int(r['ts']), 'value': float(r['value'])} for r in rows]))
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'sensor_id': sensor_id,
                'history': points[-50:],
                'forecast': linear_forecast(points, horizon),
            })}

        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}
    finally:
        conn.close()
