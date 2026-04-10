// Beast CLI - Output Formatters (Clean)
// Structured output: panels, tables, cards, badges

import { s, fg, bg, bold, italic, isColorEnabled, supportsUnicode, getBoxChars } from './colors.ts'

// ── ANSI Strip Utility ───────────────────────────────────────────────────────
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

// ── Box Drawing ───────────────────────────────────────────────────────────────
export function drawBox(content: string, options: {
  style?: 'single' | 'round' | 'heavy'
  title?: string
  width?: number
  padding?: number
  color?: string
} = {}): string {
  const { title, width = 60, padding = 1, color = fg.accent } = options
  const pad = ' '.repeat(padding)

  const lines = content.split('\n')
  const topLine = title
    ? `+== ${title}${'='.repeat(Math.max(0, width - title.length - 4))}+`
    : `+${'='.repeat(width)}+`
  const bottomLine = `+${'='.repeat(width)}+`
  const midLine = `+${' '.repeat(width - 2)}+`

  let result = s(topLine, color) + '\n'
  for (const line of lines) {
    result += `|${pad}${line}${' '.repeat(Math.max(0, width - stripAnsi(line).length - padding * 2))}${pad}|\n`
  }
  result += s(bottomLine, color)
  return result
}

// ── Polished Panel (with accent border and depth) ───────────────────────────
export function panel(content: string, options: {
  title?: string
  titleColor?: string
  width?: number
  useBox?: boolean
} = {}): string {
  const { title, titleColor = fg.accent, width = 70, useBox = true } = options

  const rawLines = content.split('\n')
  const maxLen = rawLines.reduce((m, l) => Math.max(m, stripAnsi(l).length), 0)
  const w = Math.max(width, maxLen + 4)

  // Use box drawing or ASCII based on terminal capability
  if (useBox) {
    const b = getBoxChars()
    const h = b?.h || '-'
    const v = b?.v || '|'
    const tl = b?.tl || '+'
    const tr = b?.tr || '+'
    const bl = b?.bl || '+'
    const br = b?.br || '+'
    let result = `${tl}${h.repeat(w)}${tr}\n`

    if (title) {
      const titleLen = stripAnsi(title).length
      const pad1 = Math.floor((w - titleLen) / 2)
      const pad2 = w - titleLen - pad1
      result += `${v}${' '.repeat(pad1)}${title}${' '.repeat(pad2)}${v}\n`
      result += `${v}${h.repeat(w)}${v}\n`
    }

    for (const ln of rawLines) {
      const len = stripAnsi(ln).length
      const pad = w - len
      result += `${v} ${ln}${' '.repeat(Math.max(0, pad - 1))} ${v}\n`
    }

    result += `${bl}${h.repeat(w)}${br}`
    return s(result, titleColor)
  }

  // ASCII fallback
  let result = `+${'-'.repeat(w)}+\n`

  if (title) {
    const titleLen = stripAnsi(title).length
    const pad1 = Math.floor((w - titleLen) / 2)
    const pad2 = w - titleLen - pad1
    result += `|${' '.repeat(pad1)}${title}${' '.repeat(pad2)}|\n`
    result += `|${'-'.repeat(w)}|\n`
  }

  for (const ln of rawLines) {
    const len = stripAnsi(ln).length
    const pad = w - len - 2
    result += `| ${ln}${' '.repeat(Math.max(0, pad))} |\n`
  }

  result += `+${'-'.repeat(w)}+`
  return s(result, titleColor)
}

// ── Polished Table ────────────────────────────────────────────────────────────
interface TableColumn {
  header: string
  width: number
  align?: 'left' | 'center' | 'right'
}

interface TableRow {
  cells: string[]
}

