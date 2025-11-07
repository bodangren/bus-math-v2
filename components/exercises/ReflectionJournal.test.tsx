import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ReflectionJournal from './ReflectionJournal'
import type { ReflectionJournalActivityProps } from '@/lib/db/schema/activities'
import type { Activity } from '@/lib/db/schema/validators'

type ReflectionJournalActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'reflection-journal'
  props: ReflectionJournalActivityProps
}

const buildActivity = (overrides: Partial<ReflectionJournalActivityProps> = {}): ReflectionJournalActivity => ({
  id: 'activity-reflection',
  componentKey: 'reflection-journal',
  displayName: 'Reflection',
  description: 'Think deeply',
  props: {
    unitTitle: 'Unit Reflection',
    prompts: [
      {
        id: 'courage-1',
        category: 'courage',
        prompt: 'Share a courageous moment.',
        placeholder: 'Describe the risk you took...'
      }
    ],
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

describe('ReflectionJournal', () => {
  it('collects responses and calls onSubmit on save', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ReflectionJournal activity={buildActivity()} onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/Describe the risk/i), 'I led the presentation.')
    await user.click(screen.getByRole('button', { name: /save reflection/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: 'activity-reflection',
        responses: expect.objectContaining({ 'courage-1': 'I led the presentation.' })
      })
    )
  })
})
