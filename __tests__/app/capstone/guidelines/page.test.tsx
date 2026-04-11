import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CapstoneGuidelinesPage from '../../../../app/capstone/guidelines/page';

describe('CapstoneGuidelinesPage', () => {
  it('renders the page with correct content and links', async () => {
    const page = await CapstoneGuidelinesPage();
    render(page);

    expect(
      screen.getByRole('heading', { level: 1, name: /Capstone Guidelines/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to Capstone Overview/i }),
    ).toHaveAttribute('href', '/capstone');
    expect(
      screen.getByRole('heading', { level: 2, name: /Overview/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Key Deliverables/i }),
    ).toBeInTheDocument();
  });
});
