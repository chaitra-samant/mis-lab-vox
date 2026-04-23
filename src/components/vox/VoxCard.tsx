import * as React from "react";
import { cn } from "@/lib/utils";

type AccentColor = "slate" | "blue" | "indigo" | "violet" | "emerald" | "none";

interface VoxCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: AccentColor;
  interactive?: boolean;
}

const accentMap: Record<AccentColor, string> = {
  slate: "before:bg-slate-900",
  blue: "before:bg-blue-600",
  indigo: "before:bg-indigo-600",
  violet: "before:bg-violet-600",
  emerald: "before:bg-emerald-600",
  none: "",
};

export const VoxCard = React.forwardRef<HTMLDivElement, VoxCardProps>(
  ({ className, accent = "none", interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl border border-slate-200/60 bg-white shadow-sm",
        accent !== "none" &&
          cn(
            "before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-xl before:opacity-0 before:transition-opacity",
            accentMap[accent],
          ),
        interactive &&
          "transition-all hover:-translate-y-0.5 hover:shadow-md hover:before:opacity-100",
        className,
      )}
      {...props}
    />
  ),
);
VoxCard.displayName = "VoxCard";
