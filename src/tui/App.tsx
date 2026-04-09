/**
 * Beast CLI - Modern Professional TUI
 * Inspired by Claude Code's clean aesthetic
 */

import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useInput } from 'ink'

// Modern color palette
export const colors = {
  bg: '#0a0a0f',
  surface: '#12121a',
  border: '#2a2a3a',
  text: '#e4e4e7',
  muted: '#71717a',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
}

// Status bar component
const StatusBar = ({
  provider,
  model,
  tokens,
  tools,
  mode
}: {
  provider: string
  model: string
  tokens: { prompt: number; completion: number }
  tools: number
  mode: string
}) => (
  <Box
    flexDirection="column"
    backgroundColor={colors.surface}
    borderStyle="round"
    paddingX={2}
    paddingY={1}
  >
    {/* Top bar */}
    <Box justifyContent="space-between">
      <Box>
        <Text bold color={colors.accent}>🐉 Beast</Text>
        <Text color={colors.muted}> CLI</Text>
      </Box>
      <Box>
        <Text color={colors.muted}>{new Date().toLocaleTimeString()}</Text>
      </Box>
    </Box>

    {/* Status indicators */}
    <Box marginTop={1} flexDirection="column">
      <Box>
        <Text color={colors.muted}>  Provider  </Text>
        <Text bold color={colors.success}>●</Text>
        <Text color={colors.text}> {provider}</Text>
      </Box>
      <Box>
        <Text color={colors.muted}>  Model     </Text>
        <Text color={colors.cyan}>{model}</Text>
      </Box>
    </Box>

    {/* Stats row */}
    <Box marginTop={1} borderTop={`1 ${colors.border}`} paddingTop={1} flexDirection="column">
      <Box>
        <Text color={colors.muted}>  Mode      </Text>
        <Text bold color={mode === 'plan' ? colors.purple : colors.accent}>{mode.toUpperCase()}</Text>
      </Box>
      <Box>
        <Text color={colors.muted}>  Tools     </Text>
        <Text color={colors.warning}>{tools} available</Text>
      </Box>
      <Box>
        <Text color={colors.muted}>  Tokens    </Text>
        <Text color={colors.text}>
          {tokens.prompt + tokens.completion}
          <Text color={colors.muted}> (p:{tokens.prompt} c:{tokens.completion})</Text>
        </Text>
      </Box>
    </Box>
  </Box>
)

// Message bubble component
const MessageBubble = ({
  role,
  content,
  timestamp
}: {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}) => {
  const isUser = role === 'user'
  const isSystem = role === 'system'

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text
          color={isUser ? colors.success : isSystem ? colors.warning : colors.accent}
          bold
        >
          {isUser ? '❯ ' : isSystem ? '⚙ ' : '🤖 '}
        </Text>
        <Text color={colors.muted} italic>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Box>
      <Box
        flexDirection="column"
        backgroundColor={isUser ? colors.surface : 'transparent'}
        borderStyle={isUser ? 'round' : 'none'}
        paddingX={2}
        paddingY={1}
        marginLeft={2}
      >
        <Text color={colors.text} wrap="wrap">
          {content}
        </Text>
      </Box>
    </Box>
  )
}

// Command hint bar
const CommandBar = () => (
  <Box
    flexDirection="column"
    backgroundColor={colors.surface}
    borderStyle="round"
    paddingX={2}
    paddingY={1}
    marginTop={1}
  >
    <Text color={colors.muted} bold>Quick Commands:</Text>
    <Box flexDirection="row" flexWrap="wrap" marginTop={1}>
      <Box marginRight={3}>
        <Text color={colors.accent}>/model</Text>
        <Text color={colors.muted}> - Switch model</Text>
      </Box>
      <Box marginRight={3}>
        <Text color={colors.accent}>/provider</Text>
        <Text color={colors.muted}> - Change provider</Text>
      </Box>
      <Box marginRight={3}>
        <Text color={colors.accent}>/tools</Text>
        <Text color={colors.muted}> - List tools</Text>
      </Box>
      <Box marginRight={3}>
        <Text color={colors.accent}>/clear</Text>
        <Text color={colors.muted}> - Clear chat</Text>
      </Box>
      <Box>
        <Text color={colors.accent}>/help</Text>
        <Text color={colors.muted}> - Full help</Text>
      </Box>
    </Box>
  </Box>
)

// Input area
const InputArea = ({
  value,
  onChange,
  onSubmit
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
}) => {
  const [cursorPos, setCursorPos] = useState(0)

  useInput((input, key) => {
    if (key.return) {
      onSubmit()
    } else if (key.backspace || key.delete) {
      if (value.length > 0) {
        const newVal = value.slice(0, -1)
        onChange(newVal)
      }
    } else if (input) {
      onChange(value + input)
    }
  })

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accent}
      paddingX={2}
      paddingY={1}
      marginTop={1}
    >
      <Text color={colors.muted}>Enter your request:</Text>
      <Box marginTop={1}>
        <Text color={colors.success} bold>❯ </Text>
        <Text color={colors.text}>{value || ''}</Text>
        <Text color={colors.accent} dim>_</Text>
      </Box>
    </Box>
  )
}

