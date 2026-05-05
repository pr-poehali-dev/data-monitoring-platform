import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import type { Section } from "@/components/platform/data";
import { DashboardView, ProjectsView, FarmView, AnalyticsView, AiView, PilotView, AdminView } from "@/components/platform/Views";

const ROLES = [
  { id: "admin",    label: "Администратор",    desc: "Полный доступ ко всем разделам",    icon: "ShieldCheck",  color: "#2563EB" },
  { id: "engineer", label: "Инженер",           desc: "Датчики, ферма, алерты",            icon: "Wrench",       color: "#10B981" },
  { id: "manager",  label: "Менеджер проектов", desc: "Проекты, аналитика, отчёты",        icon: "FolderKanban", color: "#a78bfa" },
  { id: "investor", label: "Наблюдатель",       desc: "Только просмотр дашборда и KPI",    icon: "Eye",          color: "#F59E0B" },
];

const ROLE_ACCESS: Record<string, Section[]> = {
  admin:    ["dashboard", "projects", "farm", "pilot", "analytics", "ai", "admin"],
  engineer: ["dashboard", "farm", "pilot", "ai"],
  manager:  ["dashboard", "projects", "pilot", "analytics"],
  investor: ["dashboard", "pilot"],
};

function LoginScreen({ onLogin }: { onLogin: (role: string) => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--clr-bg)", color: "var(--clr-text)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}
        >
          <Icon name="Activity" size={20} style={{ color: "#fff" }} />
        </div>
        <div>
          <div className="font-bold text-lg leading-none" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--clr-heading)" }}>
            Платформа мониторинга данных
          </div>
          <div className="text-xs text-[var(--clr-muted)] mt-0.5">Промышленный IoT · ИИ-аналитика</div>
        </div>
      </div>

      <p className="text-sm text-[var(--clr-muted)] mb-8 mt-4">Выберите роль для входа в демо-режиме</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => onLogin(r.id)}
            className="flex items-start gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
            style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: r.color + "22" }}
            >
              <Icon name={r.icon} size={16} style={{ color: r.color }} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--clr-heading)" }}>
                {r.label}
              </div>
              <div className="text-xs text-[var(--clr-muted)] mt-0.5">{r.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-8 text-[11px] text-[var(--clr-muted)]">
        <div className="pulse-dot" style={{ background: "#10B981" }} />
        <span>Все системы работают · Демо-режим</span>
      </div>
    </div>
  );
}

export default function Index() {
  const [role, setRole] = useState<string | null>(null);
  const [active, setActive] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [cpuVal, setCpuVal] = useState(42);
  const [memVal, setMemVal] = useState(67);
  const [netVal, setNetVal] = useState(31);
  const sparkRef = useRef<number[]>([38, 42, 39, 45, 41, 48, 44, 50, 47, 42]);

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
      setCpuVal(Math.round(35 + Math.random() * 25));
      setMemVal(Math.round(60 + Math.random() * 15));
      setNetVal(Math.round(20 + Math.random() * 30));
      sparkRef.current = [...sparkRef.current.slice(1), Math.round(35 + Math.random() * 30)];
    }, 3000);
    return () => clearInterval(t);
  }, []);

  if (!role) return <LoginScreen onLogin={setRole} />;

  const currentRole = ROLES.find((r) => r.id === role)!;
  const allowed = ROLE_ACCESS[role] ?? [];

  const allNav: { id: Section; label: string; icon: string }[] = [
    { id: "dashboard", label: "Дашборд",            icon: "LayoutDashboard" },
    { id: "projects",  label: "Проекты",             icon: "FolderKanban"   },
    { id: "farm",      label: "Ферма клубники",      icon: "Sprout"         },
    { id: "pilot",     label: "Пилот · KPI",         icon: "FlaskConical"   },
    { id: "analytics", label: "Аналитика",           icon: "BarChart3"      },
    { id: "ai",        label: "ИИ‑ядро",             icon: "Brain"          },
    { id: "admin",     label: "Администрирование",   icon: "Settings"       },
  ];

  // если текущий раздел стал недоступен после смены роли — сбросить на dashboard
  const activeSection = allowed.includes(active) ? active : "dashboard";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--clr-bg)", color: "var(--clr-text)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? 240 : 60,
          background: "var(--clr-surface)",
          borderRight: "1px solid var(--clr-border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "var(--clr-border)" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}
          >
            <Icon name="Activity" size={16} style={{ color: "#fff" }} />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-xs leading-tight animate-fade-in" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--clr-heading)" }}>
              Платформа мониторинга данных
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {allNav.map((item) => {
            const accessible = allowed.includes(item.id);
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => accessible && setActive(item.id)}
                className={`nav-item w-full flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? "active" : ""} ${!accessible ? "opacity-35 cursor-not-allowed" : ""}`}
                title={!sidebarOpen ? item.label : !accessible ? `Недоступно для роли «${currentRole.label}»` : undefined}
                disabled={!accessible}
              >
                <Icon name={accessible ? item.icon : "Lock"} size={16} style={{ color: isActive ? "var(--clr-blue)" : "var(--clr-muted)" }} />
                {sidebarOpen && (
                  <span style={{ color: isActive ? "var(--clr-blue)" : "var(--clr-muted)", fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t text-[10px] text-[var(--clr-muted)]" style={{ borderColor: "var(--clr-border)" }}>
          {sidebarOpen ? (
            <div className="animate-fade-in">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="pulse-dot" style={{ background: "#10B981" }} />
                <span>Все системы работают</span>
              </div>
              <div className="mono">v2.4.1 · 05.05.2026</div>
            </div>
          ) : (
            <div className="pulse-dot mx-auto" style={{ background: "#10B981" }} />
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center py-2 border-t hover:bg-[var(--clr-surface2)] transition-colors"
          style={{ borderColor: "var(--clr-border)" }}
        >
          <Icon name={sidebarOpen ? "ChevronLeft" : "ChevronRight"} size={14} style={{ color: "var(--clr-muted)" }} />
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{ background: "var(--clr-surface)", borderBottom: "1px solid var(--clr-border)" }}
        >
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
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#EF4444" }}
              />
            </button>
            <button className="p-2 rounded-lg hover:bg-[var(--clr-surface2)] transition-colors">
              <Icon name="Search" size={16} style={{ color: "var(--clr-muted)" }} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: "var(--clr-border)" }}>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: currentRole.color + "22" }}
              >
                <Icon name={currentRole.icon} size={13} style={{ color: currentRole.color }} />
              </div>
              {sidebarOpen && <span className="text-xs text-[var(--clr-muted)]">{currentRole.label}</span>}
              <button
                onClick={() => setRole(null)}
                className="ml-1 p-1.5 rounded-lg hover:bg-[var(--clr-surface2)] transition-colors"
                title="Выйти"
              >
                <Icon name="LogOut" size={13} style={{ color: "var(--clr-muted)" }} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" key={activeSection}>
          {activeSection === "dashboard" && <DashboardView cpuVal={cpuVal} memVal={memVal} netVal={netVal} spark={sparkRef.current} />}
          {activeSection === "projects"  && <ProjectsView setActive={setActive} />}
          {activeSection === "farm"      && <FarmView />}
          {activeSection === "pilot"     && <PilotView />}
          {activeSection === "analytics" && <AnalyticsView />}
          {activeSection === "ai"        && <AiView />}
          {activeSection === "admin"     && <AdminView />}
        </main>
      </div>
    </div>
  );
}