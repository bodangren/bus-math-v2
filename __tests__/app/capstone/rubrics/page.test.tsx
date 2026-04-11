import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CapstoneRubricsPage from '../../../../app/capstone/rubrics/page';

describe('CapstoneRubricsPage', () => {
  it('renders the page with correct content and links', async () => {
    const page = await CapstoneRubricsPage();
    render(page);

    expect(
      screen.getByRole('heading', { level: 1, name: /Capstone Rubrics/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to Capstone Overview/i }),
    ).toHaveAttribute('href', '/capstone');
    expect(
      screen.getByRole('heading', { level: 2, name: /Pitch Rubric/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Model Tour Checklist/i }),
    ).toBeInTheDocument();
  });
});
