/**
 * BeastCLI Logo System
 * Colorful ASCII art with gradient support
 */

/**
 * BeastCLI Color Palettes (inline to avoid import issues)
 */
const catppuccinMocha = {
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
  text: "#cdd6f4",
  subtext1: "#bac2de",
  subtext0: "#a6adc8",
  overlay2: "#9399b2",
  overlay1: "#7f849c",
  surface0: "#313244",
  base: "#1e1e2e",
} as const

const tokyoNight = {
  rosewater: "#f7768e",
  flamingo: "#ff9e64",
  pink: "#bb9af7",
  mauve: "#7aa2f7",
  red: "#f7768e",
  maroon: "#ff9e64",
  peach: "#e0af68",
  yellow: "#e0af68",
  green: "#9ece6a",
  teal: "#73daca",
  sky: "#7dcfff",
  sapphire: "#2ac3de",
  blue: "#7aa2f7",
  lavender: "#bb9af7",
  text: "#c0caf5",
  subtext1: "#a9b1d6",
  subtext0: "#9aa5ce",
  overlay2: "#565f89",
  overlay1: "#414868",
  surface0: "#1a1b26",
  base: "#1a1b26",
} as const

const dracula = {
  rosewater: "#ff79c6",
  flamingo: "#ff79c6",
  pink: "#ff79c6",
  mauve: "#bd93f9",
  red: "#ff5555",
  maroon: "#ff6e6e",
  peach: "#ffb86c",
  yellow: "#f1fa8c",
  green: "#50fa7b",
  teal: "#8be9fd",
  sky: "#8be9fd",
  sapphire: "#6272a4",
  blue: "#8be9fd",
  lavender: "#bd93f9",
  text: "#f8f8f2",
  subtext1: "#e6e6e6",
  subtext0: "#bfbfbf",
  overlay2: "#6272a4",
  overlay1: "#44475a",
  surface0: "#282a36",
  base: "#282a36",
} as const

const gruvbox = {
  rosewater: "#fb4934",
  flamingo: "#cc241d",
  pink: "#d3869b",
  mauve: "#b16286",
  red: "#fb4934",
  maroon: "#cc241d",
  peach: "#fe8019",
  yellow: "#fabd2f",
  green: "#b8bb26",
  teal: "#8ec07c",
  sky: "#83a598",
  sapphire: "#458588",
  blue: "#83a598",
  lavender: "#d3869b",
  text: "#ebdbb2",
  subtext1: "#d5c4a1",
  subtext0: "#bdae93",
  overlay2: "#a89984",
  overlay1: "#928374",
  surface0: "#32302f",
  base: "#282828",
} as const

const oneDark = {
  rosewater: "#e06c75",
  flamingo: "#e06c75",
  pink: "#c678dd",
  mauve: "#c678dd",
  red: "#e06c75",
  maroon: "#be5046",
  peach: "#d19a66",
  yellow: "#e5c07b",
  green: "#98c379",
  teal: "#56b6c2",
  sky: "#61afef",
  sapphire: "#56b6c2",
  blue: "#61afef",
  lavender: "#c678dd",
  text: "#abb2bf",
  subtext1: "#b4bdc8",
  subtext0: "#7f848e",
  overlay2: "#5c6370",
  overlay1: "#4b5263",
  surface0: "#252b37",
  base: "#282c34",
} as const

const nord = {
  rosewater: "#bf616a",
  flamingo: "#bf616a",
  pink: "#b48ead",
  mauve: "#b48ead",
  red: "#bf616a",
  maroon: "#bf616a",
  peach: "#d08770",
  yellow: "#ebcb8b",
  green: "#a3be8c",
  teal: "#88c0d0",
  sky: "#88c0d0",
  sapphire: "#5e81ac",
  blue: "#81a1c1",
  lavender: "#b48ead",
  text: "#eceff4",
  subtext1: "#d8dee9",
  subtext0: "#b4bcc8",
  overlay2: "#8fbcbb",
  overlay1: "#4c566a",
  surface0: "#434c5e",
  base: "#2e3440",
} as const

export type LogoTheme = "catppuccin" | "tokyo" | "dracula" | "gruvbox" | "onedark" | "nord"

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  muted: string
  success: string
  warning: string
  error: string
  info: string
  text: string
  surface: string
  background: string
}

