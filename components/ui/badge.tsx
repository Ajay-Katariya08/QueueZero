import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3.5 py-1 text-xs font-normal transition-colors focus:outline-none shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#fffefc] text-[#0f3e17] border border-[#efeeeb]",
        secondary:
          "bg-[#cfe7d3] text-[#0f3e17] border-0",
        destructive:
          "bg-[#fbeaea] text-[#9e2a2b] border-0",
        outline:
          "border border-[#0f3e17]/20 text-[#0f3e17] bg-transparent",
        success:
          "bg-[#e1f4df] text-[#0f3e17] border-0",
        warning:
          "bg-[#b1dbb8] text-[#0f3e17] border-0",
        slate:
          "bg-[#b6ced5] text-[#0f3e17] border-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
