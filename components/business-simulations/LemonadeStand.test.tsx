import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LemonadeStand, type LemonadeStandActivity, type LemonadeStandState } from './LemonadeStand'
import type { LemonadeStandActivityProps } from '@/lib/db/schema/activities'

const defaultLemonadeProps: LemonadeStandActivityProps = {
  title: 'Lemonade Stand Tycoon',
  description: 'Run a lemonade stand and learn business fundamentals.',
  supplyOptions: [
    { id: 'lemons', label: 'Fresh Lemons', quantity: 10, cost: 3, unit: 'bag' },
    { id: 'sugar', label: 'Organic Sugar', quantity: 10, cost: 2, unit: 'bag' },
    { id: 'cups', label: 'Compostable Cups', quantity: 20, cost: 1.5, unit: 'pack' }
  ],
  weatherPatterns: [
    { id: 'sunny', emoji: '☀️', description: 'Perfect lemonade weather!', multiplier: 1.5 },
    { id: 'hot', emoji: '🔥', description: 'Everyone wants cold drinks!', multiplier: 2 },
    { id: 'cloudy', emoji: '☁️', description: 'Moderate demand expected', multiplier: 0.8 },
    { id: 'rainy', emoji: '🌧️', description: 'Few customers today', multiplier: 0.3 }
  ],
  ingredientCosts: { lemons: 0.3, sugar: 0.2, cup: 0.075 },
  demand: {
    baseCustomers: { min: 20, max: 70 },
    priceSensitivity: {
      highPriceThreshold: 2,
      highPriceMultiplier: 0.5,
      lowPriceThreshold: 1,
      lowPriceMultiplier: 1.2
    },
    recipeQualityRange: { min: 0.3, max: 1.5 }
  },
  recipeGuidance: {
    minimumStrength: 2,
    maximumStrength: 5,
    minimumPrice: 0.5,
    maximumPrice: 3
  },
  initialState: {
    cash: 50,
    day: 1,
    revenue: 0,
    expenses: 0,
    inventory: { lemons: 0, sugar: 0, cups: 0 },
    recipe: { lemons: 2, sugar: 1, price: 1 },
    weather: 'sunny',
    customerSatisfaction: 100,
    isSellingActive: false,
    dailySales: { cupsSold: 0, dailyRevenue: 0, dailyExpenses: 0 },
    gameStatus: 'playing'
  }
}

const buildActivity = (overrides: Partial<LemonadeStandActivityProps> = {}): LemonadeStandActivity => {
  const mergedInitialState = {
    ...defaultLemonadeProps.initialState,
    ...(overrides.initialState ?? {}),
    inventory: {
      ...defaultLemonadeProps.initialState.inventory,
      ...(overrides.initialState?.inventory ?? {})
    },
    recipe: {
      ...defaultLemonadeProps.initialState.recipe,
      ...(overrides.initialState?.recipe ?? {})
    },
    dailySales: {
      ...defaultLemonadeProps.initialState.dailySales,
      ...(overrides.initialState?.dailySales ?? {})
    }
  } satisfies LemonadeStandActivityProps['initialState']

  const props: LemonadeStandActivityProps = {
    ...defaultLemonadeProps,
    ...overrides,
    supplyOptions: overrides.supplyOptions ?? defaultLemonadeProps.supplyOptions,
    weatherPatterns: overrides.weatherPatterns ?? defaultLemonadeProps.weatherPatterns,
    ingredientCosts: overrides.ingredientCosts ?? defaultLemonadeProps.ingredientCosts,
    demand: overrides.demand ?? defaultLemonadeProps.demand,
    recipeGuidance: overrides.recipeGuidance ?? defaultLemonadeProps.recipeGuidance,
    initialState: mergedInitialState
  }

  return {
    id: 'activity-lemonade',
    componentKey: 'lemonade-stand',
    displayName: 'Lemonade Stand',
    description: 'Simulated lemonade business.',
    props,
    gradingConfig: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

describe('LemonadeStand', () => {
  it('renders custom title and restores persisted state', async () => {
    const activity = buildActivity({
      title: 'Custom Lemonade Simulation'
    })

    const initialState: Partial<LemonadeStandState> = {
      cash: 123,
      day: 5
    }

    render(<LemonadeStand activity={activity} initialState={initialState} />)

    expect(await screen.findByText('Custom Lemonade Simulation')).toBeInTheDocument()
    expect(screen.getByText('$123.00')).toBeInTheDocument()
    const dayLabel = screen.getByText('Day')
    expect(dayLabel.parentElement).toHaveTextContent('5')
  })

  it('calls onStateChange when supplies are purchased', async () => {
    const onStateChange = vi.fn()
    const activity = buildActivity({
      supplyOptions: [
        { id: 'lemons', label: 'Fresh Lemons', quantity: 5, cost: 2, unit: 'bag' },
        { id: 'sugar', label: 'Sugar', quantity: 5, cost: 2, unit: 'bag' },
        { id: 'cups', label: 'Cups', quantity: 10, cost: 1, unit: 'pack' }
      ],
      initialState: {
        cash: 10,
        inventory: { lemons: 0, sugar: 0, cups: 0 }
      }
    })

    render(<LemonadeStand activity={activity} onStateChange={onStateChange} />)

    await waitFor(() => expect(onStateChange).toHaveBeenCalled())

    const buyButtons = screen.getAllByRole('button', { name: /buy/i })
    await userEvent.click(buyButtons[0])

    await waitFor(() => expect(screen.getByText('$8.00')).toBeInTheDocument())
    expect(onStateChange.mock.calls.at(-1)?.[0].cash).toBeCloseTo(8)
  })
})
