"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/user-menu";

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

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full bg-forest-dark shadow-[0_1px_0_oklch(1_0_0/0.08)]"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4 md:gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded font-mono-num text-base font-bold text-white shrink-0"
              style={{ backgroundColor: "oklch(0.43 0.14 157)" }}
              aria-hidden="true"
            >
              ∑
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-white text-base leading-tight">
                <span className="hidden sm:inline">Math for Business Operations</span>
                <span className="sm:hidden">Math for Business</span>
              </span>
              <span className="hidden md:block font-mono-num text-[10px] tracking-wider text-white/40 mt-0.5">
                Applied Accounting · Excel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-0.5 flex-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-body font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                    isActive
                      ? "text-white"
                      : "text-white/55 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: "oklch(0.60 0.16 157)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="ml-auto md:ml-0 flex items-center shrink-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
