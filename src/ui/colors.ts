// Beast CLI - Catppuccin Mocha Theme
// Based on research: cohesive pastel dark theme, accessible colors

// ANSI Reset
export const reset = '\x1b[0m'
export const bold = '\x1b[1m'
export const dim = '\x1b[2m'
export const italic = '\x1b[3m'

// ── Catppuccin Mocha Palette ──────────────────────────────────────────────────
export const mocha = {
  // Base colors
  crust:   '\x1b[48;2;17;17;27m',     // #11111b
  mantle:  '\x1b[48;2;24;24;37m',     // #181825
  base:    '\x1b[48;2;30;30;46m',     // #1e1e2e
  surface0:'\x1b[48;2;49;49;68m',     // #313244
  surface1:'\x1b[48;2;69;73;90m',     // #45475a
  surface2:'\x1b[48;2;88;91;112m',    // #585b70

  // Text
  text:    '\x1b[38;2;205;214;244m',   // #cdd6f4
  subtext0:'\x1b[38;2;166;173;200m',  // #a6adc8
  subtext1:'\x1b[38;2;186;190;204m',  // #bac2de
  overlay0:'\x1b[38;2;108;112;134m',  // #6c7086

  // Accent colors
  blue:    '\x1b[38;2;137;180;250m',  // #89b4fa
  sapphire:'\x1b[38;2;62;142;204m',    // #3e6fa0
  sky:     '\x1b[38;2;106;173;214m',   // #6aadd6
  teal:    '\x1b[38;2;148;226;213m',   // #94e2d5
  green:   '\x1b[38;2;166;227;161m',  // #a6e3a1
  yellow:  '\x1b[38;2;249;226;175m',  // #f9e2af
  peach:   '\x1b[38;2;250;179;135m',  // #fab387
  maroon:  '\x1b[38;2;209;133;122m',  // #d19990
  red:     '\x1b[38;2;243;139;168m',  // #f38ba8
  mauve:   '\x1b[38;2;203;166;247m',  // #cba6f7
  pink:    '\x1b[38;2;245;194;231m',  // #f5c2e7
  flamingo:'\x1b[38;2;242;205;205m',  // #f2cdcd
  lavender:'\x1b[38;2;180;190;254m',  // #b4befe
  white:   '\x1b[38;2;230;230;250m',  // #e6e9ef
}

// Semantic Colors (using Catppuccin)
export const fg = {
  // Text hierarchy
  primary:   mocha.text,               // #cdd6f4
  secondary: mocha.subtext1,           // #bac2de
  muted:     mocha.subtext0,           // #a6adc8
  overlay:   mocha.overlay0,           // #6c7086
  inverse:   '\x1b[7m',

  // Status colors (semantic meaning)
  success:   mocha.green,              // green - success, added, positive
  warning:   mocha.yellow,             // yellow - warning, caution, modified
  error:     mocha.red,                // red - error, failure, danger
  info:      mocha.blue,               // blue - info, links, interactive

  // Message roles
  user:      mocha.green,             // green - user input
  assistant: mocha.mauve,             // purple/mauve - AI response
  system:    mocha.sapphire,           // blue - system messages
  tool:      mocha.peach,              // peach - tool calls

  // Code & syntax
  code:      mocha.teal,              // cyan/teal - code blocks
  link:      mocha.sapphire,           // blue - links
  keyword:   mocha.mauve,              // purple - keywords
  function:  mocha.blue,               // blue - function names
  string:    mocha.green,              // green - strings
  number:    mocha.peach,              // peach - numbers

  // Branding
  accent:    mocha.mauve,              // mauve - primary accent (Catppuccin signature)
  accent2:   mocha.pink,               // pink - secondary accent
  accent3:   mocha.lavender,           // lavender - tertiary accent

  // Prompt
  prompt:    mocha.green,              // green - prompt symbol
}

// Shorthand helpers
export const c = fg

// Background colors
export const bg = {
  base:     mocha.base,
  surface:  mocha.surface0,
  elevated: mocha.surface1,
  overlay:  mocha.surface2,
  crust:    mocha.crust,
  mantle:   mocha.mantle,
}

// ── Box Drawing Characters ────────────────────────────────────────────────────
export const box = {
  // Light single-line (classic)
  single: {
    tl: '┌', tr: '┐', bl: '└', br: '┘',
    h: '─', v: '│',
  },
  // Rounded corners
  round: {
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    h: '─', v: '│',
  },
  // Heavy/bold
  heavy: {
    tl: '┏', tr: '┓', bl: '┗', br: '┛',
    h: '━', v: '┃',
  },
  // Dashed
  dashed: {
    tl: '┌', tr: '┐', bl: '└', br: '┘',
    h: '─', v: '│',
  },
  // Soft (rounder feel)
  soft: {
    tl: '╭', tr: '╮', bl: '╯', br: '╰',
    h: '─', v: '│',
  },
}

