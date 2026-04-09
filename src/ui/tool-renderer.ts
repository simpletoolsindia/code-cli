// Beast CLI - Tool Result Renderer
// Formats tool output into readable structures

import { s, c, fg, icon, bold } from './colors.ts'
import { stripAnsi } from './format.ts'

export interface ToolResult {
  success: boolean
  content: string
  error?: string
}

// ── Result Truncation ────────────────────────────────────────────────────────

const MAX_RESULT_LINES = 2
const MAX_LINE_WIDTH = 120

function truncateResult(content: string, maxLines = MAX_RESULT_LINES): string {
  const lines = content.split('\n')
  if (lines.length <= maxLines) return content

  const visible = lines.slice(0, maxLines)
  // Also truncate each visible line to max width
  const truncated = visible.map(l => {
    const stripped = stripAnsi(l)
    if (stripped.length <= MAX_LINE_WIDTH) return l
    return l.slice(0, MAX_LINE_WIDTH - 3) + '...'
  })

  const remaining = lines.length - maxLines
  return truncated.join('\n') + '\n' + s(`... (${remaining} more lines)`, fg.muted)
}

// ── Main Renderer ────────────────────────────────────────────────────────────

export function renderToolResult(name: string, result: ToolResult): string {
  if (!result.success) {
    return renderError(name, result.error || 'Unknown error')
  }

  // Route to specific formatter based on tool name
  if (name.startsWith('file_list')) return renderFileList(result.content)
  if (name.startsWith('file_read')) return renderFileRead(result.content)
  if (name.startsWith('github_search') || name.startsWith('github_repo')) return renderGithub(result.content)
  if (name.startsWith('searxng_search')) return renderSearch(result.content)
  if (name.startsWith('run_code') || name.startsWith('run_python')) return renderCodeOutput(result.content)
  if (name.startsWith('hackernews')) return renderHackerNews(result.content)
  if (name.startsWith('youtube')) return renderYouTube(result.content)
  if (name.startsWith('fetch_web') || name.startsWith('quick_fetch')) return renderWebContent(result.content)

  // Generic fallback
  return renderGeneric(result.content)
}

// ── Specific Renderers ──────────────────────────────────────────────────────

function renderFileList(content: string): string {
  try {
    const items = JSON.parse(content)
    if (!Array.isArray(items) || items.length === 0) {
      return s('(empty directory)', fg.muted)
    }

    // Group by type
    const dirs = items.filter(i => i.type === 'directory')
    const files = items.filter(i => i.type !== 'directory')

    const lines: string[] = []

    if (dirs.length > 0) {
      lines.push(s('📁 Directories', fg.accent))
      lines.push(dirs.map(d => `  ${s('📁', fg.warning)} ${s(d.name, fg.primary)}`).join('\n'))
      lines.push('')
    }

    if (files.length > 0) {
      lines.push(s('📄 Files', fg.accent))
      lines.push(files.map(f => {
        const size = f.size ? formatSize(f.size) : ''
        const modified = f.modified ? timeAgo(f.modified) : ''
        return `  ${s('📄', fg.cyan)} ${s(f.name, fg.primary)} ${s(size, fg.muted)} ${s(modified, fg.muted)}`
      }).join('\n'))
    }

    return lines.join('\n') + `\n${s('(' + items.length + ' items)', fg.muted)}`
  } catch {
    return renderGeneric(content)
  }
}

function renderFileRead(content: string): string {
  return truncateResult(content, MAX_RESULT_LINES)
}

function renderCodeOutput(content: string): string {
  return truncateResult(content, MAX_RESULT_LINES)
}

function renderSearch(content: string): string {
  try {
    const data = JSON.parse(content)
    const results = data.results || []

    if (results.length === 0) {
      return s('No results found', fg.muted)
    }

    const shown = results.slice(0, MAX_RESULT_LINES)
    const remaining = results.length - shown.length

    const items = shown.map((r: any, i: number) => {
      const title = r.title || s('(no title)', fg.muted)
      const url = r.url || ''
      const snippet = r.snippet || ''

      return [
        s(`${i + 1}. `, fg.accent) + s(truncate(title, 60), fg.bold, fg.primary),
        `   ${s(truncate(snippet, 80), fg.secondary)}`,
        `   ${s(truncate(url, 70), fg.link)}`,
      ].join('\n')
    })

    if (remaining > 0) {
      items.push(s(`... and ${remaining} more results — use fetch_web for full content`, fg.muted))
    }

    return items.join('\n\n')
  } catch {
    return renderGeneric(content)
  }
}

