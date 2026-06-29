import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameBridge } from '@/types/bridge'

function createMockBridge(): GameBridge {
  let rollCompleteCb: ((result: number) => void) | null = null
  let muted = false
  let destroyed = false

  return {
    rollDice: vi.fn((result: number, _outcome: 'win' | 'loss') => {
      if (!destroyed) rollCompleteCb?.(result)
    }),
    setMuted: vi.fn((m: boolean) => {
      muted = m
    }),
    onReady: vi.fn((cb: () => void) => {
      cb()
    }),
    onRollComplete: vi.fn((cb: (result: number) => void) => {
      rollCompleteCb = cb
    }),
    destroy: vi.fn(() => {
      destroyed = true
      rollCompleteCb = null
    }),
    _getMuted: () => muted,
    _getDestroyed: () => destroyed,
  } as unknown as GameBridge & { _getMuted: () => boolean; _getDestroyed: () => boolean }
}

describe('GameBridge mock', () => {
  let bridge: ReturnType<typeof createMockBridge>

  beforeEach(() => {
    bridge = createMockBridge()
  })

  it('fires onReady callback immediately', () => {
    const cb = vi.fn()
    bridge.onReady(cb)
    expect(cb).toHaveBeenCalledOnce()
  })

  it('fires onRollComplete with the rolled result', () => {
    const cb = vi.fn()
    bridge.onRollComplete(cb)
    bridge.rollDice(42, 'win')
    expect(cb).toHaveBeenCalledWith(42)
  })

  it('does not fire rollComplete after destroy', () => {
    const cb = vi.fn()
    bridge.onRollComplete(cb)
    bridge.destroy()
    bridge.rollDice(42, 'win')
    expect(cb).not.toHaveBeenCalled()
  })

  it('replaces rollComplete callback on each call', () => {
    const first = vi.fn()
    const second = vi.fn()
    bridge.onRollComplete(first)
    bridge.onRollComplete(second)
    bridge.rollDice(10, 'loss')
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith(10)
  })

  it('tracks mute state via setMuted', () => {
    const b = bridge as unknown as ReturnType<typeof createMockBridge> & {
      _getMuted: () => boolean
    }
    b.setMuted(true)
    expect(b._getMuted()).toBe(true)
    b.setMuted(false)
    expect(b._getMuted()).toBe(false)
  })
})
