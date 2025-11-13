"use client";

import Link from "next/link";
import { Search, Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeaderSimple() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex flex-col min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground hover:opacity-80 transition-opacity"
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
          <nav className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/frontmatter/preface"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Preface
            </Link>
            <Link
              href="/capstone"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Capstone
            </Link>
            <Link
              href="/backmatter/glossary"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Glossary
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Search
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <Input
              type="search"
              placeholder="Search..."
              className="w-40 lg:w-64 border-border/50 bg-background/50 focus:bg-background transition-colors"
            />
            <Button
              size="sm"
              variant="outline"
              className="border-border/50 hover:bg-accent/50"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
