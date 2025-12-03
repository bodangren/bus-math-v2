import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InterestCalculationBuilder from './InterestCalculationBuilder'

describe('InterestCalculationBuilder', () => {
  it('renders the component with header', () => {
    render(<InterestCalculationBuilder />)

    expect(screen.getByText(/Interest Calculation Builder/i)).toBeInTheDocument()
    expect(screen.getByText(/Master interest calculations for business cash flow management/i)).toBeInTheDocument()
  })

  it('displays scenario tabs', () => {
    render(<InterestCalculationBuilder />)

    expect(screen.getByRole('tab', { name: /Payroll Bridge/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /POS System/i })).toBeInTheDocument()
  })

  it('shows input fields for the default scenario', () => {
    render(<InterestCalculationBuilder />)

    expect(screen.getByLabelText(/Principal Amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Interest Rate/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Time Period/i)).toBeInTheDocument()
  })

  it('calculates interest when Calculate button is clicked', async () => {
    const user = userEvent.setup()
    render(<InterestCalculationBuilder />)

    const calculateButton = screen.getByRole('button', { name: /Calculate/i })
    await user.click(calculateButton)

    // Should show results section
    expect(screen.getByText(/Calculation Results/i)).toBeInTheDocument()
  })

  it('updates input values when user types', async () => {
    const user = userEvent.setup()
    render(<InterestCalculationBuilder />)

    const principalInput = screen.getByLabelText(/Principal Amount/i) as HTMLInputElement
    await user.clear(principalInput)
    await user.type(principalInput, '20000')

    expect(principalInput.value).toBe('20000')
  })

  it('resets to default values when Reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<InterestCalculationBuilder />)

    const principalInput = screen.getByLabelText(/Principal Amount/i) as HTMLInputElement
    await user.clear(principalInput)
    await user.type(principalInput, '99999')

    const resetButton = screen.getByRole('button', { name: /Reset/i })
    await user.click(resetButton)

    // Should reset to default value (15000 for payroll scenario)
    expect(principalInput.value).toBe('15000')
  })

  it('switches scenarios when tab is clicked', async () => {
    const user = userEvent.setup()
    render(<InterestCalculationBuilder />)

    const equipmentTab = screen.getByRole('tab', { name: /POS System/i })
    await user.click(equipmentTab)

    // Should show equipment financing scenario
    expect(screen.getByText(/Finance a new point-of-sale system/i)).toBeInTheDocument()
  })

  it('shows instructions when How to Use button is clicked', async () => {
    const user = userEvent.setup()
    render(<InterestCalculationBuilder />)

    const instructionsButton = screen.getByRole('button', { name: /How to Use/i })
    await user.click(instructionsButton)

    expect(screen.getByText(/Learning Objectives/i)).toBeInTheDocument()
    expect(screen.getByText(/Step-by-Step Instructions/i)).toBeInTheDocument()
  })

  it('shows formulas when Show Formulas button is clicked', async () => {
    const user = userEvent.setup()
    render(<InterestCalculationBuilder />)

    const formulasButton = screen.getByRole('button', { name: /Show Formulas/i })
    await user.click(formulasButton)

    // Formula should be visible after clicking
    expect(screen.getByText(/Interest = Principal × Rate × Time/i)).toBeInTheDocument()
  })

  it('displays calculation history after multiple calculations', async () => {
    const user = userEvent.setup()
    render(<InterestCalculationBuilder />)

    const calculateButton = screen.getByRole('button', { name: /Calculate/i })

    // Perform multiple calculations
    await user.click(calculateButton)

    const principalInput = screen.getByLabelText(/Principal Amount/i)
    await user.clear(principalInput)
    await user.type(principalInput, '25000')
    await user.click(calculateButton)

    // Should show Recent Calculations section
    expect(screen.getByText(/Recent Calculations/i)).toBeInTheDocument()
  })
})
