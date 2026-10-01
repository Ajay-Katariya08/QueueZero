import * as React from "react";
import { cva, type VariantProps } from "cnfast";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3.5 py-1 text-xs font-normal transition-colors focus:outline-none shadow-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-cream text-forest border border-border-mist",
        secondary:
          "bg-mint text-forest border-0",
        destructive:
          "bg-destructive/15 text-destructive border-0",
        outline:
          "border border-forest/20 text-forest bg-transparent",
        success:
          "bg-keylime text-forest border-0",
        warning:
          "bg-sage text-forest border-0",
        slate:
          "bg-slate-hush text-forest border-0",
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
