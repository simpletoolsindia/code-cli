// Beast CLI - Minimal Header
// Replaces 8-line ASCII art with 2-line compact header

import { s, c, fg, icon, box, bold } from './colors.ts'

export interface HeaderConfig {
  version: string
  provider: string
  model: string
  toolsCount: number
}

export function renderHeader(config: HeaderConfig): string {
  const { version, provider, model, toolsCount } = config
  const b = box.single

  const parts = [
    s(icon.dragon + ' Beast CLI', fg.accent, bold),
    s('v' + version, fg.muted),
    '│',
    s(icon.online + ' ' + provider, fg.success),
    '│',
    s(model, fg.cyan),
    '│',
    s(icon.tool + ' ' + toolsCount + ' tools', fg.warning),
  ]

  const line = parts.join('  ')
  const width = Math.min(80, stripAnsi(line).length + 10)
  const sep = s(b.h.repeat(width), fg.muted)

  return `${line}\n${sep}`
}

export function renderCompactHeader(config: HeaderConfig): string {
  const { version, provider, model } = config
  return `${s('🐉', fg.accent)} ${s('Beast', fg.bold, fg.accent)} CLI ${s('v' + version, fg.muted)}  │  ${s(provider, fg.success)}  │  ${s(model, fg.cyan)}`
}

// ── Context Usage Bar ─────────────────────────────────────────────────────────

export interface ContextStats {
  used: number       // tokens used in current conversation
  max: number        // max context window in tokens
}

export function contextBar(stats: ContextStats): string {
  const { used, max } = stats
  const width = 20
  const pct = Math.min(1, used / max)
  const filled = Math.round(pct * width)
  const empty = width - filled

  // Color based on usage level
  let barColor = fg.success
  if (pct > 0.75) barColor = fg.warning
  if (pct > 0.90) barColor = fg.error

  const bar = s('█'.repeat(filled), barColor) + s('░'.repeat(empty), fg.muted)
  const pctStr = s(`${Math.round(pct * 100)}%`, barColor)
  const usedStr = s(formatTokens(used), fg.muted)
  const maxStr = s(formatTokens(max), fg.secondary)

  return `  ${s('🧠', fg.secondary)} ${bar} ${pctStr} ${s('(', fg.muted)}${usedStr}${s('/', fg.muted)}${maxStr}${s(')', fg.muted)}`
}

// ── Status Footer ────────────────────────────────────────────────────────────

export interface FooterStats {
  messages: number
  tokens: number
  duration?: number
  contextMax?: number
  contextUsed?: number
}

export function renderFooter(stats: FooterStats): string {
  const { messages, tokens, duration, contextMax = 32, contextUsed = 0 } = stats

  const parts: string[] = []

  parts.push(s(icon.messages + ' ' + messages, fg.secondary))
  parts.push(s(icon.tokens + ' ' + formatTokens(tokens), fg.secondary))
  if (duration) {
    parts.push(s(icon.time + ' ' + formatDuration(duration), fg.secondary))
  }
  parts.push(s(icon.context + ' ' + contextMax + 'K ctx', fg.secondary))

  const shortcuts = [
    s('/help', fg.accent),
    'exit',
    s('↑↓', fg.accent),
    'history',
    s('Tab', fg.accent),
    'tools',
  ]

  const footer = `${parts.join('  ·  ')}\n${s('─'.repeat(60), fg.muted)}\n  [${shortcuts.join(' · ')}]`

  // Add context bar if we have usage data
  if (contextUsed > 0) {
    const ctxTokens = contextMax * 1024
    return footer + '\n' + contextBar({ used: contextUsed, max: ctxTokens })
  }

  return footer
}

// ── Session Info Bar ─────────────────────────────────────────────────────────

export function sessionBar(provider: string, model: string, toolsCount: number): string {
  const sep = s(' │ ', fg.muted)
  return [
    s('🐉', fg.accent),
    s(provider, fg.success),
    s(model, fg.cyan),
    s(icon.tool + ' ' + toolsCount, fg.warning),
  ].join(sep)
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
