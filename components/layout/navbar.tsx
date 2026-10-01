"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
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
    { href: "/plan", label: "Predictor", icon: Clock },
    { href: "/report", label: "Report Live", icon: PlusCircle },
    { href: "/dashboard", label: "Business", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-mist bg-cream/90 backdrop-blur-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-medium tracking-tight text-forest"
        >
          <span className="flex size-7 items-center justify-center rounded-[7px] bg-forest text-white">
            <span className="size-2 rounded-full bg-sage" />
          </span>
          <span className="text-xl font-bold tracking-tight text-forest">
            Queue<span className="font-serif font-normal italic">Zero</span>
          </span>
        </Link>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-3.5 py-1.5 text-sm font-normal rounded-[7px] transition-colors ${
                  active
                    ? "bg-keylime text-forest"
                    : "text-charcoal hover:bg-keylime/60 hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <div className="hidden sm:flex items-center gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[7px] text-sm font-normal text-charcoal hover:bg-keylime"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="rounded-full bg-forest hover:bg-forest-shadow text-cream px-5 py-2 text-sm font-medium"
                >
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex size-9 items-center justify-center rounded-[7px] border border-border-mist bg-cream text-charcoal"
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
        <div className="md:hidden border-b border-border-mist bg-cream p-6 flex flex-col gap-2">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-normal rounded-[7px] transition-colors ${
                  active
                    ? "bg-keylime text-forest"
                    : "text-charcoal hover:bg-keylime/60 hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <SignedOut>
            <div className="pt-3 border-t border-border-mist flex flex-col gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-[7px] text-sm font-normal text-charcoal"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="w-full rounded-full bg-forest hover:bg-forest-shadow text-cream"
                >
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      )}
    </header>
  );
}
