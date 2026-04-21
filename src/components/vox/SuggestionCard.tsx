import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { VoxCard } from "./VoxCard";
import { VoxButton } from "./VoxButton";

interface SuggestionCardProps {
  title: string;
  body: string;
  onResolve: () => void;
  onDismiss: () => void;
}

export function SuggestionCard({ title, body, onResolve, onDismiss }: SuggestionCardProps) {
  return (
    <VoxCard className="relative overflow-hidden bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4">
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600"
        aria-label="Dismiss suggestion"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
          
          <div className="mt-3 flex items-center gap-3">
            <VoxButton size="sm" onClick={onResolve}>
              This resolved my issue
            </VoxButton>
            <VoxButton variant="ghost" size="sm" onClick={onDismiss} className="text-slate-500 hover:bg-slate-200/50">
              Continue to submit
            </VoxButton>
          </div>
        </div>
      </div>
    </VoxCard>
  );
}
