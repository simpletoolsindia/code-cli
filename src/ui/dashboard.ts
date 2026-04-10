// Beast CLI - Dashboard TUI Components
// Inspired by: k9s (breadcrumb nav), btop++ (expandable), gh-dash (context), WTF (modules)

import { s, fg, icon, box, bold, dim, mocha, isColorEnabled, progress } from './colors.ts'

// ── Dashboard Widget Container ───────────────────────────────────────────────

export interface WidgetOptions {
  title?: string
  titleColor?: string
  width?: number
  height?: number
  borderStyle?: 'round' | 'single' | 'heavy' | 'soft'
  collapsible?: boolean
}

/**
 * Create a widget/panel container (like k9s/bottom widgets)
 */
export function widget(content: string, opts: WidgetOptions = {}): string {
  if (!isColorEnabled()) return content

  const {
    title,
    width = 60,
    borderStyle = 'soft',
    collapsible = false
  } = opts

  const b = box[borderStyle]
  const topLine = s(`${b.tl} ${b.h.repeat(width - 2)} ${b.tr}`, fg.surface1)

  if (!title) {
    const bottom = s(`${b.bl} ${b.h.repeat(width - 2)} ${b.br}`, fg.surface1)
    return `${topLine}\n${content}\n${bottom}`
  }

  const titleLine = [
    s(`${b.tl} `, fg.surface1),
    s(title, opts.titleColor || fg.blue, bold),
    s(` ${b.h.repeat(Math.max(0, width - title.length - 4))} ${b.tr}`, fg.surface1),
  ].join('')

  const bottom = s(`${b.bl} ${b.h.repeat(width - 2)} ${b.br}`, fg.surface1)

  return `${titleLine}\n${content}\n${bottom}`
}

// ── Status Panel (k9s-inspired) ─────────────────────────────────────────────────

export interface StatusPanelOptions {
  items: Array<{ label: string; value: string; status?: 'ok' | 'warn' | 'error' }>
  columns?: number
}

/**
 * Status panel with colored indicators (like k9s resource view)
 */
export function statusPanel(opts: StatusPanelOptions): string {
  const { items, columns = 3 } = opts
  if (!isColorEnabled()) {
    return items.map(i => `${i.label}: ${i.value}`).join('\n')
  }

  const lines: string[] = []
  for (let i = 0; i < items.length; i += columns) {
    const row = items.slice(i, i + columns)
    const rowParts = row.map(item => {
      const statusIcon = item.status === 'ok' ? s(icon.success, fg.green)
        : item.status === 'warn' ? s(icon.warning, fg.yellow)
        : item.status === 'error' ? s(icon.error, fg.red)
        : s(icon.check, fg.overlay)

      const value = item.status ? s(item.value, getStatusColor(item.status))
        : s(item.value, fg.text)

      return `${statusIcon} ${s(item.label + ':', fg.muted)} ${value}`
    })
    lines.push(rowParts.join(s('   ', fg.overlay)))
  }

  return lines.join('\n')
}

function getStatusColor(status: 'ok' | 'warn' | 'error'): string {
  return status === 'ok' ? fg.green : status === 'warn' ? fg.yellow : fg.red
}

// ── Progress Graph (btop++ inspired) ──────────────────────────────────────────

export interface GraphOptions {
  data: number[]
  width?: number
  height?: number
  color?: string
  min?: number
  max?: number
}

/**
 * ASCII graph visualization (like btop++ network graphs)
 */
export function graph(opts: GraphOptions): string {
  const { data, width = 30, color, min: minVal, max: maxVal } = opts

  if (!data.length) return s('─'.repeat(width), fg.overlay)

  const min = minVal ?? Math.min(...data)
  const max = maxVal ?? Math.max(...data)
  const range = max - min || 1

  const normalized = data.map(v => ((v - min) / range) * (width - 1))
  const colorCode = color || (isColorEnabled() ? fg.mauve : '')

  let line = ''
  for (let i = 0; i < width; i++) {
    const idx = Math.floor((i / (width - 1)) * (data.length - 1))
    const value = normalized[idx]

    if (value >= width - 1 - i) {
      line += s('█', colorCode as any)
    } else if (value >= width - 2 - i) {
      line += s('▄', colorCode as any)
    } else {
      line += s(' ', fg.overlay)
    }
  }

  return line
}

// ── Breadcrumb Navigation (k9s-inspired) ─────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  active?: boolean
}

/**
 * Breadcrumb navigation like k9s cluster view
 */
