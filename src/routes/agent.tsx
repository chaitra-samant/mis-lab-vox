import { useMemo, useState } from "react";
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
import { MOCK_AGENT_COMPLAINTS, type AgentPriority, type AgentSentiment, type AgentStatus } from "@/lib/mock";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getComplaints } from "@/lib/server/complaints";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export const Route = createFileRoute("/agent")({
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
      { title: "Agent Workspace — Vox" },
      { name: "description", content: "High-density worklist with sentiment, urgency, and SLA signals built-in." },
      { property: "og:title", content: "Agent Workspace — Vox" },
      { property: "og:description", content: "Triage, route, and resolve customer Voxes with focus." },
    ],
  }),
  component: AgentPortal,
});

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Sentiment = AgentSentiment;
type Status = "Open" | "In progress" | "Escalated" | "Resolved" | "Closed";

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


function AgentPortal() {
  const queryClient = useQueryClient();
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints", "agent"],
    queryFn: () => getComplaints("employee"),
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("agent-complaints")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => {
          console.log("Real-time update: Refreshing complaints...");
          queryClient.invalidateQueries({ queryKey: ["complaints"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [sentiment, setSentiment] = useState<Sentiment | "All">("All");
  const [status, setStatus] = useState<Status | "All">("All");
  const [active, setActive] = useState<any | null>(null);
  const [page, setPage] = useState(1);

  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  // Map Supabase data to Vox type
  const mappedData = useMemo(() => {
    return complaintsArray.map((c: any) => ({
      id: c.id.split("-")[0].toUpperCase(),
      realId: c.id,
      subject: c.description.slice(0, 50) + (c.description.length > 50 ? "..." : ""),
      priority: (c.priority || "MEDIUM") as Priority,
      sentiment: (c.ai_analyses?.[0]?.sentiment || "Neutral") as Sentiment,
      status: (c.status.charAt(0) + c.status.slice(1).toLowerCase().replace("_", " ")) as Status,
      assignee: c.assigned_to || "Unassigned",
      customer: "Customer", // In a real app, join with customers table
      account: "AuraBank Account",
      exposure: c.financial_loss_customer ? `₹${c.financial_loss_customer}` : "₹0",
      channel: c.source === "web_form" ? "Web" : "API",
      ts: new Date(c.created_at).toLocaleString(),
      body: c.description,
      aiAnalysis: c.ai_analyses?.[0]
    }));
  }, [complaintsArray]);

  const filtered = useMemo(() => {
    setPage(1);
    return mappedData.filter((v: any) => {
      if (priority !== "All" && v.priority !== priority) return false;
      if (sentiment !== "All" && v.sentiment !== sentiment) return false;
      if (status !== "All" && v.status !== status) return false;
      if (q && !`${v.id} ${v.subject}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, priority, sentiment, status, mappedData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <VoxShell
      accent="indigo"
      portalLabel="Agent"
      user={{ name: "Jordan Morgan", role: "Senior Resolution Agent" }}
      navItems={[
        { label: "Worklist", icon: <Inbox />, to: "/agent", active: true },
        { label: "Queues", icon: <Layers /> },
        { label: "Performance", icon: <BarChart3 /> },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Worklist</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Incoming Voxes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length} of {mappedData.length} shown · sorted by priority then time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VoxBadge tone="p1" dot>
              {mappedData.filter((d: any) => d.priority === "HIGH" || d.priority === "CRITICAL").length} High/Critical
            </VoxBadge>
          </div>
        </div>

        {/* Filter bar */}
        <VoxCard className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="agent-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, subject, or customer…"
                aria-label="Search complaints by ID, subject, or customer"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <PillSelect label="Sentiment" value={sentiment} options={["All", ...sentiments]} onChange={(v) => setSentiment(v as any)} />
            <PillSelect label="Urgency" value={priority} options={["All", ...priorities]} onChange={(v) => setPriority(v as any)} />
            <PillSelect label="Status" value={status} options={["All", ...statuses]} onChange={(v) => setStatus(v as any)} />
            {(priority !== "All" || sentiment !== "All" || status !== "All" || q) && (
              <button
                onClick={() => {
                  setPriority("All");
                  setSentiment("All");
                  setStatus("All");
                  setQ("");
                }}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
            <VoxButton variant="secondary" size="sm" className="ml-auto">
              <Filter className="h-3.5 w-3.5" /> Saved views
            </VoxButton>
          </div>
        </VoxCard>

        {/* Worklist table */}
        <VoxCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2.5 font-medium">ID</th>
                  <th className="px-4 py-2.5 font-medium">Subject</th>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium">Sentiment</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Assignee</th>
                  <th className="px-4 py-2.5 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody id="agent-complaints-table-body">
                {paginated.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => setActive(v)}
                    className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{v.subject}</div>
                      <div className="text-xs text-slate-500">
                        {v.customer} · {v.account}
                      </div>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                      No Voxes match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div
            role="navigation"
            aria-label="Complaints pagination"
            className="flex items-center justify-between border-t border-slate-200/60 px-4 py-3"
          >
            <span className="text-xs text-slate-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                id="agent-pagination-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-medium text-slate-700">{page} / {totalPages}</span>
              <button
                id="agent-pagination-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </VoxCard>
      </div>

      {active && <VoxDetailSheet vox={active} onClose={() => setActive(null)} />}
    </VoxShell>
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
      <span className="pointer-events-none absolute left-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white pl-[68px] pr-8 text-xs font-medium text-slate-800 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
    </label>
  );
}

function VoxDetailSheet({ vox, onClose }: { vox: Vox; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-200/60 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 px-6 py-5">
          <div>
            <div className="font-mono text-xs text-slate-400">{vox.id}</div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">{vox.subject}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <VoxBadge tone={priorityTone[vox.priority]}>{vox.priority}</VoxBadge>
              <VoxBadge tone={sentimentTone[vox.sentiment]} dot>
                {vox.sentiment}
              </VoxBadge>
              <VoxBadge tone={statusTone[vox.status]}>{vox.status}</VoxBadge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="grid grid-cols-2 gap-4 border-b border-slate-200/60 pb-5">
            <Field label="Customer" value={vox.customer} />
            <Field label="Account" value={vox.account} />
            <Field label="Exposure" value={vox.exposure} />
            <Field label="Channel" value={vox.channel} />
            <Field label="Assignee" value={vox.assignee} />
            <Field label="Updated" value={vox.ts} />
          </dl>

          <div className="mt-5">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Customer narrative
            </div>
            <p className="mt-2 rounded-md border border-slate-200/60 bg-slate-50/60 p-3 text-sm leading-relaxed text-slate-700">
              {vox.body}
            </p>
          </div>

          <div className="mt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
              AI signals
            </div>
            {vox.aiAnalysis ? (
              <div className="mt-3 space-y-4">
                <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-tight text-slate-400">AI Summary</div>
                  <p className="mt-1 text-sm text-slate-700 leading-snug">{vox.aiAnalysis.summary}</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-slate-700">
                    <AlertTriangle className={cn("mt-0.5 h-4 w-4", vox.aiAnalysis.urgency === 'Critical' || vox.aiAnalysis.urgency === 'High' ? "text-rose-600" : "text-amber-600")} />
                    <span>Urgency: <span className="font-semibold">{vox.aiAnalysis.urgency}</span></span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <ArrowUpRight className="mt-0.5 h-4 w-4 text-indigo-600" />
                    <span>Suggested Classification: <span className="font-semibold">{vox.aiAnalysis.classification}</span></span>
                  </li>
                  {vox.aiAnalysis.financial_loss_estimate && (
                    <li className="flex items-start gap-2 text-slate-700">
                      <DollarSign className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <span>Estimated Loss: <span className="font-semibold">₹{vox.aiAnalysis.financial_loss_estimate}</span></span>
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400 italic">No AI analysis available yet.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-200/60 bg-slate-50/50 px-6 py-3.5">
          <VoxButton variant="secondary" size="sm">
            <UserPlus className="h-3.5 w-3.5" /> Reassign
          </VoxButton>
          <VoxButton variant="secondary" size="sm">
            <ArrowUpRight className="h-3.5 w-3.5" /> Escalate
          </VoxButton>
          <VoxButton size="sm" className="ml-auto">
            <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
          </VoxButton>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={cn("mt-0.5 text-sm font-medium text-slate-900")}>{value}</dd>
    </div>
  );
}
