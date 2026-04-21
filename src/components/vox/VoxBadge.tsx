import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "p1"
  | "p2"
  | "p3"
  | "open"
  | "review"
  | "progress"
  | "resolved"
  | "positive"
  | "negative";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  p1: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
  p2: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  p3: "bg-slate-100 text-slate-700",
  open: "bg-blue-50 text-blue-700",
  review: "bg-indigo-50 text-indigo-700",
  progress: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700",
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-rose-50 text-rose-700",
};

export function VoxBadge({
  tone = "neutral",
  className,
  children,
  dot = false,
  ...props
}: { tone?: Tone; dot?: boolean } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
