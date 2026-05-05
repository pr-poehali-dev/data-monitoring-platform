// ─── Types ────────────────────────────────────────────────────────────────────
export type Section = "dashboard" | "projects" | "farm" | "analytics" | "ai" | "admin";

// ─── All 8 portfolio projects ─────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: "farm",
    name: "Вертикальная ферма клубники",
    desc: "Пилот 500 м², ИИ-управление климатом, освещением и поливом. Оборудование ОВЕН.",
    status: "active",
    kpi: "118 кг/нед",
    sensors: 24,
    uptime: "99.7%",
    since: "Март 2024",
    protocol: "Modbus RTU / MQTT",
    priority: 1,
    tag: "Сколково",
  },
  {
    id: "lst",
    name: "Лигносульфонаты (ЛСТ)",
    desc: "Присадка к бетону +56% прочности. Опытная эксплуатация в Газпроме. Мониторинг реакторов.",
    status: "active",
    kpi: "4.2 т/сут",
    sensors: 18,
    uptime: "98.1%",
    since: "Янв 2024",
    protocol: "OPC UA / Modbus TCP",
    priority: 2,
    tag: "Газпром",
  },
  {
    id: "pipeforge",
    name: "PipeForge — 3D-печать трубопроводов",
    desc: "Мобильная 3D-печать композитных трубопроводов. Industrix Газпромнефть finalist.",
    status: "active",
    kpi: "12 м/смену",
    sensors: 15,
    uptime: "96.4%",
    since: "Сен 2024",
    protocol: "REST API / CAN Bus",
    priority: 3,
    tag: "Газпромнефть",
  },
  {
    id: "lignin",
    name: "Переработка лигнина в сорбенты",
    desc: "Производство высокоэффективных сорбентов из лигнина. Контроль реакций и выхода продукта.",
    status: "testing",
    kpi: "1.8 т/сут",
    sensors: 12,
    uptime: "94.2%",
    since: "Фев 2025",
    protocol: "Modbus TCP",
    priority: 4,
    tag: "R&D",
  },
  {
    id: "uzv",
    name: "УЗВ с ИИ-управлением",
    desc: "Установки замкнутого водоснабжения с ИИ-оптимизацией кормления и качества воды.",
    status: "testing",
    kpi: "2.1 т/цикл",
    sensors: 20,
    uptime: "95.8%",
    since: "Апр 2025",
    protocol: "MQTT / HTTP",
    priority: 5,
    tag: "Сколково",
  },
  {
    id: "gashub",
    name: "Газовый хаб",
    desc: "Мониторинг давления, расхода и состава газа. Интеграция с диспетчерскими SCADA.",
    status: "planned",
    kpi: "—",
    sensors: 0,
    uptime: "—",
    since: "Q3 2025",
    protocol: "OPC UA / Modbus",
    priority: 6,
    tag: "Газпром",
  },
  {
    id: "decarb",
    name: "Декарбонизация",
    desc: "Мониторинг углеродного следа по портфелю проектов. Автоотчётность ESG.",
    status: "planned",
    kpi: "—",
    sensors: 0,
    uptime: "—",
    since: "Q4 2025",
    protocol: "REST API",
    priority: 7,
    tag: "ESG",
  },
  {
    id: "concrete",
    name: "Испытания бетонных смесей",
    desc: "Прочностные характеристики ЛСТ-присадки. Мониторинг температуры отверждения.",
    status: "testing",
    kpi: "42 МПа",
    sensors: 12,
    uptime: "95.3%",
    since: "Май 2024",
    protocol: "Modbus RTU",
    priority: 8,
    tag: "Лаборатория",
  },
];

// ─── Farm sensors (ОВЕН equipment) ───────────────────────────────────────────
export const SENSORS = [
  { id: "T-01", name: "Температура A", val: "22.4°C", status: "online", norm: "22–24°C", device: "ОВЕН ТРМ138" },
  { id: "T-02", name: "Температура B", val: "23.8°C", status: "online", norm: "22–24°C", device: "ОВЕН ТРМ138" },
  { id: "H-01", name: "Влажность A", val: "65%", status: "online", norm: "60–70%", device: "ОВЕН ТВ4" },
  { id: "H-02", name: "Влажность B", val: "74%", status: "warning", norm: "60–70%", device: "ОВЕН ТВ4" },
  { id: "CO-01", name: "CO₂ A", val: "920 ppm", status: "online", norm: "800–1000", device: "Vaisala GMT222" },
  { id: "CO-02", name: "CO₂ B", val: "—", status: "offline", norm: "800–1000", device: "Vaisala GMT222" },
  { id: "L-01", name: "Освещение A", val: "18 000 lx", status: "online", norm: ">15 000", device: "ОВЕН МК110" },
  { id: "L-02", name: "Освещение B", val: "16 500 lx", status: "online", norm: ">15 000", device: "ОВЕН МК110" },
];

// ─── Protocols & integrations ─────────────────────────────────────────────────
export const PROTOCOLS = [
  {
    name: "Modbus RTU/TCP",
    status: "online",
    devices: "ОВЕН ТРМ138, ТВ4, МК110",
    desc: "Основной протокол опроса датчиков. Ферма, ЛСТ, бетон.",
    latency: "120 мс",
    points: 142,
  },
  {
    name: "OPC UA",
    status: "online",
    devices: "SCADA Wonderware, ПЛК Siemens",
    desc: "Интеграция с промышленными SCADA Газпрома. ЛСТ, газовый хаб.",
    latency: "85 мс",
    points: 64,
  },
  {
    name: "MQTT Broker",
    status: "online",
    devices: "ESP32, Raspberry Pi, облачные агенты",
    desc: "IoT-шина для лёгких устройств и облачной передачи данных.",
    latency: "42 мс",
    points: 88,
  },
  {
    name: "REST API Gateway",
    status: "warning",
    devices: "ERP 1С, CRM, сторонние системы",
    desc: "Интеграция с корпоративными системами. Периодические таймауты.",
    latency: "340 мс",
    points: 12,
  },
];

