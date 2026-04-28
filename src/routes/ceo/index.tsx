import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserRole } from "@/lib/auth";
import {
  LineChart as LineChartIcon,
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  ShieldCheck,
  Flame,
  Building2,
  Search,
  IndianRupee,
  Terminal,
  Key,
  Webhook,
  Copy,
  RefreshCw,
  Trash2,
  Zap,
  Check,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { VoxButton } from "@/components/vox/VoxButton";
import { cn } from "@/lib/utils";
import { CEO_WEEKLY_VOLUME, CEO_SENTIMENT_TREND, CEO_THEMES, CEO_API_KEYS, CEO_API_USAGE } from "@/lib/mock";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VoxDetailSheet, type MappedComplaint, type Priority, type Sentiment, type Status } from "@/components/vox/VoxDetailSheet";
import { getCEOMetrics, performSemanticSearch, getComplaints, escalateComplaint, resolveComplaint, updateComplaint, getEmployees, getSuggestedResponse, generateBusinessHealthReport, sendMessage } from "@/lib/server/complaints";
import { generatePDFReport } from "@/lib/pdf-report";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";

export const Route = createFileRoute("/ceo/")({
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

function APIEndpointsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState<"idle" | "success">("idle");
  const [showToken, setShowToken] = useState(false);
  const orgToken = "vox_live_org_7a9f2e3d8c1b4e9a2f6d5c8b0a1e3f";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePing = () => {
    setIsPinging(true);
    toast.info("Sending ping to webhook URL...");
    setTimeout(() => {
      setIsPinging(false);
      setPingStatus("success");
      toast.success("Webhook endpoint acknowledged (200 OK)");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Infrastructure</p>
            <VoxBadge className="bg-violet-600 text-white border-none">Pro Tier</VoxBadge>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">API Endpoints</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Seamlessly integrate Vox intelligence into your own customer-facing platforms.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plan</div>
          <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 px-4 py-2 rounded-lg">
            <span className="text-xs font-bold text-violet-700">Enterprise Pro</span>
            <span className="h-4 w-px bg-violet-200" />
            <span className="text-xs font-semibold text-violet-600">₹14,999/mo</span>
          </div>
        </div>
      </div>

      {/* Org Token Section */}
      <VoxCard className="p-6 border-l-4 border-l-violet-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-violet-500" />
              Organization Bearer Token
            </h2>
            <p className="text-xs text-slate-500 mt-1">This token is unique to AuraBank and should be kept confidential. Use it in the <code className="bg-slate-100 px-1 rounded">Authorization</code> header.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-[450px]">
            <div className="relative flex-1 group">
              <input 
                type={showToken ? "text" : "password"} 
                readOnly 
                value={orgToken} 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-12 py-2.5 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
              <button 
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showToken ? "Hide Token" : "Show Token"}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <VoxButton 
              variant="outline" 
              className="gap-2 shrink-0 h-[42px]"
              onClick={() => handleCopy(orgToken, 'org-token')}
            >
              {copied === 'org-token' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied === 'org-token' ? "Copied" : "Copy"}
            </VoxButton>
          </div>
        </div>
      </VoxCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Endpoints List */}
          <VoxCard className="p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-violet-500" />
                Service Endpoints
              </h2>
              <p className="text-xs text-slate-500 mt-1">Available methods for your integration.</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">POST</span>
                    <span className="text-sm font-mono font-bold text-slate-900">/v1/complaints</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Limit: 10,000 / mo</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingest customer complaints directly into Vox from your custom UI or mobile app. 
                  Automatically triggers AI analysis and sentiment detection.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">GET</span>
                    <span className="text-sm font-mono font-bold text-slate-900">/v1/status/&#123;id&#125;</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Limit: 50,000 / mo</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Retrieve real-time status updates and AI-generated insights for a specific complaint ID. 
                  Use this to power "Track my Vox" features in your client portal.
                </p>
              </div>
            </div>
          </VoxCard>

          {/* API Keys */}
          <VoxCard className="p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-violet-500" />
                Active API Keys
              </h2>
            </div>
            <div className="space-y-4">
              {CEO_API_KEYS.map((k) => (
                <div key={k.key} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 group hover:border-violet-200 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{k.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1 select-all">{k.key}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Created {k.created}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{k.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleCopy(k.key, k.key)}
                      className="p-2 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-violet-600"
                      title="Copy Key"
                    >
                      {copied === k.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button className="p-2 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-violet-600" title="Rotate Key">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-rose-50 rounded-md transition-colors text-slate-400 hover:text-rose-600" title="Revoke Access">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </VoxCard>
        </div>

        <div className="space-y-6">
          {/* Usage Chart */}
          <VoxCard className="p-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-violet-500" />
              API Traffic Volume
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CEO_API_USAGE} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#usageGrad)" 
                    strokeWidth={2} 
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Billing Cycle</p>
                <p className="text-2xl font-bold text-slate-900">38,700</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Usage</p>
                <p className="text-sm font-medium text-violet-600">77.4% of limit</p>
              </div>
            </div>
          </VoxCard>

          {/* Webhooks */}
          <VoxCard className="p-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Webhook className="h-5 w-5 text-violet-500" />
              Event Webhooks
            </h2>
            <p className="text-xs text-slate-500 mb-4">Receive push notifications for state changes.</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Production URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value="https://hooks.mybank.com/vox" 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none"
                  />
                  <VoxButton 
                    size="sm" 
                    variant="outline" 
                    className="text-[10px] h-auto py-1 px-3"
                    onClick={handlePing}
                    disabled={isPinging}
                  >
                    {isPinging ? "Pinging..." : "Ping"}
                  </VoxButton>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 text-[10px] font-medium rounded-full px-3 py-1.5 w-fit border transition-all duration-500",
                pingStatus === "success" 
                  ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                  : "text-slate-400 bg-slate-50 border-slate-100"
              )}>
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  pingStatus === "success" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                )} />
                {pingStatus === "success" ? "Endpoint verified: 200 OK" : "Waiting for ping..."}
              </div>
            </div>
          </VoxCard>
        </div>
      </div>
    </div>
  );
}

function ExecutivePortal() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"Strategic Intelligence" | "Escalated Voxes" | "Department Analytics" | "API Endpoints">("Strategic Intelligence");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees(),
  });

  const { data: allComplaints = [] } = useQuery({
    queryKey: ["complaints", "ceo"],
    queryFn: () => getComplaints({ data: "ceo" }),
  });

  const escalatedComplaints = useMemo(() => {
    const complaintsArray = Array.isArray(allComplaints) ? allComplaints : [];
    return complaintsArray.filter((c: any) => c.status === "ESCALATED" || c.escalated);
  }, [allComplaints]);

  const activeVox = useMemo(() => {
    if (!activeId || !escalatedComplaints) return null;
    const c = escalatedComplaints.find((c: any) => c.id === activeId);
    if (!c) return null;
    return {
      id: c.id.split("-").pop().toUpperCase().slice(-8),
      realId: c.id,
      subject: c.description.slice(0, 50) + (c.description.length > 50 ? "..." : ""),
      priority: (c.priority || "MEDIUM") as Priority,
      sentiment: ((Array.isArray(c.ai_analyses) ? c.ai_analyses[0]?.sentiment : c.ai_analyses?.sentiment) || "Neutral") as Sentiment,
      status: (c.status.charAt(0) + c.status.slice(1).toLowerCase().replace("_", " ")) as Status,
      assignee: c.employees?.name || "Unassigned",
      assigneeId: c.assigned_to || null,
      customer: "Customer",
      account: "AuraBank Account",
      exposure: c.financial_loss_customer ? `₹${c.financial_loss_customer}` : "₹0",
      channel: c.source === "web_form" ? "Web" : "API",
      ts: new Date(c.created_at).toLocaleString(),
      body: c.description,
      aiAnalysis: Array.isArray(c.ai_analyses) ? c.ai_analyses[0] : c.ai_analyses,
      messages: c.messages || [],
    } as MappedComplaint;
  }, [activeId, escalatedComplaints]);

  const departmentData = useMemo(() => {
    const cats: Record<string, { volume: number, exposure: number }> = {};
    allComplaints.forEach((c: any) => {
      const cat = c.category || "Uncategorized";
      if (!cats[cat]) cats[cat] = { volume: 0, exposure: 0 };
      cats[cat].volume += 1;
      const loss = Number(c.financial_loss_customer) || 0;
      cats[cat].exposure += loss;
    });
    return Object.entries(cats)
      .map(([name, data]) => ({
        name,
        volume: data.volume,
        exposure: data.exposure,
      }))
      .sort((a, b) => b.exposure - a.exposure);
  }, [allComplaints]);

  useEffect(() => {
    async function loadAI() {
      if (!activeVox) {
        setSuggestedResponse(null);
        return;
      }
      if (activeVox.aiAnalysis) {
        const response = await getSuggestedResponse({
          data: {
            category: activeVox.aiAnalysis.classification,
            sentiment: activeVox.aiAnalysis.sentiment,
            urgency: activeVox.aiAnalysis.urgency,
            summary: activeVox.aiAnalysis.summary,
          },
        });
        setSuggestedResponse(response);
      } else {
        setSuggestedResponse(null);
      }
    }
    loadAI();
  }, [activeVox]);

  const handleResolve = async (id: string) => {
    try {
      await resolveComplaint({ data: { id } });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setActiveId(null);
    } catch (error) {
      console.error("Failed to resolve complaint:", error);
    }
  };

  const handleEscalate = async (id: string) => {
    try {
      await escalateComplaint({ data: { id } });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setActiveId(null);
    } catch (error) {
      console.error("Failed to escalate complaint:", error);
    }
  };

  const handleUpdate = async (id: string, updates: { status?: string; assigned_to?: string | null }) => {
    try {
      await updateComplaint({ data: { id, ...updates } });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    } catch (error) {
      toast.error("Failed to update complaint");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeId) return;
    try {
      await sendMessage({ data: { complaintId: activeId, role: "employee", content } });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

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

  const handleDownloadReport = async () => {
    setIsGeneratingReport(true);
    const toastId = toast.loading("Analyzing business health and generating report...");
    try {
      const themesForReport = themes.map(t => ({
        label: t.label,
        count: t.count,
        pct: t.pct
      }));

      const reportData = await generateBusinessHealthReport({ data: { themes: themesForReport } });
      await generatePDFReport(reportData);
      toast.success("Business Health Report downloaded successfully", { id: toastId });
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report. Please try again.", { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const volumeValue = metrics?.totalVolume?.toLocaleString() || "0";
  const sentimentValue = metrics?.avgSentiment !== undefined ? metrics.avgSentiment.toFixed(2) : "0.00";
  const exposureValue = metrics ? `₹${(metrics.totalExposure / 1000).toFixed(1)}K` : "₹0";

  return (
    <VoxShell
      accent="violet"
      portalLabel="Executive"
      user={{ name: "Catherine Bell", role: "Chief Executive Officer" }}
      navItems={[
        { label: "Strategic Intelligence", icon: <LineChartIcon />, active: activeTab === "Strategic Intelligence", onClick: () => setActiveTab("Strategic Intelligence") },
        { label: "Escalated Voxes", icon: <ShieldCheck />, active: activeTab === "Escalated Voxes", onClick: () => setActiveTab("Escalated Voxes") },
        { label: "Department Analytics", icon: <Building2 />, active: activeTab === "Department Analytics", onClick: () => setActiveTab("Department Analytics") },
        { label: "API Endpoints", icon: <Terminal />, active: activeTab === "API Endpoints", onClick: () => setActiveTab("API Endpoints"), badge: "PRO", isPro: true },
      ]}
      contentClassName={activeTab === "API Endpoints" ? "min-h-[calc(100vh-64px)]" : ""}
    >
      {activeTab === "Strategic Intelligence" && (
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
            <VoxButton 
              variant="outline" 
              size="sm" 
              className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={handleDownloadReport}
              disabled={isGeneratingReport}
            >
              <Download className="h-4 w-4" />
              {isGeneratingReport ? "Generating Report..." : "Business Health Report"}
            </VoxButton>
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
            unit="avg sentiment"
            delta="−0.18 pts"
            up
            inverse
            icon={TrendingDown}
            sparklineData={[0.42, 0.41, 0.40, 0.38, 0.37, 0.35, 0.34].map((v) => ({ value: v }))}
            caption="AI-detected mood, 7-day"
          />
          <KpiCard
            title="Financial Exposure"
            value={exposureValue}
            unit="accounts at risk"
            delta="+₹420K"
            down
            icon={IndianRupee}
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
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                    <p className="text-sm leading-relaxed text-slate-700 font-medium">
                      {typeof searchResults.summary === 'string' 
                        ? searchResults.summary 
                        : (searchResults.summary?.message || searchResults.summary?.text || JSON.stringify(searchResults.summary))}
                    </p>
                  </div>
                  
                  {searchResults.strategic_suggestions && searchResults.strategic_suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60">
                      <p className="text-[10px] font-bold uppercase tracking-tight text-violet-600 mb-3 flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3" />
                        Executive Strategic Suggestions
                      </p>
                      <ul className="space-y-3">
                        {searchResults.strategic_suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-white/50 p-2.5 rounded-md border border-slate-100">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600 shrink-0">
                              {idx + 1}
                            </span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {searchResults.relevant_complaint_ids.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        Evidence (Vox IDs):
                      </span>
                      {Array.from(new Set(searchResults.relevant_complaint_ids)).map((id: any, idx: number) => (
                        <span
                          key={`${id}-${idx}`}
                          className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600"
                        >
                          {typeof id === 'string' ? id.split("-")[0] : `Ref-${idx}`}
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
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                    <span
                      key={o}
                      className={`h-3 w-3 rounded-sm ${
                        o < 0.2 ? "bg-slate-200" :
                        o < 0.4 ? "bg-violet-300" :
                        o < 0.6 ? "bg-violet-400" :
                        o < 0.8 ? "bg-violet-500" : "bg-slate-800"
                      }`}
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
                      {t.label}
                    </div>
                    <span className="text-xs text-slate-500">{t.count}</span>
                  </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-violet-600"
                style={{ width: `${t.pct}%` }}
              />
            </div>
                </li>
              ))}
            </ul>
          </VoxCard>
        </div>
      </div>
      )}

      {activeTab === "Escalated Voxes" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Critical Issues</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Escalated Voxes</h1>
            <p className="mt-1 text-sm text-slate-500">Requires executive review and intervention.</p>
          </div>
          
          {escalatedComplaints.length === 0 ? (
            <VoxCard className="p-12 text-center text-slate-500">No escalated Voxes at this time.</VoxCard>
          ) : (
            <div className="grid gap-4">
              {escalatedComplaints.map((c: any) => {
                const loss = Number(c.financial_loss_customer) || 0;
                return (
                  <VoxCard key={c.id} className="p-5 border-l-4 border-violet-500 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-400">{c.id.split("-").pop().toUpperCase().slice(-8)}</span>
                          <VoxBadge tone="p1">Escalated</VoxBadge>
                          {loss > 0 && (
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              Exposure: ₹{loss.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg leading-tight mt-2">{c.description.slice(0, 80)}...</h3>
                        <p className="text-sm text-slate-500 mt-2">{c.escalation_reason || "Escalated for review."}</p>
                      </div>
                      <VoxButton size="sm" variant="secondary" onClick={() => setActiveId(c.id)}>Review Details</VoxButton>
                    </div>
                  </VoxCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "Department Analytics" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Analytics</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Department Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">Volume and financial exposure breakdown by category.</p>
          </div>
          
          {departmentData.length === 0 ? (
            <VoxCard className="p-12 text-center text-slate-500">No departmental data available.</VoxCard>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <VoxCard className="p-6">
                <h3 className="mb-6 text-base font-semibold text-slate-900">Financial Exposure by Department</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} stroke="#94a3b8" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                      <Tooltip 
                        formatter={(val: number) => [`₹${val.toLocaleString()}`, "Exposure"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="exposure" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </VoxCard>

              <VoxCard className="p-6">
                <h3 className="mb-6 text-base font-semibold text-slate-900">Complaint Volume by Department</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis type="number" stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        formatter={(val: number) => [val, "Volume"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32}>
                        {departmentData.map((entry, index) => (
                          <cell key={`cell-${index}`} fill={index === 0 ? "#7c3aed" : "#a78bfa"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </VoxCard>
              
              <VoxCard className="p-0 overflow-hidden lg:col-span-2">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Detailed Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Department / Category</th>
                        <th className="px-6 py-4 font-medium">Total Complaints</th>
                        <th className="px-6 py-4 font-medium text-right">Financial Exposure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departmentData.map((row) => (
                        <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                          <td className="px-6 py-4 text-slate-600">{row.volume}</td>
                          <td className="px-6 py-4 text-right font-medium text-rose-600">₹{row.exposure.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </VoxCard>
            </div>
          )}
        </div>
      )}

      {activeTab === "API Endpoints" && <APIEndpointsPage />}

      {activeVox && (
        <VoxDetailSheet
          vox={activeVox}
          suggestedResponse={suggestedResponse}
          employees={employees}
          onClose={() => setActiveId(null)}
          onResolve={handleResolve}
          onEscalate={handleEscalate}
          onUpdate={handleUpdate}
          onSendMessage={handleSendMessage}
        />
      )}
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
            <Icon className="h-4 w-4" aria-hidden="true" />
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
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={1.8}
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

  const getColorClass = (v: number) => {
    if (v < 0.2) return "bg-slate-200 text-transparent";
    if (v < 0.4) return "bg-violet-300 text-white";
    if (v < 0.6) return "bg-violet-400 text-white";
    if (v < 0.8) return "bg-violet-500 text-white";
    return "bg-slate-800 text-white";
  };

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
                    className={`flex h-9 items-center justify-center rounded-sm text-[10px] font-medium ${getColorClass(v)}`}
                    title={`${r} · ${cols[j]}: ${(v * 100).toFixed(0)}`}
                  >
                    {v >= 0.2 ? Math.round(v * 100) : ""}
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
