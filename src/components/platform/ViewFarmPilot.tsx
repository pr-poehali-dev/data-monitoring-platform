import Icon from "@/components/ui/icon";
import { BarChart, KpiCard, SectionWrapper } from "./Charts";
import { SENSORS, AI_RECOMMENDATIONS, PROTOCOLS, PILOT_KPIS, PILOT_TIMELINE } from "./data";

// ═══════════════════════════════════════════════════════════════════════════════
// FARM DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function FarmView() {
  const yieldData = [102, 108, 111, 109, 115, 112, 118, 116, 119, 118, 120, 118];
  const labels = ["28.04", "29.04", "30.04", "01.05", "02.05", "03.05", "04.05", "05.05", "06.05", "07.05", "08.05", "09.05"];
  const energyData = [148, 145, 150, 144, 142, 141, 143, 142, 140, 139, 141, 142];

  return (
    <SectionWrapper title="Вертикальная ферма клубники" subtitle="Пилот 500 м² · Оборудование ОВЕН · Протокол Modbus RTU / MQTT">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Урожайность" value="118" unit="кг" icon="Sprout" color="#10B981" trend="up" trendVal="прогноз: 120 кг" spark={yieldData.slice(-8)} />
        <KpiCard label="Температура A" value="22.4" unit="°C" icon="Thermometer" color="#3b82f6" trend="flat" trendVal="ОВЕН ТРМ138" spark={[22.1, 22.3, 22.5, 22.4, 22.2, 22.4, 22.3, 22.4]} />
        <KpiCard label="Влажность B" value="74" unit="%" icon="Droplets" color="#D97706" trend="up" trendVal="⚠ выше нормы" spark={[65, 66, 68, 70, 71, 72, 73, 74]} />
        <KpiCard label="CO₂" value="920" unit="ppm" icon="Wind" color="#a78bfa" trend="flat" trendVal="Vaisala GMT222" spark={[880, 900, 910, 905, 915, 920, 918, 920]} />
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
            {SENSORS.map((s) => (
              <div
                key={s.id}
                className="rounded-lg p-3 flex items-start gap-2.5"
                style={{ background: "var(--clr-surface2)", border: `1px solid ${s.status === "warning" ? "#D9770644" : s.status === "offline" ? "#EF444444" : "transparent"}` }}
              >
                <div className="pulse-dot mt-1 shrink-0" style={{ background: s.status === "online" ? "#059669" : s.status === "warning" ? "#D97706" : "#DC2626", animationPlayState: s.status === "offline" ? "paused" : "running" }} />
                <div>
                  <p className="text-xs font-medium">{s.name}</p>
                  <p className="mono text-sm font-semibold mt-0.5" style={{ color: s.status === "offline" ? "var(--clr-muted)" : "var(--clr-heading)" }}>{s.val}</p>
                  <p className="text-[9px] text-[var(--clr-muted)]">{s.device}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI recommendations */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Рекомендации ИИ</span>
            <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">Модель v1.3 · 94%</span>
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
// PILOT
// ═══════════════════════════════════════════════════════════════════════════════
export function PilotView() {
  return (
    <SectionWrapper title="Пилотный проект" subtitle="3 недели · Ферма клубники + ЛСТ · Бюджет до 300–400 тыс. ₽ · Оплата по KPI">

      {/* Hero banner */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: "linear-gradient(135deg, #2563EB11, #10B98111)", border: "1px solid #2563EB33" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-bold mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Цель пилота: сократить сбор отчётов с 2 часов до 15 минут в день
            </h3>
            <p className="text-sm text-[var(--clr-muted)]">
              Подключаем ОВЕН-оборудование фермы по Modbus, запускаем ИИ-ядро, автоматизируем ежедневную отчётность.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="rounded-lg px-4 py-2 text-center" style={{ background: "var(--clr-surface)" }}>
              <div className="mono text-xl font-bold" style={{ color: "#2563EB" }}>3</div>
              <div className="text-[10px] text-[var(--clr-muted)]">недели</div>
            </div>
            <div className="rounded-lg px-4 py-2 text-center" style={{ background: "var(--clr-surface)" }}>
              <div className="mono text-xl font-bold" style={{ color: "#10B981" }}>300К</div>
              <div className="text-[10px] text-[var(--clr-muted)]">бюджет ₽</div>
            </div>
            <div className="rounded-lg px-4 py-2 text-center" style={{ background: "var(--clr-surface)" }}>
              <div className="mono text-xl font-bold" style={{ color: "#D97706" }}>KPI</div>
              <div className="text-[10px] text-[var(--clr-muted)]">оплата по факту</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* KPI targets */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <span className="text-sm font-semibold mb-4 block" style={{ fontFamily: "Montserrat, sans-serif" }}>KPI пилота — прогресс</span>
          <div className="flex flex-col gap-4">
            {PILOT_KPIS.map((k, i) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-medium">{k.metric}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${k.status === "done" ? "badge-online" : "badge-warning"}`}>
                    {k.status === "done" ? "✓ Достигнуто" : "В процессе"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[var(--clr-muted)] mb-1.5">
                  <span>Было: <span className="mono font-medium">{k.before}</span></span>
                  <Icon name="ArrowRight" size={10} />
                  <span>Стало: <span className="mono font-semibold" style={{ color: "var(--clr-heading)" }}>{k.after}</span></span>
                  <span className="ml-auto font-semibold" style={{ color: k.status === "done" ? "#059669" : "#D97706" }}>{k.target}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--clr-border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${k.progress}%`, background: k.status === "done" ? "#10B981" : "#D97706" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <span className="text-sm font-semibold mb-4 block" style={{ fontFamily: "Montserrat, sans-serif" }}>План-факт по неделям</span>
          <div className="flex flex-col gap-4">
            {PILOT_TIMELINE.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: t.done ? "#10B981" : "var(--clr-surface2)", color: t.done ? "#fff" : "var(--clr-muted)", border: t.done ? "none" : "1px solid var(--clr-border)" }}
                  >
                    {t.done ? "✓" : i + 1}
                  </div>
                  {i < PILOT_TIMELINE.length - 1 && (
                    <div className="w-px flex-1 min-h-4" style={{ background: t.done ? "#10B98144" : "var(--clr-border)" }} />
                  )}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">{t.title}</span>
                    <span className="text-[9px] text-[var(--clr-muted)]">{t.week}</span>
                  </div>
                  <p className="text-xs text-[var(--clr-muted)] leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Current status */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--clr-border)" }}>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "#2563EB11", border: "1px solid #2563EB33" }}>
              <div className="pulse-dot" style={{ background: "#2563EB" }} />
              <span className="text-xs" style={{ color: "#2563EB" }}>
                <strong>Сейчас:</strong> Неделя 3 — автоматизация отчётности. Финальный замер KPI.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Protocols block */}
      <div className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Протоколы и интеграции</span>
          <span className="text-[10px] text-[var(--clr-muted)]">Modbus · OPC UA · MQTT · REST</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {PROTOCOLS.map((p) => (
            <div
              key={p.name}
              className="rounded-lg p-3 flex items-start gap-3"
              style={{ background: "var(--clr-surface2)", border: `1px solid ${p.status === "warning" ? "#D9770644" : "transparent"}` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: p.status === "online" ? "#05966922" : "#D9770622" }}
              >
                <Icon name="Wifi" size={14} style={{ color: p.status === "online" ? "#059669" : "#D97706" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold">{p.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--clr-muted)]">
                    <span className="mono">{p.latency}</span>
                    <span className="badge-info px-1.5 py-0 rounded-full">{p.points} тч.</span>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--clr-muted)] leading-snug">{p.desc}</p>
                <p className="text-[10px] text-[var(--clr-muted)] mt-1">{p.devices}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
