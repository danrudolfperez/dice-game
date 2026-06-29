import Phaser from 'phaser'
import { ROLL_MIN, ROLL_MAX } from '@/types/game'
import type { RollOutcome } from '@/types/game'
import { theme } from '@/styles/theme'

const CANVAS_W = 400
const CANVAS_H = 400
const S = 72                   // cube half-size
const TILT = Math.PI / 4       // 45° isometric tilt
const ANIM_DURATION_MS = 1400
const STEP_MS = 16             // ~60fps

type ReadyCb = () => void
type RollCompleteCb = (result: number) => void

interface Face {
  normal: [number, number, number]
  verts: [number, number, number][]
  fill: number
  stroke: number
}

// Top is lightest, visible sides are medium, back/bottom are darkest
const FACES: Face[] = [
  { normal: [0, -1, 0], verts: [[-S,-S,S],[S,-S,S],[S,-S,-S],[-S,-S,-S]], ...theme.dice.top    }, // top — lightest
  { normal: [0, 0, 1],  verts: [[-S,-S,S],[S,-S,S],[S,S,S],[-S,S,S]],    ...theme.dice.front  }, // front — medium
  { normal: [-1, 0, 0], verts: [[-S,-S,S],[-S,-S,-S],[-S,S,-S],[-S,S,S]], ...theme.dice.left   }, // left — dark
  { normal: [1, 0, 0],  verts: [[S,-S,-S],[S,-S,S],[S,S,S],[S,S,-S]],    ...theme.dice.right  }, // right — medium-dark
  { normal: [0, 0, -1], verts: [[S,-S,-S],[-S,-S,-S],[-S,S,-S],[S,S,-S]], ...theme.dice.back   }, // back — darkest
  { normal: [0, 1, 0],  verts: [[-S,S,-S],[S,S,-S],[S,S,S],[-S,S,S]],    ...theme.dice.bottom }, // bottom — darkest
]

export class DiceScene extends Phaser.Scene {
  private diceContainer!: Phaser.GameObjects.Container
  private shadowGraphics!: Phaser.GameObjects.Graphics
  private resultText!: Phaser.GameObjects.Text
  private bgMusic: Phaser.Sound.BaseSound | null = null
  private isAnimating = false
  private animTimer: ReturnType<typeof setTimeout> | null = null
  private readyCbs: ReadyCb[] = []
  private rollCompleteCb: RollCompleteCb | null = null
  private currentAngle = Math.PI / 6  // 30° — front face clearly closest for label
  private _muted = false

  constructor() {
    super({ key: 'DiceScene' })
  }

  preload() {
    this.load.audio('bg',   '/audio/Orquidario - Quincas Moreira.mp3')
    this.load.audio('win',  '/audio/win.mp3')
    this.load.audio('loss', '/audio/lose.mp3')
  }

