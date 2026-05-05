import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SectionWrapper } from "./Charts";
import { USERS } from "./data";
import AutomationView from "./AutomationView";

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
type AdminTab = "users" | "gateway" | "storage" | "security" | "logs" | "spec" | "api" | "automation";

const SPEC_BLOCKS: {
  id: string; title: string; icon: string; color: string;
  items: { label: string; status: "ok" | "partial" | "todo"; note: string }[];
}[] = [
  {
    id: "gw", title: "Шлюз данных", icon: "Wifi", color: "#2563EB",
    items: [
      { label: "Приём по MQTT (IoT)", status: "ok", note: "Брокер MQTT v3.1.1 · 1 240 сообщ/мин" },
      { label: "Приём по REST API", status: "ok", note: "Эндпоинты /auth, /realtime, /alerts, /reports, /ai" },
      { label: "Приём по OPC UA", status: "ok", note: "Сервер OPC UA Binary, 64 точки опроса" },
      { label: "Modbus RTU/TCP", status: "ok", note: "Шлюз ОВЕН, 142 точки, опрос 1 сек" },
      { label: "Нормализация JSON / XML‑схем", status: "ok", note: "JSON Schema на всех точках входа" },
      { label: "Буферизация при потере связи", status: "ok", note: "Локальный буфер шлюза 24 ч + ретрансляция" },
      { label: "Автономный сбор (cron)", status: "ok", note: "7 задач: опрос, аномалии, алерты, отчёты — без участия оператора" },
    ],
  },
  {
    id: "storage", title: "Единое хранилище", icon: "Database", color: "#10B981",
    items: [
      { label: "Data Lake — сырые данные (MinIO/Hadoop)", status: "ok", note: "MinIO S3‑совместимое, бакет files/" },
      { label: "Аналитическая БД (TimescaleDB)", status: "ok", note: "PostgreSQL + временные ряды readings" },
      { label: "Хранение в Parquet", status: "partial", note: "Колоночный архив > 30 дней — запуск Q3 2026" },
      { label: "Архив отчётов в S3", status: "ok", note: "PDF / CSV в bucket files/reports/" },
    ],
  },
  {
    id: "ai", title: "ИИ‑ядро", icon: "Brain", color: "#a78bfa",
    items: [
      { label: "Прогноз урожайности", status: "ok", note: "Линейная регрессия, точность 94%" },
      { label: "Анализ прочности (ЛСТ)", status: "ok", note: "Модель v0.8, тестовая эксплуатация" },
      { label: "Детектор аномалий", status: "ok", note: "Z‑score, порог 2.0σ, авто‑алерты" },
      { label: "Библиотека моделей с версионностью", status: "ok", note: "5 моделей, версии v0.8–v2.1" },
      { label: "A/B‑тестирование алгоритмов", status: "ok", note: "UI + бекенд: сравнение моделей по точности" },
    ],
  },
  {
    id: "dash", title: "Аналитика и дашборды", icon: "BarChart3", color: "#F59E0B",
    items: [
      { label: "Унифицированные шаблоны отчётов", status: "ok", note: "Конструктор: проект + период + метрики" },
      { label: "Дашборд для инженера", status: "ok", note: "Ферма: датчики, аномалии, рекомендации" },
      { label: "Дашборд для менеджера", status: "ok", note: "Аналитика: отчёты, KPI, архив" },
      { label: "Дашборд для инвестора", status: "ok", note: "Главная панель: портфель, KPI, алерты" },
    ],
  },
  {
    id: "api", title: "API‑шлюз", icon: "Plug", color: "#3b82f6",
    items: [
      { label: "Единый интерфейс для ERP / CRM", status: "ok", note: "Реестр клиентов: 1С, Битрикс24, Power BI" },
      { label: "Авторизация JWT", status: "ok", note: "HS256, срок жизни 7 дней" },
      { label: "OAuth 2.0 (client_credentials)", status: "ok", note: "POST /auth?action=token, scope read/write" },
    ],
  },
  {
    id: "sec", title: "Безопасность и стандарты", icon: "ShieldCheck", color: "#059669",
    items: [
      { label: "TLS 1.3 на всех каналах", status: "ok", note: "HTTPS на функциях и CDN" },
      { label: "RBAC — 4 роли", status: "ok", note: "admin · engineer · manager · investor" },
      { label: "Хеширование паролей PBKDF2", status: "ok", note: "100 000 итераций, SHA‑256" },
      { label: "Журнал действий (audit log)", status: "ok", note: "Таблица audit_log в PostgreSQL" },
      { label: "JSON Schema валидация запросов", status: "ok", note: "На auth, alerts, reports — типы, enum, обяз. поля" },
    ],
  },
];

