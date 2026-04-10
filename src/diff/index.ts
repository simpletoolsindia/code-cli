// Diff Generation - Unified diff for file changes
// Inspired by opencode's diff implementation

export interface DiffResult {
  diff: string
  additions: number
  removals: number
}

/**
 * Generate a unified diff string between two contents
 * Uses Myers diff algorithm for accurate change detection
 */
export function generateDiff(
  oldContent: string,
  newContent: string,
  filePath: string,
  contextLines = 3
): DiffResult {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  // Compute longest common subsequence
  const lcs = computeLCS(oldLines, newLines)
  const changes = buildChangeList(oldLines, newLines, lcs)

  if (changes.length === 0) {
    return { diff: '', additions: 0, removals: 0 }
  }

  // Group changes into hunks
  const hunks = buildHunks(oldLines, newLines, changes, contextLines)

  let additions = 0
  let removals = 0

  const diffLines: string[] = []
  diffLines.push(`--- a/${filePath}`)
  diffLines.push(`+++ b/${filePath}`)

  for (const hunk of hunks) {
    diffLines.push(
      `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`
    )

    for (const line of hunk.lines) {
      switch (line.type) {
        case 'add':
          diffLines.push(`+${line.content}`)
          additions++
          break
        case 'remove':
          diffLines.push(`-${line.content}`)
          removals++
          break
        case 'context':
          diffLines.push(` ${line.content}`)
          break
      }
    }
  }

  return {
    diff: diffLines.join('\n'),
    additions,
    removals,
  }
}

/**
 * Apply a unified diff to content and return the result
 */
export function applyDiff(content: string, diff: string): string {
  const lines = content.split('\n')
  const diffLines = diff.split('\n')

  const result: string[] = []
  let i = 0

  // Skip header lines (---, +++, etc.)
  while (i < diffLines.length && !diffLines[i].startsWith('@@')) {
    i++
  }

  let oldIdx = 0

  while (i < diffLines.length) {
    const line = diffLines[i]

    // Parse hunk header
    const hunkMatch = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/)
    if (!hunkMatch) {
      i++
      continue
    }

    // Convert to 0-indexed
    const targetOld = parseInt(hunkMatch[1], 10) - 1

    // Copy lines up to the hunk start
    while (oldIdx < targetOld && oldIdx < lines.length) {
      result.push(lines[oldIdx])
      oldIdx++
    }

    i++

    // Process hunk content
    while (i < diffLines.length) {
      const dLine = diffLines[i]

      if (dLine.startsWith('@@')) break
      if (dLine.startsWith('diff ') || dLine.startsWith('--- ') || dLine.startsWith('+++ ')) break

      if (dLine.startsWith('-')) {
        // Skip old line
        oldIdx++
        i++
      } else if (dLine.startsWith('+')) {
        // Add new line (without the +)
        result.push(dLine.substring(1))
        i++
      } else if (dLine.startsWith(' ')) {
        // Context line - copy from original
        if (oldIdx < lines.length) {
          result.push(lines[oldIdx])
          oldIdx++
        }
        i++
      } else {
        i++
      }
    }
  }

  // Copy remaining lines
  while (oldIdx < lines.length) {
    result.push(lines[oldIdx])
    oldIdx++
  }

  return result.join('\n')
}

/**
 * Check if content can have diff applied
 */
export function canApplyDiff(_content: string, diff: string): boolean {
  if (!diff.trim()) return true

  const diffLines = diff.split('\n')
  for (const line of diffLines) {
    if (line.startsWith('@@') && line.endsWith('@@')) {
      return true
    }
  }
  return false
}

/**
 * Format diff statistics as colored string
 */
export function formatDiffStats(additions: number, removals: number): string {
  const parts: string[] = []
  if (additions > 0) parts.push(`+${additions}`)
  if (removals > 0) parts.push(`-${removals}`)
  return parts.join(' ') || 'no changes'
}

