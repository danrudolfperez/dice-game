# Dice Game

A dice roll game built with Phaser and React.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Other commands

```bash
npm run build      # production build
npm test           # run tests
npm run test:watch # watch mode
npm run lint       # ESLint
npm run format     # Prettier
```

## How to play

1. Use the **slider** to pick a target number (1–100)
2. Click **Roll Dice** or press **Space**
3. **Win** if the rolled number falls within ±17 of your target (~35% chance)
4. On a win, the dice animates to land on your exact target number

## Win condition

```
|rolled − target| ≤ 17  →  WIN
```

The game rolls a random integer between 1 and 100. If the result is within 17 of your chosen target in either direction, you win. On a win, the dice display shows your target number so the visual result always matches. On a loss, the actual rolled number is shown.

## Architecture

```
src/
  types/       # Shared interfaces (GameBridge, RollResult, RollOutcome, etc.)
  game/        # Phaser layer — DiceScene + GameFactory
  services/    # Pure business logic — rollService (roll generation + win evaluation)
  hooks/       # React wiring — usePhaserGame, useRoll, useRollHistory, useKeyboardShortcut
  components/  # UI — GameCanvas, ControlPanel (slider + result + streak)
  App.tsx      # Composition root
```

React and Phaser communicate through the `GameBridge` interface defined in `src/types/bridge.ts`. React never imports Phaser internals; Phaser never imports React. The bridge is the only shared contract.

### Dice rendering

The dice is a pseudo-3D cube rendered entirely with Phaser's 2D Graphics API — no Three.js or external 3D library. Each frame:

1. **Y-rotation** spins the cube around its vertical axis
2. **X-tilt** (45°) projects it into the isometric view
3. **Visibility culling** via dot product filters back-facing faces
4. **Painter's algorithm** sorts visible faces back-to-front before drawing
5. A ground shadow ellipse scales during the roll to simulate the cube lifting

The win/loss outcome is determined before the animation starts, so the correct final value is known upfront and revealed only on the last frame.

## Trade-offs

- **Phaser pseudo-3D over Three.js / dice-box** — no extra dependencies or WASM/worker asset pipeline; full control over appearance and animation timing
- **Outcome evaluated before animation** — avoids a second async round-trip; the bridge only carries the display value, not a re-roll
- **Single `onRollComplete` callback** — replaces on each call rather than accumulating, avoiding stale closure bugs across re-renders
- **No state management library** — scope is small enough that `useState` + custom hooks is sufficient; would add Zustand at scale

## What I'd improve with more time

- Add sound effects (dice roll sfx, win/loss jingle)
- Persist roll history to `localStorage`
- Add bet sizing and a coin balance mechanic
- Animate the result text with a bounce tween
- Add E2E tests with Playwright
