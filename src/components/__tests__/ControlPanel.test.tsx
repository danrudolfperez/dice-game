import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ControlPanel } from '@/components/ControlPanel'
import type { RollResult } from '@/types/game'

const defaultProps = {
  target: 50,
  onTargetChange: vi.fn(),
  onRoll: vi.fn(),
  isRolling: false,
  isDisabled: false,
  isMuted: false,
  onMuteToggle: vi.fn(),
  lastResult: null,
  streak: 0,
}

describe('ControlPanel', () => {
  it('renders roll button', () => {
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument()
  })

  it('disables roll button while rolling', () => {
    render(<ControlPanel {...defaultProps} isRolling={true} />)
    expect(screen.getByRole('button', { name: /rolling/i })).toBeDisabled()
  })

  it('disables roll button when isDisabled', () => {
    render(<ControlPanel {...defaultProps} isDisabled={true} />)
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeDisabled()
  })

  it('calls onRoll when button clicked', async () => {
    const onRoll = vi.fn()
    render(<ControlPanel {...defaultProps} onRoll={onRoll} />)
    await userEvent.click(screen.getByRole('button', { name: /roll dice/i }))
    expect(onRoll).toHaveBeenCalledOnce()
  })

  it('shows WIN result display', () => {
    const lastResult: RollResult = { rolled: 30, target: 50, outcome: 'win' }
    render(<ControlPanel {...defaultProps} lastResult={lastResult} />)
    expect(screen.getByText('WIN')).toBeInTheDocument()
    expect(screen.getByText(/30/)).toBeInTheDocument()
  })

  it('shows LOSS result display', () => {
    const lastResult: RollResult = { rolled: 80, target: 50, outcome: 'loss' }
    render(<ControlPanel {...defaultProps} lastResult={lastResult} />)
    expect(screen.getByText('LOSS')).toBeInTheDocument()
  })

  it('shows win streak', () => {
    render(<ControlPanel {...defaultProps} streak={3} />)
    expect(screen.getByText(/3 win streak/i)).toBeInTheDocument()
  })

  it('shows loss streak', () => {
    render(<ControlPanel {...defaultProps} streak={-2} />)
    expect(screen.getByText(/2 loss streak/i)).toBeInTheDocument()
  })

  it('calls onMuteToggle when mute button clicked', async () => {
    const onMuteToggle = vi.fn()
    render(<ControlPanel {...defaultProps} onMuteToggle={onMuteToggle} />)
    await userEvent.click(screen.getByRole('button', { name: /mute/i }))
    expect(onMuteToggle).toHaveBeenCalledOnce()
  })

  it('shows unmute label when muted', () => {
    render(<ControlPanel {...defaultProps} isMuted={true} />)
    expect(screen.getByRole('button', { name: /unmute/i })).toBeInTheDocument()
  })
})
