import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NavigationSidebar } from './navigation-sidebar';
import { createLesson } from '@/lib/test-utils/mock-factories';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

describe('NavigationSidebar', () => {
  const lessons = [
    createLesson({ id: '00000000-0000-4000-8000-000000000020', unitNumber: 2, title: 'Month-End Wizard', slug: 'unit02', metadata: { duration: 60, difficulty: 'intermediate' } }),
    createLesson({ id: '00000000-0000-4000-8000-000000000010', unitNumber: 1, title: 'Smart Ledger Launch', slug: 'unit01', metadata: { duration: 45, difficulty: 'beginner' } })
  ];

  it('orders lessons by unit number and renders metadata', () => {
    render(<NavigationSidebar lessons={lessons} />);

    const unitLinks = screen.getAllByRole('link', { name: /Unit/i });
    expect(unitLinks[0]).toHaveTextContent('Unit 1');
    expect(unitLinks[1]).toHaveTextContent('Unit 2');

    expect(screen.getByText(/45 min/i)).toBeInTheDocument();
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
  });

  it('uses custom getLessonUrl callback when provided', () => {
    render(
      <NavigationSidebar
        lessons={lessons}
        getLessonUrl={(lesson) => `/custom/${lesson.slug}`}
      />
    );

    expect(screen.getByRole('link', { name: /Unit 1/ })).toHaveAttribute('href', '/custom/unit01');
  });
});
