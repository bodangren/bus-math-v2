import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Hero } from './hero';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

// Mock next/image since it's hard to test in Vitest
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: ComponentPropsWithoutRef<'img'>) => <img {...props} />
}));

describe('Hero', () => {
  const mockStats = {
    unitCount: 8,
    lessonCount: 40,
    activityCount: 240
  };

  it('renders the main heading', () => {
    render(<Hero stats={null} />);
    expect(screen.getByText(/Math for Business Operations/i)).toBeInTheDocument();
  });

  it('renders the "Browse Units" CTA', () => {
    render(<Hero stats={null} />);
    const cta = screen.getByRole('link', { name: /Browse Units/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/curriculum');
  });

  it('shows stats when provided and unitCount > 0', () => {
    render(<Hero stats={mockStats} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Units')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByText('240+')).toBeInTheDocument();
    expect(screen.getByText('Activities')).toBeInTheDocument();
  });

  it('hides stats when stats is null', () => {
    render(<Hero stats={null} />);
    expect(screen.queryByText('Units')).not.toBeInTheDocument();
  });

  it('hides stats when unitCount is 0', () => {
    render(<Hero stats={{ unitCount: 0, lessonCount: 0, activityCount: 0 }} />);
    expect(screen.queryByText('Units')).not.toBeInTheDocument();
  });
});
