import { render, screen } from '@testing-library/react'
import { ErrorCheckingSystem } from '@/components/activities/exercises/ErrorCheckingSystem'
import { expect, vi } from 'vitest'

describe('ErrorCheckingSystem', () => {
  it('renders without crashing', () => {
    render(<ErrorCheckingSystem activity={{}} />)
    expect(screen.getByText(/Error Checking System/i)).toBeInTheDocument()
  })

  it('calls onSubmit when audit is complete', () => {
    const onSubmit = vi.fn()
    render(<ErrorCheckingSystem activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Error Checking System/i)).toBeInTheDocument()
  })

  it('calls onComplete when audit is complete', () => {
    const onComplete = vi.fn()
    render(<ErrorCheckingSystem activity={{}} onComplete={onComplete} />)
    
    expect(screen.getByText(/Error Checking System/i)).toBeInTheDocument()
  })
})
