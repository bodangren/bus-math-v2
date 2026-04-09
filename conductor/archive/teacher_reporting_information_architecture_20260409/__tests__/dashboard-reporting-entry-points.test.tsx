import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TeacherDashboardContent } from '@/components/teacher/TeacherDashboardContent';
import type { StudentDashboardRow } from '@/lib/teacher/intervention';
import type { CourseOverviewRow, UnitColumn } from '@/lib/teacher/course-overview';

// Mock Next.js Link for testing
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('TeacherDashboardContent', () => {
  const mockTeacher = {
    username: 'teacher1',
    organizationName: 'Test School',
  };

  const mockStudents: StudentDashboardRow[] = [
    {
      id: 'student1',
      username: 'student1',
      displayName: 'Alice Student',
      progressPercentage: 75,
      completedPhases: 30,
      totalPhases: 40,
      lastActive: new Date().toISOString(),
      status: 'on_track',
      needsAttention: false,
      organizationId: 'org1',
    },
  ];

  const mockCourseOverview = {
    rows: [] as CourseOverviewRow[],
    units: [
      { unitNumber: 1, unitTitle: 'Unit 1' },
      { unitNumber: 2, unitTitle: 'Unit 2' },
    ] as UnitColumn[],
  };

  it('renders teacher dashboard with course gradebook link', () => {
    const { container } = render(
      <TeacherDashboardContent
        teacher={mockTeacher}
        students={mockStudents}
        courseOverview={mockCourseOverview}
      />,
    );

    // Verify dashboard renders
    expect(container.querySelector('h1')).toHaveTextContent(
      /Teacher Dashboard.*teacher1/,
    );

    // Phase 2 will add course gradebook link - failing test for now
    const gradebookLink = container.querySelector('a[href="/teacher/gradebook"]');
    expect(gradebookLink).toBeInTheDocument();
    expect(gradebookLink).toHaveTextContent(/course gradebook/i);
  });

  it('renders student intervention queue', () => {
    const { container } = render(
      <TeacherDashboardContent
        teacher={mockTeacher}
        students={mockStudents}
        courseOverview={mockCourseOverview}
      />,
    );

    expect(container.querySelector('[aria-label="Student intervention queue"]')).toBeInTheDocument();
  });

  it('renders course overview', () => {
    const { container } = render(
      <TeacherDashboardContent
        teacher={mockTeacher}
        students={mockStudents}
        courseOverview={mockCourseOverview}
      />,
    );

    expect(container.querySelector('[aria-label="Course overview"]')).toBeInTheDocument();
  });
});