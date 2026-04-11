// Beast CLI - Color System
// Default: Claude warm editorial theme (inspired by claude.ai)
// Available themes: catppuccin-mocha, catppuccin-frappe, catppuccin-latte,
// tokyonight, dracula, gruvbox, monokai, nord, one-dark, claude, gemini

// ANSI Reset
export const reset = '\x1b[0m'
export const bold = '\x1b[1m'
export const dim = '\x1b[2m'
export const italic = '\x1b[3m'
export const underline = '\x1b[4m'

// ── Claude Warm Editorial Palette (Default) ──────────────────────────────────
export const claudePalette = {
  // Backgrounds (warm, light)
  crust:    '\x1b[48;2;250;249;245m',  // ivory
  mantle:   '\x1b[48;2;245;244;237m',  // parchment
  base:     '\x1b[48;2;240;238;220m',   // sand
  surface0: '\x1b[48;2;232;230;220m',  // warm surface
  surface1: '\x1b[48;2;215;213;200m',  // lighter warm
  surface2: '\x1b[48;2;180;178;170m',  // warm gray

  // Text
  text:     '\x1b[38;2;20;20;19m',     // near-black
  subtext0: '\x1b[38;2;80;79;75m',     // dark gray
  subtext1: '\x1b[38;2;50;49;46m',     // darker gray
  overlay0: '\x1b[38;2;140;138;130m',   // muted gray

  // Accent colors (Google-inspired vivid accents)
  blue:     '\x1b[38;2;56;152;236m',    // focus blue
  sapphire: '\x1b[38;2;56;152;236m',    // blue
  sky:      '\x1b[38;2;100;170;210m',  // sky blue
  teal:     '\x1b[38;2;23;146;153m',    // teal
  green:    '\x1b[38;2;30;160;80m',     // success green
  yellow:   '\x1b[38;2;200;140;0m',     // warm yellow
  peach:    '\x1b[38;2;201;130;70m',   // warm orange
  maroon:   '\x1b[38;2;160;100;90m',   // warm maroon
  red:      '\x1b[38;2;200;60;60m',     // error red
  mauve:    '\x1b[38;2;180;80;200m',    // purple/mauve
  pink:     '\x1b[38;2;200;100;180m',  // pink
  flamingo: '\x1b[38;2;220;150;130m',  // warm pink
  lavender: '\x1b[38;2;139;92;246m',   // lavender purple
  white:    '\x1b[38;2;255;255;250m',  // warm white

  // Google brand (for accent use)
  gpPurple: '\x1b[38;2;142;54;255m',   // Google Purple
  gpBlue:   '\x1b[38;2;70;130;255m',  // Google Blue
  gpCyan:   '\x1b[38;2;0;200;200m',    // Google Cyan
  gpGreen:  '\x1b[38;2;0;200;100m',   // Google Green
  gpYellow: '\x1b[38;2;255;200;0m',   // Google Yellow
  gpRed:    '\x1b[38;2;255;100;100m', // Google Red
}

// ── Catppuccin Mocha Palette ──────────────────────────────────────────────────
export const mocha = {
  crust:    '\x1b[48;2;17;17;27m',
  mantle:   '\x1b[48;2;24;24;37m',
  base:     '\x1b[48;2;30;30;46m',
  surface0: '\x1b[48;2;49;49;68m',
  surface1: '\x1b[48;2;69;73;90m',
  surface2: '\x1b[88;91;112m',

  text:     '\x1b[38;2;205;214;244m',
  subtext0: '\x1b[38;2;166;173;200m',
  subtext1: '\x1b[38;2;186;190;204m',
  overlay0: '\x1b[38;2;108;112;134m',

  blue:     '\x1b[38;2;137;180;250m',
  sapphire: '\x1b[38;2;62;142;204m',
  sky:      '\x1b[38;2;106;173;214m',
  teal:     '\x1b[38;2;148;226;213m',
  green:    '\x1b[38;2;166;227;161m',
  yellow:   '\x1b[38;2;249;226;175m',
  peach:    '\x1b[38;2;250;179;135m',
  maroon:   '\x1b[38;2;209;133;122m',
  red:      '\x1b[38;2;243;139;168m',
  mauve:    '\x1b[38;2;203;166;247m',
  pink:     '\x1b[38;2;245;194;231m',
  flamingo: '\x1b[38;2;242;205;205m',
  lavender: '\x1b[38;2;180;190;254m',
  white:    '\x1b[38;2;230;230;250m',
}

