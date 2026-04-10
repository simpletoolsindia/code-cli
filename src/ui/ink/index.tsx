// Ink TUI Root App - Main entry point for React/Ink interface
import React, { useState, useEffect } from 'react'
import { render, AppContext, useApp } from 'ink'
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
import { s, fg } from '../colors.ts'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolCalls?: Array<{ name: string; arguments?: Record<string, unknown>; result?: string }>
}

// Detect theme from environment
const THEME_ENV = process.env.BEAST_THEME
if (THEME_ENV) {
  const themes = listThemeNames()
  if (themes.includes(THEME_ENV as any)) {
    setThemeName(THEME_ENV as any)
  }
}

interface BeastAppProps {
  provider?: string
  model?: string
  theme?: string
}

const BeastApp: React.FC<BeastAppProps> = ({ provider: initProvider, model: initModel, theme: initTheme }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [spinnerStart, setSpinnerStart] = useState(0)
  const [provider, setProvider] = useState(initProvider || 'ollama')
  const [model, setModel] = useState(initModel || 'llama3.2')
  const [toolsCount, setToolsCount] = useState(0)
  const theme = getTheme()

  useEffect(() => {
    // Load session or defaults
    const saved = loadSession()
    if (saved && !initProvider) {
      setProvider(saved.provider)
      setModel(saved.model)
    }

    // Count tools
    const tools = getFormattedTools()
    setToolsCount(tools.length)
  }, [])

  const { state, run, reset } = useAgentLoop({
    provider,
    model,
    apiKey: getApiKeyFromEnv(provider) || undefined,
    baseUrl: getBaseUrl(provider) || undefined,
    messages: messages.map(m => ({ ...m, toolCalls: m.toolCalls as any })),
  })

  useEffect(() => {
    if (state.phase === 'thinking' || state.phase === 'streaming') {
      if (spinnerStart === 0) setSpinnerStart(Date.now())
    }
  }, [state.phase])

  const handleSubmit = async (input: string) => {
    if (!input.trim()) return

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setSpinnerStart(Date.now())

    await run(input)

    // Add assistant response
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: state.streamedText,
        toolCalls: state.toolCalls.map(tc => ({
          name: tc.name,
          arguments: tc.arguments,
          result: tc.result,
        })),
      },
    ])
  }

  const getSpinnerState = () => {
    if (state.phase === 'thinking') return 'thinking'
    if (state.phase === 'streaming') return 'formatting'
    if (state.phase === 'done') return 'done'
    if (state.phase === 'error') return 'error'
    return 'done'
  }

  const elapsed = spinnerStart > 0 ? Date.now() - spinnerStart : 0

  return (
    <Box flexDirection="column">
      <Header provider={provider} model={model} toolsCount={toolsCount} />

      {(state.phase === 'thinking' || state.phase === 'streaming') && (
        <Box paddingBottom={1}>
          <Spinner state={getSpinnerState()} elapsed={elapsed} />
        </Box>
      )}

      <Body messages={messages} />

      {state.toolCalls.filter(tc => tc.status === 'running').length > 0 && (
        <Box flexDirection="column">
          {state.toolCalls
            .filter(tc => tc.status === 'running')
            .map((tc, i) => (
              <ToolPanel
                key={i}
                name={tc.name}
                args={tc.arguments}
                status={tc.status}
              />
            ))}
        </Box>
      )}

      {state.phase === 'idle' && <Tips />}

      {state.phase === 'error' && (
        <Text color={theme.error}>Error: {state.error}</Text>
      )}

      {state.phase === 'idle' && (
        <Input onSubmit={handleSubmit} />
      )}

      <StatusBar
        usedTokens={state.usage?.totalTokens}
        maxTokens={128000}
        provider={provider}
        model={model}
      />
    </Box>
  )
}

export function renderBeastApp(options: BeastAppProps = {}) {
  return render(<BeastApp {...options} />)
}

// CLI entry point
export { BeastApp }