// Welcome message
const WelcomeMessage = ({ provider, model }: { provider: string; model: string }) => (
  <Box flexDirection="column" padding={2}>
    <Text bold color={colors.accent} dim>┌─────────────────────────────────────────────────────────┐</Text>

    <Box>
      <Text color={colors.muted}>│</Text>
      <Text bold color={colors.success}>  🐉 Beast CLI</Text>
      <Text color={colors.muted}> v1.0.8</Text>
      <Text color={colors.muted}>                                    │</Text>
    </Box>

    <Box>
      <Text color={colors.muted}>│</Text>
      <Text color={colors.text}>  Ready to help!                                     │</Text>
    </Box>

    <Box>
      <Text color={colors.muted}>│</Text>
      <Text color={colors.muted}>  Provider: </Text>
      <Text color={colors.success}>●</Text>
      <Text color={colors.text}>{provider}</Text>
      <Text color={colors.muted}>                                      │</Text>
    </Box>

    <Box>
      <Text color={colors.muted}>│</Text>
      <Text color={colors.muted}>  Model: </Text>
      <Text color={colors.cyan}>{model}</Text>
      <Text color={colors.muted}>                                          │</Text>
    </Box>

    <Box>
      <Text color={colors.muted}>│</Text>
      <Text color={colors.muted}>  Type </Text>
      <Text color={colors.accent}>/help</Text>
      <Text color={colors.muted}> for commands or start typing your request.         │</Text>
    </Box>

    <Text bold color={colors.accent} dim>└─────────────────────────────────────────────────────────┘</Text>
  </Box>
)

// Main App Component
export const BeastTUI: React.FC<{
  onProviderChange?: (id: string, model: string) => void
  onModeChange?: (mode: string) => void
  onMessage?: (msg: string) => void
}> = ({ onProviderChange, onModeChange, onMessage }) => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
  }>>([])
  const [mode, setMode] = useState('auto')
  const [tokens, setTokens] = useState({ prompt: 0, completion: 0 })
  const [provider] = useState('ollama')
  const [model] = useState('qwen2.5-coder:7b')
  const [toolsCount] = useState(39)

  // Show welcome message
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'system',
      content: `Welcome! Beast CLI is ready.\n\nI can help you with:\n• Writing and editing code\n• Running terminal commands\n• Searching the web\n• Reading and writing files\n• And much more!\n\nTry: "Create a simple web server in Node.js"`,
      timestamp: new Date(),
    }])
  }, [])

  // Handle input submission
  const handleSubmit = () => {
    if (!input.trim()) return

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }])

    // Notify parent
    onMessage?.(input)

    // Clear input
    setInput('')
  }

  // Keyboard shortcuts
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      process.exit(0)
    }

    if (input === '/help') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Available Commands:
━━━━━━━━━━━━━━━━━━━━━
/model <name>     - Switch AI model
/provider         - Switch provider (ollama, anthropic, openai)
/tools            - List available tools
/mode <mode>      - Set mode: auto, plan, write, review
/clear            - Clear chat history
/tokens           - Show token usage
/exit             - Quit Beast CLI

Examples:
  /model llama3.2
  /provider anthropic
  /mode plan`,
        timestamp: new Date(),
      }])
    }

    if (input === '/clear') {
      setMessages([])
    }

    if (input === '/tools') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Available Tools (39):
━━━━━━━━━━━━━━━━━━━━━━━━━
File Operations: file_read, file_write, file_list, file_search, file_grep, file_glob
Web: fetch_web_content, quick_fetch, searxng_search, search_images
Code: run_code, run_python_snippet, run_command
GitHub: github_repo, github_readme, github_issues, github_commits
YouTube: youtube_transcript, youtube_search, youtube_summarize
Data: pandas_create, pandas_filter, pandas_aggregate, plot_line, plot_bar`,
        timestamp: new Date(),
      }])
    }

    if (input === '/tokens') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Token Usage:
━━━━━━━━━━━━━
Prompt tokens: ${tokens.prompt}
Completion: ${tokens.completion}
Total: ${tokens.prompt + tokens.completion}`,
        timestamp: new Date(),
      }])
    }

    if (input.startsWith('/mode ')) {
      const newMode = input.slice(6).trim()
      if (['auto', 'plan', 'write', 'review'].includes(newMode)) {
        setMode(newMode)
        onModeChange?.(newMode)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: `Mode changed to: ${newMode.toUpperCase()}`,
          timestamp: new Date(),
        }])
      }
    }

    if (input === '/exit') {
      process.exit(0)
    }
  })

  return (
    <Box flexDirection="column" backgroundColor={colors.bg} padding={1}>
      {/* Header */}
      <StatusBar
        provider={provider}
        model={model}
        tokens={tokens}
        tools={toolsCount}
        mode={mode}
      />

      {/* Messages */}
      <Box
        flexDirection="column"
        flexGrow={1}
        overflowY="auto"
        marginY={1}
        padding={1}
      >
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
      </Box>

      {/* Command hints */}
      <CommandBar />

      {/* Input */}
      <InputArea
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
      />

      {/* Footer */}
      <Box justifyContent="space-between" marginTop={1}>
        <Text color={colors.muted}>
          <Text color={colors.accent}>Ctrl+C</Text> exit │
          <Text color={colors.accent}> Tab</Text> switch │
          <Text color={colors.accent}> ↑↓</Text> history
        </Text>
        <Text color={colors.muted}>github.com/simpletoolsindia/code-cli</Text>
      </Box>
    </Box>
  )
}

export default BeastTUI