// ── Semantic Colors (Default: Claude warm editorial) ──────────────────────────
export const fg = {
  // Text hierarchy
  primary:   claudePalette.text,
  secondary: claudePalette.subtext1,
  muted:     claudePalette.overlay0,
  overlay:   claudePalette.surface2,

  // Status
  success:   claudePalette.green,
  warning:   claudePalette.yellow,
  error:     claudePalette.red,
  info:      claudePalette.blue,

  // Message roles
  user:      claudePalette.green,
  assistant: claudePalette.mauve,
  system:    claudePalette.sapphire,
  tool:      claudePalette.peach,

  // Code & syntax
  code:      claudePalette.teal,
  link:      claudePalette.sapphire,
  keyword:   claudePalette.mauve,
  function:  claudePalette.blue,
  string:    claudePalette.green,
  number:    claudePalette.peach,

  // Branding accents
  accent:    claudePalette.gpPurple,
  accent2:   claudePalette.pink,
  accent3:   claudePalette.lavender,
  peach:     claudePalette.peach,
  mauve:     claudePalette.mauve,
  cyan:      claudePalette.teal,
  purple:    claudePalette.gpPurple,

  // Prompt
  prompt:    claudePalette.gpPurple,

  // Google-inspired (always available)
  gpPurple:  claudePalette.gpPurple,
  gpBlue:    claudePalette.gpBlue,
  gpCyan:    claudePalette.gpCyan,
  gpGreen:   claudePalette.gpGreen,
  gpYellow:  claudePalette.gpYellow,
  gpRed:     claudePalette.gpRed,
}

export const c = fg

// Background colors
export const bg = {
  base:     claudePalette.base,
  surface:  claudePalette.surface0,
  elevated: claudePalette.surface1,
  overlay:  claudePalette.surface2,
  crust:    claudePalette.crust,
  mantle:   claudePalette.mantle,
}