export function AdminView() {
  const [tab, setTab] = useState<AdminTab>("spec");

  const eventLogs = [
    { time: "05.05 14:38", level: "info", msg: "Администратор вошёл в систему" },
    { time: "05.05 14:15", level: "warning", msg: "Датчик CO-02 (Vaisala) не отвечает по Modbus более 10 минут" },
    { time: "05.05 13:50", level: "info", msg: "Обновлён шлюз данных: брокер MQTT v3.1.1" },
    { time: "05.05 12:00", level: "info", msg: "Запущено обучение модели «Прогноз урожая» v1.3" },
    { time: "04.05 23:41", level: "success", msg: "Обучение завершено успешно. Точность 94.2%" },
    { time: "04.05 20:00", level: "error", msg: "Ошибка экспорта: таймаут подключения к ERP 1С" },
  ];

  return (
    <SectionWrapper title="Администрирование" subtitle="Архитектура · Пользователи · Шлюз · Хранилище · Безопасность · Журнал">
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["spec", "automation", "users", "gateway", "storage", "api", "security", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={tab === t ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
          >
            {t === "spec" ? "Архитектура (ТЗ)"
              : t === "automation" ? "Автоматизация"
              : t === "users" ? "Пользователи"
              : t === "gateway" ? "Шлюз данных"
              : t === "storage" ? "Хранилище"
              : t === "api" ? "API‑шлюз"
              : t === "security" ? "Безопасность"
              : "Журнал событий"}
          </button>
        ))}
      </div>

      {tab === "spec" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #2563EB11, #10B98111)", border: "1px solid #2563EB33" }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Соответствие техническому заданию</div>
                <div className="text-xs text-[var(--clr-muted)] mt-1">Полная карта архитектуры: 6 разделов, 31 пункт</div>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="badge-online px-2 py-1 rounded-full">Готово · 30</span>
                <span className="badge-warning px-2 py-1 rounded-full">В процессе · 1</span>
                <span className="badge-info px-2 py-1 rounded-full">Запланировано · 0</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SPEC_BLOCKS.map((b) => (
              <div key={b.id} className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: b.color + "22" }}>
                    <Icon name={b.icon} size={15} style={{ color: b.color }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{b.title}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {b.items.map((it, i) => {
                    const cfg = it.status === "ok"
                      ? { icon: "CheckCircle2", color: "#059669", bg: "#05966911", label: "Готово" }
                      : it.status === "partial"
                      ? { icon: "Clock", color: "#D97706", bg: "#D9770611", label: "В процессе" }
                      : { icon: "Circle", color: "#3b82f6", bg: "#3b82f611", label: "План" };
                    return (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: cfg.bg }}>
                        <Icon name={cfg.icon} size={13} style={{ color: cfg.color, marginTop: 2 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-medium">{it.label}</span>
                            <span className="text-[9px] px-1.5 py-0 rounded-full shrink-0" style={{ background: cfg.color + "22", color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--clr-muted)] leading-snug">{it.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
            <span className="text-sm font-semibold mb-3 block" style={{ fontFamily: "Montserrat, sans-serif" }}>Ключевые стандарты</span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              {[
                { k: "MQTT", v: "IoT‑протокол", color: "#10B981" },
                { k: "REST API", v: "бизнес‑логика", color: "#2563EB" },
                { k: "OPC UA", v: "промышленный SCADA", color: "#a78bfa" },
                { k: "JSON Schema", v: "валидация", color: "#F59E0B" },
                { k: "Parquet", v: "архив (план)", color: "#3b82f6" },
                { k: "TLS 1.3", v: "транспорт", color: "#059669" },
                { k: "RBAC", v: "ролевая модель", color: "#D97706" },
                { k: "JWT / OAuth 2.0", v: "авторизация", color: "#a78bfa" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg p-2.5" style={{ background: "var(--clr-surface2)" }}>
                  <div className="mono text-xs font-semibold" style={{ color: s.color }}>{s.k}</div>
                  <div className="text-[10px] text-[var(--clr-muted)] mt-0.5">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "storage" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { name: "PostgreSQL · временные ряды", role: "Аналитическая БД (TimescaleDB‑совместимо)", status: "ok", details: "Таблицы: readings, alerts, ai_insights, audit_log. Индексы по времени.", icon: "Database", color: "#2563EB" },
            { name: "MinIO / S3 · архив", role: "Озеро данных (Data Lake)", status: "ok", details: "Бакет files/ для отчётов, изображений, экспортов. CDN раздача.", icon: "HardDrive", color: "#10B981" },
            { name: "Parquet (запланировано)", role: "Долгосрочное хранение сырых данных", status: "todo", details: "Колоночный формат для архивов > 30 дней. Запуск Q3 2026.", icon: "Archive", color: "#a78bfa" },
            { name: "Hot / Cold tiers", role: "Многоуровневое хранение", status: "partial", details: "Hot (БД, 30 дней) → Cold (S3, > 30 дней). Автоматическая миграция в работе.", icon: "Layers", color: "#F59E0B" },
          ].map((s) => (
            <div key={s.name} className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color + "22" }}>
                  <Icon name={s.icon} size={14} style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{s.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === "ok" ? "badge-online" : s.status === "partial" ? "badge-warning" : "badge-info"}`}>
                      {s.status === "ok" ? "В работе" : s.status === "partial" ? "Частично" : "План"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--clr-muted)] mt-0.5">{s.role}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--clr-muted)] leading-relaxed">{s.details}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { name: "Шифрование транспорта", val: "TLS 1.3", icon: "Lock", color: "#059669", desc: "Все эндпоинты на HTTPS, сертификаты автообновляются." },
            { name: "Авторизация", val: "JWT (HS256) · 7 дн.", icon: "Key", color: "#2563EB", desc: "Подписанные токены. OAuth 2.0 client_credentials для внешних систем." },
            { name: "Хеширование паролей", val: "PBKDF2 · 100 000 итер.", icon: "Fingerprint", color: "#a78bfa", desc: "Соль 16 байт, SHA‑256. Brute‑force защита." },
            { name: "Ролевая модель (RBAC)", val: "4 роли · 6 разделов", icon: "Users", color: "#10B981", desc: "admin / engineer / manager / investor с матрицей доступа." },
            { name: "Журнал действий", val: "audit_log", icon: "ScrollText", color: "#F59E0B", desc: "Логин, подтверждение алертов, изменения сущностей с IP." },
            { name: "Валидация запросов", val: "JSON Schema · активна", icon: "ShieldAlert", color: "#3b82f6", desc: "Проверка типов, enum, обязательных полей на auth, alerts, reports." },
          ].map((s) => (
            <div key={s.name} className="rounded-xl p-4 flex items-start gap-3" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "22" }}>
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[var(--clr-muted)] mb-0.5">{s.name}</div>
                <div className="mono text-sm font-semibold" style={{ color: "var(--clr-heading)" }}>{s.val}</div>
                <p className="text-[11px] text-[var(--clr-muted)] mt-1 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "automation" && <AutomationView />}

      {tab === "api" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Реестр OAuth 2.0 клиентов</span>
              <button className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "#2563EB", color: "#fff" }}>
                <Icon name="Plus" size={12} /> Зарегистрировать клиент
              </button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--clr-border)" }}>
                  {["Система", "client_id", "Scopes", "Последний вызов", "Статус"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[var(--clr-muted)] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "1С ERP — продакшен", id: "erp-1c-prod",  scopes: "read · write", last: "2 мин назад", status: "active" },
                  { name: "Битрикс24 CRM",      id: "crm-bitrix24", scopes: "read",         last: "18 мин назад", status: "active" },
                  { name: "Power BI коннектор", id: "analytics-bi", scopes: "read",         last: "1 ч назад",    status: "active" },
                ].map((c) => (
                  <tr key={c.id} className="border-b" style={{ borderColor: "var(--clr-border)" }}>
                    <td className="px-3 py-2.5 font-medium">{c.name}</td>
                    <td className="px-3 py-2.5 mono text-[var(--clr-muted)]">{c.id}</td>
                    <td className="px-3 py-2.5">
                      {c.scopes.split(" · ").map((s, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full mr-1 badge-info">{s}</span>
                      ))}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--clr-muted)]">{c.last}</td>
                    <td className="px-3 py-2.5">
                      <span className="badge-online text-[10px] px-2 py-0.5 rounded-full">🟢 Активен</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Code" size={14} style={{ color: "#2563EB" }} />
                <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Получение токена (OAuth 2.0)</span>
              </div>
              <pre className="mono text-[11px] p-3 rounded-lg overflow-x-auto leading-relaxed" style={{ background: "var(--clr-surface2)", color: "var(--clr-text)" }}>
{`POST /auth?action=token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "erp-1c-prod",
  "client_secret": "***",
  "scope": "read"
}

→ 200 OK
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read"
}`}
              </pre>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="ShieldCheck" size={14} style={{ color: "#059669" }} />
                <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>JSON Schema валидация запросов</span>
              </div>
              <pre className="mono text-[11px] p-3 rounded-lg overflow-x-auto leading-relaxed" style={{ background: "var(--clr-surface2)", color: "var(--clr-text)" }}>
{`{
  "type": "object",
  "required": ["level", "message"],
  "properties": {
    "level":   { "enum": ["info", "warning",
                          "error", "success"] },
    "message": { "type": "string",
                 "minLength": 1,
                 "maxLength": 1000 },
    "project_id": { "type": "string" }
  },
  "additionalProperties": false
}`}
              </pre>
              <p className="text-[10px] text-[var(--clr-muted)] mt-2">
                Применяется ко всем POST/PATCH запросам. Возвращает 400 с описанием поля при ошибке.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: "var(--clr-border)" }}>
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Пользователи системы</span>
            <button className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "#2563EB", color: "#fff" }}>
              <Icon name="Plus" size={12} /> Добавить
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--clr-border)" }}>
                {["Пользователь", "Роль", "Статус", "Активность", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[var(--clr-muted)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {USERS.map((u, i) => (
                <tr key={i} className="border-b hover:bg-[var(--clr-surface2)] transition-colors" style={{ borderColor: "var(--clr-border)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#2563EB22" }}>
                        <Icon name="User" size={12} style={{ color: "#2563EB" }} />
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--clr-muted)]">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${u.status === "online" ? "badge-online" : "badge-offline"}`}>
                      {u.status === "online" ? "🟢 Онлайн" : "🔴 Оффлайн"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--clr-muted)]">{u.last}</td>
                  <td className="px-4 py-3">
                    <button className="text-[var(--clr-muted)] hover:text-[var(--clr-blue)] transition-colors">
                      <Icon name="MoreHorizontal" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "gateway" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { name: "Брокер MQTT", status: "online", host: "192.168.1.10:1883", proto: "MQTT v3.1.1", msgs: "1 240/мин" },
            { name: "Шлюз Modbus (ОВЕН)", status: "online", host: "192.168.1.20:502", proto: "Modbus TCP/RTU", msgs: "142 тч. · 1 сек" },
            { name: "Сервер OPC UA", status: "online", host: "192.168.1.30:4840", proto: "OPC UA Binary", msgs: "64 тч. · 5 сек" },
            { name: "Интеграция с 1С", status: "warning", host: "192.168.1.50:8080", proto: "REST + OAuth2", msgs: "Таймауты" },
          ].map((gw) => (
            <div key={gw.name} className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: `1px solid ${gw.status === "warning" ? "#D9770644" : "var(--clr-border)"}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{gw.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${gw.status === "online" ? "badge-online" : "badge-warning"}`}>
                  {gw.status === "online" ? "🟢 Онлайн" : "🟡 Предупреждение"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-[var(--clr-muted)]">
                <div className="flex gap-2"><span className="w-20 shrink-0">Хост:</span><span className="mono">{gw.host}</span></div>
                <div className="flex gap-2"><span className="w-20 shrink-0">Протокол:</span><span>{gw.proto}</span></div>
                <div className="flex gap-2"><span className="w-20 shrink-0">Нагрузка:</span><span className="mono">{gw.msgs}</span></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 text-xs py-1.5 rounded-lg" style={{ background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}>Настроить</button>
                <button className="flex-1 text-xs py-1.5 rounded-lg" style={{ background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}>Тест связи</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--clr-border)" }}>
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Системный журнал</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--clr-border)" }}>
            {eventLogs.map((l, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-[var(--clr-surface2)] transition-colors">
                <span className="mono text-[10px] text-[var(--clr-muted)] shrink-0 mt-0.5 w-32">{l.time}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${l.level === "error" ? "badge-offline" : l.level === "warning" ? "badge-warning" : l.level === "success" ? "badge-online" : "badge-info"}`}>
                  {l.level === "error" ? "ОШИБКА" : l.level === "warning" ? "ВНИМАНИЕ" : l.level === "success" ? "УСПЕХ" : "ИНФО"}
                </span>
                <p className="text-xs">{l.msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}