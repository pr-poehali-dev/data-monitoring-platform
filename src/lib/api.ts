// API-клиент для Платформы мониторинга данных
const URLS = {
  auth:     "https://functions.poehali.dev/23c7754a-bfb1-4ba5-8e5f-d412e7b22b8d",
  realtime: "https://functions.poehali.dev/895d38a7-64d7-4c72-ae8c-2d94d1f44fda",
  alerts:   "https://functions.poehali.dev/8340c270-703c-48c2-9ab2-51106e41708f",
  reports:  "https://functions.poehali.dev/cf81fc96-c7c3-41b7-99ba-3fb294b24e75",
  ai:       "https://functions.poehali.dev/de6b3a03-9003-4ed7-b3b1-214cd8d101db",
} as const;

export type AuthUser = { id: number; email: string; full_name: string; role: string };
export type Sensor = {
  id: string; name: string; unit: string | null; device: string | null;
  norm_min: number | null; norm_max: number | null; value: number | null; status: string;
};
export type Snapshot = {
  ts: number;
  sensors: Sensor[];
  system: { cpu: number; memory: number; network: number; disk: number };
};
export type AlertItem = {
  id: number; level: string; message: string; acknowledged: boolean;
  project: string; project_id: string | null; sensor_id: string | null; created_at: string | null;
};
export type ReportItem = {
  id: number; title: string; format: string; period: string | null;
  url: string | null; size_bytes: number | null; status: string;
  project_id: string | null; created_at: string | null;
};
export type Insight = {
  level: string; icon: string; color: string; title: string; text: string;
};

function authHeaders(): Record<string, string> {
  const t = localStorage.getItem("auth_token");
  const u = localStorage.getItem("auth_user");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h["X-Auth-Token"] = t;
  if (u) {
    try { h["X-User-Id"] = String(JSON.parse(u).id); } catch { /* ignore */ }
  }
  return h;
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const r = await fetch(`${URLS.auth}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Ошибка входа");
    return r.json();
  },

  async snapshot(project = "farm"): Promise<Snapshot> {
    const r = await fetch(`${URLS.realtime}?action=snapshot&project=${project}`, { headers: authHeaders() });
    if (!r.ok) throw new Error("snapshot failed");
    return r.json();
  },

  async history(sensorId: string, period: "1h" | "24h" | "7d" | "30d" = "1h") {
    const r = await fetch(`${URLS.realtime}?action=history&sensor_id=${sensorId}&period=${period}`, { headers: authHeaders() });
    if (!r.ok) throw new Error("history failed");
    return r.json() as Promise<{ sensor_id: string; period: string; points: { ts: number; value: number }[] }>;
  },

  async listAlerts(limit = 50): Promise<{ items: AlertItem[] }> {
    const r = await fetch(`${URLS.alerts}?limit=${limit}`, { headers: authHeaders() });
    if (!r.ok) throw new Error("alerts failed");
    return r.json();
  },

  async createAlert(data: { level: string; message: string; project_id?: string; sensor_id?: string }) {
    const r = await fetch(URLS.alerts, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) });
    return r.json();
  },

  async ackAlert(id: number) {
    const r = await fetch(URLS.alerts, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ id }) });
    return r.json();
  },

  async listReports(): Promise<{ items: ReportItem[] }> {
    const r = await fetch(URLS.reports, { headers: authHeaders() });
    if (!r.ok) throw new Error("reports failed");
    return r.json();
  },

  async generateReport(data: { project_id: string; format: "pdf" | "csv"; period: string }) {
    const r = await fetch(URLS.reports, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error("report failed");
    return r.json() as Promise<{ id: number; url: string; format: string; size_bytes: number }>;
  },

  async insights(project = "farm"): Promise<{ insights: Insight[] }> {
    const r = await fetch(`${URLS.ai}?action=insights&project=${project}`, { headers: authHeaders() });
    if (!r.ok) throw new Error("insights failed");
    return r.json();
  },

  async anomalies(sensorId: string) {
    const r = await fetch(`${URLS.ai}?action=anomalies&sensor_id=${sensorId}`, { headers: authHeaders() });
    return r.json() as Promise<{ sensor_id: string; samples: number; anomalies: { ts: number; value: number; z_score: number }[] }>;
  },

  async forecast(sensorId: string, horizon = 12) {
    const r = await fetch(`${URLS.ai}?action=forecast&sensor_id=${sensorId}&horizon=${horizon}`, { headers: authHeaders() });
    return r.json() as Promise<{
      sensor_id: string;
      history: { ts: number; value: number }[];
      forecast: { ts: number; value: number }[];
    }>;
  },
};
