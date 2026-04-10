// StatusBar Component - Token usage bar, provider/model, agent indicator
import React from 'react'
import { Text, Box } from 'ink'
import { getTheme } from '../theme.ts'

interface StatusBarProps {
  usedTokens?: number
  maxTokens?: number
  provider?: string
  model?: string
  agent?: string
}

function TokenBar({ used, max }: { used: number; max: number }) {
  const theme = getTheme()
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0
  const filled = Math.round((pct / 100) * 12)
  const empty = 12 - filled

  let barColor = theme.success
  if (pct > 50) barColor = theme.sapphire
  if (pct > 80) barColor = theme.warning

  return (
    <Text>
      <Text color={barColor}>{'█'.repeat(filled)}</Text>
      <Text color={theme.muted}>{'░'.repeat(empty)}</Text>
      <Text color={theme.muted}> {used.toLocaleString()}/{max.toLocaleString()}</Text>
    </Text>
  )
}

export const StatusBar: React.FC<StatusBarProps> = ({
  usedTokens = 0,
  maxTokens = 128000,
  provider,
  model,
  agent,
}) => {
  const theme = getTheme()

  return (
    <Box borderStyle="single" borderDim={false} paddingX={1}>
      <Box flexGrow={1}>
        {provider && (
          <Text color={theme.success}>{provider}</Text>
        )}
        {model && (
          <>
            <Text color={theme.muted}> · </Text>
            <Text color={theme.info}>{model}</Text>
          </>
        )}
      </Box>
      <Box>
        {agent && (
          <>
            <Text color={theme.accent}>@</Text>
            <Text color={theme.accent}>{agent}</Text>
            <Text color={theme.muted}> · </Text>
          </>
        )}
        <TokenBar used={usedTokens} max={maxTokens} />
      </Box>
    </Box>
  )
}
