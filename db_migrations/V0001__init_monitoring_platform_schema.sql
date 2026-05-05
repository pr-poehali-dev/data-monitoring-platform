-- Платформа мониторинга данных: базовая схема

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'investor',
  telegram_chat_id VARCHAR(64),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip VARCHAR(64)
);
CREATE INDEX idx_sessions_token ON sessions(token_hash);

CREATE TABLE projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  tag VARCHAR(64),
  protocol VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sensors (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(32),
  device VARCHAR(128),
  norm_min NUMERIC,
  norm_max NUMERIC,
  status VARCHAR(32) NOT NULL DEFAULT 'online',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sensors_project ON sensors(project_id);

CREATE TABLE readings (
  id BIGSERIAL PRIMARY KEY,
  sensor_id VARCHAR(64) NOT NULL REFERENCES sensors(id),
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value NUMERIC NOT NULL
);
CREATE INDEX idx_readings_sensor_ts ON readings(sensor_id, ts DESC);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(64) REFERENCES projects(id),
  sensor_id VARCHAR(64) REFERENCES sensors(id),
  level VARCHAR(16) NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_alerts_level ON alerts(level);

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  project_id VARCHAR(64) REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  format VARCHAR(16) NOT NULL DEFAULT 'pdf',
  period VARCHAR(32),
  url TEXT,
  size_bytes BIGINT,
  status VARCHAR(32) NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reports_user ON reports(user_id);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(64) NOT NULL,
  entity VARCHAR(64),
  entity_id VARCHAR(64),
  details JSONB,
  ip VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_user ON audit_log(user_id);

CREATE TABLE ai_insights (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(64) REFERENCES projects(id),
  kind VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  score NUMERIC,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_project ON ai_insights(project_id, created_at DESC);

INSERT INTO projects (id, name, description, status, tag, protocol) VALUES
('farm','Вертикальная ферма клубники','Пилот 500 м², ИИ-управление климатом, освещением и поливом.','active','Сколково','Modbus RTU / MQTT'),
('lst','Лигносульфонаты (ЛСТ)','Присадка к бетону +56% прочности. Опытная эксплуатация в Газпроме.','active','Газпром','OPC UA / Modbus TCP'),
('pipeforge','PipeForge — 3D-печать трубопроводов','Мобильная 3D-печать композитных трубопроводов.','active','Газпромнефть','REST API / CAN Bus'),
('lignin','Переработка лигнина в сорбенты','Производство высокоэффективных сорбентов из лигнина.','testing','R&D','Modbus TCP'),
('uzv','УЗВ с ИИ-управлением','Установки замкнутого водоснабжения с ИИ-оптимизацией.','testing','Сколково','MQTT / HTTP'),
('gashub','Газовый хаб','Мониторинг давления, расхода и состава газа.','planned','Газпром','OPC UA / Modbus'),
('decarb','Декарбонизация','Мониторинг углеродного следа по портфелю проектов.','planned','ESG','REST API'),
('concrete','Испытания бетонных смесей','Прочностные характеристики ЛСТ-присадки.','testing','Лаборатория','Modbus RTU');

INSERT INTO sensors (id, project_id, name, unit, device, norm_min, norm_max, status) VALUES
('T-01','farm','Температура A','°C','ОВЕН ТРМ138',22,24,'online'),
('T-02','farm','Температура B','°C','ОВЕН ТРМ138',22,24,'online'),
('H-01','farm','Влажность A','%','ОВЕН ТВ4',60,70,'online'),
('H-02','farm','Влажность B','%','ОВЕН ТВ4',60,70,'warning'),
('CO-01','farm','CO₂ A','ppm','Vaisala GMT222',800,1000,'online'),
('CO-02','farm','CO₂ B','ppm','Vaisala GMT222',800,1000,'offline'),
('L-01','farm','Освещение A','lx','ОВЕН МК110',15000,25000,'online'),
('L-02','farm','Освещение B','lx','ОВЕН МК110',15000,25000,'online');

INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@datacore.ru',    '$2b$10$wM9cAYQ7Y4d1zQkDhT6x8eXz1gCrPeM5uXG.A9/kl2bW0KzgEhW6e','Администратор Системы','admin'),
('engineer@datacore.ru', '$2b$10$wM9cAYQ7Y4d1zQkDhT6x8eXz1gCrPeM5uXG.A9/kl2bW0KzgEhW6e','Иван Инженеров','engineer'),
('manager@datacore.ru',  '$2b$10$wM9cAYQ7Y4d1zQkDhT6x8eXz1gCrPeM5uXG.A9/kl2bW0KzgEhW6e','Мария Менеджерова','manager'),
('investor@datacore.ru', '$2b$10$wM9cAYQ7Y4d1zQkDhT6x8eXz1gCrPeM5uXG.A9/kl2bW0KzgEhW6e','Пётр Инвесторов','investor');
