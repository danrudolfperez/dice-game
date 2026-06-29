# Dice Game — Technical Summary

## Overview

A browser-based dice game built with **Phaser.js** (game canvas + animation) and **React + TypeScript** (UI layer), bundled with **Vite** and styled with **Tailwind CSS v4**.

---

## Requirements

### 1. Phaser Game — Dice Roll Animation

The dice is rendered as a pseudo-3D cube in `src/game/scenes/DiceScene.ts` using Phaser's `Graphics` API — no sprite sheets or image assets needed for the dice itself.

- **Projection**: each vertex is Y-rotated then X-tilted at 45° to produce an isometric look.
- **Painter's algorithm**: visible faces are culled via dot-product against the camera normal, depth-sorted back-to-front, and drawn in order so overlapping faces composite correctly.
- **Animation**: `rollDice()` runs a `setTimeout` loop at ~60 fps for 1400 ms. Rotation eases out with a cubic curve (`1 - (1 - t)³`). During the spin the face label shows a random number; on the final frame it locks to the real result.
- **Shadow**: a static ellipse underneath scales slightly during the spin to give a subtle bounce impression.
- **Result range**: 1–100 (`ROLL_MIN` / `ROLL_MAX` in `src/types/game.ts`).

### 2. React Wrapper

`src/components/GameCanvas.tsx` is a `forwardRef` component that owns the DOM node Phaser mounts into.

`src/hooks/usePhaserGame.ts` manages the lifecycle:

- `createGame()` is called once on mount (guarded by a `useRef` flag to survive React Strict Mode double-invoke).
- `onReady` callback resolves the `bridge` and clears the loading state.
- The `useEffect` cleanup calls `bridge.destroy()`, which stops background music, clears animation timers, and calls `game.destroy(true)` to remove the Phaser canvas from the DOM.

Loading and error states are rendered as overlays inside the same container div as the canvas.

### 3. React–Phaser Interface (Bridge)

Defined in `src/types/bridge.ts` as three composable interfaces:

```ts
interface RollController  { rollDice(result: number, outcome: RollOutcome): void }
interface AudioController { setMuted(muted: boolean): void }
interface GameEvents      { onReady(cb: () => void): void; onRollComplete(cb: (result: number) => void): void }
interface GameBridge extends RollController, AudioController, GameEvents { destroy(): void }
```

`src/game/GameFactory.ts` returns a plain object implementing `GameBridge` — React never imports `DiceScene` directly, only the factory function. This means the game engine and UI layer share no direct coupling; the bridge is the only contract between them.

**React → Phaser:**
- `rollDice(result, outcome)` — starts the spin animation and queues the SFX to play at completion.
- `setMuted(muted)` — delegates to `this.sound.setMute()` in Phaser's global audio manager.

**Phaser → React:**
- `onReady(cb)` — fires once Phaser's `create()` lifecycle completes.
- `onRollComplete(cb)` — fires at the end of the spin animation with the final result value.

The `outcome` (`'win'` | `'loss'`) is computed on the React side before the animation starts (in `useRoll.ts`) and threaded through the bridge so `DiceScene` can play the correct sound effect without needing to know the win condition.

### 4. React UI — Control Panel

`src/components/ControlPanel.tsx`:

| Element | Detail |
|---|---|
| **Target number input** | Range slider (1–100) with fully custom CSS styling via `.dice-slider` pseudo-elements using the provided PNG assets |
| **Roll button** | Disabled while rolling or while the bridge isn't ready; shows a spinner during animation |
| **Result display** | `ResultDisplay` sub-component — green for WIN, red for LOSS, shows rolled value vs target |
| **Sound toggle** | Mute / Unmute button; state lives in `App.tsx`, propagates to Phaser via `bridge.setMuted()` |
| **Streak display** | `StreakDisplay` sub-component — appears only when streak ≠ 0 |

### 5. Responsive Layout

- Canvas container uses `aspect-square` + `max-w-100` so it scales proportionally on any screen width.
- Phaser is configured with `Phaser.Scale.FIT` + `CENTER_BOTH` so the internal 400×400 canvas scales to the available container size without distortion.
- Layout switches from stacked (`flex-col`) to side-by-side (`lg:flex-row`) at the `lg` breakpoint.
- Background uses `background-attachment: fixed` so it doesn't scroll with content on mobile.

### 6. Edge Cases

