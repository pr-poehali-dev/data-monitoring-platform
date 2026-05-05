import { useState } from "react";
import Icon from "@/components/ui/icon";
import { api, type AuthUser } from "@/lib/api";

const DEMO_ACCOUNTS = [
  { role: "admin",    label: "Администратор",    email: "admin@datacore.ru",    color: "#2563EB", icon: "ShieldCheck" },
  { role: "engineer", label: "Инженер",          email: "engineer@datacore.ru", color: "#10B981", icon: "Wrench" },
  { role: "manager",  label: "Менеджер",         email: "manager@datacore.ru",  color: "#a78bfa", icon: "FolderKanban" },
  { role: "investor", label: "Наблюдатель",      email: "investor@datacore.ru", color: "#F59E0B", icon: "Eye" },
];

export default function LoginScreen({ onLogin }: { onLogin: (u: AuthUser, token: string) => void }) {
  const [email, setEmail] = useState("admin@datacore.ru");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await api.login(email, password);
      localStorage.setItem("auth_token", r.token);
      localStorage.setItem("auth_user", JSON.stringify(r.user));
      onLogin(r.user, r.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--clr-bg)", color: "var(--clr-text)" }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}>
          <Icon name="Activity" size={20} style={{ color: "#fff" }} />
        </div>
        <div>
          <div className="font-bold text-lg leading-none" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--clr-heading)" }}>
            Платформа мониторинга данных
          </div>
          <div className="text-xs text-[var(--clr-muted)] mt-0.5">Промышленный IoT · ИИ-аналитика</div>
        </div>
      </div>

      <form onSubmit={submit} className="w-full max-w-sm mt-8 p-5 rounded-xl"
        style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
        <label className="text-xs text-[var(--clr-muted)]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "var(--clr-bg)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }}
        />
        <label className="text-xs text-[var(--clr-muted)]">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "var(--clr-bg)", border: "1px solid var(--clr-border)", color: "var(--clr-text)" }}
        />
        {error && <div className="text-xs mb-3" style={{ color: "#EF4444" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg text-sm font-semibold transition-opacity"
          style={{ background: "linear-gradient(135deg, #2563EB, #10B981)", color: "#fff", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Вход…" : "Войти"}
        </button>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--clr-border)" }}>
          <div className="text-[11px] text-[var(--clr-muted)] mb-2">Демо-доступы (пароль для всех: demo1234):</div>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.role}
                type="button"
                onClick={() => { setEmail(a.email); setPassword("demo1234"); }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] hover:opacity-80 transition-opacity"
                style={{ background: a.color + "18", color: a.color }}
              >
                <Icon name={a.icon} size={11} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </form>

      <div className="flex items-center gap-1.5 mt-6 text-[11px] text-[var(--clr-muted)]">
        <div className="pulse-dot" style={{ background: "#10B981" }} />
        <span>Все системы работают · v2.4.1</span>
      </div>
    </div>
  );
}
