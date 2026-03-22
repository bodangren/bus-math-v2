"use client";

import Link from "next/link";
import { Calculator, TrendingUp } from "lucide-react";
import { UserMenu } from "@/components/user-menu";

export function HeaderSimple() {
  return (
    <header role="banner" className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
          {/* Logo */}
          <div className="flex flex-col min-w-0 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              <div className="flex items-center gap-1 flex-shrink-0">
                <Calculator className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              </div>
              <span className="hidden sm:inline">Math for Business Operations</span>
              <span className="sm:hidden">Math for Business</span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Applied Accounting with Excel
            </p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-wrap items-center gap-4 flex-shrink-0">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/preface"
              className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              Preface
            </Link>
            <Link
              href="/curriculum"
              className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              Curriculum
            </Link>
            <Link
              href="/capstone"
              className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              Capstone
            </Link>
            <Link
              href="/backmatter/glossary"
              className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              Glossary
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              Search
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-auto">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
