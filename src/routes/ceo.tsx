import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserRole } from "@/lib/auth";
import {
  LineChart as LineChartIcon,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  Clock,
  ShieldCheck,
  Flame,
  Building2,
} from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ceo")({
  beforeLoad: async () => {
    const role = await getUserRole();
    if (!role) {
      throw redirect({ to: "/login" });
    }
    if (role !== "ceo") {
      const { getRoleRedirectPath } = await import("@/lib/auth");
      throw redirect({ to: getRoleRedirectPath(role) });
    }
  },
  head: () => ({
    meta: [
      { title: "Executive Intelligence — Vox" },
      { name: "description", content: "Strategic KPIs, financial exposure, and root-cause clusters at a glance." },
      { property: "og:title", content: "Executive Intelligence — Vox" },
      { property: "og:description", content: "Volume, sentiment, exposure, and systemic risk in one monochromatic view." },
    ],
  }),
  component: ExecutivePortal,
});

function ExecutivePortal() {
  return (
    <VoxShell
      accent="violet"
      portalLabel="Executive"
      user={{ name: "Catherine Bell", role: "Chief Executive Officer" }}
      navItems={[
        { label: "Strategic Intelligence", icon: <LineChartIcon />, to: "/ceo", active: true },
        { label: "Risk & Exposure", icon: <ShieldCheck /> },
        { label: "Lines of Business", icon: <Building2 /> },
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Strategic intelligence
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Vox — Executive Briefing
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Week of April 14 – April 20, 2026 · Updated 4 minutes ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VoxBadge tone="resolved" dot>
              SLA on track
            </VoxBadge>
            <VoxBadge tone="p2" dot>
              2 emerging clusters
            </VoxBadge>
          </div>
        </div>

        {/* 6-grid KPIs */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            title="Volume & Velocity"
            value="1,284"
            unit="resolved"
            delta="+12.4%"
            up
            icon={Activity}
            sparkline={[24, 28, 26, 31, 33, 38, 41]}
            caption="Throughput vs. prior week"
          />
          <KpiCard
            title="Sentiment Shift"
            value="−6.2%"
            unit="negative ratio"
            delta="−1.8 pts"
            up
            inverse
            icon={TrendingDown}
            sparkline={[42, 41, 40, 38, 37, 35, 34]}
            caption="AI-detected mood, 7-day"
          />
          <KpiCard
            title="Financial Exposure"
            value="$8.4M"
            unit="accounts at risk"
            delta="+$420K"
            down
            icon={DollarSign}
            sparkline={[18, 19, 22, 24, 27, 28, 31]}
            caption="Open Voxes weighted by balance"
          />
          <KpiCard
            title="Root Cause Clusters"
            value="3"
            unit="systemic groups"
            delta="2 emerging"
            icon={Layers}
            sparkline={[2, 2, 3, 3, 4, 3, 3]}
            caption="Top: KYC, Wire ops, iOS app"
          />
          <KpiCard
            title="Avg Resolution Time"
            value="2.4d"
            unit="median"
            delta="−0.3d"
            up
            icon={Clock}
            sparkline={[34, 32, 30, 29, 28, 26, 24]}
            caption="Resolved Voxes, weekly"
          />
          <KpiCard
            title="SLA Compliance"
            value="96.8%"
            unit="within target"
            delta="+0.6 pts"
            up
            icon={ShieldCheck}
            sparkline={[92, 93, 94, 95, 96, 96, 97]}
            caption="Tier 1 + Tier 2 combined"
          />
        </div>

        {/* Wider panels */}
        <div className="grid gap-4 lg:grid-cols-5">
          <VoxCard className="p-6 lg:col-span-3">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Systemic Risk Heatmap
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">
                  Risk concentration by line of business
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Low</span>
                <div className="flex items-center gap-0.5">
                  {[0.1, 0.25, 0.45, 0.65, 0.85].map((o) => (
                    <span
                      key={o}
                      className="h-3 w-3 rounded-sm bg-slate-900"
                      style={{ opacity: o }}
                    />
                  ))}
                </div>
                <span>High</span>
              </div>
            </div>
            <Heatmap />
          </VoxCard>

          <VoxCard className="p-6 lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Top emerging themes
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">This week's signal</h2>
            <ul className="mt-5 space-y-4">
              {themes.map((t) => (
                <li key={t.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Flame className="h-3.5 w-3.5 text-amber-600" />
                      {t.label}
                    </div>
                    <span className="text-xs text-slate-500">{t.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </VoxCard>
        </div>
      </div>
    </VoxShell>
  );
}

const themes = [
  { label: "KYC re-verification delays", count: "184 Voxes", pct: 92 },
  { label: "Wire transfer compliance hold", count: "126 Voxes", pct: 72 },
  { label: "iOS 18.4 app login loop", count: "98 Voxes", pct: 58 },
  { label: "Statement reconciliation gaps", count: "61 Voxes", pct: 38 },
  { label: "ATM dispute resolution time", count: "44 Voxes", pct: 26 },
];

interface KpiProps {
  title: string;
  value: string;
  unit: string;
  delta: string;
  up?: boolean;
  down?: boolean;
  inverse?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  sparkline: number[];
  caption: string;
}

function KpiCard({ title, value, unit, delta, up, down, icon: Icon, sparkline, caption }: KpiProps) {
  return (
    <VoxCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Icon className="h-3.5 w-3.5" />
            {title}
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-slate-900">{value}</span>
            <span className="text-xs text-slate-500">{unit}</span>
          </div>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            up && "bg-emerald-50 text-emerald-700",
            down && "bg-rose-50 text-rose-700",
            !up && !down && "bg-slate-100 text-slate-700",
          )}
        >
          {up && <TrendingUp className="h-3 w-3" />}
          {down && <TrendingDown className="h-3 w-3" />}
          {delta}
        </div>
      </div>

      <div className="mt-3">
        <Sparkline points={sparkline} />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{caption}</p>
    </VoxCard>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 240;
  const h = 56;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * (h - 6) - 3;
    return [x, y] as const;
  });
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  const id = `g-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(15 23 42)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(15 23 42)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} fill="none" stroke="rgb(15 23 42)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Heatmap() {
  const rows = ["Retail", "Premier", "Business", "Wealth", "Treasury"];
  const cols = ["Payments", "Cards", "KYC", "Statements", "Digital", "Disputes"];
  // deterministic intensities 0..1
  const intensities = [
    [0.6, 0.4, 0.85, 0.3, 0.5, 0.45],
    [0.5, 0.3, 0.65, 0.4, 0.35, 0.3],
    [0.7, 0.25, 0.9, 0.55, 0.4, 0.6],
    [0.2, 0.15, 0.45, 0.3, 0.2, 0.2],
    [0.95, 0.1, 0.55, 0.25, 0.15, 0.4],
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th></th>
            {cols.map((c) => (
              <th key={c} className="px-1 pb-1 text-left text-[11px] font-medium text-slate-500">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r}>
              <th className="pr-2 text-right text-[11px] font-medium text-slate-500">{r}</th>
              {intensities[i].map((v, j) => (
                <td key={j}>
                  <div
                    className="flex h-9 items-center justify-center rounded-sm bg-slate-900 text-[10px] font-medium text-white/90"
                    style={{ opacity: 0.08 + v * 0.85 }}
                    title={`${r} · ${cols[j]}: ${(v * 100).toFixed(0)}`}
                  >
                    {Math.round(v * 100)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
