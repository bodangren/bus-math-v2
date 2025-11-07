import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Prerequisites } from './Prerequisites';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

describe('Prerequisites', () => {
  it('renders knowledge, technology, resources, and differentiation guidance', () => {
    const unitContent = buildUnitContent({
      prerequisites: {
        knowledge: ['Accounting equation'],
        technology: ['Excel'],
        resources: [
          {
            title: 'Ledger template',
            url: 'https://example.com/template',
            type: 'download'
          }
        ]
      },
      differentiation: {
        struggling: ['Provide example ledger'],
        advanced: ['Add macros'],
        ell: ['Offer bilingual glossary']
      }
    });

    render(
      <Prerequisites
        prerequisites={unitContent.prerequisites}
        differentiation={unitContent.differentiation}
      />
    );

    expect(screen.getByText('Accounting equation')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Ledger template/ })).toHaveAttribute(
      'href',
      'https://example.com/template'
    );
    expect(screen.getByText(/Provide example ledger/)).toBeInTheDocument();
    expect(screen.getByText(/Add macros/)).toBeInTheDocument();
    expect(screen.getByText(/bilingual glossary/)).toBeInTheDocument();
  });

  it('omits differentiation card when no guidance is provided', () => {
    const unitContent = buildUnitContent({ differentiation: undefined });

    render(<Prerequisites prerequisites={unitContent.prerequisites} />);

    expect(screen.queryByText(/Differentiation/)).not.toBeInTheDocument();
  });
});
