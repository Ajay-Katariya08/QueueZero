import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type QueueBadgeProps = {
  waitMinutes: number;
  showIcon?: boolean;
  className?: string;
};

export function QueueBadge({ waitMinutes, className }: QueueBadgeProps) {
  if (waitMinutes <= 15) {
    return (
      <Badge variant="success" className={cn("gap-1.5 font-normal text-xs", className)}>
        <span className="size-1.5 rounded-full bg-[#0f3e17] animate-pulse" />
        {waitMinutes} min wait (Fast)
      </Badge>
    );
  }

  if (waitMinutes <= 35) {
    return (
      <Badge variant="warning" className={cn("gap-1.5 font-normal text-xs", className)}>
        <span className="size-1.5 rounded-full bg-[#0f3e17] animate-pulse" />
        {waitMinutes} min wait (Moderate)
      </Badge>
    );
  }

  return (
    <Badge variant="slate" className={cn("gap-1.5 font-normal text-xs", className)}>
      <span className="size-1.5 rounded-full bg-[#0f3e17] animate-pulse" />
      {waitMinutes} min wait (Heavy)
    </Badge>
  );
}
