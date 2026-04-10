// Beast CLI - Catppuccin Mocha Theme + Clean Icon System
// Based on research: cohesive pastel dark theme, accessible colors

// ANSI Reset
export const reset = '\x1b[0m'
export const bold = '\x1b[1m'
export const dim = '\x1b[2m'
export const italic = '\x1b[3m'
export const underline = '\x1b[4m'

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

// ── Semantic Colors ───────────────────────────────────────────────────────────
export const fg = {
  primary:   mocha.text,
  secondary: mocha.subtext1,
  muted:     mocha.overlay0,
  overlay:   mocha.surface2,

  success:   mocha.green,
  warning:   mocha.yellow,
  error:     mocha.red,
  info:      mocha.blue,

  user:      mocha.green,
  assistant: mocha.mauve,
  system:    mocha.sapphire,
  tool:      mocha.peach,

  code:      mocha.teal,
  link:      mocha.sapphire,
  keyword:   mocha.mauve,
  function:  mocha.blue,
  string:    mocha.green,
  number:    mocha.peach,

  accent:    mocha.mauve,
  accent2:   mocha.pink,
  accent3:   mocha.lavender,
  peach:     mocha.peach,
  mauve:     mocha.mauve,
  cyan:      mocha.teal,
  purple:    mocha.mauve,

  prompt:    mocha.green,

  // Google-inspired vibrant accents (always available)
  gpPurple:   '\x1b[38;2;142;54;255m',  // Google Purple
  gpBlue:    '\x1b[38;2;70;130;255m',   // Google Blue
  gpCyan:    '\x1b[38;2;0;200;200m',    // Google Cyan
  gpGreen:   '\x1b[38;2;0;200;100m',   // Google Green
  gpYellow:  '\x1b[38;2;255;200;0m',    // Google Yellow
  gpRed:     '\x1b[38;2;255;100;100m', // Google Red
}

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
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  round:  { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  heavy:  { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  dashed: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  soft:   { tl: '╭', tr: '╮', bl: '╯', br: '╰', h: '─', v: '│' },
  light:  { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
}

// ── Clean Spinner Frames ──────────────────────────────────────────────────────
export const spinnerFrames = {
  // Classic dot animation (fast, clean)
  dots:    ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  // Simple line spinner
  line:    ['-', '\\', '|', '/'],
  // Block spinner
  blocks:  ['▖', '▘', '▝', '▗'],
  // Arrow spinner
  arrow:   ['←', '↙', '↓', '↘', '→', '↗', '↑', '↖'],
  // Star spinner
  star:    ['⋆', '✦', '✧', '⋆', '✧', '✦'],
}

// Default spinner (dots)
export const DEFAULT_SPINNER = spinnerFrames.dots

// ── Clean Icons (no emoji) ───────────────────────────────────────────────────
// Following nodejs-cli-apps-best-practices: use Unicode symbols consistently

export const icon = {
  // Prompt / prefix (Gemini CLI style: ">" with accent color)
  prompt:      '>',           // > — Google CLI style prompt
  userPrefix:  '>',           // user input prefix
  aiPrefix:   '◈',          // assistant prefix — distinctive diamond

  // Status
  success:    '✓',
  error:      '✗',
  warning:    '!',
  info:       'i',
  check:      '●',
  online:     '●',
  offline:    '○',

  // Emoji accents (for strategic engagement moments)
  emoji: {
    beast:      '🐉',
    spark:      '✨',
    tool:       '🔧',
    search:     '🔍',
    code:       '⚡',
    link:       '🔗',
    star:       '⭐',
    tip:        '💡',
    rocket:     '🚀',
    success:    '✅',
    error:      '❌',
    warning:    '⚠️',
    info:       'ℹ️',
    wave:       '👋',
    chat:       '💬',
    robot:      '🤖',
    zap:        '⚡',
    star2:      '🌟',
    fire:       '🔥',
    gear:       '⚙️',
    key:        '🔑',
    world:      '🌐',
    bulb:       '💡',
  },

  // Google brand colors (used by gemini theme)
  googlePurple:   '\x1b[38;2;142;54;255m',   // #8e36ff
  googleBlue:     '\x1b[38;2;70;130;255m',   // #4682ff
  googleCyan:     '\x1b[38;2;0;200;200m',    // #00c8c8
  googleGreen:    '\x1b[38;2;0;200;100m',    // #00c864
  googleYellow:   '\x1b[38;2;255;200;0m',   // #ffc800
  googleRed:      '\x1b[38;2;255;100;100m',  // #ff6464

  // Actions / indicators
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

  // File type badges
  ts:         'TS',
  js:         'JS',
  py:         'PY',
  md:         'MD',
  json:       '{}',
  git:        '⎇',

  // Spinner states
  thinking:    '◐',
  loading:    '⠋',

  // Misc
  line:       '─',
  dash:       '–',
  dot:        '·',
  space:      ' ',
}

// Progress bar characters
export const progress = {
  filled:     '█',
  empty:      '░',
  filledSmall:'▓',
  emptySmall: '▒',
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

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────
export const shortcuts = {
  navigation: [
    { key: '↑ / ↓', desc: 'History' },
    { key: 'Tab',    desc: 'Complete' },
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
    crust: '\x1b[48;2;39;40;34m', mantle: '\x1b[48;2;35;36;30m', base: '\x1b[48;2;40;40;34m',
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
    surface0: '\x1b[48;2;232;230;220m', surface1: '\x1b[48;2;209;207;197m', surface2: '\x1b[48;2;135;134;127m',
    text: '\x1b[38;2;20;20;19m', subtext0: '\x1b[38;2;94;93;89m', subtext1: '\x1b[38;2;61;61;56m', overlay0: '\x1b[38;2;135;134;127m',
    blue: '\x1b[38;2;56;152;236m', sapphire: '\x1b[38;2;56;152;236m', sky: '\x1b[38;2;100;170;210m', teal: '\x1b[38;2;23;146;153m',
    green: '\x1b[38;2;100;200;100m', yellow: '\x1b[38;2;250;189;47m', peach: '\x1b[38;2;201;151;87m', maroon: '\x1b[38;2;180;120;120m',
    red: '\x1b[38;2;181;51;51m', mauve: '\x1b[38;2;201;118;87m', pink: '\x1b[38;2;217;119;87m', flamingo: '\x1b[38;2;220;150;130m', lavender: '\x1b[38;2;139;92;246m', white: '\x1b[38;2;255;255;250m',
  },
  gemini: {
    name: 'Gemini',
    // Dark background with subtle blue tint
    crust: '\x1b[48;2;10;10;20m', mantle: '\x1b[48;2;15;15;30m', base: '\x1b[48;2;20;20;40m',
    surface0: '\x1b[48;2;35;35;60m', surface1: '\x1b[48;2;50;50;80m', surface2: '\x1b[48;2;70;70;100m',
    // Text colors
    text: '\x1b[38;2;220;220;255m', subtext0: '\x1b[38;2;170;170;210m', subtext1: '\x1b[38;2;190;190;230m', overlay0: '\x1b[38;2;120;120;160m',
    // Google brand gradient (purple → blue → cyan → green → yellow → red)
    blue: '\x1b[38;2;70;130;255m',     // Google Blue
    sapphire: '\x1b[38;2;60;110;220m', // deep blue
    sky: '\x1b[38;2;0;200;200m',       // Google Cyan
    teal: '\x1b[38;2;0;210;180m',      // teal
    green: '\x1b[38;2;0;200;100m',    // Google Green
    yellow: '\x1b[38;2;255;200;0m',     // Google Yellow
    peach: '\x1b[38;2;255;150;50m',     // orange
    maroon: '\x1b[38;2;200;80;80m',    // red-orange
    red: '\x1b[38;2;255;100;100m',     // Google Red
    mauve: '\x1b[38;2;142;54;255m',    // Google Purple
    pink: '\x1b[38;2;200;100;255m',     // pink
    flamingo: '\x1b[38;2;220;150;180m', // pinkish
    lavender: '\x1b[38;2;150;100;255m', // light purple
    white: '\x1b[38;2;255;255;255m',
  },
}

let currentTheme: ThemeName = 'catppuccin-mocha'

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
