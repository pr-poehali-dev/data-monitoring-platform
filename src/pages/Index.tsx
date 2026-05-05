import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { Section } from "@/components/platform/data";
import { DashboardView, ProjectsView, FarmView, AnalyticsView, AiView, AdminView } from "@/components/platform/Views";
import LoginScreen from "@/components/platform/LoginScreen";
import { useRealtime } from "@/hooks/useRealtime";
import type { AuthUser } from "@/lib/api";

const ROLE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  admin:    { label: "Администратор",    icon: "ShieldCheck",  color: "#2563EB" },
  engineer: { label: "Инженер",           icon: "Wrench",       color: "#10B981" },
  manager:  { label: "Менеджер проектов", icon: "FolderKanban", color: "#a78bfa" },
  investor: { label: "Наблюдатель",       icon: "Eye",          color: "#F59E0B" },
};

const ROLE_ACCESS: Record<string, Section[]> = {
  admin:    ["dashboard", "projects", "farm", "analytics", "ai", "admin"],
  engineer: ["dashboard", "farm", "ai"],
  manager:  ["dashboard", "projects", "analytics"],
  investor: ["dashboard", "projects"],
};

export default function Index() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [active, setActive] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());

  const { snap } = useRealtime("farm", 3000);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // восстановление сессии
  useEffect(() => {
    const u = localStorage.getItem("auth_user");
    const t = localStorage.getItem("auth_token");
    if (u && t) {
      try { setUser(JSON.parse(u)); } catch { /* noop */ }
    }
  }, []);

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  }

  if (!user) return <LoginScreen onLogin={(u) => setUser(u)} />;

  const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.investor;
  const allowed = ROLE_ACCESS[user.role] ?? [];

  const allNav: { id: Section; label: string; icon: string }[] = [
    { id: "dashboard", label: "Дашборд",           icon: "LayoutDashboard" },
    { id: "projects",  label: "Проекты",            icon: "FolderKanban"   },
    { id: "farm",      label: "Ферма клубники",     icon: "Sprout"         },
    { id: "analytics", label: "Аналитика",          icon: "BarChart3"      },
    { id: "ai",        label: "ИИ‑ядро",            icon: "Brain"          },
    { id: "admin",     label: "Администрирование",  icon: "Settings"       },
  ];

  const activeSection = allowed.includes(active) ? active : "dashboard";

  // Sparkline для дашборда
  const cpuVal = snap?.system.cpu ?? 0;
  const memVal = snap?.system.memory ?? 0;
  const netVal = snap?.system.network ?? 0;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--clr-bg)", color: "var(--clr-text)" }}>
      <aside className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
        style={{ width: sidebarOpen ? 240 : 60, background: "var(--clr-surface)", borderRight: "1px solid var(--clr-border)" }}>
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "var(--clr-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}>
            <Icon name="Activity" size={16} style={{ color: "#fff" }} />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-xs leading-tight animate-fade-in"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--clr-heading)" }}>
              Платформа мониторинга данных
            </span>
          )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {allNav.map((item) => {
            const accessible = allowed.includes(item.id);
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => accessible && setActive(item.id)}
                className={`nav-item w-full flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? "active" : ""} ${!accessible ? "opacity-35 cursor-not-allowed" : ""}`}
                title={!sidebarOpen ? item.label : !accessible ? `Недоступно для роли «${roleInfo.label}»` : undefined}
                disabled={!accessible}
              >
                <Icon name={accessible ? item.icon : "Lock"} size={16}
                  style={{ color: isActive ? "var(--clr-blue)" : "var(--clr-muted)" }} />
                {sidebarOpen && (
                  <span style={{ color: isActive ? "var(--clr-blue)" : "var(--clr-muted)", fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t text-[10px] text-[var(--clr-muted)]" style={{ borderColor: "var(--clr-border)" }}>
          {sidebarOpen ? (
            <div className="animate-fade-in">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="pulse-dot" style={{ background: snap ? "#10B981" : "#EF4444" }} />
                <span>{snap ? "Данные онлайн" : "Подключение…"}</span>
              </div>
              <div className="mono">v2.4.1 · 05.05.2026</div>
            </div>
          ) : (
            <div className="pulse-dot mx-auto" style={{ background: snap ? "#10B981" : "#EF4444" }} />
          )}
        </div>

        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center py-2 border-t hover:bg-[var(--clr-surface2)] transition-colors"
          style={{ borderColor: "var(--clr-border)" }}>
          <Icon name={sidebarOpen ? "ChevronLeft" : "ChevronRight"} size={14} style={{ color: "var(--clr-muted)" }} />
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{ background: "var(--clr-surface)", borderBottom: "1px solid var(--clr-border)" }}>
          <div>
            <h1 className="text-base font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {allNav.find((n) => n.id === activeSection)?.label}
            </h1>
            <p className="text-xs text-[var(--clr-muted)] mono">
              {time.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })} &nbsp;·&nbsp;
              {time.toLocaleTimeString("ru-RU")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[var(--clr-surface2)] transition-colors">
              <Icon name="Bell" size={16} style={{ color: "var(--clr-muted)" }} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444" }} />
            </button>
            <button className="p-2 rounded-lg hover:bg-[var(--clr-surface2)] transition-colors">
              <Icon name="Search" size={16} style={{ color: "var(--clr-muted)" }} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: "var(--clr-border)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: roleInfo.color + "22" }}>
                <Icon name={roleInfo.icon} size={13} style={{ color: roleInfo.color }} />
              </div>
              {sidebarOpen && (
                <div className="leading-tight">
                  <div className="text-xs" style={{ color: "var(--clr-heading)" }}>{user.full_name}</div>
                  <div className="text-[10px] text-[var(--clr-muted)]">{roleInfo.label}</div>
                </div>
              )}
              <button onClick={logout} className="ml-1 p-1.5 rounded-lg hover:bg-[var(--clr-surface2)] transition-colors" title="Выйти">
                <Icon name="LogOut" size={13} style={{ color: "var(--clr-muted)" }} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" key={activeSection}>
          {activeSection === "dashboard" && (
            <DashboardView cpuVal={Math.round(cpuVal)} memVal={Math.round(memVal)} netVal={Math.round(netVal)} spark={[]} snap={snap} />
          )}
          {activeSection === "projects"  && <ProjectsView setActive={setActive} />}
          {activeSection === "farm"      && <FarmView snap={snap} />}
          {activeSection === "analytics" && <AnalyticsView />}
          {activeSection === "ai"        && <AiView />}
          {activeSection === "admin"     && <AdminView />}
        </main>
      </div>
    </div>
  );
}