/**
 * Theme system — dark/light modes with auto-detect
 * Supports: dark, light modes + NO_COLOR / COLORFGBG / TERM_PROGRAM detection
 */

import type { ThemeMode } from './types.ts'

// ─── Color palettes ───────────────────────────────────────────────────────────

export interface ColorPalette {
  bg: string
  surface: string
  border: string
  text: string
  muted: string
  accent: string
  success: string
  warning: string
  error: string
  purple: string
  cyan: string
  pink: string
  user: string
}

export const colors = {
  dark: {
    bg: '#0a0a0f',
    surface: '#12121a',
    border: '#2a2a3a',
    text: '#e4e4e7',
    muted: '#71717a',
    accent: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    purple: '#a855f7',
    cyan: '#06b6d4',
    pink: '#ec4899',
    user: '#a78bfa',
  } as ColorPalette,

  light: {
    bg: '#ffffff',
    surface: '#f6f8fa',
    border: '#d0d7de',
    text: '#1f2328',
    muted: '#656d76',
    accent: '#0969da',
    success: '#1a7f37',
    warning: '#9a6700',
    error: '#cf222e',
    purple: '#8250df',
    cyan: '#0550ae',
    pink: '#bf3989',
    user: '#6639ba',
  } as ColorPalette,
}

// ─── Theme detection ─────────────────────────────────────────────────────────

export const theme = {
  /**
   * Auto-detect theme from environment variables:
   * - NO_COLOR → 'dark' (user prefers no colors)
   * - COLORFGBG → 'dark' if bg < 8, else 'light'
   * - TERM_PROGRAM contains 'Terminal'/'Light' → 'light'
   * - Otherwise → 'dark' (most devs use dark mode)
   */
  detectTheme(): ThemeMode {
    // NO_COLOR env var (no-color.org standard)
    if (process.env.NO_COLOR) return 'dark'

    // COLORFGBG: format "fg;bg" — some terminals set this
    // e.g., "15;0" = light text on dark bg, "0;15" = dark text on light bg
    const fgbg = process.env.COLORFGBG
    if (fgbg) {
      const parts = fgbg.split(';')
      const bg = parseInt(parts[1] ?? '0', 10)
      // Light background (white/gray) = light theme
      return bg >= 8 ? 'light' : 'dark'
    }

    // TERM_PROGRAM — check for known light-mode terminals
    const term = process.env.TERM_PROGRAM ?? ''
    if (term.includes('Terminal') || term.includes('Light') || term.includes('xterm')) {
      return 'light'
    }

    // Terminal app detection (macOS Terminal, iTerm)
    const termApp = process.env.TERM_PROGRAM_APP ?? ''
    if (termApp && termApp.includes('Terminal')) {
      return 'light'
    }

    // Default: dark
    return 'dark'
  },

  /**
   * Get the color palette for a theme mode
   */
  getPalette(mode: ThemeMode): ColorPalette {
    return colors[mode]
  },

  /**
   * CSS gradient for a mode (for gradients that need hex values)
   */
  gradient(mode: ThemeMode): string {
    const c = colors[mode]
    return `linear-gradient(135deg, ${c.bg} 0%, ${c.surface} 100%)`
  },
}

export default theme
