import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, Inbox, LineChart, ShieldCheck } from "lucide-react";
import { VoxLogo } from "@/components/vox/VoxLogo";
import { VoxButton } from "@/components/vox/VoxButton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Features } from "@/components/ui/features-8";

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
    icon: MessageSquare,
    title: "Customer Portal",
    desc: "Submit, track, and follow the resolution of every Vox you raise — with full transparency.",
  },
  {
    to: "/employee",
    label: "Employee",
    icon: Inbox,
    title: "Employee Workspace",
    desc: "A high-density worklist with sentiment, urgency, and SLA signals built-in.",
  },
  {
    to: "/ceo",
    label: "Executive",
    icon: LineChart,
    title: "Executive Intelligence",
    desc: "Strategic KPIs, financial exposure, and root-cause clusters — at a glance.",
  },
];



function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top nav */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <VoxLogo />
          <nav className="flex items-center gap-6 text-sm">
            <a href="#portals" className="hidden text-slate-600 hover:text-slate-900 sm:inline">
              Portals
            </a>
            <a href="#why" className="hidden text-slate-600 hover:text-slate-900 sm:inline">
              Intelligence
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-medium text-slate-900 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-pulse" />
            Vox CCIS · Complaint Intelligence System
          </div>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-black sm:text-6xl">
            The Intelligence Layer<br className="hidden sm:block" /> for Every Voice.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-500 sm:text-lg">
            Vox transforms raw customer complaints into structured, actionable
            intelligence — purpose-built for customer teams, employees, and the executive suite.
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
        <div className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
            Enterprise Portals
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Three lenses. One source of truth.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {portals.map((p) => (
            <Link key={p.to} to={p.to} className="group block">
              <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200/60 bg-white">
                <CardContent className="p-8">
                  <div className="relative mb-8 flex aspect-square size-14 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5 transition-colors group-hover:bg-slate-50">
                    <p.icon className="m-auto size-6 text-slate-900" strokeWidth={1.5} />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950">
                      Enter Portal
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="h-1 w-12 rounded-full bg-slate-950 opacity-10 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* New Features Section */}
      <div id="why" className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl py-12 px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Enterprise Grade Intelligence
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Engineered for precision, speed, and absolute transparency.
            </p>
          </div>
          <Features />
        </div>
      </div>

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
