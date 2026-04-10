// Header Component - ASCII logo + provider/model strip with enhanced visuals
import React, { useEffect, useState } from 'react'
import { Text, Box } from 'ink'
import { getTheme } from '../theme.ts'

interface HeaderProps {
  provider: string
  model: string
  toolsCount: number
}

function useWindowSize() {
  const [size, setSize] = useState({ width: 80, height: 24 })

  useEffect(() => {
    const update = () => {
      try {
        setSize({
          width: process.stdout.columns || 80,
          height: process.stdout.rows || 24,
        })
      } catch {}
    }
    update()
    process.stdout.on('resize', update)
    return () => process.stdout.off('resize', update)
  }, [])

  return size
}

export const Header: React.FC<HeaderProps> = ({ provider, model, toolsCount }) => {
  const { width } = useWindowSize()
  const theme = getTheme()
  const isWide = width >= 60

  const accent = theme.accent
  const blue = theme.sapphire
  const muted = theme.muted
  const tool = theme.peach
  const success = theme.success
  const primary = theme.primary

  if (isWide) {
    return (
      <Box flexDirection="column" marginBottom={1}>
        {/* Main branding with enhanced visual hierarchy */}
        <Box>
          <Text color={accent} bold>  ╔══</Text>
          <Text color={accent} bold>BEAST</Text>
          <Text color={blue} bold> CLI</Text>
          <Text color={accent} bold>══╗</Text>
        </Box>

        {/* Provider info bar with visual separators */}
        <Box marginTop={1}>
          <Text color={muted}>  │</Text>
          <Text color={success}> {provider}</Text>
          <Text color={muted}> │</Text>
          <Text color={blue}> {model}</Text>
          <Text color={muted}> │</Text>
          <Text color={tool}> {toolsCount} tools</Text>
          <Text color={muted}> │</Text>
        </Box>

        {/* Decorative underline */}
        <Box>
          <Text color={accent}>  ╰{'─'.repeat(Math.min(width - 4, 50))}╯</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box marginBottom={1} flexDirection="column">
      <Box>
        <Text color={accent} bold>BEAST</Text>
        <Text color={blue} bold> CLI</Text>
        <Text color={muted}> · </Text>
        <Text color={success}>{provider}</Text>
      </Box>
      <Box>
        <Text color={blue}>{model}</Text>
        <Text color={muted}> · </Text>
        <Text color={tool}>{toolsCount} tools</Text>
      </Box>
    </Box>
  )
}