export function renderTable(columns: TableColumn[], rows: TableRow[], options: {
  maxWidth?: number
  style?: 'single' | 'round' | 'polished'
} = {}): string {
  const colWidths = columns.map(c => c.width)

  // Polished: accent color for headers, ASCII-safe
  let headerLine = '|'
  let sepLine = '|'
  columns.forEach((col, i) => {
    const cell = col.header.padEnd(col.width)
    headerLine += ` ${s(cell, fg.accent, bold)}${' '.repeat(col.width - stripAnsi(cell).length)} |`
    sepLine += `${'-'.repeat(col.width + 2)}|`
  })
  headerLine += '\n' + sepLine + '\n'

  let bodyLines = ''
  for (const row of rows) {
    let rowLine = '|'
    columns.forEach((col, i) => {
      const cell = (row.cells[i] || '').padEnd(col.width)
      rowLine += ` ${cell}${' '.repeat(col.width - stripAnsi(cell).length)} |`
    })
    bodyLines += rowLine + '\n'
  }

  const topLine = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+\n'
  const botLine = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+'

  return s(topLine, fg.muted) + headerLine + bodyLines + s(botLine, fg.muted)
}

// ── Polished Inline Status Indicator ────────────────────────────────────────
// Like polpo.sh's status dots: online/offline/busy indicators
export function inlineStatus(label: string, value: string, status?: 'success' | 'warning' | 'error' | 'info'): string {
  const dotColors = { success: fg.success, warning: fg.warning, error: fg.error, info: fg.sapphire }
  const dot = status ? s('●', dotColors[status]) + ' ' : ''
  return dot + s(label + ':', fg.muted) + ' ' + s(value, fg.primary)
}

// ── Polished Inline List ──────────────────────────────────────────────────────
export function inlineList(items: Array<{ icon?: string; label: string; value: string }>, options: {
  iconColor?: string
  labelColor?: string
  valueColor?: string
  separator?: string
} = {}): string {
  const { iconColor = fg.accent, labelColor = fg.muted, valueColor = fg.primary, separator = '  ' } = options
  return items.map(item => {
    const icon = item.icon ? s(item.icon + ' ', iconColor) : ''
    return icon + s(item.label, labelColor) + ': ' + s(item.value, valueColor)
  }).join(separator)
}

// ── Key-Value List ─────────────────────────────────────────────────────────────
export function kvList(items: Array<{ key: string; value: string }>, options: {
  keyWidth?: number
  indent?: number
} = {}): string {
  const { keyWidth = 12, indent = 2 } = options
  const prefix = ' '.repeat(indent)
  return items.map(({ key, value }) =>
    prefix + s(key.padEnd(keyWidth), fg.muted) + s(value, fg.primary)
  ).join('\n')
}

// ── Polished Tool Result Card ────────────────────────────────────────────────
export function toolCard(name: string, result: string, options: {
  maxLines?: number
  maxWidth?: number
  collapsed?: boolean
} = {}): string {
  const { maxLines = 8, maxWidth = 80, collapsed = false } = options

  // Polished: accent color for tool header
  const header = `${s('› ', fg.tool)}${s(name, fg.tool, bold)}`
  const lines = result.split('\n').slice(0, maxLines)
  const truncated = result.split('\n').length > maxLines
  const content = lines.join('\n') + (truncated ? '\n...' : '')

  const lineW = Math.min(maxWidth - 2, stripAnsi(content.split('\n')[0]).length + 4)
  return `${header}\n${s('+' + '-'.repeat(lineW) + '+', fg.accent)}\n` +
    lines.map(l => `  ${l}`).join('\n') + '\n' +
    s('+' + '-'.repeat(lineW) + '+', fg.accent)
}

