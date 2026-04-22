import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MessageSquare,
  Inbox,
  LineChart,
  Menu,
  X,
  Settings,
  Bell,
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoxLogo } from "./VoxLogo";
import { VoxButton } from "./VoxButton";

export type PortalAccent = "blue" | "indigo" | "violet";

const accentClasses = {
  blue: {
    activeBg: "bg-blue-50 text-blue-700",
    activeBar: "bg-blue-600",
    dot: "bg-blue-600",
    label: "text-blue-700",
  },
  indigo: {
    activeBg: "bg-indigo-50 text-indigo-700",
    activeBar: "bg-indigo-600",
    dot: "bg-indigo-600",
    label: "text-indigo-700",
  },
  violet: {
    activeBg: "bg-violet-50 text-violet-700",
    activeBar: "bg-violet-600",
    dot: "bg-violet-600",
    label: "text-violet-700",
  },
} as const;

const portals = [
  { to: "/customer", label: "Customer", icon: MessageSquare, accent: "blue" as const },
  { to: "/agent", label: "Agent", icon: Inbox, accent: "indigo" as const },
  { to: "/ceo", label: "Executive", icon: LineChart, accent: "violet" as const },
];

interface NavItem {
  label: string;
  to?: string;
  icon: ReactNode;
  active?: boolean;
}

interface VoxShellProps {
  accent: PortalAccent;
  portalLabel: string;
  navItems?: NavItem[];
  user?: { name: string; role: string };
  children: ReactNode;
}

export function VoxShell({ accent, portalLabel, navItems = [], user, children }: VoxShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const a = accentClasses[accent];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-5">
        <VoxLogo />
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {portalLabel} Portal
          </span>
        </div>
      </div>

      <nav role="navigation" aria-label="Portal navigation" className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Wrapper: any = item.to ? Link : "div";
          return (
            <Wrapper
              key={item.label}
              {...(item.to ? { to: item.to } : {})}
              aria-label={item.label}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? a.activeBg
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <span className="[&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Wrapper>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200/60 px-3 py-3">
        <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          Switch Portal
        </div>
        {portals.map((p) => {
          const isActive = p.label.toLowerCase() === portalLabel.toLowerCase();
          const pa = accentClasses[p.accent];
          return (
            <Link
              key={p.to}
              to={p.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? cn(pa.activeBg, "font-medium")
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <p.icon className="h-3.5 w-3.5" />
              {p.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-slate-200/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {user?.name?.[0] ?? "V"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-900">{user?.name ?? "Demo User"}</div>
            <div className="truncate text-xs text-slate-500">{user?.role ?? portalLabel}</div>
          </div>
          <button
            onClick={async () => {
              const { signOut } = await import("@/lib/auth");
              await signOut();
              // force reload using window.location to ensure stores/cache clear 
              // and beforeLoad redirects to login correctly
              window.location.href = "/login";
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-slate-200/60 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-slate-200/60 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="vox-global-search"
              type="search"
              placeholder="Search Voxes, accounts, themes…"
              aria-label="Search Voxes, accounts, and themes"
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <VoxButton variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </VoxButton>
            <VoxButton variant="ghost" size="icon" aria-label="Settings">
              <Settings />
            </VoxButton>
          </div>
        </header>

        <main role="main" id="vox-main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
