import Phaser from 'phaser'
import { DiceScene } from './scenes/DiceScene'
import type { GameBridge } from '@/types/bridge'

const CANVAS_W = 400
const CANVAS_H = 400

export function createGame(container: HTMLElement): GameBridge {
  const scene = new DiceScene()

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: CANVAS_W,
    height: CANVAS_H,
    parent: container,
    transparent: true,
    scene: [scene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  })

  return {
    rollDice: (result, outcome) => scene.rollDice(result, outcome),
    setMuted: (muted) => scene.setMuted(muted),
    onReady: (cb) => scene.onReady(cb),
    onRollComplete: (cb) => scene.onRollComplete(cb),
    destroy: () => {
      scene.destroy()
      game.destroy(true)
    },
  }
}
