import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('shows a text label, not just a color', () => {
    render(<StatusBadge status="EXPIRING_SOON" />)
    expect(screen.getByText('Expiring soon')).toBeInTheDocument()
  })
  it('shows the expired label', () => {
    render(<StatusBadge status="EXPIRED" />)
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })
})
