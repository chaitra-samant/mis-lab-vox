import { useState, useMemo } from "react";
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { VoxCard } from "./VoxCard";
import { VoxButton } from "./VoxButton";
import { VoxInput, VoxLabel, VoxTextarea } from "./VoxInput";
import { VoxFileUpload } from "./VoxFileUpload";
import { SuggestionCard } from "./SuggestionCard";
import { cn } from "@/lib/utils";
import { MOCK_CUSTOMER } from "@/lib/mock";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitComplaint, getSuggestions } from "@/lib/server/complaints";
import { supabase } from "@/lib/supabase";

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

interface NewVoxDialogProps {
  onClose: () => void;
}

export function NewVoxDialog({ onClose }: NewVoxDialogProps) {
  const [step, setStep] = useState(0);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [category, setCategory] = useState<string | null>(null);
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [preferredResolution, setPreferredResolution] = useState("");
  const [financialLoss, setFinancialLoss] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  
  const queryClient = useQueryClient();

  // Suggestions Logic
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [matchedSuggestions, setMatchedSuggestions] = useState<any[]>([]);

  const mutation = useMutation({
    mutationFn: (payload: any) => submitComplaint(payload),
    onSuccess: (data) => {
      setSubmittedId(data.id);
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  });

  const canProceed = () => {
    switch (step) {
      case 0: return !!category;
      case 1: return !!product;
      case 2: return description.length >= 30;
      default: return true;
    }
  };

  const fetchSuggestions = async () => {
    if (description.length < 20) return;
    
    // Extract keywords from description (simple heuristic)
    const commonKeywords = ["atm", "payment", "upi", "kyc", "card", "account", "login", "app", "refund", "fee"];
    const foundKeywords = commonKeywords.filter(k => description.toLowerCase().includes(k));
    
    if (foundKeywords.length > 0) {
      const results = await getSuggestions({ keywords: foundKeywords });
      setMatchedSuggestions(results);
    }
  };

  const next = async () => {
    if (step === 2) {
      await fetchSuggestions();
      if (matchedSuggestions.length === 0) {
        setStep(4); // Skip suggestions if none matched
      } else {
        setStep(3);
      }
    } else {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const back = () => {
    if (step === 4 && matchedSuggestions.length === 0) {
      setStep(2);
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
  };

  const uploadFiles = async (complaintId: string) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${complaintId}/${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      console.log(`Uploading ${file.name} to ${fileName}...`);
      
      const { data, error } = await supabase.storage
        .from("vox-attachments")
        .upload(fileName, file);
      
      if (error) {
        console.error("Upload error:", error);
        continue; // Continue with other files if one fails
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from("vox-attachments")
        .getPublicUrl(fileName);
      
      urls.push(publicUrl);
    }
    return urls;
  };

  const submit = async () => {
    setIsSubmitting(true);
    
    // 1. Upload files first (optional, we could also do it after getting ID)
    // We'll do it after if we want to use the ID as folder name, or before if we have a temp ID.
    // Let's get the ID from the server first by submitting without attachments, then update.
    // Actually, let's just submit with a placeholder and update later or just use a random folder.
    
    const tempId = Math.random().toString(36).substring(7);
    const attachmentUrls = await uploadFiles(tempId);

    mutation.mutate({
      category,
      product,
      description,
      preferred_resolution: preferredResolution,
      financial_loss_customer: financialLoss ? parseFloat(financialLoss) : null,
      attachment_urls: attachmentUrls,
    });
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
                Reference ID: <span className="font-mono text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded">{submittedId.split("-")[0].toUpperCase()}</span>
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
                    onClick={() => { setCategory(c); setStep(1); }}
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
                <div className="flex justify-between items-end">
                  <VoxLabel htmlFor="description">Details</VoxLabel>
                  <span className="text-[10px] text-slate-400">{description.length > 0 ? (description.length >= 30 ? "Looks good" : "Min 30 chars") : ""}</span>
                </div>
                <VoxTextarea
                  id="description"
                  placeholder="Describe what happened, when, and include any relevant IDs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <VoxLabel>Preferred Resolution <span className="lowercase text-[10px] font-normal">(Optional)</span></VoxLabel>
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={preferredResolution}
                    onChange={(e) => setPreferredResolution(e.target.value)}
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
                <VoxLabel className="mb-2 block">Attachments <span className="lowercase text-[10px] font-normal">(Optional)</span></VoxLabel>
                <VoxFileUpload
                  accept="image/*,.pdf,.doc,.docx"
                  maxSizeMB={5}
                  onFileSelected={(file) => setFiles((prev) => [...prev.slice(-2), file])}
                />
                {files.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">{files.length} file(s) selected</p>
                )}
              </div>
            </div>
          ) : step === 3 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">We might have an answer right now</h3>
                <p className="text-sm text-slate-500 mb-8 mx-auto max-w-sm">Based on your description, this might instantly solve your problem without waiting for an agent.</p>
                
                <div className="space-y-4 text-left mx-auto max-w-md">
                  {matchedSuggestions.map((suggestion, idx) => (
                    <SuggestionCard 
                      key={idx}
                      title={suggestion.title}
                      body={suggestion.answer}
                      onResolve={() => {
                        console.log("Deflection logged for suggestion", suggestion.title);
                        setSubmittedId("DEFLECTED");
                      }}
                      onDismiss={() => {
                        setStep(4);
                      }}
                    />
                  ))}
                </div>
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
                <Row label="Details" value={description || "—"} multiline />
                <Row label="Resolution" value={preferredResolution || "Standard process"} />
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
            <VoxButton variant="ghost" size="sm" onClick={back} disabled={step === 0 || isSubmitting}>
              <ArrowLeft className="h-4 w-4" /> Back
            </VoxButton>
            {step < 4 ? (
              <VoxButton size="sm" onClick={next} disabled={!canProceed() || isSubmitting}>
                Continue <ArrowRight className="h-4 w-4" />
              </VoxButton>
            ) : (
              <VoxButton size="sm" onClick={submit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isSubmitting ? "Submitting..." : "Submit Vox"}
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
