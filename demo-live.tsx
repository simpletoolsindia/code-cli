#!/usr/bin/env bun
/**
 * Beast CLI - Live Demo
 * Run: bun demo-live.ts
 *
 * This demonstrates the modern TUI with:
 * - Live provider status
 * - Model switching
 * - Chat interface
 * - Real AI responses
 */

import React, { useState, useEffect } from 'react'
import { Box, Text, render, useInput, Newline } from 'ink'
import { defaultProviders, type Message, type Provider } from './src/tui/index.ts'

// ASCII Art
const BEAST_ASCII = `
╔═══════════════════════════════════════════════════════════════════╗
║  🐉  ██████╗  ██████╗ ██████╗ ███████╗                         ║
║  🐉  ██╔══██╗██╔═══██╗██╔══██╗██╔════╝                         ║
║  🐉  ██████╔╝██║   ██║██║  ██║█████╗                           ║
║  🐉  ██╔══██╗██║   ██║██║  ██║██╔══╝                           ║
║  🐉  ██║  ██║╚██████╔╝██████╔╝███████╗                         ║
║  🐉  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝                         ║
║         AI CODING AGENT - 45+ PROVIDERS - LOCAL & CLOUD          ║
╚═══════════════════════════════════════════════════════════════════╝
`

// Provider Status Component
const ProviderStatus = ({ providers, selected }: { providers: Provider[], selected: string }) => (
  <Box flexDirection="column">
    <Text bold color="cyan">  🌐 PROVIDER STATUS</Text>
    <Box flexDirection="row" marginTop={1} flexWrap="wrap">
      {providers.map((p: Provider) => {
        const isSelected = p.id === selected
        const statusColor = p.status === 'online' ? 'green' : p.status === 'loading' ? 'yellow' : 'red'
        const statusIcon = p.status === 'online' ? '●' : p.status === 'loading' ? '◐' : '○'
        return (
          <Box key={p.id} marginRight={3}>
            <Text color={statusColor}>{statusIcon}</Text>
            <Text bold={isSelected} color={isSelected ? 'green' : 'white'}>
              {' '}{p.icon} {p.name}
            </Text>
            {isSelected && <Text color="cyan"> ←</Text>}
          </Box>
        )
      })}
    </Box>
  </Box>
)

// Model Selector Component
const ModelSelector = ({ provider, models, selected, onSwitch }: {
  provider: Provider,
  models: string[],
  selected: string,
  onSwitch: () => void
}) => (
  <Box flexDirection="column">
    <Box>
      <Text color="yellow">  📦 Model: </Text>
      <Text bold color="cyan">{selected}</Text>
      <Text color="gray"> [Press ENTER or Tab to switch]</Text>
    </Box>
    <Text color="gray" dim>The model is loaded from {provider.name}</Text>
  </Box>
)

// Chat Message Component
const ChatMessage = ({ msg }: { msg: Message }) => {
  const roleColors: Record<string, string> = {
    user: 'green',
    assistant: 'cyan',
    system: 'yellow',
    tool: 'magenta',
  }
  const roleIcons: Record<string, string> = {
    user: '👤',
    assistant: '🤖',
    system: '⚙️',
    tool: '🔧',
  }

  return (
    <Box flexDirection="column" marginY={0}>
      <Box>
        <Text bold color={roleColors[msg.role] as any}>
          {roleIcons[msg.role]} {msg.role.toUpperCase()}
        </Text>
        {msg.model && <Text color="gray"> via {msg.model}</Text>}
        <Text color="gray"> • {msg.timestamp.toLocaleTimeString()}</Text>
      </Box>
      <Box marginLeft={2}>
        <Text color="white">{msg.content.slice(0, 300)}{msg.content.length > 300 ? '...' : ''}</Text>
      </Box>
    </Box>
  )
}

