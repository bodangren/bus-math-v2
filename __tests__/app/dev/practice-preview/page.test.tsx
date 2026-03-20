import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PracticePreviewPage from '@/app/dev/practice-preview/page';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('practice preview page', () => {
  it(
    'renders in development mode',
    () => {
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
      expect(screen.getByText(/family k preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /effects of missing adjustments/i })).toBeInTheDocument();
      expect(screen.getByText(/family k guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family k teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/transaction analysis/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /transaction effects on accounts/i })).toBeInTheDocument();
      expect(screen.getByText(/family c guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family c teacher review/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /transaction reasoning matrix/i })).toBeInTheDocument();
      expect(screen.getByText(/family f guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family f teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/selection matrix/i)).toBeInTheDocument();
      expect(screen.getByText(/family h preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /journal entry recording/i })).toBeInTheDocument();
      expect(screen.getByText(/family h guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family h teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/family l preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /cycle decisions/i })).toBeInTheDocument();
      expect(screen.getByText(/family l guided decision/i)).toBeInTheDocument();
      expect(screen.getByText(/family l decision review/i)).toBeInTheDocument();
      expect(screen.getByText(/family l guided entry/i)).toBeInTheDocument();
      expect(screen.getByText(/family l entry review/i)).toBeInTheDocument();
      expect(screen.getByText(/family p preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /merchandising entries/i })).toBeInTheDocument();
      expect(screen.getByText(/family p guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family p teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/family b preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /accounting equation workbench/i })).toBeInTheDocument();
      expect(screen.getByText(/family b guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family b teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/family i preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /posting balances workboard/i })).toBeInTheDocument();
      expect(screen.getByText(/family i guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family i teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/statement layout/i)).toBeInTheDocument();
      expect(screen.getAllByText(/family d preview/i)).toHaveLength(3);
      expect(screen.getByRole('heading', { name: /family d income statement/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /family d balance sheet/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /family d equity statement/i })).toBeInTheDocument();
      expect(screen.getAllByText(/family d guided practice/i)).toHaveLength(3);
      expect(screen.getAllByText(/family d teacher review/i)).toHaveLength(3);
      expect(screen.getByText(/family e preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /statement construction workbook/i })).toBeInTheDocument();
      expect(screen.getByText(/account bank/i)).toBeInTheDocument();
      expect(screen.getByText(/family e guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family e teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/family q preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /statement subtotal worksheet/i })).toBeInTheDocument();
      expect(screen.getByText(/family q guided practice/i)).toBeInTheDocument();
      expect(screen.getByText(/family q teacher review/i)).toBeInTheDocument();
      expect(screen.getByText(/family j preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /adjusting calculations/i })).toBeInTheDocument();
      expect(screen.getByText(/family j guided practice/i)).toBeInTheDocument();
      expect(screen.getAllByText(/family j teacher review/i)).toHaveLength(2);
      expect(screen.getByText(/family n preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /depreciation presentation/i })).toBeInTheDocument();
      expect(screen.getAllByText(/family n guided practice/i)).toHaveLength(2);
      expect(screen.getAllByText(/family n teacher review/i)).toHaveLength(2);
      expect(screen.getByText(/family o preview/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /merchandising computation/i })).toBeInTheDocument();
      expect(screen.getByText(/family o guided practice/i)).toBeInTheDocument();
      expect(screen.getAllByText(/family o teacher review/i)).toHaveLength(2);
      expect(screen.getByText(/journal entry table/i)).toBeInTheDocument();
      expect(screen.getByText(/categorization list/i)).toBeInTheDocument();
    },
    180000,
  );
});
