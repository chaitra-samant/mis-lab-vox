import { createFileRoute } from "@tanstack/react-router";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxButton } from "@/components/vox/VoxButton";
import { MOCK_CUSTOMER } from "@/lib/mock";
import { User, Mail, Shield, MapPin, Phone, Calendar } from "lucide-react";

export const Route = createFileRoute("/customer/profile")({
  component: CustomerProfilePage,
});

function CustomerProfilePage() {
  return (
    <VoxShell
      accent="black"
      portalLabel="Customer"
      user={{ name: MOCK_CUSTOMER.name, role: MOCK_CUSTOMER.role }}
      navItems={[
        { label: "Overview", icon: <User />, to: "/customer/" },
      ]}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500">Manage your personal information and security settings.</p>
        </div>

        <VoxCard className="p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white">
              {MOCK_CUSTOMER.name[0]}
            </div>
            <div className="flex-1 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <User className="h-4 w-4 text-slate-400" />
                    {MOCK_CUSTOMER.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {MOCK_CUSTOMER.name.toLowerCase().replace(" ", ".")}@example.com
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Phone className="h-4 w-4 text-slate-400" />
                    +91 98765 43210
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    Mumbai, India
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Type</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Premium Savings
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Since</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    January 2022
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <VoxButton>Edit Profile</VoxButton>
                <VoxButton variant="secondary">Security Settings</VoxButton>
              </div>
            </div>
          </div>
        </VoxCard>

        <VoxCard className="p-6 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Account Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Identity Verification</span>
              <span className="font-medium text-emerald-600">Verified</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Two-Factor Authentication</span>
              <span className="font-medium text-slate-900">Enabled</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Active Voxes</span>
              <span className="font-medium text-slate-900">2 Open</span>
            </div>
          </div>
        </VoxCard>
      </div>
    </VoxShell>
  );
}
