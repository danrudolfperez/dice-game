import type { RollResult } from '@/types/game'
import { ROLL_MIN, ROLL_MAX } from '@/types/game'

interface ControlPanelProps {
  target: number
  onTargetChange: (value: number) => void
  onRoll: () => void
  isRolling: boolean
  isDisabled: boolean
  isMuted: boolean
  onMuteToggle: () => void
  lastResult: RollResult | null
  streak: number
}

export function ControlPanel({
  target,
  onTargetChange,
  onRoll,
  isRolling,
  isDisabled,
  isMuted,
  onMuteToggle,
  lastResult,
  streak,
}: ControlPanelProps) {
  const canRoll = !isRolling && !isDisabled

  return (
    <div className="flex flex-col mt-2 gap-6 p-6 rounded-2xl min-w-60 bg-green-950 border border-green-900 shadow-md">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-white font-medium flex items-center justify-between">
          Target number
          <span className="text-white font-mono font-bold text-base">{target}</span>
        </label>
        <input
          type="range"
          min={ROLL_MIN}
          max={ROLL_MAX}
          value={target}
          onChange={(e) => onTargetChange(Number(e.target.value))}
          disabled={isRolling}
          className="dice-slider"
        />
        <div className="flex justify-between text-sm text-gold">
          <span>{ROLL_MIN}</span>
          <span>{ROLL_MAX}</span>
        </div>
      </div>

      <button
        onClick={onRoll}
        disabled={!canRoll}
        className="relative py-3 px-6 font-bold text-lg tracking-wide transition-all duration-150
          hover:brightness-110 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          text-white"
        style={{
          backgroundImage: "url('/assets/dice-game-button.png')",
          backgroundSize: '100% 100%',
          minHeight: '52px',
        }}
      >
        {isRolling ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Rolling...
          </span>
        ) : (
          'Roll Dice'
        )}
      </button>

      {!isRolling && <p className="text-xs text-gold text-center -mt-5">or press Space</p>}

      {lastResult && <ResultDisplay result={lastResult} />}

      {streak !== 0 && <StreakDisplay streak={streak} />}

      <button
        onClick={onMuteToggle}
        className="mt-auto flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors"
      >
        <span className="text-lg">{isMuted ? '🔇' : '🔊'}</span>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  )
}

function ResultDisplay({ result }: { result: RollResult }) {
  const isWin = result.outcome === 'win'
  return (
    <div
      className={`rounded-lg p-4 border text-center transition-all ${
        isWin ? 'bg-emerald-900/30 border-emerald-700/50' : 'bg-red-900/30 border-red-700/50'
      }`}
    >
      <p className={`text-2xl font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
        {isWin ? 'WIN' : 'LOSS'}
      </p>
      <p className="text-gray-300 text-sm mt-1">
        Rolled <span className="font-mono font-bold text-white">{result.rolled}</span> / Target{' '}
        <span className="font-mono font-bold text-white">{result.target}</span>
      </p>
    </div>
  )
}

function StreakDisplay({ streak }: { streak: number }) {
  const isWinStreak = streak > 0
  const count = Math.abs(streak)
  return (
    <div
      className="text-center text-sm py-3 px-4 rounded-xl"
      // style={{
      //   backgroundImage: "url('/assets/dice-game-badge-bg.png')",
      //   backgroundSize: '100% 100%',
      // }}
    >
      {isWinStreak ? (
        <span className="text-emerald-400 font-semibold">{count} win streak 🔥</span>
      ) : (
        <span className="text-red-400 font-semibold">{count} loss streak</span>
      )}
    </div>
  )
}
