import { ROLL_MIN, ROLL_MAX } from '@/types/game'
import type { RollOutcome } from '@/types/game'

export function generateRoll(min = ROLL_MIN, max = ROLL_MAX): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const WIN_RANGE = 17

export function evaluateResult(rolled: number, target: number): RollOutcome {
  return Math.abs(rolled - target) <= WIN_RANGE ? 'win' : 'loss'
}
