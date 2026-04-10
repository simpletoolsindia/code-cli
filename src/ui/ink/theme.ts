// Ink Theme - Bridge Beast's 11 themes to Ink color strings
// Ink uses named colors (cyan, magenta, etc.) or hex (#ff0000)

import { themes, fg, type ThemeName } from '../colors.ts'

let currentThemeName: ThemeName = 'claude'

export function getThemeName(): ThemeName {
  const env = process.env.BEAST_THEME
  if (env && themes[env as ThemeName]) return env as ThemeName
  return currentThemeName
}

export function setThemeName(name: ThemeName): void {
  if (themes[name]) currentThemeName = name
}

export interface InkColors {
  primary: string
  secondary: string
  muted: string
  success: string
  warning: string
  error: string
  info: string
  accent: string
  tool: string
  code: string
  user: string
  assistant: string
  // Extra theme colors
  text: string
  blue: string
  sapphire: string
  green: string
  yellow: string
  red: string
  mauve: string
  pink: string
  peach: string
  teal: string
  lavender: string
}

// Map ANSI codes to Ink color names or hex values
// Ink supports: black, red, green, yellow, blue, magenta, cyan, white, gray
// Plus hex: #ff0000, rgb(255,0,0), etc.
function ansiToInkColor(ansi: string): string {
  if (!ansi) return '#888888'
  // Extract RGB from ANSI 38;2;R;G;Bm format
  const match = ansi.match(/38;2;(\d+);(\d+);(\d+)/)
  if (match) {
    return `#${parseInt(match[1]).toString(16).padStart(2, '0')}${parseInt(match[2]).toString(16).padStart(2, '0')}${parseInt(match[3]).toString(16).padStart(2, '0')}`
  }
  // Extract 256 color 38;5;Nm
  const c256 = ansi.match(/38;5;(\d+)/)
  if (c256) {
    const n = parseInt(c256[1])
    if (n < 16) {
      const basic = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
      return basic[n] || '#888888'
    }
  }
  return '#888888'
}

export function getTheme(): InkColors {
  const theme = themes[getThemeName()]
  return {
    primary: ansiToInkColor(theme.text),
    secondary: ansiToInkColor(theme.subtext1),
    muted: ansiToInkColor(theme.overlay0),
    success: ansiToInkColor(theme.green),
    warning: ansiToInkColor(theme.yellow),
    error: ansiToInkColor(theme.red),
    info: ansiToInkColor(theme.blue),
    accent: ansiToInkColor(theme.lavender || theme.mauve || theme.blue),
    tool: ansiToInkColor(theme.peach),
    code: ansiToInkColor(theme.teal),
    user: ansiToInkColor(theme.green),
    assistant: ansiToInkColor(theme.mauve),
    text: ansiToInkColor(theme.text),
    blue: ansiToInkColor(theme.blue),
    sapphire: ansiToInkColor(theme.sapphire),
    green: ansiToInkColor(theme.green),
    yellow: ansiToInkColor(theme.yellow),
    red: ansiToInkColor(theme.red),
    mauve: ansiToInkColor(theme.mauve),
    pink: ansiToInkColor(theme.pink),
    peach: ansiToInkColor(theme.peach),
    teal: ansiToInkColor(theme.teal),
    lavender: ansiToInkColor(theme.lavender || theme.blue),
  }
}

// Ink-style style helper: apply color strings
export function style(text: string, ...styles: string[]): string {
  // For React/Ink components, return text (colors applied via <Text color>)
  // This is a passthrough for string composition
  return text
}

// List available theme names
export function listThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[]
}
