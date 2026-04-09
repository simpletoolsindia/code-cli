// Beast CLI - Output Formatters
// Structured output: boxes, tables, panels, cards

import { s, c, fg, bg, box, bold, italic } from './colors.ts'

// ── Box Drawing ────────────────────────────────────────────────────────────────

export function drawBox(content: string, options: {
  style?: 'single' | 'round' | 'heavy'
  title?: string
  width?: number
  padding?: number
  color?: string
} = {}): string {
  const { style = 'single', title, width = 60, padding = 1, color = fg.accent } = options
  const b = box[style]
  const pad = ' '.repeat(padding)

  const lines = content.split('\n')
  const topLine = title
    ? `${b.tl}${b.h.repeat(2)}${title}${b.h.repeat(width - title.length - 2)}${b.tr}`
    : `${b.tl}${b.h.repeat(width)}${b.tr}`
  const bottomLine = `${b.bl}${b.h.repeat(width)}${b.br}`

  let result = s(topLine, color) + '\n'
  for (const line of lines) {
    result += `${c.v}${pad}${line}${' '.repeat(Math.max(0, width - line.length - padding * 2))}${pad}${c.v}\n`
  }
  result += s(bottomLine, color)
  return result
}

// ── Panel (Bordered Container) ───────────────────────────────────────────────

export function panel(content: string, options: {
  title?: string
  titleColor?: string
  width?: number
} = {}): string {
  const { title, titleColor = fg.accent, width = 70 } = options
  const b = box.round

  // Simple split on newlines
  const rawLines = content.split('\n')
  const maxLen = rawLines.reduce((m, l) => Math.max(m, stripAnsi(l).length), 0)
  const w = Math.max(width, maxLen + 4)

  let result = b.tl + '─'.repeat(w) + b.tr + '\n'

  if (title) {
    const titleLen = stripAnsi(title).length
    const pad1 = Math.floor((w - titleLen) / 2)
    const pad2 = w - titleLen - pad1
    result += b.v + ' '.repeat(pad1) + title + ' '.repeat(pad2) + b.v + '\n'
    result += b.v + '─'.repeat(w) + b.v + '\n'
  }

  for (const ln of rawLines) {
    const len = stripAnsi(ln).length
    const pad = w - len - 2
    result += b.v + ' ' + ln + ' '.repeat(Math.max(0, pad)) + ' ' + b.v + '\n'
  }

  result += b.bl + '─'.repeat(w) + b.br
  return s(result, titleColor)
}

// ── Table Renderer ───────────────────────────────────────────────────────────

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
  style?: 'single' | 'round'
} = {}): string {
  const { maxWidth = 100, style = 'single' } = options
  const b = box[style]

  // Calculate widths if auto
  const colWidths = columns.map(c => c.width)
  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colWidths.length + 1

  // Build header
  let headerLine = b.v
  let sepLine = b.v
  columns.forEach((col, i) => {
    const cell = col.header.padEnd(col.width)
    headerLine += ` ${s(cell, fg.accent, bold)}${' '.repeat(col.width - stripAnsi(cell).length)} ${b.v}`
    sepLine += `${b.h.repeat(col.width + 2)}${b.v}`
  })
  headerLine += '\n' + sepLine + '\n'

  // Build rows
  let bodyLines = ''
  for (const row of rows) {
    let rowLine = b.v
    columns.forEach((col, i) => {
      const cell = (row.cells[i] || '').padEnd(col.width)
      rowLine += ` ${cell}${' '.repeat(col.width - stripAnsi(cell).length)} ${b.v}`
    })
    bodyLines += rowLine + '\n'
  }

  // Top/bottom
  const topLine = b.tl + colWidths.map(w => b.h.repeat(w + 2)).join(b.h) + b.tr + '\n'
  const botLine = b.bl + colWidths.map(w => b.h.repeat(w + 2)).join(b.h) + b.br

  return s(topLine, fg.muted) + headerLine + bodyLines + s(botLine, fg.muted)
}

// ── Inline List ───────────────────────────────────────────────────────────────

export function inlineList(items: Array<{ icon?: string; label: string; value: string }>, options: {
  iconColor?: string
  labelColor?: string
  valueColor?: string
  separator?: string
} = {}): string {
  const { iconColor = fg.accent, labelColor = fg.muted, valueColor = fg.primary, separator = ' · ' } = options
  return items.map(item => {
    const icon = item.icon ? s(item.icon + ' ', iconColor) : ''
    return icon + s(item.label, labelColor) + ': ' + s(item.value, valueColor)
  }).join(separator)
}

