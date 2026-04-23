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
import { getComplaints, getSuggestedResponse } from "@/lib/server/complaints";
import { supabase } from "@/lib/supabase";

// --- Types ---

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Sentiment = EmployeeSentiment;
type Status = "Open" | "In progress" | "Escalated" | "Resolved" | "Closed";

interface EmployeeComplaint {
  id: string;
  realId: string;
  subject: string;
  priority: Priority;
  sentiment: Sentiment;
  status: Status;
  assignee: string;
  customer: string;
  account: string;
  exposure: string;
  channel: string;
  ts: string;
  body: string;
  aiAnalysis?: {
    summary: string;
    urgency: string;
    classification: string;
    financial_loss_estimate?: number;
    sentiment: string;
  };
}

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
  const [active, setActive] = useState<EmployeeComplaint | null>(null);
  const [page, setPage] = useState(1);
  const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints", "employee"],
    queryFn: () => getComplaints({ data: "employee" }),
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

  // Handle AI response fetching when active item changes
  useEffect(() => {
    async function loadAI() {
      if (active?.aiAnalysis) {
        const response = await getSuggestedResponse({
          data: {
            category: active.aiAnalysis.classification,
            sentiment: active.aiAnalysis.sentiment,
            urgency: active.aiAnalysis.urgency,
            summary: active.aiAnalysis.summary,
          },
        });
        setSuggestedResponse(response);
      } else {
        setSuggestedResponse(null);
      }
    }
    loadAI();
  }, [active]);

  const mappedData = useMemo(() => {
    const complaintsArray = Array.isArray(complaints) ? complaints : [];
    return complaintsArray.map((c: any) => ({
      id: c.id.split("-")[0].toUpperCase(),
      realId: c.id,
      subject: c.description.slice(0, 50) + (c.description.length > 50 ? "..." : ""),
      priority: (c.priority || "MEDIUM") as Priority,
      sentiment: (c.ai_analyses?.[0]?.sentiment || "Neutral") as Sentiment,
      status: (c.status.charAt(0) + c.status.slice(1).toLowerCase().replace("_", " ")) as Status,
      assignee: c.assigned_to || "Unassigned",
      customer: "Customer",
      account: "AuraBank Account",
      exposure: c.financial_loss_customer ? `₹${c.financial_loss_customer}` : "₹0",
      channel: c.source === "web_form" ? "Web" : "API",
      ts: new Date(c.created_at).toLocaleString(),
      body: c.description,
      aiAnalysis: c.ai_analyses?.[0],
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

  useEffect(() => {
    setPage(1);
  }, [q, priority, sentiment, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <VoxShell
      accent="indigo"
      portalLabel="Employee"
      user={{ name: "Jordan Morgan", role: "Senior Resolution Specialist" }}
      navItems={[
        { label: "Worklist", icon: <Inbox />, to: "/employee", active: true },
        { label: "Queues", icon: <Layers /> },
        { label: "Performance", icon: <BarChart3 /> },
      ]}
    >
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
                    onClick={() => setActive(v)}
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

      {active && (
        <VoxDetailSheet
          vox={active}
          suggestedResponse={suggestedResponse}
          onClose={() => setActive(null)}
        />
      )}
    </VoxShell>
  );
}

// --- Sub-components ---

function VoxDetailSheet({
  vox,
  suggestedResponse,
  onClose,
}: {
  vox: EmployeeComplaint;
  suggestedResponse: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <div className="font-mono text-xs text-slate-400">{vox.id}</div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">{vox.subject}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="grid grid-cols-2 gap-4 border-b pb-5">
            <Field label="Customer" value={vox.customer} />
            <Field label="Exposure" value={vox.exposure} />
            <Field label="Status" value={vox.status} />
            <Field label="Assignee" value={vox.assignee} />
          </dl>

          <div className="mt-5">
            <div className="text-xs font-medium uppercase text-slate-500">Customer narrative</div>
            <p className="mt-2 rounded-md border bg-slate-50/60 p-3 text-sm text-slate-700">
              {vox.body}
            </p>
          </div>

          <div className="mt-6">
            <div className="text-xs font-medium uppercase text-slate-500">AI signals</div>
            {suggestedResponse && (
              <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                <div className="text-[10px] font-bold uppercase text-blue-500 mb-1">
                  Suggested Response
                </div>
                <p className="text-sm text-slate-700">{suggestedResponse}</p>
              </div>
            )}
            {vox.aiAnalysis && (
              <div className="mt-3 space-y-3">
                <div className="rounded-md border p-3 bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">AI Summary</div>
                  <p className="text-sm text-slate-700">{vox.aiAnalysis.summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t bg-slate-50/50 px-6 py-3.5">
          <VoxButton variant="secondary" size="sm">
            Escalate
          </VoxButton>
          <VoxButton size="sm" className="ml-auto">
            Resolve
          </VoxButton>
        </div>
      </aside>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
