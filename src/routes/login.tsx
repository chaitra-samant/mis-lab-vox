import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { VoxLogo } from "@/components/vox/VoxLogo";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxButton } from "@/components/vox/VoxButton";
import { VoxInput, VoxLabel } from "@/components/vox/VoxInput";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Vox" },
      { name: "description", content: "Sign in to Vox to access your Customer, Agent, or Executive portal." },
      { property: "og:title", content: "Sign in — Vox" },
      { property: "og:description", content: "Access Vox's Customer, Agent, and Executive portals." },
    ],
  }),
  component: LoginPage,
});

const personas = [
  { label: "Customer", email: "rahul.sharma@gmail.com", to: "/customer" as const },
  { label: "Agent", email: "priya@aurabank.in", to: "/agent" as const },
  { label: "CEO", email: "ceo@aurabank.in", to: "/ceo" as const },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // We no longer need target since we dynamically route based on role

  const applyPersona = (p: (typeof personas)[number]) => {
    setEmail(p.email);
    setPassword(p.label === "Customer" ? "Customer@2026" : "AuraBank@2026");
    setErrorMsg(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { getRoleRedirectPath } = await import("@/lib/auth");

    if (import.meta.env.VITE_USE_MOCK_AUTH === "true") {
      // Mock flow
      const selectedPersona = personas.find(p => p.email === email);
      const role = selectedPersona?.label.toLowerCase();
      
      if (!role) {
        setErrorMsg("Please use one of the demo persona emails for mock login.");
        setLoading(false);
        return;
      }
      
      localStorage.setItem("vox_mock_role", role === "executive" ? "ceo" : role);
      navigate({ to: getRoleRedirectPath(role === "executive" ? "ceo" : role as any) });
      return;
    }

    const { supabase } = await import("@/lib/supabase");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setErrorMsg(error?.message || "Login failed");
      setLoading(false);
      return;
    }

    const role = data.user.user_metadata?.role;
    const redirectPath = getRoleRedirectPath(role);
    
    // We use a full window location replace here to clear router state 
    // and force a fresh load which will trigger beforeLoad checks
    // Alternatively navigate({ to: redirectPath }) would work, but wait
    // using navigate is safer for client side routing.
    navigate({ to: redirectPath });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <header className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/">
            <VoxLogo />
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your Vox workspace.
            </p>
          </div>

          <VoxCard className="p-7">
            {errorMsg && (
              <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600">
                {errorMsg}
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <VoxLabel htmlFor="email">Email</VoxLabel>
                <VoxInput
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <VoxLabel htmlFor="password">Password</VoxLabel>
                  <a href="#" className="text-xs font-medium text-slate-500 hover:text-slate-900">
                    Forgot password?
                  </a>
                </div>
                <VoxInput
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <VoxButton type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"} <ArrowRight className="ml-2 h-4 w-4" />
              </VoxButton>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200/70" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Switch Persona
              </span>
              <div className="h-px flex-1 bg-slate-200/70" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {personas.map((p) => (
                <VoxButton
                  key={p.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPersona(p)}
                >
                  {p.label}
                </VoxButton>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Click a persona to auto-fill demo credentials, then Sign in.
            </p>
          </VoxCard>

          <p className="mt-6 text-center text-xs text-slate-500">
            New to Vox? <a href="#" className="font-medium text-slate-900 hover:underline">Request access</a>
          </p>
        </div>
      </main>
    </div>
  );
}
