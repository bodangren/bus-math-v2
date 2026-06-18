"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/preface", label: "Preface" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/capstone", label: "Capstone" },
  { href: "/backmatter/glossary", label: "Glossary" },
  { href: "/search", label: "Search" },
];

export function HeaderSimple() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center gap-4 md:gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <div
              className="flex items-center justify-center w-6 h-6 border border-foreground bg-foreground text-background font-mono text-sm font-bold shrink-0"
              aria-hidden="true"
            >
              ∑
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-foreground text-sm tracking-tight">
                <span className="hidden sm:inline uppercase">The Atomic Ledger</span>
                <span className="sm:hidden">Atomic Ledger</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 flex-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const isActive = mounted && pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="ml-auto flex items-center shrink-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