// ─── Pilot KPIs ───────────────────────────────────────────────────────────────
export const PILOT_KPIS = [
  {
    metric: "Время сбора отчётов",
    before: "2 ч / день",
    after: "15 мин / день",
    target: "−87%",
    status: "target",
    progress: 72,
  },
  {
    metric: "Задержка данных с датчиков",
    before: "до 30 мин",
    after: "≤ 5 сек",
    target: "real-time",
    status: "done",
    progress: 100,
  },
  {
    metric: "Покрытие датчиков мониторингом",
    before: "38%",
    after: "92%",
    target: "+54 п.п.",
    status: "done",
    progress: 95,
  },
  {
    metric: "Точность прогноза урожайности",
    before: "ручная оценка",
    after: "94% (ИИ)",
    target: "> 90%",
    status: "done",
    progress: 94,
  },
  {
    metric: "Время реакции на аварию",
    before: "45–90 мин",
    after: "< 3 мин (алерт)",
    target: "−95%",
    status: "target",
    progress: 68,
  },
];

// ─── Pilot timeline ───────────────────────────────────────────────────────────
export const PILOT_TIMELINE = [
  { week: "Нед. 1", title: "Аудит и подключение", desc: "Инвентаризация ОВЕН-оборудования, подключение Modbus-шлюза, первые данные в платформе.", done: true },
  { week: "Нед. 2", title: "ИИ-ядро и алерты", desc: "Запуск моделей прогноза урожая и детектора аномалий. Настройка push-уведомлений.", done: true },
  { week: "Нед. 3", title: "Отчётность и KPI", desc: "Автоматические ежедневные отчёты. Замер времени: было 2 ч → стало 15 мин.", done: false },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const ALERTS = [
  { id: 1, level: "warning", msg: "Влажность в секции B выше нормы: 74% (норма 60–70%)", time: "2 мин назад", project: "Ферма" },
  { id: 2, level: "error", msg: "Датчик CO₂ #7 (Vaisala) не отвечает по Modbus", time: "8 мин назад", project: "Ферма" },
  { id: 3, level: "info", msg: "Обновление модели ИИ Yield Predictor v1.3 завершено", time: "1 ч назад", project: "Платформа" },
  { id: 4, level: "success", msg: "Урожай секции A достиг прогнозного уровня — 118 кг", time: "3 ч назад", project: "Ферма" },
  { id: 5, level: "warning", msg: "OPC UA: давление в реакторе Р-02 приближается к верхней границе", time: "5 ч назад", project: "ЛСТ" },
];

// ─── AI models ────────────────────────────────────────────────────────────────
export const AI_MODELS = [
  { name: "Прогноз урожая", ver: "v1.3", acc: 94, date: "28.04.2026", status: "active", runs: 1284, project: "Ферма" },
  { name: "Детектор аномалий", ver: "v2.1", acc: 97, date: "15.04.2026", status: "active", runs: 8920, project: "Все проекты" },
  { name: "Оптимизатор климата", ver: "v1.2", acc: 89, date: "03.03.2026", status: "testing", runs: 342, project: "Ферма" },
  { name: "Прогноз качества ЛСТ", ver: "v0.8", acc: 86, date: "10.04.2026", status: "testing", runs: 128, project: "ЛСТ" },
  { name: "Прогноз энергопотребления", ver: "v0.9", acc: 82, date: "10.02.2026", status: "deprecated", runs: 210, project: "Ферма" },
];

// ─── AI recommendations ───────────────────────────────────────────────────────
export const AI_RECOMMENDATIONS = [
  { icon: "Zap", color: "#F59E0B", text: "Увеличить освещённость в секции B на 15% — прогноз +8% урожая" },
  { icon: "Droplets", color: "#3b82f6", text: "Снизить полив в секции A на 10% до нормализации влажности" },
  { icon: "Thermometer", color: "#10B981", text: "Температура оптимальна, отклонений не обнаружено" },
  { icon: "Wind", color: "#a78bfa", text: "Усилить вентиляцию: CO₂ в норме, но прогноз роста через 4 ч" },
];

// ─── Reports ──────────────────────────────────────────────────────────────────
export const REPORTS = [
  { name: "Еженедельный отчёт — ферма", date: "29.04.2026", type: "weekly", size: "1.2 МБ", auto: true },
  { name: "Ежедневный мониторинг", date: "05.05.2026", type: "daily", size: "340 КБ", auto: true },
  { name: "Сводка по ЛСТ — реакторы", date: "01.05.2026", type: "monthly", size: "2.8 МБ", auto: false },
  { name: "Энергопотребление — апрель", date: "30.04.2026", type: "monthly", size: "1.9 МБ", auto: true },
  { name: "KPI пилота — неделя 2", date: "04.05.2026", type: "weekly", size: "560 КБ", auto: true },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const USERS = [
  { name: "Инженер фермы", role: "Инженер (ферма)", status: "online", last: "сейчас" },
  { name: "Менеджер проектов", role: "Менеджер проектов", status: "online", last: "3 мин назад" },
  { name: "Наблюдатель", role: "Инвестор / Наблюдатель", status: "offline", last: "вчера" },
  { name: "Администратор", role: "Администратор", status: "online", last: "сейчас" },
];