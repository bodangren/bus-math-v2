import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorCheckingSystem } from '@/components/activities/exercises/ErrorCheckingSystem'
import { expect, vi } from 'vitest'

describe('ErrorCheckingSystem', () => {
  it('renders without crashing', () => {
    render(<ErrorCheckingSystem activity={{}} />)
    expect(screen.getByText(/Error Checking System/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct envelope when audit is complete', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ErrorCheckingSystem activity={{ id: 'error-check-test' }} onSubmit={onSubmit} />)

    const completeButton = screen.getByRole('button', { name: /Complete Audit/i })
    await user.click(completeButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope.contractVersion).toBe('practice.v1')
    expect(envelope.activityId).toBe('error-check-test')
    expect(envelope.status).toBe('submitted')
    expect(envelope.answers.checkedRows).toEqual([])
    expect(envelope.answers.allRowsChecked).toBe(false)
  })

  it('allows marking rows as checked', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem activity={{}} />)

    const rowButtons = screen.getAllByRole('button', { name: '' })
    expect(rowButtons.length).toBeGreaterThan(0)

    await user.click(rowButtons[0])

    const aliceTexts = screen.getAllByText(/alice/i)
    expect(aliceTexts.length).toBeGreaterThan(0)
  })

  it('calls onComplete after successful submission', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ErrorCheckingSystem activity={{}} onComplete={onComplete} />)

    const completeButton = screen.getByRole('button', { name: /Complete Audit/i })
    await user.click(completeButton)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows completed state after submission', async () => {
    const user = userEvent.setup()
    render(<ErrorCheckingSystem activity={{}} />)

    const completeButton = screen.getByRole('button', { name: /Complete Audit/i })
    await user.click(completeButton)

    expect(screen.getByText(/Audit complete!/i)).toBeInTheDocument()
    expect(completeButton).toBeDisabled()
  })

  it('prevents double-submit on rapid clicks', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ErrorCheckingSystem activity={{}} onSubmit={onSubmit} />)

    const completeButton = screen.getByRole('button', { name: /Complete Audit/i })

    await user.click(completeButton)
    await user.click(completeButton)
    await user.click(completeButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
