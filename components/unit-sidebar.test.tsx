import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UnitSidebar } from './unit-sidebar';
import { createLesson, createPhase, createStudentProgress } from '@/lib/test-utils/mock-factories';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

describe('UnitSidebar', () => {
  const lessons = [
    createLesson({ id: '00000000-0000-4000-8000-000000000101', unitNumber: 5, orderIndex: 1, title: 'Ledger Fundamentals', slug: 'unit05-lesson01', metadata: { duration: 45 } }),
    createLesson({ id: '00000000-0000-4000-8000-000000000102', unitNumber: 5, orderIndex: 2, title: 'Budget Challenge', slug: 'unit05-lesson02', metadata: { duration: 50 } })
  ];

  const phases = [
    createPhase({ id: '00000000-0000-4000-8000-000000000201', lessonId: '00000000-0000-4000-8000-000000000101' }),
    createPhase({ id: '00000000-0000-4000-8000-000000000202', lessonId: '00000000-0000-4000-8000-000000000101' }),
    createPhase({ id: '00000000-0000-4000-8000-000000000203', lessonId: '00000000-0000-4000-8000-000000000102' }),
    createPhase({ id: '00000000-0000-4000-8000-000000000204', lessonId: '00000000-0000-4000-8000-000000000102' })
  ];

  const progressEntries = [
    createStudentProgress({ phaseId: '00000000-0000-4000-8000-000000000201', status: 'completed' }),
    createStudentProgress({ phaseId: '00000000-0000-4000-8000-000000000202', status: 'in_progress' })
  ];

  it('shows unit summary information and progress', () => {
    render(
      <UnitSidebar
        unitId="unit-5"
        unitNumber={5}
        unitTitle="PayDay Simulator"
        lessons={lessons}
        phases={phases}
        progressEntries={progressEntries}
        currentLessonId="lesson-b"
        getLessonHref={(lesson) => `/student/${lesson.slug}`}
      />
    );

    expect(screen.getByText(/Unit 5/)).toBeInTheDocument();
    expect(screen.getByText(/PayDay Simulator/)).toBeInTheDocument();
    expect(screen.getByText(/2 lessons/)).toBeInTheDocument();
    expect(screen.getByText(/95 min total/)).toBeInTheDocument();

    // Progress derived from StudentProgress entries (75% for first lesson, 0% for second => 38% overall)
    expect(screen.getByText(/38% Complete/)).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /2\. Budget Challenge/ })).toHaveAttribute('href', '/student/unit05-lesson02');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
