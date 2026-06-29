import { useState, useCallback } from 'react'
import type { RollEntry, RollResult } from '@/types/game'
import { createEntry, addEntry, computeStreak } from '@/services/historyService'

interface UseRollHistoryResult {
  history: RollEntry[]
  streak: number
  recordResult: (result: RollResult) => void
}

export function useRollHistory(): UseRollHistoryResult {
  const [history, setHistory] = useState<RollEntry[]>([])

  const recordResult = useCallback((result: RollResult) => {
    const entry = createEntry(result.rolled, result.target, result.outcome)
    setHistory((prev) => addEntry(prev, entry))
  }, [])

  const streak = computeStreak(history)

  return { history, streak, recordResult }
}
