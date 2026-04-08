/**
 * Beast CLI - Modern Minimal TUI
 * Clean, simple, and easy to use
 */

import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'

// Simple theme
export interface Theme {
  bg: string
  fg: string
  accent: string
  success: string
  warning: string
  error: string
  muted: string
}

export const theme: Theme = {
  bg: '#0d1117',
  fg: '#c9d1d9',
  accent: '#58a6ff',
  success: '#3fb950',
  warning: '#d29922',
  error: '#f85149',
  muted: '#484f58',
}

// Provider interface
export interface Provider {
  id: string
  name: string
  shortName: string
  status: 'online' | 'offline' | 'loading'
  defaultModel: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

// Auto-detect providers
async function detectProviders(): Promise<Provider[]> {
  const providers: Provider[] = []

  // Check Ollama
  try {
    const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1000) })
    if (res.ok) {
      const data = await res.json()
      providers.push({
        id: 'ollama',
        name: 'Ollama',
        shortName: 'OLL',
        status: 'online',
        defaultModel: data.models?.[0]?.name || 'llama3.1:8b',
      })
    }
  } catch {}

  // Check LM Studio
  try {
    const res = await fetch('http://localhost:1234/v1/models', { signal: AbortSignal.timeout(1000) })
    if (res.ok) {
      providers.push({
        id: 'lmstudio',
        name: 'LM Studio',
        shortName: 'LMS',
        status: 'online',
        defaultModel: 'microsoft/phi-4-mini',
      })
    }
  } catch {}

  // Cloud providers (need API keys)
  providers.push(
    { id: 'anthropic', name: 'Claude', shortName: 'CLA', status: 'offline', defaultModel: 'claude-sonnet-4-20250514' },
    { id: 'openai', name: 'GPT', shortName: 'GPT', status: 'offline', defaultModel: 'gpt-4o' },
  )

  return providers
}

// Minimal Header
const Header = () => (
  <Box flexDirection="column" alignItems="center" marginY={0}>
    <Text color="cyan" bold>┌─────────────────────────────────────┐</Text>
    <Box>
      <Text color="cyan">│</Text>
      <Text bold color="green"> 🐉 Beast </Text>
      <Text color="muted">│</Text>
      <Text color="fg"> AI Coding Agent </Text>
      <Text color="cyan">│</Text>
    </Box>
    <Text color="cyan">└─────────────────────────────────────┘</Text>
  </Box>
)

// Provider Pills
const ProviderPills = ({
  providers,
  selected,
  onSelect,
}: {
  providers: Provider[]
  selected: string
  onSelect: (id: string) => void
}) => (
  <Box>
    <Text color="muted"> Provider: </Text>
    {providers.map(p => (
      <Box key={p.id} marginRight={1}>
        <Text
          color={p.id === selected ? 'accent' : 'muted'}
          bold={p.id === selected}
        >
          {p.status === 'online' ? '●' : '○'} {p.shortName}
        </Text>
      </Box>
    ))}
  </Box>
)

// Mode Indicator
const ModeBadge = ({ mode }: { mode: string }) => {
  const colors: Record<string, string> = {
    plan: 'cyan',
    write: 'green',
    auto: 'yellow',
    review: 'magenta',
  }
  return (
    <Text color={colors[mode] || 'white'} bold>
      [{mode.toUpperCase()}]
    </Text>
  )
}

// Messages
const Messages = ({ msgs }: { msgs: Message[] }) => (
  <Box flexDirection="column" flexGrow={1} overflowY="auto">
    {msgs.map(msg => (
      <Box key={msg.id} flexDirection="column" marginY={0}>
        <Box>
          <Text bold color={msg.role === 'user' ? 'green' : 'accent'}>
            {msg.role === 'user' ? '❯ ' : '🤖 '}
          </Text>
          <Text color="muted" italic> {new Date(msg.timestamp).toLocaleTimeString()}</Text>
        </Box>
        <Text color="fg">{msg.content.slice(0, 200)}{msg.content.length > 200 ? '...' : ''}</Text>
        <Box height={1} />
      </Box>
    ))}
  </Box>
)

// Input Line
const InputLine = () => (
  <Box>
    <Text color="green">❯ </Text>
    <Text color="muted">Type your request...</Text>
  </Box>
)

// Footer
const Footer = () => (
  <Box justifyContent="space-between">
    <Text color="muted">Tab: Switch │ /help: Commands</Text>
    <Text color="accent">v1.0</Text>
  </Box>
)

// Main Component
export const BeastTUI: React.FC<{
  onProviderChange?: (id: string, model: string) => void
  onModeChange?: (mode: string) => void
}> = ({ onProviderChange, onModeChange }) => {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState('ollama')
  const [mode, setMode] = useState('write')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Auto-detect providers on mount
  useEffect(() => {
    detectProviders().then(detected => {
      setProviders(detected)
      if (detected.length > 0) {
        setSelectedProvider(detected[0].id)
        onProviderChange?.(detected[0].id, detected[0].defaultModel)
      }
      setIsLoading(false)

      // Welcome message
      const online = detected.filter(p => p.status === 'online')
      setMessages([{
        id: '1',
        role: 'assistant',
        content: online.length > 0
          ? `Ready! Using ${online[0].name} with model ${online[0].defaultModel}. Type your request or /help for commands.`
          : 'No local providers found. Configure API keys or start Ollama/LM Studio.',
        timestamp: new Date(),
      }])
    })
  }, [])

  // Keyboard shortcuts
  useInput((input, key) => {
    if (key.tab) {
      const online = providers.filter(p => p.status === 'online')
      const idx = online.findIndex(p => p.id === selectedProvider)
      const next = online[(idx + 1) % online.length]
      if (next) {
        setSelectedProvider(next.id)
        onProviderChange?.(next.id, next.defaultModel)
      }
    }

    if (input === '/help') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Commands:
/model <name>  - Switch model
/mode <plan|write|auto> - Change mode
/clear          - Clear chat
/exit           - Quit`,
        timestamp: new Date(),
      }])
    }

    if (input.startsWith('/mode ')) {
      const newMode = input.slice(6).trim()
      if (['plan', 'write', 'auto', 'review'].includes(newMode)) {
        setMode(newMode)
        onModeChange?.(newMode)
      }
    }

    if (input === '/clear') {
      setMessages([])
    }

    if (input === '/exit') {
      process.exit(0)
    }
  })

  const currentProv = providers.find(p => p.id === selectedProvider)

  return (
    <Box flexDirection="column" padding={1}>
      <Header />

      <Box marginY={1}>
        <ProviderPills
          providers={providers}
          selected={selectedProvider}
          onSelect={id => {
            setSelectedProvider(id)
            const p = providers.find(p => p.id === id)
            if (p) onProviderChange?.(id, p.defaultModel)
          }}
        />
        <Text color="muted"> │ </Text>
        <ModeBadge mode={mode} />
        <Text color="muted"> │ </Text>
        <Text color={currentProv?.status === 'online' ? 'success' : 'error'}>
          {currentProv?.defaultModel || '...'}
        </Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="round"
        flexGrow={1}
        padding={1}
        marginY={0}
      >
        {isLoading ? (
          <Text color="muted">Detecting providers...</Text>
        ) : (
          <Messages msgs={messages} />
        )}
      </Box>

      <Box borderStyle="single" padding={1} marginY={0}>
        <InputLine />
      </Box>

      <Footer />
    </Box>
  )
}

export default BeastTUI
