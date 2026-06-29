import type { RollEntry } from '@/types/game'

interface RollHistoryProps {
  history: RollEntry[]
}

export function RollHistory({ history }: RollHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mt-2">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">
        History
      </h2>
      <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
        {history.map((entry) => (
          <li
            key={entry.id}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm border ${
              entry.outcome === 'win'
                ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-300'
                : 'bg-red-900/20 border-red-800/30 text-red-300'
            }`}
          >
            <span className="font-semibold w-10">{entry.outcome === 'win' ? 'WIN' : 'LOSS'}</span>
            <span className="text-gray-300 font-mono">
              {entry.rolled} / {entry.target}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
