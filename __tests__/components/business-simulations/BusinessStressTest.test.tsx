import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BusinessStressTest } from '../../../components/activities/simulations/BusinessStressTest'

const mockActivity = {
  id: 'business-stress-test-test',
  title: 'Business Stress Test',
  description: 'Can the business survive market crises?',
  props: {
    initialState: {
      cash: 50000,
      revenue: 10000,
      expenses: 8000,
    },
    disasters: [
      { id: 'd1', label: 'Market Crash', impact: { revenue: -2000 }, message: 'Revenue drops sharply' },
    ],
  },
}

describe('BusinessStressTest', () => {
  it('renders with activity title', () => {
    render(<BusinessStressTest activity={mockActivity} />)

    expect(screen.getByText('Business Stress Test')).toBeInTheDocument()
  })

  it('emits a practice.v1 envelope when surviving all disasters', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<BusinessStressTest activity={mockActivity} onSubmit={onSubmit} />)

    // Round 1: trigger crisis
    await user.click(screen.getByRole('button', { name: /trigger next crisis/i }))

    // Choose a response
    await waitFor(() => {
      expect(screen.getByText('Raise Prices')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /raise prices/i }))

    // After responding, trigger again to process completion (round >= disasters.length)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger next crisis/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /trigger next crisis/i }))

    // After all disasters, envelope should be emitted
    await waitFor(() => {
      expect(screen.getByText('TEST PASSED!')).toBeInTheDocument()
    })

    expect(onSubmit).toHaveBeenCalled()
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('artifact.kind', 'business_stress_test')
    expect(envelope).toHaveProperty('activityId', 'business-stress-test-test')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
  })
})
