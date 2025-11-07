import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StudentChoices } from './StudentChoices';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

describe('StudentChoices', () => {
  it('renders venture, role, and presentation sections when provided', () => {
    const unitContent = buildUnitContent({
      studentChoices: {
        ventures: ['TechStart', 'Nova'],
        roles: ['CFO'],
        presentationFormats: ['Live demo']
      }
    });

    render(<StudentChoices studentChoices={unitContent.studentChoices} />);

    expect(screen.getByText('TechStart')).toBeInTheDocument();
    expect(screen.getByText('CFO')).toBeInTheDocument();
    expect(screen.getByText('Live demo')).toBeInTheDocument();
  });

  it('returns null when no options exist', () => {
    const unitContent = buildUnitContent({ studentChoices: undefined });

    const { container } = render(<StudentChoices studentChoices={unitContent.studentChoices} />);

    expect(container).toBeEmptyDOMElement();
  });
});
