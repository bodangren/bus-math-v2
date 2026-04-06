import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AssetTimeMachine } from '../../../components/activities/simulations/AssetTimeMachine'

const mockActivity = {
  id: 'asset-time-machine-test',
  title: 'The Asset Time-Machine',
  description: 'Track asset depreciation over time',
  props: {
    assetName: 'Server',
    initialCost: 10000,
    years: 2,
    scenarios: [
      { year: 1, event: 'Power surge', repairCost: 500, upgradeCost: 2000, impact: 'Minor damage' },
      { year: 2, event: 'Obsolescence', repairCost: 1000, upgradeCost: 3000, impact: 'End of useful life' },
    ],
  },
}

describe('AssetTimeMachine', () => {
  it('renders with activity title', () => {
    render(<AssetTimeMachine activity={mockActivity} />)

    expect(screen.getByText('The Asset Time-Machine')).toBeInTheDocument()
  })

  it('emits a practice.v1 envelope when all years are complete', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<AssetTimeMachine activity={mockActivity} onSubmit={onSubmit} />)

    // Year 1 - click repair
    const repairButtons = screen.getAllByText('Repair')
    await user.click(repairButtons[repairButtons.length - 1])

    await waitFor(() => {
      // Year 2 - click repair to finish
      const repairButtons2 = screen.getAllByText('Repair')
      expect(repairButtons2.length).toBeGreaterThan(0)
    })

    const repairButtons2 = screen.getAllByText('Repair')
    await user.click(repairButtons2[repairButtons2.length - 1])

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('artifact.kind', 'asset_time_machine')
    expect(envelope).toHaveProperty('activityId', 'asset-time-machine-test')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
    expect(envelope).toHaveProperty('status', 'submitted')
    expect(envelope.parts.length).toBeGreaterThan(0)
  })

  it('resets game state when Back to Lesson is clicked after completion', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<AssetTimeMachine activity={mockActivity} onSubmit={onSubmit} />)

    // Complete both years
    const repairBtn1 = screen.getAllByText('Repair')
    await user.click(repairBtn1[repairBtn1.length - 1])

    await waitFor(() => {
      const repairBtn2 = screen.getAllByText('Repair')
      expect(repairBtn2.length).toBeGreaterThan(0)
    })

    const repairBtn2 = screen.getAllByText('Repair')
    await user.click(repairBtn2[repairBtn2.length - 1])

    await waitFor(() => {
      expect(screen.getByText('TIMELINE ENDED')).toBeInTheDocument()
    })

    // Click Back to Lesson
    const backButton = screen.getByRole('button', { name: /back to lesson/i })
    await user.click(backButton)

    await waitFor(() => {
      // Should show Year 0 again (reset state)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.queryByText('TIMELINE ENDED')).not.toBeInTheDocument()
    })
  })
})