export function breadcrumb(items: BreadcrumbItem[]): string {
  if (!isColorEnabled()) {
    return items.map(i => i.label).join(' > ')
  }

  const parts = items.map((item, idx) => {
    const sep = idx > 0 ? s(' › ', fg.overlay) : ''
    const label = item.active ? s(item.label, fg.mauve, bold)
      : s(item.label, fg.overlay)
    return sep + label
  })

  return parts.join('')
}

// ── Table View (htop/btop inspired) ───────────────────────────────────────────

export interface TableColumn {
  header: string
  width: number
  align?: 'left' | 'right' | 'center'
}

export interface TableRow {
  cells: string[]
  highlight?: boolean
  status?: 'ok' | 'warn' | 'error'
}

/**
 * Render a table with aligned columns (like htop process list)
 */
export function table(columns: TableColumn[], rows: TableRow[]): string {
  if (!isColorEnabled()) {
    const header = columns.map(c => c.header.padEnd(c.width)).join(' | ')
    const separator = columns.map(c => '─'.repeat(c.width)).join('-+-')
    const data = rows.map(r => r.cells.map((c, i) => c.toString().padEnd(columns[i].width)).join(' | '))
    return [header, separator, ...data].join('\n')
  }

  // Header
  const headerParts = columns.map(col => {
    const padded = col.header.padEnd(col.width)
    return s(padded, fg.accent, bold)
  })
  const headerLine = headerParts.join(s(' │ ', fg.surface2))

  // Separator
  const sepParts = columns.map(col => s('─'.repeat(col.width), fg.surface2))
  const sepLine = sepParts.join(s('─┼─', fg.surface2))

  // Rows
  const dataLines = rows.map(row => {
    const cells = row.cells.map((cell, idx) => {
      const col = columns[idx]
      const padded = col.align === 'right'
        ? cell.toString().padStart(col.width)
        : col.align === 'center'
          ? cell.toString().padBoth(col.width)
          : cell.toString().padEnd(col.width)

      let cellColor = row.highlight ? fg.accent : fg.text
      if (row.status) cellColor = getStatusColor(row.status)

      return s(padded, cellColor)
    })
    return cells.join(s(' │ ', fg.surface2))
  })

  return [headerLine, sepLine, ...dataLines].join('\n')
}

String.prototype.padBoth = function(width: number): string {
  const pad = Math.max(0, width - this.length)
  const padLeft = Math.floor(pad / 2)
  const padRight = pad - padLeft
  return ' '.repeat(padLeft) + this + ' '.repeat(padRight)
}

// ── Collapsible Section (btop++ inspired) ────────────────────────────────────

export interface CollapsibleSection {
  title: string
  content: string
  expanded?: boolean
}

/**
 * Expandable/collapsible section like btop++ menu
 */
export function collapsibleSection(section: CollapsibleSection): string {
  if (!isColorEnabled()) {
    return `[${section.expanded ? '-' : '+'}] ${section.title}\n${section.content}`
  }

  const expandIcon = section.expanded ? s('▼', fg.accent) : s('▶', fg.overlay)
  const title = s(section.title, section.expanded ? fg.accent : fg.overlay, bold)

  if (!section.expanded) {
    return `${expandIcon} ${title}`
  }

  const content = section.content.split('\n')
    .map((line, idx) => idx === 0 ? s(`  ${line}`, fg.text) : s(`  ${line}`, fg.muted))
    .join('\n')

  return `${expandIcon} ${title}\n${content}`
}

// ── Streaming Log View (k9s/lazydocker inspired) ─────────────────────────────

export interface LogLine {
  timestamp?: string
  level?: 'info' | 'warn' | 'error' | 'debug'
  content: string
}

/**
 * Styled log output like k9s logs view
 */
export function logView(lines: LogLine[], maxLines = 20): string {
  if (!isColorEnabled()) {
    return lines.slice(0, maxLines)
      .map(l => l.timestamp ? `[${l.timestamp}] ${l.content}` : l.content)
      .join('\n')
  }

  return lines.slice(0, maxLines).map(line => {
    const ts = line.timestamp ? s(`[${line.timestamp}] `, fg.overlay) : ''
    const level = line.level ? s(`[${line.level.toUpperCase()}] `, getLevelColor(line.level)) : ''
    const content = s(line.content, getLevelColor(line.level))
    return ts + level + content
  }).join('\n')
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'error': return fg.red
    case 'warn': return fg.yellow
    case 'debug': return fg.muted
    default: return fg.text
  }
}

// ── Module Grid (WTF inspired) ───────────────────────────────────────────────

export interface ModuleConfig {
  title: string
  content: string
  width: number
}

/**
 * Grid layout for dashboard modules (like WTF)
 */
