import type { ComponentType, SVGProps } from 'react'

import Link from 'next/link'
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Briefcase,
  Calculator,
  DollarSign,
  GraduationCap,
  Home,
  PieChart,
  Search,
  Target,
  TrendingUp
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Lesson } from '@/lib/db/schema/validators'

export interface NavigationSidebarLink {
  title: string
  url: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

export interface NavigationSidebarProps {
  lessons: Lesson[]
  mainLinks?: NavigationSidebarLink[]
  additionalLinks?: NavigationSidebarLink[]
  getLessonUrl?: (lesson: Lesson) => string
  className?: string
}

const defaultMainLinks: NavigationSidebarLink[] = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Preface', url: '/frontmatter/preface', icon: BookOpen }
]

const defaultAdditionalLinks: NavigationSidebarLink[] = [
  { title: 'Capstone', url: '/capstone', icon: GraduationCap },
  { title: 'Glossary', url: '/backmatter/glossary', icon: BookMarked },
  { title: 'Search', url: '/search', icon: Search }
]

const unitIcons = [Calculator, TrendingUp, BarChart3, PieChart, DollarSign, Target, Briefcase, BookOpen]

const formatDuration = (lesson: Lesson) => {
  const duration = lesson.metadata?.duration
  if (!duration) return 'Flexible'
  return `${duration}m`
}

const formatDifficulty = (lesson: Lesson) => {
  const difficulty = lesson.metadata?.difficulty
  return difficulty ? difficulty.toUpperCase() : 'MIXED'
}

const getLessonIcon = (lesson: Lesson) => unitIcons[(lesson.unitNumber - 1) % unitIcons.length] ?? Calculator

const defaultLessonUrl = (lesson: Lesson) => `/units/${lesson.slug}`

export function NavigationSidebar({
  lessons,
  mainLinks = defaultMainLinks,
  additionalLinks = defaultAdditionalLinks,
  getLessonUrl = defaultLessonUrl,
  className
}: NavigationSidebarProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.unitNumber - b.unitNumber)

  const renderLinks = (links: NavigationSidebarLink[]) => (
    <ul className="space-y-0.5">
      {links.map((link) => {
        const Icon = link.icon ?? BookOpen
        return (
          <li key={link.title}>
            <Link
              href={link.url}
              className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <Icon className="h-3.5 w-3.5" />
              {link.title}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <nav
      aria-label="Course navigation"
      className={cn(
        'w-full max-w-xs space-y-8 bg-background border border-border p-4',
        className
      )}
    >
      <section className="space-y-3">
        <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Main</p>
        {renderLinks(mainLinks)}
      </section>

      <section className="space-y-4">
        <div className="px-2">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Units</p>
        </div>
        <ul className="space-y-px bg-border border-y border-border">
          {sortedLessons.map((lesson) => {
            const Icon = getLessonIcon(lesson)
            return (
              <li key={lesson.id} className="bg-background">
                <Link href={getLessonUrl(lesson)} className="flex items-start gap-3 p-3 transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring">
                  <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-foreground truncate uppercase tracking-tight">
                        {`U${lesson.unitNumber}: ${lesson.title}`}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground shrink-0">{formatDuration(lesson)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono font-medium text-muted-foreground/60">{formatDifficulty(lesson)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Resources</p>
        {renderLinks(additionalLinks)}
      </section>
    </nav>
  )
}
