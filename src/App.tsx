import { useRef, useState, useCallback } from 'react'
import { GameCanvas } from '@/components/GameCanvas'
import { ControlPanel } from '@/components/ControlPanel'
import { RollHistory } from '@/components/RollHistory'
import { usePhaserGame } from '@/hooks/usePhaserGame'
import { useRoll } from '@/hooks/useRoll'
import { useRollHistory } from '@/hooks/useRollHistory'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { ROLL_MIN, ROLL_MAX } from '@/types/game'
import type { RollResult } from '@/types/game'

const DEFAULT_TARGET = 50

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const { bridge, isLoading, error } = usePhaserGame(canvasRef)

  const [target, setTarget] = useState(DEFAULT_TARGET)
  const [isMuted, setIsMuted] = useState(false)

  const { history, streak, recordResult } = useRollHistory()

  const handleRollComplete = useCallback(
    (result: RollResult) => {
      recordResult(result)
    },
    [recordResult]
  )

  const { roll, isRolling, lastResult } = useRoll(bridge, handleRollComplete)

  const handleRoll = useCallback(() => {
    roll(target)
  }, [roll, target])

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      bridge?.setMuted(next)
      return next
    })
  }, [bridge])

  const handleTargetChange = useCallback((value: number) => {
    const clamped = Math.max(ROLL_MIN, Math.min(ROLL_MAX, value))
    setTarget(clamped)
  }, [])

  useKeyboardShortcut('Space', handleRoll, !isLoading && !isRolling && !!bridge)

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-3xl">
        <div className="flex-1 flex flex-col gap-4">
          <GameCanvas ref={canvasRef} isLoading={isLoading} error={error} />
        </div>

        <div className="flex flex-col gap-4 lg:w-72">
          <ControlPanel
            target={target}
            onTargetChange={handleTargetChange}
            onRoll={handleRoll}
            isRolling={isRolling}
            isDisabled={!bridge || !!error}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
            lastResult={lastResult}
            streak={streak}
          />
          <RollHistory history={history} />
        </div>
      </div>
    </div>
  )
}

export default App
