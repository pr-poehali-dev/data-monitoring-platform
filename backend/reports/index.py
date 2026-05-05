import json
import os
import io
import csv
import time
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Content-Type': 'application/json',
}


def s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def render_pdf(title: str, lines: list[str]) -> bytes:
    """Минимальный валидный PDF без внешних зависимостей."""
    body = "BT /F1 16 Tf 50 780 Td (" + title + ") Tj ET\n"
    y = 750
    for ln in lines:
        safe = ln.replace('(', '\\(').replace(')', '\\)')
        body += f"BT /F1 11 Tf 50 {y} Td ({safe}) Tj ET\n"
        y -= 18
        if y < 50:
            break

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        ("<< /Length " + str(len(body)) + " >>\nstream\n" + body + "endstream").encode(),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    out = io.BytesIO()
    out.write(b"%PDF-1.4\n")
    offsets = []
    for i, obj in enumerate(objects, start=1):
        offsets.append(out.tell())
        out.write(f"{i} 0 obj\n".encode())
        out.write(obj)
        out.write(b"\nendobj\n")
    xref_pos = out.tell()
    out.write(f"xref\n0 {len(objects)+1}\n".encode())
    out.write(b"0000000000 65535 f \n")
    for off in offsets:
        out.write(f"{off:010d} 00000 n \n".encode())
    out.write(f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF".encode())
    return out.getvalue()


def render_csv(headers: list[str], rows: list[list]) -> bytes:
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=';')
    w.writerow(headers)
    w.writerows(rows)
    return buf.getvalue().encode('utf-8-sig')


def handler(event: dict, context) -> dict:
    """Генерация отчётов в PDF/CSV и сохранение в S3."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, title, format, period, url, size_bytes, status, created_at, project_id "
                    "FROM reports ORDER BY created_at DESC LIMIT 50"
                )
                rows = cur.fetchall()
            items = [{
                'id': r['id'],
                'title': r['title'],
                'format': r['format'],
                'period': r['period'],
                'url': r['url'],
                'size_bytes': r['size_bytes'],
                'status': r['status'],
                'project_id': r['project_id'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
            } for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'items': items})}

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            project_id = body.get('project_id', 'farm')
            fmt = body.get('format', 'pdf')
            period = body.get('period', '24h')
            user_id = (event.get('headers') or {}).get('X-User-Id') or (event.get('headers') or {}).get('x-user-id')

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT name FROM projects WHERE id = %s", (project_id,))
                proj = cur.fetchone()
                cur.execute(
                    "SELECT s.id, s.name, s.unit, ROUND(AVG(r.value)::numeric, 2) AS avg_v, "
                    "MIN(r.value) AS min_v, MAX(r.value) AS max_v, COUNT(r.id) AS cnt "
                    "FROM sensors s LEFT JOIN readings r ON r.sensor_id = s.id "
                    "WHERE s.project_id = %s GROUP BY s.id, s.name, s.unit ORDER BY s.id",
                    (project_id,),
                )
                stats = cur.fetchall()

            project_name = proj['name'] if proj else project_id
            title = f"Отчёт по проекту: {project_name} (период {period})"

            if fmt == 'csv':
                headers = ['Датчик', 'Имя', 'Ед.изм.', 'Среднее', 'Мин', 'Макс', 'Замеров']
                rows = [[s['id'], s['name'], s['unit'] or '', float(s['avg_v'] or 0), float(s['min_v'] or 0), float(s['max_v'] or 0), int(s['cnt'])] for s in stats]
                content = render_csv(headers, rows)
                content_type = 'text/csv'
                ext = 'csv'
            else:
                lines = [f"Период: {period}", "", "Сводка по датчикам:"]
                for s in stats:
                    lines.append(f"  {s['id']} {s['name']}: avg={float(s['avg_v'] or 0)} {s['unit'] or ''} (мин {float(s['min_v'] or 0)}, макс {float(s['max_v'] or 0)}, замеров {int(s['cnt'])})")
                content = render_pdf(title, lines)
                content_type = 'application/pdf'
                ext = 'pdf'

            key = f'reports/{project_id}_{int(time.time())}.{ext}'
            s3 = s3_client()
            s3.put_object(Bucket='files', Key=key, Body=content, ContentType=content_type)
            url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO reports (user_id, project_id, title, format, period, url, size_bytes, status) "
                    "VALUES (%s,%s,%s,%s,%s,%s,%s,'ready') RETURNING id",
                    (int(user_id) if user_id else None, project_id, title, fmt, period, url, len(content)),
                )
                rid = cur.fetchone()[0]

            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({
                'id': rid, 'url': url, 'format': fmt, 'size_bytes': len(content),
            })}

        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        conn.close()
