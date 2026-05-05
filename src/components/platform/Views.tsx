import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SparkLine, BarChart, Gauge, KpiCard, SectionWrapper, HealthBar, alertIcon } from "./Charts";
import { ALERTS, SENSORS, PROJECTS, AI_MODELS, AI_RECOMMENDATIONS, REPORTS, USERS } from "./data";
import type { Section } from "./data";

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function DashboardView({ cpuVal, memVal, netVal, spark }: { cpuVal: number; memVal: number; netVal: number; spark: number[] }) {
  return (
    <SectionWrapper title="Главная панель" subtitle="Сводка по всем проектам платформы">
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
          <button className="text-xs px-3 py-1 rounded-lg" style={{ background: "#2563EB22", color: "#2563EB", border: "1px solid #2563EB44" }}>
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
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════════
export function ProjectsView({ setActive }: { setActive: (s: Section) => void }) {
  const [filter, setFilter] = useState("all");
  const filtered = PROJECTS.filter((p) => filter === "all" || p.status === filter);

  return (
    <SectionWrapper title="Проекты" subtitle="Все подключённые проекты платформы">
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
                style={{ background: "#2563EB22", color: "#2563EB", border: "1px solid #2563EB44" }}
              >
                Дашборд <Icon name="ArrowRight" size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FARM DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function FarmView() {
  const yieldData = [102, 108, 111, 109, 115, 112, 118, 116, 119, 118, 120, 118];
  const forecastData = [105, 108, 110, 112, 114, 115, 116, 117, 118, 119, 120, 121];
  const labels = ["28.04", "29.04", "30.04", "01.05", "02.05", "03.05", "04.05", "05.05", "06.05", "07.05", "08.05", "09.05"];
  const energyData = [148, 145, 150, 144, 142, 141, 143, 142, 140, 139, 141, 142];

  return (
    <SectionWrapper title="Вертикальная ферма клубники" subtitle="Детальный мониторинг параметров и производительности">
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
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
export function AnalyticsView() {
  const [period, setPeriod] = useState("week");

  return (
    <SectionWrapper title="Аналитика и отчёты" subtitle="Конструктор отчётов и архив документов">
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
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════════════════════════════════════
export function AiView() {
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
    <SectionWrapper title="ИИ‑ядро" subtitle="Библиотека моделей, A/B-тесты и журнал предсказаний">
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
            <p className="text-xs" style={{ color: "#059669" }}>
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
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminView() {
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
    <SectionWrapper title="Администрирование" subtitle="Управление пользователями, шлюзом данных и системными событиями">
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
    </SectionWrapper>
  );
}
