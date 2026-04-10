// Input Component - Custom input with tab completion
import React, { useState } from 'react'
import { Text, Box } from 'ink'
import { useInput } from 'ink'
import { getTheme } from '../theme.ts'
import { listAgents } from '../../../agents/index.ts'

interface InputProps {
  onSubmit: (value: string) => void
}

const SLASH_COMMANDS = [
  '/help', '/switch', '/models', '/model', '/provider', '/tools',
  '/clear', '/clean', '/init', '/agents', '/login', '/logout', '/exit',
  '/agents list', '/agents create', '/agents use', '/agents delete', '/agents info',
]

export const Input: React.FC<InputProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('')
  const [suggestionIdx, setSuggestionIdx] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [agentSuggestions, setAgentSuggestions] = useState<string[]>([])
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
    const allSuggestions = value.startsWith('@')
      ? agentSuggestions.filter(s => s.startsWith(value))
      : SLASH_COMMANDS.filter(s => s.startsWith(value))

    if (key.return) {
      if (value.trim()) {
        onSubmit(value)
        setValue('')
        setSuggestionIdx(-1)
        setShowSuggestions(false)
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
      <Box>
        <Text color={theme.accent}>&gt; </Text>
        <Text>{value}</Text>
        <Text color={theme.muted}>_</Text>
      </Box>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Box flexDirection="column" paddingTop={1}>
          {filteredSuggestions.map((s, i) => (
            <Text key={i} color={i === suggestionIdx ? theme.accent : theme.muted}>
              {s}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}
