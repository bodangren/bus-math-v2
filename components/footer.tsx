import Link from 'next/link'
import { Calculator, TrendingUp } from 'lucide-react'

export function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Calculator className="h-5 w-5" />
              <TrendingUp className="h-4 w-4 text-accent" />
              <h3 className="text-base font-semibold text-foreground">Math for Business Operations</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              An interactive Grade 12 textbook blending applied accounting with Excel automation.
            </p>
            <p className="text-sm text-muted-foreground">© 2025 Daniel Bodanske</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-base font-medium">Quick Links</h4>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link className="hover:text-foreground transition-colors" href="/frontmatter/preface">
                Getting Started
              </Link>
              <Link className="hover:text-foreground transition-colors" href="/backmatter/glossary">
                Glossary
              </Link>
              <Link className="hover:text-foreground transition-colors" href="/search">
                Search
              </Link>
              <Link className="hover:text-foreground transition-colors" href="/capstone">
                Capstone
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-base font-medium">Teacher Resources</h4>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link className="hover:text-foreground transition-colors" href="/teacher/course-overview/pbl-methodology">
                PBL Methodology
              </Link>
              <Link className="hover:text-foreground transition-colors" href="/teacher/course-overview/backward-design">
                Backward Design
              </Link>
              <Link className="hover:text-foreground transition-colors" href="/teacher">
                Teacher Dashboard
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-base font-medium">Support</h4>
            <p className="text-sm text-muted-foreground">
              Questions about the course? Contact your instructor or visit the help center to get support.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
