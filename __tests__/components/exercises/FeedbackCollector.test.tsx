import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackCollector from '../../../components/exercises/FeedbackCollector'

describe('FeedbackCollector', () => {
  it('renders the component with title', () => {
    render(<FeedbackCollector />)

    expect(screen.getByText(/Expert Stakeholder Feedback/i)).toBeInTheDocument()
    expect(screen.getByText(/Professional industry feedback/i)).toBeInTheDocument()
  })

  it('displays stakeholder type badge', () => {
    render(<FeedbackCollector stakeholderType="investor" />)

    expect(screen.getAllByText(/Investor \/ VC/i).length).toBeGreaterThan(0)
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

    await waitFor(() => {
      const selectedButtons = screen.getAllByRole('button', { name: /Advanced/i })
      expect(selectedButtons.some((button) => button.className.includes('bg-blue-600'))).toBe(true)
    })
  })

  it('allows entering feedback text for a category', async () => {
    render(<FeedbackCollector />)

    const textareas = screen.getAllByRole('textbox')
    const firstCategoryTextarea = textareas[2]

    fireEvent.change(firstCategoryTextarea, {
      target: { value: 'Excellent financial modeling skills' }
    })
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
    render(<FeedbackCollector />)

    const textboxes = screen.getAllByRole('textbox')
    const categoryTextareas = textboxes.slice(2, 8)
    const overallRecommendations = textboxes[8]

    categoryTextareas.forEach((textarea) => {
      fireEvent.change(textarea, { target: { value: 'Good work on this category' } })
    })
    fireEvent.change(overallRecommendations, {
      target: { value: 'Overall excellent project with room for growth' }
    })

    const submitButton = screen.getByRole('button', { name: /Submit Professional Feedback/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('calls onSubmit with feedback data when submitted', async () => {
    const onSubmit = vi.fn()

    render(<FeedbackCollector onSubmit={onSubmit} />)

    const textareas = screen.getAllByRole('textbox')
    textareas.slice(2, 8).forEach((textarea) => {
      fireEvent.change(textarea, { target: { value: 'Feedback' } })
    })
    fireEvent.change(textareas[8], { target: { value: 'Overall recommendations' } })

    const submitButton = screen.getByRole('button', { name: /Submit Professional Feedback/i })
    fireEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        ratings: expect.any(Object),
        comments: expect.any(Object),
        overallRecommendations: expect.any(String)
      })
    )
  })

  it('shows success message after submission', async () => {
    render(<FeedbackCollector />)

    const textareas = screen.getAllByRole('textbox')
    textareas.slice(2, 8).forEach((textarea) => {
      fireEvent.change(textarea, { target: { value: 'Feedback' } })
    })
    fireEvent.change(textareas[8], { target: { value: 'Overall recommendations' } })

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Professional Feedback/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(/Expert Feedback Submitted Successfully!/i)).toBeInTheDocument()
  })

  it('displays different stakeholder types correctly', () => {
    const { rerender } = render(<FeedbackCollector stakeholderType="entrepreneur" />)
    expect(screen.getAllByText(/Entrepreneur/i).length).toBeGreaterThan(0)

    rerender(<FeedbackCollector stakeholderType="consultant" />)
    expect(screen.getAllByText(/Business Consultant/i).length).toBeGreaterThan(0)

    rerender(<FeedbackCollector stakeholderType="banker" />)
    expect(screen.getAllByText(/Commercial Banker/i).length).toBeGreaterThan(0)
  })

  it('tracks follow-up interest checkbox', async () => {
    const user = userEvent.setup()
    render(<FeedbackCollector />)

    const followUpCheckbox = screen.getByRole('checkbox', { name: /follow-up mentorship opportunities/i })
    expect(followUpCheckbox).not.toBeChecked()

    await user.click(followUpCheckbox)
    expect(followUpCheckbox).toBeChecked()
  })

  it('displays unit number badge when provided', () => {
    render(<FeedbackCollector unitNumber={8} />)

    expect(screen.getByText(/Unit 8/i)).toBeInTheDocument()
  })

  it('shows average rating calculation', async () => {
    render(<FeedbackCollector />)

    const textareas = screen.getAllByRole('textbox')
    textareas.slice(2, 8).forEach((textarea) => {
      fireEvent.change(textarea, { target: { value: 'Feedback' } })
    })

    // Should show average rating display
    expect(screen.getByText(/Average Rating/i)).toBeInTheDocument()
  })
})
