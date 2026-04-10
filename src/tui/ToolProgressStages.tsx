/**
 * ToolProgressStages — per-stage progress breakdown for tool execution
 * Shows: label, status icon, duration, progress bar
 */

import React, { memo } from 'react'
import { Box, Text, Spacer } from 'ink'
import type { ThemeMode } from './types.ts'
import { colors } from './theme.ts'

interface ToolStage {
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  durationMs?: number
}

interface ToolProgressStagesProps {
  stages: ToolStage[]
  themeMode: ThemeMode
  compact?: boolean   // single-line compact view
  maxStages?: number  // limit visible stages
}

export const ToolProgressStages = memo(({
  stages,
  themeMode,
  compact = false,
  maxStages = 8,
}: ToolProgressStagesProps) => {
  const c = colors[themeMode]
  const visible = stages.slice(0, maxStages)

  if (compact) {
    // Compact: single line with progress dots
    const done = stages.filter(s => s.status === 'done').length
    const pct = Math.round((done / stages.length) * 100)

    return (
      <Box alignItems="center">
        <Text color={c.muted}>stages: </Text>
        <Text color={c.success}>
          {'█'.repeat(Math.round(pct / 10))}
        </Text>
        <Text color={c.muted}>
          {'░'.repeat(10 - Math.round(pct / 10))}
        </Text>
        <Text color={c.muted}> {pct}%</Text>
        <Text color={c.muted}> ({done}/{stages.length})</Text>
      </Box>
    )
  }

  // Full stage breakdown
  return (
    <Box flexDirection="column">
      <Text color={c.muted} bold>Pipeline:</Text>
      {visible.map((stage, i) => {
        const icon = {
          pending: '○',
          running: '◐',
          done: '●',
          error: '✗',
        }[stage.status]

        const color = {
          pending: c.muted,
          running: c.warning,
          done: c.success,
          error: c.error,
        }[stage.status]

        return (
          <Box key={i} marginLeft={2}>
            <Text color={color}>{icon} </Text>
            <Text color={color} bold={stage.status === 'running'}>
              {'['}
            </Text>
            <Text color={c.muted} dim>
              {stage.label.padEnd(12)}
            </Text>
            <Text color={color}>{']'}</Text>
            {stage.durationMs !== undefined && stage.durationMs > 0 && (
              <Text color={c.muted}> {stage.durationMs.toFixed(1)}ms</Text>
            )}
            {stage.status === 'done' && (
              <Text color={c.success}> ✓</Text>
            )}
            {stage.status === 'error' && (
              <Text color={c.error}> ✗</Text>
            )}
          </Box>
        )
      })}

      {stages.length > maxStages && (
        <Text color={c.muted}>  … +{stages.length - maxStages} more stages</Text>
      )}
    </Box>
  )
})

ToolProgressStages.displayName = 'ToolProgressStages'

export default ToolProgressStages
