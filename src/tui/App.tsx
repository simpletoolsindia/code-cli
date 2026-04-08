import React, { useState, useEffect, useCallback } from 'react'
import { Box, Text, useInput } from 'ink'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'

// Theme colors
export type ThemeName = 'dark' | 'light' | 'neon'

export interface Theme {
  name: ThemeName
  background: string
  foreground: string
  accent: string
  error: string
  warning: string
  success: string
  muted: string
  border: string
}

export const themes: Record<ThemeName, Theme> = {
  dark: {
    name: 'dark',
    background: '#0a0a0f',
    foreground: '#e0e0e0',
    accent: '#00ff88',
    error: '#ff4757',
    warning: '#ffa502',
    success: '#2ed573',
    muted: '#57606f',
    border: '#2f3542',
  },
  light: {
    name: 'light',
    background: '#ffffff',
    foreground: '#2f3542',
    accent: '#1e90ff',
    error: '#ff4757',
    warning: '#ffa502',
    success: '#2ed573',
    muted: '#a4b0be',
    border: '#dfe4ea',
  },
  neon: {
    name: 'neon',
    background: '#000000',
    foreground: '#ffffff',
    accent: '#ff00ff',
    error: '#ff0000',
    warning: '#ffff00',
    success: '#00ff00',
    muted: '#888888',
    border: '#ff00ff',
  },
}

// Available providers with status
export interface Provider {
  id: string
  name: string
  icon: string
  status: 'online' | 'offline' | 'loading'
  models: string[]
  defaultModel: string
  baseUrl?: string
}

export const defaultProviders: Provider[] = [
  {
    id: 'ollama',
    name: 'Ollama',
    icon: '🦙',
    status: 'online',
    models: ['llama3.1:8b', 'qwen2.5-coder:32b', 'gemma4:31b', 'codellama', 'mistral'],
    defaultModel: 'llama3.1:8b',
    baseUrl: 'http://localhost:11434',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    icon: '🏋️',
    status: 'online',
    models: ['deepseek-r1-distill-qwen-32b', 'gemma-4-31b-nvfp4', 'glm-4.7-flash'],
    defaultModel: 'deepseek-r1-distill-qwen-32b',
    baseUrl: 'http://localhost:1234/v1',
  },
  {
    id: 'anthropic',
    name: 'Claude',
    icon: '🧠',
    status: 'offline',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    defaultModel: 'claude-sonnet-4-20250514',
  },
  {
    id: 'openai',
    name: 'GPT',
    icon: '🤖',
    status: 'offline',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🌐',
    status: 'offline',
    models: ['qwen/qwen-2.5-72b', 'anthropic/claude-3-sonnet', 'google/gemini-pro'],
    defaultModel: 'qwen/qwen-2.5-72b',
  },
]

// Message types
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: Date
  provider?: string
  model?: string
  tokens?: number
}

export interface AppState {
  messages: Message[]
  currentProvider: string
  currentModel: string
  mode: 'plan' | 'write' | 'auto' | 'review' | 'debug'
  tokens: number
  isLoading: boolean
  showHelp: boolean
  showProviders: boolean
  theme: ThemeName
}

interface BeastTUIProps {
  onSend?: (message: string) => void
  onProviderChange?: (provider: string, model: string) => void
  onModeChange?: (mode: AppState['mode']) => void
}

// Mode configs
const modeConfigs = {
  plan: { icon: '📋', color: 'cyan', label: 'PLAN', desc: 'Read-only, no edits' },
  write: { icon: '✏️', color: 'green', label: 'WRITE', desc: 'Full edit access' },
  auto: { icon: '🚀', color: 'yellow', label: 'AUTO', desc: 'Auto-approve all' },
  review: { icon: '🔍', color: 'magenta', label: 'REVIEW', desc: 'Read-only mode' },
  debug: { icon: '🐛', color: 'red', label: 'DEBUG', desc: 'Verbose logging' },
}

// ASCII Art Header
const Header = () => (
  <Box flexDirection="column" alignItems="center" marginY={0}>
    <Text>
      <Text color="cyan">╔══════════════════════════════════════════════════════════════════╗</Text>
    </Text>
    <Box>
      <Text color="cyan">║</Text>
      <Text bold color="green">  🐉 BEAST CLI </Text>
      <Text color="cyan">│</Text>
      <Text color="white"> AI Coding Agent with 45+ Providers </Text>
      <Text color="cyan">║</Text>
    </Box>
    <Text>
      <Text color="cyan">╚══════════════════════════════════════════════════════════════════╝</Text>
    </Text>
  </Box>
)

