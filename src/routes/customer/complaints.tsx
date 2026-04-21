import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, MessageSquare, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { VoxButton } from "@/components/vox/VoxButton";
import { ComplaintTimeline } from "@/components/vox/ComplaintTimeline";
import { FeedbackModal } from "@/components/vox/FeedbackModal";
import { getMockComplaints, markComplaintFeedback, type MockComplaint, MOCK_CUSTOMER } from "@/lib/mock";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/customer/complaints")({
  head: () => ({
    meta: [{ title: "My Voxes — Vox" }],
  }),
  component: CustomerComplaintsPortal,
});

function CustomerComplaintsPortal() {
  const [filter, setFilter] = useState<"All" | "Open" | "In Progress" | "Resolved">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  
  const complaints = getMockComplaints();

  const filtered = complaints.filter(c => 
    filter === "All" || 
    (filter === "Open" && (c.status === "Open" || c.status === "In Review")) ||
    c.status === filter
  );

  return (
    <VoxShell
      accent="blue"
      portalLabel="Customer"
      user={{ name: MOCK_CUSTOMER.name, role: MOCK_CUSTOMER.role }}
      navItems={[
        { label: "Overview", icon: <Home />, to: "/customer" },
        { label: "My Voxes", icon: <MessageSquare />, to: "/customer/complaints", active: true },
        { label: "Documents", icon: <FileText /> },
        { label: "History", icon: <Clock /> },
      ]}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            My Voxes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and monitor the resolution progress of your requests.
          </p>
        </div>

        <div className="flex gap-2 border-b border-slate-200/60 pb-4">
          {["All", "Open", "In Progress", "Resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <VoxCard className="p-12 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-3" />
              <h3 className="text-base font-medium text-slate-900">No Voxes found</h3>
              <p className="text-sm text-slate-500 mt-1">You don't have any complaints matching this filter.</p>
            </VoxCard>
          ) : (
            filtered.map(c => (
              <ComplaintRow 
                key={c.id} 
                complaint={c} 
                isExpanded={expandedId === c.id}
                onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                onRequestFeedback={() => setFeedbackId(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {feedbackId && (
        <FeedbackModal 
          onClose={() => setFeedbackId(null)} 
          onSubmit={(rating, comment) => {
            markComplaintFeedback(feedbackId, rating, comment);
            setFeedbackId(null);
            // Optionally show a toast here
          }} 
        />
      )}
    </VoxShell>
  );
}

function ComplaintRow({ 
  complaint: c, 
  isExpanded, 
  onToggle,
  onRequestFeedback 
}: { 
  complaint: MockComplaint; 
  isExpanded: boolean; 
  onToggle: () => void;
  onRequestFeedback: () => void;
}) {
  const getTone = (status: string) => {
    switch(status) {
      case "Open": return "open";
      case "In Review": return "review";
      case "In Progress": return "progress";
      case "Resolved": return "resolved";
      default: return "neutral";
    }
  };

  const getTimelineEvents = () => {
    const isResolved = c.status === "Resolved";
    const isInProgress = c.status === "In Progress" || c.status === "Resolved";
    
    return [
      {
        title: "Submitted",
        ts: formatDistanceToNow(new Date(c.submittedAt), { addSuffix: true }),
        completed: true,
        active: c.status === "Open",
      },
      {
        title: "In Progress",
        ts: isInProgress ? "Assigned to " + (c.assignedTo || "Agent") : "Pending",
        completed: isInProgress,
        active: c.status === "In Progress",
        messages: c.messages,
      },
      {
        title: "Resolved",
        ts: isResolved ? formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true }) : "Pending resolution",
        completed: isResolved,
        active: isResolved,
      }
    ];
  };

  return (
    <VoxCard className="overflow-hidden transition-all duration-200">
      <div 
        className="flex cursor-pointer items-center justify-between p-5 hover:bg-slate-50/50"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xs text-slate-400">{c.id}</span>
            <VoxBadge tone={getTone(c.status) as any} dot={c.status !== "Resolved" && c.status !== "Closed"}>
              {c.status}
            </VoxBadge>
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Updated {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
            </span>
          </div>
          <h3 className="truncate text-base font-medium text-slate-900">{c.subject}</h3>
        </div>
        <div className="shrink-0 text-slate-400">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/30 p-5 sm:p-6 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-4">
                Timeline & Communication
              </h4>
              <ComplaintTimeline events={getTimelineEvents()} />
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                  Details
                </h4>
                <div className="text-sm font-medium text-slate-900">{c.category}</div>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed overflow-hidden break-words">{c.details}</p>
                {c.financialLoss && (
                   <div className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 rounded px-2 py-1 inline-block border border-amber-100">
                     Reported Loss: {c.financialLoss}
                   </div>
                )}
              </div>
              
              {c.status === "Resolved" && !c.feedback && (
                <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-4">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-1">Resolution confirmed</h4>
                  <p className="text-xs text-emerald-700 mb-3">
                    {c.resolution || "This Vox has been marked as resolved."}
                  </p>
                  <VoxButton size="sm" variant="secondary" className="w-full bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800" onClick={(e) => { e.stopPropagation(); onRequestFeedback(); }}>
                    Rate your experience
                  </VoxButton>
                </div>
              )}

              {c.status === "Resolved" && c.feedback && (
                <div className="rounded-lg border border-slate-200/60 bg-white p-4">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Your Feedback</h4>
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`h-4 w-4 ${s <= c.feedback!.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  {c.feedback.comment && (
                    <p className="text-xs text-slate-600 italic">"{c.feedback.comment}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </VoxCard>
  );
}
