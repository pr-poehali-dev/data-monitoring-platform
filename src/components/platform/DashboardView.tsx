import { SparkLine, Gauge, KpiCard, SectionWrapper, HealthBar, alertIcon } from "./Charts";
import { ALERTS } from "./data";
import Icon from "@/components/ui/icon";

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
