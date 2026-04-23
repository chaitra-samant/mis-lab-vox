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
  Search,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { VoxButton } from "@/components/vox/VoxButton";
import { cn } from "@/lib/utils";
import { CEO_WEEKLY_VOLUME, CEO_SENTIMENT_TREND, CEO_THEMES } from "@/lib/mock";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCEOMetrics, performSemanticSearch } from "@/lib/server/complaints";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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
      {
        name: "description",
        content: "Strategic KPIs, financial exposure, and root-cause clusters at a glance.",
      },
      { property: "og:title", content: "Executive Intelligence — Vox" },
      {
        property: "og:description",
        content: "Volume, sentiment, exposure, and systemic risk in one monochromatic view.",
      },
    ],
  }),
  component: ExecutivePortal,
});

function ExecutivePortal() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["ceo-metrics"],
    queryFn: () => getCEOMetrics(),
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("ceo-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => {
        queryClient.invalidateQueries({ queryKey: ["ceo-metrics"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      // Get complaint data for search
      const { data: complaints } = await supabase
        .from("complaints")
        .select("id, description, category, ai_analyses(*)")
        .limit(100);

      const results = await performSemanticSearch({ data: { query: searchQuery, complaintData: complaints || [] } });
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const volumeValue = metrics?.totalVolume?.toLocaleString() || "0";
  const sentimentValue = metrics ? `−${metrics.negativeRatio.toFixed(1)}%` : "0%";
  const exposureValue = metrics ? `₹${(metrics.totalExposure / 1000).toFixed(1)}K` : "₹0";

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
            value={volumeValue}
            unit="incoming voxes"
            delta="+12.4%"
            up
            icon={Activity}
            sparklineData={[24, 28, 26, 31, 33, 38, 41].map((v) => ({ value: v }))}
            caption="Throughput vs. prior week"
          />
          <KpiCard
            title="Sentiment Shift"
            value={sentimentValue}
            unit="negative ratio"
            delta="−1.8 pts"
            up
            inverse
            icon={TrendingDown}
            sparklineData={[42, 41, 40, 38, 37, 35, 34].map((v) => ({ value: v }))}
            caption="AI-detected mood, 7-day"
          />
          <KpiCard
            title="Financial Exposure"
            value={exposureValue}
            unit="accounts at risk"
            delta="+$420K"
            down
            icon={DollarSign}
            sparklineData={[18, 19, 22, 24, 27, 28, 31].map((v) => ({ value: v }))}
            caption="Open Voxes weighted by balance"
          />
          <KpiCard
            title="Root Cause Clusters"
            value="3"
            unit="systemic groups"
            delta="2 emerging"
            icon={Layers}
            sparklineData={[2, 2, 3, 3, 4, 3, 3].map((v) => ({ value: v }))}
            caption="Top: KYC, Wire ops, iOS app"
          />
          <KpiCard
            title="Avg Resolution Time"
            value="2.4d"
            unit="median"
            delta="−0.3d"
            up
            icon={Clock}
            sparklineData={[34, 32, 30, 29, 28, 26, 24].map((v) => ({ value: v }))}
            caption="Resolved Voxes, weekly"
          />
          <KpiCard
            title="SLA Compliance"
            value="96.8%"
            unit="within target"
            delta="+0.6 pts"
            up
            icon={ShieldCheck}
            sparklineData={[92, 93, 94, 95, 96, 96, 97].map((v) => ({ value: v }))}
            caption="Tier 1 + Tier 2 combined"
          />
        </div>

        {/* Semantic Search Integration */}
        <div className="mt-8">
          <VoxCard className="p-6">
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Semantic Search
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">
                Ask questions about complaint patterns
              </h2>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && performSearch()}
                  placeholder="e.g., What caused the most financial loss last month?"
                  className="w-full rounded-md border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <VoxButton onClick={performSearch} size="sm" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </VoxButton>
            </div>

            {searchResults && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <p className="text-sm leading-relaxed text-slate-700">{searchResults.summary}</p>
                  {searchResults.relevant_complaint_ids.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        Relevant Voxes:
                      </span>
                      {searchResults.relevant_complaint_ids.map((id: string) => (
                        <span
                          key={id}
                          className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600"
                        >
                          {id.split("-")[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </VoxCard>
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

const themes = CEO_THEMES;

interface KpiProps {
  title: string;
  value: string;
  unit: string;
  delta: string;
  up?: boolean;
  down?: boolean;
  inverse?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  sparklineData: { value: number }[];
  caption: string;
}

function KpiCard({
  title,
  value,
  unit,
  delta,
  up,
  down,
  icon: Icon,
  sparklineData,
  caption,
}: KpiProps) {
  return (
    <VoxCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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
          {up && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
          {down && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
          {delta}
        </div>
      </div>

      <div className="mt-3 h-12" role="img" aria-label={`${title} trend chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title.replace(/\s/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(15 23 42)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="rgb(15 23 42)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="rgb(15 23 42)"
              strokeWidth={1.4}
              fill={`url(#grad-${title.replace(/\s/g, "-")})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{caption}</p>
    </VoxCard>
  );
}

function Heatmap() {
  const rows = ["Retail", "Premier", "Business", "Wealth", "Treasury"];
  const cols = ["Payments", "Cards", "KYC", "Statements", "Digital", "Disputes"];
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