// ── Key-Value List ───────────────────────────────────────────────────────────

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

// ── Tool Result Card ─────────────────────────────────────────────────────────

export function toolCard(name: string, result: string, options: {
  maxLines?: number
  maxWidth?: number
  collapsed?: boolean
} = {}): string {
  const { maxLines = 8, maxWidth = 80, collapsed = false } = options

  const header = `${s(icon.tool, fg.tool)} ${s(name, fg.tool, bold)}`
  const lines = result.split('\n').slice(0, maxLines)
  const truncated = result.split('\n').length > maxLines
  const content = lines.join('\n') + (truncated ? '\n...' : '')

  return `${header}\n${s('┌' + '─'.repeat(Math.min(maxWidth - 2, stripAnsi(content.split('\n')[0]).length + 4)) + '┐', fg.muted)}\n` +
    lines.map(l => `  ${l}`).join('\n') + '\n' +
    s('└' + '─'.repeat(Math.min(maxWidth - 2, stripAnsi(lines[lines.length - 1]).length + 4)) + '┘', fg.muted)
}

// ── Markdown Code Block ───────────────────────────────────────────────────────

export function codeBlock(code: string, language?: string): string {
  const lang = language ? s(` ${language} `, fg.muted, italic) : ''
  return s('┌', fg.cyan) + '─'.repeat(50) + lang + s('┐', fg.cyan) + '\n' +
    code.split('\n').map(l => s('│', fg.cyan) + ' ' + s(l, fg.code) + ' '.repeat(Math.max(0, 48 - l.length)) + s('│', fg.cyan)).join('\n') + '\n' +
    s('└', fg.cyan) + '─'.repeat(50) + '─'.repeat(stripAnsi(lang)) + s('┘', fg.cyan)
}

// ── Status Badge ─────────────────────────────────────────────────────────────

export function badge(text: string, variant: 'success' | 'error' | 'warning' | 'info' | 'muted' = 'muted'): string {
  const colors: Record<string, string> = {
    success: fg.success,
    error: fg.error,
    warning: fg.warning,
    info: fg.info,
    muted: fg.muted,
  }
  const color = colors[variant]
  return s('[' + text + ']', color)
}

// ── Progress Bar ────────────────────────────────────────────────────────────

export function progressBar(current: number, total: number, width = 30): string {
  const filled = Math.round((current / total) * width)
  const empty = width - filled
  return s('█'.repeat(filled), fg.success) + s('░'.repeat(empty), fg.muted)
}

// ── Help Panel ────────────────────────────────────────────────────────────────

export function helpPanel(commands: Array<{ cmd: string; desc: string; shortcut?: string }>): string {
  const maxCmd = Math.max(...commands.map(c => stripAnsi(c.cmd).length), 4)
  return commands.map(({ cmd, desc, shortcut }) => {
    const shortcutStr = shortcut ? s(` (${shortcut})`, fg.muted, italic) : ''
    return `  ${s(cmd.padEnd(maxCmd + 2), fg.accent)}${desc}${shortcutStr}`
  }).join('\n')
}

// ── ANSI Strip Utility ──────────────────────────────────────────────────────

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

// ── Truncate with Ellipsis ───────────────────────────────────────────────────

export function truncate(text: string, maxWidth: number): string {
  const stripped = stripAnsi(text)
  if (stripped.length <= maxWidth) return text
  return text.slice(0, maxWidth - 3) + '...'
}

// ── Conversation Turn ────────────────────────────────────────────────────────

export function conversationTurn(role: 'user' | 'assistant' | 'tool', content: string): string {
  const icons: Record<string, string> = {
    user: s(icon.prompt, fg.user),
    assistant: '🤖',
    tool: s(icon.tool, fg.tool),
  }
  const colors: Record<string, string> = {
    user: fg.user,
    assistant: fg.assistant,
    tool: fg.tool,
  }

  if (role === 'user') {
    return `${icons.user} ${s(content, fg.primary)}`
  }

  return `\n${panel(content, { title: icons[role] + ' Response', titleColor: colors[role], width: 70 })}\n`
}
