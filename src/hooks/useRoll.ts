import { useState, useCallback } from 'react'
import type { GameBridge } from '@/types/bridge'
import type { RollResult } from '@/types/game'
import { generateRoll, evaluateResult } from '@/services/rollService'

interface UseRollResult {
  roll: (target: number) => void
  isRolling: boolean
  lastResult: RollResult | null
}

export function useRoll(
  bridge: GameBridge | null,
  onComplete?: (result: RollResult) => void
): UseRollResult {
  const [isRolling, setIsRolling] = useState(false)
  const [lastResult, setLastResult] = useState<RollResult | null>(null)

  const roll = useCallback(
    (target: number) => {
      if (!bridge || isRolling) return

      const rolled = generateRoll()
      const outcome = evaluateResult(rolled, target)
      const displayValue = outcome === 'win' ? target : rolled

      setIsRolling(true)

      bridge.onRollComplete((result) => {
        const rollResult: RollResult = { rolled: result, target, outcome }
        setLastResult(rollResult)
        setIsRolling(false)
        onComplete?.(rollResult)
      })

      bridge.rollDice(displayValue)
    },
    [bridge, isRolling, onComplete]
  )

  return { roll, isRolling, lastResult }
}