export const colorSchemes: Record<LogoTheme, ColorScheme> = {
  catppuccin: {
    primary: catppuccinMocha.mauve,
    secondary: catppuccinMocha.blue,
    accent: catppuccinMocha.peach,
    muted: catppuccinMocha.overlay1,
    success: catppuccinMocha.green,
    warning: catppuccinMocha.yellow,
    error: catppuccinMocha.red,
    info: catppuccinMocha.sapphire,
    text: catppuccinMocha.text,
    surface: catppuccinMocha.surface0,
    background: catppuccinMocha.base,
  },
  tokyo: {
    primary: tokyoNight.mauve,
    secondary: tokyoNight.blue,
    accent: tokyoNight.peach,
    muted: tokyoNight.overlay1,
    success: tokyoNight.green,
    warning: tokyoNight.yellow,
    error: tokyoNight.red,
    info: tokyoNight.sapphire,
    text: tokyoNight.text,
    surface: tokyoNight.surface0,
    background: tokyoNight.base,
  },
  dracula: {
    primary: dracula.mauve,
    secondary: dracula.blue,
    accent: dracula.peach,
    muted: dracula.overlay1,
    success: dracula.green,
    warning: dracula.yellow,
    error: dracula.red,
    info: dracula.sapphire,
    text: dracula.text,
    surface: dracula.surface0,
    background: dracula.base,
  },
  gruvbox: {
    primary: gruvbox.mauve,
    secondary: gruvbox.blue,
    accent: gruvbox.peach,
    muted: gruvbox.overlay1,
    success: gruvbox.green,
    warning: gruvbox.yellow,
    error: gruvbox.red,
    info: gruvbox.sapphire,
    text: gruvbox.text,
    surface: gruvbox.surface0,
    background: gruvbox.base,
  },
  onedark: {
    primary: oneDark.mauve,
    secondary: oneDark.blue,
    accent: oneDark.peach,
    muted: oneDark.overlay1,
    success: oneDark.green,
    warning: oneDark.yellow,
    error: oneDark.red,
    info: oneDark.sapphire,
    text: oneDark.text,
    surface: oneDark.surface0,
    background: oneDark.base,
  },
  nord: {
    primary: nord.mauve,
    secondary: nord.blue,
    accent: nord.peach,
    muted: nord.overlay1,
    success: nord.green,
    warning: nord.yellow,
    error: nord.red,
    info: nord.sapphire,
    text: nord.text,
    surface: nord.surface0,
    background: nord.base,
  },
}

// ANSI color codes (terminal)
function ansi(color: string): string {
  const hex = color.replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `\x1b[38;2;${r};${g};${b}m`
}

function resetansi(): string {
  return "\x1b[0m"
}

// Colorful ASCII BEAST logo with gradient - Box style
const beastBoxLines = [
  "╔════════════════════════════════════════════════════════════════════════════════╗",
  "║                                                                                ║",
  "║   ███████╗███████╗ ██████╗██╗   ██╗██████╗ ███████╗███████╗██████╗           ║",
  "║   ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝██╔════╝██╔══██╗          ║",
  "║   ███████╗█████╗  ██║     ██║   ██║██████╔╝█████╗  █████╗  ██║  ██║          ║",
  "║   ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝  ██╔══╝  ██║  ██║          ║",
  "║   ███████║███████╗╚██████╗╚██████╔╝██║  ██║███████╗███████╗██████╔╝          ║",
  "║   ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═════╝           ║",
  "║                                                                                ║",
  "╚════════════════════════════════════════════════════════════════════════════════╝",
]

// Export styled logo line generator
export function getColoredLogo(theme: LogoTheme = "catppuccin"): string {
  const colors = colorSchemes[theme]
  const lines = beastBoxLines

  return lines
    .map((line) => {
      let coloredLine = ""
      for (const char of line) {
        if (char === "═" || char === "║" || char === "╔" || char === "╗" || char === "╚" || char === "╝") {
          coloredLine += ansi(colors.primary) + char
        } else if (char === "█") {
          const colorIndex = coloredLine.length % 3
          const color = colorIndex === 0 ? colors.secondary : colorIndex === 1 ? colors.accent : colors.primary
          coloredLine += ansi(color) + char
        } else if (char !== " " && char !== "║") {
          coloredLine += ansi(colors.text) + char
        } else {
          coloredLine += char
        }
      }
      return coloredLine + resetansi()
    })
    .join("\n")
}

// Export simple colored logo (compact)
export function getSimpleLogo(theme: LogoTheme = "catppuccin"): string {
  const colors = colorSchemes[theme]
  return [
    `${ansi(colors.primary)}╭───────────────────────────────────────────╮${resetansi()}`,
    `${ansi(colors.text)}│${resetansi()}`,
    `${ansi(colors.secondary)}│   🦁  ${ansi(colors.accent)}BEAST CLI${resetansi()} ${ansi(colors.muted)}v1.14.31${resetansi()}`,
    `${ansi(colors.text)}│      ${ansi(colors.info)}AI-Powered Coding Assistant${resetansi()}`,
    `${ansi(colors.text)}│${resetansi()}`,
    `${ansi(colors.primary)}╰───────────────────────────────────────────╯${resetansi()}`,
  ].join("\n")
}

// Rainbow gradient version
export function getRainbowLogo(): string {
  const rainbow = [
    "\x1b[38;2;255;82;82m", // red
    "\x1b[38;2;255;136;82m", // orange
    "\x1b[38;2;255;204;82m", // yellow
    "\x1b[38;2;130;204;82m", // green
    "\x1b[38;2;82;136;255m", // blue
    "\x1b[38;2;204;82;255m", // purple
  ]

  const lines = beastBoxLines
  return lines
    .map((line, lineIndex) => {
      let result = ""
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === "═" || char === "║" || char === "╔" || char === "╗" || char === "╚" || char === "╝") {
          result += rainbow[lineIndex % rainbow.length] + char
        } else if (char === "█") {
          const colorIdx = (i + lineIndex) % rainbow.length
          result += rainbow[colorIdx] + char
        } else if (char !== " " && char !== "║") {
          result += rainbow[2] + char
        } else {
          result += char
        }
      }
      return result + "\x1b[0m"
    })
    .join("\n")
}

