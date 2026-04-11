// Beast CLI - Approval System
// Coordinates permission checks + diff display before destructive actions
// Wires: PermissionServiceImpl, generateDiff, reviewPatch (editor)

import { s, fg, dim, bold, reset } from '../ui/colors.ts'
import { generateDiff, formatDiffStats, type DiffResult } from '../diff/index.ts'
import { reviewPatch } from '../editor/index.ts'
import { readFileSync, existsSync } from 'node:fs'
import readline from 'node:readline'

export interface ApprovalContext {
  tool: 'file_write' | 'file_delete' | 'run_command'
  path: string
  newContent?: string
  oldContent?: string
  description: string
}

export interface ApprovalResult {
  approved: boolean
  reason?: 'approved' | 'rejected' | 'external_edit' | 'timeout' | 'error'
  diff?: DiffResult
  error?: string
}

// Load old content for a file (returns null if file doesn't exist)
export function getOldContent(path: string): string | null {
  try {
    if (!existsSync(path)) return null
    return readFileSync(path, 'utf-8')
  } catch {
    return null
  }
}

// Format diff for terminal display
export function formatDiffDisplay(diff: DiffResult, path: string): string {
  const stats = s(formatDiffStats(diff.additions, diff.removals), fg.muted)
  const lines: string[] = []

  lines.push(`\n${s('─'.repeat(60), fg.muted)}`)
  lines.push(`${s('📄', fg.accent)} ${s(path, fg.primary)} ${s(`(${stats})`, fg.muted)}`)

  // Show first 20 diff lines
  const diffLines = diff.diff.split('\n').slice(2) // skip ---/+++ headers
  const hunks = diffLines.filter(l => l.startsWith('@@')).length

  if (hunks > 1) {
    lines.push(`${s('⚠', fg.warning)} ${hunks} changes across ${diff.additions + diff.removals} lines`)
  }

  const MAX_SHOW = 20
  const shown = diffLines.slice(0, MAX_SHOW)
  for (const line of shown) {
    if (line.startsWith('@@')) {
      lines.push(s(line, fg.accent))
    } else if (line.startsWith('+')) {
      lines.push(s(line, fg.success))
    } else if (line.startsWith('-')) {
      lines.push(s(line, fg.error))
    } else if (line.startsWith(' ')) {
      lines.push(dim + line + reset)
    }
  }

  if (diffLines.length > MAX_SHOW) {
    lines.push(s(`... (${diffLines.length - MAX_SHOW} more lines, review in editor for full diff)`, fg.muted))
  }

  lines.push(s('─'.repeat(60), fg.muted))
  return lines.join('\n')
}

// Quick approval prompt (inline, no external editor)
export async function quickApproval(ctx: ApprovalContext): Promise<ApprovalResult> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  // Generate diff if we have old content
  let diff: DiffResult | null = null
  if (ctx.oldContent && ctx.newContent) {
    diff = generateDiff(ctx.oldContent, ctx.newContent, ctx.path)
    if (diff.additions === 0 && diff.removals === 0) {
      // No actual changes
      return { approved: true, reason: 'approved' }
    }
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

    // Show diff if available
    if (diff) {
      process.stdout.write(formatDiffDisplay(diff, ctx.path) + '\n')
    }

    process.stdout.write(`\n${s('⚠', fg.warning)} ${s(ctx.description, fg.primary)}\n`)
    process.stdout.write(`${s('[y]', fg.success)} ${s('Approve', fg.primary)}  `)
    process.stdout.write(`${s('[e]', fg.accent)} ${s('Review in editor', fg.primary)}  `)
    process.stdout.write(`${s('[n]', fg.error)} ${s('Reject', fg.primary)}\n`)
    process.stdout.write(`${s('[Enter]', fg.muted)} to approve, ${s('q', fg.warning)} to cancel > `)

    rl.question('', async (answer: string) => {
      rl.close()
      const trimmed = answer.trim().toLowerCase()

      if (trimmed === 'q' || trimmed === 'n') {
        resolve({ approved: false, reason: 'rejected' })
        return
      }

      if (trimmed === 'e') {
        // Open in external editor
        if (diff) {
          const approved = await reviewPatch(diff.diff, ctx.path)
          resolve({ approved, reason: approved ? 'external_edit' : 'rejected', diff: diff ?? undefined })
        } else {
          resolve({ approved: false, reason: 'rejected', error: 'No diff to review' })
        }
        return
      }

      // Default: approve
      resolve({ approved: true, reason: 'approved', diff: diff ?? undefined })
    })
  })
}

// Batch approval for multiple file writes
export async function batchApproval(
  files: Array<{ path: string; oldContent: string | null; newContent: string; reason: string }>
): Promise<Map<string, ApprovalResult>> {
  const results = new Map<string, ApprovalResult>()
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  process.stdout.write(`\n${s('⚠', fg.warning)} ${files.length} file(s) need approval:\n`)

  for (const file of files) {
    let diff: DiffResult | null = null
    if (file.oldContent && file.newContent) {
      diff = generateDiff(file.oldContent, file.newContent, file.path)
    }

    if (diff && diff.additions === 0 && diff.removals === 0) {
      results.set(file.path, { approved: true, reason: 'approved' })
      continue
    }

    if (diff) {
      process.stdout.write(formatDiffDisplay(diff, file.path) + '\n')
    }

    process.stdout.write(`${s('⚠', fg.warning)} ${file.reason}\n`)
    process.stdout.write(`  ${s('[y]', fg.success)} Approve  ${s('[n]', fg.error)} Reject  ${s('[a]', fg.warning)} Approve all  ${s('[q]', fg.error)} Cancel all\n`)
    process.stdout.write(`  > `)

    // Read one keypress
    const answer = await new Promise<string>(r => rl.question('', r2 => { r(r2.trim()) }))
    rl.close()

    const lower = answer.toLowerCase()
    if (lower === 'q') {
      // Cancel all remaining
      results.set(file.path, { approved: false, reason: 'rejected' })
      for (const f of files.slice(files.indexOf(file) + 1)) {
        results.set(f.path, { approved: false, reason: 'rejected' })
      }
      return results
    }
    if (lower === 'a') {
      results.set(file.path, { approved: true, reason: 'approved' })
      for (const f of files.slice(files.indexOf(file) + 1)) {
        results.set(f.path, { approved: true, reason: 'approved' })
      }
      return results
    }
    if (lower === 'n') {
      results.set(file.path, { approved: false, reason: 'rejected' })
    } else {
      results.set(file.path, { approved: true, reason: 'approved', diff: diff ?? undefined })
    }
  }

  return results
}

export default {
  ApprovalContext,
  ApprovalResult,
  getOldContent,
  formatDiffDisplay,
  quickApproval,
  batchApproval,
}
