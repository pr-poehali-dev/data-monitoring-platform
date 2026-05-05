import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SparkLine, Gauge, KpiCard, SectionWrapper, HealthBar, alertIcon } from "./Charts";
import { ALERTS, PROJECTS } from "./data";
import type { Section } from "./data";

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function DashboardView({ cpuVal, memVal, netVal, spark }: { cpuVal: number; memVal: number; netVal: number; spark: number[] }) {
  return (
    <SectionWrapper title="Главная панель" subtitle="Портфель из 8 проектов · Сколково · Газпром · Газпромнефть">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Активных проектов" value="5" unit="из 8" icon="FolderKanban" color="#2563EB" trend="up" trendVal="3 в разработке" spark={[3, 3, 4, 4, 4, 5, 5, 5, 5, 5]} />
        <KpiCard label="Датчиков онлайн" value="54" unit="из 58" icon="Radio" color="#10B981" trend="flat" trendVal="4 оффлайн" spark={[56, 55, 57, 56, 55, 54, 54, 55, 54, 54]} />
        <KpiCard label="Точность ИИ" value="94" unit="%" icon="Brain" color="#a78bfa" trend="up" trendVal="+2% после дообучения" spark={[88, 89, 90, 91, 91, 92, 93, 93, 94, 94]} />
        <KpiCard label="Сбор отчётов" value="15" unit="мин/день" icon="Clock" color="#10B981" trend="down" trendVal="было 2 часа" spark={[120, 110, 90, 75, 60, 45, 30, 20, 15, 15]} />
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
          <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-1 text-[10px] text-[var(--clr-muted)]" style={{ borderColor: "var(--clr-border)" }}>
            <span>🟢 Ферма: онлайн</span>
            <span>🟢 ЛСТ: онлайн</span>
            <span>🟢 PipeForge: онлайн</span>
            <span>🟡 УЗВ: тест</span>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Алерты</span>
            <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full">3 активных</span>
          </div>
          <div className="flex flex-col gap-2">
            {ALERTS.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 p-2 rounded-lg" style={{ background: "var(--clr-surface2)" }}>
                <Icon name={alertIcon(a.level)} size={13} style={{ color: a.level === "error" ? "#EF4444" : a.level === "warning" ? "#D97706" : a.level === "success" ? "#059669" : "#2563EB", marginTop: 1 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] badge-info px-1.5 py-0 rounded-full">{a.project}</span>
                  </div>
                  <p className="text-xs leading-snug">{a.msg}</p>
                  <p className="text-[10px] text-[var(--clr-muted)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform load */}
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

      {/* Gauges */}
      <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Сводные KPI портфеля</span>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--clr-muted)]">
            <div className="pulse-dot" style={{ background: "#10B981" }} />
            <span>обновлено только что</span>
          </div>
        </div>
        <div className="flex items-center justify-around flex-wrap gap-4">
          <Gauge value={98} max={100} label="Выполнение плана" color="#10B981" />
          <Gauge value={94} max={100} label="Точность ИИ" color="#a78bfa" />
          <Gauge value={74} max={100} label="Вл-ть секция B" color="#D97706" />
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

  const statusLabels: Record<string, string> = {
    active: "Активен", testing: "Тест", planned: "Планируется",
  };
  const statusBadge: Record<string, string> = {
    active: "badge-online", testing: "badge-warning", planned: "badge-info",
  };

  return (
    <SectionWrapper title="Портфель проектов" subtitle="8 технологических проектов · Сколково · Газпром · Газпромнефть">
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "active", "testing", "planned"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={filter === f ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
          >
            {f === "all" ? "Все (8)" : f === "active" ? "Активные" : f === "testing" ? "Тестирование" : "Планируются"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="data-card rounded-xl p-5 flex flex-col gap-3"
            style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full badge-info shrink-0">{p.tag}</span>
                  <span className="text-[9px] text-[var(--clr-muted)]">#{p.priority}</span>
                </div>
                <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {p.name}
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${statusBadge[p.status]}`}>
                {statusLabels[p.status]}
              </span>
            </div>
            <p className="text-xs text-[var(--clr-muted)] leading-snug">{p.desc}</p>
            {p.status !== "planned" && (
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
            )}
            <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--clr-muted)]">
              <div className="flex items-center gap-1.5">
                <Icon name="Wifi" size={10} />
                <span className="mono">{p.protocol}</span>
              </div>
              {(p.id === "farm" || p.id === "lst" || p.id === "pipeforge") && (
                <button
                  onClick={() => p.id === "farm" && setActive("farm")}
                  className="text-xs px-3 py-1 rounded-lg flex items-center gap-1.5"
                  style={{ background: "#2563EB22", color: "#2563EB", border: "1px solid #2563EB44" }}
                >
                  Дашборд <Icon name="ArrowRight" size={11} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
