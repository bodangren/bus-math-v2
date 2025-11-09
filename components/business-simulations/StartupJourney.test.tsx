import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StartupJourney, type StartupJourneyActivity, type StartupJourneyState } from './StartupJourney'
import type { StartupJourneyActivityProps } from '@/lib/db/schema/activities'

const defaultStartupProps: StartupJourneyActivityProps = {
  title: 'Startup Journey',
  description: 'Guide a startup from idea to success.',
  stages: [
    { id: 'idea', name: 'Idea', badgeClassName: 'bg-yellow-100 text-yellow-800 border-yellow-300', progress: 20, icon: 'lightbulb' },
    { id: 'prototype', name: 'Prototype', badgeClassName: 'bg-blue-100 text-blue-800 border-blue-300', progress: 40, icon: 'code' },
    { id: 'launch', name: 'Launch', badgeClassName: 'bg-purple-100 text-purple-800 border-purple-300', progress: 60, icon: 'rocket' },
    { id: 'growth', name: 'Growth', badgeClassName: 'bg-green-100 text-green-800 border-green-300', progress: 80, icon: 'chart-line' },
    { id: 'success', name: 'Success', badgeClassName: 'bg-amber-100 text-amber-800 border-amber-300', progress: 100, icon: 'crown' }
  ],
  decisions: [
    {
      id: 'initial-funding',
      type: 'funding',
      title: 'Initial Funding Strategy',
      description: 'You have a great app idea! How will you fund development?',
      options: [
        {
          id: 'bootstrap',
          title: 'Bootstrap with Personal Savings',
          description: 'Use $5,000 of your own money. Lower burn rate but limited resources.',
          effects: { funding: 5000, burn: -500 }
        },
        {
          id: 'accelerator',
          title: 'Apply to Startup Accelerator',
          description: 'Get $25,000 funding plus mentorship and network access.',
          effects: { funding: 25000, users: 100, growth: 0.2 }
        },
        {
          id: 'angel-investors',
          title: 'Pitch to Angel Investors',
          description: 'Raise $100,000 but higher pressure and burn rate.',
          effects: { funding: 100000, burn: 6000 }
        }
      ]
    }
  ],
  decisionFlow: [
    { stageId: 'idea', decisionIds: ['initial-funding'] }
  ],
  winConditions: {
    revenueTarget: 50000,
    successRevenueTarget: 50000,
    timeLimitMonths: 24,
    timeLimitRevenueTarget: 20000,
    successStageId: 'success'
  },
  initialState: {
    stage: 'idea',
    funding: 10000,
    monthlyBurn: 2000,
    users: 100,
    revenue: 0,
    month: 1,
    maxMonths: 24,
    decisions: [],
    currentDecisionId: 'initial-funding',
    userGrowthRate: 0.1,
    revenuePerUser: 0,
    gameStatus: 'playing'
  }
}

const buildActivity = (overrides: Partial<StartupJourneyActivityProps> = {}): StartupJourneyActivity => {
  const props: StartupJourneyActivityProps = {
    ...defaultStartupProps,
    ...overrides,
    stages: overrides.stages ?? defaultStartupProps.stages,
    decisions: overrides.decisions ?? defaultStartupProps.decisions,
    decisionFlow: overrides.decisionFlow ?? defaultStartupProps.decisionFlow,
    winConditions: overrides.winConditions ?? defaultStartupProps.winConditions,
    initialState: {
      ...defaultStartupProps.initialState,
      ...(overrides.initialState ?? {})
    }
  }

  return {
    id: 'activity-startup',
    componentKey: 'startup-journey',
    displayName: 'Startup Journey',
    description: 'Strategic startup simulation.',
    props,
    gradingConfig: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

describe('StartupJourney', () => {
  it('renders current stage and applies persisted state', async () => {
    const activity = buildActivity()
    const initialState: Partial<StartupJourneyState> = {
      stage: 'growth',
      funding: 50000,
      month: 6
    }

    render(<StartupJourney activity={activity} initialState={initialState} />)

    expect(await screen.findByText('Current Stage: Growth')).toBeInTheDocument()
    expect(screen.getByText(/Month 6/)).toBeInTheDocument()
    expect(screen.getByText('$50,000')).toBeInTheDocument()
  })

  it('updates funding and notifies parent when a decision is made', async () => {
    const onStateChange = vi.fn()
    const activity = buildActivity()

    render(<StartupJourney activity={activity} onStateChange={onStateChange} />)

    await waitFor(() => expect(onStateChange).toHaveBeenCalled())

    await screen.findByRole('heading', { name: /Strategic Decision/i })
    const optionButtons = await screen.findAllByRole('button', { name: /Choose This Option/i })
    await userEvent.click(optionButtons[0])

    await waitFor(() => expect(screen.getByText('$15,000')).toBeInTheDocument())
    expect(onStateChange.mock.calls.at(-1)?.[0].funding).toBe(15000)
  })
})
