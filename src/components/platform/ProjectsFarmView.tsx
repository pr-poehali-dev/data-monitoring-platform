import { useState } from "react";
import Icon from "@/components/ui/icon";
import { BarChart, KpiCard, SectionWrapper } from "./Charts";
import { SENSORS, PROJECTS, AI_RECOMMENDATIONS } from "./data";
import type { Section } from "./data";

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
