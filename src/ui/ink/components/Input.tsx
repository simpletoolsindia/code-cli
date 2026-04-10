// Input Component - Custom input with tab completion
import React, { useState, useRef, useEffect } from 'react'
import { Text, Box } from 'ink'
import { useInput } from 'ink'
import { getTheme } from '../theme.ts'
import { listAgents } from '../../../agents/index.ts'

interface InputProps {
  onSubmit: (value: string) => void
  suggestions?: string[]
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
  const inputRef = useRef<HTMLInputElement>(null)
  const theme = getTheme()

  useEffect(() => {
    // Load agent names for @ autocomplete
    try {
      const agents = listAgents()
      setAgentSuggestions(agents.map((a: any) => '@' + a.name))
    } catch {
      setAgentSuggestions([])
    }
  }, [])

  useInput((input, key) => {
    if (key.return) {
      if (value.trim()) {
        onSubmit(value)
        setValue('')
        setSuggestionIdx(-1)
        setShowSuggestions(false)
      }
    } else if (key.tab) {
      // Tab completion
      const allSuggestions = value.startsWith('@')
        ? agentSuggestions.filter(s => s.startsWith(value))
        : SLASH_COMMANDS.filter(s => s.startsWith(value))

      if (allSuggestions.length === 1) {
        setValue(allSuggestions[0])
      } else if (allSuggestions.length > 1 && suggestionIdx < allSuggestions.length - 1) {
        setSuggestionIdx(prev => prev + 1)
        setValue(allSuggestions[suggestionIdx + 1])
      }
      setShowSuggestions(allSuggestions.length > 0)
    } else if (key.upArrow) {
      const allSuggestions = value.startsWith('@')
        ? agentSuggestions.filter(s => s.startsWith(value))
        : SLASH_COMMANDS.filter(s => s.startsWith(value))

      if (allSuggestions.length > 0) {
        setSuggestionIdx(prev => (prev <= 0 ? allSuggestions.length - 1 : prev - 1))
        setValue(allSuggestions[suggestionIdx] || value)
      }
    } else if (key.downArrow) {
      const allSuggestions = value.startsWith('@')
        ? agentSuggestions.filter(s => s.startsWith(value))
        : SLASH_COMMANDS.filter(s => s.startsWith(value))

      if (allSuggestions.length > 0) {
        setSuggestionIdx(prev => (prev >= allSuggestions.length - 1 ? 0 : prev + 1))
        setValue(allSuggestions[suggestionIdx] || value)
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
      // Show suggestions as user types /
      if (input === '/') {
        const matches = SLASH_COMMANDS.filter(s => s.startsWith('/'))
        setShowSuggestions(matches.length > 0)
      } else if (value.startsWith('@')) {
        const matches = agentSuggestions.filter(s => s.startsWith(value))
        setShowSuggestions(matches.length > 0)
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
