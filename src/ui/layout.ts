// Beast CLI - UI Layout Components (Clean)
// Modern terminal UI — clean headers, footers, status bars

import { s, fg, icon, box, bold, dim, progress, isColorEnabled, getBoxChars } from './colors.ts'

// ── Header ────────────────────────────────────────────────────────────────────
export interface HeaderConfig {
  version: string
  provider: string
  model: string
  toolsCount: number
}

// Full header: [Logo] [Version] | [Provider] | [Model] | [Tools]
// Polished header: Google brand colors + consistent spacing
export function renderHeader(config: HeaderConfig): string {
  if (!isColorEnabled()) {
    return `BEAST CLI v${config.version} | ${config.provider} | ${config.model}`
  }

  const { version, provider, model, toolsCount } = config
  // Use getBoxChars() which has Unicode fallback
  const b = getBoxChars().round
  const h = b?.h || '-' // Fallback horizontal line
  const tl = b?.tl || '+'
  const tr = b?.tr || '+'
  const gpPurple = '\x1b[38;2;142;54;255m'
  const gpBlue = '\x1b[38;2;70;130;255m'

  // Polished: Google brand gradient, consistent spacing, clear hierarchy
  const line = [
    s(`${tl} `, gpPurple),
    s('🐉', gpPurple),
    s(' Beast ', gpPurple, bold),
    s('CLI', gpBlue, bold),
    s(` v${version}`, fg.muted),
    s(` ${h} `, gpPurple),
    s(icon.check + ' ', fg.success),
    s(provider, fg.success),
    s(` ${h} `, gpPurple),
    s(icon.code + ' ', gpBlue),
    s(model, gpBlue),
    s(` ${h} `, gpPurple),
    s(icon.tool + ' ', fg.peach),
    s(`${toolsCount} tools`, fg.peach),
    s(` ${h}${tr}`, gpPurple),
  ].join('')

  return line
}

// Compact single-line header
export function renderCompactHeader(config: HeaderConfig): string {
  if (!isColorEnabled()) {
    return `BEAST CLI v${config.version} | ${config.provider}`
  }

  const { version, provider, model } = config
  const gpPurple = '\x1b[38;2;142;54;255m'
  const gpBlue = '\x1b[38;2;70;130;255m'
  return [
    s('🐉', gpPurple),
    s(' BEAST ', gpPurple, bold),
    s('CLI', gpBlue, bold),
    s(` v${version}`, fg.muted),
    s(' · ', fg.overlay),
    s(provider, fg.green),
    s(' · ', fg.overlay),
    s(model, gpBlue),
  ].join('')
}

// ── Context Usage Bar ─────────────────────────────────────────────────────────
export interface ContextStats {
  used: number
  max: number
}

