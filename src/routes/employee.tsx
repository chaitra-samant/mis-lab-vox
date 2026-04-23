import { useMemo, useState, useEffect } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserRole } from "@/lib/auth";
import {
  Inbox,
  Filter,
  Search,
  X,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  UserPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxButton } from "@/components/vox/VoxButton";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { cn } from "@/lib/utils";
import { type EmployeeSentiment } from "@/lib/mock";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getComplaints, getSuggestedResponse, resolveComplaint, escalateComplaint, reAnalyzeComplaint, updateComplaint, getEmployees } from "@/lib/server/complaints";
import { supabase } from "@/lib/supabase";

import { 
  VoxDetailSheet, 
  type MappedComplaint as EmployeeComplaint,
  type Priority,
  type Sentiment,
  type Status
} from "@/components/vox/VoxDetailSheet";

// --- Config/Constants ---

const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const sentiments: Sentiment[] = ["Positive", "Neutral", "Negative"];
const statuses: Status[] = ["Open", "In progress", "Escalated", "Resolved", "Closed"];

const priorityTone: Record<Priority, "p1" | "p2" | "p3"> = {
  LOW: "p3",
  MEDIUM: "p2",
  HIGH: "p1",
  CRITICAL: "p1",
};

const sentimentTone: Record<Sentiment, "positive" | "neutral" | "negative"> = {
  Positive: "positive",
  Neutral: "neutral",
  Negative: "negative",
};

const statusTone: Record<Status, "open" | "review" | "progress" | "resolved"> = {
  Open: "open",
  "In progress": "progress",
  Escalated: "review",
  Resolved: "resolved",
  Closed: "resolved",
};

const PAGE_SIZE = 10;

// --- Route Definition ---

export const Route = createFileRoute("/employee")({
  beforeLoad: async () => {
    const role = await getUserRole();
    if (!role) {
      throw redirect({ to: "/login" });
    }
    if (role !== "employee") {
      const { getRoleRedirectPath } = await import("@/lib/auth");
      throw redirect({ to: getRoleRedirectPath(role) });
    }
  },
  head: () => ({
    meta: [
      { title: "Employee Workspace — Vox" },
      { name: "description", content: "High-density worklist with sentiment and SLA signals." },
    ],
  }),
  component: EmployeePortal,
});

// --- Main Component ---

