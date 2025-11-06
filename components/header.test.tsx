import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Header, type HeaderProps } from './header';
import { createLesson } from '@/lib/test-utils/mock-factories';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

describe('Header', () => {
  const buildProps = (overrides: Partial<HeaderProps> = {}): HeaderProps => ({
    studentUnits: [
      createLesson({ id: '00000000-0000-4000-8000-000000000001', unitNumber: 1, title: 'Smart Ledger Launch', slug: 'unit01' }),
      createLesson({ id: '00000000-0000-4000-8000-000000000002', unitNumber: 2, title: 'Month-End Wizard', slug: 'unit02' })
    ],
    teacherUnits: [
      createLesson({ id: '00000000-0000-4000-8000-000000000003', unitNumber: 3, title: 'Three-Statement Storyboard', slug: 'unit03' })
    ],
    ...overrides
  });

  it('renders student and teacher unit links from props', () => {
    render(<Header {...buildProps()} />);

    expect(screen.getByRole('link', { name: /Unit 1: Smart Ledger Launch/i })).toHaveAttribute('href', '/student/unit01');
    expect(screen.getByRole('link', { name: /Unit 3: Three-Statement Storyboard/i })).toHaveAttribute('href', '/teacher/unit03');
  });

  it('invokes onSearchChange callback when typing into search bar', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<Header {...buildProps({ onSearchChange })} />);

    await user.type(screen.getByPlaceholderText(/search textbook/i), 'ledger');

    expect(onSearchChange).toHaveBeenCalledWith('ledger');
  });

  it('toggles mobile menu state when the menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...buildProps()} />);

    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });
});
