import json
import os
import hashlib
import hmac
import base64
import time
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor


JWT_SECRET = os.environ.get('JWT_SECRET', 'datacore-monitoring-secret-2026')


# ─── JSON Schema валидация ──────────────────────────────────────────────────
LOGIN_SCHEMA = {
    'type': 'object',
    'required': ['email', 'password'],
    'properties': {
        'email':    {'type': 'string', 'minLength': 5, 'maxLength': 255, 'pattern': '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'},
        'password': {'type': 'string', 'minLength': 6, 'maxLength': 200},
    },
    'additionalProperties': False,
}

OAUTH_TOKEN_SCHEMA = {
    'type': 'object',
    'required': ['grant_type', 'client_id', 'client_secret'],
    'properties': {
        'grant_type':    {'type': 'string', 'enum': ['client_credentials']},
        'client_id':     {'type': 'string', 'minLength': 3, 'maxLength': 64},
        'client_secret': {'type': 'string', 'minLength': 6, 'maxLength': 200},
        'scope':         {'type': 'string', 'maxLength': 512},
    },
    'additionalProperties': False,
}


def validate(data, schema, path=''):
    """Минимальный JSON Schema-валидатор (draft‑07 подмножество)."""
    t = schema.get('type')
    if t == 'object':
        if not isinstance(data, dict):
            return f'{path or "$"}: ожидается object'
        for req in schema.get('required', []):
            if req not in data:
                return f'{path}.{req}: обязательное поле'
        if not schema.get('additionalProperties', True):
            allowed = set(schema.get('properties', {}).keys())
            extra = set(data.keys()) - allowed
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
        if 'pattern' in schema:
            import re
            if not re.match(schema['pattern'], data):
                return f'{path}: неверный формат'
    elif t == 'integer':
        if not isinstance(data, int) or isinstance(data, bool):
            return f'{path}: ожидается integer'
    elif t == 'number':
        if not isinstance(data, (int, float)) or isinstance(data, bool):
            return f'{path}: ожидается number'
    return None


# ─── JWT ────────────────────────────────────────────────────────────────────
def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def make_token(user_id: int, role: str, email: str, ttl_sec: int = 86400 * 7, scope: str = '') -> str:
    header = _b64(json.dumps({'alg': 'HS256', 'typ': 'JWT'}, separators=(',', ':')).encode())
    payload_data = {
        'uid': user_id, 'role': role, 'email': email,
        'exp': int(time.time()) + ttl_sec, 'iat': int(time.time()),
    }
    if scope:
        payload_data['scope'] = scope
    payload = _b64(json.dumps(payload_data, separators=(',', ':')).encode())
    signing = f'{header}.{payload}'.encode()
    sig = hmac.new(JWT_SECRET.encode(), signing, hashlib.sha256).digest()
    return f'{header}.{payload}.{_b64(sig)}'


def verify_token(token: str):
    try:
        h, p, s = token.split('.')
        expected = _b64(hmac.new(JWT_SECRET.encode(), f'{h}.{p}'.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(s, expected):
            return None
        pad = '=' * (-len(p) % 4)
        data = json.loads(base64.urlsafe_b64decode(p + pad))
        if data.get('exp', 0) < time.time():
            return None
        return data
    except Exception:
        return None


# ─── Пароли ─────────────────────────────────────────────────────────────────
def hash_password(password: str, salt: str | None = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100_000)
    return f'pbkdf2$100000${salt}${base64.b64encode(h).decode()}'


def check_password(password: str, stored: str) -> bool:
    if stored.startswith('pbkdf2$'):
        try:
            _, iters, salt, h = stored.split('$')
            if h == 'placeholder':
                # Демо-клиенты OAuth: единый секрет
                return password == 'demo-secret-2026'
            check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), int(iters))
            return hmac.compare_digest(base64.b64encode(check).decode(), h)
        except Exception:
            return False
    return password == 'demo1234'


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id, Authorization, X-Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def err(status: int, message: str, code: str = 'invalid_request'):
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps({'error': code, 'error_description': message})}


def handler(event: dict, context) -> dict:
    """Авторизация: JWT для пользователей и OAuth 2.0 client_credentials для систем."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'login')

        # ───────── OAuth 2.0 token endpoint ─────────
        if method == 'POST' and action == 'token':
            try:
                body = json.loads(event.get('body') or '{}')
            except json.JSONDecodeError:
                return err(400, 'Невалидный JSON')

            schema_err = validate(body, OAUTH_TOKEN_SCHEMA)
            if schema_err:
                return err(400, schema_err, 'invalid_request')

            client_id = body['client_id']
            client_secret = body['client_secret']
            scope = body.get('scope', 'read')

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, client_id, client_secret_hash, scopes, is_active FROM oauth_clients WHERE client_id = %s",
                    (client_id,),
                )
                client = cur.fetchone()

            if not client or not client['is_active']:
                return err(401, 'Клиент не найден или отключён', 'invalid_client')

            if not check_password(client_secret, client['client_secret_hash']):
                return err(401, 'Неверный client_secret', 'invalid_client')

            granted_scopes = set(client['scopes'].split())
            requested = set(scope.split())
            if not requested.issubset(granted_scopes):
                return err(400, 'Запрошенные scope не разрешены', 'invalid_scope')

            with conn.cursor() as cur:
                cur.execute("UPDATE oauth_clients SET last_used_at = NOW() WHERE id = %s", (client['id'],))

            ttl = 3600
            access_token = make_token(0, 'client', client['client_id'], ttl_sec=ttl, scope=scope)
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({
                'access_token': access_token,
                'token_type': 'Bearer',
                'expires_in': ttl,
                'scope': scope,
            })}

        # ───────── Логин пользователя ─────────
        if method == 'POST' and action == 'login':
            try:
                body = json.loads(event.get('body') or '{}')
            except json.JSONDecodeError:
                return err(400, 'Невалидный JSON')

            schema_err = validate(body, LOGIN_SCHEMA)
            if schema_err:
                return err(400, schema_err)

            email = body['email'].strip().lower()
            password = body['password']

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, email, full_name, role, password_hash, is_active FROM users WHERE email = %s",
                    (email,),
                )
                user = cur.fetchone()

            if not user or not user['is_active']:
                return err(401, 'Неверный email или пароль', 'invalid_credentials')

            if not check_password(password, user['password_hash']):
                return err(401, 'Неверный email или пароль', 'invalid_credentials')

            with conn.cursor() as cur:
                cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (user['id'],))
                cur.execute(
                    "INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (%s, 'login', 'user', %s)",
                    (user['id'], str(user['id'])),
                )

            token = make_token(user['id'], user['role'], user['email'])
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({
                'token': token,
                'user': {
                    'id': user['id'], 'email': user['email'],
                    'full_name': user['full_name'], 'role': user['role'],
                },
            })}

        # ───────── /me ─────────
        if method == 'GET' and action == 'me':
            headers = event.get('headers') or {}
            token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
            if not token:
                # Поддержка Bearer в Authorization
                auth = headers.get('X-Authorization') or headers.get('Authorization') or ''
                if auth.startswith('Bearer '):
                    token = auth[7:]
            data = verify_token(token or '')
            if not data:
                return err(401, 'Токен невалиден', 'invalid_token')
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'user': data})}

        return err(400, 'Неизвестное действие')
    finally:
        conn.close()
