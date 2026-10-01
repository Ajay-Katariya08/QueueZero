import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 py-6 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-3" />
          </span>
          <span>QueueZero</span>
          <span className="text-muted-foreground">- Know Before You Go</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/explore"
            className="hover:text-foreground transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/plan"
            className="hover:text-foreground transition-colors"
          >
            Planner
          </Link>
          <Link
            href="/report"
            className="hover:text-foreground transition-colors"
          >
            Contribute Report
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            For Operators
          </Link>
        </div>

        <p>
          © {new Date().getFullYear()} QueueZero. Crowdsourced queue
          intelligence.
        </p>
      </div>
    </footer>
  );
}
