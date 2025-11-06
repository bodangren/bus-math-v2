'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Calculator, Menu, Search, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Lesson } from '@/lib/db/schema/validators'

export interface HeaderProps {
  studentUnits: Lesson[]
  teacherUnits: Lesson[]
  onSearchChange?: (value: string) => void
  getUnitHref?: (lesson: Lesson, audience: 'student' | 'teacher') => string
}

const defaultHrefBuilder = (lesson: Lesson, audience: 'student' | 'teacher') => `/${audience}/${lesson.slug}`

export function Header({
  studentUnits,
  teacherUnits,
  onSearchChange,
  getUnitHref = defaultHrefBuilder
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const sortedStudentUnits = useMemo(
    () => [...studentUnits].sort((a, b) => a.unitNumber - b.unitNumber),
    [studentUnits]
  )
  const sortedTeacherUnits = useMemo(
    () => [...teacherUnits].sort((a, b) => a.unitNumber - b.unitNumber),
    [teacherUnits]
  )

  const handleSearchChange = (value: string) => {
    onSearchChange?.(value)
  }

  const renderUnits = (units: Lesson[], audience: 'student' | 'teacher') => (
    <ul className="space-y-1">
      {units.map((unit) => (
        <li key={unit.id}>
          <Link
            href={getUnitHref(unit, audience)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
          >
            {`Unit ${unit.unitNumber}: ${unit.title}`}
          </Link>
          {unit.description ? (
            <p className="text-xs text-muted-foreground/80 ml-2">{unit.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex items-center gap-1 text-primary">
                <Calculator className="h-5 w-5" />
                <TrendingUp className="h-4 w-4 text-accent" />
              </span>
              Math for Business Operations
            </Link>
            <span className="text-xs text-muted-foreground">Applied Accounting with Excel</span>
          </div>

          <nav className="hidden lg:flex items-center gap-4 text-sm font-medium">
            <Link className="hover:text-primary transition-colors" href="/">
              Home
            </Link>
            <Link className="hover:text-primary transition-colors" href="/frontmatter/preface">
              Preface
            </Link>
            <Link className="hover:text-primary transition-colors" href="/capstone">
              Capstone
            </Link>
            <Link className="hover:text-primary transition-colors" href="/backmatter/glossary">
              Glossary
            </Link>
            <Link className="hover:text-primary transition-colors" href="/search">
              Search
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Input
              aria-label="Search textbook"
              placeholder="Search textbook..."
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div
          className={`lg:grid lg:grid-cols-2 gap-8 border-t border-border/40 py-4 ${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block`}
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Student Units</p>
              <span className="text-xs text-muted-foreground">{sortedStudentUnits.length} units</span>
            </div>
            {renderUnits(sortedStudentUnits, 'student')}
          </div>

          <div className="mt-6 lg:mt-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Teacher Resources</p>
              <span className="text-xs text-muted-foreground">{sortedTeacherUnits.length} units</span>
            </div>
            {renderUnits(sortedTeacherUnits, 'teacher')}
          </div>
        </div>
      </div>
    </header>
  )
}
