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
  Layers,
  BarChart3,
} from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxButton } from "@/components/vox/VoxButton";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { cn } from "@/lib/utils";

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

type Priority = "P1" | "P2" | "P3";
type Sentiment = "Positive" | "Neutral" | "Negative";
type Status = "Open" | "In Review" | "In Progress" | "Resolved";

interface Vox {
  id: string;
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
}

const data: Vox[] = [
  { id: "VX-10248", subject: "Transaction Latency on Wire Transfer", priority: "P1", sentiment: "Negative", status: "In Progress", assignee: "J. Morgan", customer: "Alex Chen", account: "Premier · 4421", exposure: "$248,500", channel: "Web", ts: "2h ago",
    body: "Wire initiated 49h ago to a verified beneficiary remains 'pending compliance'. Customer reports vendor demanding payment confirmation today." },
  { id: "VX-10247", subject: "KYC Verification Delay", priority: "P2", sentiment: "Negative", status: "Open", assignee: "Unassigned", customer: "Riya Patel", account: "Business · 7710", exposure: "$0", channel: "Mobile", ts: "3h ago",
    body: "Re-verification request submitted 8 days ago. No outreach received. Account features partially restricted." },
  { id: "VX-10246", subject: "Card Decline — Merchant Category", priority: "P2", sentiment: "Neutral", status: "In Review", assignee: "S. Okafor", account: "Personal · 2189", customer: "Daniel Reyes", exposure: "$1,240", channel: "Phone", ts: "4h ago",
    body: "Recurring SaaS charge declined twice. MCC restriction appears to be misclassified." },
  { id: "VX-10243", subject: "Statement Discrepancy — Q3", priority: "P3", sentiment: "Neutral", status: "In Review", assignee: "M. Bauer", account: "Premier · 9904", customer: "Hana Takeda", exposure: "$320", channel: "Web", ts: "Yesterday",
    body: "Closing balance on Q3 statement does not match in-app ledger by $320.42." },
  { id: "VX-10240", subject: "Wire Transfer Hold — Sanctions Review", priority: "P1", sentiment: "Negative", status: "Open", assignee: "Unassigned", account: "Business · 1180", customer: "Northwind LLC", exposure: "$1,120,000", channel: "Web", ts: "Yesterday",
    body: "Outbound wire to long-standing supplier flagged. Treasury team requesting urgent review." },
  { id: "VX-10238", subject: "App Login Loop — iOS 18.4", priority: "P2", sentiment: "Negative", status: "In Progress", assignee: "L. Kowalski", account: "Personal · 3320", customer: "Marco Vidal", exposure: "$0", channel: "Mobile", ts: "2 days ago",
    body: "Repeated logout after Face ID prompt on iOS 18.4. Multiple customers affected based on cluster." },
  { id: "VX-10231", subject: "Disputed ATM Withdrawal", priority: "P2", sentiment: "Negative", status: "In Review", assignee: "S. Okafor", account: "Personal · 5582", customer: "Olivia Brand", exposure: "$600", channel: "Phone", ts: "2 days ago",
    body: "Customer disputes $600 ATM withdrawal at off-network terminal. Camera footage requested." },
  { id: "VX-10198", subject: "Card Decline Pattern — EU Travel", priority: "P3", sentiment: "Neutral", status: "Resolved", assignee: "M. Bauer", account: "Premier · 4421", customer: "Alex Chen", exposure: "$0", channel: "Web", ts: "3 days ago",
    body: "Travel notice was on file but fraud rules over-flagged EU MCCs. Rule tuned." },
];

const priorities: Priority[] = ["P1", "P2", "P3"];
const sentiments: Sentiment[] = ["Positive", "Neutral", "Negative"];
const statuses: Status[] = ["Open", "In Review", "In Progress", "Resolved"];

const priorityTone: Record<Priority, "p1" | "p2" | "p3"> = { P1: "p1", P2: "p2", P3: "p3" };
const sentimentTone: Record<Sentiment, "positive" | "neutral" | "negative"> = {
  Positive: "positive",
  Neutral: "neutral",
  Negative: "negative",
};
const statusTone: Record<Status, "open" | "review" | "progress" | "resolved"> = {
  Open: "open",
  "In Review": "review",
  "In Progress": "progress",
  Resolved: "resolved",
};

function AgentPortal() {
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [sentiment, setSentiment] = useState<Sentiment | "All">("All");
  const [status, setStatus] = useState<Status | "All">("All");
  const [active, setActive] = useState<Vox | null>(null);

  const filtered = useMemo(() => {
    return data.filter((v) => {
      if (priority !== "All" && v.priority !== priority) return false;
      if (sentiment !== "All" && v.sentiment !== sentiment) return false;
      if (status !== "All" && v.status !== status) return false;
      if (q && !`${v.id} ${v.subject} ${v.customer}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, priority, sentiment, status]);

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
              {filtered.length} of {data.length} shown · sorted by priority then time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VoxBadge tone="p1" dot>
              {data.filter((d) => d.priority === "P1").length} P1
            </VoxBadge>
            <VoxBadge tone="p2" dot>
              {data.filter((d) => d.priority === "P2").length} P2
            </VoxBadge>
            <VoxBadge tone="p3" dot>
              {data.filter((d) => d.priority === "P3").length} P3
            </VoxBadge>
          </div>
        </div>

        {/* Filter bar */}
        <VoxCard className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, subject, or customer…"
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
              <tbody>
                {filtered.map((v) => (
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
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2 text-slate-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                Cluster match: 7 similar Voxes opened in last 24h
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <ArrowUpRight className="mt-0.5 h-4 w-4 text-indigo-600" />
                Suggested route: Treasury Operations · Tier 2
              </li>
            </ul>
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
