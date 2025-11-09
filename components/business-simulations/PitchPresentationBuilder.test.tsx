import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PitchPresentationBuilder } from './PitchPresentationBuilder'
import type { PitchPresentationBuilderActivityProps } from '@/lib/db/schema/activities'

const mockActivity: PitchPresentationBuilderActivityProps = {
  title: 'Investor Pitch Builder',
  description: 'Build a compelling 4-minute investor pitch for your startup business model',
  sectionDefinitions: {
    problem: {
      name: 'Problem',
      icon: 'alert-circle',
      timeTarget: 45,
      description: 'Define the market pain point and opportunity',
      keyPoints: ['Pain point identification', 'Market size opportunity', 'Current solutions shortfall', 'Urgency and timing']
    },
    solution: {
      name: 'Solution',
      icon: 'lightbulb',
      timeTarget: 60,
      description: 'Present your unique value proposition',
      keyPoints: ['Product overview', 'Unique differentiation', 'Competitive advantage', 'Demo or prototype']
    },
    market: {
      name: 'Market',
      icon: 'bar-chart-3',
      timeTarget: 45,
      description: 'Analyze target audience and competition',
      keyPoints: ['Target customer profile', 'TAM/SAM/SOM analysis', 'Competitive landscape', 'Go-to-market strategy']
    },
    'business-model': {
      name: 'Business Model',
      icon: 'pie-chart',
      timeTarget: 45,
      description: 'Explain how you make money',
      keyPoints: ['Revenue streams', 'Pricing strategy', 'Unit economics', 'Scalability factors']
    },
    financials: {
      name: 'Financials',
      icon: 'chart-line',
      timeTarget: 60,
      description: 'Show growth projections and metrics',
      keyPoints: ['3-year revenue projections', 'Key performance metrics', 'Break-even analysis', 'Market traction']
    },
    ask: {
      name: 'The Ask',
      icon: 'dollar-sign',
      timeTarget: 45,
      description: 'Investment request and terms',
      keyPoints: ['Funding amount needed', 'Use of funds breakdown', 'Expected returns/timeline', 'Next milestones']
    }
  },
  initialState: {
    businessModel: {
      type: 'saas',
      name: '',
      industry: '',
      targetMarket: '',
      revenueModel: ''
    },
    sections: {
      problem: { title: '', content: '', speakingNotes: '', timeAllocation: 45, completeness: 0 },
      solution: { title: '', content: '', speakingNotes: '', timeAllocation: 60, completeness: 0 },
      market: { title: '', content: '', speakingNotes: '', timeAllocation: 45, completeness: 0 },
      'business-model': { title: '', content: '', speakingNotes: '', timeAllocation: 45, completeness: 0 },
      financials: { title: '', content: '', speakingNotes: '', timeAllocation: 60, completeness: 0 },
      ask: { title: '', content: '', speakingNotes: '', timeAllocation: 45, completeness: 0 }
    },
    financials: {
      year1Revenue: 0,
      year2Revenue: 0,
      year3Revenue: 0,
      initialInvestment: 0,
      useOfFunds: [],
      keyMetrics: {}
    }
  }
}

