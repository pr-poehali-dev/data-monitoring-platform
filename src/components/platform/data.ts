// ─── Types ────────────────────────────────────────────────────────────────────
export type Section = "dashboard" | "projects" | "farm" | "analytics" | "ai" | "admin";

// ─── Demo data ────────────────────────────────────────────────────────────────
export const ALERTS = [
  { id: 1, level: "warning", msg: "Влажность в секции B выше нормы: 74%", time: "2 мин назад" },
  { id: 2, level: "error", msg: "Датчик CO₂ #7 не отвечает", time: "8 мин назад" },
  { id: 3, level: "info", msg: "Обновление модели ИИ v1.3 завершено", time: "1 ч назад" },
  { id: 4, level: "success", msg: "Урожай секции A достиг прогнозного уровня", time: "3 ч назад" },
];

export const SENSORS = [
  { id: "T-01", name: "Температура A", val: "22.4°C", status: "online", norm: "22–24°C" },
  { id: "T-02", name: "Температура B", val: "23.8°C", status: "online", norm: "22–24°C" },
  { id: "H-01", name: "Влажность A", val: "65%", status: "online", norm: "60–70%" },
  { id: "H-02", name: "Влажность B", val: "74%", status: "warning", norm: "60–70%" },
  { id: "CO-01", name: "CO₂ A", val: "920 ppm", status: "online", norm: "800–1000" },
  { id: "CO-02", name: "CO₂ B", val: "—", status: "offline", norm: "800–1000" },
  { id: "L-01", name: "Освещение A", val: "18 000 lx", status: "online", norm: ">15 000" },
  { id: "L-02", name: "Освещение B", val: "16 500 lx", status: "online", norm: ">15 000" },
];

export const PROJECTS = [
  {
    id: "farm",
    name: "Вертикальная ферма клубники",
    desc: "Многоуровневое выращивание с автоматизацией климата и освещения",
    status: "active",
    kpi: "118 кг/нед",
    sensors: 24,
    uptime: "99.7%",
    since: "Март 2024",
  },
  {
    id: "ligno",
    name: "Производство лигносульфонатов",
    desc: "Мониторинг реакторов, контроль качества и выход продукта",
    status: "active",
    kpi: "4.2 т/сут",
    sensors: 18,
    uptime: "98.1%",
    since: "Янв 2024",
  },
  {
    id: "concrete",
    name: "Испытания бетонных смесей",
    desc: "Прочностные характеристики, влажность, температура отверждения",
    status: "testing",
    kpi: "42 МПа",
    sensors: 12,
    uptime: "95.3%",
    since: "Май 2024",
  },
];

export const AI_MODELS = [
  { name: "Yield Predictor", ver: "v1.3", acc: 94, date: "28.04.2026", status: "active", runs: 1284 },
  { name: "Anomaly Detector", ver: "v2.1", acc: 97, date: "15.04.2026", status: "active", runs: 8920 },
  { name: "Climate Optimizer", ver: "v1.2", acc: 89, date: "03.03.2026", status: "testing", runs: 342 },
  { name: "Energy Forecast", ver: "v0.9", acc: 82, date: "10.02.2026", status: "deprecated", runs: 210 },
];

export const AI_RECOMMENDATIONS = [
  { icon: "Zap", color: "#F59E0B", text: "Увеличить освещённость в секции B на 15% — прогноз +8% урожая" },
  { icon: "Droplets", color: "#3b82f6", text: "Снизить полив в секции A на 10% до нормализации влажности" },
  { icon: "Thermometer", color: "#10B981", text: "Температура оптимальна, отклонений не обнаружено" },
  { icon: "Wind", color: "#a78bfa", text: "Усилить вентиляцию: CO₂ в норме, но прогноз роста через 4 ч" },
];

export const REPORTS = [
  { name: "Еженедельный отчёт — ферма", date: "29.04.2026", type: "weekly", size: "1.2 МБ" },
  { name: "Ежедневный мониторинг", date: "05.05.2026", type: "daily", size: "340 КБ" },
  { name: "Сводка по лигносульфонатам", date: "01.05.2026", type: "monthly", size: "2.8 МБ" },
  { name: "Энергопотребление — апрель", date: "30.04.2026", type: "monthly", size: "1.9 МБ" },
];

export const USERS = [
  { name: "Алексей Громов", role: "Инженер", status: "online", last: "сейчас" },
  { name: "Марина Козлова", role: "Менеджер", status: "online", last: "3 мин назад" },
  { name: "Дмитрий Орлов", role: "Инвестор", status: "offline", last: "вчера" },
  { name: "Светлана Ким", role: "Администратор", status: "online", last: "сейчас" },
];
