-- Автоматизация: реестр периодических задач + история запусков

CREATE TABLE automation_jobs (
  id SERIAL PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  interval_seconds INT NOT NULL DEFAULT 60,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_status VARCHAR(32),
  last_message TEXT,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_runs BIGINT NOT NULL DEFAULT 0,
  total_failures BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_automation_jobs_next ON automation_jobs(next_run_at) WHERE is_enabled;

CREATE TABLE automation_runs (
  id BIGSERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES automation_jobs(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'running',
  message TEXT,
  records_processed INT,
  duration_ms INT
);
CREATE INDEX idx_automation_runs_job ON automation_runs(job_id, started_at DESC);

INSERT INTO automation_jobs (code, name, description, interval_seconds) VALUES
('poll_sensors',     'Опрос датчиков',           'Считывание показаний всех датчиков, запись в БД (Modbus/MQTT/OPC UA)', 30),
('detect_anomalies', 'Детектор аномалий',        'Анализ показаний за 1ч, авто-создание алертов при отклонениях',          120),
('check_offline',    'Проверка связи',           'Помечает датчик offline, если нет показаний > 10 минут',                  60),
('cleanup_readings', 'Очистка старых данных',    'Удаление показаний старше 30 дней (архив в Parquet)',                   3600),
('daily_report',     'Ежедневный отчёт',         'Авто-формирование PDF отчёта по ферме раз в сутки',                    86400),
('weekly_report',    'Еженедельный отчёт',       'Сводный отчёт по всем активным проектам (понедельник)',                604800),
('retrain_models',   'Переобучение ИИ-моделей',  'Обновление моделей прогноза на свежих данных',                          21600);
