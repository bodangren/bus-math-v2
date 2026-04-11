import { render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { PracticeTestSelection } from '@/components/student/PracticeTestSelection';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('PracticeTestSelection', () => {
  it('renders the practice test selection page', () => {
    render(<PracticeTestSelection />);
    expect(screen.getByText('Practice Tests')).toBeInTheDocument();
  });

  it('shows 8 unit cards', () => {
    render(<PracticeTestSelection />);
    const unitCards = screen.getAllByRole('link');
    expect(unitCards.length).toBeGreaterThanOrEqual(8);
  });

  it('links to each unit practice test page', () => {
    render(<PracticeTestSelection />);
    for (let unit = 1; unit <= 8; unit++) {
      expect(screen.getByRole('link', { name: new RegExp(`Unit ${unit}`) })).toHaveAttribute(
        'href',
        `/student/study/practice-tests/${unit}`
      );
    }
  });
});
