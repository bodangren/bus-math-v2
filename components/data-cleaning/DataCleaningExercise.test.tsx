import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataCleaningExercise from './DataCleaningExercise'
import type { SpreadsheetData } from '@/components/spreadsheet/SpreadsheetWrapper'

// Mock SpreadsheetWrapper
vi.mock('@/components/spreadsheet/SpreadsheetWrapper', () => ({
  SpreadsheetWrapper: ({ initialData, readOnly, className }: { initialData: SpreadsheetData; readOnly: boolean; className?: string }) => (
    <div data-testid="spreadsheet-wrapper" data-readonly={readOnly} className={className}>
      Mock Spreadsheet: {initialData.length} rows
    </div>
  )
}))

const messyData: SpreadsheetData = [
  [{ value: 'Name' }, { value: 'Amount' }],
  [{ value: 'John' }, { value: '100' }]
]

const cleanData: SpreadsheetData = [
  [{ value: 'Name' }, { value: 'Amount' }],
  [{ value: 'John' }, { value: '$100.00' }]
]

const cleaningSteps = [
  'Remove duplicate entries',
  'Fix formatting issues',
  'Validate data types'
]

describe('DataCleaningExercise', () => {
  it('renders the component with title and description', () => {
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    expect(screen.getByText('Data Cleaning Practice')).toBeInTheDocument()
    expect(screen.getByText('Learn to clean messy data')).toBeInTheDocument()
  })

  it('displays current step information', () => {
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Remove duplicate entries')).toBeInTheDocument()
  })

  it('displays messy data spreadsheet', () => {
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    expect(screen.getByText('Messy Data (Before)')).toBeInTheDocument()
    const spreadsheets = screen.getAllByTestId('spreadsheet-wrapper')
    expect(spreadsheets.length).toBeGreaterThan(0)
  })

  it('initially hides clean data', () => {
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    expect(screen.getByText('Complete all steps to see the cleaned data')).toBeInTheDocument()
  })

  it('marks step as complete when Mark Complete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    const completeButton = screen.getByRole('button', { name: /Mark Complete/i })
    await user.click(completeButton)

    expect(screen.getByText(/1\/3 Complete/i)).toBeInTheDocument()
  })

  it('navigates to next step when Next button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    expect(screen.getByText('Fix formatting issues')).toBeInTheDocument()
  })

  it('navigates to previous step when Previous button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    // Go to step 2 first
    await user.click(screen.getByRole('button', { name: /Next/i }))
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()

    // Then go back
    await user.click(screen.getByRole('button', { name: /Previous/i }))
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('shows clean data after all steps are completed', async () => {
    const user = userEvent.setup()
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    // Complete all three steps
    for (let i = 0; i < cleaningSteps.length; i++) {
      await user.click(screen.getByRole('button', { name: /Mark Complete/i }))
      if (i < cleaningSteps.length - 1) {
        await user.click(screen.getByRole('button', { name: /Next/i }))
      }
    }

    expect(screen.getByText('Clean Data (After)')).toBeInTheDocument()
    expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument()
  })

  it('resets exercise when Reset button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    // Complete first step
    await user.click(screen.getByRole('button', { name: /Mark Complete/i }))
    expect(screen.getByText(/1\/3 Complete/i)).toBeInTheDocument()

    // Reset
    await user.click(screen.getByRole('button', { name: /Reset Exercise/i }))

    // Should be back to start
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('0/3 Complete')).toBeInTheDocument()
  })

  it('calls onComplete callback when all steps are finished', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
        onComplete={onComplete}
      />
    )

    // Complete all steps
    for (let i = 0; i < cleaningSteps.length; i++) {
      await user.click(screen.getByRole('button', { name: /Mark Complete/i }))
      if (i < cleaningSteps.length - 1) {
        await user.click(screen.getByRole('button', { name: /Next/i }))
      }
    }

    expect(onComplete).toHaveBeenCalled()
  })

  it('displays progress bar', () => {
    render(
      <DataCleaningExercise
        title="Data Cleaning Practice"
        description="Learn to clean messy data"
        messyData={messyData}
        cleanData={cleanData}
        cleaningSteps={cleaningSteps}
      />
    )

    // Progress bar should exist (checking for specific styling)
    const progressBars = screen.getAllByRole('progressbar', { hidden: true })
    expect(progressBars.length).toBeGreaterThan(0)
  })
})
