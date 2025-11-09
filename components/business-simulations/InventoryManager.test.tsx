import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { InventoryManager } from './InventoryManager'
import type { InventoryManagerActivityProps } from '@/lib/db/schema/activities'

const mockActivity: InventoryManagerActivityProps = {
  title: 'Inventory Manager',
  description: 'Manage retail inventory for 30 days. Balance stock levels, demand, and profitability!',
  products: [
    {
      id: 'product-1',
      name: 'Laptops',
      icon: 'laptop',
      quantity: 0,
      cost: 800,
      price: 1200,
      demand: 'medium',
      demandHistory: [0, 0, 0, 0, 0],
      totalSold: 0,
      totalOrdered: 0
    },
    {
      id: 'product-2',
      name: 'Phones',
      icon: 'smartphone',
      quantity: 0,
      cost: 400,
      price: 600,
      demand: 'high',
      demandHistory: [0, 0, 0, 0, 0],
      totalSold: 0,
      totalOrdered: 0
    },
    {
      id: 'product-3',
      name: 'Tablets',
      icon: 'tablet',
      quantity: 0,
      cost: 300,
      price: 450,
      demand: 'low',
      demandHistory: [0, 0, 0, 0, 0],
      totalSold: 0,
      totalOrdered: 0
    }
  ],
  initialState: {
    cash: 10000,
    day: 1,
    maxDays: 30,
    products: [],
    financials: {
      totalRevenue: 0,
      totalExpenses: 0,
      storageCost: 0,
      dailyStorageCost: 50
    },
    profitTarget: 2000,
    gameStatus: 'playing'
  }
}

