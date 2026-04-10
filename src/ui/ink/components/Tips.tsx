// Tips Component - Rotating tip display with animation
import React, { useState, useEffect } from 'react'
import { Text, Box } from 'ink'
import { getTheme } from '../theme.ts'
import { ALL_TIPS } from '../../tips.ts'

interface TipsProps {
  tip?: string
}

export const Tips: React.FC<TipsProps> = ({ tip }) => {
  const [visible, setVisible] = useState(true)
  const theme = getTheme()

  const displayTip = tip || (ALL_TIPS.length > 0
    ? ALL_TIPS[Math.floor(Math.random() * ALL_TIPS.length)].tip
    : 'Use /help for all commands'
  )

  useEffect(() => {
    // Fade animation (simulated with visibility toggle)
    const interval = setInterval(() => {
      setVisible(v => !v)
    }, 30000) // Change tip every 30s

    return () => clearInterval(interval)
  }, [])

  return (
    <Box paddingTop={1}>
      <Text color={theme.warning}>*</Text>
      <Text color={theme.secondary}> {displayTip}</Text>
      <Text color={theme.muted}> (/? for help)</Text>
    </Box>
  )
}
