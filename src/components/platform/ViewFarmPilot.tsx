import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { BarChart, KpiCard, SectionWrapper } from "./Charts";
import { SENSORS, AI_RECOMMENDATIONS } from "./data";
import { api, type Snapshot, type Insight } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════════════════════
// FARM DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function FarmView({ snap }: { snap?: Snapshot | null }) {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await api.insights("farm");
        if (alive && r.insights.length) setInsights(r.insights);
      } catch { /* ignore */ }
    };
    tick();
    const t = setInterval(tick, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const live = snap?.sensors || [];
  const liveById = (id: string) => live.find((s) => s.id === id);
  const t1 = liveById("T-01")?.value;
  const h2 = liveById("H-02")?.value;
  const co = liveById("CO-01")?.value;
  const yieldData = [102, 108, 111, 109, 115, 112, 118, 116, 119, 118, 120, 118];
  const labels = ["28.04", "29.04", "30.04", "01.05", "02.05", "03.05", "04.05", "05.05", "06.05", "07.05", "08.05", "09.05"];
  const energyData = [148, 145, 150, 144, 142, 141, 143, 142, 140, 139, 141, 142];

  return (
    <SectionWrapper title="Вертикальная ферма клубники" subtitle="Пилот 500 м² · Оборудование ОВЕН · Протокол Modbus RTU / MQTT">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Урожайность" value="118" unit="кг" icon="Sprout" color="#10B981" trend="up" trendVal="прогноз: 120 кг" spark={yieldData.slice(-8)} />
        <KpiCard label="Температура A" value={t1 ? t1.toFixed(1) : "22.4"} unit="°C" icon="Thermometer" color="#3b82f6" trend="flat" trendVal="ОВЕН ТРМ138 · онлайн" spark={[22.1, 22.3, 22.5, 22.4, 22.2, 22.4, 22.3, t1 ?? 22.4]} />
        <KpiCard label="Влажность B" value={h2 ? h2.toFixed(0) : "74"} unit="%" icon="Droplets" color="#D97706" trend="up" trendVal={(h2 ?? 74) > 70 ? "⚠ выше нормы" : "норма"} spark={[65, 66, 68, 70, 71, 72, 73, h2 ?? 74]} />
        <KpiCard label="CO₂" value={co ? co.toFixed(0) : "920"} unit="ppm" icon="Wind" color="#a78bfa" trend="flat" trendVal="Vaisala · онлайн" spark={[880, 900, 910, 905, 915, 920, 918, co ?? 920]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Yield chart */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Урожайность: прогноз vs факт</span>
            <div className="flex items-center gap-3 text-[10px] text-[var(--clr-muted)]">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded" style={{ background: "#10B981" }} /> Факт</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded border-t border-dashed" style={{ borderColor: "#D97706" }} /> Прогноз</span>
            </div>
          </div>
          <BarChart data={yieldData} labels={labels} color="#10B981" />
          <p className="text-xs text-[var(--clr-muted)] mt-3">Точность прогноза: <span className="mono font-semibold" style={{ color: "#10B981" }}>98.3%</span> · Неделя: прогноз 120 кг, факт 118 кг</p>
        </div>

        {/* Energy */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Энергопотребление</span>
            <span className="badge-online text-[10px] px-2 py-0.5 rounded-full">–6% к норме</span>
          </div>
          <BarChart data={energyData} labels={labels} color="#F59E0B" />
          <p className="text-xs text-[var(--clr-muted)] mt-3">Норматив: <span className="mono">150 кВт·ч</span> · Текущий расход: <span className="mono font-semibold" style={{ color: "#D97706" }}>142 кВт·ч</span></p>
        </div>
      </div>

      {/* Sensors grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Датчики — статус</span>
            <span className="text-[10px] text-[var(--clr-muted)]">Modbus RTU polling 1 сек</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(live.length ? live : SENSORS.map(s => ({ ...s, value: null }))).map((s) => {
              const status = (s as { status: string }).status;
              const valueText = "value" in s && s.value !== null && s.value !== undefined
                ? `${(s.value as number).toFixed((s as { unit?: string | null }).unit === "lx" || (s as { unit?: string | null }).unit === "ppm" ? 0 : 1)}${(s as { unit?: string | null }).unit ?? ""}`
                : "val" in s ? (s as { val: string }).val : "—";
              return (
                <div
                  key={s.id}
                  className="rounded-lg p-3 flex items-start gap-2.5"
                  style={{ background: "var(--clr-surface2)", border: `1px solid ${status === "warning" ? "#D9770644" : status === "offline" ? "#EF444444" : "transparent"}` }}
                >
                  <div className="pulse-dot mt-1 shrink-0" style={{ background: status === "online" ? "#059669" : status === "warning" ? "#D97706" : "#DC2626", animationPlayState: status === "offline" ? "paused" : "running" }} />
                  <div>
                    <p className="text-xs font-medium">{s.name}</p>
                    <p className="mono text-sm font-semibold mt-0.5" style={{ color: status === "offline" ? "var(--clr-muted)" : "var(--clr-heading)" }}>{valueText}</p>
                    <p className="text-[9px] text-[var(--clr-muted)]">{s.device}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI recommendations */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Рекомендации ИИ</span>
            <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">Модель v1.3 · 94%</span>
          </div>
          <div className="flex flex-col gap-3">
            {(insights.length ? insights : AI_RECOMMENDATIONS.map((r) => ({ icon: r.icon, color: r.color, text: r.text, title: "", level: "info" }))).map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--clr-surface2)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.color + "22" }}>
                  <Icon name={r.icon} size={14} style={{ color: r.color }} fallback="Sparkles" />
                </div>
                <div className="flex-1">
                  {("title" in r && r.title) ? <p className="text-xs font-semibold mb-0.5">{r.title}</p> : null}
                  <p className="text-xs leading-relaxed text-[var(--clr-muted)]">{r.text}</p>
                </div>
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