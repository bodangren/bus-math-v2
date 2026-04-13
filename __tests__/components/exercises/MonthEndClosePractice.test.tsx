import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonthEndClosePractice } from '@/components/activities/exercises/MonthEndClosePractice'
import { expect, vi } from 'vitest'

describe('MonthEndClosePractice', () => {
  it('renders without crashing', () => {
    render(<MonthEndClosePractice activity={{}} />)
    expect(screen.getByText(/Month‑End Close Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct envelope when answer is checked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MonthEndClosePractice activity={{ id: 'month-end-test' }} onSubmit={onSubmit} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Debit') || btn.textContent?.includes('Record') ||
      btn.textContent?.includes('Close') || btn.textContent?.includes('No entry')
    )
    expect(firstOption).toBeDefined()

    await user.click(firstOption!)

    const checkButton = screen.getByRole('button', { name: /Check Answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope.contractVersion).toBe('practice.v1')
    expect(envelope.activityId).toBe('month-end-test')
    expect(envelope.status).toBe('submitted')
    expect(envelope.answers).toHaveProperty('selectedAnswer')
    expect(envelope.answers).toHaveProperty('isCorrect')
    expect(envelope.answers).toHaveProperty('scenarioKind')
  })

  it('shows feedback after answer submission', async () => {
    const user = userEvent.setup()
    render(<MonthEndClosePractice activity={{}} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Debit') || btn.textContent?.includes('Record') ||
      btn.textContent?.includes('Close') || btn.textContent?.includes('No entry')
    )
    expect(firstOption).toBeDefined()

    await user.click(firstOption!)

    const checkButton = screen.getByRole('button', { name: /Check Answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      const correctFeedback = screen.queryByText(/Correct!/i)
      const incorrectFeedback = screen.queryByText(/Not quite/i)
      expect(correctFeedback || incorrectFeedback).toBeTruthy()
    })
  })

  it('shows New Scenario button after answering', async () => {
    const user = userEvent.setup()
    render(<MonthEndClosePractice activity={{}} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Debit') || btn.textContent?.includes('Record') ||
      btn.textContent?.includes('Close') || btn.textContent?.includes('No entry')
    )
    expect(firstOption).toBeDefined()

    await user.click(firstOption!)

    const checkButton = screen.getByRole('button', { name: /Check Answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      const newScenarioButton = screen.queryByRole('button', { name: /New Scenario/i })
      expect(newScenarioButton).toBeTruthy()
    })
  })

  it('prevents double-submit on rapid clicks', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MonthEndClosePractice activity={{}} onSubmit={onSubmit} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Debit') || btn.textContent?.includes('Record') ||
      btn.textContent?.includes('Close') || btn.textContent?.includes('No entry')
    )
    expect(firstOption).toBeDefined()

    await user.click(firstOption!)

    const checkButton = screen.getByRole('button', { name: /Check Answer/i })

    await user.click(checkButton)
    await user.click(checkButton)
    await user.click(checkButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