// Provider Status Indicator
const ProviderStatus = ({ provider }: { provider: Provider }) => {
  const statusColors = {
    online: 'green',
    offline: 'red',
    loading: 'yellow',
  }
  const statusIcons = {
    online: '●',
    offline: '○',
    loading: '◐',
  }

  return (
    <Box>
      <Text color="gray"> {provider.icon} </Text>
      <Text bold color={statusColors[provider.status] as any}>{provider.name}</Text>
      <Text color="gray"> [{statusIcons[provider.status]}]</Text>
    </Box>
  )
}

// Model Selector Component
const ModelSelector = ({
  providers,
  currentProvider,
  currentModel,
  onSelect,
}: {
  providers: Provider[]
  currentProvider: string
  currentModel: string
  onSelect: (providerId: string, model: string) => void
}) => {
  const [selectedProvider, setSelectedProvider] = useState(currentProvider)
  const [selecting, setSelecting] = useState(false)

  useInput((input, key) => {
    if (key.tab) {
      setSelecting(!selecting)
    }
    if (selecting) {
      const provs = providers.filter(p => p.status === 'online')
      const idx = provs.findIndex(p => p.id === selectedProvider)
      if (key.leftArrow || key.upArrow) {
        const newIdx = (idx - 1 + provs.length) % provs.length
        setSelectedProvider(provs[newIdx].id)
      }
      if (key.rightArrow || key.downArrow) {
        const newIdx = (idx + 1) % provs.length
        setSelectedProvider(provs[newIdx].id)
      }
      if (key.return) {
        onSelect(selectedProvider, providers.find(p => p.id === selectedProvider)?.defaultModel || '')
        setSelecting(false)
      }
      if (key.escape) {
        setSelecting(false)
      }
    }
  })

  const currentProv = providers.find(p => p.id === selectedProvider)

  return (
    <Box flexDirection="column">
      {selecting ? (
        <Box flexDirection="column">
          <Text color="yellow">  ◀ ▶ Select Provider (Tab to confirm, Esc to cancel) </Text>
          <Box marginTop={1}>
            {providers.filter(p => p.status === 'online').map(p => (
              <Box key={p.id} marginRight={2}>
                <Text
                  color={p.id === selectedProvider ? 'green' : 'gray'}
                  bold={p.id === selectedProvider}
                >
                  {p.icon} {p.name}
                </Text>
              </Box>
            ))}
          </Box>
          {currentProv && (
            <Box flexDirection="column" marginTop={1} marginLeft={2}>
              <Text color="gray">  Models:</Text>
              {currentProv.models.map(m => (
                <Text key={m} color={m === currentModel ? 'cyan' : 'gray'}>
                  • {m}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          <Text color="gray">  Provider: </Text>
          <Text bold color="green">{currentProv?.icon} {currentProv?.name}</Text>
          <Text color="gray"> | Model: </Text>
          <Text color="cyan">{currentModel}</Text>
          <Text color="gray"> [Press Tab to switch]</Text>
        </Box>
      )}
    </Box>
  )
}

// Mode Selector
const ModeSelector = ({
  mode,
  onChange,
}: {
  mode: AppState['mode']
  onChange: (mode: AppState['mode']) => void
}) => {
  const [selectedMode, setSelectedMode] = useState(mode)

  useInput((input, key) => {
    if (key.ctrl && input === 'p') {
      const modes = Object.keys(modeConfigs) as AppState['mode'][]
      const idx = modes.indexOf(selectedMode)
      const newIdx = (idx + 1) % modes.length
      setSelectedMode(modes[newIdx])
      onChange(modes[newIdx])
    }
  })

  const config = modeConfigs[mode]

  return (
    <Box>
      <Text color="gray">  Mode: </Text>
      <Text bold color={config.color as any}>{config.icon} {config.label}</Text>
      <Text color="gray"> [Ctrl+P: cycle] {config.desc}</Text>
    </Box>
  )
}

// Token Counter
const TokenCounter = ({ tokens }: { tokens: number }) => {
  const color = tokens > 40000 ? 'red' : tokens > 20000 ? 'yellow' : 'green'
  const percentage = Math.min((tokens / 50000) * 100, 100).toFixed(0)

  return (
    <Box>
      <Text color="gray">Tokens: </Text>
      <Text color={color as any} bold>{tokens.toLocaleString()}</Text>
      <Text color="gray"> ({percentage}%)</Text>
    </Box>
  )
}

// Message Display
const MessageList = ({ messages }: { messages: Message[] }) => {
  if (messages.length === 0) {
    return (
      <Box flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
        <Text color="gray" italic>No messages yet. Type /help for commands or just start chatting!</Text>
        <Box marginTop={1}>
          <Text color="cyan">Examples:</Text>
        </Box>
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray">  • "Create a new React component for user login"</Text>
          <Text color="gray">  • "Fix the bug in src/api.ts"</Text>
          <Text color="gray">  • "Add authentication to this project"</Text>
          <Text color="gray">  • "Explain how the database schema works"</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" flexGrow={1} overflowY="auto">
      {messages.map(msg => {
        const roleColors = {
          user: 'green',
          assistant: 'cyan',
          system: 'yellow',
          tool: 'magenta',
        }
        const roleIcons = {
          user: '👤',
          assistant: '🤖',
          system: '⚙️',
          tool: '🔧',
        }

        return (
          <Box key={msg.id} flexDirection="column" marginY={0}>
            <Box>
              <Text bold color={roleColors[msg.role] as any}>
                {roleIcons[msg.role]} {msg.role.toUpperCase()}
              </Text>
              {msg.provider && (
                <Text color="gray"> via {msg.provider}/{msg.model}</Text>
              )}
              {msg.tokens && (
                <Text color="gray"> ({msg.tokens} tokens)</Text>
              )}
              <Text color="gray"> • {msg.timestamp.toLocaleTimeString()}</Text>
            </Box>
            <Box marginLeft={2} flexDirection="column">
              <Text color="white">{msg.content.slice(0, 500)}{msg.content.length > 500 ? '...' : ''}</Text>
            </Box>
            <Box height={1} />
          </Box>
        )
      })}
    </Box>
  )
}

// Quick Commands Help
const HelpPanel = () => (
  <Box flexDirection="column" borderStyle="round" borderDim={false} padding={1}>
    <Text bold color="yellow">⚡ Quick Commands</Text>
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color="cyan">  Tab    </Text>
        <Text color="white">Switch Provider/Model</Text>
      </Box>
      <Box>
        <Text color="cyan">  Ctrl+P </Text>
        <Text color="white">Cycle Mode</Text>
      </Box>
      <Box>
        <Text color="cyan">  Ctrl+L </Text>
        <Text color="white">Clear Chat</Text>
      </Box>
      <Box>
        <Text color="cyan">  /help  </Text>
        <Text color="white">Show Help</Text>
      </Box>
      <Box>
        <Text color="cyan">  /mode  </Text>
        <Text color="white">Change Mode (plan/write/auto/review/debug)</Text>
      </Box>
      <Box>
        <Text color="cyan">  /model </Text>
        <Text color="white">Change Model</Text>
      </Box>
      <Box>
        <Text color="cyan">  /exit  </Text>
        <Text color="white">Exit Beast CLI</Text>
      </Box>
    </Box>
  </Box>
)

// Input Line Component
const InputLine = ({ isLoading }: { isLoading: boolean }) => (
  <Box>
    {isLoading ? (
      <Text color="yellow" bold>⏳ Thinking...</Text>
    ) : (
      <>
        <Text color="green">❯</Text>
        <Text color="gray"> Type your message... </Text>
      </>
    )}
  </Box>
)

// Footer
const Footer = () => (
  <Box justifyContent="space-between">
    <Text color="gray">Press Tab: Switch Model | Ctrl+P: Cycle Mode | /help: Commands</Text>
    <Text color="cyan">🐉 Beast CLI v1.0</Text>
  </Box>
)

// Main TUI Component
export const BeastTUI: React.FC<BeastTUIProps> = ({
  onSend,
  onProviderChange,
  onModeChange,
}) => {
  const [state, setState] = useState<AppState>({
    messages: [],
    currentProvider: 'ollama',
    currentModel: 'llama3.1:8b',
    mode: 'write',
    tokens: 0,
    isLoading: false,
    showHelp: false,
    showProviders: true,
    theme: 'dark',
  })

  const [inputValue, setInputValue] = useState('')
  const theme = themes[state.theme]

  // Handle input
  useInput((input, key) => {
    // Clear chat
    if (key.ctrl && input === 'l') {
      setState(s => ({ ...s, messages: [], tokens: 0 }))
      return
    }

    // Toggle help
    if (input === '/help') {
      setState(s => ({ ...s, showHelp: !s.showHelp }))
      return
    }

    // Exit
    if (input === '/exit') {
      process.exit(0)
    }

    // Change mode
    if (input.startsWith('/mode ')) {
      const mode = input.slice(6).trim() as AppState['mode']
      if (modeConfigs[mode]) {
        setState(s => ({ ...s, mode }))
        onModeChange?.(mode)
      }
      return
    }

    // Change model
    if (input.startsWith('/model ')) {
      const model = input.slice(7).trim()
      setState(s => ({ ...s, currentModel: model }))
      onProviderChange?.(state.currentProvider, model)
      return
    }

    // Handle tab for provider switching
    if (key.tab) {
      // Cycle through online providers
      const onlineProviders = defaultProviders.filter(p => p.status === 'online')
      const currentIdx = onlineProviders.findIndex(p => p.id === state.currentProvider)
      const nextIdx = (currentIdx + 1) % onlineProviders.length
      const nextProvider = onlineProviders[nextIdx]
      if (nextProvider) {
        setState(s => ({
          ...s,
          currentProvider: nextProvider.id,
          currentModel: nextProvider.defaultModel,
        }))
        onProviderChange?.(nextProvider.id, nextProvider.defaultModel)
      }
      return
    }

    // Handle Ctrl+P for mode cycling
    if (key.ctrl && input === 'p') {
      const modes = Object.keys(modeConfigs) as AppState['mode'][]
      const currentIdx = modes.indexOf(state.mode)
      const nextIdx = (currentIdx + 1) % modes.length
      const nextMode = modes[nextIdx]
      setState(s => ({ ...s, mode: nextMode }))
      onModeChange?.(nextMode)
      return
    }
  })

  // Simulate receiving a message (demo)
  useEffect(() => {
    if (state.messages.length === 0) {
      // Add welcome message
      const welcome: Message = {
        id: '1',
        role: 'assistant',
        content: `Welcome to Beast CLI! 🐉

I'm your AI coding assistant with access to 45+ providers. Currently using:
• Provider: ${state.currentProvider} (${defaultProviders.find(p => p.id === state.currentProvider)?.status === 'online' ? 'Online' : 'Offline'})
• Model: ${state.currentModel}
• Mode: ${state.mode.toUpperCase()}

Quick tips:
• Press Tab to switch between providers
• Use /model <name> to change model
• Use /mode <plan|write|auto|review|debug> to change mode
• Type /help for all commands

What would you like me to help you with today?`,
        timestamp: new Date(),
        provider: state.currentProvider,
        model: state.currentModel,
        tokens: 150,
      }
      setState(s => ({ ...s, messages: [welcome], tokens: 150 }))
    }
  }, [])

  const handleProviderSelect = (providerId: string, model: string) => {
    setState(s => ({ ...s, currentProvider: providerId, currentModel: model }))
    onProviderChange?.(providerId, model)
  }

  const handleModeChange = (mode: AppState['mode']) => {
    setState(s => ({ ...s, mode }))
    onModeChange?.(mode)
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Header />

      {/* Provider Status Bar */}
      <Box flexDirection="column" borderStyle="round" borderDim={false} marginY={1}>
        <Box flexDirection="column">
          <Text bold color="white">  🌐 Providers</Text>
          <Box flexDirection="row" marginTop={1}>
            {defaultProviders.map(p => (
              <Box key={p.id} marginRight={3}>
                <ProviderStatus provider={p} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Model & Mode Selector */}
      <Box flexDirection="column" borderStyle="single" marginY={0}>
        <ModelSelector
          providers={defaultProviders}
          currentProvider={state.currentProvider}
          currentModel={state.currentModel}
          onSelect={handleProviderSelect}
        />
        <ModeSelector mode={state.mode} onChange={handleModeChange} />
        <TokenCounter tokens={state.tokens} />
      </Box>

      {/* Messages Area */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderDim={false}
        flexGrow={1}
        padding={1}
        marginY={1}
      >
        <MessageList messages={state.messages} />
      </Box>

      {/* Help Panel (toggleable) */}
      {state.showHelp && (
        <HelpPanel />
      )}

      {/* Input */}
      <Box borderStyle="single" padding={1} marginY={0}>
        <InputLine isLoading={state.isLoading} />
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}

// Demo function to show live demo
export async function runLiveDemo() {
  const { render } = await import('ink')
  const { unmount } = render(<BeastTUI />)

  // Simulate demo messages after 2 seconds
  setTimeout(() => {
    console.log('\n📝 Demo: Adding sample messages...\n')
  }, 2000)

  // Keep running
  process.stdin.resume()
}

export default BeastTUI
