import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeacherLessonPlanPageContent } from '@/components/teacher/TeacherLessonPlanPageContent';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('TeacherLessonPlanPageContent', () => {
  const mockViewModel = {
    lesson: {
      id: 'lesson1',
      title: 'Test Lesson',
      unitNumber: 1,
      lessonNumber: 1,
    },
    phases: [],
    lessonNumber: 1,
    availableLessons: [],
    lessonHrefByNumber: {},
    previousLessonHref: null,
    nextLessonHref: null,
    empty: true,
  };

  it('renders full breadcrumb chain for lesson report', () => {
    render(<TeacherLessonPlanPageContent {...mockViewModel} unitNumber={1} />);

    // Verify breadcrumb chain
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Course Gradebook')).toBeInTheDocument();
    expect(screen.getByText('Unit 1 Gradebook')).toBeInTheDocument();
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
  });

  it('renders lesson title and description', () => {
    render(<TeacherLessonPlanPageContent {...mockViewModel} unitNumber={1} />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    const mainTitle = headings.find(h => h.textContent === 'Test Lesson');
    expect(mainTitle).toBeInTheDocument();
    expect(
      screen.getByText(/Use this to direct to student back into/),
    ).toBeInTheDocument();
  });

  it('shows empty state card when lesson has no phases', () => {
    render(<TeacherLessonPlanPageContent {...mockViewModel} unitNumber={1} />);

    expect(
      screen.getByText('Published lesson content is not available yet'),
    ).toBeInTheDocument();
  });
});