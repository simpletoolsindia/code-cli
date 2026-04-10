// Input Component - Custom input with tab completion + immediate feedback
import React, { useState, useEffect } from 'react'
import { Text, Box } from 'ink'
import { useInput } from 'ink'
import { getTheme } from '../theme.ts'
import { listAgents } from '../../../agents/index.ts'

interface InputProps {
  onSubmit: (value: string) => void
  disabled?: boolean
}

const SLASH_COMMANDS = [
  '/help', '/switch', '/models', '/model', '/provider', '/tools',
  '/clear', '/clean', '/init', '/agents', '/login', '/logout', '/exit',
  '/agents list', '/agents create', '/agents use', '/agents delete', '/agents info',
]

export const Input: React.FC<InputProps> = ({ onSubmit, disabled = false }) => {
  const [value, setValue] = useState('')
  const [suggestionIdx, setSuggestionIdx] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [agentSuggestions, setAgentSuggestions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmit, setLastSubmit] = useState<string>('')
  const theme = getTheme()

  // Load agent names for @ autocomplete (once)
  try {
    const agents = listAgents()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [loaded, setLoaded] = useState(false)
    if (!loaded) {
      setAgentSuggestions(agents.map((a: any) => '@' + a.name))
      setLoaded(true)
    }
  } catch {
    // agents not available — ignore
  }

  useInput((input, key) => {
    // Immediate visual feedback for disabled state
    if (disabled || isSubmitting) {
      return
    }

    const allSuggestions = value.startsWith('@')
      ? agentSuggestions.filter(s => s.startsWith(value))
      : SLASH_COMMANDS.filter(s => s.startsWith(value))

    if (key.return) {
      if (value.trim()) {
        const submitValue = value
        setLastSubmit(submitValue)
        setIsSubmitting(true)
        setValue('')
        setSuggestionIdx(-1)
        setShowSuggestions(false)

        // Immediate visual feedback before async completes
        setTimeout(() => {
          onSubmit(submitValue)
          setIsSubmitting(false)
        }, 50) // Small delay for visual feedback
      }
    } else if (key.tab) {
      if (allSuggestions.length === 1) {
        setValue(allSuggestions[0])
      } else if (allSuggestions.length > 1) {
        const next = (suggestionIdx + 1) % allSuggestions.length
        setSuggestionIdx(next)
        setValue(allSuggestions[next])
      }
      setShowSuggestions(allSuggestions.length > 0)
    } else if (key.upArrow) {
      if (allSuggestions.length > 0) {
        const next = suggestionIdx <= 0 ? allSuggestions.length - 1 : suggestionIdx - 1
        setSuggestionIdx(next)
        setValue(allSuggestions[next])
        setShowSuggestions(true)
      }
    } else if (key.downArrow) {
      if (allSuggestions.length > 0) {
        const next = (suggestionIdx + 1) % allSuggestions.length
        setSuggestionIdx(next)
        setValue(allSuggestions[next])
        setShowSuggestions(true)
      }
    } else if (key.ctrlC) {
      if (isSubmitting) {
        setIsSubmitting(false)
      }
      setValue('')
      setSuggestionIdx(-1)
      setShowSuggestions(false)
    } else if (key.backspace || key.delete) {
      setValue(prev => prev.slice(0, -1))
      setSuggestionIdx(-1)
      setShowSuggestions(false)
    } else if (input && !key.ctrl && !key.meta) {
      setValue(prev => prev + input)
      setSuggestionIdx(-1)
      const newValue = value + input
      if (newValue.startsWith('@')) {
        const matches = agentSuggestions.filter(s => s.startsWith(newValue))
        setShowSuggestions(matches.length > 0)
      } else if (newValue === '/') {
        setShowSuggestions(SLASH_COMMANDS.length > 0)
      }
    }
  })

  const filteredSuggestions = value.startsWith('@')
    ? agentSuggestions.filter(s => s.startsWith(value)).slice(0, 5)
    : SLASH_COMMANDS.filter(s => s.startsWith(value)).slice(0, 5)

  return (
    <Box flexDirection="column">
      {/* Immediate feedback when submitting */}
      {isSubmitting ? (
        <Box>
          <Text color={theme.accent}>{'> '}</Text>
          <Text color={theme.muted}>{lastSubmit}</Text>
          <Text color={theme.warning}> {'◐ processing...'}</Text>
        </Box>
      ) : (
        <Box>
          <Text color={theme.accent}>{'> '}</Text>
          <Text>{value}</Text>
          <Text color={theme.muted}>_</Text>
        </Box>
      )}

      {/* Show suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Box flexDirection="column" paddingTop={1}>
          {filteredSuggestions.map((s, i) => (
            <Text key={i} color={i === suggestionIdx ? theme.accent : theme.muted}>
              {s}
            </Text>
          ))}
        </Box>
      )}

      {/* Disabled state visual indicator */}
      {disabled && (
        <Box paddingTop={1}>
          <Text color={theme.warning}>Processing... (Ctrl+C to cancel)</Text>
        </Box>
      )}
    </Box>
  )
}
