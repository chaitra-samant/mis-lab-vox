import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Home, MessageSquare, Clock, FileText, ChevronRight, Loader2,
  X, AlertTriangle, IndianRupee, Tag, Calendar, User, Cpu,
  CheckCircle2, RefreshCw, Send, TrendingUp, Star,
} from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { VoxButton } from "@/components/vox/VoxButton";
import { FeedbackModal } from "@/components/vox/FeedbackModal";
import { MOCK_CUSTOMER } from "@/lib/mock";
import { formatDistanceToNow, format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaints, submitFeedback } from "@/lib/server/complaints";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/complaints")({
  head: () => ({
    meta: [{ title: "My Voxes — Vox" }],
  }),
  component: CustomerComplaintsPortal,
});

type FilterType = "All" | "OPEN" | "IN_PROGRESS" | "RESOLVED";

const STATUS_STEPS = ["Submitted", "Triaged", "In Progress", "Resolved"];
const statusToStep: Record<string, number> = {
  OPEN: 0, TRIAGED: 1, IN_PROGRESS: 2, ESCALATED: 2, RESOLVED: 3, CLOSED: 3,
};

function getTone(status: string) {
  switch (status) {
    case "OPEN": return "open";
    case "ESCALATED": return "p1";
    case "IN_PROGRESS": return "progress";
    case "RESOLVED": case "CLOSED": return "resolved";
    default: return "neutral" as any;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "CRITICAL": return "text-red-700 bg-red-50 border-red-200";
    case "HIGH": return "text-orange-700 bg-orange-50 border-orange-200";
    case "MEDIUM": return "text-amber-700 bg-amber-50 border-amber-200";
    default: return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

function StepTracker({ step }: { step: number }) {
  return (
    <div className="relative flex items-center gap-0">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= step;
        const current = i === step;
        return (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all",
                  done ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-400",
                  current && "ring-4 ring-blue-600/15"
                )}
              >
                {done && i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("mt-1.5 text-[10px] font-medium whitespace-nowrap", done ? "text-blue-700" : "text-slate-400")}>{s}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={cn("mb-4 h-px flex-1 transition-all", i < step ? "bg-blue-600" : "bg-slate-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailDrawer({ complaint: c, onClose, onFeedback }: { complaint: any; onClose: () => void; onFeedback: () => void }) {
  const analysis = Array.isArray(c.ai_analyses) ? c.ai_analyses[0] : c.ai_analyses;
  const step = statusToStep[c.status] ?? 0;
  const isResolved = c.status === "RESOLVED" || c.status === "CLOSED";

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{c.id.split("-")[0].toUpperCase()}</span>
              <VoxBadge tone={getTone(c.status) as any} dot={!isResolved}>{c.status.replace("_", " ")}</VoxBadge>
            </div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">{c.category}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-6">
          {/* Progress tracker */}
          <VoxCard className="p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">Resolution Progress</p>
            <StepTracker step={step} />
          </VoxCard>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                <Calendar className="h-3 w-3" /> Submitted
              </div>
              <p className="text-sm font-medium text-slate-900">{format(new Date(c.created_at), "dd MMM yyyy")}</p>
              <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                <Tag className="h-3 w-3" /> Priority
              </div>
              <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold", getPriorityColor(c.priority ?? ""))}>
                {c.priority ?? "Not set"}
              </span>
            </div>
            {c.product && (
              <div className="rounded-lg border border-slate-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  <User className="h-3 w-3" /> Product
                </div>
                <p className="text-sm font-medium text-slate-900">{c.product}</p>
              </div>
            )}
            {c.financial_loss_customer && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-amber-600 mb-1.5">
                  <IndianRupee className="h-3 w-3" /> Reported Loss
                </div>
                <p className="text-sm font-semibold text-amber-800">₹{Number(c.financial_loss_customer).toLocaleString("en-IN")}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {c.description && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Your Description</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{c.description}</p>
              </div>
            </div>
          )}

          {/* AI Summary */}
          {analysis && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-violet-600" />
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">AI Analysis</p>
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 space-y-3">
                {analysis.summary && (
                  <p className="text-sm text-violet-900 leading-relaxed">{analysis.summary}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {analysis.sentiment && (
                    <span className="rounded-full bg-white border border-violet-200 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                      Sentiment: {analysis.sentiment}
                    </span>
                  )}
                  {analysis.urgency && (
                    <span className="rounded-full bg-white border border-violet-200 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                      Urgency: {analysis.urgency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline events */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">Timeline</p>
            <div className="relative space-y-0">
              <div className="absolute left-3.5 top-4 bottom-4 w-px bg-slate-200" />
              {[
                { icon: Send, label: "Submitted", ts: c.created_at, done: true, color: "text-blue-600 bg-blue-50 border-blue-200" },
                { icon: TrendingUp, label: "AI Triage", ts: new Date(new Date(c.created_at).getTime() + 300000).toISOString(), done: step >= 1, color: "text-violet-600 bg-violet-50 border-violet-200" },
                { icon: RefreshCw, label: "Under Review", ts: c.updated_at, done: step >= 2, color: "text-amber-600 bg-amber-50 border-amber-200" },
                { icon: CheckCircle2, label: "Resolved", ts: c.resolved_at || c.updated_at, done: step >= 3, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
              ].map((evt, i) => (
                <div key={evt.label} className={cn("relative flex gap-3 pb-4 last:pb-0", !evt.done && "opacity-40")}>
                  <div className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", evt.color)}>
                    <evt.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="pt-0.5">
                    <p className={cn("text-sm font-medium", evt.done ? "text-slate-900" : "text-slate-400")}>{evt.label}</p>
                    {evt.done && (
                      <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(evt.ts), { addSuffix: true })}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution note */}
          {isResolved && c.resolution_note && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700 mb-1.5">Resolution Note</p>
              <p className="text-sm text-emerald-900 leading-relaxed">{c.resolution_note}</p>
            </div>
          )}

          {/* Feedback section */}
          {isResolved && !c.feedback_rating && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-center space-y-3">
              <Star className="mx-auto h-6 w-6 text-amber-400" />
              <p className="text-sm font-medium text-slate-900">How was your experience?</p>
              <p className="text-xs text-slate-500">Your feedback helps us improve.</p>
              <VoxButton size="sm" className="w-full" onClick={onFeedback}>
                Rate your experience
              </VoxButton>
            </div>
          )}

          {isResolved && c.feedback_rating && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Your Feedback</p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={cn("h-4 w-4", s <= c.feedback_rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              {c.feedback_text && <p className="text-xs text-slate-600 italic">"{c.feedback_text}"</p>}
            </div>
          )}

          {/* Escalation warning */}
          {c.status === "ESCALATED" && (
            <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Escalated for Priority Handling</p>
                <p className="text-xs text-red-700 mt-0.5">
                  This Vox has been escalated to a senior specialist and will be resolved with the highest priority.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerComplaintsPortal() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rawComplaints, isLoading } = useQuery({
    queryKey: ["complaints", "customer"],
    queryFn: () => getComplaints({ data: "customer" }),
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload: { id: string; rating: number; text: string }) => submitFeedback(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setFeedbackId(null);
    },
  });

  const complaints = Array.isArray(rawComplaints) ? rawComplaints : [];
  const filtered = complaints.filter((c: any) =>
    filter === "All" ||
    (filter === "OPEN" && (c.status === "OPEN" || c.status === "ESCALATED" || c.status === "TRIAGED")) ||
    c.status === filter
  );

  const selectedComplaint = complaints.find((c: any) => c.id === selectedId);

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "All", label: "All" },
    { key: "OPEN", label: "Open" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "RESOLVED", label: "Resolved" },
  ];

  return (
    <VoxShell
      accent="blue"
      portalLabel="Customer"
      user={{ name: MOCK_CUSTOMER.name, role: MOCK_CUSTOMER.role }}
      navItems={[
        { label: "Overview", icon: <Home />, to: "/customer" },
        { label: "My Voxes", icon: <MessageSquare />, to: "/customer/complaints", active: true },
        { label: "Documents", icon: <FileText />, to: "/customer/documents" },
        { label: "Activity", icon: <Clock />, to: "/customer/history" },
      ]}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">My Voxes</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">All Complaints</h1>
            <p className="mt-1 text-sm text-slate-500">
              {complaints.length} Vox{complaints.length !== 1 ? "es" : ""} total · click any row to view details
            </p>
          </div>
          {/* Summary badges */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Open", count: complaints.filter((c: any) => c.status === "OPEN" || c.status === "ESCALATED" || c.status === "TRIAGED").length, tone: "open" as const },
              { label: "In Progress", count: complaints.filter((c: any) => c.status === "IN_PROGRESS").length, tone: "progress" as const },
              { label: "Resolved", count: complaints.filter((c: any) => c.status === "RESOLVED" || c.status === "CLOSED").length, tone: "resolved" as const },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <span className="text-xs text-slate-500">{b.label}</span>
                <VoxBadge tone={b.tone}>{b.count}</VoxBadge>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-200/60 pb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <VoxCard className="p-16 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-3" />
            <h3 className="text-base font-medium text-slate-900">No Voxes found</h3>
            <p className="text-sm text-slate-500 mt-1">No complaints match this filter.</p>
          </VoxCard>
        ) : (
          <VoxCard className="overflow-hidden divide-y divide-slate-100">
            {filtered.map((c: any) => {
              const analysis = Array.isArray(c.ai_analyses) ? c.ai_analyses[0] : c.ai_analyses;
              const isResolved = c.status === "RESOLVED" || c.status === "CLOSED";
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
                >
                  {/* Status dot */}
                  <div className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    c.status === "ESCALATED" ? "bg-red-500" :
                    c.status === "IN_PROGRESS" ? "bg-amber-400 animate-pulse" :
                    isResolved ? "bg-emerald-500" : "bg-blue-500"
                  )} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs text-slate-400">{c.id.split("-")[0].toUpperCase()}</span>
                      {c.priority && c.priority !== "MEDIUM" && (
                        <span className={cn("rounded border px-1.5 py-px text-[10px] font-bold", getPriorityColor(c.priority))}>
                          {c.priority}
                        </span>
                      )}
                      {c.status === "ESCALATED" && (
                        <span className="rounded border border-red-200 bg-red-50 px-1.5 py-px text-[10px] font-bold text-red-700">ESCALATED</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{c.category}</h3>
                    {c.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{c.description}</p>
                    )}
                    {analysis?.summary && (
                      <p className="text-xs text-violet-600 truncate mt-0.5">AI: {analysis.summary}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <VoxBadge tone={getTone(c.status) as any} dot={!isResolved}>
                        {c.status.replace("_", " ")}
                      </VoxBadge>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </VoxCard>
        )}
      </div>

      {/* Detail drawer */}
      {selectedComplaint && (
        <DetailDrawer
          complaint={selectedComplaint}
          onClose={() => setSelectedId(null)}
          onFeedback={() => { setFeedbackId(selectedComplaint.id); setSelectedId(null); }}
        />
      )}

      {feedbackId && (
        <FeedbackModal
          onClose={() => setFeedbackId(null)}
          onSubmit={(rating, comment) => feedbackMutation.mutate({ id: feedbackId, rating, text: comment })}
        />
      )}
    </VoxShell>
  );
}
