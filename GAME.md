# Game Developer - Technical Assessment

## Process

This task is designed to reflect the kind of real world work.
AI tools and anything else are all allowed

## The Task

Build a **Dice Game** with a Phaser.js game canvas and a React UI panel. The game simulates a dice roll: the player picks a target number, clicks roll, and the dice animates to a random result.

### Requirements

1. **Phaser game** - Render a dice roll animation in a Phaser scene. The dice should visually roll and land on a result number (1-100).

2. **React wrapper** - Mount the Phaser game inside a React component. Handle game initialization, loading state, and cleanup on unmount.

3. **React-Phaser interface** - Define a typed interface for communication between React and Phaser:
   - **React to Phaser**: trigger a roll with a result, set volume/mute
   - **Phaser to React**: notify when the game is ready, notify when the roll animation completes with the result

4. **React UI** - A control panel alongside the game canvas with:
   - Target number input
   - Roll button
   - Result display win/loss
   - Sound on/off toggle

5. **Responsive layout** - Game canvas and control panel should work on mobile and desktop. The canvas should scale properly on resize.

6. **Edge cases**:
   - Loading state while Phaser initializes
   - Error state if game fails to load
   - Prevent double roll while animation is in progress
   - Clean up Phaser instance

### Bonus

- Roll history
- Win/loss streak counter
- Keyboard shortcut to roll
- Tests for the React-Phaser interface

## Evaluation Criteria

| Area | What we look for |
|---|---|
| **Phaser usage** | Scene lifecycle, asset loading, animations, proper scaling |
| **React, Phaser bridge** | Clean typed interface, no tight coupling, proper cleanup |
| **Code structure** | Separation between game engine and UI layer |
| **TypeScript** | Typed callbacks, game instance interface |
| **Responsive design** | Canvas scales correctly, UI works on mobile |
| **Edge cases** | Loading, error, animation lock, destroy on unmount |
| **Git history** | Clean, logical commits |
| **Code quality** | Readable code, meaningful naming |

## Submission

1. Push your work to a public GitHub repository
2. Include a README with setup instructions so we can run it locally
3. Share the repository link with us

Be prepared to explain your decisions, tradeoffs, and what you'd improve with more time.
Good luck and have fun!