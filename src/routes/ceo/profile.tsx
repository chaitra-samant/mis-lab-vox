import { createFileRoute } from "@tanstack/react-router";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { User, Mail, Shield, Briefcase, Award, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/ceo/profile")({
  component: CEOProfilePage,
});

function CEOProfilePage() {
  const ceoInfo = {
    name: "Catherine Bell",
    role: "Chief Executive Officer",
    email: "catherine.bell@vox.ai",
    joined: "June 2020",
    focus: "Strategic Growth & AI Ethics"
  };

  return (
    <VoxShell
      accent="violet"
      portalLabel="Executive"
      user={{ name: ceoInfo.name, role: ceoInfo.role }}
      navItems={[]}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Executive Profile</h1>
          <p className="text-sm text-slate-500">Management and strategic oversight credentials.</p>
        </div>

        <VoxCard className="p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-violet-600 text-3xl font-bold text-white">
              {ceoInfo.name[0]}
            </div>
            <div className="flex-1 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <User className="h-4 w-4 text-slate-400" />
                    {ceoInfo.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Email</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {ceoInfo.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Title</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    {ceoInfo.role}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Strategic Focus</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    {ceoInfo.focus}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tenure</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Award className="h-4 w-4 text-slate-400" />
                    {ceoInfo.joined}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Clearance</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Level 5 (Full)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VoxCard>

        <VoxCard className="p-6 bg-slate-900 text-white">
          <h2 className="text-sm font-semibold mb-4">Strategic KPIs Summary</h2>
          <div className="grid gap-4 sm:grid-cols-2">
             <div>
               <p className="text-xs text-slate-400 uppercase">Organization Health</p>
               <p className="text-lg font-bold text-emerald-400">Excellent</p>
             </div>
             <div>
               <p className="text-xs text-slate-400 uppercase">Systemic Risk</p>
               <p className="text-lg font-bold text-amber-400">Managed</p>
             </div>
          </div>
        </VoxCard>
      </div>
    </VoxShell>
  );
}