// Welcome header generator
export interface WelcomeHeader {
  logo: string
  tagline: string
  version: string
  features: string[]
  security: string
}

export function getWelcomeHeader(theme: LogoTheme = "catppuccin"): WelcomeHeader {
  const colors = colorSchemes[theme]
  return {
    logo: getColoredLogo(theme),
    tagline: `${ansi(colors.accent)}AI-Powered Coding Assistant${resetansi()}`,
    version: `${ansi(colors.muted)}v1.14.31${resetansi()}`,
    features: [
      `${ansi(colors.success)}✓${resetansi()} ${ansi(colors.secondary)}45+ AI Providers${resetansi()}`,
      `${ansi(colors.success)}✓${resetansi()} ${ansi(colors.secondary)}30+ Native Tools${resetansi()}`,
      `${ansi(colors.success)}✓${resetansi()} ${ansi(colors.secondary)}Smart Session Management${resetansi()}`,
      `${ansi(colors.success)}✓${resetansi()} ${ansi(colors.secondary)}30+ Themes${resetansi()}`,
    ],
    security: getSecuredBadge(colors),
  }
}

// Secured badge ASCII art
const securedLines = [
  "     ╔═══════════════════════════╗",
  "     ║  🔒 SECURED & PROTECTED   ║",
  "     ╠═══════════════════════════╣",
  "     ║ ✓ API Keys Encrypted      ║",
  "     ║ ✓ File Access Controlled ║",
  "     ║ ✓ Permission System      ║",
  "     ║ ✓ 600 File Permissions    ║",
  "     ╚═══════════════════════════╝",
]

export function getSecuredBadge(colors?: ColorScheme): string {
  const c = colors ?? colorSchemes.catppuccin

  return securedLines
    .map((line) => {
      let coloredLine = ""
      for (const char of line) {
        if ("═╔╗╚╝╠║".includes(char)) {
          coloredLine += ansi(c.primary) + char
        } else if (char === "✓") {
          coloredLine += ansi(c.success) + char
        } else if (char === "🔒") {
          coloredLine += ansi(c.accent) + char
        } else if (char !== " ") {
          coloredLine += ansi(c.text) + char
        } else {
          coloredLine += char
        }
      }
      return coloredLine + resetansi()
    })
    .join("\n")
}

// Full welcome screen with security badge
export function getWelcomeScreen(theme: LogoTheme = "catppuccin"): string {
  const header = getWelcomeHeader(theme)
  const security = getSecuredBadge(colorSchemes[theme])

  return [
    header.logo,
    "",
    `${ansi(colorSchemes[theme].accent)}  🦁  ${ansi(colorSchemes[theme].secondary)}BEAST CLI${resetansi()} ${ansi(colorSchemes[theme].muted)}v1.14.31${resetansi()}`,
    `${ansi(colorSchemes[theme].muted)}     AI-Powered Coding Assistant${resetansi()}`,
    "",
    ...header.features,
    "",
    security,
    "",
    `${ansi(colorSchemes[theme].muted)}Press ${ansi(colorSchemes[theme].secondary)}Ctrl+K${resetansi()} for commands  |  ${ansi(colorSchemes[theme].muted)}? for help${resetansi()}`,
  ].join("\n")
}

export const logo = {
  left: [
    "██████╗ ███████╗  █████╗ ███████╗████████╗",
    "██╔══██╗██╔════╝ ██╔══██╗██╔════╝╚══██╔══╝",
    "██████╔╝█████╗   ███████║███████╗   ██║   ",
    "██╔══██╗██╔══╝   ██╔══██║╚════██║   ██║   ",
    "██████╔╝███████╗ ██║  ██║███████║   ██║   ",
    "╚═════╝ ╚══════╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ",
  ],
  right: [
    " ██████╗██╗     ██╗",
    "██╔════╝██║     ██║",
    "██║     ██║     ██║",
    "██║     ██║     ██║",
    "╚██████╗███████╗██║",
    " ╚═════╝╚══════╝╚═╝",
  ],
  encoded: false,
}

export const go = {
  left: [
    "███████╗ ██████╗ ",
    "██╔════╝██╔════╝ ",
    "██║     ██║  ███╗",
    "██║     ██║   ██║",
    "███████╗╚██████╔╝",
    "╚══════╝ ╚═════╝ ",
  ],
  right: [
    " ██████╗██╗     ██╗",
    "██╔════╝██║     ██║",
    "██║     ██║     ██║",
    "██║     ██║     ██║",
    "╚██████╗███████╗██║",
    " ╚═════╝╚══════╝╚═╝",
  ],
  encoded: false,
}

export const marks = "_^~,"
