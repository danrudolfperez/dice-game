import { forwardRef } from 'react'

interface GameCanvasProps {
  isLoading: boolean
  error: string | null
}

export const GameCanvas = forwardRef<HTMLDivElement, GameCanvasProps>(
  ({ isLoading, error }, ref) => {
    return (
      <div
        className="relative w-full aspect-square max-w-100 mx-auto overflow-hidden rounded-xl"
        style={{
          backgroundImage: "url('/assets/dice-game-canvas-bg.png')",
          backgroundSize: '100% 100%',
        }}
      >
        <div ref={ref} className="w-full h-full" />

        {isLoading && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-canvas-bg/80">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 rounded-xl bg-black/60 border-2 border-gold animate-pulse flex items-center justify-center">
                <span className="text-3xl font-bold text-gold font-mono">?</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gold animate-ping" />
            </div>
            <span className="text-gold text-sm tracking-widest uppercase">Loading…</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-canvas-bg/80 gap-2 p-6 text-center">
            <span className="text-red-400 text-2xl">⚠</span>
            <p className="text-red-400 font-semibold">Failed to load game</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    )
  }
)

GameCanvas.displayName = 'GameCanvas'
