// Beast CLI - UI Layout Components
// Modern terminal UI with Catppuccin theme

import { s, fg, icon, box, bold, dim, progress, isColorEnabled } from './colors.ts'

// ── Header Components ───────────────────────────────────────────────────────

export interface HeaderConfig {
  version: string
  provider: string
  model: string
  toolsCount: number
}

/**
 * Full header with stats and branding
 * Pattern: [Logo] [Version] │ [Provider] │ [Model] │ [Tools]
 */
export function renderHeader(config: HeaderConfig): string {
  if (!isColorEnabled()) {
    return `Beast CLI v${config.version} | ${config.provider} | ${config.model}`
  }

  const { version, provider, model, toolsCount } = config
  const b = box.round

  const line = [
    s(`${b.tl} `, fg.accent),
    s(icon.spark, fg.accent),
    s(' Beast CLI ', fg.accent, bold),
    s(`v${version}`, fg.muted),
    s(` ${b.h} ${b.h} ${b.tr}`, fg.accent),
    s(` ${b.v} `, fg.muted),
    s(icon.check + ' ', fg.success),
    s(provider, fg.success),
    s(` ${b.v} `, fg.muted),
    s(icon.code + ' ', fg.blue),
    s(model, fg.blue),
    s(` ${b.v} `, fg.muted),
    s(icon.tool + ' ', fg.peach),
    s(`${toolsCount} tools`, fg.peach),
    s(` ${b.h} ${b.h}${b.tr}`, fg.accent),
  ].join('')

  const width = Math.min(80, stripAnsi(line).length + 4)
  const sep = s(` ${b.h} `.repeat(Math.floor(width / 2)).slice(0, width), fg.accent)

  return `${line}\n${s(b.bl, fg.accent)}${sep}${s(b.br, fg.accent)}`
}

/**
 * Compact single-line header
 */
export function renderCompactHeader(config: HeaderConfig): string {
  if (!isColorEnabled()) {
    return `Beast CLI v${config.version} | ${config.provider}`
  }

  const { version, provider, model } = config
  return [
    s(icon.spark, fg.accent),
    s(' Beast CLI ', fg.accent, bold),
    s(`v${version}`, fg.muted),
    s(' │ ', fg.overlay),
    s(icon.check, fg.success),
    s(' ' + provider, fg.success),
    s(' │ ', fg.overlay),
    s(icon.code, fg.blue),
    s(' ' + model, fg.blue),
  ].join('')
}

// ── Context Usage Bar ─────────────────────────────────────────────────────────

export interface ContextStats {
  used: number       // tokens used in current conversation
  max: number        // max context window in tokens
}

/**
 * Progress bar showing context window usage
 * Uses Catppuccin colors: green < 75%, yellow < 90%, red > 90%
 */
export function contextBar(stats: ContextStats): string {
  const { used, max } = stats
  const width = 16
  const pct = Math.min(1, used / max)
  const filled = Math.round(pct * width)
  const empty = width - filled

  // Color based on usage level (Catppuccin semantic colors)
  let barColor = fg.success   // green - healthy
  if (pct > 0.75) barColor = fg.warning  // yellow - warning
  if (pct > 0.90) barColor = fg.error   // red - critical

  const bar = s(progress.filled.repeat(filled), barColor) + s(progress.empty.repeat(empty), fg.overlay)
  const pctStr = s(`${Math.round(pct * 100)}%`, barColor)
  const usedStr = s(formatTokens(used), fg.muted)
  const maxStr = s(formatTokens(max), fg.muted)

  return [
    s(`  ${icon.context} `, fg.muted),
    bar,
    s(' ', fg.muted),
    pctStr,
    s(' (', fg.muted),
    usedStr,
    s('/', fg.muted),
    maxStr,
    s(')', fg.muted),
  ].join('')
}

// ── Token Counter ─────────────────────────────────────────────────────────────

export interface TokenStats {
  prompt: number
  completion: number
  total: number
}

/**
 * Compact token display
 */
export function tokenDisplay(stats: TokenStats): string {
  if (!isColorEnabled()) {
    return `${stats.total} tokens (p:${stats.prompt} c:${stats.completion})`
  }

  return [
    s(icon.tokens + ' ', fg.mauve),
    s(stats.total.toLocaleString(), fg.mauve, bold),
    s(' tokens', fg.muted),
    s(' (', fg.overlay),
    s('p:' + stats.prompt, fg.blue),
    s(' ', fg.overlay),
    s('c:' + stats.completion, fg.mauve),
    s(')', fg.overlay),
  ].join('')
}

