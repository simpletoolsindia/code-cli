/**
 * BeastLogo - Ink component that renders gradient ASCII art logos.
 * Uses figlet + chalk (via ascii-logo.ts) for generation.
 */
import React, { useMemo } from 'react'
import { Text, Box } from 'ink'
import { generateLogo, LOGO_PALETTES } from '../../ascii-logo.ts'

interface BeastLogoProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  palette?: string
  font?: string
}

const SIZE_CONFIGS = {
  sm: { font: 'ANSI Shadow', maxWidth: 40 },
  md: { font: 'ANSI Shadow', maxWidth: 60 },
  lg: { font: 'ANSI Shadow', maxWidth: 80 },
}

export const BeastLogo: React.FC<BeastLogoProps> = ({
  text = 'BEAST',
  size = 'md',
  palette = 'beast-purple',
  font,
}) => {
  const config = SIZE_CONFIGS[size]
  const finalFont = font || config.font

  // Memoize so we don't re-generate on every render
  const logoLines = useMemo(() => {
    const raw = generateLogo(text, palette, finalFont)
    // Split into lines for rendering
    return raw.split('\n')
  }, [text, palette, finalFont])

  return (
    <Box flexDirection="column">
      {logoLines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
    </Box>
  )
}
