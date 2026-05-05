import json
import os
import re
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Content-Type': 'application/json',
}


CREATE_SCHEMA = {
    'type': 'object',
    'required': ['level', 'message'],
    'properties': {
        'level':      {'type': 'string', 'enum': ['info', 'success', 'warning', 'error']},
        'message':    {'type': 'string', 'minLength': 1, 'maxLength': 1000},
        'project_id': {'type': 'string', 'maxLength': 64},
        'sensor_id':  {'type': 'string', 'maxLength': 64},
    },
    'additionalProperties': False,
}

ACK_SCHEMA = {
    'type': 'object',
    'required': ['id'],
    'properties': {'id': {'type': 'integer'}},
    'additionalProperties': False,
}


def validate(data, schema, path=''):
    t = schema.get('type')
    if t == 'object':
        if not isinstance(data, dict):
            return f'{path or "$"}: ожидается object'
        for req in schema.get('required', []):
            if req not in data:
                return f'{path}.{req}: обязательное поле'
        if not schema.get('additionalProperties', True):
            extra = set(data.keys()) - set(schema.get('properties', {}).keys())
            if extra:
                return f'{path}: неизвестные поля: {", ".join(sorted(extra))}'
        for k, sub in schema.get('properties', {}).items():
            if k in data:
                err = validate(data[k], sub, f'{path}.{k}')
                if err:
                    return err
    elif t == 'string':
        if not isinstance(data, str):
            return f'{path}: ожидается string'
        if 'minLength' in schema and len(data) < schema['minLength']:
            return f'{path}: минимум {schema["minLength"]} символов'
        if 'maxLength' in schema and len(data) > schema['maxLength']:
            return f'{path}: максимум {schema["maxLength"]} символов'
        if 'enum' in schema and data not in schema['enum']:
            return f'{path}: должно быть одно из {schema["enum"]}'
        if 'pattern' in schema and not re.match(schema['pattern'], data):
            return f'{path}: неверный формат'
    elif t == 'integer':
        if not isinstance(data, int) or isinstance(data, bool):
            return f'{path}: ожидается integer'
    return None


def handler(event: dict, context) -> dict:
    """Управление алертами: список, создание (с JSON Schema), подтверждение."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            try:
                limit = max(1, min(200, int(params.get('limit', 50))))
            except ValueError:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'limit: ожидается integer'})}
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
                'id': r['id'], 'level': r['level'], 'message': r['message'],
                'acknowledged': r['acknowledged'],
                'project': r['project_name'] or 'Платформа',
                'project_id': r['project_id'], 'sensor_id': r['sensor_id'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
            } for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'items': items})}

        if method == 'POST':
            try:
                body = json.loads(event.get('body') or '{}')
            except json.JSONDecodeError:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Невалидный JSON'})}
            schema_err = validate(body, CREATE_SCHEMA)
            if schema_err:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': schema_err})}
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO alerts (level, message, project_id, sensor_id) VALUES (%s,%s,%s,%s) RETURNING id",
                    (body['level'], body['message'], body.get('project_id'), body.get('sensor_id')),
                )
                new_id = cur.fetchone()[0]
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'id': new_id})}

        if method == 'PATCH':
            try:
                body = json.loads(event.get('body') or '{}')
            except json.JSONDecodeError:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Невалидный JSON'})}
            schema_err = validate(body, ACK_SCHEMA)
            if schema_err:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': schema_err})}
            user_id = (event.get('headers') or {}).get('X-User-Id') or (event.get('headers') or {}).get('x-user-id')
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE alerts SET acknowledged = true, acknowledged_by = %s WHERE id = %s",
                    (int(user_id) if user_id else None, body['id']),
                )
                cur.execute(
                    "INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (%s, 'ack_alert', 'alert', %s)",
                    (int(user_id) if user_id else None, str(body['id'])),
                )
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Метод не разрешён'})}
    finally:
        conn.close()
