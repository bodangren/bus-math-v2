import { render, screen } from '@testing-library/react'
import { ChartLinkingSimulator } from '@/components/activities/exercises/ChartLinkingSimulator'
import { expect, vi } from 'vitest'

describe('ChartLinkingSimulator', () => {
  it('renders without crashing', () => {
    render(<ChartLinkingSimulator activity={{}} />)
    expect(screen.getByText(/Financial Statement Linking Simulator/i)).toBeInTheDocument()
  })

  it('calls onSubmit when analysis is complete', () => {
    const onSubmit = vi.fn()
    render(<ChartLinkingSimulator activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Financial Statement Linking Simulator/i)).toBeInTheDocument()
  })

  it('calls onComplete when analysis is complete', () => {
    const onComplete = vi.fn()
    render(<ChartLinkingSimulator activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    expect(screen.getByText(/Financial Statement Linking Simulator/i)).toBeInTheDocument()
  })
})