| Case | How it's handled |
|---|---|
| **Loading state** | `isLoading: true` until `onReady` fires; canvas overlay shows animated gold spinner |
| **Error state** | `try/catch` around `createGame()`; error message rendered as overlay; Roll button disabled |
| **Double roll lock** | `isAnimating` flag inside `DiceScene.rollDice()` returns early; `isRolling` state in `useRoll` disables the button |
| **Cleanup on unmount** | `usePhaserGame` `useEffect` cleanup calls `bridge.destroy()` → stops timers, stops music, destroys Phaser instance |
| **Strict Mode safety** | `initialized.current` ref prevents double-mount from creating two Phaser instances |
| **Mute before scene ready** | `_muted` field stores the value; applied in `create()` so early `setMuted()` calls are not lost |

---

## Bonus Features

### Roll History

`src/components/RollHistory.tsx` + `src/hooks/useRollHistory.ts` + `src/services/historyService.ts`

- Every completed roll is prepended to a `RollEntry[]` array in React state.
- Displayed as a scrollable list (max height 16rem) with green/red row styling per outcome.
- Logic (`createEntry`, `addEntry`, `computeStreak`) lives in a pure service module — no side effects, easy to test.

### Win/Loss Streak Counter

`computeStreak()` in `historyService.ts` walks the history array from the most recent entry and counts consecutive identical outcomes. Returns a positive number for a win streak and a negative number for a loss streak. Zero means no history or a broken streak.

### Keyboard Shortcut

`src/hooks/useKeyboardShortcut.ts` — `Space` bar triggers a roll when the game is ready and not already rolling. Guards against `e.repeat` (held key) and input-element focus.

### Tests

**`src/game/__tests__/bridge.test.ts`** — unit tests for the `GameBridge` contract using a hand-rolled mock:
- `onReady` fires immediately
- `onRollComplete` receives the correct result
- No callback fires after `destroy()`
- Later `onRollComplete` registration replaces the earlier one
- `setMuted` correctly tracks state

**`src/components/__tests__/ControlPanel.test.tsx`** — React Testing Library tests:
- Roll button renders and responds to clicks
- Disabled states (rolling, bridge not ready)
- WIN / LOSS result display
- Win and loss streak labels
- Mute / Unmute label toggling

---

## Code Structure

```
src/
├── types/
│   ├── game.ts          # Domain types: RollOutcome, RollEntry, RollResult, constants
│   └── bridge.ts        # GameBridge interface — the only contract between UI and engine
├── game/
│   ├── GameFactory.ts   # Creates Phaser.Game, returns GameBridge implementation
│   └── scenes/
│       └── DiceScene.ts # All Phaser logic: rendering, animation, audio
├── hooks/
│   ├── usePhaserGame.ts # Mounts/unmounts the game, exposes bridge + loading state
│   ├── useRoll.ts       # Roll orchestration: generates result, drives bridge, updates state
│   ├── useRollHistory.ts# Maintains history array and streak
│   └── useKeyboardShortcut.ts
├── services/
│   ├── rollService.ts   # Pure: generateRoll(), evaluateResult()
│   └── historyService.ts# Pure: createEntry(), addEntry(), computeStreak()
├── components/
│   ├── GameCanvas.tsx   # Canvas mount point + loading/error overlays
│   ├── ControlPanel.tsx # Slider, button, result, streak, mute
│   └── RollHistory.tsx  # Scrollable history list
├── styles/
│   └── theme.ts         # Design tokens shared by React (Tailwind) and Phaser (direct import)
├── App.tsx              # Wires hooks to components
└── index.css            # Tailwind v4 @theme block, body background, vignette, slider CSS
```

---

## Key Design Decisions & Tradeoffs

**Bridge pattern over direct coupling** — React components never import Phaser types. The `GameBridge` interface is the entire public API of the game engine. This means the Phaser implementation could be swapped for a different renderer without touching any React code, and the bridge contract can be tested with a plain mock object.

**Outcome computed in React, not Phaser** — win/loss is determined by `rollService.evaluateResult()` on the React side before the animation starts. Phaser only receives what number to land on and which SFX to play. This keeps game rules in pure, testable functions and Phaser responsible only for presentation.

**Pure service modules** — `rollService.ts` and `historyService.ts` contain no React or Phaser imports. They are plain functions, easy to unit-test and easy to reuse.

**`theme.ts` as single source of truth** — color tokens and typography are defined once and imported by both Phaser scenes (hex integers for `fillStyle`) and React/Tailwind (CSS custom properties via `@theme {}`). A single edit changes the look everywhere.

**What I'd improve with more time:**
- Persist roll history to `localStorage` so it survives page reloads.
- Add a bet/wagering mechanic (the file is named `bet` after all).
- Animate the dice faces with pip dots rather than a text label.
- Add integration tests that mount the full `App` and simulate a complete roll flow.
- Extract the animation loop into a Phaser `update()` tick instead of `setTimeout` to align with Phaser's internal frame scheduler.
