import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type Section = "dashboard" | "projects" | "farm" | "analytics" | "ai" | "admin";

// ─── Demo data ────────────────────────────────────────────────────────────────
const ALERTS = [
  { id: 1, level: "warning", msg: "Влажность в секции B выше нормы: 74%", time: "2 мин назад" },
  { id: 2, level: "error", msg: "Датчик CO₂ #7 не отвечает", time: "8 мин назад" },
  { id: 3, level: "info", msg: "Обновление модели ИИ v1.3 завершено", time: "1 ч назад" },
  { id: 4, level: "success", msg: "Урожай секции A достиг прогнозного уровня", time: "3 ч назад" },
];

const SENSORS = [
  { id: "T-01", name: "Температура A", val: "22.4°C", status: "online", norm: "22–24°C" },
  { id: "T-02", name: "Температура B", val: "23.8°C", status: "online", norm: "22–24°C" },
  { id: "H-01", name: "Влажность A", val: "65%", status: "online", norm: "60–70%" },
  { id: "H-02", name: "Влажность B", val: "74%", status: "warning", norm: "60–70%" },
  { id: "CO-01", name: "CO₂ A", val: "920 ppm", status: "online", norm: "800–1000" },
  { id: "CO-02", name: "CO₂ B", val: "—", status: "offline", norm: "800–1000" },
  { id: "L-01", name: "Освещение A", val: "18 000 lx", status: "online", norm: ">15 000" },
  { id: "L-02", name: "Освещение B", val: "16 500 lx", status: "online", norm: ">15 000" },
];