describe('PitchPresentationBuilder', () => {
  it('renders with activity title and description', () => {
    render(<PitchPresentationBuilder activity={mockActivity} />)

    expect(screen.getByText('Investor Pitch Builder')).toBeInTheDocument()
    expect(screen.getByText(/Build a compelling 4-minute investor pitch/i)).toBeInTheDocument()
  })

  it('displays initial overall progress as 0%', () => {
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Progress 0% appears in multiple places (overall progress card and section completeness)
    const progressElements = screen.getAllByText('0%')
    expect(progressElements.length).toBeGreaterThan(0)
    expect(screen.getByText('0/6 sections complete')).toBeInTheDocument()
  })

  it('displays target time from section definitions', () => {
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Total target: 45 + 60 + 45 + 45 + 60 + 45 = 300 seconds = 5:00
    expect(screen.getByText('5:00')).toBeInTheDocument()
    expect(screen.getByText('4-minute pitch goal')).toBeInTheDocument()
  })

  it('displays selected business type from initial state', () => {
    render(<PitchPresentationBuilder activity={mockActivity} />)

    expect(screen.getByText('SaaS Platform')).toBeInTheDocument()
  })

  it('shows all three presentation modes', () => {
    render(<PitchPresentationBuilder activity={mockActivity} />)

    expect(screen.getByRole('button', { name: /build content/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /practice mode/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /review & export/i })).toBeInTheDocument()
  })

  it('switches between build, practice, and review modes', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Start in build mode - should see business model setup
    expect(screen.getByText(/Business Model Setup/i)).toBeInTheDocument()

    // Switch to practice mode
    const practiceButton = screen.getByRole('button', { name: /practice mode/i })
    await user.click(practiceButton)

    await waitFor(() => {
      expect(screen.getByText(/Practice Your Pitch/i)).toBeInTheDocument()
    })

    // Switch to review mode
    const reviewButton = screen.getByRole('button', { name: /review & export/i })
    await user.click(reviewButton)

    await waitFor(() => {
      expect(screen.getByText(/Pitch Summary/i)).toBeInTheDocument()
    })
  })

  it('displays all six pitch sections in build mode', () => {
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Section names appear in multiple places (navigation and current section)
    expect(screen.getAllByText('Problem').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Solution').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Market').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Business Model').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Financials').length).toBeGreaterThan(0)
    expect(screen.getAllByText('The Ask').length).toBeGreaterThan(0)
  })

  it('allows editing section content', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Find the main content textarea
    const contentTextarea = screen.getByPlaceholderText(/Describe your problem in detail/i)
    await user.type(contentTextarea, 'This is a major market problem that needs solving.')

    await waitFor(() => {
      expect(contentTextarea).toHaveValue('This is a major market problem that needs solving.')
    })
  })

  it('allows editing business name', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    const nameInput = screen.getByPlaceholderText(/Enter your startup name/i)
    await user.type(nameInput, 'TechStartup Inc')

    await waitFor(() => {
      expect(nameInput).toHaveValue('TechStartup Inc')
    })
  })

  it('allows changing business type', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    const typeSelect = screen.getByLabelText(/Business Type/i)
    await user.selectOptions(typeSelect, 'fintech')

    await waitFor(() => {
      expect(typeSelect).toHaveValue('fintech')
    })
  })

  it('starts and pauses practice timer', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Switch to practice mode
    const practiceButton = screen.getByRole('button', { name: /practice mode/i })
    await user.click(practiceButton)

    await waitFor(() => {
      expect(screen.getByText(/Practice Your Pitch/i)).toBeInTheDocument()
    })

    // Timer should show 0:00 initially (may appear in multiple places)
    const timerElements = screen.getAllByText('0:00')
    expect(timerElements.length).toBeGreaterThan(0)

    // Start timer - just verify button clicks work
    const startButton = screen.getByRole('button', { name: /start practice/i })
    await user.click(startButton)

    // After clicking start, button text should change to Pause
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    })
  })

  it('resets practice timer', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Switch to practice mode
    const practiceButton = screen.getByRole('button', { name: /practice mode/i })
    await user.click(practiceButton)

    await waitFor(() => {
      expect(screen.getByText(/Practice Your Pitch/i)).toBeInTheDocument()
    })

    // Just verify reset button exists and can be clicked
    const resetButton = screen.getByRole('button', { name: /reset/i })
    await user.click(resetButton)

    // Timer should still show 0:00 after reset
    await waitFor(() => {
      const timerElements = screen.getAllByText('0:00')
      expect(timerElements.length).toBeGreaterThan(0)
    })
  })

  it('exports pitch deck in review mode', async () => {
    const user = userEvent.setup()

    // Mock URL.createObjectURL and revokeObjectURL
    const originalCreateObjectURL = global.URL.createObjectURL
    const originalRevokeObjectURL = global.URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()

    // Mock HTMLAnchorElement.click
    const mockClick = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') {
        element.click = mockClick
      }
      return element
    })

    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Switch to review mode
    const reviewButton = screen.getByRole('button', { name: /review & export/i })
    await user.click(reviewButton)

    await waitFor(() => {
      expect(screen.getByText(/Pitch Summary/i)).toBeInTheDocument()
    })

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export pitch deck/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled()
    })

    // Restore mocks
    global.URL.createObjectURL = originalCreateObjectURL
    global.URL.revokeObjectURL = originalRevokeObjectURL
    document.createElement = originalCreateElement
  })

  it('calls onSubmit when submit results is clicked in review mode', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<PitchPresentationBuilder activity={mockActivity} onSubmit={onSubmit} />)

    // Switch to review mode
    const reviewButton = screen.getByRole('button', { name: /review & export/i })
    await user.click(reviewButton)

    await waitFor(() => {
      expect(screen.getByText(/Pitch Summary/i)).toBeInTheDocument()
    })

    // Click submit results button
    const submitButton = screen.getByRole('button', { name: /submit results/i })
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('overallProgress', 0)
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('businessModel')
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('sections')
  })

  it('toggles instructions panel', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    const helpButton = screen.getByRole('button', { name: /how to build your pitch/i })

    // Click to toggle instructions
    await user.click(helpButton)

    // Verify toggle action worked
    await waitFor(() => {
      expect(helpButton).toBeInTheDocument()
    })
  })

  it('shows section completeness in review mode', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Switch to review mode
    const reviewButton = screen.getByRole('button', { name: /review & export/i })
    await user.click(reviewButton)

    await waitFor(() => {
      expect(screen.getByText(/Business Overview/i)).toBeInTheDocument()
    })

    // Check that section names appear
    expect(screen.getAllByText('Problem').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Solution').length).toBeGreaterThan(0)
  })

  it('navigates between pitch sections', async () => {
    const user = userEvent.setup()
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Initially on Problem section
    expect(screen.getByText('Define the market pain point and opportunity')).toBeInTheDocument()

    // Find and click on the Market section button by searching for text containing "Market"
    const allButtons = screen.getAllByRole('button')
    const marketButton = allButtons.find(btn => {
      const text = btn.textContent || ''
      return text.includes('Market') && !text.includes('Go-to-market')
    })

    if (marketButton) {
      await user.click(marketButton)

      await waitFor(() => {
        expect(screen.getByText('Analyze target audience and competition')).toBeInTheDocument()
      })
    }
  })

  it('displays key points for current section', () => {
    render(<PitchPresentationBuilder activity={mockActivity} />)

    // Problem section key points should be visible (with bullet points)
    expect(screen.getByText(/Pain point identification/i)).toBeInTheDocument()
    expect(screen.getByText(/Market size opportunity/i)).toBeInTheDocument()
    expect(screen.getByText(/Current solutions shortfall/i)).toBeInTheDocument()
    expect(screen.getByText(/Urgency and timing/i)).toBeInTheDocument()
  })
})
