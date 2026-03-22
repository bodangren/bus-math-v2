import Link from 'next/link'

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-forest-dark mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded font-mono-num text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: "oklch(0.43 0.14 157)" }}
                aria-hidden="true"
              >
                ∑
              </div>
              <h3 className="font-display font-semibold text-white text-sm leading-tight">
                Math for Business Operations
              </h3>
            </div>
            <p className="text-sm text-white/45 font-body leading-relaxed">
              An interactive Grade 12 textbook blending applied accounting with Excel automation.
            </p>
            <p className="text-xs text-white/30 font-mono-num">© 2025 Daniel Bodanske</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono-num font-medium tracking-widest uppercase text-white/40">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2 text-sm font-body">
              <Link className="text-white/55 hover:text-white transition-colors" href="/preface">
                Getting Started
              </Link>
              <Link className="text-white/55 hover:text-white transition-colors" href="/backmatter/glossary">
                Glossary
              </Link>
              <Link className="text-white/55 hover:text-white transition-colors" href="/search">
                Search
              </Link>
              <Link className="text-white/55 hover:text-white transition-colors" href="/capstone">
                Capstone
              </Link>
            </nav>
          </div>

          {/* Teacher Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono-num font-medium tracking-widest uppercase text-white/40">
              Teacher Resources
            </h4>
            <nav className="flex flex-col space-y-2 text-sm font-body">
              <Link className="text-white/55 hover:text-white transition-colors" href="/teacher/course-overview/pbl-methodology">
                PBL Methodology
              </Link>
              <Link className="text-white/55 hover:text-white transition-colors" href="/teacher/course-overview/backward-design">
                Backward Design
              </Link>
              <Link className="text-white/55 hover:text-white transition-colors" href="/teacher">
                Teacher Dashboard
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono-num font-medium tracking-widest uppercase text-white/40">
              Support
            </h4>
            <p className="text-sm text-white/45 font-body leading-relaxed">
              Questions about the course? Contact your instructor or visit the help center to get support.
            </p>
          </div>
        </div>

        {/* Bottom border */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-white/25 font-mono-num">Applied Accounting · Excel · Grade 12</p>
          <div
            className="h-1 w-8 rounded-full"
            style={{ backgroundColor: "oklch(0.43 0.14 157)" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  )
}