// ── Spinner Frames ────────────────────────────────────────────────────────────
export const spinnerFrames = {
  dots:    ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  dots2:   ['⣾', '⣽', '⣻', '⢿', '�', '鼿', '黽', '黾', '蹈', '蹦'],
  line:    ['-', '\\', '|', '/'],
  pipe:    ['┤', '┘', '┴', '└', '├', '┬', '┤'],
  arrow:   ['←', '↙', '↓', '↘', '→', '↗', '↑', '↖'],
  star:    ['✶', '✸', '✹', '✺', '✹', '✷'],
  hamburger:['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'],
}

// ── Icons (Terminal-safe Unicode) ────────────────────────────────────────────
export const icon = {
  // Prompt & interaction
  prompt: '❯',
  thinking: '⏳',
  loading: '⠋',

  // Status indicators
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  check: '●',

  // Actions
  tool: '⚙',
  search: '⌕',
  edit: '✎',
  trash: '✂',
  plus: '+',
  minus: '−',
  arrow: '→',

  // Objects
  folder: '▶',
  file: '▷',
  code: '⚡',
  link: '↗',
  rocket: '»',
  sparkles: '✧',
  beast: '◈',

  // File types
  ts: 'TS',
  js: 'JS',
  py: 'PY',
  md: 'MD',
  json: '{}',
  git: '⎇',

  // Status indicators (no emoji)
  online: '●',
  offline: '○',
  busy: '◐',

  // Data
  tokens: '⚡',
  messages: '≡',
  time: '⏱',
  context: '◈',
  clock: '⏰',

  // Decorative
  spark: '✦',
  diamond: '◆',
  bullet: '◆',
  line: '─',
  star: '★',
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
export const progress = {
  filled: '█',
  empty: '░',
  filledSmall: '▓',
  emptySmall: '▒',
}

// ── Color Checker (NO_COLOR support) ─────────────────────────────────────────
const NO_COLOR = process.env.NO_COLOR || process.env.NO_COLOUR

export function isColorEnabled(): boolean {
  if (NO_COLOR) return false
  if (process.env.FORCE_COLOR) return true
  if (process.stdout && !process.stdout.isTTY) return false
  return true
}

// Apply NO_COLOR to all color codes
function checkColor(code: string): string {
  return isColorEnabled() ? code : ''
}

export function s(text: string, ...styles: string[]): string {
  if (!isColorEnabled()) return text
  return styles.join('') + text + reset
}

// ── Keyboard Shortcuts Help ──────────────────────────────────────────────────
export const shortcuts = {
  navigation: [
    { key: '↑/↓', desc: 'History' },
    { key: 'Tab', desc: 'Complete' },
    { key: 'Ctrl+R', desc: 'Search' },
  ],
  actions: [
    { key: 'Enter', desc: 'Send' },
    { key: 'Ctrl+C', desc: 'Cancel' },
    { key: 'Ctrl+L', desc: 'Clear' },
  ],
  session: [
    { key: '/help', desc: 'Help' },
    { key: '/tools', desc: 'Tools' },
    { key: '/clear', desc: 'Reset' },
    { key: '/exit', desc: 'Quit' },
  ],
}

// Convenience wrappers (respects NO_COLOR)
export const styled_ = {
  bold: (t: string) => isColorEnabled() ? bold + t + reset : t,
  dim: (t: string) => isColorEnabled() ? dim + t + reset : t,
  muted: (t: string) => isColorEnabled() ? fg.muted + t + reset : t,
  primary: (t: string) => isColorEnabled() ? fg.primary + t + reset : t,
  success: (t: string) => isColorEnabled() ? fg.success + t + reset : t,
  error: (t: string) => isColorEnabled() ? fg.error + t + reset : t,
  warning: (t: string) => isColorEnabled() ? fg.warning + t + reset : t,
  tool: (t: string) => isColorEnabled() ? fg.tool + t + reset : t,
  assistant: (t: string) => isColorEnabled() ? fg.assistant + t + reset : t,
  user: (t: string) => isColorEnabled() ? fg.user + t + reset : t,
  code: (t: string) => isColorEnabled() ? fg.code + t + reset : t,
  accent: (t: string) => isColorEnabled() ? fg.accent + t + reset : t,
  cyan: (t: string) => isColorEnabled() ? fg.cyan + t + reset : t,
  purple: (t: string) => isColorEnabled() ? fg.purple + t + reset : t,
  prompt: (t: string) => isColorEnabled() ? fg.prompt + t + reset : t,
}
