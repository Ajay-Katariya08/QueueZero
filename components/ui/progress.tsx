"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui-components/react/progress";
import { cn } from "@/lib/utils";

export type ProgressProps = React.ComponentPropsWithoutRef<typeof BaseProgress.Root> & {
  value?: number;
};

export const Progress = React.forwardRef<
  React.ComponentRef<typeof BaseProgress.Root>,
  ProgressProps
>(({ className, value = 0, ...props }, ref) => (
  <BaseProgress.Root
    ref={ref}
    value={value}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <BaseProgress.Track className="h-full w-full">
      <BaseProgress.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-300"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </BaseProgress.Track>
  </BaseProgress.Root>
));
Progress.displayName = "Progress";