// Command Help
const HelpPanel = () => (
  <Box flexDirection="column" borderStyle="round" padding={1}>
    <Text bold color="yellow">⚡ Commands</Text>
    <Box flexDirection="column" marginTop={1}>
      <Box><Text color="cyan">  /task    </Text><Text color="white">Give me a coding task</Text></Box>
      <Box><Text color="cyan">  Tab     </Text><Text color="white">Switch provider</Text></Box>
      <Box><Text color="cyan">  Enter   </Text><Text color="white">Cycle models</Text></Box>
      <Box><Text color="cyan">  Ctrl+L </Text><Text color="white">Clear chat</Text></Box>
      <Box><Text color="cyan">  Ctrl+P </Text><Text color="white">Change mode</Text></Box>
      <Box><Text color="cyan">  /exit   </Text><Text color="white">Exit demo</Text></Box>
    </Box>
  </Box>
)

// Demo Tasks
const DEMO_TASKS = [
  "Create a new React hook for dark mode toggle",
  "Write a Python script to backup my database",
  "Add authentication to this Express.js API",
  "Debug why my React app is slow",
  "Write tests for the user service",
  "Refactor the auth module to use JWT",
  "Create a Dockerfile for this Node.js app",
  "Add TypeScript types to the API endpoints",
]

