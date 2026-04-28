import { cn } from "@/lib/utils";

export function VoxLogo({ 
  className, 
  size = "md",
  accent = "black"
}: { 
  className?: string; 
  size?: "sm" | "md" | "lg";
  accent?: "blue" | "emerald" | "violet" | "black";
}) {
  const dim = size === "sm" ? "h-6" : size === "lg" ? "h-9" : "h-7";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  
  const colors = {
    black: { bg: "bg-slate-900", text: "text-slate-900" },
    blue: { bg: "bg-blue-600", text: "text-blue-900" },
    emerald: { bg: "bg-emerald-600", text: "text-emerald-900" },
    violet: { bg: "bg-violet-600", text: "text-violet-900" },
  }[accent];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-md text-white transition-colors duration-200",
          dim,
          colors.bg
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-3/5 w-3/5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M4 8 L9 18 L14 8" />
          <circle cx="18.5" cy="9" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <span className={cn("font-semibold tracking-tight transition-colors duration-200", text, colors.text)}>Vox</span>
    </div>
  );
}
