import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PeerCritiqueForm, type PeerCritiqueActivity } from '../../../components/exercises/PeerCritiqueForm'
import type { PeerCritiqueActivityProps } from '@/types/activities'

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
  standardId: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

describe('PeerCritiqueForm', () => {
  it('requires ratings/comments before submission and forwards payload', async () => {
    const onSubmit = vi.fn()
    render(<PeerCritiqueForm activity={buildActivity()} onSubmit={onSubmit} />)

    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    expect(submitButton).toBeDisabled()

    const categorySection = screen.getByText('Highlights').closest('section') as HTMLElement
    const ratingButton = within(categorySection).getByRole('button', { name: /rating 4/i })
    fireEvent.click(ratingButton)
    fireEvent.change(screen.getByPlaceholderText(/share specific wins/i), {
      target: { value: 'Excellent structure and visuals.' }
    })
    fireEvent.change(screen.getByLabelText(/final thoughts/i), {
      target: { value: 'Great peer coaching!' }
    })
    fireEvent.change(screen.getByPlaceholderText(/add your name/i), { target: { value: 'Casey' } })

    expect(submitButton).not.toBeDisabled()
    fireEvent.click(submitButton)

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
