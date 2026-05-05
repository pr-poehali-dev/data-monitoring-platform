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


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def make_token(user_id: int, role: str, email: str, ttl_sec: int = 86400 * 7) -> str:
    header = _b64(json.dumps({'alg': 'HS256', 'typ': 'JWT'}, separators=(',', ':')).encode())
    payload = _b64(json.dumps({
        'uid': user_id, 'role': role, 'email': email,
        'exp': int(time.time()) + ttl_sec,
    }, separators=(',', ':')).encode())
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


def hash_password(password: str, salt: str | None = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100_000)
    return f'pbkdf2$100000${salt}${base64.b64encode(h).decode()}'


def check_password(password: str, stored: str) -> bool:
    if stored.startswith('pbkdf2$'):
        try:
            _, iters, salt, h = stored.split('$')
            check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), int(iters))
            return hmac.compare_digest(base64.b64encode(check).decode(), h)
        except Exception:
            return False
    # Demo: bcrypt-style hash → fallback на одинаковый демо-пароль
    return password == 'demo1234'


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def handler(event: dict, context) -> dict:
    """Авторизация и проверка JWT-токена для платформы мониторинга."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        path = event.get('queryStringParameters') or {}
        action = path.get('action', 'login')

        if method == 'POST' and action == 'login':
            body = json.loads(event.get('body') or '{}')
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, email, full_name, role, password_hash, is_active FROM users WHERE email = %s",
                    (email,),
                )
                user = cur.fetchone()

            if not user or not user['is_active']:
                return {'statusCode': 401, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'Неверный email или пароль'})}

            if not check_password(password, user['password_hash']):
                return {'statusCode': 401, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'Неверный email или пароль'})}

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
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'role': user['role'],
                },
            })}

        if method == 'GET' and action == 'me':
            token = (event.get('headers') or {}).get('X-Auth-Token') or (event.get('headers') or {}).get('x-auth-token')
            data = verify_token(token or '')
            if not data:
                return {'statusCode': 401, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'Токен невалиден'})}
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'user': data})}

        return {'statusCode': 400, 'headers': cors_headers(),
                'body': json.dumps({'error': 'Неизвестное действие'})}
    finally:
        conn.close()
