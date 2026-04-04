import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { GrowthPuzzle } from '../../../components/activities/simulations/GrowthPuzzle'

const mockActivity = {
  title: 'The Growth Puzzle',
  description: 'How should Sarah use her profit?',
  props: {
    totalProfit: 500,
    options: [
      { id: 'opt-1', label: 'New Equipment', amount: 200, type: 'reinvestment' as const, impact: 'Boosts output', icon: 'rocket' },
      { id: 'opt-2', label: 'Marketing Campaign', amount: 150, type: 'reinvestment' as const, impact: 'More customers', icon: 'megaphone' },
      { id: 'opt-3', label: 'Take a Bonus', amount: 300, type: 'distribution' as const, impact: 'Personal reward', icon: 'heart' },
    ],
    successMessage: 'Great job allocating profit!',
  },
}

describe('GrowthPuzzle', () => {
  it('renders with activity title', () => {
    render(<GrowthPuzzle activity={mockActivity} />)

    expect(screen.getByText('The Growth Puzzle')).toBeInTheDocument()
  })

  it('displays total profit', () => {
    render(<GrowthPuzzle activity={mockActivity} />)

    expect(screen.getAllByText(/500/).length).toBeGreaterThan(0)
  })

  it('shows all options', () => {
    render(<GrowthPuzzle activity={mockActivity} />)

    expect(screen.getByText('New Equipment')).toBeInTheDocument()
    expect(screen.getByText('Marketing Campaign')).toBeInTheDocument()
    expect(screen.getByText('Take a Bonus')).toBeInTheDocument()
  })

  it('allows selecting options', async () => {
    const user = userEvent.setup()
    render(<GrowthPuzzle activity={mockActivity} />)

    const optionCard = screen.getByText('New Equipment').closest('[class*="cursor-pointer"]')
    if (optionCard) {
      await user.click(optionCard)
    }

    await waitFor(() => {
      expect(screen.getAllByText(/\$300/).length).toBeGreaterThan(0)
    })
  })

  it('emits a practice.v1 envelope on finalize', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<GrowthPuzzle activity={mockActivity} onSubmit={onSubmit} />)

    // Select an option
    const optionCard = screen.getByText('New Equipment').closest('[class*="cursor-pointer"]')
    if (optionCard) {
      await user.click(optionCard)
    }

    // Click finalize
    const finalizeButton = screen.getByRole('button', { name: /finalize allocation/i })
    await user.click(finalizeButton)

    expect(onSubmit).toHaveBeenCalled()
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('activityId', 'growth-puzzle')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
    expect(envelope).toHaveProperty('status', 'submitted')
    expect(envelope).toHaveProperty('parts')
    expect(envelope.parts.length).toBeGreaterThan(0)
    expect(envelope).toHaveProperty('artifact')
    expect(envelope.artifact).toHaveProperty('kind', 'growth_puzzle')
    expect(envelope.artifact).toHaveProperty('totalProfit', 500)
  })

  it('calls onComplete alongside practice.v1 envelope', async () => {
    const onSubmit = vi.fn()
    const onComplete = vi.fn()
    const user = userEvent.setup()

    render(<GrowthPuzzle activity={mockActivity} onSubmit={onSubmit} onComplete={onComplete} />)

    const optionCard = screen.getByText('New Equipment').closest('[class*="cursor-pointer"]')
    if (optionCard) {
      await user.click(optionCard)
    }

    const finalizeButton = screen.getByRole('button', { name: /finalize allocation/i })
    await user.click(finalizeButton)

    expect(onComplete).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
  })

  it('resets game state', async () => {
    const user = userEvent.setup()
    render(<GrowthPuzzle activity={mockActivity} />)

    const optionCard = screen.getByText('New Equipment').closest('[class*="cursor-pointer"]')
    if (optionCard) {
      await user.click(optionCard)
    }

    const resetButton = screen.getByRole('button', { name: /reset profit/i })
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getAllByText(/\$500/).length).toBeGreaterThan(0)
    })
  })
})
