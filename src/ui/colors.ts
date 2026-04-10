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

// ── Theme System ──────────────────────────────────────────────────────────────
// Inspired by opencode's multi-theme support

export type ThemeName =
  | 'catppuccin-mocha' | 'catppuccin-frappe' | 'catppuccin-latte'
  | 'tokyonight' | 'dracula' | 'gruvbox' | 'monokai' | 'nord' | 'one-dark'
  | 'claude'

export interface Theme {
  name: string
  // Base colors
  crust: string
  mantle: string
  base: string
  surface0: string
  surface1: string
  surface2: string
  // Text
  text: string
  subtext0: string
  subtext1: string
  overlay0: string
  // Accents
  blue: string
  sapphire: string
  sky: string
  teal: string
  green: string
  yellow: string
  peach: string
  maroon: string
  red: string
  mauve: string
  pink: string
  flamingo: string
  lavender: string
  white: string
}

// All available themes
export const themes: Record<ThemeName, Theme> = {
  // Catppuccin Mocha (current default)
  'catppuccin-mocha': {
    name: 'Catppuccin Mocha',
    crust: '\x1b[48;2;17;17;27m',
    mantle: '\x1b[48;2;24;24;37m',
    base: '\x1b[48;2;30;30;46m',
    surface0: '\x1b[48;2;49;49;68m',
    surface1: '\x1b[48;2;69;73;90m',
    surface2: '\x1b[48;2;88;91;112m',
    text: '\x1b[38;2;205;214;244m',
    subtext0: '\x1b[38;2;166;173;200m',
    subtext1: '\x1b[38;2;186;190;204m',
    overlay0: '\x1b[38;2;108;112;134m',
    blue: '\x1b[38;2;137;180;250m',
    sapphire: '\x1b[38;2;62;142;204m',
    sky: '\x1b[38;2;106;173;214m',
    teal: '\x1b[38;2;148;226;213m',
    green: '\x1b[38;2;166;227;161m',
    yellow: '\x1b[38;2;249;226;175m',
    peach: '\x1b[38;2;250;179;135m',
    maroon: '\x1b[38;2;209;133;122m',
    red: '\x1b[38;2;243;139;168m',
    mauve: '\x1b[38;2;203;166;247m',
    pink: '\x1b[38;2;245;194;231m',
    flamingo: '\x1b[38;2;242;205;205m',
    lavender: '\x1b[38;2;180;190;254m',
    white: '\x1b[38;2;230;230;250m',
  },

  // Catppuccin Frappé
  'catppuccin-frappe': {
    name: 'Catppuccin Frappé',
    crust: '\x1b[48;2;38;42;54m',
    mantle: '\x1b[48;2;48;52;65m',
    base: '\x1b[48;2;54;58;73m',
    surface0: '\x1b[48;2;69;73;88m',
    surface1: '\x1b[48;2;86;91;108m',
    surface2: '\x1b[48;2;98;103;122m',
    text: '\x1b[38;2;205;214;244m',
    subtext0: '\x1b[38;2;166;173;200m',
    subtext1: '\x1b[38;2;186;190;204m',
    overlay0: '\x1b[38;2;108;112;134m',
    blue: '\x1b[38;2;137;180;250m',
    sapphire: '\x1b[38;2;62;142;204m',
    sky: '\x1b[38;2;118;180;214m',
    teal: '\x1b[38;2;129;200;190m',
    green: '\x1b[38;2;166;227;161m',
    yellow: '\x1b[38;2;239;227;175m',
    peach: '\x1b[38;2;239;159;135m',
    maroon: '\x1b[38;2;238;133;122m',
    red: '\x1b[38;2;231;130;132m',
    mauve: '\x1b[38;2;202;158;230m',
    pink: '\x1b[38;2;245;194;231m',
    flamingo: '\x1b[38;2;238;180;180m',
    lavender: '\x1b[38;2;180;190;254m',
    white: '\x1b[38;2;230;230;250m',
  },

  // Nord
  nord: {
    name: 'Nord',
    crust: '\x1b[48;2;46;52;64m',
    mantle: '\x1b[48;2;32;38;50m',
    base: '\x1b[48;2;36;40;52m',
    surface0: '\x1b[48;2;67;76;93m',
    surface1: '\x1b[48;2;85;93;112m',
    surface2: '\x1b[48;2;102;110;128m',
    text: '\x1b[38;2;216;222;233m',
    subtext0: '\x1b[38;2;191;197;208m',
    subtext1: '\x1b[38;2;166;173;200m',
    overlay0: '\x1b[38;2;136;146;157m',
    blue: '\x1b[38;2;129;161;193m',
    sapphire: '\x1b[38;2;97;125;168m',
    sky: '\x1b[38;2;114;159;207m',
    teal: '\x1b[38;2;136;192;208m',
    green: '\x1b[38;2;163;190;140m',
    yellow: '\x1b[38;2;235;203;139m',
    peach: '\x1b[38;2;229;174;116m',
    maroon: '\x1b[38;2;180;142;127m',
    red: '\x1b[38;2;191;97;106m',
    mauve: '\x1b[38;2;180;142;200m',
    pink: '\x1b[38;2;217;135;180m',
    flamingo: '\x1b[38;2;210;142;142m',
    lavender: '\x1b[38;2;180;190;254m',
    white: '\x1b[38;2;236;239;244m',
  },

  // Dracula
  dracula: {
    name: 'Dracula',
    crust: '\x1b[48;2;40;42;68m',
    mantle: '\x1b[48;2;33;33;54m',
    base: '\x1b[48;2;45;45;68m',
    surface0: '\x1b[48;2;68;68;86m',
    surface1: '\x1b[48;2;85;85;102m',
    surface2: '\x1b[48;2;98;98;120m',
    text: '\x1b[38;2;248;248;242m',
    subtext0: '\x1b[38;2;187;187;197m',
    subtext1: '\x1b[38;2;166;166;178m',
    overlay0: '\x1b[38;2;117;113;128m',
    blue: '\x1b[38;2;98;120;184m',
    sapphire: '\x1b[38;2;72;96;140m',
    sky: '\x1b[38;2;92;172;224m',
    teal: '\x1b[38;2;50;208;208m',
    green: '\x1b[38;2;80;250;123m',
    yellow: '\x1b[38;2;241;250;140m',
    peach: '\x1b[38;2;255;184;135m',
    maroon: '\x1b[38;2;180;120;120m',
    red: '\x1b[38;2;255;85;85m',
    mauve: '\x1b[38;2;189;147;249m',
    pink: '\x1b[38;2;255;121;198m',
    flamingo: '\x1b[38;2;240;128;128m',
    lavender: '\x1b[38;2;180;190;254m',
    white: '\x1b[38;2;255;255;255m',
  },

  // Gruvbox Dark
  gruvbox: {
    name: 'Gruvbox Dark',
    crust: '\x1b[48;2;40;40;40m',
    mantle: '\x1b[48;2;35;35;30m',
    base: '\x1b[48;2;40;40;35m',
    surface0: '\x1b[48;2;60;56;54m',
    surface1: '\x1b[48;2;73;69;66m',
    surface2: '\x1b[48;2;83;81;77m',
    text: '\x1b[38;2;235;219;178m',
    subtext0: '\x1b[38;2;189;174;154m',
    subtext1: '\x1b[38;2;168;153;132m',
    overlay0: '\x1b[38;2;146;131;116m',
    blue: '\x1b[38;2;104;157;184m',
    sapphire: '\x1b[38;2;80;120;140m',
    sky: '\x1b[38;2;115;178;200m',
    teal: '\x1b[38;2;125;170;140m',
    green: '\x1b[38;2;184;187;98m',
    yellow: '\x1b[38;2;250;189;47m',
    peach: '\x1b[38;2;254;151;32m',
    maroon: '\x1b[38;2;204;120;101m',
    red: '\x1b[38;2;251;73;52m',
    mauve: '\x1b[38;2;177;98;135m',
    pink: '\x1b[38;2;214;93;112m',
    flamingo: '\x1b[38;2;235;138;108m',
    lavender: '\x1b[38;2;180;150;200m',
    white: '\x1b[38;2;251;251;248m',
  },

  // Monokai
  monokai: {
    name: 'Monokai',
    crust: '\x1b[48;2;39;40;34m',
    mantle: '\x1b[48;2;35;36;30m',
    base: '\x1b[48;2;40;40;34m',
    surface0: '\x1b[48;2;72;72;64m',
    surface1: '\x1b[48;2;85;85;77m',
    surface2: '\x1b[48;2;102;102;94m',
    text: '\x1b[38;2;248;248;240m',
    subtext0: '\x1b[38;2;190;190;180m',
    subtext1: '\x1b[38;2;170;170;160m',
    overlay0: '\x1b[38;2;153;153;144m',
    blue: '\x1b[38;2;102;217;239m',
    sapphire: '\x1b[38;2;80;160;200m',
    sky: '\x1b[38;2;100;180;220m',
    teal: '\x1b[38;2;166;226;46m',
    green: '\x1b[38;2;166;226;46m',
    yellow: '\x1b[38;2;250;227;79m',
    peach: '\x1b[38;2;250;179;66m',
    maroon: '\x1b[38;2;200;120;100m',
    red: '\x1b[38;2;249;38;114m',
    mauve: '\x1b[38;2;197;134;192m',
    pink: '\x1b[38;2;243;139;168m',
    flamingo: '\x1b[38;2;220;120;120m',
    lavender: '\x1b[38;2;180;170;220m',
    white: '\x1b[38;2;249;249;249m',
  },

  // One Dark
  'one-dark': {
    name: 'One Dark',
    crust: '\x1b[48;2;40;44;52m',
    mantle: '\x1b[48;2;32;35;45m',
    base: '\x1b[48;2;40;44;52m',
    surface0: '\x1b[48;2;57;60;72m',
    surface1: '\x1b[48;2;73;77;90m',
    surface2: '\x1b[48;2;88;92;108m',
    text: '\x1b[38;2;220;223;228m',
    subtext0: '\x1b[38;2;185;188;197m',
    subtext1: '\x1b[38;2;170;174;185m',
    overlay0: '\x1b[38;2;128;132;148m',
    blue: '\x1b[38;2;97;159;226m',
    sapphire: '\x1b[38;2;70;110;160m',
    sky: '\x1b[38;2;100;160;210m',
    teal: '\x1b[38;2;64;192;176m',
    green: '\x1b[38;2;152;209;113m',
    yellow: '\x1b[38;2;231;200;112m',
    peach: '\x1b[38;2;250;170;100m',
    maroon: '\x1b[38;2;200;130;110m',
    red: '\x1b[38;2;224;108;117m',
    mauve: '\x1b[38;2;198;120;221m',
    pink: '\x1b[38;2;248;108;180m',
    flamingo: '\x1b[38;2;220;130;130m',
    lavender: '\x1b[38;2;180;160;240m',
    white: '\x1b[38;2;255;255;255m',
  },

  // Tokyo Night
  tokyonight: {
    name: 'Tokyo Night',
    crust: '\x1b[48;2;24;27;38m',
    mantle: '\x1b[48;2;20;23;35m',
    base: '\x1b[48;2;30;35;55m',
    surface0: '\x1b[48;2;48;52;75m',
    surface1: '\x1b[48;2;65;69;95m',
    surface2: '\x1b[48;2;82;88;115m',
    text: '\x1b[38;2;192;202;237m',
    subtext0: '\x1b[38;2;165;173;200m',
    subtext1: '\x1b[38;2;180;188;210m',
    overlay0: '\x1b[38;2;110;118;148m',
    blue: '\x1b[38;2;122;162;247m',
    sapphire: '\x1b[38;2;80;130;190m',
    sky: '\x1b[38;2;100;170;210m',
    teal: '\x1b[38;2;148;226;213m',
    green: '\x1b[38;2;166;227;161m',
    yellow: '\x1b[38;2;238;212;160m',
    peach: '\x1b[38;2;250;180;130m',
    maroon: '\x1b[38;2;210;150;140m',
    red: '\x1b[38;2;245;134;145m',
    mauve: '\x1b[38;2;197;158;237m',
    pink: '\x1b[38;2;242;165;220m',
    flamingo: '\x1b[38;2;235;165;165m',
    lavender: '\x1b[38;2;180;190;254m',
    white: '\x1b[38;2;255;255;255m',
  },

  // Catppuccin Latte (light)
  'catppuccin-latte': {
    name: 'Catppuccin Latte',
    crust: '\x1b[48;2;230;225;220m',
    mantle: '\x1b[48;2;239;235;230m',
    base: '\x1b[48;2;244;240;235m',
    surface0: '\x1b[48;2;205;200;195m',
    surface1: '\x1b[48;2;187;182;177m',
    surface2: '\x1b[48;2;168;163;158m',
    text: '\x1b[38;2;64;64;76m',
    subtext0: '\x1b[38;2;102;98;113m',
    subtext1: '\x1b[38;2;114;110;126m',
    overlay0: '\x1b[38;2;140;136;152m',
    blue: '\x1b[38;2;30;102;204m',
    sapphire: '\x1b[38;2;40;100;160m',
    sky: '\x1b[38;2;50;130;175m',
    teal: '\x1b[38;2;23;146;153m',
    green: '\x1b[38;2;64;160;73m',
    yellow: '\x1b[38;2;250;189;47m',
    peach: '\x1b[38;2;254;144;76m',
    maroon: '\x1b[38;2;210;100;100m',
    red: '\x1b[38;2;210;84;96m',
    mauve: '\x1b[38;2;136;57;186m',
    pink: '\x1b[38;2;214;84;157m',
    flamingo: '\x1b[38;2;200;100;100m',
    lavender: '\x1b[38;2;100;100;220m',
    white: '\x1b[38;2;255;255;255m',
  },

  // Claude-inspired warm theme (light)
  'claude': {
    name: 'Claude',
    crust: '\x1b[48;2;250;249;245m',   // ivory
    mantle: '\x1b[48;2;245;244;237m', // parchment
    base: '\x1b[48;2;240;238;220m',   // sand
    surface0: '\x1b[48;2;232;230;220m', // warm surface
    surface1: '\x1b[48;2;209;207;197m', // lighter warm
    surface2: '\x1b[48;2;135;134;127m', // stone
    text: '\x1b[38;2;20;20;19m',       // near black
    subtext0: '\x1b[38;2;94;93;89m',  // olive gray
    subtext1: '\x1b[38;2;61;61;56m',  // charcoal warm
    overlay0: '\x1b[38;2;135;134;127m', // stone gray
    blue: '\x1b[38;2;56;152;236m',    // focus blue
    sapphire: '\x1b[38;2;56;152;236m', // blue variant
    sky: '\x1b[38;2;100;170;210m',    // sky blue
    teal: '\x1b[38;2;23;146;153m',    // teal
    green: '\x1b[38;2;100;200;100m',   // success green
    yellow: '\x1b[38;2;250;189;47m',  // warm yellow
    peach: '\x1b[38;2;201;151;87m',   // warm peach
    maroon: '\x1b[38;2;180;120;120m', // warm maroon
    red: '\x1b[38;2;181;51;51m',      // error crimson
    mauve: '\x1b[38;2;201;118;87m',   // terracotta variant
    pink: '\x1b[38;2;217;119;87m',    // coral variant
    flamingo: '\x1b[38;2;220;150;130m', // warm flamingo
    lavender: '\x1b[38;2;139;92;246m', // purple
    white: '\x1b[38;2;255;255;250m',  // warm white
  },
}

// Current theme state
let currentTheme: ThemeName = 'catppuccin-mocha'

/**
 * Get the current theme
 */
export function getTheme(): Theme {
  return themes[currentTheme]
}

/**
 * Set the current theme
 */
export function setTheme(name: ThemeName): void {
  if (themes[name]) {
    currentTheme = name
  }
}

/**
 * Get theme by name
 */
export function getThemeByName(name: string): Theme | null {
  const key = name.toLowerCase().replace(/[_\s]+/g, '-') as ThemeName
  return themes[key] || null
}

/**
 * List all available themes
 */
export function listThemes(): Array<{ name: ThemeName; label: string }> {
  return Object.entries(themes).map(([key, theme]) => ({
    name: key as ThemeName,
    label: theme.name,
  }))
}

/**
 * Get current theme name
 */
export function getCurrentThemeName(): ThemeName {
  return currentTheme
}