// ── Private helpers ───────────────────────────────────────────────────────────

type ChangeType = 'add' | 'remove' | 'equal'

interface Change {
  type: ChangeType
  oldIdx: number // -1 if added
  newIdx: number // -1 if removed
}

function computeLCS(oldLines: string[], newLines: string[]): number[][] {
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp
}

function buildChangeList(
  oldLines: string[],
  newLines: string[],
  lcs: number[][]
): Change[] {
  const changes: Change[] = []
  let i = oldLines.length
  let j = newLines.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      changes.unshift({ type: 'equal', oldIdx: i - 1, newIdx: j - 1 })
      i--
      j--
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      changes.unshift({ type: 'add', oldIdx: -1, newIdx: j - 1 })
      j--
    } else if (i > 0) {
      changes.unshift({ type: 'remove', oldIdx: i - 1, newIdx: -1 })
      i--
    }
  }

  return changes
}

interface Hunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: Array<{
    type: 'add' | 'remove' | 'context'
    content: string
  }>
}

function buildHunks(
  oldLines: string[],
  newLines: string[],
  changes: Change[],
  contextLines: number
): Hunk[] {
  if (changes.length === 0) return []

  const hunks: Hunk[] = []
  let i = 0

  while (i < changes.length) {
    // Find start of hunk (skip leading context)
    while (i < changes.length && changes[i].type === 'equal') {
      i++
    }

    if (i >= changes.length) break

    const hunkStart = i
    let oldCount = 0
    let newCount = 0
    let contextStart = hunkStart

    // Count context before
    while (contextStart > 0 && changes[contextStart - 1].type === 'equal') {
      contextStart--
    }

    // Extend context before
    const extStart = Math.max(0, contextStart - contextLines)

    // Collect hunk content
    const hunkChanges: Change[] = []
    for (let k = extStart; k < changes.length; k++) {
      const c = changes[k]

      if (c.type === 'equal') {
        // Check if we should end the hunk
        let contextAfter = 0
        let checkK = k + 1
        while (checkK < changes.length && changes[checkK].type === 'equal') {
          contextAfter++
          checkK++
        }

        if (contextAfter >= contextLines) {
          // End hunk before this context run
          break
        }
      }

      hunkChanges.push(c)
      if (c.type !== 'add') oldCount++
      if (c.type !== 'remove') newCount++
    }

    // Build hunk lines
    const hunkLines: Hunk['lines'] = []
    let lastOldIdx = -1
    let lastNewIdx = -1

    for (const c of hunkChanges) {
      if (c.type === 'equal') {
        hunkLines.push({ type: 'context', content: oldLines[c.oldIdx] })
        lastOldIdx = c.oldIdx
        lastNewIdx = c.newIdx
      } else if (c.type === 'remove') {
        hunkLines.push({ type: 'remove', content: oldLines[c.oldIdx] })
        lastOldIdx = c.oldIdx
      } else {
        hunkLines.push({ type: 'add', content: newLines[c.newIdx] })
        lastNewIdx = c.newIdx
      }
    }

    // Calculate hunk position
    const firstChange = hunkChanges.find(c => c.type !== 'equal') || hunkChanges[0]
    const firstEqual = hunkChanges.find(c => c.type === 'equal')

    const oldStart = firstEqual
      ? firstEqual.oldIdx + 1
      : firstChange.oldIdx >= 0
        ? firstChange.oldIdx + 1
        : 1
    const newStart = firstEqual
      ? firstEqual.newIdx + 1
      : firstChange.newIdx >= 0
        ? firstChange.newIdx + 1
        : 1

    hunks.push({
      oldStart,
      oldLines: Math.max(1, oldCount),
      newStart,
      newLines: Math.max(1, newCount),
      lines: hunkLines,
    })

    i = hunkStart + hunkChanges.length
  }

  return hunks
}

export default {
  generateDiff,
  applyDiff,
  canApplyDiff,
  formatDiffStats,
}
