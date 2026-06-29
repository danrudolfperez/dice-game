import { useEffect } from 'react'

export function useKeyboardShortcut(key: string, cb: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      if (e.code === key && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        cb()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, cb, enabled])
}
