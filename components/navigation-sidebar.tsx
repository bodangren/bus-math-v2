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
  if (!duration) return 'Flexible duration'
  return `${duration} min`
}

const formatDifficulty = (lesson: Lesson) => {
  const difficulty = lesson.metadata?.difficulty
  return difficulty ? `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}` : 'Mixed level'
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
    <ul className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon ?? BookOpen
        return (
          <li key={link.title}>
            <Link
              href={link.url}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <Icon className="h-4 w-4" />
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
        'w-full max-w-xs space-y-6 rounded-xl border border-border/40 bg-card p-4 shadow-sm',
        className
      )}
    >
      <section>
        <p className="text-sm font-semibold text-foreground">Getting Started</p>
        {renderLinks(mainLinks)}
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Course Units</p>
          <p className="text-xs text-muted-foreground">Guided projects and lessons</p>
        </div>
        <ul className="space-y-2">
          {sortedLessons.map((lesson) => {
            const Icon = getLessonIcon(lesson)
            return (
              <li key={lesson.id} className="rounded-lg border border-border/30 p-3">
                <Link href={getLessonUrl(lesson)} className="flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg">
                  <Icon className="mt-1 h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {`Unit ${lesson.unitNumber}: ${lesson.title}`}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDuration(lesson)}</span>
                    </div>
                    {lesson.description ? (
                      <p className="text-xs text-muted-foreground mt-1">{lesson.description}</p>
                    ) : null}
                    <span className="text-xs font-medium text-primary/80">{formatDifficulty(lesson)}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <p className="text-sm font-semibold text-foreground">Additional Resources</p>
        {renderLinks(additionalLinks)}
      </section>
    </nav>
  )
}