// Clean context bar: [▓▓▓▓░░░░░░░░░] 45% (18K / 32K)
// Polished context bar: gradient color for usage levels
export function contextBar(stats: ContextStats): string {
  const { used, max } = stats
  const width = 16
  const pct = Math.min(1, used / max)
  const filled = Math.round(pct * width)
  const empty = width - filled

  // Polished: gradient-style color transition based on usage
  let barColor = fg.success
  if (pct > 0.75) barColor = fg.sapphire
  if (pct > 0.90) barColor = fg.warning

  const bar = s('█'.repeat(filled), barColor) + s('░'.repeat(empty), fg.overlay)
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

// Compact: ⚡ 1,234 tokens (p: 500  c: 734)
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

// ── Footer ─────────────────────────────────────────────────────────────────────
export interface FooterStats {
  messages: number
  tokens: number
  duration?: number
  contextMax?: number
  contextUsed?: number
}

// Footer: [messages] · [tokens] · [time] · [context]   [/help] · [/tools] · [/exit] · [↑↓ history]
// Polished footer with consistent spacing rhythm
export function renderFooter(stats: FooterStats): string {
  if (!isColorEnabled()) {
    const parts = [`${stats.messages} msgs`, `${stats.tokens} tokens`]
    if (stats.duration) parts.push(formatDuration(stats.duration))
    return parts.join(' | ') + ' | /help /exit'
  }

  const { messages, tokens, duration, contextMax = 32, contextUsed = 0 } = stats

  // Polished: consistent dot separator, balanced layout
  const parts: string[] = []
  parts.push(s(icon.messages + ' ' + messages, fg.muted))
  parts.push(s(icon.tokens + ' ' + formatTokens(tokens), fg.muted))
  if (duration) {
    parts.push(s(icon.clock + ' ' + formatDuration(duration), fg.muted))
  }
  parts.push(s(icon.context + ' ' + contextMax + 'K', fg.muted))

  const shortcuts = [
    s('/help', fg.accent),
    s('/tools', fg.accent),
    s('/clear', fg.accent),
    s('/exit', fg.accent),
    s('↑↓', fg.sapphire),
    s('history', fg.overlay),
  ]

  const topLine = parts.join(s(' · ', fg.overlay))
  const bottomLine = shortcuts.join(s(' · ', fg.overlay))
  const sep = s('─'.repeat(55), fg.overlay)

  let output = `${topLine}\n${sep}\n  ${bottomLine}`

  if (contextUsed > 0) {
    const ctxTokens = contextMax * 1024
    output += '\n' + contextBar({ used: contextUsed, max: ctxTokens })
  }

  return output
}

// ── Session Info Bar ──────────────────────────────────────────────────────────
export function sessionBar(provider: string, model: string, toolsCount: number): string {
  if (!isColorEnabled()) {
    return `${provider} | ${model} | ${toolsCount} tools`
  }

  const gpPurple = '\x1b[38;2;142;54;255m'
  return [
    s('🐉', gpPurple),
    s(' ' + provider, fg.green),
    s(' · ', fg.overlay),
    s(icon.code, fg.blue),
    s(' ' + model, fg.blue),
    s(' · ', fg.overlay),
    s(icon.tool, fg.peach),
    s(' ' + toolsCount, fg.peach),
  ].join('')
}

// ── Tool Panel ────────────────────────────────────────────────────────────────
export interface ToolPanelOptions {
  title?: string
  titleColor?: string
  width?: number
}

export function toolPanel(content: string, opts: ToolPanelOptions = {}): string {
  if (!isColorEnabled()) return content

  const { width = 72 } = opts
  // Use getBoxChars() which has Unicode fallback
  const b = getBoxChars().round
  const h = b?.h || '-' // Fallback horizontal line
  const lines = content.split('\n')
  const padded = lines.map(l => l.padEnd(width - 4))
  const top = s(`${b?.tl || '+'} ${h.repeat(width - 2)} ${b?.tr || '+'}`, fg.surface1)
  const bottom = s(`${b?.bl || '+'} ${h.repeat(width - 2)} ${b?.br || '+'}`, fg.surface1)
  const v = b?.v || '|'
  const middle = padded.map(l => s(`${v} `, fg.surface1) + l + s(` ${v}`, fg.surface1)).join('\n')

  return `${top}\n${middle}\n${bottom}`
}

// ── Message Bubble (Clean — "> " prefix style) ────────────────────────────────
export interface MessageBubbleOptions {
  role: 'user' | 'assistant' | 'system'
  timestamp?: Date
}

export function messageBubble(content: string, opts: MessageBubbleOptions): string {
  if (!isColorEnabled()) {
    const prefix = opts.role === 'user' ? '> ' : opts.role === 'assistant' ? '◈ ' : '› '
    return prefix + content
  }

  const { role } = opts
  let color = fg.secondary
  let prefix = icon.arrow + ' '

  if (role === 'user') {
    color = fg.green
    prefix = icon.userPrefix + ' '
  } else if (role === 'assistant') {
    color = fg.mauve
    prefix = icon.aiPrefix + ' '
  } else {
    color = fg.sapphire
    prefix = icon.tool + ' '
  }

  return s(prefix, color) + s(content, fg.primary)
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTokens(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec >= 60) return Math.floor(sec / 60) + 'm ' + (sec % 60) + 's'
  return sec + 's'
}
