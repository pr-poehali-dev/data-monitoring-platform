import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { api, type AutomationJob, type AutomationRun } from "@/lib/api";

const ICONS: Record<string, { icon: string; color: string }> = {
  poll_sensors:     { icon: "Radio",        color: "#10B981" },
  detect_anomalies: { icon: "AlertTriangle",color: "#F59E0B" },
  check_offline:    { icon: "WifiOff",      color: "#EF4444" },
  cleanup_readings: { icon: "Trash2",       color: "#a78bfa" },
  daily_report:     { icon: "FileText",     color: "#2563EB" },
  weekly_report:    { icon: "CalendarRange",color: "#3b82f6" },
  retrain_models:   { icon: "Brain",        color: "#a78bfa" },
};

function formatInterval(sec: number): string {
  if (sec < 60) return `${sec} сек`;
  if (sec < 3600) return `${Math.round(sec / 60)} мин`;
  if (sec < 86400) return `${Math.round(sec / 3600)} ч`;
  return `${Math.round(sec / 86400)} дн`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff} сек назад`;
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

export default function AutomationView() {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    try {
      const [j, r] = await Promise.all([api.automationJobs(), api.automationRuns(20)]);
      setJobs(j.items);
      setRuns(r.items);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  async function toggle(j: AutomationJob) {
    await api.automationToggle(j.id, !j.is_enabled);
    refresh();
  }

  async function runNow(code: string) {
    setBusy(code);
    try {
      await api.automationRunNow(code);
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  const totalRuns = jobs.reduce((s, j) => s + (j.total_runs || 0), 0);
  const totalFails = jobs.reduce((s, j) => s + (j.total_failures || 0), 0);
  const enabledCount = jobs.filter((j) => j.is_enabled).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #10B98111, #2563EB11)", border: "1px solid #10B98133" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Автономный движок данных
            </div>
            <div className="text-xs text-[var(--clr-muted)] mt-1">
              7 процессов работают сами: опрос датчиков, детектор аномалий, контроль связи, авто‑отчёты, переобучение ИИ
            </div>
          </div>
          <div className="flex gap-2 flex-wrap text-[10px]">
            <div className="rounded-lg px-3 py-2" style={{ background: "var(--clr-surface)" }}>
              <div className="mono text-base font-bold" style={{ color: "#10B981" }}>{enabledCount}/{jobs.length}</div>
              <div className="text-[var(--clr-muted)]">активных задач</div>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: "var(--clr-surface)" }}>
              <div className="mono text-base font-bold" style={{ color: "#2563EB" }}>{totalRuns}</div>
              <div className="text-[var(--clr-muted)]">всего запусков</div>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: "var(--clr-surface)" }}>
              <div className="mono text-base font-bold" style={{ color: totalFails > 0 ? "#EF4444" : "#10B981" }}>{totalFails}</div>
              <div className="text-[var(--clr-muted)]">сбоев</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {jobs.map((j) => {
          const cfg = ICONS[j.code] || { icon: "Cog", color: "#718096" };
          const statusColor = j.last_status === "success" ? "#10B981"
            : j.last_status === "error" ? "#EF4444" : "#718096";
          return (
            <div key={j.id} className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: `1px solid ${j.is_enabled ? "var(--clr-border)" : "#71809644"}`, opacity: j.is_enabled ? 1 : 0.6 }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.color + "22" }}>
                  <Icon name={cfg.icon} size={16} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{j.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${j.is_enabled ? "badge-online" : "badge-offline"}`}>
                      {j.is_enabled ? "🟢 Активна" : "⚫ Выключена"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--clr-muted)] leading-snug">{j.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
                <div className="rounded-lg p-2" style={{ background: "var(--clr-surface2)" }}>
                  <div className="text-[var(--clr-muted)] mb-0.5">Каждые</div>
                  <div className="mono font-semibold">{formatInterval(j.interval_seconds)}</div>
                </div>
                <div className="rounded-lg p-2" style={{ background: "var(--clr-surface2)" }}>
                  <div className="text-[var(--clr-muted)] mb-0.5">Запусков</div>
                  <div className="mono font-semibold">{j.total_runs}</div>
                </div>
                <div className="rounded-lg p-2" style={{ background: "var(--clr-surface2)" }}>
                  <div className="text-[var(--clr-muted)] mb-0.5">Сбоев</div>
                  <div className="mono font-semibold" style={{ color: j.total_failures > 0 ? "#EF4444" : "var(--clr-heading)" }}>{j.total_failures}</div>
                </div>
              </div>

              {j.last_message && (
                <div className="text-[11px] mb-3 p-2 rounded-lg flex items-start gap-2" style={{ background: statusColor + "11" }}>
                  <Icon name={j.last_status === "success" ? "CheckCircle2" : "AlertCircle"} size={12} style={{ color: statusColor, marginTop: 2 }} />
                  <div className="flex-1">
                    <div style={{ color: statusColor }}>{j.last_message}</div>
                    <div className="text-[10px] text-[var(--clr-muted)] mt-0.5">{timeAgo(j.last_run_at)}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => runNow(j.code)}
                  disabled={busy === j.code}
                  className="flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-opacity"
                  style={{ background: "#2563EB", color: "#fff", opacity: busy === j.code ? 0.6 : 1 }}
                >
                  <Icon name={busy === j.code ? "Loader" : "Play"} size={11} />
                  {busy === j.code ? "Запуск…" : "Запустить сейчас"}
                </button>
                <button
                  onClick={() => toggle(j)}
                  className="text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5"
                  style={{ background: "var(--clr-surface2)", color: "var(--clr-text)", border: "1px solid var(--clr-border)" }}
                >
                  <Icon name={j.is_enabled ? "Pause" : "Power"} size={11} />
                  {j.is_enabled ? "Стоп" : "Старт"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--clr-border)" }}>
          <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>История запусков</span>
          <span className="text-[10px] text-[var(--clr-muted)] flex items-center gap-1.5">
            <div className="pulse-dot" style={{ background: "#10B981" }} />
            обновляется автоматически
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--clr-border)" }}>
              {["Время", "Задача", "Статус", "Длительность", "Результат"].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-[var(--clr-muted)] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--clr-muted)]">
                Запусков пока нет. Подождите 30 секунд — движок начнёт работать.
              </td></tr>
            )}
            {runs.map((r) => (
              <tr key={r.id} className="border-b" style={{ borderColor: "var(--clr-border)" }}>
                <td className="px-4 py-2 mono text-[10px] text-[var(--clr-muted)]">
                  {r.started_at ? new Date(r.started_at).toLocaleTimeString("ru-RU") : "—"}
                </td>
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === "success" ? "badge-online" : r.status === "error" ? "badge-offline" : "badge-warning"}`}>
                    {r.status === "success" ? "✓ Успех" : r.status === "error" ? "✗ Ошибка" : "В работе"}
                  </span>
                </td>
                <td className="px-4 py-2 mono text-[var(--clr-muted)]">
                  {r.duration_ms !== null ? `${r.duration_ms} мс` : "—"}
                </td>
                <td className="px-4 py-2 text-[var(--clr-muted)]">{r.message || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
