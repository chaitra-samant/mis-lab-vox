import { useState } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getUserRole } from "@/lib/auth";
import {
  Home,
  MessageSquare,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Loader2,
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
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/customer")({
  beforeLoad: async () => {
    const role = await getUserRole();
    if (!role) {
      throw redirect({ to: "/login" });
    }
    if (role !== "customer") {
      const { getRoleRedirectPath } = await import("@/lib/auth");
      throw redirect({ to: getRoleRedirectPath(role) });
    }
  },
  head: () => ({
    meta: [
      { title: "Customer Portal — Vox" },
    ],
  }),
  component: CustomerPortal,
});

const stages = ["Submitted", "Triaged", "In Progress", "Resolved"] as const;

const statusToStep: Record<string, number> = {
  "OPEN": 0,
  "TRIAGED": 1,
  "IN_PROGRESS": 2,
  "ESCALATED": 2,
  "RESOLVED": 3,
  "CLOSED": 3
};

function CustomerPortal() {
  const [open, setOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: realComplaints, isLoading } = useQuery({
    queryKey: ["complaints", "customer"],
    queryFn: () => getComplaints({ data: "customer" }),
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("customer-complaints")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["complaints"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const complaints = Array.isArray(realComplaints) ? realComplaints : [];
  const recent = complaints.slice(0, 4);
  
  const openCount = complaints.filter(c => c.status === "OPEN" || c.status === "ESCALATED").length;
  const progressCount = complaints.filter(c => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;

  const latestActive = complaints.find(c => c.status !== "RESOLVED" && c.status !== "CLOSED");

  return (
    <VoxShell
      accent="blue"
      portalLabel="Customer"
      user={{ name: MOCK_CUSTOMER.name, role: MOCK_CUSTOMER.role }}
      navItems={[
        { label: "Overview", icon: <Home />, to: "/customer", active: true },
        { label: "My Voxes", icon: <MessageSquare />, to: "/customer/complaints" },
        { label: "Documents", icon: <FileText /> },
        { label: "History", icon: <Clock /> },
      ]}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Status overview</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Good afternoon, {MOCK_CUSTOMER.name.split(" ")[0]}.
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening with your Voxes.
            </p>
          </div>
          <VoxButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New Vox
          </VoxButton>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {isLoading ? (
             [1,2,3].map(i => (
               <VoxCard key={i} className="p-5 h-32 animate-pulse bg-slate-50 border-slate-100" />
             ))
          ) : (
            [
              { label: "Open", value: openCount, tone: "open" as const, hint: "Awaiting or in triage" },
              { label: "In Progress", value: progressCount, tone: "progress" as const, hint: "Currently being resolved" },
              { label: "Resolved (Total)", value: resolvedCount, tone: "resolved" as const, hint: "Completed and closed" },
            ].map((k) => (
              <VoxCard key={k.label} className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {k.label}
                  </span>
                  <VoxBadge tone={k.tone} dot>Live</VoxBadge>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                  {k.value}
                </div>
                <p className="mt-1 text-xs text-slate-500">{k.hint}</p>
              </VoxCard>
            ))
          )}
        </div>

        {/* Ticket progress - Top active ticket */}
        {!isLoading && latestActive && (
          <VoxCard className="p-6">
            <div className="mb-1 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Active Vox Progress
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">
                  {latestActive.id.split("-")[0].toUpperCase()} · {latestActive.category}
                </h2>
              </div>
              <VoxBadge tone={latestActive.status === "IN_PROGRESS" ? "progress" : latestActive.status === "ESCALATED" ? "p1" : "open"} dot>
                {latestActive.status.replace("_", " ")}
              </VoxBadge>
            </div>

            <ProgressTracker activeIndex={statusToStep[latestActive.status] || 0} />

            <div className="mt-5 grid gap-4 border-t border-slate-200/60 pt-5 sm:grid-cols-3">
              <Meta label="Reference" value={latestActive.id.split("-")[0].toUpperCase()} />
              <Meta label="Product" value={latestActive.product || "N/A"} />
              <Meta label="Updated" value={formatDistanceToNow(new Date(latestActive.updated_at), { addSuffix: true })} />
            </div>
          </VoxCard>
        )}

        {/* Recent voxes */}
        <VoxCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            <Link to="/customer/complaints" className="text-xs font-medium text-slate-500 hover:text-slate-900">
              View all
            </Link>
          </div>
          {isLoading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
             </div>
          ) : (
            <ul className="divide-y divide-slate-200/60">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50/60"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="font-mono text-xs text-slate-400">{r.id.split("-")[0].toUpperCase()}</span>
                    <span className="truncate text-sm text-slate-900">{r.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <VoxBadge 
                      tone={
                        r.status === "RESOLVED" || r.status === "CLOSED" ? "resolved" : 
                        r.status === "IN_PROGRESS" ? "progress" : 
                        r.status === "TRIAGED" ? "review" : "open"
                      } 
                      dot={r.status !== "RESOLVED" && r.status !== "CLOSED"}
                    >
                      {r.status.replace("_", " ")}
                    </VoxBadge>
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </li>
              ))}
              {recent.length === 0 && (
                <li className="px-6 py-12 text-center text-sm text-slate-500">
                  No recent activity found.
                </li>
              )}
            </ul>
          )}
        </VoxCard>
      </div>

      {open && <NewVoxDialog onClose={() => setOpen(false)} />}
    </VoxShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function ProgressTracker({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="mt-6">
      <div className="hidden sm:block">
        <div className="relative">
          <div className="absolute left-3 right-3 top-3 h-px bg-slate-200" />
          <div
            className="absolute left-3 top-3 h-px bg-slate-900 transition-all"
            style={{ width: `calc(${(activeIndex / (stages.length - 1)) * 100}% - ${activeIndex === stages.length - 1 ? 12 : 0}px)` }}
          />
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
            {stages.map((s, i) => {
              const done = i <= activeIndex;
              const current = i === activeIndex;
              return (
                <div key={s} className="flex flex-col items-start">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold",
                      done
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-400",
                      current && "ring-4 ring-slate-900/10",
                    )}
                  >
                    {done && i < activeIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-700">{s}</div>
                  <div className="text-[11px] text-slate-400">
                    {current ? "In progress" : done ? "Completed" : "Pending"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ol className="space-y-4 sm:hidden">
        {stages.map((s, i) => {
          const done = i <= activeIndex;
          const current = i === activeIndex;
          return (
            <li key={s} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold",
                    done
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-400",
                    current && "ring-4 ring-slate-900/10",
                  )}
                >
                  {i + 1}
                </div>
                {i < stages.length - 1 && (
                  <div className={cn("mt-1 h-8 w-px", done ? "bg-slate-900" : "bg-slate-200")} />
                )}
              </div>
              <div className="pt-0.5">
                <div className="text-sm font-medium text-slate-900">{s}</div>
                <div className="text-xs text-slate-400">
                  {current ? "In progress" : done ? "Completed" : "Pending"}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
