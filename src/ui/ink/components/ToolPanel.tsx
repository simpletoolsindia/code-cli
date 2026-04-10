// ToolPanel Component - Expandable tool call card
import React, { useState, useEffect } from 'react'
import { Text, Box } from 'ink'
import { getTheme } from '../theme.ts'

interface ToolPanelProps {
  name: string
  args?: Record<string, unknown>
  result?: string
  status: 'running' | 'done' | 'error'
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ name, args, result, status }) => {
  const [expanded, setExpanded] = useState(false)
  const theme = getTheme()

  // Auto-expand when tool finishes
  useEffect(() => {
    if (status === 'done' || status === 'error') {
      setExpanded(true)
    }
  }, [status])

  const statusIcon = status === 'done' ? '✓' : status === 'error' ? '✗' : '›'
  const statusColor = status === 'done' ? theme.success : status === 'error' ? theme.error : theme.peach

  const argsStr = args ? JSON.stringify(args, null, 2) : ''
  const resultStr = result || ''

  return (
    <Box flexDirection="column" borderStyle="single" paddingX={1} marginY={1}>
      <Box>
        <Text color={statusColor} bold>{statusIcon} {name}</Text>
        {!expanded && (status === 'done' || status === 'error') && (
          <Text color={theme.muted}> (expandable)</Text>
        )}
      </Box>
      {expanded && argsStr && (
        <Box flexDirection="column" paddingTop={1}>
          <Text color={theme.muted}>Args:</Text>
          <Text color={theme.code}>{argsStr.slice(0, 500)}</Text>
        </Box>
      )}
      {expanded && resultStr && (
        <Box flexDirection="column" paddingTop={1}>
          <Text color={theme.muted}>Result:</Text>
          <Text color={theme.secondary}>{resultStr.slice(0, 500)}</Text>
        </Box>
      )}
    </Box>
  )
}