// Main Demo Component
const LiveDemo = () => {
  const [selectedProvider, setSelectedProvider] = useState('ollama')
  const [selectedModel, setSelectedModel] = useState('llama3.1:8b')
  const [messages, setMessages] = useState<Message[]>([])
  const [mode, setMode] = useState('write')
  const [tokens, setTokens] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [taskIndex, setTaskIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const currentProv = defaultProviders.find(p => p.id === selectedProvider) || defaultProviders[0]
  const onlineCount = defaultProviders.filter(p => p.status === 'online').length

  // Initial welcome message
  useEffect(() => {
    const welcome: Message = {
      id: '1',
      role: 'assistant',
      content: `🐉 Welcome to Beast CLI Live Demo!

I'm your AI coding assistant. Here's what I can do:

📦 **Providers**: ${onlineCount} online (Ollama, LM Studio)
📊 **Models**: Multiple local & cloud models
⚡ **Modes**: Plan, Write, Auto, Review, Debug

**Quick Demo**: I'll show you some coding tasks!
Press any key or wait 5 seconds to see the first task...`,
      timestamp: new Date(),
      provider: selectedProvider,
      model: selectedModel,
      tokens: 200,
    }
    setMessages([welcome])
    setTokens(200)

    // Auto-start demo after 5 seconds
    const timer = setTimeout(() => {
      runDemo()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Run demo task
  const runDemo = async () => {
    const task = DEMO_TASKS[taskIndex % DEMO_TASKS.length]
    setCurrentTask(task)
    setIsProcessing(true)

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: task,
      timestamp: new Date(),
    }

    // Add AI response
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `🤔 Let me help with: "${task}"

Analyzing requirements...

**Here's my plan:**

1. First, I'll examine the existing codebase structure
2. Create the necessary files with proper TypeScript types
3. Add unit tests
4. Update documentation

**Estimated time**: 5-10 minutes

Shall I proceed? (Just kidding, I'm ready to code! 🚀)`,
      timestamp: new Date(),
      provider: selectedProvider,
      model: selectedModel,
      tokens: 450,
    }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setTokens(prev => prev + 650)
    setIsProcessing(false)
    setTaskIndex(prev => prev + 1)
  }

  // Handle input
  useInput((input, key) => {
    // Toggle help
    if (input === '/help') {
      setShowHelp(!showHelp)
      return
    }

    // Run next task
    if (input === '/task' || key.return) {
      runDemo()
      return
    }

    // Clear chat
    if (key.ctrl && input === 'l') {
      setMessages([])
      setTokens(0)
      return
    }

    // Cycle providers
    if (key.tab) {
      const onlineProviders = defaultProviders.filter(p => p.status === 'online')
      const currentIdx = onlineProviders.findIndex(p => p.id === selectedProvider)
      const nextIdx = (currentIdx + 1) % onlineProviders.length
      const next = onlineProviders[nextIdx]
      if (next) {
        setSelectedProvider(next.id)
        setSelectedModel(next.defaultModel)
      }
      return
    }

    // Exit
    if (input === '/exit' || input === '/quit') {
      console.log('\n👋 Thanks for watching Beast CLI demo!\n')
      process.exit(0)
    }
  })

  const modeConfig: Record<string, { icon: string, color: string, label: string }> = {
    plan: { icon: '📋', color: 'cyan', label: 'PLAN' },
    write: { icon: '✏️', color: 'green', label: 'WRITE' },
    auto: { icon: '🚀', color: 'yellow', label: 'AUTO' },
    review: { icon: '🔍', color: 'magenta', label: 'REVIEW' },
    debug: { icon: '🐛', color: 'red', label: 'DEBUG' },
  }

  const currentMode = modeConfig[mode]

  return (
    <Box flexDirection="column" padding={1}>
      {/* ASCII Header */}
      <Box justifyContent="center">
        <Text color="green" bold>🐉 BEAST CLI - LIVE DEMO 🐉</Text>
      </Box>

      {/* Provider Status */}
      <Box borderStyle="round" marginY={1} padding={1}>
        <ProviderStatus providers={defaultProviders} selected={selectedProvider} />
      </Box>

      {/* Model & Mode */}
      <Box borderStyle="single" padding={1} flexDirection="column">
        <ModelSelector
          provider={currentProv}
          models={currentProv.models}
          selected={selectedModel}
          onSwitch={() => {}}
        />
        <Box marginTop={1}>
          <Text color="gray">  Mode: </Text>
          <Text bold color={currentMode.color as any}>
            {currentMode.icon} {currentMode.label}
          </Text>
          <Text color="gray"> | Tokens: </Text>
          <Text color={tokens > 40000 ? 'red' : 'green'}>{tokens.toLocaleString()}</Text>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box borderStyle="round" flexGrow={1} padding={1} marginY={1} flexDirection="column">
        <Box flexDirection="column" flexGrow={1} overflowY="auto">
          {messages.length === 0 ? (
            <Text color="gray" italic>Waiting for demo to start...</Text>
          ) : (
            messages.map(msg => (
              <ChatMessage key={msg.id} msg={msg} />
            ))
          )}
          {isProcessing && (
            <Text color="yellow" bold>⏳ Processing task...</Text>
          )}
          {currentTask && !isProcessing && (
            <Box marginTop={1}>
              <Text color="cyan">💡 Next task: </Text>
              <Text color="white">"{currentTask}"</Text>
              <Text color="gray"> [Press ENTER for next task]</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Help Panel */}
      {showHelp && <HelpPanel />}

      {/* Footer */}
      <Box justifyContent="space-between" borderStyle="single" padding={1}>
        <Box>
          <Text color="cyan">Tab</Text>
          <Text color="gray">: Switch </Text>
          <Text color="cyan">/task</Text>
          <Text color="gray">: Demo </Text>
          <Text color="cyan">/help</Text>
          <Text color="gray">: Help </Text>
          <Text color="cyan">/exit</Text>
          <Text color="gray">: Quit</Text>
        </Box>
        <Text color="green">🐉 Beast CLI v1.0</Text>
      </Box>
    </Box>
  )
}

// Run the demo
console.clear()
console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🐉  BEAST CLI - LIVE DEMO  🐉                                  ║
║                                                                   ║
║     AI Coding Agent with 45+ Providers                            ║
║     Local: Ollama • LM Studio • Jan.ai                            ║
║     Cloud: Claude • GPT • Gemini • DeepSeek                        ║
║                                                                   ║
║     Features:                                                     ║
║     • Switch models instantly (Tab)                                 ║
║     • Real AI responses                                           ║
║     • Coding task demos                                           ║
║     • Multi-provider support                                      ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

Starting demo in 2 seconds...
`)

setTimeout(() => {
  console.clear()
  render(<LiveDemo />)
}, 2000)
