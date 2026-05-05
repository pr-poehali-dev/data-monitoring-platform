import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { SparkLine, SectionWrapper } from "./Charts";
import { AI_MODELS } from "./data";
import { api, type ReportItem } from "@/lib/api";

const PROJECT_OPTIONS = [
  { id: "farm",     label: "Ферма клубники" },
  { id: "lst",      label: "Лигносульфонаты (ЛСТ)" },
  { id: "pipeforge",label: "PipeForge" },
  { id: "lignin",   label: "Переработка лигнина" },
  { id: "concrete", label: "Бетонные смеси" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
export function AnalyticsView() {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("7d");
  const [project, setProject] = useState("farm");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [busy, setBusy] = useState<"pdf" | "csv" | null>(null);
  const [search, setSearch] = useState("");

  async function refresh() {
    try {
      const r = await api.listReports();
      setReports(r.items);
    } catch { /* ignore */ }
  }

  useEffect(() => { refresh(); }, []);

  async function generate(format: "pdf" | "csv") {
    setBusy(format);
    try {
      const r = await api.generateReport({ project_id: project, format, period });
      window.open(r.url, "_blank");
      await refresh();
    } catch (e) {
      alert("Не удалось сформировать отчёт: " + e);
    } finally {
      setBusy(null);
    }
  }

  const filtered = reports.filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <SectionWrapper title="Аналитика и отчёты" subtitle="Конструктор отчётов и архив документов">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Report builder */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <span className="text-sm font-semibold mb-4 block" style={{ fontFamily: "Montserrat, sans-serif" }}>Конструктор отчётов</span>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-[var(--clr-muted)] block mb-1.5">Проект</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: "var(--clr-surface2)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }}
              >
                {PROJECT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--clr-muted)] block mb-1.5">Период</label>
              <div className="flex gap-1.5">
                {(["24h", "7d", "30d"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="flex-1 text-xs py-2 rounded-lg transition-all"
                    style={period === p ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
                  >
                    {p === "24h" ? "День" : p === "7d" ? "Неделя" : "Месяц"}
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
            <button
              onClick={() => generate("pdf")}
              disabled={busy !== null}
              className="flex-1 text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              style={{ background: "#2563EB", color: "#fff", opacity: busy ? 0.6 : 1 }}
            >
              <Icon name={busy === "pdf" ? "Loader" : "FileBarChart"} size={13} />
              {busy === "pdf" ? "Формирование…" : "Сформировать PDF"}
            </button>
            <button
              onClick={() => generate("csv")}
              disabled={busy !== null}
              className="flex-1 text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              style={{ background: "var(--clr-surface2)", color: "var(--clr-text)", border: "1px solid var(--clr-border)", opacity: busy ? 0.6 : 1 }}
            >
              <Icon name={busy === "csv" ? "Loader" : "Sheet"} size={13} />
              {busy === "csv" ? "Формирование…" : "Экспорт CSV"}
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
          <input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg outline-none w-40"
            style={{ background: "var(--clr-surface2)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }}
          />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--clr-border)" }}>
              {["Название", "Дата", "Формат", "Размер", "Период", ""].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[var(--clr-muted)] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-[var(--clr-muted)]">
                Отчётов пока нет. Сформируйте первый — он появится здесь.
              </td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b hover:bg-[var(--clr-surface2)] transition-colors" style={{ borderColor: "var(--clr-border)" }}>
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3 mono text-[var(--clr-muted)]">
                  {r.created_at ? new Date(r.created_at).toLocaleString("ru-RU") : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.format === "pdf" ? "badge-info" : "badge-online"}`}>
                    {r.format.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 mono text-[var(--clr-muted)]">
                  {r.size_bytes ? `${(r.size_bytes / 1024).toFixed(1)} КБ` : "—"}
                </td>
                <td className="px-4 py-3 mono text-[var(--clr-muted)]">{r.period || "—"}</td>
                <td className="px-4 py-3">
                  {r.url
                    ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[var(--clr-blue)] hover:underline"><Icon name="Download" size={13} /></a>
                    : <span className="text-[var(--clr-muted)] text-[10px]">—</span>}
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
  const [tab, setTab] = useState<"models" | "anomalies" | "forecast" | "logs">("models");
  const [sensorId, setSensorId] = useState("T-01");
  const [anomalies, setAnomalies] = useState<{ ts: number; value: number; z_score: number }[]>([]);
  const [forecast, setForecast] = useState<{ history: { ts: number; value: number }[]; forecast: { ts: number; value: number }[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (tab === "anomalies") {
      setAiLoading(true);
      api.anomalies(sensorId).then((r) => { if (alive) setAnomalies(r.anomalies); }).finally(() => alive && setAiLoading(false));
    }
    if (tab === "forecast") {
      setAiLoading(true);
      api.forecast(sensorId, 12).then((r) => { if (alive) setForecast({ history: r.history, forecast: r.forecast }); }).finally(() => alive && setAiLoading(false));
    }
    return () => { alive = false; };
  }, [tab, sensorId]);

  const logs = [
    { time: "05.05 14:32", model: "Прогноз урожая v1.3", event: "Прогноз: 120 кг (факт 118 кг, δ=1.7%)", type: "predict" },
    { time: "05.05 14:15", model: "Детектор аномалий v2.1", event: "Аномалия: влажность секция B > 73%", type: "alert" },
    { time: "05.05 13:55", model: "Оптимизатор климата v1.2", event: "Рекомендация: +15% освещение секция B", type: "rec" },
    { time: "05.05 12:00", model: "Прогноз урожая v1.3", event: "Начало обучения на данных за апрель", type: "train" },
    { time: "04.05 23:41", model: "Прогноз урожая v1.3", event: "Обучение завершено. Точность: 94.2%", type: "train" },
    { time: "04.05 18:10", model: "Прогноз качества ЛСТ v0.8", event: "Прогноз прочности: 54.2 МПа (план 56 МПа)", type: "predict" },
  ];

  return (
    <SectionWrapper title="ИИ‑ядро" subtitle="Модели · детектор аномалий · прогнозы · журнал">
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["models", "anomalies", "forecast", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={tab === t ? { background: "#2563EB", color: "#fff" } : { background: "var(--clr-surface)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}
          >
            {t === "models" ? "Модели" : t === "anomalies" ? "Аномалии" : t === "forecast" ? "Прогноз" : "Журнал"}
          </button>
        ))}
        {(tab === "anomalies" || tab === "forecast") && (
          <select
            value={sensorId}
            onChange={(e) => setSensorId(e.target.value)}
            className="text-xs rounded-lg px-3 py-1.5 outline-none ml-auto"
            style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }}
          >
            <option value="T-01">Температура A</option>
            <option value="T-02">Температура B</option>
            <option value="H-01">Влажность A</option>
            <option value="H-02">Влажность B</option>
            <option value="CO-01">CO₂ A</option>
            <option value="L-01">Освещение A</option>
          </select>
        )}
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

      {tab === "anomalies" && (
        <div className="rounded-xl p-5" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Детектор аномалий — Z-score (порог 2.0σ)</span>
            <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">{aiLoading ? "Анализ…" : `Найдено: ${anomalies.length}`}</span>
          </div>
          {anomalies.length === 0 && !aiLoading && (
            <p className="text-xs text-[var(--clr-muted)]">Аномалий не найдено за последние 24 часа. Все показания в пределах нормы.</p>
          )}
          {anomalies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {anomalies.map((a, i) => (
                <div key={i} className="rounded-lg p-3 flex items-start gap-3" style={{ background: "#EF444411", border: "1px solid #EF444433" }}>
                  <Icon name="AlertTriangle" size={14} style={{ color: "#EF4444", marginTop: 2 }} />
                  <div>
                    <p className="text-xs font-medium">Значение: <span className="mono">{a.value.toFixed(2)}</span></p>
                    <p className="text-[10px] text-[var(--clr-muted)]">Z-score: <span className="mono">{a.z_score}</span> · {new Date(a.ts * 1000).toLocaleString("ru-RU")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "forecast" && (
        <div className="rounded-xl p-5" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Прогноз показателя на 12 точек вперёд</span>
            <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">{aiLoading ? "Расчёт…" : "Линейная регрессия"}</span>
          </div>
          {forecast && forecast.history.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-[var(--clr-muted)] mb-1">История ({forecast.history.length} точек)</p>
                  <SparkLine data={forecast.history.map(p => p.value)} color="#2563EB" height={48} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--clr-muted)] mb-1">Прогноз ({forecast.forecast.length} точек)</p>
                  <SparkLine data={forecast.forecast.map(p => p.value)} color="#10B981" height={48} />
                </div>
              </div>
              <p className="text-xs text-[var(--clr-muted)]">
                Текущее: <span className="mono font-semibold">{forecast.history[forecast.history.length - 1]?.value.toFixed(2)}</span>
                {" → "}
                через 12 шагов: <span className="mono font-semibold" style={{ color: "#10B981" }}>{forecast.forecast[forecast.forecast.length - 1]?.value.toFixed(2)}</span>
              </p>
            </>
          ) : (
            <p className="text-xs text-[var(--clr-muted)]">Загружаем историю показаний…</p>
          )}
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