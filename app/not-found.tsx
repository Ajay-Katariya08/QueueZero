import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center p-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
        <Compass className="size-7 animate-spin" />
      </span>
      <h1 className="text-3xl font-black tracking-tight">Location Not Found</h1>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
        The venue or operational counter you are looking for has been relocated or is offline.
      </p>
      <div className="flex gap-2">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" /> Back Home
          </Button>
        </Link>
        <Link href="/explore">
          <Button size="sm" className="text-xs">
            Explore Live Venues
          </Button>
        </Link>
      </div>
    </div>
  );
}
