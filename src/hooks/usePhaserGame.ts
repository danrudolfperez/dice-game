import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { createGame } from '@/game/GameFactory'
import type { GameBridge } from '@/types/bridge'

interface UsePhaserGameResult {
  bridge: GameBridge | null
  isLoading: boolean
  error: string | null
}

export function usePhaserGame(containerRef: RefObject<HTMLDivElement | null>): UsePhaserGameResult {
  const [bridge, setBridge] = useState<GameBridge | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!containerRef.current || initialized.current) return
    initialized.current = true

    let instance: GameBridge | null = null

    try {
      instance = createGame(containerRef.current)

      instance.onReady(() => {
        setBridge(instance)
        setIsLoading(false)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize game'
      setError(message)
      setIsLoading(false)
    }

    return () => {
      instance?.destroy()
      setBridge(null)
      initialized.current = false
    }
  }, [containerRef])

  return { bridge, isLoading, error }
}
