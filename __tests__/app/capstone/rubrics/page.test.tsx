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

  it('renders pitch rubric categories with point allocations', async () => {
    const page = await CapstoneRubricsPage();
    render(page);

    expect(screen.getByText(/Presentation Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial Clarity/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Understanding/i)).toBeInTheDocument();
    expect(screen.getByText(/Q&A Handling/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery/i)).toBeInTheDocument();

    expect(screen.getAllByText('8 pts')).toHaveLength(3);
    expect(screen.getByText('10 pts')).toBeInTheDocument();
    expect(screen.getByText('6 pts')).toBeInTheDocument();
  });

  it('renders model tour checklist sections', async () => {
    const page = await CapstoneRubricsPage();
    render(page);

    expect(screen.getByText(/Financial Model Components/i)).toBeInTheDocument();
    expect(screen.getByText(/Assumption Documentation/i)).toBeInTheDocument();
    expect(screen.getByText(/Formatting Standards/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Sources and References/i)).toBeInTheDocument();
    expect(screen.getByText(/Executive Summary Alignment/i)).toBeInTheDocument();
  });

  it('includes links to downloadable PDF rubrics', async () => {
    const page = await CapstoneRubricsPage();
    render(page);

    const pitchRubricLink = screen.getByRole('link', { name: /full pitch rubric PDF/i });
    expect(pitchRubricLink).toHaveAttribute('href', '/api/pdfs/capstone_pitch_rubric.pdf');

    const modelTourLink = screen.getByRole('link', { name: /full model tour checklist PDF/i });
    expect(modelTourLink).toHaveAttribute('href', '/api/pdfs/capstone_model_tour_checklist.pdf');
  });
});