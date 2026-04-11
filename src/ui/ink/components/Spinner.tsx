// Spinner Component - State-aware activity indicator with tool-specific animations
import React, { useState, useEffect } from 'react'
import { Text, Box } from 'ink'
import { getTheme } from '../theme.ts'

type SpinnerState =
  | 'thinking' | 'searching' | 'tool' | 'formatting' | 'done' | 'error'
  | 'tool:read_file' | 'tool:write_file' | 'tool:copy_file'
  | 'tool:web_fetch' | 'tool:code_run' | 'tool:mcp_call'
  | 'llm_processing' | 'tool:generic'

interface SpinnerProps {
  state: SpinnerState
  elapsed: number
  toolName?: string
  fileName?: string
  query?: string
  model?: string
}

const STATE_CONFIG: Record<string, { label: string; color: string; icon: string; animate?: boolean }> = {
  thinking:      { label: 'Thinking...',       color: 'accent',   icon: '◐',  animate: true },
  searching:    { label: 'Searching...',       color: 'sapphire', icon: '⌕',  animate: true },
  tool:         { label: 'Running Tool...',   color: 'peach',    icon: '›',  animate: true },
  formatting:   { label: 'Formatting...',     color: 'success',  icon: '◈',  animate: true },
  done:         { label: 'Done',              color: 'success',  icon: '✓',  animate: false },
  error:        { label: 'Error',            color: 'error',    icon: '✗',  animate: false },
  // Tool-specific states
  'tool:read_file':  { label: 'Reading file...',    color: 'sapphire', icon: '▷', animate: true },
  'tool:write_file': { label: 'Writing file...',    color: 'yellow',   icon: '✎', animate: true },
  'tool:copy_file':  { label: 'Copying file...',   color: 'mauve',    icon: '▣', animate: true },
  'tool:web_fetch':  { label: 'Fetching web...',    color: 'blue',     icon: '◎', animate: true },
  'tool:code_run':   { label: 'Running code...',    color: 'green',    icon: '⚡', animate: true },
  'tool:mcp_call':   { label: 'MCP call...',       color: 'lavender', icon: '⚙', animate: true },
  'llm_processing':  { label: 'LLM processing...',  color: 'accent',   icon: '◐', animate: true },
  'tool:generic':   { label: 'Running tool...',   color: 'peach',    icon: '›', animate: true },
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

// Animated icon cycling for spinner states
function ProgressIndicator({ state }: { state: string }) {
  const [frame, setFrame] = useState(0)
  const theme = getTheme()
  const frames = ['◐', '◓', '◑', '◒']
  const config = STATE_CONFIG[state]

  useEffect(() => {
    const doAnimate = config?.animate !== false
    if (!doAnimate) return
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % frames.length)
    }, 200)
    return () => clearInterval(timer)
  }, [state])

  const icon = config?.animate ? frames[frame] : config?.icon || '◐'
  return <Text color={theme.muted}>{icon}</Text>
}

// ASCII progress bar for file operations
function AsciiProgressBar({ label, icon }: { label: string; icon: string }) {
  const theme = getTheme()
  const [frame, setFrame] = useState(0)
  const frames = ['◐', '◓', '◑', '◒']
  const spinner = frames[frame]

  useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % frames.length), 200)
    return () => clearInterval(timer)
  }, [])

  // Build a minimal inline progress bar
  const bar = `[${'\u2588'.repeat(6)}${'\u2591'.repeat(4)}]`
  const shortLabel = label.length > 25 ? label.slice(0, 22) + '...' : label

  return (
    <Box>
      <Text color={theme.peach}>{spinner} </Text>
      <Text color={theme.peach}>{bar}</Text>
      <Text color={theme.muted}> {shortLabel}</Text>
    </Box>
  )
}

export const Spinner: React.FC<SpinnerProps> = ({ state, elapsed, toolName, fileName, query }) => {
  const theme = getTheme()
  const config = STATE_CONFIG[state]
  const color = (theme as any)[config?.color || 'accent'] || theme.accent
  const label = config?.label || state
  const icon = config?.icon || '◐'

  // Derive display label from props
  let displayLabel = label
  if (fileName && (state === 'tool:read_file' || state === 'tool:write_file')) {
    displayLabel = `${label.replace('...', '')} \u201c${fileName.length > 20 ? fileName.slice(0, 17) + '...' : fileName}\u201d`
  } else if (query && state === 'searching') {
    displayLabel = `${label.replace('...', '')} \u201c${query.length > 20 ? query.slice(0, 17) + '...' : query}\u201d`
  } else if (toolName && state !== 'done' && state !== 'error') {
    displayLabel = `${label.replace('...', '')} \u201c${toolName}\u201d`
  }

  // Short ops get immediate feedback
  if (elapsed < 100 && state !== 'done' && state !== 'error') {
    return (
      <Box>
        <Text color={theme.warning}>{icon}</Text>
        <Text color={color}> {displayLabel}</Text>
        <Text color={theme.muted}> (starting...)</Text>
      </Box>
    )
  }

  // Done state
  if (state === 'done') {
    return (
      <Box>
        <Text color={theme.success}>✓</Text>
        <Text color={color}> {displayLabel}</Text>
        <Text color={theme.muted}> · {formatElapsed(elapsed)}</Text>
      </Box>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <Box>
        <Text color={theme.error}>✗</Text>
        <Text color={theme.error}> {displayLabel}</Text>
        <Text color={theme.muted}> · {formatElapsed(elapsed)}</Text>
      </Box>
    )
  }

  // Tool-specific: show ASCII progress bar for file ops
  if (state === 'tool:read_file' || state === 'tool:write_file' || state === 'tool:copy_file') {
    return (
      <AsciiProgressBar label={displayLabel} icon={icon} />
    )
  }

  // Default: animated spinner
  const isSlow = elapsed > 30000
  const warningColor = isSlow ? theme.warning : theme.muted
  return (
    <Box>
      <ProgressIndicator state={state} />
      <Text color={color}> {displayLabel}</Text>
      <Text color={warningColor}> · {formatElapsed(elapsed)}</Text>
      {isSlow && <Text color={theme.warning}> (slow)</Text>}
    </Box>
  )
}
