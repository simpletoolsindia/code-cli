/**
 * Beast CLI - ASCII Logo Generator
 * Generates gradient ASCII art logos using figlet + chalk.
 * Caches generated logos for fast subsequent access.
 *
 * Uses chalk v6 (not gradient-string which has chalk level issues in v3).
 * Each line of the ASCII art is colored progressively through the gradient.
 */

import figlet from 'figlet'
import chalk from 'chalk'

// ─── Chalk with 24-bit color support ──────────────────────────────────────────

// chalk v6: create instance with level 3 (24-bit true color)
const chalk24 = new chalk.Chalk({ level: 3 })

// ─── Palette Definitions ──────────────────────────────────────────────────────

export interface LogoPalette {
  name: string
  description: string
  colors: string[]  // Hex colors, applied per-line cycling
}

export const LOGO_PALETTES: LogoPalette[] = [
  {
    name: 'beast-purple',
    description: 'Google Purple to Blue — Beast brand',
    colors: ['#8e36ff', '#6b4fd6', '#4682ff', '#2a9df4', '#00d4ff'],
  },
  {
    name: 'beast-fire',
    description: 'Orange to Purple — warm energy',
    colors: ['#ff6b35', '#ff4d6d', '#8e36ff', '#6b4fd6'],
  },
  {
    name: 'beast-matrix',
    description: 'Matrix green — hacker aesthetic',
    colors: ['#00ff41', '#00cc33', '#00ff41', '#33ff77', '#00ff41'],
  },
  {
    name: 'sunset',
    description: 'Red to yellow — sunset',
    colors: ['#ff6b6b', '#ff8e53', '#ffd93d', '#ffb347'],
  },
  {
    name: 'ocean',
    description: 'Deep blue to cyan',
    colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
  },
  {
    name: 'aurora',
    description: 'Green to purple — northern lights',
    colors: ['#00ff87', '#60efff', '#8e36ff', '#ff6b9d'],
  },
  {
    name: 'gold',
    description: 'Golden gradient',
    colors: ['#ffd700', '#ffb700', '#ff9500', '#ffd700'],
  },
  {
    name: 'retro',
    description: 'Retro TV colors',
    colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
  },
]

// ─── Font Options ─────────────────────────────────────────────────────────────

export const LOGO_FONTS = [
  'ANSI Shadow',   // Best for logos — bold block chars
  'Standard',       // Classic figlet
  'Big',           // Large block letters
  'Banner',        // Banner style
  'Block',         // Block letters
  ' lean ',        // Slender letters
  'slant',        // Slanted
]

// ─── Cache ───────────────────────────────────────────────────────────────────

interface CacheEntry {
  text: string
  palette: string
  font: string
}

const cache = new Map<string, CacheEntry>()
const CACHE_MAX = 50

function cacheKey(text: string, palette: string, font: string): string {
  return `${text}::${palette}::${font}`
}

// ─── Core Generator ───────────────────────────────────────────────────────────

/**
 * Generate gradient ASCII logo text.
 * @param text       Text to render as ASCII art
 * @param palette    Palette name (from LOGO_PALETTES)
 * @param font       Figlet font name
 * @returns ANSI-colored ASCII art string, or plain text on failure
 */
export function generateLogo(
  text: string,
  palette: string = 'beast-purple',
  font: string = 'ANSI Shadow'
): string {
  const key = cacheKey(text, palette, font)

  if (cache.has(key)) {
    return cache.get(key)!.text
  }

  // Generate ASCII art
  let ascii: string
  try {
    ascii = figlet.textSync(text, { font })
  } catch {
    return fallbackLogo(text)
  }

  // Apply gradient colors per line
  const paletteDef = LOGO_PALETTES.find(p => p.name === palette)
  const colors = paletteDef?.colors ?? LOGO_PALETTES[0].colors
  const lines = ascii.split('\n')

  const colored = lines.map((line, i) => {
    if (!line.trim()) return line
    const colorHex = colors[i % colors.length]
    return chalk24.hex(colorHex)(line)
  }).join('\n')

  // Cache result
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { text: colored, palette, font })

  return colored
}

/**
 * Generate a simple single-color ASCII logo (fast, no gradient).
 */
export function generateSimpleLogo(
  text: string,
  color: string = '#8e36ff',
  font: string = 'ANSI Shadow'
): string {
  const key = `simple::${text}::${color}::${font}`
  if (cache.has(key)) return cache.get(key)!.text

  let ascii: string
  try {
    ascii = figlet.textSync(text, { font })
  } catch {
    return fallbackLogo(text)
  }

  const colored = chalk24.hex(color)(ascii)

  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { text: colored, palette: 'simple', font })

  return colored
}

// ─── Pre-built BEAST Logos ────────────────────────────────────────────────────

