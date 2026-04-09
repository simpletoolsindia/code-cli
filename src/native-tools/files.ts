// Native File System Tools
// Replaces restricted file_* MCP calls with direct Node.js operations

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { resolve, dirname, basename, extname, join, relative } from 'node:path'
import { execSync } from 'node:child_process'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB default
const ALLOWED_EXTENSIONS = new Set([
  '.ts', '.js', '.json', '.md', '.txt', '.yml', '.yaml', '.xml',
  '.html', '.css', '.scss', '.py', '.rs', '.go', '.java', '.c', '.cpp',
  '.h', '.hpp', '.sh', '.bash', '.zsh', '.sql', '.csv', '.log',
  '.gitignore', '.env', '.prettierrc', '.eslintrc', '.babelrc',
])

const RESTRICTED_PATHS = ['/Users/sridhar/.ssh', '/Users/sridhar/.npm', '/Users/sridhar/.aws']

export interface FileResult {
  success: boolean
  content?: string
  path?: string
  size?: number
  lines?: number
  error?: string
  matches?: number
}

export interface ListResult {
  success: boolean
  items: { name: string; type: 'file' | 'directory'; size?: number; modified?: string }[]
  path: string
  error?: string
}

export interface SearchResult {
  success: boolean
  files: { path: string; line?: number; match?: string }[]
  error?: string
}

export async function fileRead(path: string, maxSize = MAX_FILE_SIZE): Promise<FileResult> {
  try {
    const resolved = resolve(path)

    // Security check
    for (const restricted of RESTRICTED_PATHS) {
      if (resolved.startsWith(restricted)) {
        return { success: false, error: `Access denied: ${restricted}` }
      }
    }

    const stats = statSync(resolved)
    if (stats.size > maxSize) {
      return {
        success: true,
        content: `[File too large: ${stats.size} bytes. Max: ${maxSize}]`,
        path: resolved,
        size: stats.size,
      }
    }

    const content = readFileSync(resolved, 'utf-8')
    const lines = content.split('\n').length

    return {
      success: true,
      content,
      path: resolved,
      size: stats.size,
      lines,
    }
  } catch (e: any) {
    return { success: false, error: e.message, path }
  }
}

export async function fileWrite(path: string, content: string): Promise<FileResult> {
  try {
    const resolved = resolve(path)

    // Security check
    for (const restricted of RESTRICTED_PATHS) {
      if (resolved.startsWith(restricted)) {
        return { success: false, error: `Access denied: ${restricted}` }
      }
    }

    // Ensure parent directory exists
    const dir = dirname(resolved)
    if (!existsSync(dir)) {
      return { success: false, error: `Directory does not exist: ${dir}`, path: resolved }
    }

    writeFileSync(resolved, content, 'utf-8')
    const stats = statSync(resolved)

    return {
      success: true,
      path: resolved,
      size: stats.size,
    }
  } catch (e: any) {
    return { success: false, error: e.message, path }
  }
}

export async function fileList(dir = '.', maxItems = 100): Promise<ListResult> {
  try {
    const resolved = resolve(dir)

    if (!existsSync(resolved)) {
      return { success: false, items: [], path: resolved, error: 'Directory not found' }
    }

    const entries = readdirSync(resolved)
    const items = []

    for (const entry of entries.slice(0, maxItems)) {
      try {
        const fullPath = join(resolved, entry)
        const stats = statSync(fullPath)
        items.push({
          name: entry,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.isFile() ? stats.size : undefined,
          modified: stats.mtime.toISOString(),
        })
      } catch {
        // Skip inaccessible entries
      }
    }

    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return { success: true, items, path: resolved }
  } catch (e: any) {
    return { success: false, items: [], path: dir, error: e.message }
  }
}

export async function fileSearch(
  directory: string,
  pattern: string,
  maxResults = 50
): Promise<SearchResult> {
  try {
    const resolved = resolve(directory)

    if (!existsSync(resolved)) {
      return { success: false, files: [], error: 'Directory not found' }
    }

    // Use find command instead of glob
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const cmd = `find "${resolved}" -type f \\( -path "*/node_modules" -o -path "*/.git" -o -path "*/dist" -o -path "*/build" \\) -prune -o -type f -name "*${pattern}*" -print 2>/dev/null | head -${maxResults}`

    const output = execSync(cmd, { encoding: 'utf-8', timeout: 10000 })
    const files = output.split('\n').filter(Boolean).map(f => ({ path: f }))

    return { success: true, files }
  } catch (e: any) {
    return { success: false, files: [], error: e.message }
  }
}

export async function fileGrep(
  directory: string,
  query: string,
  maxResults = 50,
  filePattern = '*'
): Promise<SearchResult> {
  try {
    const resolved = resolve(directory)

    if (!existsSync(resolved)) {
      return { success: false, files: [], error: 'Directory not found' }
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const cmd = `grep -rn --include="${filePattern}" -E "${escaped}" "${resolved}" 2>/dev/null | head -${maxResults}`

    const output = execSync(cmd, { encoding: 'utf-8', timeout: 10000 })
    const files: { path: string; line?: number; match?: string }[] = []

    for (const line of output.split('\n').filter(Boolean)) {
      const colonIdx = line.indexOf(':')
      if (colonIdx > 0) {
        const pathPart = line.slice(0, colonIdx)
        const rest = line.slice(colonIdx + 1)
        const secondColonIdx = rest.indexOf(':')
        if (secondColonIdx > 0) {
          const lineNum = parseInt(rest.slice(0, secondColonIdx))
          const match = rest.slice(secondColonIdx + 1).trim()
          files.push({
            path: join(resolved, pathPart),
            line: lineNum,
            match: match.slice(0, 200),
          })
        }
      }
    }

    return { success: true, files }
  } catch (e: any) {
    // Grep returns error for no matches, treat as empty result
    return { success: true, files: [] }
  }
}

export async function fileGlob(
  directory: string,
  patterns: string[],
  maxResults = 100
): Promise<SearchResult> {
  try {
    const resolved = resolve(directory)
    const files: { path: string }[] = []

    for (const pattern of patterns) {
      // Use find with glob patterns
      const cmd = `find "${resolved}" -type f \\( -path "*/node_modules" -o -path "*/.git" -o -path "*/dist" -o -path "*/build" \\) -prune -o -type f -name "${pattern}" -print 2>/dev/null | head -${maxResults}`

      const output = execSync(cmd, { encoding: 'utf-8', timeout: 10000 })
      for (const line of output.split('\n').filter(Boolean)) {
        if (!files.some(f => f.path === line)) {
          files.push({ path: line })
        }
      }

      if (files.length >= maxResults) break
    }

    return { success: true, files: files.slice(0, maxResults) }
  } catch (e: any) {
    return { success: false, files: [], error: e.message }
  }
}

// Check if a file is safe to read (not binary)
export function isTextFile(path: string): boolean {
  const ext = extname(path).toLowerCase()
  return ALLOWED_EXTENSIONS.has(ext) || !ext
}
