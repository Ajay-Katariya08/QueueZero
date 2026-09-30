"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
  Activity,
  Compass,
  Clock,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinks = [
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/plan", label: "AI Predictor", icon: Clock },
    { href: "/report", label: "Report Live", icon: PlusCircle },
    { href: "/dashboard", label: "Business", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Activity className="size-4 animate-pulse" />
          </span>
          <span className="text-lg">
            Queue<span className="text-primary font-medium">Zero</span>
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
            LIVE
          </span>
        </Link>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon
                  className={`size-3.5 ${active ? "text-primary" : "text-muted-foreground"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <SignedOut>
            <div className="hidden sm:flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get Started</Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex size-9 items-center justify-center rounded-md border border-border bg-background"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-background/95 p-4 flex flex-col gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon
                  className={`size-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                />
                {item.label}
              </Link>
            );
          })}
          <SignedOut>
            <div className="pt-2 border-t border-border">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      )}
    </header>
  );
}
