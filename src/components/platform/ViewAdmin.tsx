import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SectionWrapper } from "./Charts";
import { USERS } from "./data";

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminView() {
  const [tab, setTab] = useState<"users" | "gateway" | "logs">("users");

  const eventLogs = [
    { time: "05.05 14:38", level: "info", msg: "Администратор вошёл в систему" },
    { time: "05.05 14:15", level: "warning", msg: "Датчик CO-02 (Vaisala) не отвечает по Modbus более 10 минут" },
    { time: "05.05 13:50", level: "info", msg: "Обновлён шлюз данных: MQTT broker v3.1.1" },
    { time: "05.05 12:00", level: "info", msg: "Запущено обучение модели Yield Predictor v1.3" },
    { time: "04.05 23:41", level: "success", msg: "Обучение завершено успешно. Точность 94.2%" },
    { time: "04.05 20:00", level: "error", msg: "Ошибка экспорта: таймаут подключения к ERP 1С" },
  ];

  return (
    <SectionWrapper title="Администрирование" subtitle="Пользователи · Шлюз данных · Системный журнал">
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
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#2563EB22" }}>
                        <Icon name="User" size={12} style={{ color: "#2563EB" }} />
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
                    <button className="text-[var(--clr-muted)] hover:text-[var(--clr-blue)] transition-colors">
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
            { name: "MQTT Broker", status: "online", host: "192.168.1.10:1883", proto: "MQTT v3.1.1", msgs: "1 240/мин" },
            { name: "Modbus Gateway (ОВЕН)", status: "online", host: "192.168.1.20:502", proto: "Modbus TCP/RTU", msgs: "142 тч. · 1 сек" },
            { name: "OPC UA Server", status: "online", host: "192.168.1.30:4840", proto: "OPC UA Binary", msgs: "64 тч. · 5 сек" },
            { name: "ERP 1С Integration", status: "warning", host: "192.168.1.50:8080", proto: "REST + OAuth2", msgs: "Таймауты" },
          ].map((gw) => (
            <div key={gw.name} className="rounded-xl p-4" style={{ background: "var(--clr-surface)", border: `1px solid ${gw.status === "warning" ? "#D9770644" : "var(--clr-border)"}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{gw.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${gw.status === "online" ? "badge-online" : "badge-warning"}`}>
                  {gw.status === "online" ? "🟢 Онлайн" : "🟡 Предупреждение"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-[var(--clr-muted)]">
                <div className="flex gap-2"><span className="w-20 shrink-0">Хост:</span><span className="mono">{gw.host}</span></div>
                <div className="flex gap-2"><span className="w-20 shrink-0">Протокол:</span><span>{gw.proto}</span></div>
                <div className="flex gap-2"><span className="w-20 shrink-0">Нагрузка:</span><span className="mono">{gw.msgs}</span></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 text-xs py-1.5 rounded-lg" style={{ background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}>Настроить</button>
                <button className="flex-1 text-xs py-1.5 rounded-lg" style={{ background: "var(--clr-surface2)", color: "var(--clr-muted)", border: "1px solid var(--clr-border)" }}>Тест связи</button>
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${l.level === "error" ? "badge-offline" : l.level === "warning" ? "badge-warning" : l.level === "success" ? "badge-online" : "badge-info"}`}>
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