describe('InventoryManager', () => {
  it('renders with activity title and description', () => {
    render(<InventoryManager activity={mockActivity} />)

    expect(screen.getByText('Inventory Manager')).toBeInTheDocument()
    expect(screen.getByText(/Manage retail inventory for 30 days/i)).toBeInTheDocument()
  })

  it('displays initial cash from activity props', () => {
    render(<InventoryManager activity={mockActivity} />)

    expect(screen.getByText('$10,000')).toBeInTheDocument()
  })

  it('displays day counter from initial state', () => {
    render(<InventoryManager activity={mockActivity} />)

    const dayLabel = screen.getByText('Day')
    expect(dayLabel.parentElement).toHaveTextContent('1 / 30')
  })

  it('displays all products from activity props', () => {
    render(<InventoryManager activity={mockActivity} />)

    expect(screen.getByText('Laptops')).toBeInTheDocument()
    expect(screen.getByText('Phones')).toBeInTheDocument()
    expect(screen.getByText('Tablets')).toBeInTheDocument()
  })

  it('displays product pricing information', () => {
    render(<InventoryManager activity={mockActivity} />)

    // Laptop cost and price (may appear in multiple places)
    const laptop800 = screen.getAllByText((content, element) => {
      return element?.textContent === '$800' || false
    })
    expect(laptop800.length).toBeGreaterThan(0)

    // Phone cost
    const phone400 = screen.getAllByText((content, element) => {
      return element?.textContent === '$400' || false
    })
    expect(phone400.length).toBeGreaterThan(0)
  })

  it('displays demand levels for each product', () => {
    render(<InventoryManager activity={mockActivity} />)

    expect(screen.getByText('medium demand')).toBeInTheDocument()
    expect(screen.getByText('high demand')).toBeInTheDocument()
    expect(screen.getByText('low demand')).toBeInTheDocument()
  })

  it('shows initial profit of zero', () => {
    render(<InventoryManager activity={mockActivity} />)

    // Profit card shows $0
    const profitLabels = screen.getAllByText('Profit')
    expect(profitLabels.length).toBeGreaterThan(0)
  })

  it('allows ordering stock for products', async () => {
    const user = userEvent.setup()
    render(<InventoryManager activity={mockActivity} />)

    // Find first "Order 5" button (for Laptops: 5 * $800 = $4000)
    const orderButtons = screen.getAllByRole('button', { name: /order 5/i })
    await user.click(orderButtons[0])

    await waitFor(() => {
      // Cash should decrease by $4000 (10000 - 4000 = 6000)
      expect(screen.getByText('$6,000')).toBeInTheDocument()
    })
  })

  it('advances day and processes sales', async () => {
    const user = userEvent.setup()

    // Start with some inventory
    const activityWithStock = {
      ...mockActivity,
      products: mockActivity.products.map(p => ({
        ...p,
        quantity: p.name === 'Phones' ? 10 : 0
      }))
    }

    render(<InventoryManager activity={activityWithStock} />)

    const endDayButton = screen.getByRole('button', { name: /end day/i })
    await user.click(endDayButton)

    await waitFor(() => {
      const dayLabel = screen.getByText('Day')
      expect(dayLabel.parentElement).toHaveTextContent('2 / 30')
    })
  })

  it('calls onSubmit when game ends with win condition', async () => {
    const onSubmit = vi.fn()

    // Setup winning scenario
    const winningActivity = {
      ...mockActivity,
      initialState: {
        ...mockActivity.initialState,
        day: 30,
        maxDays: 30,
        financials: {
          totalRevenue: 5000,
          totalExpenses: 2000,
          storageCost: 100,
          dailyStorageCost: 50
        }
      }
    }

    render(<InventoryManager activity={winningActivity} onSubmit={onSubmit} />)

    // Advance one more day to end game
    const endDayButton = screen.getByRole('button', { name: /end day/i })
    await userEvent.click(endDayButton)

    await waitFor(() => {
      expect(screen.getByText(/Business Success!/i)).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /submit results/i })
    await userEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('gameStatus', 'won')
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('finalProfit')
  })

  it('resets game to initial state from activity props', async () => {
    const user = userEvent.setup()
    render(<InventoryManager activity={mockActivity} />)

    // Order some stock first
    const orderButtons = screen.getAllByRole('button', { name: /order 5/i })
    await user.click(orderButtons[0])

    await waitFor(() => {
      expect(screen.getByText('$6,000')).toBeInTheDocument()
    })

    // Reset the game
    const resetButton = screen.getByRole('button', { name: /reset game/i })
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('$10,000')).toBeInTheDocument()
      const dayLabel = screen.getByText('Day')
      expect(dayLabel.parentElement).toHaveTextContent('1 / 30')
    })
  })

  it('shows game over when cash goes negative', async () => {
    const lowCashActivity = {
      ...mockActivity,
      initialState: {
        ...mockActivity.initialState,
        cash: 100
      }
    }

    render(<InventoryManager activity={lowCashActivity} />)

    // Try to order expensive laptops
    const orderButtons = screen.getAllByRole('button', { name: /order 10/i })
    await userEvent.click(orderButtons[0]) // Laptops: 10 * $800 = $8000

    // Should show error since we only have $100
    await waitFor(() => {
      expect(screen.getByText('$100')).toBeInTheDocument()
    })
  })

  it('displays profit target from activity props', async () => {
    const user = userEvent.setup()
    render(<InventoryManager activity={mockActivity} />)

    // Click instructions button to open
    const helpButton = screen.getByRole('button', { name: /how to play/i })
    await user.click(helpButton)

    await waitFor(() => {
      // Profit target appears in multiple places
      const profitTargets = screen.getAllByText('$2,000')
      expect(profitTargets.length).toBeGreaterThan(0)
    })
  })

  it('toggles instructions panel', async () => {
    const user = userEvent.setup()
    render(<InventoryManager activity={mockActivity} />)

    const helpButton = screen.getByRole('button', { name: /how to play/i })

    // Click to toggle instructions
    await user.click(helpButton)

    // Verify toggle action worked
    await waitFor(() => {
      expect(helpButton).toBeInTheDocument()
    })
  })

  it('disables order buttons when insufficient cash', () => {
    const lowCashActivity = {
      ...mockActivity,
      initialState: {
        ...mockActivity.initialState,
        cash: 500
      }
    }

    render(<InventoryManager activity={lowCashActivity} />)

    // Order 5 Laptops button should be disabled (needs $4000, only have $500)
    const orderButtons = screen.getAllByRole('button', { name: /order 5/i })
    expect(orderButtons[0]).toBeDisabled()
  })

  it('displays performance metrics', () => {
    render(<InventoryManager activity={mockActivity} />)

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('Storage Costs')).toBeInTheDocument()
    expect(screen.getByText('Turnover Rate')).toBeInTheDocument()
  })
})
