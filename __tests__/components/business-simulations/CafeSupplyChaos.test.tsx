import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CafeSupplyChaos } from '../../../components/activities/simulations/CafeSupplyChaos'

const mockActivity = {
  id: 'cafe-supply-chaos-test',
  title: 'Cafe Supply Chaos',
  description: 'Track inventory costs with FIFO vs LIFO',
  props: {
    days: 2,
    shipments: [
      { day: 1, quantity: 100, costPerUnit: 5 },
    ],
    orders: [
      { day: 1, quantity: 50, pricePerUnit: 10 },
      { day: 2, quantity: 50, pricePerUnit: 12 },
    ],
  },
}

describe('CafeSupplyChaos', () => {
  it('renders with activity title', () => {
    render(<CafeSupplyChaos activity={mockActivity} />)

    expect(screen.getByText('Cafe Supply Chaos')).toBeInTheDocument()
  })

  it('emits a practice.v1 envelope when simulation completes with FIFO', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<CafeSupplyChaos activity={mockActivity} onSubmit={onSubmit} />)

    // Select FIFO method
    await user.click(screen.getByRole('button', { name: /choose fifo/i }))

    // Day 1
    await waitFor(() => {
      expect(screen.getByText(/fill order & advance day/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /fill order & advance day/i }))

    // Day 2 (last day)
    await waitFor(() => {
      expect(screen.getByText(/day 2 of 2/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /fill order & advance day/i }))

    // Simulation complete
    await waitFor(() => {
      expect(screen.getByText('SIMULATION COMPLETE')).toBeInTheDocument()
    })

    expect(onSubmit).toHaveBeenCalled()
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('artifact.kind', 'cafe_supply_chaos')
    expect(envelope).toHaveProperty('activityId', 'cafe-supply-chaos-test')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
    expect(envelope).toHaveProperty('status', 'submitted')
    expect(envelope.parts.length).toBeGreaterThan(0)
  })
})
