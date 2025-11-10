import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DepreciationMethodBuilder from './DepreciationMethodBuilder'

describe('DepreciationMethodBuilder', () => {
  it('renders the component with header', () => {
    render(<DepreciationMethodBuilder />)

    expect(screen.getByText(/Depreciation Method Builder/i)).toBeInTheDocument()
    expect(screen.getByText(/Master asset depreciation calculations/i)).toBeInTheDocument()
  })

  it('displays all depreciation method tabs', () => {
    render(<DepreciationMethodBuilder />)

    expect(screen.getByText(/Straight-Line Depreciation/i)).toBeInTheDocument()
    expect(screen.getByText(/Double Declining/i)).toBeInTheDocument()
    expect(screen.getByText(/Sum-of-the-Years/i)).toBeInTheDocument()
    expect(screen.getByText(/Units of/i)).toBeInTheDocument()
  })

  it('shows asset information input fields', () => {
    render(<DepreciationMethodBuilder />)

    expect(screen.getByLabelText(/Asset Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Asset Cost/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Salvage Value/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Useful Life/i)).toBeInTheDocument()
  })

  it('calculates depreciation when Calculate button is clicked', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    const calculateButton = screen.getByRole('button', { name: /Calculate Depreciation/i })
    await user.click(calculateButton)

    // Should show depreciation schedule table
    expect(screen.getByText(/Depreciation Schedule/i)).toBeInTheDocument()
    expect(screen.getByText(/Year/i)).toBeInTheDocument()
    expect(screen.getByText(/Beginning Value/i)).toBeInTheDocument()
  })

  it('updates asset cost when user types', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    const costInput = screen.getByLabelText(/Asset Cost/i) as HTMLInputElement
    await user.clear(costInput)
    await user.type(costInput, '75000')

    expect(costInput.value).toBe('75000')
  })

  it('switches depreciation methods when tab is clicked', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    const ddbTab = screen.getByRole('tab', { name: /Double Declining/i })
    await user.click(ddbTab)

    expect(screen.getByText(/Accelerated depreciation with higher expenses in early years/i)).toBeInTheDocument()
  })

  it('shows comparison of all methods when Compare button is clicked', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    const compareButton = screen.getByRole('button', { name: /Compare All Methods/i })
    await user.click(compareButton)

    expect(screen.getByText(/Method Comparison/i)).toBeInTheDocument()
    expect(screen.getByText(/Year 1 Expense/i)).toBeInTheDocument()
  })

  it('resets inputs when Reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    const costInput = screen.getByLabelText(/Asset Cost/i) as HTMLInputElement
    await user.clear(costInput)
    await user.type(costInput, '99999')

    const resetButton = screen.getByRole('button', { name: /Reset/i })
    await user.click(resetButton)

    // Should reset to default value
    expect(costInput.value).toBe('50000')
  })

  it('shows instructions panel when toggled', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    const instructionsButton = screen.getByRole('button', { name: /How to Use/i })
    await user.click(instructionsButton)

    expect(screen.getByText(/Learning Objectives/i)).toBeInTheDocument()
    expect(screen.getByText(/Compare four major depreciation methods/i)).toBeInTheDocument()
  })

  it('shows formulas when Show Formulas button is clicked', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    const formulasButton = screen.getByRole('button', { name: /Show Formulas/i })
    await user.click(formulasButton)

    // Formula should be visible
    expect(screen.getByText(/\(Cost - Salvage Value\) \/ Useful Life/i)).toBeInTheDocument()
  })

  it('displays depreciation schedule with correct columns', async () => {
    const user = userEvent.setup()
    render(<DepreciationMethodBuilder />)

    await user.click(screen.getByRole('button', { name: /Calculate Depreciation/i }))

    expect(screen.getByText(/Beginning Value/i)).toBeInTheDocument()
    expect(screen.getByText(/Depreciation/i)).toBeInTheDocument()
    expect(screen.getByText(/Accumulated/i)).toBeInTheDocument()
    expect(screen.getByText(/Ending Value/i)).toBeInTheDocument()
  })
})
