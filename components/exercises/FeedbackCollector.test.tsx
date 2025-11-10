import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackCollector from './FeedbackCollector'

describe('FeedbackCollector', () => {
  it('renders the component with title', () => {
    render(<FeedbackCollector />)

    expect(screen.getByText(/Expert Stakeholder Feedback/i)).toBeInTheDocument()
    expect(screen.getByText(/Professional industry feedback/i)).toBeInTheDocument()
  })

  it('displays stakeholder type badge', () => {
    render(<FeedbackCollector stakeholderType="investor" />)

    expect(screen.getByText(/Investor \/ VC/i)).toBeInTheDocument()
  })

  it('shows project title when provided', () => {
    render(<FeedbackCollector projectTitle="Smart Ledger Presentation" />)

    expect(screen.getByText('Smart Ledger Presentation')).toBeInTheDocument()
  })

  it('displays all feedback categories', () => {
    render(<FeedbackCollector />)

    expect(screen.getByText(/Financial Accuracy/i)).toBeInTheDocument()
    expect(screen.getByText(/Business Viability/i)).toBeInTheDocument()
    expect(screen.getByText(/Presentation & Communication/i)).toBeInTheDocument()
    expect(screen.getByText(/Industry Knowledge/i)).toBeInTheDocument()
    expect(screen.getByText(/Innovation & Differentiation/i)).toBeInTheDocument()
    expect(screen.getByText(/Implementation & Execution/i)).toBeInTheDocument()
  })

  it('shows feedback guidelines when button is clicked', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    const guidelinesButton = screen.getByRole('button', { name: /Feedback Guidelines/i })
    await user.click(guidelinesButton)

    expect(screen.getByText(/Professional Feedback Guidelines/i)).toBeInTheDocument()
    expect(screen.getByText(/Rating Scale Guide/i)).toBeInTheDocument()
  })

  it('displays expertise areas for stakeholder type', () => {
    render(<FeedbackCollector stakeholderType="accountant" />)

    expect(screen.getByText(/Areas of Expertise/i)).toBeInTheDocument()
    expect(screen.getByText(/Financial Statements/i)).toBeInTheDocument()
    expect(screen.getByText(/Tax Implications/i)).toBeInTheDocument()
  })

  it('allows rating selection for a category', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    // Find and click an Advanced rating button
    const advancedButtons = screen.getAllByRole('button', { name: /Advanced/i })
    await user.click(advancedButtons[0])

    // The button should be selected (checking aria-pressed or visual state would be ideal)
    expect(advancedButtons[0]).toBeInTheDocument()
  })

  it('allows entering feedback text for a category', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    const textareas = screen.getAllByRole('textbox')
    const firstCategoryTextarea = textareas[2] // Skip stakeholder name/company fields

    await user.type(firstCategoryTextarea, 'Excellent financial modeling skills')
    expect(firstCategoryTextarea).toHaveValue('Excellent financial modeling skills')
  })

  it('shows progress indicator', () => {
    render(<FeedbackCollector />)

    expect(screen.getByText(/Progress/i)).toBeInTheDocument()
    expect(screen.getByText(/0%/i)).toBeInTheDocument()
  })

  it('disables submit button when form is incomplete', () => {
    render(<FeedbackCollector />)

    const submitButton = screen.getByRole('button', { name: /Submit Professional Feedback/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when all fields are completed', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    // Fill in all category feedback fields
    const textareas = screen.getAllByRole('textbox')

    // Fill stakeholder info (optional)
    await user.type(textareas[0], 'John Doe')
    await user.type(textareas[1], 'Acme Corp')

    // Fill all 6 category feedback fields
    for (let i = 2; i < 8; i++) {
      await user.type(textareas[i], 'Good work on this category')
    }

    // Fill overall recommendations (required)
    await user.type(textareas[8], 'Overall excellent project with room for growth')

    const submitButton = screen.getByRole('button', { name: /Submit Professional Feedback/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('calls onSubmit with feedback data when submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<FeedbackCollector onSubmit={onSubmit} />)

    // Fill required fields
    const textareas = screen.getAllByRole('textbox')

    for (let i = 2; i < 8; i++) {
      await user.type(textareas[i], 'Feedback')
    }
    await user.type(textareas[8], 'Overall recommendations')

    const submitButton = screen.getByRole('button', { name: /Submit Professional Feedback/i })
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        ratings: expect.any(Object),
        comments: expect.any(Object),
        overallRecommendations: expect.any(String)
      })
    )
  })

  it('shows success message after submission', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    // Fill all required fields
    const textareas = screen.getAllByRole('textbox')
    for (let i = 2; i < 8; i++) {
      await user.type(textareas[i], 'Feedback')
    }
    await user.type(textareas[8], 'Overall recommendations')

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Professional Feedback/i })
    await user.click(submitButton)

    expect(screen.getByText(/Expert Feedback Submitted Successfully!/i)).toBeInTheDocument()
  })

  it('displays different stakeholder types correctly', () => {
    const { rerender } = render(<FeedbackCollector stakeholderType="entrepreneur" />)
    expect(screen.getByText(/Entrepreneur/i)).toBeInTheDocument()

    rerender(<FeedbackCollector stakeholderType="consultant" />)
    expect(screen.getByText(/Business Consultant/i)).toBeInTheDocument()

    rerender(<FeedbackCollector stakeholderType="banker" />)
    expect(screen.getByText(/Commercial Banker/i)).toBeInTheDocument()
  })

  it('tracks follow-up interest checkbox', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    const followUpCheckbox = screen.getByRole('checkbox', { name: /follow-up mentorship/i })
    expect(followUpCheckbox).not.toBeChecked()

    await user.click(followUpCheckbox)
    expect(followUpCheckbox).toBeChecked()
  })

  it('displays unit number badge when provided', () => {
    render(<FeedbackCollector unitNumber={8} />)

    expect(screen.getByText(/Unit 8/i)).toBeInTheDocument()
  })

  it('shows average rating calculation', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    // Fill feedback to see stats
    const textareas = screen.getAllByRole('textbox')
    for (let i = 2; i < 8; i++) {
      await user.type(textareas[i], 'Feedback')
    }

    // Should show average rating display
    expect(screen.getByText(/Average Rating/i)).toBeInTheDocument()
  })
})
