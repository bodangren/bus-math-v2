import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PayStructureDecisionLab } from '../../../components/activities/simulations/PayStructureDecisionLab'

describe('PayStructureDecisionLab', () => {
  it('renders with first scenario title', () => {
    render(<PayStructureDecisionLab />)

    expect(screen.getByText('Client Support Coverage')).toBeInTheDocument()
  })

  it('displays scenario progress badge', () => {
    render(<PayStructureDecisionLab />)

    expect(screen.getByText('Scenario 1 of 3')).toBeInTheDocument()
  })

  it('shows pay type badge', () => {
    render(<PayStructureDecisionLab />)

    expect(screen.getByText('HOURLY')).toBeInTheDocument()
  })

  it('navigates to next scenario', async () => {
    const user = userEvent.setup()
    render(<PayStructureDecisionLab />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Project and Quality Ownership')).toBeInTheDocument()
    })
  })

  it('disables previous button on first scenario', () => {
    render(<PayStructureDecisionLab />)

    const prevButton = screen.getByRole('button', { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('emits a practice.v1 envelope on submit at last scenario', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<PayStructureDecisionLab onSubmit={onSubmit} />)

    // Navigate to last scenario
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Outbound Sales Growth')).toBeInTheDocument()
    })

    // Click submit
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalled()
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('activityId', 'pay-structure-decision-lab')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
    expect(envelope).toHaveProperty('status', 'submitted')
    expect(envelope).toHaveProperty('parts')
    expect(envelope).toHaveProperty('artifact')
    expect(envelope.artifact).toHaveProperty('kind', 'pay_structure')
  })

  it('does not show submit button before last scenario', () => {
    render(<PayStructureDecisionLab onSubmit={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })
})