export function beastLogo(palette: string = 'beast-purple'): string {
  return generateLogo('BEAST', palette)
}

export function beastCLILogo(palette: string = 'beast-purple'): string {
  return generateLogo('BEAST CLI', palette)
}

export function beastWelcome(palette: string = 'beast-purple'): string {
  return generateLogo('BEAST', palette, 'ANSI Shadow')
}

// ─── Fallback (no figlet) ─────────────────────────────────────────────────────

function fallbackLogo(text: string): string {
  // Clean box-drawn fallback using existing theme colors
  const gpPurple = '\x1b[38;2;142;54;255m'
  const gpBlue = '\x1b[38;2;70;130;255m'
  const reset = '\x1b[0m'
  const bold = '\x1b[1m'
  return [
    `${gpPurple}╔${'═'.repeat(text.length + 4)}${gpPurple}╗${reset}`,
    `${gpPurple}║${reset} ${bold}${gpPurple}${text}${reset} ${gpPurple}║${reset}`,
    `${gpPurple}╚${'═'.repeat(text.length + 4)}${gpPurple}╝${reset}`,
  ].join('\n')
}

// ─── Cache Control ────────────────────────────────────────────────────────────

export function clearLogoCache(): void {
  cache.clear()
}

export function getAvailablePalettes(): LogoPalette[] {
  return [...LOGO_PALETTES]
}

export function getAvailableFonts(): string[] {
  return [...LOGO_FONTS]
}

// ─── Inline ASCII Art (no figlet dependency) ─────────────────────────────────

/**
 * Pre-defined beast ASCII art — instant, no async needed.
 * Use for quick splash screens where figlet might be slow.
 */
export const INLINE_BEAST_ART: Record<string, string> = {
  mini: [
    ' \x1b[38;2;142;54;255m███\x1b[0m  \x1b[38;2;70;130;255mBEAST\x1b[0m',
    ' \x1b[38;2;142;54;255m███\x1b[[0m',
  ].join('\n'),

  compact: [
    ' \x1b[38;2;142;54;255m╔═══════════════════════╗\x1b[0m',
    ' \x1b[38;2;142;54;255m║\x1b[0m  🐉  \x1b[38;2;142;54;255mBEAST\x1b[38;2;70;130;255m CLI\x1b[0m        \x1b[38;2;142;54;255m║\x1b[0m',
    ' \x1b[38;2;142;54;255m╚═══════════════════════╝\x1b[0m',
  ].join('\n'),

  full: [
    ' \x1b[38;2;142;54;255m╔══════════════════════════════════════════════╗\x1b[0m',
    ' \x1b[38;2;142;54;255m║\x1b[0m  🐉  \x1b[38;2;142;54;255mBEAST\x1b[38;2;70;130;255m CLI\x1b[0m    \x1b[38;2;140;138;130mAI Coding Agent · 51+ Tools\x1b[0m  \x1b[38;2;142;54;255m║\x1b[0m',
    ' \x1b[38;2;142;54;255m╚══════════════════════════════════════════════╝\x1b[0m',
  ].join('\n'),
}

// ─── Tool-specific inline ASCII art (no figlet) ─────────────────────────────

/**
 * File operation ASCII art — for progress indicators.
 * Format: [icon] label ... or box-drawn mini banners.
 */
export function fileReadArt(filename: string): string {
  const maxLen = Math.min(filename.length, 40)
  const short = filename.slice(0, maxLen)
  const barLen = Math.min(short.length + 4, 50)
  return [
    ` \x1b[38;2;70;130;255m┌${'─'.repeat(barLen)}┐\x1b[0m`,
    ` \x1b[38;2;70;130;255m│\x1b[0m \x1b[38;2;56;152;236m▷\x1b[0m Reading: \x1b[38;2;140;138;130m${short}\x1b[0m${' '.repeat(Math.max(0, barLen - short.length - 12))}\x1b[38;2;70;130;255m│\x1b[0m`,
    ` \x1b[38;2;70;130;255m└${'─'.repeat(barLen)}┘\x1b[0m`,
  ].join('\n')
}

export function fileWriteArt(filename: string): string {
  const maxLen = Math.min(filename.length, 40)
  const short = filename.slice(0, maxLen)
  const barLen = Math.min(short.length + 4, 50)
  return [
    ` \x1b[38;2;201;130;70m┌${'─'.repeat(barLen)}┐\x1b[0m`,
    ` \x1b[38;2;201;130;70m│\x1b[0m \x1b[38;2;200;140;0m✎\x1b[0m Writing: \x1b[38;2;140;138;130m${short}\x1b[0m${' '.repeat(Math.max(0, barLen - short.length - 11))}\x1b[38;2;201;130;70m│\x1b[0m`,
    ` \x1b[38;2;201;130;70m└${'─'.repeat(barLen)}┘\x1b[0m`,
  ].join('\n')
}

