export const ROLL_MIN = 1
export const ROLL_MAX = 100

export type RollOutcome = 'win' | 'loss'

export interface RollEntry {
  id: number
  rolled: number
  target: number
  outcome: RollOutcome
  timestamp: number
}

export interface RollResult {
  rolled: number
  target: number
  outcome: RollOutcome
}
