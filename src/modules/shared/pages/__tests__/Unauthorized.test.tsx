import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Unauthorized from '../Unauthorized'

describe('Unauthorized page', () => {
  it('renders heading and message', () => {
    render(<Unauthorized />)
    expect(screen.getByRole('heading', { name: /401 Unauthorized Access/i })).toBeDefined()
    expect(screen.getByText(/don’t have permission/i)).toBeDefined()
  })

  it('has home action button', () => {
    render(<Unauthorized />)
    const button = screen.getByRole('button', { name: /Go to Home/i })
    expect(button).toBeDefined()
  })
})