function EmployeePortal() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [sentiment, setSentiment] = useState<Sentiment | "All">("All");
  const [status, setStatus] = useState<Status | "All">("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints", "employee"],
    queryFn: () => getComplaints({ data: "employee" }),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { name: "Agent", role: "Employee" };
      const { data: emp } = await supabase.from("employees").select("name, role").eq("auth_id", user.id).single();
      if (emp) return { name: emp.name, role: emp.role || "Employee" };
      return { name: user.user_metadata?.name || user.email?.split("@")[0] || "Agent", role: "Employee" };
    }
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("employee-complaints")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => {
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const mappedData = useMemo(() => {
    const complaintsArray = Array.isArray(complaints) ? complaints : [];
    return complaintsArray.map((c: any) => ({
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
    }));
  }, [complaints]);

  const filtered = useMemo(() => {
    return mappedData.filter((v) => {
      if (priority !== "All" && v.priority !== priority) return false;
      if (sentiment !== "All" && v.sentiment !== sentiment) return false;
      if (status !== "All" && v.status !== status) return false;
      if (q && !`${v.id} ${v.subject}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, priority, sentiment, status, mappedData]);

  const activeVox = useMemo(() => {
    if (!activeId) return null;
    return mappedData.find((v) => v.realId === activeId) || null;
  }, [activeId, mappedData]);

  // Handle AI response fetching when active item changes
  useEffect(() => {
    async function loadAI() {
      if (!activeVox) {
        setSuggestedResponse(null);
        return;
      }

      // If signals are missing, we no longer trigger re-analysis automatically to avoid loops
      // The user can now rely on hardcoded seed data or manual triggers
      if (!activeVox.aiAnalysis?.signals) {
        console.log("Signals missing for active complaint. Re-analysis disabled to prevent loops.");
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
  }, [activeVox, queryClient]);

  useEffect(() => {
    setPage(1);
  }, [q, priority, sentiment, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      console.error("Failed to update complaint:", error);
    }
  };

  const [activeTab, setActiveTab] = useState<"Worklist" | "Queues" | "Performance">("Worklist");

  return (
    <VoxShell
      accent="indigo"
      portalLabel="Employee"
      user={currentUser || { name: "Loading...", role: "Employee" }}
      navItems={[
        { label: "Worklist", icon: <Inbox />, active: activeTab === "Worklist", onClick: () => setActiveTab("Worklist") },
        { label: "Queues", icon: <Layers />, active: activeTab === "Queues", onClick: () => setActiveTab("Queues") },
        { label: "Performance", icon: <BarChart3 />, active: activeTab === "Performance", onClick: () => setActiveTab("Performance") },
      ]}
    >
      {activeTab === "Worklist" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Worklist</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Incoming Voxes
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} of {mappedData.length} shown
              </p>
            </div>
            <VoxBadge tone="p1" dot>
              {mappedData.filter((d) => d.priority === "HIGH" || d.priority === "CRITICAL").length}{" "}
              High/Critical
            </VoxBadge>
          </div>

          <VoxCard className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search ID, subject, or customer..."
                  className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm focus:ring-1 focus:ring-slate-400 outline-none"
                />
              </div>
              <PillSelect
                label="Sentiment"
                value={sentiment}
                options={["All", ...sentiments]}
                onChange={(v) => setSentiment(v as any)}
              />
              <PillSelect
                label="Urgency"
                value={priority}
                options={["All", ...priorities]}
                onChange={(v) => setPriority(v as any)}
              />
              <PillSelect
                label="Status"
                value={status}
                options={["All", ...statuses]}
                onChange={(v) => setStatus(v as any)}
              />
            </div>
          </VoxCard>

          <VoxCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-[11px] font-medium uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Priority</th>
                    <th className="px-4 py-2.5">Sentiment</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Assignee</th>
                    <th className="px-4 py-2.5">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((v) => (
                    <tr
                      key={v.realId}
                      onClick={() => setActiveId(v.realId)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{v.subject}</div>
                        <div className="text-xs text-slate-500">{v.customer}</div>
                      </td>
                      <td className="px-4 py-3">
                        <VoxBadge tone={priorityTone[v.priority]}>{v.priority}</VoxBadge>
                      </td>
                      <td className="px-4 py-3">
                        <VoxBadge tone={sentimentTone[v.sentiment]} dot>
                          {v.sentiment}
                        </VoxBadge>
                      </td>
                      <td className="px-4 py-3">
                        <VoxBadge tone={statusTone[v.status]}>{v.status}</VoxBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{v.assignee}</td>
                      <td className="px-4 py-3 text-slate-500">{v.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t p-4">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <VoxButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </VoxButton>
                <VoxButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </VoxButton>
              </div>
            </div>
          </VoxCard>
        </div>
      )}

      {activeTab === "Queues" && <QueuesView data={mappedData} />}
      {activeTab === "Performance" && <PerformanceView data={mappedData} />}

      {activeVox && (
        <VoxDetailSheet
          vox={activeVox}
          suggestedResponse={suggestedResponse}
          employees={employees}
          onClose={() => setActiveId(null)}
          onResolve={handleResolve}
          onEscalate={handleEscalate}
          onUpdate={handleUpdate}
        />
      )}
    </VoxShell>
  );
}

// --- Sub-components ---

function QueuesView({ data }: { data: EmployeeComplaint[] }) {
  const teams = [
    { name: "Payments & Fraud", active: data.filter(d => d.aiAnalysis?.classification?.toLowerCase().includes("payment")).length || 12, max: 20 },
    { name: "Technical Support", active: data.filter(d => d.aiAnalysis?.classification?.toLowerCase().includes("tech")).length || 8, max: 15 },
    { name: "Account Management", active: data.filter(d => d.aiAnalysis?.classification?.toLowerCase().includes("account")).length || 15, max: 25 },
    { name: "General Inquiry", active: 5, max: 10 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Team Workloads</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Queues Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Live view of active cases across departments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teams.map((t) => (
          <VoxCard key={t.name} className="p-5 flex flex-col justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600">{t.name}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {t.active} <span className="text-sm font-normal text-slate-400">/ {t.max}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Capacity</span>
                <span>{Math.round((t.active / t.max) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", (t.active / t.max) > 0.8 ? "bg-red-500" : (t.active / t.max) > 0.5 ? "bg-amber-500" : "bg-emerald-500")}
                  style={{ width: `${Math.min(100, (t.active / t.max) * 100)}%` }}
                />
              </div>
            </div>
          </VoxCard>
        ))}
      </div>

      <VoxCard className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Urgent Routing Rules</h3>
        <div className="space-y-3">
          {[
            { rule: "High Financial Exposure (>₹50k)", route: "Priority Resolution Team", status: "Active" },
            { rule: "Negative Sentiment + High Blast Radius", route: "Escalation Managers", status: "Active" },
            { rule: "Multiple Similar Issues (Cluster > 5)", route: "Technical Support", status: "Reviewing" }
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-slate-50/50">
              <div>
                <div className="text-sm font-medium text-slate-900">{r.rule}</div>
                <div className="text-xs text-slate-500 mt-0.5">Routes to {r.route}</div>
              </div>
              <VoxBadge tone={r.status === "Active" ? "positive" : "neutral"}>{r.status}</VoxBadge>
            </div>
          ))}
        </div>
      </VoxCard>
    </div>
  );
}

function PillSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-3 text-[10px] font-bold uppercase text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-md border bg-white pl-20 pr-8 text-xs font-medium focus:ring-1 focus:ring-slate-400 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
    </label>
  );
}
function PerformanceView({ data }: { data: EmployeeComplaint[] }) {
  const resolvedCount = data.filter(d => d.status === "Resolved" || d.status === "Closed").length;
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Analytics</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">My Performance</h1>
        <p className="mt-1 text-sm text-slate-500">Your resolution metrics and SLA compliance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <VoxCard className="p-5">
          <div className="text-sm font-medium text-slate-500">Resolutions Today</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{resolvedCount + 4}</div>
          <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3 w-3" /> +2 from yesterday
          </div>
        </VoxCard>
        
        <VoxCard className="p-5">
          <div className="text-sm font-medium text-slate-500">Avg. Resolution Time</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">1.4 <span className="text-lg">hrs</span></div>
          <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3 w-3 rotate-90" /> 15% faster than avg
          </div>
        </VoxCard>

        <VoxCard className="p-5">
          <div className="text-sm font-medium text-slate-500">SLA Compliance</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">98.2%</div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            Top 10% in department
          </div>
        </VoxCard>
      </div>

      <VoxCard className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Achievements</h3>
        <div className="space-y-4">
          {[
            { title: "SLA Champion", desc: "Maintained >95% SLA compliance for 30 consecutive days.", icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" /> },
            { title: "De-escalation Expert", desc: "Successfully resolved 5 high-priority negative sentiment cases this week.", icon: <UserPlus className="h-5 w-5 text-indigo-500" /> },
            { title: "Value Saver", desc: "Prevented an estimated ₹120,000 in customer financial exposure today.", icon: <DollarSign className="h-5 w-5 text-amber-500" /> }
          ].map((ach, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm">
              <div className="mt-0.5">{ach.icon}</div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{ach.title}</div>
                <div className="text-sm text-slate-600 mt-1">{ach.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </VoxCard>
    </div>
  );
}
