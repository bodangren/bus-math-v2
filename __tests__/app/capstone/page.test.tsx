import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import CapstonePage from '../../../app/capstone/page';

const mockQuery = vi.fn();
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    constructor() {}
    query = mockQuery;
  },
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    public: {
      getCapstonePageData: "api.public.getCapstonePageData",
    },
  },
}));

const mockCapstoneData = {
  instructionalUnits: [
    {
      unitNumber: 1,
      title: 'Balance by Design',
      drivingQuestion: 'How do we keep the books balanced?',
      scenario: 'Students set up a chart of accounts for a startup.',
      deliverable: 'Chart of Accounts workbook',
      accountingFocus: 'Accounting equation, account types',
      excelFocus: 'Cell formatting, basic formulas',
      audience: 'Peer review',
    },
    {
      unitNumber: 8,
      title: 'Financing the Future',
      drivingQuestion: 'How do we fund long-term growth?',
      scenario: 'Students build a loan amortization model.',
      deliverable: 'Amortization schedule',
      accountingFocus: 'Time value of money',
      excelFocus: 'PMT, FV, PV functions',
      audience: 'Mock loan officer',
    },
  ],
  capstone: {
    unitNumber: 9,
    title: 'Investor-Ready Capstone Project',
    drivingQuestion: 'Can you defend a complete business plan?',
    scenario: 'Build the linked investor workbook.',
    deliverable: 'Linked business plan, pitch deck, and 3-minute model tour',
    accountingFocus: null,
    excelFocus: null,
    audience: 'Demo Day judges',
  },
};

describe('CapstonePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero content and navigation links', async () => {
    mockQuery.mockResolvedValueOnce(mockCapstoneData);
    const page = await CapstonePage();
    render(page);

    expect(
      screen.getByRole('heading', { level: 1, name: /Investor-Ready Capstone Project/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /capstone guidelines/i }),
    ).toHaveAttribute('href', '/capstone/guidelines');
    expect(
      screen.getByRole('link', { name: /rubrics/i }),
    ).toHaveAttribute('href', '/capstone/rubrics');
  });

  it('lists curriculum bridges for core units', async () => {
    mockQuery.mockResolvedValueOnce(mockCapstoneData);
    const page = await CapstonePage();
    render(page);

    expect(screen.getByText('Chart of Accounts workbook')).toBeInTheDocument();
    expect(
      screen.getByText(/Accounting equation, account types/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Amortization schedule')).toBeInTheDocument();
  });

  it('shows empty state when Convex data is unavailable', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const page = await CapstonePage();
    render(page);

    expect(
      screen.getByText(/Curriculum data isn't available yet/i),
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
