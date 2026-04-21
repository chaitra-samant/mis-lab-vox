import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, Inbox, LineChart, ShieldCheck } from "lucide-react";
import { VoxLogo } from "@/components/vox/VoxLogo";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxButton } from "@/components/vox/VoxButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vox — The Intelligence Layer for Every Voice" },
      {
        name: "description",
        content:
          "Vox transforms raw customer complaints into structured, actionable intelligence for customer-facing teams and executives.",
      },
      { property: "og:title", content: "Vox — The Intelligence Layer for Every Voice" },
      {
        property: "og:description",
        content:
          "Vox transforms raw customer complaints into structured, actionable intelligence.",
      },
    ],
  }),
  component: LandingPage,
});

const portals = [
  {
    to: "/customer",
    label: "Customer",
    accent: "blue" as const,
    icon: MessageSquare,
    title: "Customer Portal",
    desc: "Submit, track, and follow the resolution of every Vox you raise — with full transparency.",
  },
  {
    to: "/agent",
    label: "Agent",
    accent: "indigo" as const,
    icon: Inbox,
    title: "Agent Workspace",
    desc: "A high-density worklist with sentiment, urgency, and SLA signals built-in.",
  },
  {
    to: "/ceo",
    label: "Executive",
    accent: "violet" as const,
    icon: LineChart,
    title: "Executive Intelligence",
    desc: "Strategic KPIs, financial exposure, and root-cause clusters — at a glance.",
  },
];

const accentBar = {
  blue: "bg-blue-600",
  indigo: "bg-indigo-600",
  violet: "bg-violet-600",
} as const;

const accentText = {
  blue: "text-blue-600",
  indigo: "text-indigo-600",
  violet: "text-violet-600",
} as const;

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top nav */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <VoxLogo />
          <nav className="flex items-center gap-6 text-sm">
            <a href="#portals" className="hidden text-slate-600 hover:text-slate-900 sm:inline">
              Portals
            </a>
            <a href="#why" className="hidden text-slate-600 hover:text-slate-900 sm:inline">
              Why Vox
            </a>
            <Link
              to="/login"
              className="text-slate-700 transition-colors hover:text-slate-900"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center sm:pt-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Vox CCIS · Complaint Intelligence System
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            The Intelligence Layer<br className="hidden sm:block" /> for Every Voice.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-500 sm:text-lg">
            Vox transforms raw customer complaints into structured, actionable
            intelligence — purpose-built for customer teams, agents, and the executive suite.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <VoxButton size="lg" asChild>
              <Link to="/login">
                Sign in to Vox <ArrowRight className="h-4 w-4" />
              </Link>
            </VoxButton>
            <VoxButton size="lg" variant="secondary" asChild>
              <a href="#portals">Explore portals</a>
            </VoxButton>
          </div>
        </div>

        {/* subtle grid backdrop */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
          }}
        />
      </section>

      {/* Portal selection */}
      <section id="portals" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Choose your portal
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Three lenses. One source of truth.
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {portals.map((p) => (
            <Link key={p.to} to={p.to} className="group block">
              <VoxCard accent={p.accent} interactive className="h-full p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white">
                    <p.icon className="h-5 w-5 text-slate-700" strokeWidth={1.5} />
                  </div>
                  <span className={`h-1.5 w-8 rounded-full ${accentBar[p.accent]} opacity-80`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                <div
                  className={`mt-6 inline-flex items-center gap-1.5 text-sm font-medium ${accentText[p.accent]}`}
                >
                  Enter portal
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </VoxCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Vox */}
      <section id="why" className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Built for regulated industries",
              desc: "Audit-grade trail, role-based access, and zero-export by default.",
            },
            {
              icon: LineChart,
              title: "Signal over noise",
              desc: "Sentiment, urgency, and root-cause clustering surface what matters.",
            },
            {
              icon: Inbox,
              title: "Workflow that disappears",
              desc: "Agents resolve more — Vox handles triage, routing, and SLA tracking.",
            },
          ].map((f) => (
            <div key={f.title}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                <f.icon className="h-4 w-4 text-slate-700" strokeWidth={1.6} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-[#F9FAFB]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-3">
            <VoxLogo size="sm" />
            <span>· Complaint Intelligence System</span>
          </div>
          <div>© {new Date().getFullYear()} Vox. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
