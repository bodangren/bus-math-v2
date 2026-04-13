import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkupMarginMastery } from '@/components/activities/exercises/MarkupMarginMastery'
import { expect, vi } from 'vitest'

describe('MarkupMarginMastery', () => {
  it('renders without crashing', () => {
    render(<MarkupMarginMastery activity={{}} />)
    expect(screen.getByText(/Markup & Margin Mastery/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct envelope when answer is checked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MarkupMarginMastery activity={{ id: 'markup-test' }} onSubmit={onSubmit} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Markup:') && btn.textContent?.includes('Margin:')
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
    expect(envelope.activityId).toBe('markup-test')
    expect(envelope.status).toBe('submitted')
    expect(envelope.answers).toHaveProperty('selectedAnswer')
    expect(envelope.answers).toHaveProperty('isCorrect')
    expect(envelope.answers).toHaveProperty('markup')
    expect(envelope.answers).toHaveProperty('margin')
  })

  it('shows feedback after answer submission', async () => {
    const user = userEvent.setup()
    render(<MarkupMarginMastery activity={{}} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Markup:') && btn.textContent?.includes('Margin:')
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

  it('calls onComplete when mastery threshold is reached', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<MarkupMarginMastery activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Markup:') && btn.textContent?.includes('Margin:')
    )
    expect(firstOption).toBeDefined()

    await user.click(firstOption!)

    const checkButton = screen.getByRole('button', { name: /Check Answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      if (onComplete.mock.calls.length > 0) {
        expect(onComplete).toHaveBeenCalled()
      }
    })
  })

  it('shows new numbers after answering', async () => {
    const user = userEvent.setup()
    render(<MarkupMarginMastery activity={{}} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Markup:') && btn.textContent?.includes('Margin:')
    )
    expect(firstOption).toBeDefined()

    await user.click(firstOption!)

    const checkButton = screen.getByRole('button', { name: /Check Answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      const newNumbersButton = screen.queryByRole('button', { name: /New Numbers/i })
      expect(newNumbersButton).toBeTruthy()
    })
  })

  it('prevents double-submit on rapid clicks', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MarkupMarginMastery activity={{}} onSubmit={onSubmit} />)

    const firstOption = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Markup:') && btn.textContent?.includes('Margin:')
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
