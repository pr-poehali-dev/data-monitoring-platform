import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import type { Section } from "@/components/platform/data";
import { DashboardView, ProjectsView, FarmView, AnalyticsView, AiView, PilotView, AdminView } from "@/components/platform/Views";

export default function Index() {
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

  const nav: { id: Section; label: string; icon: string }[] = [
    { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
    { id: "projects", label: "Проекты", icon: "FolderKanban" },
    { id: "farm", label: "Ферма клубники", icon: "Sprout" },
    { id: "pilot", label: "Пилот · KPI", icon: "FlaskConical" },
    { id: "analytics", label: "Аналитика", icon: "BarChart3" },
    { id: "ai", label: "ИИ‑ядро", icon: "Brain" },
    { id: "admin", label: "Администрирование", icon: "Settings" },
  ];

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
            <Icon name="Cpu" size={16} style={{ color: "#fff" }} />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-sm tracking-wide animate-fade-in" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--clr-heading)" }}>
              DataCore
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`nav-item w-full flex items-center gap-3 px-4 py-2.5 text-sm ${active === item.id ? "active" : ""}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon name={item.icon} size={16} style={{ color: active === item.id ? "var(--clr-blue)" : "var(--clr-muted)" }} />
              {sidebarOpen && (
                <span style={{ color: active === item.id ? "var(--clr-blue)" : "var(--clr-muted)", fontWeight: active === item.id ? 600 : 400 }}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
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
              {nav.find((n) => n.id === active)?.label}
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
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "#2563EB", color: "#fff" }}
              >
                СК
              </div>
              {sidebarOpen && <span className="text-xs text-[var(--clr-muted)]">Светлана К.</span>}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" key={active}>
          {active === "dashboard" && <DashboardView cpuVal={cpuVal} memVal={memVal} netVal={netVal} spark={sparkRef.current} />}
          {active === "projects" && <ProjectsView setActive={setActive} />}
          {active === "farm" && <FarmView />}
          {active === "pilot" && <PilotView />}
          {active === "analytics" && <AnalyticsView />}
          {active === "ai" && <AiView />}
          {active === "admin" && <AdminView />}
        </main>
      </div>
    </div>
  );
}