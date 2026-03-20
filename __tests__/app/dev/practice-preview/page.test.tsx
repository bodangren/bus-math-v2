import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PracticePreviewPage from '@/app/dev/practice-preview/page';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('practice preview page', () => {
  it('renders in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(<PracticePreviewPage />);

    expect(screen.getByText(/developer preview/i)).toBeInTheDocument();
    expect(screen.getByText(/family a preview/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /classification and statement mapping/i })).toBeInTheDocument();
    expect(screen.getByText(/family a guided practice/i)).toBeInTheDocument();
    expect(screen.getByText(/family a teacher review/i)).toBeInTheDocument();
    expect(screen.getByText(/family m preview/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /normal balances and account nature/i })).toBeInTheDocument();
    expect(screen.getByText(/family m guided practice/i)).toBeInTheDocument();
    expect(screen.getByText(/family m teacher review/i)).toBeInTheDocument();
    expect(screen.getByText(/selection matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/statement layout/i)).toBeInTheDocument();
    expect(screen.getByText(/journal entry table/i)).toBeInTheDocument();
    expect(screen.getByText(/categorization list/i)).toBeInTheDocument();
  });
});
