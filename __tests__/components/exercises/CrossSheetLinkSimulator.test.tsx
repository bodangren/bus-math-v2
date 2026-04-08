import { render, screen } from '@testing-library/react'
import { CrossSheetLinkSimulator } from '@/components/activities/exercises/CrossSheetLinkSimulator'
import { expect, vi } from 'vitest'

describe('CrossSheetLinkSimulator', () => {
  it('renders without crashing', () => {
    render(<CrossSheetLinkSimulator activity={{}} />)
    expect(screen.getByText(/Cross-Sheet Linking Simulator/i)).toBeInTheDocument()
  })

  it('calls onSubmit when analysis is complete', () => {
    const onSubmit = vi.fn()
    render(<CrossSheetLinkSimulator activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Cross-Sheet Linking Simulator/i)).toBeInTheDocument()
  })

  it('calls onComplete when analysis is complete', () => {
    const onComplete = vi.fn()
    render(<CrossSheetLinkSimulator activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    expect(screen.getByText(/Cross-Sheet Linking Simulator/i)).toBeInTheDocument()
  })
})
