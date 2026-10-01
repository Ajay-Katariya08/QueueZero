import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#efeeeb] bg-[#fffefc] py-12 text-xs text-[#222222]/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-10">
        <div className="flex items-center gap-2.5 font-medium text-[#0f3e17]">
          <span className="flex size-6 items-center justify-center rounded-[7px] bg-[#0f3e17] text-white">
            <span className="size-1.5 rounded-full bg-[#b1dbb8]" />
          </span>
          <span className="font-bold text-sm">QueueZero</span>
          <span className="text-[#222222]/60">- Know Before You Go</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/explore"
            className="hover:text-[#0f3e17] transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/plan"
            className="hover:text-[#0f3e17] transition-colors"
          >
            Predictor
          </Link>
          <Link
            href="/report"
            className="hover:text-[#0f3e17] transition-colors"
          >
            Report Live
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-[#0f3e17] transition-colors"
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
