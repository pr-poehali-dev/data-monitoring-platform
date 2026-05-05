import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SparkLine, SectionWrapper } from "./Charts";
import { AI_MODELS, REPORTS } from "./data";

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
                <option>Лигносульфонаты (ЛСТ)</option>
                <option>PipeForge</option>
                <option>Переработка лигнина</option>
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
            { label: "Автоматических", val: "18", icon: "Zap", color: "#a78bfa" },
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
          <input placeholder="Поиск..." className="text-xs px-3 py-1.5 rounded-lg outline-none w-40" style={{ background: "var(--clr-surface2)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }} />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--clr-border)" }}>
              {["Название", "Дата", "Тип", "Размер", "Авто", ""].map((h) => (
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
                  {r.auto
                    ? <span className="badge-online text-[10px] px-2 py-0.5 rounded-full">🤖 Авто</span>
                    : <span className="text-[var(--clr-muted)] text-[10px]">Ручной</span>
                  }
                </td>
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
    { time: "04.05 18:10", model: "LST Quality Predictor v0.8", event: "Прогноз прочности: 54.2 МПа (план 56 МПа)", type: "predict" },
  ];

  return (
    <SectionWrapper title="ИИ‑ядро" subtitle="Библиотека моделей · A/B-тесты · Журнал предсказаний">
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
                  <p className="mono text-xs text-[var(--clr-muted)] mt-0.5">{m.ver} · {m.date} · {m.project}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === "active" ? "badge-online" : m.status === "testing" ? "badge-warning" : "badge-offline"}`}>
                  {m.status === "active" ? "Активна" : m.status === "testing" ? "Тест" : "Устарела"}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--clr-muted)]">Точность</span>
                  <span className="mono font-semibold" style={{ color: m.acc >= 90 ? "#059669" : m.acc >= 80 ? "#D97706" : "#DC2626" }}>{m.acc}%</span>
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
                <button className="text-[var(--clr-blue)] hover:underline">Подробнее</button>
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
                  style={{ background: l.type === "alert" ? "#DC2626" : l.type === "train" ? "#a78bfa" : l.type === "rec" ? "#D97706" : "#059669" }}
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
