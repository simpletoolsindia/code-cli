/**
 * CollapsibleToolCall — expandable tool call with progress stages
 * Shows: tool name, status, duration, and collapsible arguments/result
 */

import React, { memo, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { ThemeMode } from './types.ts'
import { colors } from './theme.ts'
import { ToolProgressStages } from './ToolProgressStages.tsx'

interface CollapsibleToolCallProps {
  toolCall: {
    id: string
    name: string
    arguments?: string
    result?: string
    status?: 'pending' | 'running' | 'done' | 'error'
    stages?: Array<{
      label: string
      status: 'pending' | 'running' | 'done' | 'error'
      durationMs?: number
    }>
    startedAt?: number
    completedAt?: number
  }
  themeMode: ThemeMode
  isExpanded: boolean
  onToggle: () => void
}

export const CollapsibleToolCall = memo(({
  toolCall,
  themeMode,
  isExpanded,
  onToggle,
}: CollapsibleToolCallProps) => {
  const c = colors[themeMode]
  const status = toolCall.status ?? 'pending'

  // Status icon and color
  const statusIcon = {
    pending: '○',
    running: '◐',
    done: '●',
    error: '✗',
  }[status]

  const statusColor = {
    pending: c.muted,
    running: c.warning,
    done: c.success,
    error: c.error,
  }[status]

  // Duration
  const duration = toolCall.completedAt && toolCall.startedAt
    ? (toolCall.completedAt - toolCall.startedAt).toFixed(0)
    : toolCall.startedAt
    ? (Date.now() - toolCall.startedAt).toFixed(0)
    : null

  // Toggle on click/enter
  useInput((input, key) => {
    // Don't handle here — handled by parent
  })

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={statusColor}
      paddingX={1}
      paddingY={0}
      marginTop={1}
    >
      {/* Header row — always visible */}
      <Box
        flexDirection="row"
        alignItems="center"
        onSubmit={onToggle}
      >
        <Text color={statusColor}>{statusIcon} </Text>
        <Text bold color={c.purple}>🔧 {toolCall.name}</Text>

        {duration !== null && (
          <Text color={c.muted}> ({duration}ms)</Text>
        )}

        <Spacer />

        {/* Expand/collapse indicator */}
        <Text color={c.muted}>
          {isExpanded ? '▼' : '▶'}
        </Text>
        <Text color={c.muted}> </Text>
        <Text
          color={c.accent}
          bold
          onClick={onToggle}
        >
          {isExpanded ? 'collapse' : 'expand'}
        </Text>
      </Box>

      {/* Progress stages (always visible while running) */}
      {toolCall.stages && toolCall.stages.length > 0 && status === 'running' && (
        <Box marginLeft={2} marginTop={1}>
          <ToolProgressStages stages={toolCall.stages} themeMode={themeMode} compact />
        </Box>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <Box flexDirection="column" marginTop={1} marginLeft={2}>
          {/* Arguments */}
          {toolCall.arguments && (
            <>
              <Text color={c.muted} bold>Arguments:</Text>
              <Box
                backgroundColor={c.surface}
                paddingX={1}
                paddingY={0}
                marginTop={0}
              >
                <Text color={c.cyan} wrap="wrap">
                  {formatArgs(toolCall.arguments)}
                </Text>
              </Box>
            </>
          )}

          {/* Result */}
          {toolCall.result && (
            <>
              <Text color={c.muted} bold marginTop={1}>Result:</Text>
              <Box
                backgroundColor={c.surface}
                paddingX={1}
                paddingY={0}
                marginTop={0}
                flexDirection="column"
              >
                <Text color={c.text} wrap="wrap">
                  {truncateResult(toolCall.result)}
                </Text>
              </Box>
            </>
          )}

          {/* Progress stages detail */}
          {toolCall.stages && toolCall.stages.length > 0 && (
            <Box marginTop={1}>
              <ToolProgressStages stages={toolCall.stages} themeMode={themeMode} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
})

CollapsibleToolCall.displayName = 'CollapsibleToolCall'

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatArgs(args: string): string {
  try {
    const parsed = JSON.parse(args)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return args
  }
}

function truncateResult(result: string, maxLen = 500): string {
  if (result.length <= maxLen) return result
  return result.slice(0, maxLen) + '\n… (truncated)'
}

export default CollapsibleToolCall