const PROJECTS = [
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

const AI_MODELS = [
  { name: "Yield Predictor", ver: "v1.3", acc: 94, date: "28.04.2026", status: "active", runs: 1284 },
  { name: "Anomaly Detector", ver: "v2.1", acc: 97, date: "15.04.2026", status: "active", runs: 8920 },
  { name: "Climate Optimizer", ver: "v1.2", acc: 89, date: "03.03.2026", status: "testing", runs: 342 },
  { name: "Energy Forecast", ver: "v0.9", acc: 82, date: "10.02.2026", status: "deprecated", runs: 210 },
];

const AI_RECOMMENDATIONS = [
  { icon: "Zap", color: "#F59E0B", text: "Увеличить освещённость в секции B на 15% — прогноз +8% урожая" },
  { icon: "Droplets", color: "#3b82f6", text: "Снизить полив в секции A на 10% до нормализации влажности" },
  { icon: "Thermometer", color: "#10B981", text: "Температура оптимальна, отклонений не обнаружено" },
  { icon: "Wind", color: "#a78bfa", text: "Усилить вентиляцию: CO₂ в норме, но прогноз роста через 4 ч" },
];

const REPORTS = [
  { name: "Еженедельный отчёт — ферма", date: "29.04.2026", type: "weekly", size: "1.2 МБ" },
  { name: "Ежедневный мониторинг", date: "05.05.2026", type: "daily", size: "340 КБ" },
  { name: "Сводка по лигносульфонатам", date: "01.05.2026", type: "monthly", size: "2.8 МБ" },
  { name: "Энергопотребление — апрель", date: "30.04.2026", type: "monthly", size: "1.9 МБ" },
];

const USERS = [
  { name: "Алексей Громов", role: "Инженер", status: "online", last: "сейчас" },
  { name: "Марина Козлова", role: "Менеджер", status: "online", last: "3 мин назад" },
  { name: "Дмитрий Орлов", role: "Инвестор", status: "offline", last: "вчера" },
  { name: "Светлана Ким", role: "Администратор", status: "online", last: "сейчас" },
];

// ─── Micro chart component ────────────────────────────────────────────────────
const SparkLine = ({ data, color = "#2563EB", height = 40 }: { data: number[]; color?: string; height?: number }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h * 0.85}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`gr-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#gr-${color.replace("#", "")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ─── Bar chart ────────────────────────────────────────────────────────────────
const BarChart = ({ data, labels, color = "#2563EB" }: { data: number[]; labels: string[]; color?: string }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm chart-bar"
            style={{
              height: `${(v / max) * 100}%`,
              background: color,
              opacity: 0.75 + (v / max) * 0.25,
              animationDelay: `${i * 0.05}s`,
            }}
          />
          <span className="text-[9px] text-[var(--clr-muted)]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Gauge ─────────────────────────────────────────────────────────────────────
const Gauge = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
  const pct = value / max;
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.75;
  const offset = dash - dash * pct;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="60" viewBox="0 0 80 60">
        <path d="M 10 55 A 30 30 0 1 1 70 55" fill="none" stroke="var(--clr-border)" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 10 55 A 30 30 0 1 1 70 55"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash}`}
          strokeDashoffset={`${offset}`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="40" y="52" textAnchor="middle" fill="#f7fafc" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="500">
          {value}
        </text>
      </svg>
      <span className="text-[10px] text-[var(--clr-muted)] text-center leading-tight">{label}</span>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({
  label, value, unit, trend, trendVal, icon, color, spark,
}: {
  label: string; value: string; unit?: string; trend?: "up" | "down" | "flat";
  trendVal?: string; icon: string; color: string; spark?: number[];
}) => (
  <div
    className="data-card animate-fade-in rounded-xl p-4 flex flex-col gap-2"
    style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-[var(--clr-muted)] uppercase tracking-wider">{label}</span>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "22" }}>
        <Icon name={icon} size={14} style={{ color }} />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className="mono text-2xl font-semibold" style={{ color: "var(--clr-heading)" }}>{value}</span>
      {unit && <span className="text-sm text-[var(--clr-muted)] mb-0.5">{unit}</span>}
    </div>
    {spark && <SparkLine data={spark} color={color} height={32} />}
    {trendVal && (
      <div className="flex items-center gap-1">
        <Icon
          name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"}
          size={12}
          style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#718096" }}
        />
        <span className="text-xs" style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#718096" }}>
          {trendVal}
        </span>
      </div>
    )}
  </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="animate-fade-in">
    <div className="mb-6">
      <h2 className="text-xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h2>
      {subtitle && <p className="text-sm text-[var(--clr-muted)] mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─── Alert level color ────────────────────────────────────────────────────────
const alertClass = (l: string) =>
  l === "error" ? "badge-offline" : l === "warning" ? "badge-warning" : l === "success" ? "badge-online" : "badge-info";
const alertIcon = (l: string) =>
  l === "error" ? "AlertCircle" : l === "warning" ? "AlertTriangle" : l === "success" ? "CheckCircle2" : "Info";

// ─── System health bar ────────────────────────────────────────────────────────
const HealthBar = ({ label, val, color }: { label: string; val: number; color: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-[var(--clr-muted)] w-20 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--clr-border)" }}>
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${val}%`, background: color }} />
    </div>
    <span className="mono text-xs w-8 text-right" style={{ color }}>{val}%</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Index() {
  const [active, setActive] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [cpuVal, setCpuVal] = useState(42);
  const [memVal, setMemVal] = useState(67);
  const [netVal, setNetVal] = useState(31);
  const sparkRef = useRef<number[]>([38, 42, 39, 45, 41, 48, 44, 50, 47, 42]);

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
      setCpuVal(Math.round(35 + Math.random() * 25));
      setMemVal(Math.round(60 + Math.random() * 15));
      setNetVal(Math.round(20 + Math.random() * 30));
      sparkRef.current = [...sparkRef.current.slice(1), Math.round(35 + Math.random() * 30)];
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const nav: { id: Section; label: string; icon: string }[] = [
    { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
    { id: "projects", label: "Проекты", icon: "FolderKanban" },
    { id: "farm", label: "Ферма клубники", icon: "Sprout" },
    { id: "analytics", label: "Аналитика", icon: "BarChart3" },
    { id: "ai", label: "ИИ‑ядро", icon: "Brain" },
    { id: "admin", label: "Администрирование", icon: "Settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--clr-bg)", color: "var(--clr-text)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? 240 : 60,
          background: "var(--clr-surface)",
          borderRight: "1px solid var(--clr-border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "var(--clr-border)" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}
          >
            <Icon name="Cpu" size={16} style={{ color: "#fff" }} />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-sm tracking-wide animate-fade-in" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--clr-heading)" }}>
              DataCore
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`nav-item w-full flex items-center gap-3 px-4 py-2.5 text-sm ${active === item.id ? "active" : ""}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon name={item.icon} size={16} style={{ color: active === item.id ? "var(--clr-blue-light)" : "var(--clr-muted)" }} />
              {sidebarOpen && (
                <span className={active === item.id ? "text-white font-medium" : "text-[var(--clr-muted)]"}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t text-[10px] text-[var(--clr-muted)]" style={{ borderColor: "var(--clr-border)" }}>
          {sidebarOpen ? (
            <div className="animate-fade-in">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="pulse-dot" style={{ background: "#10B981" }} />
                <span>Все системы работают</span>
              </div>
              <div className="mono">v2.4.1 · 05.05.2026</div>
            </div>
          ) : (
            <div className="pulse-dot mx-auto" style={{ background: "#10B981" }} />
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center py-2 border-t hover:bg-[var(--clr-surface2)] transition-colors"
          style={{ borderColor: "var(--clr-border)" }}
        >
          <Icon name={sidebarOpen ? "ChevronLeft" : "ChevronRight"} size={14} style={{ color: "var(--clr-muted)" }} />
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{ background: "var(--clr-surface)", borderBottom: "1px solid var(--clr-border)" }}
        >
          <div>
            <h1 className="text-base font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {nav.find((n) => n.id === active)?.label}
            </h1>
            <p className="text-xs text-[var(--clr-muted)] mono">
              {time.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })} &nbsp;·&nbsp;
              {time.toLocaleTimeString("ru-RU")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[var(--clr-surface2)] transition-colors">
              <Icon name="Bell" size={16} style={{ color: "var(--clr-muted)" }} />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#EF4444" }}
              />
            </button>
            <button className="p-2 rounded-lg hover:bg-[var(--clr-surface2)] transition-colors">
              <Icon name="Search" size={16} style={{ color: "var(--clr-muted)" }} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: "var(--clr-border)" }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "#2563EB", color: "#fff" }}
              >
                СК
              </div>
              {sidebarOpen && <span className="text-xs text-[var(--clr-muted)]">Светлана К.</span>}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" key={active}>
          {active === "dashboard" && <DashboardView cpuVal={cpuVal} memVal={memVal} netVal={netVal} spark={sparkRef.current} />}
          {active === "projects" && <ProjectsView setActive={setActive} />}
          {active === "farm" && <FarmView />}
          {active === "analytics" && <AnalyticsView />}
          {active === "ai" && <AiView />}
          {active === "admin" && <AdminView />}
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardView({ cpuVal, memVal, netVal, spark }: { cpuVal: number; memVal: number; netVal: number; spark: number[] }) {
  return (
    <Section title="Главная панель" subtitle="Сводка по всем проектам платформы">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Урожайность" value="118" unit="кг/нед" icon="Sprout" color="#10B981" trend="up" trendVal="+4% к плану" spark={[98, 102, 109, 112, 115, 110, 118, 116, 118, 118]} />
        <KpiCard label="Активных датчиков" value="54" unit="из 58" icon="Radio" color="#2563EB" trend="flat" trendVal="4 оффлайн" spark={[56, 55, 57, 56, 55, 54, 54, 55, 54, 54]} />
        <KpiCard label="Точность ИИ" value="94" unit="%" icon="Brain" color="#a78bfa" trend="up" trendVal="+2% после дообучения" spark={[88, 89, 90, 91, 91, 92, 93, 93, 94, 94]} />
        <KpiCard label="Энергопотребление" value="142" unit="кВт·ч" icon="Zap" color="#F59E0B" trend="down" trendVal="–6% к норме" spark={[155, 152, 148, 150, 147, 144, 143, 142, 143, 142]} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* System health */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Здоровье системы</span>
            <span className="badge-online text-[10px] px-2 py-0.5 rounded-full">Стабильно</span>
          </div>
          <div className="flex flex-col gap-3">
            <HealthBar label="CPU" val={cpuVal} color="#2563EB" />
            <HealthBar label="Память" val={memVal} color="#a78bfa" />
            <HealthBar label="Сеть" val={netVal} color="#10B981" />
            <HealthBar label="Диск" val={38} color="#F59E0B" />
          </div>
          <div className="mt-4 pt-3 border-t flex gap-4 text-xs text-[var(--clr-muted)]" style={{ borderColor: "var(--clr-border)" }}>
            <span>🟢 Ферма: онлайн</span>
            <span>🟢 Лигно: онлайн</span>
            <span>🟡 Бетон: тест</span>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Алерты</span>
            <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full">2 активных</span>
          </div>
          <div className="flex flex-col gap-2">
            {ALERTS.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 p-2 rounded-lg" style={{ background: "var(--clr-surface2)" }}>
                <Icon name={alertIcon(a.level)} size={13} style={{ color: a.level === "error" ? "#EF4444" : a.level === "warning" ? "#F59E0B" : a.level === "success" ? "#10B981" : "#60a5fa", marginTop: 1 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{a.msg}</p>
                  <p className="text-[10px] text-[var(--clr-muted)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sparkline chart */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Нагрузка платформы</span>
            <span className="mono text-xs text-[var(--clr-muted)]">live</span>
          </div>
          <div className="w-full overflow-hidden">
            <SparkLine data={spark} color="#2563EB" height={60} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "CPU", val: `${spark[spark.length - 1]}%`, color: "#2563EB" },
              { label: "RAM", val: "67%", color: "#a78bfa" },
              { label: "RPS", val: "214", color: "#10B981" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg py-2" style={{ background: "var(--clr-surface2)" }}>
                <div className="mono text-sm font-semibold" style={{ color: m.color }}>{m.val}</div>
                <div className="text-[10px] text-[var(--clr-muted)]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gauges */}
      <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Сводные KPI проектов</span>
          <button className="text-xs px-3 py-1 rounded-lg" style={{ background: "#2563EB22", color: "#60a5fa", border: "1px solid #2563EB44" }}>
            Подробнее
          </button>
        </div>
        <div className="flex items-center justify-around flex-wrap gap-4">
          <Gauge value={98} max={100} label="Выполнение плана" color="#10B981" />
          <Gauge value={94} max={100} label="Точность ИИ" color="#a78bfa" />
          <Gauge value={74} max={100} label="Вл-ть секция B" color="#F59E0B" />
          <Gauge value={22} max={30} label="Температура A, °C" color="#3b82f6" />
          <Gauge value={920} max={1200} label="CO₂ ppm" color="#10B981" />
          <Gauge value={88} max={100} label="Заряд ИБП" color="#34d399" />
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsView({ setActive }: { setActive: (s: Section) => void }) {
  const [filter, setFilter] = useState("all");
  const filtered = PROJECTS.filter((p) => filter === "all" || p.status === filter);

  return (
    <Section title="Проекты" subtitle="Все подключённые проекты платформы">
      <div className="flex gap-2 mb-5">
        {["all", "active", "testing"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={filter === f ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
          >
            {f === "all" ? "Все" : f === "active" ? "Активные" : "Тестирование"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="data-card rounded-xl p-5 flex flex-col gap-3"
            style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: "Montserrat, sans-serif", maxWidth: "80%" }}>
                {p.name}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${p.status === "active" ? "badge-online" : "badge-warning"}`}>
                {p.status === "active" ? "Активен" : "Тест"}
              </span>
            </div>
            <p className="text-xs text-[var(--clr-muted)] leading-snug">{p.desc}</p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: "KPI", val: p.kpi },
                { label: "Датчики", val: String(p.sensors) },
                { label: "Uptime", val: p.uptime },
              ].map((m) => (
                <div key={m.label} className="rounded-lg p-2 text-center" style={{ background: "var(--clr-surface2)" }}>
                  <div className="mono text-xs font-semibold" style={{ color: "var(--clr-heading)" }}>{m.val}</div>
                  <div className="text-[9px] text-[var(--clr-muted)] mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[var(--clr-muted)]">С {p.since}</span>
              <button
                onClick={() => p.id === "farm" && setActive("farm")}
                className="text-xs px-3 py-1 rounded-lg flex items-center gap-1.5"
                style={{ background: "#2563EB22", color: "#60a5fa", border: "1px solid #2563EB44" }}
              >
                Дашборд <Icon name="ArrowRight" size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FARM DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function FarmView() {
  const yieldData = [102, 108, 111, 109, 115, 112, 118, 116, 119, 118, 120, 118];
  const forecastData = [105, 108, 110, 112, 114, 115, 116, 117, 118, 119, 120, 121];
  const labels = ["28.04", "29.04", "30.04", "01.05", "02.05", "03.05", "04.05", "05.05", "06.05", "07.05", "08.05", "09.05"];
  const energyData = [148, 145, 150, 144, 142, 141, 143, 142, 140, 139, 141, 142];
  const energyNorm = [150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150];

  return (
    <Section title="Вертикальная ферма клубники" subtitle="Детальный мониторинг параметров и производительности">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Урожайность" value="118" unit="кг" icon="Sprout" color="#10B981" trend="up" trendVal="прогноз: 120 кг" spark={yieldData.slice(-8)} />
        <KpiCard label="Температура A" value="22.4" unit="°C" icon="Thermometer" color="#3b82f6" trend="flat" trendVal="норма: 22–24°C" spark={[22.1, 22.3, 22.5, 22.4, 22.2, 22.4, 22.3, 22.4]} />
        <KpiCard label="Влажность B" value="74" unit="%" icon="Droplets" color="#F59E0B" trend="up" trendVal="⚠ выше нормы" spark={[65, 66, 68, 70, 71, 72, 73, 74]} />
        <KpiCard label="CO₂" value="920" unit="ppm" icon="Wind" color="#a78bfa" trend="flat" trendVal="норма: 800–1000" spark={[880, 900, 910, 905, 915, 920, 918, 920]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Yield chart */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Урожайность: прогноз vs факт</span>
            <div className="flex items-center gap-3 text-[10px] text-[var(--clr-muted)]">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded" style={{ background: "#10B981" }} /> Факт</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded border-t border-dashed" style={{ borderColor: "#F59E0B" }} /> Прогноз</span>
            </div>
          </div>
          <div className="relative">
            <BarChart data={yieldData} labels={labels} color="#10B981" />
          </div>
          <p className="text-xs text-[var(--clr-muted)] mt-3">Точность прогноза: <span className="mono font-semibold" style={{ color: "#10B981" }}>98.3%</span> · Неделя: прогноз 120 кг, факт 118 кг</p>
        </div>

        {/* Energy */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Энергопотребление</span>
            <span className="badge-online text-[10px] px-2 py-0.5 rounded-full">–6% к норме</span>
          </div>
          <BarChart data={energyData} labels={labels} color="#F59E0B" />
          <p className="text-xs text-[var(--clr-muted)] mt-3">Норматив: <span className="mono">150 кВт·ч</span> · Текущий расход: <span className="mono font-semibold" style={{ color: "#F59E0B" }}>142 кВт·ч</span></p>
        </div>
      </div>

      {/* Sensors grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <span className="text-sm font-semibold mb-4 block" style={{ fontFamily: "Montserrat, sans-serif" }}>Датчики — статус</span>
          <div className="grid grid-cols-2 gap-2">
            {SENSORS.map((s) => (
              <div
                key={s.id}
                className="rounded-lg p-3 flex items-start gap-2.5"
                style={{ background: "var(--clr-surface2)", border: `1px solid ${s.status === "warning" ? "#F59E0B44" : s.status === "offline" ? "#EF444444" : "transparent"}` }}
              >
                <div className="pulse-dot mt-1 shrink-0" style={{ background: s.status === "online" ? "#10B981" : s.status === "warning" ? "#F59E0B" : "#EF4444", animationPlayState: s.status === "offline" ? "paused" : "running" }} />
                <div>
                  <p className="text-xs font-medium">{s.name}</p>
                  <p className="mono text-sm font-semibold mt-0.5" style={{ color: s.status === "offline" ? "var(--clr-muted)" : "var(--clr-heading)" }}>{s.val}</p>
                  <p className="text-[9px] text-[var(--clr-muted)]">норма: {s.norm}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI recommendations */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Рекомендации ИИ</span>
            <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">Модель v1.3</span>
          </div>
          <div className="flex flex-col gap-3">
            {AI_RECOMMENDATIONS.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--clr-surface2)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.color + "22" }}>
                  <Icon name={r.icon} size={14} style={{ color: r.color }} />
                </div>
                <p className="text-xs leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--clr-border)" }}>
            <button
              className="w-full text-xs py-2 rounded-lg font-medium transition-colors"
              style={{ background: "#2563EB", color: "#fff" }}
            >
              Применить все рекомендации
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsView() {
  const [period, setPeriod] = useState("week");

  return (
    <Section title="Аналитика и отчёты" subtitle="Конструктор отчётов и архив документов">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Report builder */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <span className="text-sm font-semibold mb-4 block" style={{ fontFamily: "Montserrat, sans-serif" }}>Конструктор отчётов</span>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-[var(--clr-muted)] block mb-1.5">Проект</label>
              <select className="w-full text-xs rounded-lg px-3 py-2 outline-none" style={{ background: "var(--clr-surface2)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }}>
                <option>Ферма клубники</option>
                <option>Лигносульфонаты</option>
                <option>Бетонные смеси</option>
                <option>Все проекты</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--clr-muted)] block mb-1.5">Период</label>
              <div className="flex gap-1.5">
                {["day", "week", "month"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="flex-1 text-xs py-2 rounded-lg transition-all"
                    style={period === p ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
                  >
                    {p === "day" ? "День" : p === "week" ? "Неделя" : "Месяц"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-[var(--clr-muted)] block mb-2">Метрики</label>
            <div className="flex flex-wrap gap-2">
              {["Урожайность", "Температура", "Влажность", "CO₂", "Энергия", "Датчики", "ИИ-прогноз"].map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3 h-3 accent-blue-500" />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-2" style={{ background: "#2563EB", color: "#fff" }}>
              <Icon name="FileBarChart" size={13} /> Сформировать PDF
            </button>
            <button className="flex-1 text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-2" style={{ background: "var(--clr-surface2)", color: "var(--clr-text)", border: "1px solid var(--clr-border)" }}>
              <Icon name="Sheet" size={13} /> Экспорт Excel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4">
          {[
            { label: "Всего отчётов", val: "143", icon: "FileText", color: "#2563EB" },
            { label: "За этот месяц", val: "22", icon: "Calendar", color: "#10B981" },
            { label: "Размер архива", val: "1.8 ГБ", icon: "HardDrive", color: "#a78bfa" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + "22" }}>
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div className="mono text-xl font-semibold" style={{ color: "var(--clr-heading)" }}>{s.val}</div>
                <div className="text-xs text-[var(--clr-muted)]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Archive */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--clr-border)" }}>
          <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Архив отчётов</span>
          <div className="flex items-center gap-2">
            <input placeholder="Поиск..." className="text-xs px-3 py-1.5 rounded-lg outline-none w-40" style={{ background: "var(--clr-surface2)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }} />
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--clr-border)" }}>
              {["Название", "Дата", "Тип", "Размер", ""].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[var(--clr-muted)] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r, i) => (
              <tr key={i} className="border-b hover:bg-[var(--clr-surface2)] transition-colors" style={{ borderColor: "var(--clr-border)" }}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 mono text-[var(--clr-muted)]">{r.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.type === "daily" ? "badge-info" : r.type === "weekly" ? "badge-online" : "badge-warning"}`}>
                    {r.type === "daily" ? "Ежедневный" : r.type === "weekly" ? "Недельный" : "Месячный"}
                  </span>
                </td>
                <td className="px-4 py-3 mono text-[var(--clr-muted)]">{r.size}</td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 text-[var(--clr-muted)] hover:text-[var(--clr-blue-light)] transition-colors">
                    <Icon name="Download" size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════════════════════════════════════
function AiView() {
  const [tab, setTab] = useState<"models" | "ab" | "logs">("models");

  const logs = [
    { time: "05.05 14:32", model: "Yield Predictor v1.3", event: "Прогноз: 120 кг (факт 118 кг, δ=1.7%)", type: "predict" },
    { time: "05.05 14:15", model: "Anomaly Detector v2.1", event: "Аномалия: влажность секция B > 73%", type: "alert" },
    { time: "05.05 13:55", model: "Climate Optimizer v1.2", event: "Рекомендация: +15% освещение секция B", type: "rec" },
    { time: "05.05 12:00", model: "Yield Predictor v1.3", event: "Начало обучения на данных за апрель", type: "train" },
    { time: "04.05 23:41", model: "Yield Predictor v1.3", event: "Обучение завершено. Точность: 94.2%", type: "train" },
    { time: "04.05 18:10", model: "Anomaly Detector v2.1", event: "Прошёл плановый тест. Все метрики в норме", type: "predict" },
  ];

  return (
    <Section title="ИИ‑ядро" subtitle="Библиотека моделей, A/B-тесты и журнал предсказаний">
      <div className="flex gap-2 mb-5">
        {(["models", "ab", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={tab === t ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
          >
            {t === "models" ? "Модели" : t === "ab" ? "A/B-тесты" : "Журнал"}
          </button>
        ))}
      </div>

      {tab === "models" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {AI_MODELS.map((m) => (
            <div key={m.name} className="data-card rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>{m.name}</h3>
                  <p className="mono text-xs text-[var(--clr-muted)] mt-0.5">{m.ver} · {m.date}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === "active" ? "badge-online" : m.status === "testing" ? "badge-warning" : "badge-offline"}`}>
                  {m.status === "active" ? "Активна" : m.status === "testing" ? "Тест" : "Устарела"}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--clr-muted)]">Точность</span>
                  <span className="mono font-semibold" style={{ color: m.acc >= 90 ? "#10B981" : m.acc >= 80 ? "#F59E0B" : "#EF4444" }}>{m.acc}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--clr-border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${m.acc}%`, background: m.acc >= 90 ? "#10B981" : m.acc >= 80 ? "#F59E0B" : "#EF4444" }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--clr-muted)]">
                <span>Запусков: <span className="mono">{m.runs.toLocaleString()}</span></span>
                <button className="text-[var(--clr-blue-light)] hover:underline">Подробнее</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "ab" && (
        <div className="rounded-xl p-5" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <p className="text-sm font-semibold mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>A/B тест: Yield Predictor v1.2 vs v1.3</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { ver: "v1.2", acc: 91, runs: 642, status: "control" },
              { ver: "v1.3", acc: 94, runs: 642, status: "challenger" },
            ].map((v) => (
              <div key={v.ver} className="rounded-xl p-4" style={{ background: "var(--clr-surface2)", border: `1px solid ${v.status === "challenger" ? "#2563EB44" : "var(--clr-border)"}` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="mono font-bold text-sm">{v.ver}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.status === "challenger" ? "badge-info" : "badge-online"}`}>
                    {v.status === "challenger" ? "Претендент" : "Контроль"}
                  </span>
                </div>
                <div className="text-2xl mono font-semibold mb-1" style={{ color: "var(--clr-heading)" }}>{v.acc}%</div>
                <div className="text-xs text-[var(--clr-muted)]">Точность · {v.runs} запусков</div>
                <SparkLine data={[88, 89, 90, v.acc - 2, v.acc - 1, v.acc, v.acc, v.acc]} color={v.status === "challenger" ? "#2563EB" : "#10B981"} height={36} />
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg" style={{ background: "#10B98122", border: "1px solid #10B98144" }}>
            <p className="text-xs" style={{ color: "#10B981" }}>
              <strong>Вывод:</strong> v1.3 превосходит контрольную версию на 3.3%. Рекомендуется перевести в production.
            </p>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--clr-border)" }}>
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Журнал событий ИИ</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--clr-border)" }}>
            {logs.map((l, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-[var(--clr-surface2)] transition-colors">
                <span className="mono text-[10px] text-[var(--clr-muted)] shrink-0 mt-0.5">{l.time}</span>
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: l.type === "alert" ? "#EF4444" : l.type === "train" ? "#a78bfa" : l.type === "rec" ? "#F59E0B" : "#10B981" }}
                />
                <div>
                  <span className="text-xs text-[var(--clr-muted)]">{l.model}</span>
                  <p className="text-xs mt-0.5">{l.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
function AdminView() {
  const [tab, setTab] = useState<"users" | "gateway" | "logs">("users");

  const eventLogs = [
    { time: "05.05 14:38", level: "info", msg: "Пользователь Светлана К. вошла в систему" },
    { time: "05.05 14:15", level: "warning", msg: "Датчик CO-02 не отвечает более 10 минут" },
    { time: "05.05 13:50", level: "info", msg: "Обновлён шлюз данных: MQTT broker v3.1.1" },
    { time: "05.05 12:00", level: "info", msg: "Запущено обучение модели Yield Predictor v1.3" },
    { time: "04.05 23:41", level: "success", msg: "Обучение завершено успешно" },
    { time: "04.05 20:00", level: "error", msg: "Ошибка экспорта: таймаут подключения к ERP" },
  ];

  return (
    <Section title="Администрирование" subtitle="Управление пользователями, шлюзом данных и системными событиями">
      <div className="flex gap-2 mb-5">
        {(["users", "gateway", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={tab === t ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
          >
            {t === "users" ? "Пользователи" : t === "gateway" ? "Шлюз данных" : "Журнал событий"}
          </button>
        ))}
      </div>

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
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: "#2563EB", color: "#fff" }}
                      >
                        {u.name.split(" ").map((n) => n[0]).join("")}
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
                    <button className="text-[var(--clr-muted)] hover:text-[var(--clr-blue-light)] transition-colors">
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
            { name: "MQTT Broker", status: "online", host: "mqtt.datacore.local:1883", proto: "MQTT v3.1.1", msgs: "1 240/мин" },
            { name: "REST API Gateway", status: "online", host: "api.datacore.local:443", proto: "HTTP/2 + TLS", msgs: "214 RPS" },
            { name: "ERP Integration", status: "warning", host: "erp.corp.local:8080", proto: "REST + OAuth2", msgs: "Таймауты" },
            { name: "TimescaleDB", status: "online", host: "db.datacore.local:5432", proto: "PostgreSQL 16", msgs: "48 ms avg" },
          ].map((gw) => (
            <div key={gw.name} className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: `1px solid ${gw.status === "warning" ? "#F59E0B44" : "var(--clr-border)"}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{gw.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${gw.status === "online" ? "badge-online" : "badge-warning"}`}>
                  {gw.status === "online" ? "🟢 Онлайн" : "🟡 Предупреждение"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-[var(--clr-muted)]">
                <div className="flex gap-2"><span className="w-16 shrink-0">Хост:</span><span className="mono">{gw.host}</span></div>
                <div className="flex gap-2"><span className="w-16 shrink-0">Протокол:</span><span>{gw.proto}</span></div>
                <div className="flex gap-2"><span className="w-16 shrink-0">Нагрузка:</span><span className="mono">{gw.msgs}</span></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 text-xs py-1.5 rounded-lg" style={{ background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}>
                  Настроить
                </button>
                <button className="flex-1 text-xs py-1.5 rounded-lg" style={{ background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}>
                  Тест связи
                </button>
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
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${l.level === "error" ? "badge-offline" : l.level === "warning" ? "badge-warning" : l.level === "success" ? "badge-online" : "badge-info"}`}
                >
                  {l.level.toUpperCase()}
                </span>
                <p className="text-xs">{l.msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}