import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UnitTemplate, type UnitTemplateProps } from './UnitTemplate';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

const buildProps = (overrides: Partial<UnitTemplateProps> = {}): UnitTemplateProps => ({
  unitNumber: 1,
  title: 'Smart Ledger Launch',
  description: 'Students build a self-auditing ledger for Sarah Chen.',
  durationLabel: '2-3 weeks',
  difficulty: 'beginner',
  durationMinutes: 90,
  unitContent: buildUnitContent(),
  ...overrides
});

describe('UnitTemplate', () => {
  it('composes all sub-components with provided unit content', () => {
    render(<UnitTemplate {...buildProps()} />);

    expect(screen.getByText(/Smart Ledger Launch/)).toBeInTheDocument();
    expect(screen.getByText(/Investor Pitch/)).toBeInTheDocument();
    expect(screen.getByText(/Teams use TechStart data/)).toBeInTheDocument();
    expect(screen.getByText(/Prototype ledger/)).toBeInTheDocument();
    expect(screen.getByText(/Student Voice & Choice/)).toBeInTheDocument();
    expect(screen.getByText(/Chromebook with Excel/)).toBeInTheDocument();
  });

  it('omits the student choice section when no options exist', () => {
    const contentWithoutChoices = buildUnitContent({ studentChoices: undefined });

    render(
      <UnitTemplate
        {...buildProps({
          unitContent: contentWithoutChoices
        })}
      />
    );

    expect(screen.queryByText(/Student Voice & Choice/)).not.toBeInTheDocument();
  });
});
