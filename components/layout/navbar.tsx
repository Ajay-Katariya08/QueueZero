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
    <header className="sticky top-0 z-40 w-full border-b border-[#efeeeb] bg-[#fffefc]/90 backdrop-blur-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-medium tracking-tight text-[#0f3e17]"
        >
          <span className="flex size-7 items-center justify-center rounded-[7px] bg-[#0f3e17] text-white">
            <span className="size-2 rounded-full bg-[#b1dbb8]" />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#0f3e17]">
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
                    ? "bg-[#e1f4df] text-[#0f3e17]"
                    : "text-[#222222] hover:bg-[#e1f4df]/60 hover:text-[#0f3e17]"
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
                  className="rounded-[7px] text-sm font-normal text-[#222222] hover:bg-[#e1f4df]"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="rounded-full bg-[#0f3e17] hover:bg-[#0c2f10] text-[#fffefc] px-5 py-2 text-sm font-medium"
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
            className="md:hidden inline-flex size-9 items-center justify-center rounded-[7px] border border-[#efeeeb] bg-[#fffefc] text-[#222222]"
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
        <div className="md:hidden border-b border-[#efeeeb] bg-[#fffefc] p-6 flex flex-col gap-2">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-normal rounded-[7px] transition-colors ${
                  active
                    ? "bg-[#e1f4df] text-[#0f3e17]"
                    : "text-[#222222] hover:bg-[#e1f4df]/60 hover:text-[#0f3e17]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <SignedOut>
            <div className="pt-3 border-t border-[#efeeeb] flex flex-col gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-[7px] text-sm font-normal text-[#222222]"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="w-full rounded-full bg-[#0f3e17] hover:bg-[#0c2f10] text-[#fffefc]"
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
