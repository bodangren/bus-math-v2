import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BreakEvenAnalysisCalculator } from './BreakEvenAnalysisCalculator'

describe('BreakEvenAnalysisCalculator', () => {
  it('renders the component with header', () => {
    render(<BreakEvenAnalysisCalculator />)

    expect(screen.getByText(/Advanced Break-Even Analysis Calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/Master Goal Seek, Data Tables, and Sensitivity Analysis/i)).toBeInTheDocument()
  })

  it('displays all main tabs', () => {
    render(<BreakEvenAnalysisCalculator />)

    expect(screen.getByRole('tab', { name: /Inputs/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Results/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Goal Seek/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Data Tables/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Analysis/i })).toBeInTheDocument()
  })

  it('shows input fields in Inputs tab', () => {
    render(<BreakEvenAnalysisCalculator />)

    expect(screen.getByLabelText(/Fixed Costs/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Variable Cost per Unit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Selling Price per Unit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Profit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Current Sales Volume/i)).toBeInTheDocument()
  })

  it('updates input values when user types', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    const fixedCostInput = screen.getByLabelText(/Fixed Costs/i) as HTMLInputElement
    await user.clear(fixedCostInput)
    await user.type(fixedCostInput, '60000')

    expect(fixedCostInput.value).toBe('60000')
  })

  it('switches to Results tab and shows calculations', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    const resultsTab = screen.getByRole('tab', { name: /Results/i })
    await user.click(resultsTab)

    expect(screen.getByText(/Break-Even Point/i)).toBeInTheDocument()
  })

  it('switches to Goal Seek tab and shows target profit options', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    const goalSeekTab = screen.getByRole('tab', { name: /Goal Seek/i })
    await user.click(goalSeekTab)

    expect(screen.getByText(/Target Profit Analysis/i)).toBeInTheDocument()
  })

  it('switches to Data Tables tab', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    const dataTablesTab = screen.getByRole('tab', { name: /Data Tables/i })
    await user.click(dataTablesTab)

    expect(screen.getByText(/One-Variable Data Table/i)).toBeInTheDocument()
  })

  it('switches to Analysis tab', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    const analysisTab = screen.getByRole('tab', { name: /Analysis/i })
    await user.click(analysisTab)

    expect(screen.getByText(/Executive Summary/i)).toBeInTheDocument()
  })

  it('shows instructions panel when toggled', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    const instructionsButton = screen.getByRole('button', { name: /How to Use This Calculator/i })
    await user.click(instructionsButton)

    expect(screen.getByText(/Learning Objective/i)).toBeInTheDocument()
    expect(screen.getByText(/Calculator Tabs Overview/i)).toBeInTheDocument()
  })

  it('resets inputs when Reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    const fixedCostInput = screen.getByLabelText(/Fixed Costs/i) as HTMLInputElement
    await user.clear(fixedCostInput)
    await user.type(fixedCostInput, '99999')

    const resetButton = screen.getByRole('button', { name: /Reset to Defaults/i })
    await user.click(resetButton)

    expect(fixedCostInput.value).toBe('50000')
  })

  it('calculates break-even units correctly', async () => {
    const user = userEvent.setup()
    render(<BreakEvenAnalysisCalculator />)

    // Go to Results tab to see calculations
    const resultsTab = screen.getByRole('tab', { name: /Results/i })
    await user.click(resultsTab)

    // With default values: Fixed=50000, Variable=25, Price=45
    // Contribution Margin = 45-25 = 20
    // Break-even = 50000/20 = 2500 units
    expect(screen.getByText(/2,500/)).toBeInTheDocument()
  })

  it('displays badges for key features', () => {
    render(<BreakEvenAnalysisCalculator />)

    expect(screen.getByText(/Goal Seek/i)).toBeInTheDocument()
    expect(screen.getByText(/Data Tables/i)).toBeInTheDocument()
    expect(screen.getByText(/CVP Analysis/i)).toBeInTheDocument()
  })
})
