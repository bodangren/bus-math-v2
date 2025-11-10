import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorCheckingSystem from './ErrorCheckingSystem'

describe('ErrorCheckingSystem', () => {
  it('renders the component with header', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByText(/Error Checking System Builder/i)).toBeInTheDocument()
    expect(screen.getByText(/Master conditional formatting and data validation rules/i)).toBeInTheDocument()
  })

  it('displays all validation scenario tabs', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByText(/Payroll Data Validation/i)).toBeInTheDocument()
    expect(screen.getByText(/Inventory Management Validation/i)).toBeInTheDocument()
    expect(screen.getByText(/Financial Statement Validation/i)).toBeInTheDocument()
  })

  it('shows How to Use button', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByRole('button', { name: /How to Use/i })).toBeInTheDocument()
  })

  it('shows Show/Hide Excel Formulas button', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByRole('button', { name: /Show Excel Formulas/i })).toBeInTheDocument()
  })

  it('displays instructions when How to Use is clicked', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const instructionsButton = screen.getByRole('button', { name: /How to Use/i })
    await user.click(instructionsButton)

    expect(screen.getByText(/How to Build Error Checking Systems/i)).toBeInTheDocument()
    expect(screen.getByText(/Learning Objectives/i)).toBeInTheDocument()
    expect(screen.getByText(/Step-by-Step Instructions/i)).toBeInTheDocument()
  })

  it('shows formulas when Show Excel Formulas is clicked', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const formulasButton = screen.getByRole('button', { name: /Show Excel Formulas/i })
    await user.click(formulasButton)

    // Check for formula text in the document
    const formulaElements = screen.getAllByText(/=/i)
    expect(formulaElements.length).toBeGreaterThan(0)
  })

  it('displays validation rules for the default scenario', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByText(/Overtime Hours Detection/i)).toBeInTheDocument()
    expect(screen.getByText(/Missing Employee ID/i)).toBeInTheDocument()
    expect(screen.getByText(/Gross Pay Calculation Error/i)).toBeInTheDocument()
    expect(screen.getByText(/Missing Department Assignment/i)).toBeInTheDocument()
  })

  it('shows priority badges for rules', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getAllByText(/High/i).length).toBeGreaterThan(0)
  })

  it('allows testing a validation rule', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    // Find and click a Test Rule button
    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    // Should show sample data and results
    expect(screen.getByText(/Sample Data & Validation Results/i)).toBeInTheDocument()
  })

  it('switches scenarios when tab is clicked', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const inventoryTab = screen.getByRole('tab', { name: /Inventory Management Validation/i })
    await user.click(inventoryTab)

    expect(screen.getByText(/Monitor stock levels/i)).toBeInTheDocument()
    expect(screen.getByText(/Low Stock Level Alert/i)).toBeInTheDocument()
  })

  it('displays different validation categories', () => {
    render(<ErrorCheckingSystem />)

    // Check for category icons/indicators
    expect(screen.getByText(/Highlight employees working more than 40 hours/i)).toBeInTheDocument()
    expect(screen.getByText(/Flag blank or missing employee identification/i)).toBeInTheDocument()
  })

  it('shows sample data table after testing a rule', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    // Should display a table with results
    expect(screen.getByText(/Employee_ID/i)).toBeInTheDocument()
    expect(screen.getByText(/Hours_Worked/i)).toBeInTheDocument()
  })

  it('displays rule result indicators', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    // Should show error detected or valid badges
    expect(screen.getByText(/Error Detected/i) || screen.getByText(/Valid/i)).toBeInTheDocument()
  })

  it('shows clear results button after testing', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    expect(screen.getByRole('button', { name: /Clear Results/i })).toBeInTheDocument()
  })

  it('clears results when Clear Results is clicked', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    // Test a rule
    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    // Clear results
    const clearButton = screen.getByRole('button', { name: /Clear Results/i })
    await user.click(clearButton)

    // Should show empty state
    expect(screen.getByText(/Select a validation rule to test/i)).toBeInTheDocument()
  })

  it('displays business context for each scenario', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByText(/Business Context:/i)).toBeInTheDocument()
    expect(screen.getByText(/PayDay Simulator/i)).toBeInTheDocument()
  })

  it('shows educational notes about Month-End Wizard', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByText(/Month-End Wizard Connection/i)).toBeInTheDocument()
    expect(screen.getByText(/These error checking skills are essential/i)).toBeInTheDocument()
  })

  it('displays rule logic and purpose after testing', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    expect(screen.getByText(/Rule Logic/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Results/i)).toBeInTheDocument()
  })

  it('shows errors found and valid records count', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    expect(screen.getByText(/Errors Found:/i)).toBeInTheDocument()
    expect(screen.getByText(/Valid Records:/i)).toBeInTheDocument()
  })

  it('displays difficulty badge for scenario', () => {
    render(<ErrorCheckingSystem />)

    expect(screen.getByText(/Medium/i) || screen.getByText(/Hard/i) || screen.getByText(/Easy/i)).toBeInTheDocument()
  })

  it('highlights the selected rule', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem />)

    const testButtons = screen.getAllByRole('button', { name: /Test Rule/i })
    await user.click(testButtons[0])

    // The rule card should have a visual indicator (ring-2 ring-blue-500 class in actual implementation)
    expect(screen.getByText(/Testing:/i)).toBeInTheDocument()
  })
})
