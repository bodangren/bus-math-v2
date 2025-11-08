import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BreakEvenChart } from './BreakEvenChart';

describe('BreakEvenChart', () => {
  it('recalculates break-even units when inputs change', async () => {
    const user = userEvent.setup();
    render(<BreakEvenChart fixedCosts={5000} sellingPrice={50} variableCostRate={0.4} />);

    const unitsBefore = screen.getByTestId('breakeven-units').textContent;
    const sellingPriceInput = screen.getByLabelText(/selling price/i);

    await user.clear(sellingPriceInput);
    await user.type(sellingPriceInput, '100');

    await waitFor(() => {
      expect(screen.getByTestId('breakeven-units').textContent).not.toEqual(unitsBefore);
    });
  });
});
