// Beast CLI - Centralized ANSI Color System
// Replaces magic color codes with semantic names

// ANSI Reset
export const reset = '\x1b[0m'
export const bold = '\x1b[1m'
export const dim = '\x1b[2m'
export const italic = '\x1b[3m'

// Semantic Colors
export const fg = {
  // Text hierarchy
  primary: '\x1b[38;2;228;228;231m',   // #e4e4e7
  secondary: '\x1b[38;2;113;113;122m', // #71717a
  muted: '\x1b[38;2;82;82;91m',         // #52525b
  inverse: '\x1b[7m',

  // Status colors
  success: '\x1b[38;2;34;197;94m',     // #22c55e
  warning: '\x1b[38;2;245;158;11m',     // #f59e0b
  error: '\x1b[38;2;239;68;68m',       // #ef4444
  info: '\x1b[38;2;59;130;246m',       // #3b82f6

  // Semantic
  user: '\x1b[38;2;34;197;94m',        // green - user input
  assistant: '\x1b[38;2;168;85;247m',  // purple - AI response
  tool: '\x1b[38;2;245;158;11m',       // amber - tool calls
  code: '\x1b[38;2;6;182;212m',        // cyan - code blocks
  link: '\x1b[38;2;59;130;246m',       // blue - links
  prompt: '\x1b[38;2;34;197;94m',      // green - prompt symbol

  // Branding
  accent: '\x1b[38;2;59;130;246m',     // blue - primary accent
  purple: '\x1b[38;2;168;85;247m',     // purple - secondary accent
  cyan: '\x1b[38;2;6;182;212m',        // cyan - tertiary accent
}

// Shorthand helpers
export const c = fg

// Background colors
export const bg = {
  surface: '\x1b[48;2;21;21;32m',      // #151520
  elevated: '\x1b[48;2;30;30;42m',     // #1e1e2e
  inverse: '\x1b[7m',
}

// Box drawing characters
export const box = {
  single: {
    tl: '┌', tr: '┐', bl: '└', br: '┘',
    h: '─', v: '│',
  },
  round: {
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    h: '─', v: '│',
  },
  heavy: {
    tl: '┏', tr: '┓', bl: '┗', br: '┛',
    h: '━', v: '┃',
  },
  dashed: {
    tl: '┌', tr: '┐', bl: '└', br: '┘',
    h: '─', v: '│',
  },
}

// Icons (terminal-safe Unicode)
export const icon = {
  prompt: '❯',
  thinking: '⏳',
  tool: '🔧',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '💡',
  rocket: '🚀',
  sparkles: '✨',
  dragon: '🐉',

  // File types
  folder: '📁',
  file: '📄',
  code: '💻',
  link: '🔗',

  // Status
  online: '●',
  offline: '○',
  loading: '⠋',

  // Data
  tokens: '⚡',
  messages: '💬',
  time: '⏱',
  context: '🧠',
}

// Inline styler: s("text", fg.accent, bold) — accepts multiple styles
export function s(text: string, ...styles: string[]): string {
  return styles.join('') + text + reset
}

// Convenience wrappers
export const styled_ = {
  bold: (t: string) => bold + t + reset,
  dim: (t: string) => dim + t + reset,
  muted: (t: string) => fg.muted + t + reset,
  primary: (t: string) => fg.primary + t + reset,
  success: (t: string) => fg.success + t + reset,
  error: (t: string) => fg.error + t + reset,
  warning: (t: string) => fg.warning + t + reset,
  tool: (t: string) => fg.tool + t + reset,
  assistant: (t: string) => fg.assistant + t + reset,
  user: (t: string) => fg.user + t + reset,
  code: (t: string) => fg.code + t + reset,
  accent: (t: string) => fg.accent + t + reset,
  cyan: (t: string) => fg.cyan + t + reset,
  purple: (t: string) => fg.purple + t + reset,
  prompt: (t: string) => fg.prompt + t + reset,
}
