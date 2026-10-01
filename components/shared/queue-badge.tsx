import { cn } from "@/lib/utils";

export type QueueBadgeProps = {
  waitMinutes: number;
  showIcon?: boolean;
  className?: string;
};

export function QueueBadge({ waitMinutes, className }: QueueBadgeProps) {
  const status =
    waitMinutes <= 15
      ? {
          label: "Fast",
          dotColor: "bg-emerald-600",
          pingColor: "bg-emerald-400",
        }
      : waitMinutes <= 35
        ? {
            label: "Moderate",
            dotColor: "bg-amber-600",
            pingColor: "bg-amber-400",
          }
        : {
            label: "Heavy",
            dotColor: "bg-rose-600",
            pingColor: "bg-rose-400",
          };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#fffefc] border border-[#efeeeb] px-2.5 sm:px-3 py-1 text-xs font-normal text-[#0f3e17]  whitespace-nowrap shrink-0",
        className,
      )}
    >
      <span className="relative flex size-2 shrink-0">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            status.pingColor,
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            status.dotColor,
          )}
        />
      </span>
      <span className="font-medium text-[#0f3e17]">{waitMinutes} min wait</span>
      <span className="text-[#222222]/60 text-[11px]">({status.label})</span>
    </div>
  );
}