// ── Code Block ────────────────────────────────────────────────────────────────
export function codeBlock(code: string, language?: string): string {
  const lang = language ? s(` ${language} `, fg.muted, italic) : ''
  const w = 50
  return s('+', fg.cyan) + '-'.repeat(w) + lang + s('+', fg.cyan) + '\n' +
    code.split('\n').map(l =>
      s('|', fg.cyan) + ' ' + s(l, fg.code) + ' '.repeat(Math.max(0, w - l.length)) + s('|', fg.cyan)
    ).join('\n') + '\n' +
    s('+', fg.cyan) + '-'.repeat(w) + '-'.repeat(stripAnsi(lang).length) + s('+', fg.cyan)
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function badge(text: string, variant: 'success' | 'error' | 'warning' | 'info' | 'muted' = 'muted'): string {
  const colors: Record<string, string> = {
    success: fg.success,
    error: fg.error,
    warning: fg.warning,
    info: fg.info,
    muted: fg.muted,
  }
  return s('[' + text + ']', colors[variant])
}

// ── Polished Progress Bar ────────────────────────────────────────────────────
export function progressBar(current: number, total: number, width = 30): string {
  const filled = Math.round((current / total) * width)
  const empty = width - filled
  // Polished: gradient-style color transition
  const pct = total > 0 ? current / total : 0
  let barColor = fg.success
  if (pct > 0.5) barColor = fg.sapphire
  if (pct > 0.8) barColor = fg.warning
  return s('█'.repeat(filled), barColor) + s('░'.repeat(empty), fg.muted)
}

// ── Loading Progress ───────────────────────────────────────────────────────────
export interface ProgressState {
  label: string
  current: number
  total: number
  width?: number
}

export function renderProgress(state: ProgressState): string {
  const { label, current, total, width = 24 } = state
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const filled = Math.round((current / Math.max(total, 1)) * width)
  const empty = width - filled

  let barColor = fg.success
  if (pct > 50) barColor = fg.accent
  if (pct > 80) barColor = fg.warning

  const bar = s('█'.repeat(filled), barColor) + s('░'.repeat(empty), fg.muted)
  const pctStr = s(`${pct}%`, barColor)
  const labelStr = s(label, fg.secondary)

  return `${labelStr} ${bar} ${pctStr}`
}

// Animated progress bar for async operations
export async function withProgress<T>(
  label: string,
  promise: Promise<T>,
  onTick?: (elapsed: number) => void
): Promise<T> {
  const start = Date.now()
  let ticks = 0

  const ticker = setInterval(() => {
    const elapsed = Date.now() - start
    const estimated = Math.min(1, elapsed / 10000)
    ticks++
    const pct = Math.round(estimated * 100)
    const filled = Math.round(estimated * 24)
    const barColor = pct > 80 ? fg.warning : pct > 50 ? fg.accent : fg.success
    const bar = s('█'.repeat(filled), barColor) + s('░'.repeat(24 - filled), fg.muted)
    process.stderr.write(`\r  ${s(label, fg.secondary)} ${bar} ${s(pct + '%', barColor)}   `)
    if (onTick) onTick(elapsed)
  }, 300)

  try {
    const result = await promise
    clearInterval(ticker)
    process.stderr.write('\r' + ' '.repeat(60) + '\r')
    process.stderr.write(s('✓ ', fg.success) + s(label, fg.secondary) + '\n')
    return result
  } catch (e) {
    clearInterval(ticker)
    process.stderr.write('\r' + ' '.repeat(60) + '\r')
    process.stderr.write(s('✗ ', fg.error) + s(label, fg.secondary) + '\n')
    throw e
  }
}

// ── Polished Help Panel ──────────────────────────────────────────────────────
export function helpPanel(commands: Array<{ cmd: string; desc: string; shortcut?: string }>): string {
  const maxCmd = Math.max(...commands.map(c => stripAnsi(c.cmd).length), 4)
  return commands.map(({ cmd, desc, shortcut }) => {
    const shortcutStr = shortcut ? s(` (${shortcut})`, fg.muted, italic) : ''
    // Polished: accent color for commands, primary for descriptions
    return `  ${s(cmd.padEnd(maxCmd + 2), fg.accent)}${s(desc, fg.primary)}${shortcutStr}`
  }).join('\n')
}

// ── Truncate ─────────────────────────────────────────────────────────────────
export function truncate(text: string, maxWidth: number): string {
  const stripped = stripAnsi(text)
  if (stripped.length <= maxWidth) return text
  return text.slice(0, maxWidth - 3) + '...'
}

// ── Conversation Turn (Clean — like Gemini CLI) ───────────────────────────────
// User: "> message"  |  Assistant: "🤖 message"  |  Tool: "🔧 tool_name"
export function conversationTurn(role: 'user' | 'assistant' | 'tool', content: string): string {
  if (role === 'user') {
    return `${s('› ', fg.green)}${s(content, fg.primary)}`
  }

  // Assistant and tool use panel with clean prefix
  const icons: Record<string, string> = {
    assistant: s('🤖', fg.mauve),
    tool: s('🔧', fg.tool),
  }
  const colors: Record<string, string> = {
    assistant: fg.assistant,
    tool: fg.tool,
  }

  return `\n${panel(content, {
    title: `${icons[role]} ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    titleColor: colors[role],
    width: 70,
  })}\n`
}
