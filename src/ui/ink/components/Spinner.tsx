// Spinner Component - State-aware activity indicator
import React from 'react'
import { Text, Box } from 'ink'
import Spinner from 'ink-spinner'
import { getTheme } from '../theme.ts'

interface SpinnerProps {
  state: 'thinking' | 'searching' | 'tool' | 'formatting' | 'done' | 'error'
  elapsed: number
}

const STATE_CONFIG: Record<SpinnerProps['state'], { label: string; color: string }> = {
  thinking: { label: 'Thinking', color: 'accent' },
  searching: { label: 'Searching', color: 'sapphire' },
  tool: { label: 'Running', color: 'peach' },
  formatting: { label: 'Formatting', color: 'success' },
  done: { label: 'Done', color: 'success' },
  error: { label: 'Error', color: 'error' },
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

export const Spinner: React.FC<SpinnerProps> = ({ state, elapsed }) => {
  const theme = getTheme()
  const config = STATE_CONFIG[state]
  const color = config ? (theme as any)[config.color] : theme.accent
  const label = config ? config.label : state

  if (state === 'done') {
    return (
      <Box>
        <Text color={theme.success}>✓</Text>
        <Text color={color}> {label}</Text>
        <Text color={theme.muted}> · {formatElapsed(elapsed)}</Text>
      </Box>
    )
  }

  if (state === 'error') {
    return (
      <Box>
        <Text color={theme.error}>✗</Text>
        <Text color={theme.error}> {label}</Text>
        <Text color={theme.muted}> · {formatElapsed(elapsed)}</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Spinner />
      <Text color={color}> {label}</Text>
      <Text color={theme.muted}> · {formatElapsed(elapsed)}</Text>
    </Box>
  )
}
