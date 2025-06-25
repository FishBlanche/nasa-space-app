import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button component', () => {
  it('renders with children text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
})