-- OAuth 2.0 client_credentials: внешние системы (ERP, CRM)

CREATE TABLE oauth_clients (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(64) UNIQUE NOT NULL,
  client_secret_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  scopes VARCHAR(512) NOT NULL DEFAULT 'read',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);

-- Тестовые клиенты для демо: client_secret = "demo-secret-2026"
-- pbkdf2$100000$saltdemo1234567890abcdef$<hash>
INSERT INTO oauth_clients (client_id, client_secret_hash, name, scopes) VALUES
('erp-1c-prod',  'pbkdf2$100000$0123456789abcdef0123456789abcdef$placeholder', '1С ERP — продакшен', 'read write'),
('crm-bitrix24', 'pbkdf2$100000$0123456789abcdef0123456789abcdef$placeholder', 'Битрикс24 CRM',       'read'),
('analytics-bi', 'pbkdf2$100000$0123456789abcdef0123456789abcdef$placeholder', 'Power BI коннектор',  'read');
