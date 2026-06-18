import Link from 'next/link'

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-6 h-6 border border-foreground bg-foreground text-background font-mono text-xs font-bold shrink-0"
                aria-hidden="true"
              >
                ∑
              </div>
              <h3 className="font-display font-bold text-foreground text-sm uppercase tracking-tight">
                The Atomic Ledger
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[240px]">
              High-density financial modeling. Integrating accounting principles with Excel automation.
            </p>
            <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest">© 2026 Daniel Bodanske</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              Core
            </h4>
            <nav className="flex flex-col space-y-2 text-[11px] font-mono uppercase tracking-wider">
              <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/preface">
                Getting Started
              </Link>
              <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/backmatter/glossary">
                Glossary
              </Link>
              <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/search">
                Search
              </Link>
              <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/capstone">
                Capstone
              </Link>
            </nav>
          </div>

          {/* Teacher Resources */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              Pedagogy
            </h4>
            <nav className="flex flex-col space-y-2 text-[11px] font-mono uppercase tracking-wider">
              <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/teacher/course-overview/pbl-methodology">
                PBL Methodology
              </Link>
              <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/teacher/course-overview/backward-design">
                Backward Design
              </Link>
              <Link className="text-muted-foreground hover:text-foreground transition-colors" href="/teacher">
                Teacher Dashboard
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              Contact
            </h4>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Questions about the course? Contact your instructor or visit the help center to get support.
            </p>
          </div>
        </div>

        {/* Bottom border */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[10px] text-muted-foreground/30 font-mono uppercase tracking-[0.3em]">Applied Accounting · Excel · Grade 12</p>
          <div
            className="h-px w-8 bg-foreground"
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  )
}
