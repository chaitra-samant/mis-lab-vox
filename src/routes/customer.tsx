import { useState, useMemo } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getUserRole } from "@/lib/auth";
import {
  Home,
  MessageSquare,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  ArrowLeft,
  X,
  UploadCloud,
} from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxButton } from "@/components/vox/VoxButton";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { VoxInput, VoxLabel, VoxTextarea } from "@/components/vox/VoxInput";
import { SuggestionCard } from "@/components/vox/SuggestionCard";
import { cn } from "@/lib/utils";
import { submitMockComplaint, MOCK_CUSTOMER, MOCK_FAQS, getMockComplaints } from "@/lib/mock";
import { formatDistanceToNow } from "date-fns";

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

const categories = [
  "Payments & Transfers",
  "Card & ATM",
  "Account & Statements",
  "Verification (KYC)",
  "Digital Banking",
  "Other",
];

const products = ["Savings Account", "Current Account", "Credit Card", "UPI", "Personal Loan", "Home Loan"];
const preferredResolutions = ["Refund", "Account Unblock", "Fee Reversal", "Explanation", "Update Details"];

function CustomerPortal() {
  const [open, setOpen] = useState(false);
  
  const complaints = getMockComplaints();
  const recent = complaints.slice(0, 4);
  const openCount = complaints.filter(c => c.status === "Open" || c.status === "In Review").length;
  const progressCount = complaints.filter(c => c.status === "In Progress").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length;

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
          {[
            { label: "Open", value: openCount, tone: "open" as const, hint: "Awaiting or in triage" },
            { label: "In Progress", value: progressCount, tone: "progress" as const, hint: "Currently being resolved" },
            { label: "Resolved (30d)", value: resolvedCount, tone: "resolved" as const, hint: "Completed and closed" },
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
          ))}
        </div>

        {/* Ticket progress - Top active ticket */}
        {complaints.length > 0 && complaints[0].status !== "Resolved" && complaints[0].status !== "Closed" && (
          <VoxCard className="p-6">
            <div className="mb-1 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Ticket progress
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">
                  {complaints[0].id} · {complaints[0].subject}
                </h2>
              </div>
              <VoxBadge tone={complaints[0].status === "In Progress" ? "progress" : "open"} dot>
                {complaints[0].status}
              </VoxBadge>
            </div>

            <ProgressTracker activeIndex={complaints[0].status === "In Progress" ? 2 : complaints[0].status === "Open" ? 0 : 1} />

            <div className="mt-5 grid gap-4 border-t border-slate-200/60 pt-5 sm:grid-cols-3">
              <Meta label="Reference" value={complaints[0].id} />
              <Meta label="Assigned to" value={complaints[0].assignedTo || "Pending Assignment"} />
              <Meta label="Updated" value={formatDistanceToNow(new Date(complaints[0].updatedAt), { addSuffix: true })} />
            </div>
          </VoxCard>
        )}

        {/* Recent voxes */}
        <VoxCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Voxes</h2>
            <Link to="/customer/complaints" className="text-xs font-medium text-slate-500 hover:text-slate-900">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-200/60">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="font-mono text-xs text-slate-400">{r.id}</span>
                  <span className="truncate text-sm text-slate-900">{r.subject}</span>
                </div>
                <div className="flex items-center gap-4">
                  <VoxBadge 
                    tone={
                      r.status === "Resolved" ? "resolved" : 
                      r.status === "In Progress" ? "progress" : 
                      r.status === "In Review" ? "review" : "open"
                    } 
                    dot={r.status !== "Resolved"}
                  >
                    {r.status}
                  </VoxBadge>
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    {formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </VoxCard>
      </div>

      {open && <NewVoxDialog onClose={() => { setOpen(false); window.location.reload(); }} />}
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

function NewVoxDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<string | null>(null);
  const [product, setProduct] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [prefRes, setPrefRes] = useState("");
  const [financialLoss, setFinancialLoss] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  
  // Suggestion State
  const [showSuggestions, setShowSuggestions] = useState(true);
  const matchedSuggestion = useMemo(() => {
    if (details.length < 20) return null;
    return MOCK_FAQS.find(faq => details.toLowerCase().includes(faq.keyword));
  }, [details]);

  const canProceed = () => {
    switch (step) {
      case 0: return !!category;
      case 1: return !!product && !!MOCK_CUSTOMER.phone;
      case 2: return !!subject && details.length >= 30;
      case 3: return true; // Suggestions step is optional
      default: return true;
    }
  };

  const next = () => {
    if (step === 2 && !matchedSuggestion) {
      setStep(4); // Skip suggestions if none matched
    } else {
      setStep((s) => Math.min(s + 1, 4));
    }
  };
  const back = () => {
    if (step === 4 && !matchedSuggestion) {
      setStep(2);
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
  };

  const submit = () => {
    const vox = submitMockComplaint({
      category,
      product,
      subject,
      details,
      financialLoss
    });
    setSubmittedId(vox.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 3) {
        alert("Maximum 3 files allowed.");
        return;
      }
      const valid = newFiles.every(f => f.size <= 5 * 1024 * 1024);
      if (!valid) {
        alert("Files must be under 5MB each.");
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <VoxCard className="relative flex flex-col w-full max-w-xl max-h-full overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/60 bg-white px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {submittedId ? "Vox submitted" : "Submit a new Vox"}
            </h2>
            {!submittedId && (
              <p className="text-xs text-slate-500">
                Step {step === 4 ? 4 : step + 1} of 4 · {["Category", "Details", "Issue", "Suggestions", "Review"][step]}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!submittedId && (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex gap-1.5">
              {[0, 1, 2, 4].map((logicalStep, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    (step === 3 ? 4 : step) >= logicalStep ? "bg-slate-900" : "bg-slate-200",
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {submittedId ? (
            <div className="py-6 text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Your Vox is successfully registered.</h3>
              <p className="mt-2 text-sm text-slate-500">
                Reference ID: <span className="font-mono text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded">{submittedId}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                We'll triage your request within 4 business hours.
              </p>
              <VoxButton className="mt-8" onClick={onClose}>
                Back to Dashboard
              </VoxButton>
            </div>
          ) : step === 0 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-sm font-medium text-slate-900 mb-3">What does your Vox relate to?</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); next(); }}
                    className={cn(
                      "rounded-lg border px-4 py-4 text-left text-sm transition-colors",
                      category === c
                        ? "border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-1"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <VoxLabel>Product</VoxLabel>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  <option value="" disabled>Select a product/service</option>
                  {products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <VoxLabel>Name</VoxLabel>
                  <VoxInput value={MOCK_CUSTOMER.name} disabled />
                </div>
                <div className="space-y-1.5">
                  <VoxLabel>Phone</VoxLabel>
                  <VoxInput value={MOCK_CUSTOMER.phone} disabled />
                </div>
              </div>
              <div className="space-y-1.5">
                <VoxLabel>Email</VoxLabel>
                <VoxInput value={MOCK_CUSTOMER.email} disabled />
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <VoxLabel htmlFor="subject">Subject</VoxLabel>
                <VoxInput
                  id="subject"
                  placeholder="Summarize the issue in a few words"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <VoxLabel htmlFor="details">Details</VoxLabel>
                  <span className="text-[10px] text-slate-400">{details.length > 0 ? (details.length >= 30 ? "Looks good" : "Min 30 chars") : ""}</span>
                </div>
                <VoxTextarea
                  id="details"
                  placeholder="Describe what happened, when, and include any relevant IDs..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="h-28"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <VoxLabel>Preferred Resolution <span className="lowercase text-[10px] font-normal">(Optional)</span></VoxLabel>
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={prefRes}
                    onChange={(e) => setPrefRes(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {preferredResolutions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <VoxLabel>Fin. Loss <span className="lowercase text-[10px] font-normal">(Optional)</span></VoxLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                    <VoxInput 
                      placeholder="Amount" 
                      className="pl-7" 
                      type="number" 
                      value={financialLoss} 
                      onChange={(e) => setFinancialLoss(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <VoxLabel className="mb-2 block">Attachments <span className="lowercase text-[10px] font-normal">(Max 3)</span></VoxLabel>
                <div className="flex gap-3">
                  <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 px-4 text-sm font-medium text-slate-600 transition-colors w-full sm:w-auto">
                    <UploadCloud className="h-4 w-4" /> Choose Files
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded p-2 text-slate-700">
                        <span className="truncate max-w-[200px]">{f.name}</span>
                        <button 
                          className="text-slate-400 hover:text-red-500"
                          onClick={() => setFiles(files.filter((_, index) => index !== i))}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : step === 3 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">We might have an answer right now</h3>
                <p className="text-sm text-slate-500 mb-8 mx-auto max-w-sm">Based on your description, this might instantly solve your problem without waiting for an agent.</p>
                
                {matchedSuggestion && showSuggestions && (
                  <div className="text-left mx-auto max-w-md">
                    <SuggestionCard 
                      title={matchedSuggestion.title}
                      body={matchedSuggestion.body}
                      onResolve={() => {
                        console.log("Deflection logged for suggestion", matchedSuggestion?.title);
                        setSubmittedId("DEFLECTED");
                      }}
                      onDismiss={() => {
                        setShowSuggestions(false);
                        next();
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 mb-4">
                <h4 className="text-sm font-semibold text-indigo-900">Ready to submit</h4>
                <p className="text-xs text-indigo-700 mt-1">Please review the details below. Once submitted, it will be immediately queued for triage.</p>
              </div>

              <dl className="space-y-4 text-sm p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                <Row label="Category" value={category ?? "—"} />
                <Row label="Product" value={product || "—"} />
                <Row label="Subject" value={subject || "—"} />
                <Row label="Details" value={details || "—"} multiline />
                <Row label="Resolution" value={prefRes || "Standard process"} />
                <Row label="Attachments" value={files.length ? `${files.length} file(s)` : "None"} />
              </dl>
              
              <label className="flex items-start gap-3 p-2">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" required />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I consent to the processing of this information to resolve my query. I confirm the details provided are accurate.
                </span>
              </label>
            </div>
          )}
        </div>

        {!submittedId && (
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200/60 bg-slate-50/50 px-6 py-4">
            <VoxButton variant="ghost" size="sm" onClick={back} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" /> Back
            </VoxButton>
            {step < 4 ? (
              <VoxButton size="sm" onClick={next} disabled={!canProceed()}>
                Continue <ArrowRight className="h-4 w-4" />
              </VoxButton>
            ) : (
              <VoxButton size="sm" onClick={submit}>
                Submit Vox
              </VoxButton>
            )}
          </div>
        )}
      </VoxCard>
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={cn("col-span-2 text-slate-900 font-medium", multiline && "whitespace-pre-wrap font-normal leading-relaxed")}>{value}</dd>
    </div>
  );
}
