// Ink TUI Root App - Main entry point for React/Ink interface
import React, { useState, useEffect, useCallback } from 'react'
import { render, useApp } from 'ink'
import { Box, Text } from 'ink'
import { Header } from './components/Header.tsx'
import { Spinner } from './components/Spinner.tsx'
import { Body } from './components/Body.tsx'
import { Input } from './components/Input.tsx'
import { StatusBar } from './components/StatusBar.tsx'
import { ToolPanel } from './components/ToolPanel.tsx'
import { Tips } from './components/Tips.tsx'
import { useAgentLoop } from './hooks/useAgentLoop.ts'
import { getTheme, setThemeName, listThemeNames } from './theme.ts'
import { getFormattedTools } from '../../native-tools/index.ts'
import { loadSession } from '../../config/index.ts'
import { getApiKeyFromEnv, getBaseUrl } from '../../providers/discover.ts'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolCalls?: Array<{ id: string; name: string; arguments?: Record<string, unknown>; result?: string }>
}

// Detect theme from environment
const THEME_ENV = process.env.BEAST_THEME
if (THEME_ENV) {
  const themes = listThemeNames()
  if (themes.includes(THEME_ENV as any)) {
    setThemeName(THEME_ENV as any)
  }
}

const BeastApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [spinnerStart, setSpinnerStart] = useState(0)
  const [provider, setProvider] = useState('ollama')
  const [model, setModel] = useState('llama3.2')
  const [toolsCount, setToolsCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Track whether we've already added the assistant response to avoid duplicates
  const [responseAdded, setResponseAdded] = useState(false)
  const { exit } = useApp()
  const theme = getTheme()

  useEffect(() => {
    const saved = loadSession()
    if (saved) {
      setProvider(saved.provider)
      setModel(saved.model)
    }
    setToolsCount(getFormattedTools().length)
  }, [])

  const { state, run } = useAgentLoop({
    provider,
    model,
    apiKey: getApiKeyFromEnv(provider) || undefined,
    baseUrl: getBaseUrl(provider) || undefined,
  })

  // Track spinner start with immediate feedback
  useEffect(() => {
    if (state.phase === 'thinking' || state.phase === 'streaming') {
      if (spinnerStart === 0) setSpinnerStart(Date.now())
      if (!isProcessing) setIsProcessing(true)
      setErrorMessage(null)
      setResponseAdded(false)
    } else if (state.phase === 'done' || state.phase === 'error') {
      setSpinnerStart(0)
      setIsProcessing(false)
    }
  }, [state.phase])

  // Sync agent result into messages — fires once per turn
  useEffect(() => {
    if ((state.phase === 'done' || state.phase === 'error') && !responseAdded) {
      setResponseAdded(true)
      if (state.phase === 'error' && state.error) {
        setErrorMessage(state.error)
      }
      setMessages(prev => {
        const last = prev[prev.length - 1]
        // Avoid duplicate if already added
        if (last?.role === 'assistant' && last.content === state.streamedText) return prev
        return [
          ...prev,
          {
            role: 'assistant' as const,
            content: state.streamedText || (state.phase === 'error' ? `Error: ${state.error}` : ''),
            toolCalls: state.toolCalls.map(tc => ({
              id: tc.id,
              name: tc.name,
              arguments: tc.arguments,
              result: tc.result,
            })),
          },
        ]
      })
    }
  }, [state.phase, state.streamedText, state.error, responseAdded])

  const handleSubmit = useCallback(async (input: string) => {
    if (!input.trim()) return

    // Immediate visual feedback before async processing starts
    setSpinnerStart(Date.now())
    setIsProcessing(true)
    setErrorMessage(null)
    setResponseAdded(false)

    // Add user message immediately for visual feedback
    setMessages(prev => [...prev, { role: 'user', content: input }])

    // Run the agent — errors are caught inside useAgentLoop
    run(input).catch((err: Error) => {
      setErrorMessage(err.message || 'Request failed')
      setIsProcessing(false)
      setSpinnerStart(0)
    })
  }, [run])

  const getSpinnerState = () => {
    if (state.phase === 'thinking') return 'thinking'
    if (state.phase === 'streaming') return 'formatting'
    if (state.phase === 'error') return 'error'
    return 'done'
  }

  const elapsed = spinnerStart > 0 ? Date.now() - spinnerStart : 0

  return (
    <Box flexDirection="column">
      <Header provider={provider} model={model} toolsCount={toolsCount} />

      {/* Immediate feedback spinner - shows as soon as user submits */}
      {(state.phase === 'thinking' || state.phase === 'streaming') && (
        <Box paddingBottom={1}>
          <Spinner state={getSpinnerState()} elapsed={elapsed} />
        </Box>
      )}

      {/* Error message display with immediate visibility */}
      {errorMessage && (
        <Box paddingBottom={1}>
          <Text color={theme.error}>Error: {errorMessage}</Text>
        </Box>
      )}

      <Body messages={messages} />

      {/* Show running tools with status */}
      {state.toolCalls.filter(tc => tc.status === 'running').length > 0 && (
        <Box flexDirection="column">
          {state.toolCalls
            .filter(tc => tc.status === 'running')
            .map(tc => (
              <ToolPanel key={tc.id} name={tc.name} args={tc.arguments} status={tc.status} />
            ))}
        </Box>
      )}

      {state.phase === 'idle' && <Tips />}

      {/* Only show error text in status bar for non-critical errors */}
      {state.phase === 'error' && state.error && !errorMessage && (
        <Text color={theme.error}>{state.error}</Text>
      )}

      {/* Pass disabled state to Input for immediate visual feedback */}
      <Input onSubmit={handleSubmit} disabled={isProcessing} />

      <StatusBar
        usedTokens={state.usage?.totalTokens}
        maxTokens={128000}
        provider={provider}
        model={model}
      />
    </Box>
  )
}

// CLI entry point — render immediately
if (!process.stdin.isTTY) {
  console.error('')
  console.error('  !  Ink TUI cannot run in non-interactive mode')
  console.error('')
  console.error('  Available alternatives:')
  console.error('    beast --defaults     - REPL mode with AI chat (recommended)')
  console.error('    beast                - Interactive REPL mode')
  console.error('    beast --help         - Show all commands')
  console.error('    beast --models       - List available models')
  console.error('')
  console.error('  Note: TUI requires a real terminal. For SSH, use: ssh -t host "beast"')
  console.error('')
  process.exit(1)
}

// Windows detection — Ink has known compatibility issues on Windows
if (process.platform === 'win32') {
  console.error('')
  console.error('  ⚠️  Rich TUI (--tui) has limited support on Windows.')
  console.error('  ℹ️  Recommended: Use `beast --defaults` or `beast` for REPL mode.')
  console.error('  ℹ️  You can still try --tui, but if it fails, use REPL instead.')
  console.error('')
  // Continue anyway — user can still try
}

render(<BeastApp />)