// ── Box Drawing Characters (Unicode with ASCII Fallback) ───────────────────
export const box = {
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  round:  { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  heavy:  { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  dashed: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  soft:   { tl: '╭', tr: '╮', bl: '╯', br: '╰', h: '─', v: '│' },
  light:  { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  // Polished: double-line with subtle accent for premium feel
  polished: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
}

// ASCII fallback box characters for terminals without Unicode support
export const boxAscii = {
  single: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  round:  { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  heavy:  { tl: '+', tr: '+', bl: '+', br: '+', h: '=', v: '|' },
  dashed: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  soft:   { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  light:  { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  polished: { tl: '+', tr: '+', bl: '+', br: '+', h: '=', v: '|' },
}

// ── Check Unicode Support ─────────────────────────────────────────────────────
export function supportsUnicode(): boolean {
  if (NO_COLOR) return false
  // Force color always means Unicode (unless NO_COLOR)
  if (process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === 'true') return true

  // Critical: Non-TTY (piped/redirected output) should use ASCII to avoid encoding issues
  if (!process.stdout?.isTTY) return false

  // At this point we're in a TTY, check actual terminal capabilities
  // Check actual terminal encoding on stdout
  const encoding = (process.stdout as any)?.encoding?.() || process.stdout?.encoding || ''
  if (encoding.toLowerCase() === 'utf8' || encoding.toLowerCase() === 'utf-8') return true

  // Check terminal program capabilities
  const termProgram = process.env.TERM_PROGRAM || ''
  if (termProgram.includes('iTerm') || termProgram.includes('Apple_Terminal') || termProgram.includes('vscode')) {
    return true
  }

  // Check TERM variable for known Unicode-capable terminals
  const term = process.env.TERM || ''
  if (term.includes('xterm') || term.includes('screen') || term.includes('tmux') || term.includes('256color')) {
    return true
  }

  // Check LANG/LC_ALL as fallback for TTY
  const lang = (process.env.LANG || process.env.LC_ALL || '').toLowerCase()
  if (lang.includes('utf-8') || lang.includes('utf8')) return true

  // Default to true for interactive terminals (most support UTF-8)
  return true
}

// Get appropriate box characters based on terminal capability
export function getBoxChars() {
  return supportsUnicode() ? box : boxAscii
}

// ── ASCII-safe icons (fallback when Unicode fails) ─────────────────────────────
export const iconAscii = {
  prompt:      '>',
  userPrefix:  '>',
  aiPrefix:    '*',

  // Status
  success:    '[OK]',
  error:      '[X]',
  warning:    '!',
  info:       'i',
  check:      '(*)',
  online:     '[*]',
  offline:    '[o]',

  // Actions
  tool:       '>',
  run:        '>',
  search:     '[S]',
  edit:       '[E]',
  plus:       '+',
  minus:      '-',
  arrow:      '->',
  arrowUp:    '^',
  arrowDown:  'v',
  bullet:     '*',
  separator:  '|',

  // Objects
  folder:     '>',
  file:       '>',
  code:       '[C]',
  link:       '~>',
  star:       '*',
  spark:      '*',
  sparkles:   '*',

  // Data
  tokens:     '[]',
  messages:   '==',
  time:       '()',
  context:    '[=]',
  clock:      '(T)',

  // File type
  ts:         'TS',
  js:         'JS',
  py:         'PY',
  md:         'MD',
  json:       '{}',
  git:        '[G]',
}

// ── Clean Spinner Frames ──────────────────────────────────────────────────────
export const spinnerFrames = {
  dots:    ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line:    ['-', '\\', '|', '/'],
  blocks:  ['▖', '▘', '▝', '▗'],
  arrow:   ['←', '↙', '↓', '↘', '→', '↗', '↑', '↖'],
  star:    ['⋆', '✦', '✧', '⋆', '✧', '✦'],
}

export const DEFAULT_SPINNER = spinnerFrames.dots

// ── Clean Icons (no emoji) ───────────────────────────────────────────────────
export const icon = {
  prompt:      '›',
  userPrefix:  '>',
  aiPrefix:    '◈',

  // Status
  success:    '✓',
  error:      '✗',
  warning:    '!',
  info:       'i',
  check:      '●',
  online:     '●',
  offline:    '○',

  // Actions
  tool:       '›',
  run:        '›',
  search:     '⌕',
  edit:       '✎',
  plus:       '+',
  minus:      '−',
  arrow:      '→',
  arrowUp:    '↑',
  arrowDown:  '↓',
  bullet:     '·',
  separator:  '│',

  // Objects
  folder:     '▶',
  file:       '▷',
  code:       '◈',
  link:       '↗',
  star:       '★',
  spark:      '✦',
  sparkles:   '⁎',

  // Data
  tokens:     '⚡',
  messages:   '≡',
  time:       '⏱',
  context:    '◈',
  clock:      '⏰',

  // File type
  ts:         'TS',
  js:         'JS',
  py:         'PY',
  md:         'MD',
  json:       '{}',
  git:        '⎇',

  // Spinner
  thinking:   '◐',
  loading:   '⠋',

  // Misc
  line:       '─',
  dash:       '–',
  dot:        '·',
  space:      ' ',
}

// Progress bar
export const progress = {
  filled:     '█',
  empty:      '░',
  filledSmall:'▓',
  emptySmall: '▒',
}

// ── Polish Utilities (inspired by polpo.sh's polished feel) ──────────────────

// Gradient-style multi-color helpers (for branding accents)
export function gradientText(text: string, style: 'purple-blue' | 'green-blue' | 'warm' = 'purple-blue'): string {
  if (!isColorEnabled()) return text
  switch (style) {
    case 'purple-blue':
      return text // Apply purple then blue via context
    case 'green-blue':
      return text
    case 'warm':
      return text
    default:
      return text
  }
}

// Subtle depth: lighter background for surface layering
export function surfaceLevel(level: 0 | 1 | 2 | 3): string {
  const depths = [claudePalette.surface0, claudePalette.surface1, claudePalette.surface2, claudePalette.surface1]
  return depths[level] || depths[0]
}

// Hover-like state indicator (for cursor feedback)
export function activeIndicator(isActive: boolean): string {
  if (!isColorEnabled()) return isActive ? '(active)' : ''
  return isActive ? s('●', fg.success) : s('○', fg.muted)
}

// Polished separator: consistent spacing + color
export function separator(width = 55, style: 'line' | 'dot' | 'space' = 'line'): string {
  const gpPurple = '\x1b[38;2;142;54;255m'
  switch (style) {
    case 'dot':
      return s('·'.repeat(width), fg.overlay)
    case 'space':
      return ' '.repeat(width)
    case 'line':
    default:
      return s('─'.repeat(width), fg.overlay)
  }
}

// Staggered element spacing (like polpo.sh's reveal rhythm)
export function staggerPad(index: number, basePad = 2): string {
  return ' '.repeat(basePad + index)
}

// Status dot with context-aware color
export function statusDot(status: 'online' | 'offline' | 'busy' | 'error' | 'warn'): string {
  const colors = { online: fg.success, offline: fg.muted, busy: fg.warning, error: fg.error, warn: fg.yellow }
  const labels = { online: 'online', offline: 'offline', busy: 'busy', error: 'error', warn: 'warn' }
  return s('●', colors[status]) + ' ' + s(labels[status], colors[status])
}

// ── NO_COLOR Support ─────────────────────────────────────────────────────────
const NO_COLOR = process.env.NO_COLOR || process.env.NO_COLOUR

export function isColorEnabled(): boolean {
  if (NO_COLOR) return false
  if (process.env.FORCE_COLOR) return true
  if (process.stdout && !process.stdout.isTTY) return false
  return true
}

// ── Styled Text Helpers ───────────────────────────────────────────────────────
export function s(text: string, ...styles: string[]): string {
  if (!isColorEnabled()) return text
  return styles.join('') + text + reset
}

export const styled_ = {
  bold:      (t: string) => s(t, bold),
  dim:       (t: string) => s(t, dim),
  muted:     (t: string) => s(t, fg.muted),
  primary:   (t: string) => s(t, fg.primary),
  secondary: (t: string) => s(t, fg.secondary),
  success:   (t: string) => s(t, fg.success),
  warning:   (t: string) => s(t, fg.warning),
  error:     (t: string) => s(t, fg.error),
  info:      (t: string) => s(t, fg.info),
  tool:      (t: string) => s(t, fg.tool),
  assistant: (t: string) => s(t, fg.assistant),
  user:      (t: string) => s(t, fg.user),
  system:    (t: string) => s(t, fg.system),
  code:      (t: string) => s(t, fg.code),
  accent:    (t: string) => s(t, fg.accent),
  mauve:     (t: string) => s(t, fg.mauve),
  peach:     (t: string) => s(t, fg.peach),
  cyan:      (t: string) => s(t, fg.cyan),
  purple:    (t: string) => s(t, fg.purple),
  prompt:    (t: string) => s(t, fg.prompt),
  green:     (t: string) => s(t, fg.green),
  blue:      (t: string) => s(t, fg.blue),
  yellow:    (t: string) => s(t, fg.yellow),
  red:       (t: string) => s(t, fg.red),
  link:      (t: string) => s(t, fg.link),
  keyword:   (t: string) => s(t, fg.keyword),
  function:  (t: string) => s(t, fg.function),
  string:    (t: string) => s(t, fg.string),
  number:    (t: string) => s(t, fg.number),
}

// ── Emoji Accents ─────────────────────────────────────────────────────────────
export const emoji = {
  beast:   '🐉', spark: '✨', tool:   '🔧', search: '🔍',
  code:   '⚡', link:   '🔗', star:   '⭐', tip:    '💡',
  rocket: '🚀', success:'✅', error:  '❌', warning:'⚠️',
  info:   'ℹ️', wave:   '👋', chat:   '💬', robot:  '🤖',
  zap:   '⚡', star2:  '🌟', fire:   '🔥', gear:   '⚙️',
  key:   '🔑', world:  '🌐', bulb:   '💡',
}

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────
export const shortcuts = {
  navigation: [
    { key: '↑ / ↓', desc: 'History' },
    { key: 'Tab',   desc: 'Complete' },
    { key: 'Ctrl+R', desc: 'Search' },
  ],
  actions: [
    { key: 'Enter',  desc: 'Send' },
    { key: 'Ctrl+C', desc: 'Cancel' },
    { key: 'Ctrl+L', desc: 'Clear' },
  ],
  session: [
    { key: '/help',  desc: 'Help' },
    { key: '/tools', desc: 'Tools' },
    { key: '/clear', desc: 'Reset' },
    { key: '/exit',  desc: 'Quit' },
  ],
}

// ── Theme System ─────────────────────────────────────────────────────────────
export type ThemeName =
  | 'catppuccin-mocha' | 'catppuccin-frappe' | 'catppuccin-latte'
  | 'tokyonight' | 'dracula' | 'gruvbox' | 'monokai' | 'nord' | 'one-dark'
  | 'claude' | 'gemini'

export interface Theme {
  name: string
  crust: string; mantle: string; base: string
  surface0: string; surface1: string; surface2: string
  text: string; subtext0: string; subtext1: string; overlay0: string
  blue: string; sapphire: string; sky: string; teal: string
  green: string; yellow: string; peach: string; maroon: string
  red: string; mauve: string; pink: string; flamingo: string
  lavender: string; white: string
}

export const themes: Record<ThemeName, Theme> = {
  'catppuccin-mocha': {
    name: 'Catppuccin Mocha',
    crust: '\x1b[48;2;17;17;27m', mantle: '\x1b[48;2;24;24;37m', base: '\x1b[48;2;30;30;46m',
    surface0: '\x1b[48;2;49;49;68m', surface1: '\x1b[48;2;69;73;90m', surface2: '\x1b[48;2;88;91;112m',
    text: '\x1b[38;2;205;214;244m', subtext0: '\x1b[38;2;166;173;200m', subtext1: '\x1b[38;2;186;190;204m', overlay0: '\x1b[38;2;108;112;134m',
    blue: '\x1b[38;2;137;180;250m', sapphire: '\x1b[38;2;62;142;204m', sky: '\x1b[38;2;106;173;214m', teal: '\x1b[38;2;148;226;213m',
    green: '\x1b[38;2;166;227;161m', yellow: '\x1b[38;2;249;226;175m', peach: '\x1b[38;2;250;179;135m', maroon: '\x1b[38;2;209;133;122m',
    red: '\x1b[38;2;243;139;168m', mauve: '\x1b[38;2;203;166;247m', pink: '\x1b[38;2;245;194;231m', flamingo: '\x1b[38;2;242;205;205m', lavender: '\x1b[38;2;180;190;254m', white: '\x1b[38;2;230;230;250m',
  },
  'catppuccin-frappe': {
    name: 'Catppuccin Frappe',
    crust: '\x1b[48;2;38;42;54m', mantle: '\x1b[48;2;48;52;65m', base: '\x1b[48;2;54;58;73m',
    surface0: '\x1b[48;2;69;73;88m', surface1: '\x1b[48;2;86;91;108m', surface2: '\x1b[48;2;98;103;122m',
    text: '\x1b[38;2;205;214;244m', subtext0: '\x1b[38;2;166;173;200m', subtext1: '\x1b[38;2;186;190;204m', overlay0: '\x1b[38;2;108;112;134m',
    blue: '\x1b[38;2;137;180;250m', sapphire: '\x1b[38;2;62;142;204m', sky: '\x1b[38;2;118;180;214m', teal: '\x1b[38;2;129;200;190m',
    green: '\x1b[38;2;166;227;161m', yellow: '\x1b[38;2;239;227;175m', peach: '\x1b[38;2;239;159;135m', maroon: '\x1b[38;2;238;133;122m',
    red: '\x1b[38;2;231;130;132m', mauve: '\x1b[38;2;202;158;230m', pink: '\x1b[38;2;245;194;231m', flamingo: '\x1b[38;2;238;180;180m', lavender: '\x1b[38;2;180;190;254m', white: '\x1b[38;2;230;230;250m',
  },
  'catppuccin-latte': {
    name: 'Catppuccin Latte',
    crust: '\x1b[48;2;230;225;220m', mantle: '\x1b[48;2;239;235;230m', base: '\x1b[48;2;244;240;235m',
    surface0: '\x1b[48;2;205;200;195m', surface1: '\x1b[48;2;187;182;177m', surface2: '\x1b[48;2;168;163;158m',
    text: '\x1b[38;2;64;64;76m', subtext0: '\x1b[38;2;102;98;113m', subtext1: '\x1b[38;2;114;110;126m', overlay0: '\x1b[38;2;140;136;152m',
    blue: '\x1b[38;2;30;102;204m', sapphire: '\x1b[38;2;40;100;160m', sky: '\x1b[38;2;50;130;175m', teal: '\x1b[38;2;23;146;153m',
    green: '\x1b[38;2;64;160;73m', yellow: '\x1b[38;2;250;189;47m', peach: '\x1b[38;2;254;144;76m', maroon: '\x1b[38;2;210;100;100m',
    red: '\x1b[38;2;210;84;96m', mauve: '\x1b[38;2;136;57;186m', pink: '\x1b[38;2;214;84;157m', flamingo: '\x1b[38;2;200;100;100m', lavender: '\x1b[38;2;100;100;220m', white: '\x1b[38;2;255;255;255m',
  },
  nord: {
    name: 'Nord',
    crust: '\x1b[48;2;46;52;64m', mantle: '\x1b[48;2;32;38;50m', base: '\x1b[48;2;36;40;52m',
    surface0: '\x1b[48;2;67;76;93m', surface1: '\x1b[48;2;85;93;112m', surface2: '\x1b[48;2;102;110;128m',
    text: '\x1b[38;2;216;222;233m', subtext0: '\x1b[38;2;191;197;208m', subtext1: '\x1b[38;2;166;173;200m', overlay0: '\x1b[38;2;136;146;157m',
    blue: '\x1b[38;2;129;161;193m', sapphire: '\x1b[38;2;97;125;168m', sky: '\x1b[38;2;114;159;207m', teal: '\x1b[38;2;136;192;208m',
    green: '\x1b[38;2;163;190;140m', yellow: '\x1b[38;2;235;203;139m', peach: '\x1b[38;2;229;174;116m', maroon: '\x1b[38;2;180;142;127m',
    red: '\x1b[38;2;191;97;106m', mauve: '\x1b[38;2;180;142;200m', pink: '\x1b[38;2;217;135;180m', flamingo: '\x1b[38;2;210;142;142m', lavender: '\x1b[38;2;180;190;254m', white: '\x1b[38;2;236;239;244m',
  },
  dracula: {
    name: 'Dracula',
    crust: '\x1b[48;2;40;42;68m', mantle: '\x1b[48;2;33;33;54m', base: '\x1b[48;2;45;45;68m',
    surface0: '\x1b[48;2;68;68;86m', surface1: '\x1b[48;2;85;85;102m', surface2: '\x1b[48;2;98;98;120m',
    text: '\x1b[38;2;248;248;242m', subtext0: '\x1b[38;2;187;187;197m', subtext1: '\x1b[38;2;166;166;178m', overlay0: '\x1b[38;2;117;113;128m',
    blue: '\x1b[38;2;98;120;184m', sapphire: '\x1b[38;2;72;96;140m', sky: '\x1b[38;2;92;172;224m', teal: '\x1b[38;2;50;208;208m',
    green: '\x1b[38;2;80;250;123m', yellow: '\x1b[38;2;241;250;140m', peach: '\x1b[38;2;255;184;135m', maroon: '\x1b[38;2;180;120;120m',
    red: '\x1b[38;2;255;85;85m', mauve: '\x1b[38;2;189;147;249m', pink: '\x1b[38;2;255;121;198m', flamingo: '\x1b[38;2;240;128;128m', lavender: '\x1b[38;2;180;190;254m', white: '\x1b[38;2;255;255;255m',
  },
  gruvbox: {
    name: 'Gruvbox Dark',
    crust: '\x1b[48;2;40;40;40m', mantle: '\x1b[48;2;35;35;30m', base: '\x1b[48;2;40;40;35m',
    surface0: '\x1b[48;2;60;56;54m', surface1: '\x1b[48;2;73;69;66m', surface2: '\x1b[48;2;83;81;77m',
    text: '\x1b[38;2;235;219;178m', subtext0: '\x1b[38;2;189;174;154m', subtext1: '\x1b[38;2;168;153;132m', overlay0: '\x1b[38;2;146;131;116m',
    blue: '\x1b[38;2;104;157;184m', sapphire: '\x1b[38;2;80;120;140m', sky: '\x1b[38;2;115;178;200m', teal: '\x1b[38;2;125;170;140m',
    green: '\x1b[38;2;184;187;98m', yellow: '\x1b[38;2;250;189;47m', peach: '\x1b[38;2;254;151;32m', maroon: '\x1b[38;2;204;120;101m',
    red: '\x1b[38;2;251;73;52m', mauve: '\x1b[38;2;177;98;135m', pink: '\x1b[38;2;214;93;112m', flamingo: '\x1b[38;2;235;138;108m', lavender: '\x1b[38;2;180;150;200m', white: '\x1b[38;2;251;251;248m',
  },
  monokai: {
    name: 'Monokai',
    crust: '\x1b[38;2;39;40;34m', mantle: '\x1b[48;2;35;36;30m', base: '\x1b[48;2;40;40;34m',
    surface0: '\x1b[48;2;72;72;64m', surface1: '\x1b[48;2;85;85;77m', surface2: '\x1b[48;2;102;102;94m',
    text: '\x1b[38;2;248;248;240m', subtext0: '\x1b[38;2;190;190;180m', subtext1: '\x1b[38;2;170;170;160m', overlay0: '\x1b[38;2;153;153;144m',
    blue: '\x1b[38;2;102;217;239m', sapphire: '\x1b[38;2;80;160;200m', sky: '\x1b[38;2;100;180;220m', teal: '\x1b[38;2;166;226;46m',
    green: '\x1b[38;2;166;226;46m', yellow: '\x1b[38;2;250;227;79m', peach: '\x1b[38;2;250;179;66m', maroon: '\x1b[38;2;200;120;100m',
    red: '\x1b[38;2;249;38;114m', mauve: '\x1b[38;2;197;134;192m', pink: '\x1b[38;2;243;139;168m', flamingo: '\x1b[38;2;220;120;120m', lavender: '\x1b[38;2;180;170;220m', white: '\x1b[38;2;249;249;249m',
  },
  'one-dark': {
    name: 'One Dark',
    crust: '\x1b[48;2;40;44;52m', mantle: '\x1b[48;2;32;35;45m', base: '\x1b[48;2;40;44;52m',
    surface0: '\x1b[48;2;57;60;72m', surface1: '\x1b[48;2;73;77;90m', surface2: '\x1b[48;2;88;92;108m',
    text: '\x1b[38;2;220;223;228m', subtext0: '\x1b[38;2;185;188;197m', subtext1: '\x1b[38;2;170;174;185m', overlay0: '\x1b[38;2;128;132;148m',
    blue: '\x1b[38;2;97;159;226m', sapphire: '\x1b[38;2;70;110;160m', sky: '\x1b[38;2;100;160;210m', teal: '\x1b[38;2;64;192;176m',
    green: '\x1b[38;2;152;209;113m', yellow: '\x1b[38;2;231;200;112m', peach: '\x1b[38;2;250;170;100m', maroon: '\x1b[38;2;200;130;110m',
    red: '\x1b[38;2;224;108;117m', mauve: '\x1b[38;2;198;120;221m', pink: '\x1b[38;2;248;108;180m', flamingo: '\x1b[38;2;220;130;130m', lavender: '\x1b[38;2;180;160;240m', white: '\x1b[38;2;255;255;255m',
  },
  tokyonight: {
    name: 'Tokyo Night',
    crust: '\x1b[48;2;24;27;38m', mantle: '\x1b[48;2;20;23;35m', base: '\x1b[48;2;30;35;55m',
    surface0: '\x1b[48;2;48;52;75m', surface1: '\x1b[48;2;65;69;95m', surface2: '\x1b[48;2;82;88;115m',
    text: '\x1b[38;2;192;202;237m', subtext0: '\x1b[38;2;165;173;200m', subtext1: '\x1b[38;2;180;188;210m', overlay0: '\x1b[38;2;110;118;148m',
    blue: '\x1b[38;2;122;162;247m', sapphire: '\x1b[38;2;80;130;190m', sky: '\x1b[38;2;100;170;210m', teal: '\x1b[38;2;148;226;213m',
    green: '\x1b[38;2;166;227;161m', yellow: '\x1b[38;2;238;212;160m', peach: '\x1b[38;2;250;180;130m', maroon: '\x1b[38;2;210;150;140m',
    red: '\x1b[38;2;245;134;145m', mauve: '\x1b[38;2;197;158;237m', pink: '\x1b[38;2;242;165;220m', flamingo: '\x1b[38;2;235;165;165m', lavender: '\x1b[38;2;180;190;254m', white: '\x1b[38;2;255;255;255m',
  },
  claude: {
    name: 'Claude',
    crust: '\x1b[48;2;250;249;245m', mantle: '\x1b[48;2;245;244;237m', base: '\x1b[48;2;240;238;220m',
    surface0: '\x1b[48;2;232;230;220m', surface1: '\x1b[48;2;215;213;200m', surface2: '\x1b[48;2;180;178;170m',
    text: '\x1b[38;2;20;20;19m', subtext0: '\x1b[38;2;80;79;75m', subtext1: '\x1b[38;2;50;49;46m', overlay0: '\x1b[38;2;140;138;130m',
    blue: '\x1b[38;2;56;152;236m', sapphire: '\x1b[38;2;56;152;236m', sky: '\x1b[38;2;100;170;210m', teal: '\x1b[38;2;23;146;153m',
    green: '\x1b[38;2;30;160;80m', yellow: '\x1b[38;2;200;140;0m', peach: '\x1b[38;2;201;130;70m', maroon: '\x1b[38;2;160;100;90m',
    red: '\x1b[38;2;200;60;60m', mauve: '\x1b[38;2;180;80;200m', pink: '\x1b[38;2;200;100;180m', flamingo: '\x1b[38;2;220;150;130m', lavender: '\x1b[38;2;139;92;246m', white: '\x1b[38;2;255;255;250m',
  },
  gemini: {
    name: 'Gemini',
    crust: '\x1b[48;2;10;10;20m', mantle: '\x1b[48;2;15;15;30m', base: '\x1b[48;2;20;20;40m',
    surface0: '\x1b[48;2;35;35;60m', surface1: '\x1b[48;2;50;50;80m', surface2: '\x1b[48;2;70;70;100m',
    text: '\x1b[38;2;220;220;255m', subtext0: '\x1b[38;2;170;170;210m', subtext1: '\x1b[38;2;190;190;230m', overlay0: '\x1b[38;2;120;120;160m',
    blue: '\x1b[38;2;70;130;255m', sapphire: '\x1b[38;2;60;110;220m', sky: '\x1b[38;2;0;200;200m', teal: '\x1b[38;2;0;210;180m',
    green: '\x1b[38;2;0;200;100m', yellow: '\x1b[38;2;255;200;0m', peach: '\x1b[38;2;255;150;50m', maroon: '\x1b[38;2;200;80;80m',
    red: '\x1b[38;2;255;100;100m', mauve: '\x1b[38;2;142;54;255m', pink: '\x1b[38;2;200;100;255m', flamingo: '\x1b[38;2;220;150;180m', lavender: '\x1b[38;2;150;100;255m', white: '\x1b[38;2;255;255;255m',
  },
}

let currentTheme: ThemeName = 'claude'

export function getTheme(): Theme { return themes[currentTheme] }

export function setTheme(name: ThemeName): void {
  if (themes[name]) currentTheme = name
}

export function getThemeByName(name: string): Theme | null {
  const key = name.toLowerCase().replace(/[_\s]+/g, '-') as ThemeName
  return themes[key] || null
}

export function listThemes(): Array<{ name: ThemeName; label: string }> {
  return Object.entries(themes).map(([key, theme]) => ({ name: key as ThemeName, label: theme.name }))
}

export function getCurrentThemeName(): ThemeName { return currentTheme }