// ── Status Footer ────────────────────────────────────────────────────────────

export interface FooterStats {
  messages: number
  tokens: number
  duration?: number
  contextMax?: number
  contextUsed?: number
}

/**
 * Footer with stats and keyboard shortcuts
 * Pattern: [Stats] [Separator] [Shortcuts]
 */
export function renderFooter(stats: FooterStats): string {
  if (!isColorEnabled()) {
    const parts = [`${stats.messages} msgs`, `${stats.tokens} tokens`]
    if (stats.duration) parts.push(formatDuration(stats.duration))
    return parts.join(' | ') + ' | /help /exit'
  }

  const { messages, tokens, duration, contextMax = 32, contextUsed = 0 } = stats

  const parts: string[] = []

  parts.push(s(icon.messages + ' ' + messages, fg.muted))
  parts.push(s(icon.tokens + ' ' + formatTokens(tokens), fg.muted))
  if (duration) {
    parts.push(s(icon.clock + ' ' + formatDuration(duration), fg.muted))
  }
  parts.push(s(icon.context + ' ' + contextMax + 'K', fg.muted))

  // Keyboard shortcuts with colors
  const shortcuts = [
    s('/help', fg.mauve),
    s('/tools', fg.mauve),
    s('/clear', fg.mauve),
    s('/exit', fg.mauve),
    s('↑↓', fg.blue),
    s('history', fg.overlay),
  ]

  const topLine = parts.join(s(' · ', fg.overlay))
  const bottomLine = shortcuts.join(s(' · ', fg.overlay))
  const sep = s(bold.substring(0, 3) + '─'.repeat(55), fg.overlay)

  let output = `${topLine}\n${sep}\n  ${bottomLine}`

  // Add context bar if we have usage data
  if (contextUsed > 0) {
    const ctxTokens = contextMax * 1024
    output += '\n' + contextBar({ used: contextUsed, max: ctxTokens })
  }

  return output
}

// ── Session Info Bar ─────────────────────────────────────────────────────────

/**

Session bar showing current provider, model, and tool count */
export function sessionBar(provider: string, model: string, toolsCount: number): string {
  if (!isColorEnabled()) {
    return `${provider} | ${model} | ${toolsCount} tools`
  }

  return [
    s(icon.spark, fg.mauve),
    s(' ' + provider, fg.green),
    s(' │ ', fg.overlay),
    s(icon.code, fg.blue),
    s(' ' + model, fg.blue),
    s(' │ ', fg.overlay),
    s(icon.tool, fg.peach),
    s(' ' + toolsCount, fg.peach),
  ].join('')
}

// ── Tool Result Panel ────────────────────────────────────────────────────────

export interface ToolPanelOptions {
  title?: string
  titleColor?: string
  width?: number
}

/**
 * Panel wrapper for tool output
 */
export function toolPanel(content: string, opts: ToolPanelOptions = {}): string {
  if (!isColorEnabled()) return content

  const { width = 72 } = opts
  const b = box.round
  const lines = content.split('\n')
  const padded = lines.map(l => l.padEnd(width - 4))
  const top = s(`${b.tl} ${b.h.repeat(width - 2)} ${b.tr}`, fg.surface1)
  const bottom = s(`${b.bl} ${b.h.repeat(width - 2)} ${b.br}`, fg.surface1)
  const middle = padded.map(l => s(`${b.v} `, fg.surface1) + l + s(` ${b.v}`, fg.surface1)).join('\n')

  return `${top}\n${middle}\n${bottom}`
}

// ── Message Bubble ───────────────────────────────────────────────────────────

export interface MessageBubbleOptions {
  role: 'user' | 'assistant' | 'system'
  timestamp?: Date
}

/**
 * Styled message bubble
 */
export function messageBubble(content: string, opts: MessageBubbleOptions): string {
  if (!isColorEnabled()) {
    const prefix = opts.role === 'user' ? '> ' : opts.role === 'assistant' ? '◈ ' : '⚙ '
    return prefix + content
  }

  const { role } = opts
  let color = fg.secondary
  let prefix = icon.arrow + ' '

  if (role === 'user') {
    color = fg.green
    prefix = icon.arrow + ' '
  } else if (role === 'assistant') {
    color = fg.mauve
    prefix = icon.sparkles + ' '
  } else {
    color = fg.sapphire
    prefix = icon.info + ' '
  }

  return s(prefix, color) + s(content, fg.primary)
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K'
  }
  return String(n)
}

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec >= 60) {
    return Math.floor(sec / 60) + 'm ' + (sec % 60) + 's'
  }
  return sec + 's'
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}