  create() {
    const cx = CANVAS_W / 2
    const cy = CANVAS_H / 2 - 10

    this.cameras.main.setBackgroundColor(theme.colors.canvasBg)

    // Ground shadow (static, drawn behind the cube)
    this.shadowGraphics = this.add.graphics()
    this.shadowGraphics.fillStyle(theme.dice.shadow.color, theme.dice.shadow.alpha)
    this.shadowGraphics.fillEllipse(cx, cy + 140, S * 2.4, S * 0.55)

    this.diceContainer = this.add.container(cx, cy)
    this.drawCube(1, this.currentAngle)

    this.resultText = this.add
      .text(cx, cy + 162, '', {
        fontSize: '22px',
        color: theme.colors.accentText,
        fontFamily: theme.font.serif,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.bgMusic = this.sound.add('bg', { loop: true, volume: 0.35 })
    this.bgMusic.play()
    this.sound.setMute(this._muted)

    this.readyCbs.forEach((cb) => cb())
    this.readyCbs = []
  }

  private project(x: number, y: number, z: number, ry: number): { px: number; py: number } {
    const x1 = x * Math.cos(ry) + z * Math.sin(ry)
    const z1 = -x * Math.sin(ry) + z * Math.cos(ry)
    return {
      px: x1,
      py: y * Math.cos(TILT) + z1 * Math.sin(TILT),
    }
  }

  private faceDepth(verts: [number, number, number][], ry: number): number {
    return (
      verts.reduce((sum, [x, y, z]) => {
        const z1 = -x * Math.sin(ry) + z * Math.cos(ry)
        return sum + (y * Math.cos(TILT) + z1 * Math.sin(TILT))
      }, 0) / verts.length
    )
  }

  private isVisible(nx: number, ny: number, nz: number, ry: number): boolean {
    const nzRot = -nx * Math.sin(ry) + nz * Math.cos(ry)
    return -ny * Math.sin(TILT) + nzRot * Math.cos(TILT) > 0
  }

  private drawCube(value: number, ry: number) {
    this.diceContainer.removeAll(true)

    const g = this.add.graphics()

    const visible = FACES.filter((f) => this.isVisible(f.normal[0], f.normal[1], f.normal[2], ry))
      .map((f) => ({
        ...f,
        depth: this.faceDepth(f.verts, ry),
        pts: f.verts.map(([x, y, z]) => this.project(x, y, z, ry)),
      }))
      .sort((a, b) => a.depth - b.depth)  // back-to-front

    visible.forEach((f) => {
      g.fillStyle(f.fill, 1)
      g.beginPath()
      g.moveTo(f.pts[0].px, f.pts[0].py)
      for (let i = 1; i < f.pts.length; i++) g.lineTo(f.pts[i].px, f.pts[i].py)
      g.closePath()
      g.fillPath()

      g.lineStyle(2, f.stroke, 1)
      g.beginPath()
      g.moveTo(f.pts[0].px, f.pts[0].py)
      for (let i = 1; i < f.pts.length; i++) g.lineTo(f.pts[i].px, f.pts[i].py)
      g.closePath()
      g.strokePath()
    })

    this.diceContainer.add(g)

    // Draw number on the frontmost face
    if (visible.length > 0) {
      const front = visible[visible.length - 1]
      const fcx = front.pts.reduce((s, p) => s + p.px, 0) / 4
      const fcy = front.pts.reduce((s, p) => s + p.py, 0) / 4
      const label = this.add
        .text(fcx, fcy, String(value), {
          fontSize: value > 9 ? '46px' : '60px',
          color: theme.colors.diceLabel,
          fontFamily: theme.font.serif,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
      this.diceContainer.add(label)
    }
  }

  rollDice(result: number, outcome: RollOutcome) {
    if (this.isAnimating) return
    this.isAnimating = true
    this.resultText.setText('')

    const clampedResult = Math.max(ROLL_MIN, Math.min(ROLL_MAX, result))
    const startAngle = this.currentAngle
    const totalRotation = Math.PI * 6  // 3 full spins — returns to starting angle
    let elapsed = 0

    const spinStep = () => {
      elapsed += STEP_MS
      const progress = Math.min(elapsed / ANIM_DURATION_MS, 1)
      const eased = 1 - Math.pow(1 - progress, 3)  // ease-out cubic
      const ry = startAngle + totalRotation * eased

      // Shadow shrinks slightly during "bounce" at peak speed
      const shadowScale = 1 - Math.sin(progress * Math.PI) * 0.15
      this.shadowGraphics.setScale(shadowScale, 1)

      this.drawCube(
        progress >= 1 ? clampedResult : Math.floor(Math.random() * ROLL_MAX) + ROLL_MIN,
        ry,
      )
      this.currentAngle = ry

      if (progress >= 1) {
        this.shadowGraphics.setScale(1, 1)
        this.isAnimating = false
        this.animTimer = null
        this.resultText.setText(`Rolled: ${clampedResult}`)
        this.sound.play(outcome)
        this.rollCompleteCb?.(clampedResult)
        return
      }

      this.animTimer = setTimeout(spinStep, STEP_MS)
    }

    this.animTimer = setTimeout(spinStep, STEP_MS)
  }

  setMuted(muted: boolean) {
    this._muted = muted
    this.sound.setMute(muted)
  }

  onReady(cb: ReadyCb) {
    if (this.sys.isActive()) cb()
    else this.readyCbs.push(cb)
  }

  onRollComplete(cb: RollCompleteCb) {
    this.rollCompleteCb = cb
  }

  destroy() {
    if (this.animTimer !== null) {
      clearTimeout(this.animTimer)
      this.animTimer = null
    }
    this.bgMusic?.stop()
    this.bgMusic = null
    this.readyCbs = []
    this.rollCompleteCb = null
    this.isAnimating = false
  }
}