export function fileCopyArt(src: string, dst: string): string {
  const maxLen = Math.min(Math.max(src.length, dst.length), 30)
  const shortSrc = src.slice(0, maxLen)
  const shortDst = dst.slice(0, maxLen)
  const barLen = Math.min(maxLen + 4, 50)
  return [
    ` \x1b[38;2;180;80;200m┌${'─'.repeat(barLen)}┐\x1b[0m`,
    ` \x1b[38;2;180;80;200m│\x1b[0m \x1b[38;2;139;92;246m▣\x1b[0m Copy: \x1b[38;2;140;138;130m${shortSrc}\x1b[0m`,
    ` \x1b[38;2;180;80;200m│\x1b[0m   → \x1b[38;2;140;138;130m${shortDst}\x1b[0m${' '.repeat(Math.max(0, barLen - shortDst.length - 7))}\x1b[38;2;180;80;200m│\x1b[0m`,
    ` \x1b[38;2;180;80;200m└${'─'.repeat(barLen)}┘\x1b[0m`,
  ].join('\n')
}

export function llmProcessArt(model: string): string {
  const barLen = Math.min(model.length + 4, 50)
  return [
    ` \x1b[38;2;142;54;255m┌${'─'.repeat(barLen)}┐\x1b[0m`,
    ` \x1b[38;2;142;54;255m│\x1b[0m \x1b[38;2;180;80;200m◐\x1b[0m LLM: \x1b[38;2;140;138;130m${model}\x1b[0m${' '.repeat(Math.max(0, barLen - model.length - 8))}\x1b[38;2;142;54;255m│\x1b[0m`,
    ` \x1b[38;2;142;54;255m└${'─'.repeat(barLen)}┘\x1b[0m`,
  ].join('\n')
}

export function searchArt(query: string): string {
  const maxLen = Math.min(query.length, 40)
  const short = query.slice(0, maxLen)
  const barLen = Math.min(short.length + 4, 50)
  return [
    ` \x1b[38;2;56;152;236m┌${'─'.repeat(barLen)}┐\x1b[0m`,
    ` \x1b[38;2;56;152;236m│\x1b[0m \x1b[38;2;56;152;236m⌕\x1b[0m Search: \x1b[38;2;140;138;130m${short}\x1b[0m${' '.repeat(Math.max(0, barLen - short.length - 11))}\x1b[38;2;56;152;236m│\x1b[0m`,
    ` \x1b[38;2;56;152;236m└${'─'.repeat(barLen)}┘\x1b[0m`,
  ].join('\n')
}

export function toolRunningArt(toolName: string): string {
  const maxLen = Math.min(toolName.length, 40)
  const short = toolName.slice(0, maxLen)
  const barLen = Math.min(short.length + 4, 50)
  return [
    ` \x1b[38;2;140;138;130m┌${'─'.repeat(barLen)}┐\x1b[0m`,
    ` \x1b[38;2;140;138;130m│\x1b[0m \x1b[38;2;201;130;70m›\x1b[0m ${short}\x1b[0m${' '.repeat(Math.max(0, barLen - short.length - 3))}\x1b[38;2;140;138;130m│\x1b[0m`,
    ` \x1b[38;2;140;138;130m└${'─'.repeat(barLen)}┘\x1b[0m`,
  ].join('\n')
}

// ─── ASCII Progress Bar ──────────────────────────────────────────────────────

export interface ProgressBarOptions {
  label: string
  current: number
  total: number
  width?: number
  color?: string
  icon?: string
}

/**
 * Generate an ASCII progress bar with label.
 * Example: [████████░░░░░░░░] 40% Reading: package.json
 */
export function progressBar(opts: ProgressBarOptions): string {
  const { label, current, total, width = 20, color = '#8e36ff', icon = '›' } = opts
  const pct = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled

  const bar = `[${chalk24.hex(color)('█'.repeat(filled))}${'░'.repeat(empty)}]`
  const pctStr = `${pct}%`
  const iconStr = chalk24.hex(color)(icon)

  const maxLabel = Math.min(label.length, 30)
  const shortLabel = label.slice(0, maxLabel)

  return `${iconStr} ${bar} ${pctStr} ${shortLabel}`
}

/**
 * Animated progress bar with cycling spinner.
 * Returns a function that produces the next frame.
 */
export function createAnimatedProgress(opts: ProgressBarOptions) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let frameIdx = 0

  return {
    nextFrame(): string {
      const spinner = chalk24.hex(opts.color ?? '#8e36ff')(frames[frameIdx])
      frameIdx = (frameIdx + 1) % frames.length
      return progressBar({ ...opts, icon: spinner, current: opts.current, total: opts.total })
    },
    reset() { frameIdx = 0 },
  }
}
