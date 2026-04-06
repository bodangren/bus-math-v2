import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    expect(envelope).toHaveProperty('status', 'submitted')
    expect(envelope.parts.length).toBeGreaterThan(0)
  })

  it('emits a practice.v1 envelope on bankruptcy path', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const bankruptcyActivity = {
      id: 'business-stress-test-bankruptcy',
      title: 'Business Stress Test',
      description: 'Can the business survive market crises?',
      props: {
        initialState: {
          cash: 5000,
          revenue: 10000,
          expenses: 8000,
        },
        disasters: [
          { id: 'd1', label: 'Market Crash', impact: { cash: -8000 }, message: 'Revenue drops sharply' },
          { id: 'd2', label: 'Recession', impact: { revenue: -3000 }, message: 'Economy contracts' },
        ],
      },
    }

    render(<BusinessStressTest activity={bankruptcyActivity} onSubmit={onSubmit} />)

    // Trigger crisis — cash goes from 5000 + 2000(profit) - 8000(disaster) = -1000 → bankruptcy
    await user.click(screen.getByRole('button', { name: /trigger next crisis/i }))

    // Bankruptcy triggers on the same render cycle; the disaster panel never appears
    await waitFor(() => {
      expect(screen.getByText('BANKRUPT!')).toBeInTheDocument()
    })

    expect(onSubmit).toHaveBeenCalled()
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('artifact.kind', 'business_stress_test')
    expect(envelope).toHaveProperty('activityId', 'business-stress-test-bankruptcy')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
    expect(envelope).toHaveProperty('status', 'submitted')
    expect(envelope.parts.length).toBeGreaterThan(0)
    expect(envelope.artifact.survivedAll).toBe(false)
    expect(envelope.artifact.finalCash).toBe(0)
  })

  it('only calls onSubmit once on rapid double-click of trigger button', async () => {
    const onSubmit = vi.fn()

    render(<BusinessStressTest activity={mockActivity} onSubmit={onSubmit} />)

    // Round 1: trigger crisis
    await userEvent.click(screen.getByRole('button', { name: /trigger next crisis/i }))

    // Choose a response
    await waitFor(() => {
      expect(screen.getByText('Raise Prices')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /raise prices/i }))

    // Wait for the trigger button to reappear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger next crisis/i })).toBeInTheDocument()
    })

    // Rapidly fire two click events to trigger double-submit
    const triggerButton = screen.getByRole('button', { name: /trigger next crisis/i })
    fireEvent.click(triggerButton)
    fireEvent.click(triggerButton)

    await waitFor(() => {
      expect(screen.getByText('TEST PASSED!')).toBeInTheDocument()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
