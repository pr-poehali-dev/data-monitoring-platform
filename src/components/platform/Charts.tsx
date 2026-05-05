import React from "react";
import Icon from "@/components/ui/icon";

// ─── SparkLine ────────────────────────────────────────────────────────────────
export const SparkLine = ({ data, color = "#2563EB", height = 40 }: { data: number[]; color?: string; height?: number }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h * 0.85}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`gr-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#gr-${color.replace("#", "")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ─── BarChart ─────────────────────────────────────────────────────────────────
export const BarChart = ({ data, labels, color = "#2563EB" }: { data: number[]; labels: string[]; color?: string }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm chart-bar"
            style={{
              height: `${(v / max) * 100}%`,
              background: color,
              opacity: 0.75 + (v / max) * 0.25,
              animationDelay: `${i * 0.05}s`,
            }}
          />
          <span className="text-[9px] text-[var(--clr-muted)]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Gauge ────────────────────────────────────────────────────────────────────
export const Gauge = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
  const pct = value / max;
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.75;
  const offset = dash - dash * pct;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="60" viewBox="0 0 80 60">
        <path d="M 10 55 A 30 30 0 1 1 70 55" fill="none" stroke="var(--clr-border)" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 10 55 A 30 30 0 1 1 70 55"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash}`}
          strokeDashoffset={`${offset}`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="40" y="52" textAnchor="middle" fill="var(--clr-heading)" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="500">
          {value}
        </text>
      </svg>
      <span className="text-[10px] text-[var(--clr-muted)] text-center leading-tight">{label}</span>
    </div>
  );
};

// ─── KpiCard ──────────────────────────────────────────────────────────────────
export const KpiCard = ({
  label, value, unit, trend, trendVal, icon, color, spark,
}: {
  label: string; value: string; unit?: string; trend?: "up" | "down" | "flat";
  trendVal?: string; icon: string; color: string; spark?: number[];
}) => (
  <div
    className="data-card animate-fade-in rounded-xl p-4 flex flex-col gap-2"
    style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-[var(--clr-muted)] uppercase tracking-wider">{label}</span>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "22" }}>
        <Icon name={icon} size={14} style={{ color }} />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className="mono text-2xl font-semibold" style={{ color: "var(--clr-heading)" }}>{value}</span>
      {unit && <span className="text-sm text-[var(--clr-muted)] mb-0.5">{unit}</span>}
    </div>
    {spark && <SparkLine data={spark} color={color} height={32} />}
    {trendVal && (
      <div className="flex items-center gap-1">
        <Icon
          name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"}
          size={12}
          style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#718096" }}
        />
        <span className="text-xs" style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#718096" }}>
          {trendVal}
        </span>
      </div>
    )}
  </div>
);

// ─── SectionWrapper ───────────────────────────────────────────────────────────
export const SectionWrapper = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="animate-fade-in">
    <div className="mb-6">
      <h2 className="text-xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h2>
      {subtitle && <p className="text-sm text-[var(--clr-muted)] mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─── HealthBar ────────────────────────────────────────────────────────────────
export const HealthBar = ({ label, val, color }: { label: string; val: number; color: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-[var(--clr-muted)] w-20 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--clr-border)" }}>
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${val}%`, background: color }} />
    </div>
    <span className="mono text-xs w-8 text-right" style={{ color }}>{val}%</span>
  </div>
);

// ─── alertIcon helper ─────────────────────────────────────────────────────────
export const alertIcon = (l: string) =>
  l === "error" ? "AlertCircle" : l === "warning" ? "AlertTriangle" : l === "success" ? "CheckCircle2" : "Info";
