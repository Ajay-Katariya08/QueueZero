import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3e17] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#0f3e17] text-[#fffefc] hover:bg-[#0c2f10] font-medium border-0",
        destructive:
          "bg-[#9e2a2b] text-[#fffefc] hover:bg-[#7e1f20]",
        outline:
          "border border-[#efeeeb] bg-[#fffefc] text-[#0f3e17] hover:bg-[#e1f4df]",
        outlineWhite:
          "border border-[#efeeeb] bg-transparent text-[#0f3e17] hover:bg-[#cfe7d3]",
        secondary:
          "bg-[#cfe7d3] text-[#0f3e17] hover:bg-[#b1dbb8]",
        ghost: "hover:bg-[#e1f4df] text-[#0f3e17]",
        link: "text-[#0f3e17] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-7 text-base font-medium",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
