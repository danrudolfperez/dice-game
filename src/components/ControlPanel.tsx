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
    <div className="flex flex-col gap-6 p-6 bg-[#16213e] rounded-xl border border-violet-900/40 min-w-[240px]">
      <h1 className="text-xl font-bold text-violet-300 tracking-wide">Dice Game</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 font-medium flex items-center justify-between">
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
          className="w-full cursor-pointer accent-violet-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>{ROLL_MIN}</span>
          <span>{ROLL_MAX}</span>
        </div>
      </div>

      <button
        onClick={onRoll}
        disabled={!canRoll}
        className="relative py-3 px-6 rounded-xl font-bold text-lg tracking-wide transition-all duration-150
          bg-violet-600 hover:bg-violet-500 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          text-white shadow-lg shadow-violet-900/40"
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

      {!isRolling && <p className="text-xs text-gray-500 text-center -mt-3">or press Space</p>}

      {lastResult && <ResultDisplay result={lastResult} />}

      {streak !== 0 && <StreakDisplay streak={streak} />}

      <button
        onClick={onMuteToggle}
        className="mt-auto flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
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
    <div className="text-center text-sm text-gray-400">
      {isWinStreak ? (
        <span className="text-emerald-400 font-semibold">{count} win streak 🔥</span>
      ) : (
        <span className="text-red-400 font-semibold">{count} loss streak</span>
      )}
    </div>
  )
}
