import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PeerCritiqueForm, type PeerCritiqueActivity } from './PeerCritiqueForm'
import type { PeerCritiqueActivityProps } from '@/lib/db/schema/activities'

const buildActivity = (overrides: Partial<PeerCritiqueActivityProps> = {}): PeerCritiqueActivity => ({
  id: 'activity-peer',
  componentKey: 'peer-critique-form',
  displayName: 'Peer Feedback',
  description: 'Provide critique',
  props: {
    projectTitle: 'Pitch Review',
    peerName: 'Jonah',
    unitNumber: 5,
    reviewerNameLabel: 'Reviewer',
    overallPrompt: 'Final thoughts',
    categories: [
      {
        id: 'strengths',
        title: 'Highlights',
        description: 'What stood out?',
        prompt: 'Celebrate the best moments.',
        placeholder: 'Share specific wins...'
      }
    ],
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

describe('PeerCritiqueForm', () => {
  it('requires ratings/comments before submission and forwards payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<PeerCritiqueForm activity={buildActivity()} onSubmit={onSubmit} />)

    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    expect(submitButton).toBeDisabled()

    const categorySection = screen.getByText('Highlights').closest('section') as HTMLElement
    const ratingButton = within(categorySection).getByRole('button', { name: /rating 4/i })
    await user.click(ratingButton)
    await user.type(screen.getByPlaceholderText(/share specific wins/i), 'Excellent structure and visuals.')
    await user.type(screen.getByLabelText(/final thoughts/i), 'Great peer coaching!')
    await user.type(screen.getByPlaceholderText(/add your name/i), 'Casey')

    expect(submitButton).not.toBeDisabled()
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: 'activity-peer',
        peerName: 'Jonah',
        ratings: { strengths: expect.any(Number) },
        comments: { strengths: 'Excellent structure and visuals.' }
      })
    )
  })
})
