import { createFileRoute } from "@tanstack/react-router";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { User, Mail, Shield, BadgeCheck, Briefcase, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/employee/profile")({
  component: EmployeeProfilePage,
});

function EmployeeProfilePage() {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { name: "Agent Smith", role: "Specialist", email: "smith@vox.ai" };
      const { data: emp } = await supabase.from("employees").select("name, role").eq("auth_id", user.id).single();
      return { 
        name: emp?.name || user.user_metadata?.name || "Agent", 
        role: emp?.role || "Specialist",
        email: user.email 
      };
    }
  });

  return (
    <VoxShell
      accent="emerald"
      portalLabel="Employee"
      user={currentUser || { name: "Loading...", role: "Employee" }}
      navItems={[]}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Employee Profile</h1>
          <p className="text-sm text-slate-500">Your professional identity within the Vox ecosystem.</p>
        </div>

        <VoxCard className="p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white">
              {currentUser?.name?.[0]}
            </div>
            <div className="flex-1 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <User className="h-4 w-4 text-slate-400" />
                    {currentUser?.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Work Email</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {currentUser?.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Designation</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    {currentUser?.role}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Employee ID</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Shield className="h-4 w-4 text-slate-400" />
                    VOX-EMP-4022
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Department</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <BadgeCheck className="h-4 w-4 text-slate-400" />
                    Customer Success
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Shift</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Clock className="h-4 w-4 text-slate-400" />
                    9:00 AM - 6:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VoxCard>

        <VoxCard className="p-6 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Work Performance</h2>
          <div className="grid gap-4 sm:grid-cols-3">
             <div className="text-center p-3">
               <p className="text-2xl font-bold text-slate-900">42</p>
               <p className="text-[10px] uppercase font-bold text-slate-400">Resolved</p>
             </div>
             <div className="text-center p-3 border-x border-slate-200">
               <p className="text-2xl font-bold text-emerald-600">98%</p>
               <p className="text-[10px] uppercase font-bold text-slate-400">SLA Rate</p>
             </div>
             <div className="text-center p-3">
               <p className="text-2xl font-bold text-slate-900">4.8</p>
               <p className="text-[10px] uppercase font-bold text-slate-400">Rating</p>
             </div>
          </div>
        </VoxCard>
      </div>
    </VoxShell>
  );
}
