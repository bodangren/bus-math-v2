import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Footer } from './footer';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

describe('Footer', () => {
  it('renders footer text and quick links', () => {
    render(<Footer />);

    expect(screen.getByText(/Math for Business Operations/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Getting Started/i })).toBeInTheDocument();
  });
});
