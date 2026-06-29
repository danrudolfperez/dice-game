export interface RollController {
  rollDice(result: number): void
}

export interface AudioController {
  setMuted(muted: boolean): void
}

export interface GameEvents {
  onReady(cb: () => void): void
  onRollComplete(cb: (result: number) => void): void
}

export interface GameBridge extends RollController, AudioController, GameEvents {
  destroy(): void
}
