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
      <Badge variant="success" className={cn("gap-1 font-semibold", className)}>
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {waitMinutes} min wait (Fast)
      </Badge>
    );
  }

  if (waitMinutes <= 35) {
    return (
      <Badge variant="warning" className={cn("gap-1 font-semibold", className)}>
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        {waitMinutes} min wait (Moderate)
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={cn("gap-1 font-semibold", className)}>
      <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
      {waitMinutes} min wait (Heavy)
    </Badge>
  );
}
