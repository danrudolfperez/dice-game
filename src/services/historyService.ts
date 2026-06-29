import type { RollEntry, RollOutcome } from '@/types/game'

let nextId = 1

export function createEntry(rolled: number, target: number, outcome: RollOutcome): RollEntry {
  return { id: nextId++, rolled, target, outcome, timestamp: Date.now() }
}

export function addEntry(history: RollEntry[], entry: RollEntry): RollEntry[] {
  return [entry, ...history]
}

export function computeStreak(history: RollEntry[]): number {
  if (history.length === 0) return 0
  const latest = history[0].outcome
  let count = 0
  for (const entry of history) {
    if (entry.outcome !== latest) break
    count++
  }
  return latest === 'win' ? count : -count
}
