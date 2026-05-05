import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Content-Type': 'application/json',
}


def handler(event: dict, context) -> dict:
    """Управление алертами: список, создание, подтверждение."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            limit = int(params.get('limit', 50))
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT a.id, a.level, a.message, a.acknowledged, a.created_at, "
                    "p.name AS project_name, p.id AS project_id, a.sensor_id "
                    "FROM alerts a LEFT JOIN projects p ON p.id = a.project_id "
                    "ORDER BY a.created_at DESC LIMIT %s",
                    (limit,),
                )
                rows = cur.fetchall()
            items = [{
                'id': r['id'],
                'level': r['level'],
                'message': r['message'],
                'acknowledged': r['acknowledged'],
                'project': r['project_name'] or 'Платформа',
                'project_id': r['project_id'],
                'sensor_id': r['sensor_id'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
            } for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'items': items})}

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            level = body.get('level', 'info')
            message = body.get('message', '')
            project_id = body.get('project_id')
            sensor_id = body.get('sensor_id')
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO alerts (level, message, project_id, sensor_id) VALUES (%s,%s,%s,%s) RETURNING id",
                    (level, message, project_id, sensor_id),
                )
                new_id = cur.fetchone()[0]
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'id': new_id})}

        if method == 'PATCH':
            body = json.loads(event.get('body') or '{}')
            alert_id = body.get('id')
            user_id = (event.get('headers') or {}).get('X-User-Id') or (event.get('headers') or {}).get('x-user-id')
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE alerts SET acknowledged = true, acknowledged_by = %s WHERE id = %s",
                    (int(user_id) if user_id else None, alert_id),
                )
                cur.execute(
                    "INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (%s, 'ack_alert', 'alert', %s)",
                    (int(user_id) if user_id else None, str(alert_id)),
                )
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        conn.close()