function renderGithub(content: string): string {
  try {
    const data = JSON.parse(content)

    if (data.name) {
      // Single repo
      const lines = [
        s(data.name, fg.bold, fg.accent),
        data.description ? s(data.description, fg.primary) : '',
        '',
        s('⭐ ' + formatNumber(data.stars || data.stargazers_count || 0), fg.warning) + '  ' +
        s('🍴 ' + formatNumber(data.forks_count || 0), fg.cyan) + '  ' +
        s(data.language || '', fg.success),
        '',
        s(data.url || data.html_url || '', fg.link),
      ]
      return lines.filter(Boolean).join('\n')
    }

    if (Array.isArray(data)) {
      const shown = data.slice(0, MAX_RESULT_LINES)
      const remaining = data.length - shown.length
      const items = shown.map((r: any, i: number) => {
        return [
          s(`${i + 1}. `, fg.accent) + s(r.name || r.full_name, fg.bold, fg.primary),
          r.description ? `   ${s(truncate(r.description, 60), fg.secondary)}` : '',
          `   ${s('⭐ ' + formatNumber(r.stars || r.stargazers_count || 0), fg.warning)} ${r.language ? s(r.language, fg.success) : ''}`,
        ].filter(Boolean).join('\n')
      })
      if (remaining > 0) {
        items.push(s(`... and ${remaining} more repos`, fg.muted))
      }
      return items.join('\n\n')
    }

    return renderGeneric(content)
  } catch {
    return renderGeneric(content)
  }
}

function renderHackerNews(content: string): string {
  try {
    const data = JSON.parse(content)
    const results = data.results || []

    const shown = results.slice(0, MAX_RESULT_LINES)
    const remaining = results.length - shown.length
    const items = shown.map((r: any, i: number) => {
      const title = r.title || s('(no title)', fg.muted)
      const score = r.score || r.snippet?.match(/(\d+) points/)?.[1] || '0'
      const comments = r.descendants || r.snippet?.match(/(\d+) comments/)?.[1] || '0'

      return [
        s(`${i + 1}. `, fg.accent) + s(truncate(title, 60), fg.bold, fg.primary),
        `   ${s('⭐ ' + score, fg.warning)} ${s('💬 ' + comments, fg.cyan)} ${r.url ? s(truncate(r.url, 50), fg.link) : ''}`,
      ].join('\n')
    })
    if (remaining > 0) {
      items.push(s(`... and ${remaining} more stories`, fg.muted))
    }
    return items.join('\n\n')
  } catch {
    return renderGeneric(content)
  }
}

function renderYouTube(content: string): string {
  try {
    const data = JSON.parse(content)
    const results = Array.isArray(data) ? data : data.results || []

    const shown = results.slice(0, MAX_RESULT_LINES)
    const remaining = results.length - shown.length
    const items = shown.map((r: any, i: number) => {
      return [
        s(`${i + 1}. `, fg.accent) + s(r.name || r.full_name || s('(no name)', fg.muted), fg.bold, fg.primary),
        r.description ? `   ${s(truncate(r.description, 60), fg.secondary)}` : '',
        `   ${s('⭐ ' + formatNumber(r.stars || r.stargazers_count || 0), fg.warning)} ${r.language ? s(r.language, fg.success) : ''}`,
      ].filter(Boolean).join('\n')
    })
    if (remaining > 0) {
      items.push(s(`... and ${remaining} more videos`, fg.muted))
    }
    return items.join('\n\n')
  } catch {
    return renderGeneric(content)
  }
}

function renderWebContent(content: string): string {
  return truncateResult(content, MAX_RESULT_LINES)
}

function renderGeneric(content: string): string {
  try {
    const parsed = JSON.parse(content)
    const formatted = JSON.stringify(parsed, null, 2)
    return truncateResult(formatted, MAX_RESULT_LINES)
  } catch {
    return truncateResult(content, MAX_RESULT_LINES)
  }
}

function renderError(toolName: string, error: string): string {
  return s(`${icon.error} ${toolName}: ${error}`, fg.error)
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function timeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return days + 'd ago'
    if (hours > 0) return hours + 'h ago'
    if (minutes > 0) return minutes + 'm ago'
    return 'just now'
  } catch {
    return ''
  }
}

function truncate(text: string, maxLen: number): string {
  const stripped = stripAnsi(text)
  if (stripped.length <= maxLen) return text
  // Try to truncate at word boundary
  const plain = text.replace(/\x1b\[[0-9;]*m/g, '')
  const truncated = plain.slice(0, maxLen - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLen * 0.7) {
    return text.slice(0, text.indexOf(' ', lastSpace)) + '...'
  }
  return text.slice(0, maxLen - 3) + '...'
}
