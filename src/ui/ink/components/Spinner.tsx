// Spinner Component - State-aware activity indicator with enhanced visual feedback
import React, { useState, useEffect } from 'react'
import { Text, Box } from 'ink'
import Spinner from 'ink-spinner'
import { getTheme } from '../theme.ts'

interface SpinnerProps {
  state: 'thinking' | 'searching' | 'tool' | 'formatting' | 'done' | 'error'
  elapsed: number
  requestStart?: number
}

const STATE_CONFIG: Record<SpinnerProps['state'], { label: string; color: string; icon: string }> = {
  thinking: { label: 'Thinking...', color: 'accent', icon: '◐' },
  searching: { label: 'Searching', color: 'sapphire', icon: '⌕' },
  tool: { label: 'Running Tool', color: 'peach', icon: '›' },
  formatting: { label: 'Formatting', color: 'success', icon: '◈' },
  done: { label: 'Done', color: 'success', icon: '✓' },
  error: { label: 'Error', color: 'error', icon: '✗' },
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

// Animated progress indicator
function ProgressIndicator({ elapsed, state }: { elapsed: number; state: string }) {
  const [frame, setFrame] = useState(0)
  const theme = getTheme()
  const frames = ['◐', '◓', '◑', '◒']

  useEffect(() => {
    if (state === 'thinking' || state === 'tool') {
      const timer = setInterval(() => {
        setFrame(f => (f + 1) % frames.length)
      }, 200)
      return () => clearInterval(timer)
    }
  }, [state])

  return (
    <Text color={theme.muted}>
      {frames[frame]}
    </Text>
  )
}

export const Spinner: React.FC<SpinnerProps> = ({ state, elapsed, requestStart }) => {
  const theme = getTheme()
  const config = STATE_CONFIG[state]
  const color = config ? (theme as any)[config.color] : theme.accent
  const label = config ? config.label : state
  const icon = config ? config.icon : '◐'

  // Show immediate feedback for short operations
  if (elapsed < 100 && state !== 'done' && state !== 'error') {
    return (
      <Box>
        <Text color={theme.warning}>{icon}</Text>
        <Text color={color}> {label}</Text>
        <Text color={theme.muted}> (starting...)</Text>
      </Box>
    )
  }

  // Timeout warning for long operations
  const isSlow = elapsed > 30000
  const warningColor = isSlow ? theme.warning : theme.muted

  if (state === 'done') {
    return (
      <Box>
        <Text color={theme.success}>✓</Text>
        <Text color={color}> {label}</Text>
        <Text color={warningColor}> · {formatElapsed(elapsed)}</Text>
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
      <ProgressIndicator elapsed={elapsed} state={state} />
      <Text color={color}> {label}</Text>
      <Text color={warningColor}> · {formatElapsed(elapsed)}</Text>
      {isSlow && (
        <Text color={theme.warning}> (slow connection)</Text>
      )}
    </Box>
  )
}