export function moduleGrid(modules: ModuleConfig[], columns = 2): string {
  const lines: string[] = []
  const rows: ModuleConfig[][] = []

  for (let i = 0; i < modules.length; i += columns) {
    rows.push(modules.slice(i, i + columns))
  }

  for (const row of rows) {
    const rowLines: string[] = []

    for (const mod of row) {
      const lines = mod.content.split('\n')
      rowLines.push(...lines)
    }

    // Pad shorter modules
    const maxHeight = Math.max(...row.map(m => m.content.split('\n').length))
    for (let i = 0; i < row.length; i++) {
      const modLines = row[i].content.split('\n')
      while (modLines.length < maxHeight) {
        modLines.push('')
      }
      row[i] = { ...row[i], content: modLines.join('\n') }
    }
  }

  // Render each module with border
  for (const mod of modules) {
    const bordered = widget(mod.content, { title: mod.title, width: mod.width })
    lines.push(bordered)
  }

  return lines.join('\n')
}

// ── Search/Filter Bar ─────────────────────────────────────────────────────────

export interface SearchBarOptions {
  placeholder?: string
  value?: string
  results?: number
}

/**
 * Search bar with results count (like gh-dash)
 */
export function searchBar(opts: SearchBarOptions = {}): string {
  const { placeholder = 'Search...', value = '', results } = opts

  if (!isColorEnabled()) {
    return value || placeholder
  }

  const input = value ? s(value, fg.text) : s(placeholder, fg.overlay)
  const bar = s(`[ ${input} ]`, fg.surface0)
  const resultCount = results !== undefined ? s(`(${results} results)`, fg.muted) : ''

  return `${bar} ${resultCount}`
}

// ── Quick Actions Bar (lazygit/k9s inspired) ─────────────────────────────────

export interface QuickAction {
  key: string
  label: string
  description?: string
}

/**
 * Keyboard shortcut action bar (like k9s command bar)
 */
export function quickActionBar(actions: QuickAction[]): string {
  if (!isColorEnabled()) {
    return actions.map(a => `[${a.key}] ${a.label}`).join('  ')
  }

  const parts = actions.map(action => {
    const key = s(`[${action.key}]`, fg.accent, bold)
    const label = s(action.label, fg.text)
    return `${key} ${label}`
  })

  return parts.join('  ')
}

// ── Tooltip / Help Panel ──────────────────────────────────────────────────────

export interface TooltipOptions {
  title: string
  items: Array<{ key: string; description: string }>
}

/**
 * Tooltip or help overlay (k9s/bottom style)
 */
export function tooltip(opts: TooltipOptions): string {
  if (!isColorEnabled()) {
    const items = opts.items.map(i => `  ${i.key.padEnd(10)} ${i.description}`)
    return `${opts.title}\n${items.join('\n')}`
  }

  const title = s(opts.title, fg.accent, bold)
  const items = opts.items.map(item => {
    const key = s(item.key.padEnd(10), fg.sapphire)
    const desc = s(item.description, fg.text)
    return `${key} ${desc}`
  })

  return widget(`${title}\n${items.join('\n')}`, {
    title: 'Help',
    width: 50
  })
}

// ── Expandable Details (bottom/btop inspired) ─────────────────────────────────

export interface DetailItem {
  label: string
  value: string
  detail?: string
}

/**
 * Expandable detail view with optional nested info
 */
export function detailView(items: DetailItem[], expanded = false): string {
  if (!isColorEnabled()) {
    return items.map(i => `${i.label}: ${i.value}`).join('\n')
  }

  return items.map(item => {
    const label = s(item.label + ':', fg.muted)
    const value = s(item.value, fg.text)
    let line = `${label} ${value}`

    if (expanded && item.detail) {
      const detail = s(`  └─ ${item.detail}`, fg.overlay)
      line += `\n${detail}`
    }

    return line
  }).join('\n')
}

// ── Loading States ────────────────────────────────────────────────────────────

/**
 * Skeleton loader while data loads (like gh-dash)
 */
export function skeleton(width = 40, style: 'bar' | 'dots' = 'bar'): string {
  if (!isColorEnabled()) return '...'

  if (style === 'bar') {
    return s('░'.repeat(width), fg.surface2) + s('█'.repeat(Math.floor(width / 3)), fg.surface1)
  }

  return s('⠋', fg.mauve) + ' ' + s('loading...', fg.overlay)
}

/**
 * Empty state message
 */
export function emptyState(message: string, icon_text = '○'): string {
  if (!isColorEnabled()) return message

  return s(`${icon_text} ${message}`, fg.overlay)
}
