/**
 * Hooks — auto-scroll, frozen detection, keyboard navigation
 * Based on Claude Code's hooks patterns and OpenCode's utilities
 */

import { useEffect, useRef, useState } from 'react'
import { useInput } from 'ink'

// ─── useFrozen ───────────────────────────────────────────────────────────────

/**
 * Freeze animations for off-screen components.
 * When isFrozen is true, streaming text/tickers stop updating.
 * This dramatically reduces CPU usage for long conversations.
 */
export function useFrozen(isFrozen: boolean): [boolean] {
  const [frozen, setFrozen] = useState(false)

  useEffect(() => {
    if (isFrozen) {
      setFrozen(true)
    } else {
      // Small delay before unfreezing (debounce rapid scrolling)
      const id = setTimeout(() => setFrozen(false), 100)
      return () => clearTimeout(id)
    }
  }, [isFrozen])

  return [frozen]
}

// ─── useKeyboardNav ────────────────────────────────────────────────────────

interface KeyboardNavOptions {
  onUp?: () => void
  onDown?: () => void
  onEnter?: () => void
  onEscape?: () => void
  onTab?: () => void
  enabled?: boolean
}

export function useKeyboardNav(options: KeyboardNavOptions): void {
  const {
    onUp,
    onDown,
    onEnter,
    onEscape,
    onTab,
    enabled = true
  } = options

  useInput((input, key) => {
    if (!enabled) return

    // Arrow keys + vim j/k
    if (key.upArrow || input === 'k') {
      onUp?.()
    }
    if (key.downArrow || input === 'j') {
      onDown?.()
    }

    // Enter
    if (key.return) {
      onEnter?.()
    }

    // Escape
    if (key.escape) {
      onEscape?.()
    }

    // Tab
    if (key.tab) {
      onTab?.()
    }
  })
}

// ─── useDebounce ────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}

// ─── useThrottle ────────────────────────────────────────────────────────────

export function useThrottle<T>(value: T, intervalMs: number): T {
  const [throttled, setThrottled] = useState(value)
  const lastUpdate = useRef(0)
  const pendingRef = useRef<T | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const now = Date.now()

    if (now - lastUpdate.current >= intervalMs) {
      setThrottled(value)
      lastUpdate.current = now
    } else {
      pendingRef.current = value
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          if (pendingRef.current !== null) {
            setThrottled(pendingRef.current)
            lastUpdate.current = Date.now()
            pendingRef.current = null
          }
          timerRef.current = null
        }, intervalMs - (now - lastUpdate.current))
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [value, intervalMs])

  return throttled
}

// ─── useIntersectionObserver (stub for Ink — no DOM) ──────────────────────

/**
 * Track whether an element is visible.
 * Stub for Ink since there's no DOM intersection observer.
 */
export function useIntersectionObserver(
  _ref: unknown,
  _options: Record<string, unknown> = {}
): boolean {
  return true
}

export default {
  useFrozen,
  useKeyboardNav,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
}
