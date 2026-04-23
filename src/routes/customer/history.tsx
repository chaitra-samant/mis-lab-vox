import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  MessageSquare,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Send,
  RefreshCw,
  Star,
} from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { MOCK_CUSTOMER } from "@/lib/mock";
import { formatDistanceToNow, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "@/lib/server/complaints";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/history")({
  head: () => ({
    meta: [{ title: "Activity History — Vox" }],
  }),
  component: CustomerHistoryPage,
});

interface TimelineEvent {
  id: string;
  complaintId: string;
  complaintRef: string;
  category: string;
  type: "submitted" | "triaged" | "in_progress" | "escalated" | "resolved" | "closed" | "feedback";
  label: string;
  description: string;
  ts: string;
  status?: string;
}

function buildTimeline(complaints: any[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const c of complaints) {
    const ref = c.id.split("-")[0].toUpperCase();

    // Always: submission event
    events.push({
      id: `${c.id}-submitted`,
      complaintId: c.id,
      complaintRef: ref,
      category: c.category,
      type: "submitted",
      label: "Vox Submitted",
      description: c.description
        ? c.description.slice(0, 100) + (c.description.length > 100 ? "…" : "")
        : "No description provided.",
      ts: c.created_at,
      status: c.status,
    });

    // If AI analysed (triaged)
    if (c.status !== "OPEN" && c.ai_analyses) {
      const analysis = Array.isArray(c.ai_analyses) ? c.ai_analyses[0] : c.ai_analyses;
      events.push({
        id: `${c.id}-triaged`,
        complaintId: c.id,
        complaintRef: ref,
        category: c.category,
        type: "triaged",
        label: "Triaged by AI",
        description: analysis?.summary
          ? `AI classified as ${analysis.urgency ?? "Medium"} urgency. ${analysis.summary.slice(0, 80)}…`
          : "AI analysis completed and routed to the appropriate department.",
        ts: new Date(new Date(c.created_at).getTime() + 1000 * 60 * 5).toISOString(), // ~5 min after
        status: c.status,
      });
    }

    // In progress
    if (["IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"].includes(c.status)) {
      events.push({
        id: `${c.id}-in_progress`,
        complaintId: c.id,
        complaintRef: ref,
        category: c.category,
        type: "in_progress",
        label: "Under Review",
        description: "A support agent has picked up your Vox and is actively working on it.",
        ts: new Date(new Date(c.created_at).getTime() + 1000 * 60 * 30).toISOString(),
        status: c.status,
      });
    }

    // Escalated
    if (c.status === "ESCALATED" || c.escalated) {
      events.push({
        id: `${c.id}-escalated`,
        complaintId: c.id,
        complaintRef: ref,
        category: c.category,
        type: "escalated",
        label: "Escalated",
        description: "Your Vox has been escalated to a senior specialist for priority handling.",
        ts: c.escalated_at || new Date(new Date(c.created_at).getTime() + 1000 * 60 * 60).toISOString(),
        status: c.status,
      });
    }

    // Resolved
    if (c.status === "RESOLVED" || c.status === "CLOSED") {
      events.push({
        id: `${c.id}-resolved`,
        complaintId: c.id,
        complaintRef: ref,
        category: c.category,
        type: "resolved",
        label: "Resolved",
        description:
          c.resolution_note ||
          "Your Vox has been marked as resolved. We hope your issue was addressed.",
        ts: c.resolved_at || c.updated_at,
        status: c.status,
      });

      // Feedback
      if (c.feedback_rating) {
        events.push({
          id: `${c.id}-feedback`,
          complaintId: c.id,
          complaintRef: ref,
          category: c.category,
          type: "feedback",
          label: "Feedback Submitted",
          description: `You rated this resolution ${c.feedback_rating}/5 stars.${c.feedback_text ? ` "${c.feedback_text}"` : ""}`,
          ts: new Date(new Date(c.resolved_at || c.updated_at).getTime() + 1000 * 60 * 60).toISOString(),
          status: c.status,
        });
      }
    }
  }

  return events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

const eventConfig: Record<
  TimelineEvent["type"],
  { icon: React.ComponentType<any>; color: string; bg: string; border: string }
> = {
  submitted: { icon: Send, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  triaged: { icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  in_progress: { icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  escalated: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  resolved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  closed: { icon: CheckCircle2, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
  feedback: { icon: Star, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
};

function groupByDate(events: TimelineEvent[]) {
  const groups: Record<string, TimelineEvent[]> = {};
  for (const evt of events) {
    const key = format(new Date(evt.ts), "MMMM d, yyyy");
    if (!groups[key]) groups[key] = [];
    groups[key].push(evt);
  }
  return Object.entries(groups);
}

function CustomerHistoryPage() {
  const { data: rawComplaints, isLoading } = useQuery({
    queryKey: ["complaints", "customer"],
    queryFn: () => getComplaints({ data: "customer" }),
  });

  const complaints = Array.isArray(rawComplaints) ? rawComplaints : [];
  const events = buildTimeline(complaints);
  const grouped = groupByDate(events);

  return (
    <VoxShell
      accent="blue"
      portalLabel="Customer"
      user={{ name: MOCK_CUSTOMER.name, role: MOCK_CUSTOMER.role }}
      navItems={[
        { label: "Overview", icon: <Home />, to: "/customer" },
        { label: "My Voxes", icon: <MessageSquare />, to: "/customer/complaints" },
        { label: "Documents", icon: <FileText />, to: "/customer/documents" },
        { label: "Activity", icon: <Clock />, to: "/customer/history", active: true },
      ]}
    >
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Full Audit Log
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Activity History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A chronological log of every update across all your Voxes.
          </p>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="grid gap-4 sm:grid-cols-3">
            <VoxCard className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Events</p>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{events.length}</div>
              <p className="mt-1 text-xs text-slate-500">Across all Voxes</p>
            </VoxCard>
            <VoxCard className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Resolved</p>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {complaints.filter((c: any) => c.status === "RESOLVED" || c.status === "CLOSED").length}
              </div>
              <p className="mt-1 text-xs text-slate-500">Completed Voxes</p>
            </VoxCard>
            <VoxCard className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Active</p>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {complaints.filter((c: any) => c.status !== "RESOLVED" && c.status !== "CLOSED").length}
              </div>
              <p className="mt-1 text-xs text-slate-500">In-flight Voxes</p>
            </VoxCard>
          </div>
        )}

        {/* Timeline */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : events.length === 0 ? (
          <VoxCard className="p-16 text-center">
            <Clock className="mx-auto h-8 w-8 text-slate-300 mb-3" />
            <h3 className="text-base font-medium text-slate-900">No activity yet</h3>
            <p className="text-sm text-slate-500 mt-1">
              Submit a Vox to start tracking your history.
            </p>
          </VoxCard>
        ) : (
          <div className="space-y-8">
            {grouped.map(([date, dayEvents]) => (
              <div key={date}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 whitespace-nowrap">
                    {date}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="relative space-y-0">
                  {/* Vertical spine */}
                  <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-200" />

                  {dayEvents.map((evt, i) => {
                    const cfg = eventConfig[evt.type];
                    const Icon = cfg.icon;

                    return (
                      <div key={evt.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Icon */}
                        <div
                          className={cn(
                            "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm",
                            cfg.bg,
                            cfg.border
                          )}
                        >
                          <Icon className={cn("h-4 w-4", cfg.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1.5">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-900">{evt.label}</span>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 font-mono text-[10px] font-medium",
                                cfg.bg,
                                cfg.color
                              )}
                            >
                              {evt.complaintRef}
                            </span>
                            <span className="text-xs text-slate-400">
                              · {evt.category}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{evt.description}</p>
                          <p className="mt-1.5 text-xs text-slate-400">
                            {formatDistanceToNow(new Date(evt.ts), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VoxShell>
  );
}
