import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home,
  MessageSquare,
  Clock,
  FileText,
  Plus,
  Loader2,
  ChevronRight,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxButton } from "@/components/vox/VoxButton";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { NewVoxDialog } from "@/components/vox/NewVoxDialog";
import { cn } from "@/lib/utils";
import { MOCK_CUSTOMER } from "@/lib/mock";
import { formatDistanceToNow } from "date-fns";
import { getComplaints } from "@/lib/server/complaints";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/customer/")({
  head: () => ({
    meta: [{ title: "Customer Portal — Vox" }],
  }),
  component: CustomerPortal,
});

const STATUS_STEPS = [
  { label: "Submitted", icon: Send },
  { label: "Triaged", icon: TrendingUp },
  { label: "In Progress", icon: RefreshCw },
  { label: "Resolved", icon: CheckCircle2 },
];

const statusToStep: Record<string, number> = {
  OPEN: 0,
  TRIAGED: 1,
  IN_PROGRESS: 2,
  ESCALATED: 2,
  RESOLVED: 3,
  CLOSED: 3,
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

function getHour() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function CustomerPortal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: realComplaints, isLoading } = useQuery({
    queryKey: ["complaints", "customer"],
    queryFn: () => getComplaints({ data: "customer" }),
  });

  useEffect(() => {
    const channel = supabase
      .channel("customer-complaints-overview")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => {
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const complaints = Array.isArray(realComplaints) ? realComplaints : [];
  const recent = complaints.slice(0, 5);

  const openCount = complaints.filter((c) => c.status === "OPEN" || c.status === "ESCALATED" || c.status === "TRIAGED").length;
  const progressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
  const escalatedCount = complaints.filter((c) => c.status === "ESCALATED").length;

  const latestActive = complaints.find((c) => c.status !== "RESOLVED" && c.status !== "CLOSED");
  const activeStep = latestActive ? (statusToStep[latestActive.status] ?? 0) : 0;

  const quickLinks = [
    { label: "My Voxes", desc: `${complaints.length} total complaints`, to: "/customer/complaints", icon: MessageSquare, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Documents", desc: "Uploaded attachments", to: "/customer/documents", icon: FileText, color: "text-violet-600 bg-violet-50 border-violet-200" },
    { label: "Activity", desc: "Full history & timeline", to: "/customer/history", icon: Clock, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  return (
    <VoxShell
      accent="blue"
      portalLabel="Customer"
      user={{ name: MOCK_CUSTOMER.name, role: MOCK_CUSTOMER.role }}
      navItems={[
        { label: "Overview", icon: <Home />, to: "/customer/", active: true },
        { label: "My Voxes", icon: <MessageSquare />, to: "/customer/complaints" },
        { label: "Documents", icon: <FileText />, to: "/customer/documents" },
        { label: "Activity", icon: <Clock />, to: "/customer/history" },
      ]}
    >
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Good {getHour()}, {MOCK_CUSTOMER.name.split(" ")[0]}.
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here's a summary of your Vox activity.
            </p>
          </div>
          <VoxButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New Vox
          </VoxButton>
        </div>

        {/* ── KPI stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <VoxCard key={i} className="h-28 animate-pulse bg-slate-50 border-slate-100" />
              ))
            : [
                { label: "Open", value: openCount, tone: "open" as const, hint: "Awaiting triage", dotColor: "bg-blue-500" },
                { label: "In Progress", value: progressCount, tone: "progress" as const, hint: "Being worked on", dotColor: "bg-amber-400" },
                { label: "Resolved", value: resolvedCount, tone: "resolved" as const, hint: "Completed", dotColor: "bg-emerald-500" },
                { label: "Escalated", value: escalatedCount, tone: "p1" as const, hint: "Priority handling", dotColor: "bg-red-500" },
              ].map((k) => (
                <VoxCard key={k.label} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {k.label}
                    </span>
                    <span className={cn("h-2 w-2 rounded-full", k.dotColor, k.value > 0 && k.tone !== "resolved" ? "animate-pulse" : "")} />
                  </div>
                  <div className="text-3xl font-semibold tracking-tight text-slate-900">
                    {k.value}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{k.hint}</p>
                </VoxCard>
              ))}
        </div>

        {/* ── Active Vox progress ── */}
        {!isLoading && latestActive && (
          <VoxCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400">
                  {latestActive.id.split("-")[0].toUpperCase()}
                </span>
                <p className="text-sm font-semibold text-slate-900">{latestActive.category}</p>
              </div>
              <VoxBadge tone={getTone(latestActive.status) as any} dot={latestActive.status !== "RESOLVED"}>
                {latestActive.status.replace("_", " ")}
              </VoxBadge>
            </div>

            <div className="p-5">
              <p className="mb-5 text-xs font-medium uppercase tracking-wider text-slate-500">
                Resolution Progress
              </p>

              {/* Step tracker */}
              <div className="flex items-start justify-between w-full">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= activeStep;
                  const current = i === activeStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="relative flex flex-1 flex-col items-center">
                      {/* Connecting line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-[50%] right-[-50%] top-4 h-0.5 transition-all",
                            i < activeStep ? "bg-blue-600" : "bg-slate-200"
                          )}
                        />
                      )}
                      
                      <div
                        className={cn(
                          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                          done
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-300",
                          current && "ring-4 ring-blue-600/15"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-[10px] font-medium text-center leading-tight max-w-[80px]",
                          done ? "text-blue-700" : "text-slate-400"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Escalation note */}
              {latestActive.status === "ESCALATED" && (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/60 p-3.5">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    This Vox has been escalated for priority handling by a senior specialist.
                  </p>
                </div>
              )}

              {/* Meta row */}
              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                {[
                  { label: "Reference", value: latestActive.id.split("-")[0].toUpperCase() },
                  { label: "Product", value: latestActive.product || "N/A" },
                  { label: "Last updated", value: formatDistanceToNow(new Date(latestActive.updated_at), { addSuffix: true }) },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{m.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </VoxCard>
        )}

        {/* ── Two column lower section ── */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Recent Voxes — wider */}
          <div className="lg:col-span-3">
            <VoxCard className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-slate-900">Recent Voxes</h2>
                <Link
                  to="/customer/complaints"
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : recent.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <MessageSquare className="mx-auto h-7 w-7 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No Voxes yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recent.map((r) => (
                    <Link key={r.id} to="/customer/complaints">
                      <li className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/80">
                        <div
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            r.status === "ESCALATED" ? "bg-red-500" :
                            r.status === "IN_PROGRESS" ? "bg-amber-400 animate-pulse" :
                            r.status === "RESOLVED" || r.status === "CLOSED" ? "bg-emerald-500" : "bg-blue-500"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[11px] text-slate-400">{r.id.split("-")[0].toUpperCase()}</span>
                          </div>
                          <p className="truncate text-sm font-medium text-slate-900">{r.category}</p>
                          {r.description && (
                            <p className="truncate text-xs text-slate-400 mt-0.5">{r.description}</p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-3">
                          <div className="text-right">
                            <VoxBadge tone={getTone(r.status) as any} dot={r.status !== "RESOLVED" && r.status !== "CLOSED"}>
                              {r.status.replace("_", " ")}
                            </VoxBadge>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </VoxCard>
          </div>

          {/* Quick links — narrower */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 px-1">
              Quick Access
            </p>
            {quickLinks.map((ql) => {
              const Icon = ql.icon;
              return (
                <Link key={ql.label} to={ql.to}>
                  <VoxCard className="group flex items-center gap-4 p-4 transition-all hover:shadow-md hover:-translate-y-px cursor-pointer">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", ql.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{ql.label}</p>
                      <p className="text-xs text-slate-400 truncate">{ql.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                  </VoxCard>
                </Link>
              );
            })}

            {/* Submit new vox CTA */}
            <div className="pt-2">
              <VoxCard className="p-4 bg-slate-900 border-slate-800 shadow-lg">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">New Issue?</p>
                <p className="text-sm font-semibold text-white mb-3">Submit a Vox</p>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Raise a new complaint and we'll route it to the right team instantly.
                </p>
                <button
                  onClick={() => setOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" /> New Vox
                </button>
              </VoxCard>
            </div>
          </div>
        </div>
      </div>

      {open && <NewVoxDialog onClose={() => setOpen(false)} />}
    </VoxShell>
  );
}
