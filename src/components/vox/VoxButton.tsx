import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const voxButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950",
        secondary:
          "border border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-800 shadow-sm hover:to-slate-100",
        ghost: "text-slate-700 hover:bg-slate-100",
        outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface VoxButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof voxButtonVariants> {
  asChild?: boolean;
}

export const VoxButton = React.forwardRef<HTMLButtonElement, VoxButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(voxButtonVariants({ variant, size }), className)}
        suppressHydrationWarning
        {...props}
      />
    );
  },
);
VoxButton.displayName = "VoxButton";
