/**
 * Beast CLI - Modern UI (Claude Code Style)
 * Full-screen terminal UI with sidebar, chat, and status
 */

import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useInput, Spacer } from 'ink'

// Color palette
const C = {
  bg: '#0a0a0f',
  surface: '#151520',
  border: '#2a2a3a',
  text: '#e4e4e7',
  muted: '#71717a',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899',
}

// ASCII Art Header
const Header = () => (
  <Box flexDirection="column" alignItems="center" paddingY={0}>
    <Text color={C.accent}>
{`  ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗`}
    </Text>
    <Text color={C.accent}>
{`  ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝`}
    </Text>
    <Text color={C.success}>
{`  ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  `}
    </Text>
    <Text color={C.success}>
{`  ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  `}
    </Text>
    <Text color={C.purple}>
{`  ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗`}
    </Text>
    <Text color={C.purple}>
{`   ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝`}
    </Text>
    <Box marginTop={1}>
      <Text color={C.muted}>v1.0.9 · </Text>
      <Text color={C.cyan}>45+ Providers</Text>
      <Text color={C.muted}> · </Text>
      <Text color={C.success}>39 Tools</Text>
      <Text color={C.muted}> · </Text>
      <Text color={C.warning}>Local AI Ready</Text>
    </Box>
  </Box>
)

// Sidebar with workspace info
const Sidebar = ({
  provider,
  model,
  mode,
  tokens,
  toolsCount,
  contextLength
}: {
  provider: string
  model: string
  mode: string
  tokens: { prompt: number; completion: number }
  toolsCount: number
  contextLength: string
}) => (
  <Box
    flexDirection="column"
    width={28}
    backgroundColor={C.surface}
    borderStyle="round"
    paddingX={1}
    paddingY={1}
  >
    <Text bold color={C.accent}>MODE</Text>
    <Box marginBottom={1}>
      <Text
        color={mode === 'auto' ? C.success : mode === 'plan' ? C.purple : C.cyan}
        bold
      >
        {mode.toUpperCase()}
      </Text>
    </Box>

    <Text bold color={C.accent}>PROVIDER</Text>
    <Box marginBottom={1}>
      <Text color={C.success}>● </Text>
      <Text color={C.text}>{provider}</Text>
    </Box>

    <Text bold color={C.accent}>MODEL</Text>
    <Text color={C.cyan} wrap="truncate">{model}</Text>

    <Box marginY={1} borderColor={C.border} borderTop={true} />

    <Text bold color={C.accent}>CONTEXT</Text>
    <Text color={C.text}>{contextLength}</Text>

    <Box marginY={1} borderColor={C.border} borderTop={true} />

    <Text bold color={C.accent}>TOOLS</Text>
    <Text color={C.warning}>{toolsCount} available</Text>

    <Box marginY={1} borderColor={C.border} borderTop={true} />

    <Text bold color={C.accent}>TOKENS</Text>
    <Text color={C.muted}>Prompt: {tokens.prompt}</Text>
    <Text color={C.muted}>Output: {tokens.completion}</Text>
    <Text bold color={C.text}>Total: {tokens.prompt + tokens.completion}</Text>

    <Spacer />

    <Box borderColor={C.border} borderTop={true} paddingTop={1}>
      <Text color={C.muted} italic>Use /help for commands</Text>
    </Box>
  </Box>
)

// Message component with proper formatting
const Message = ({
  role,
  content,
  isStreaming = false
}: {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  isStreaming?: boolean
}) => {
  const colors: Record<string, string> = {
    user: C.success,
    assistant: C.accent,
    system: C.warning,
    tool: C.purple,
  }

  const labels: Record<string, string> = {
    user: 'You',
    assistant: 'Beast',
    system: 'System',
    tool: 'Tool',
  }

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text bold color={colors[role]}>● {labels[role]}</Text>
        {isStreaming && <Text color={C.muted}> (typing...)</Text>}
      </Box>
      <Box
        backgroundColor={role === 'user' ? C.surface : undefined}
        borderStyle={role === 'user' ? 'round' : 'none'}
        paddingX={2}
        paddingY={1}
        marginTop={1}
        marginLeft={2}
      >
        <Text color={C.text} wrap="wrap">{content}</Text>
      </Box>
    </Box>
  )
}

// Input component
const Input = ({
  value,
  onSubmit,
  isProcessing
}: {
  value: string
  onSubmit: (v: string) => void
  isProcessing: boolean
}) => {
  const inputRef = useRef('')
  const [cursor, setCursor] = useState(0)

  useInput((input, key) => {
    if (key.return && !isProcessing) {
      onSubmit(inputRef.current)
      inputRef.current = ''
      setCursor(0)
    } else if (key.backspace) {
      inputRef.current = inputRef.current.slice(0, -1)
      setCursor(c => Math.max(0, c - 1))
    } else if (input && !key.ctrl && !key.meta) {
      inputRef.current += input
      setCursor(c => c + input.length)
    }
  })

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isProcessing ? C.warning : C.accent}
      paddingX={2}
      paddingY={1}
    >
      <Box>
        <Text color={C.success} bold>❯ </Text>
        <Text color={isProcessing ? C.warning : C.text}>
          {isProcessing ? 'Processing...' : value || 'Type your request...'}
        </Text>
        {!isProcessing && <Text color={C.accent}>▋</Text>}
      </Box>
    </Box>
  )
}

// Main App Layout
export const BeastUI: React.FC<{
  onMessage?: (msg: string) => void
  provider?: string
  model?: string
}> = ({
  onMessage,
  provider = 'ollama',
  model = 'qwen2.5-coder:7b'
}) => {
  const [mode, setMode] = useState('auto')
  const [tokens, setTokens] = useState({ prompt: 0, completion: 0 })
  const [messages, setMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant' | 'system' | 'tool'
    content: string
    isStreaming?: boolean
  }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [contextLength] = useState('32K tokens')

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'system',
      content: `Welcome to Beast CLI! 🐉

I can help you with:
• Writing, editing & debugging code
• Running terminal commands
• Web search & data fetching
• File operations & Git management
• And much more!

Type /help for all commands.`
    }])
  }, [])

  // Handle command input
  const handleCommand = (input: string) => {
    if (!input.trim()) return

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }])

    setIsProcessing(true)
    onMessage?.(input)

    // Simulate processing - in real app, this would be async
    setTimeout(() => {
      setIsProcessing(false)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Received: "${input}"

This is a demo. In production, this would call the AI provider and execute tools.`
      }])
    }, 1000)
  }

  // Handle slash commands
  useInput((input, key) => {
    if (input.startsWith('/')) {
      const cmd = input.toLowerCase()

      if (cmd === '/help') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━

Provider:
  /provider       - Switch provider
  /model <name>  - Switch model
  /models        - List available models

Mode:
  /mode auto     - Auto-detect task type
  /mode plan     - Planning mode
  /mode write    - Writing mode
  /mode review   - Code review mode

Tools:
  /tools         - List all 39 tools
  /tool <name>   - Tool help

Other:
  /clear         - Clear chat
  /tokens        - Show token usage
  /exit          - Quit

Keyboard:
  Ctrl+C         - Exit
  Tab            - Switch provider`
        }])
      }

      if (cmd === '/tools') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Tools (39):
━━━━━━━━━━━━━━━━━━━━━━━━━

📁 File Operations
  file_read, file_write, file_list
  file_search, file_grep, file_glob

🌐 Web
  fetch_web_content, quick_fetch
  searxng_search, search_images

💻 Code Execution
  run_code, run_command
  run_python_snippet

📊 Data
  pandas_create, pandas_filter
  plot_line, plot_bar

📦 GitHub
  github_repo, github_issues
  github_commits, github_search_repos

🎬 YouTube
  youtube_transcript, youtube_search
  youtube_summarize`
        }])
      }

      if (cmd === '/clear') {
        setMessages([])
      }

      if (cmd === '/tokens') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Token Usage:
━━━━━━━━━━━━━━
Prompt: ${tokens.prompt}
Output: ${tokens.completion}
Total: ${tokens.prompt + tokens.completion}`
        }])
      }

      if (cmd === '/exit' || cmd === '/quit') {
        process.exit(0)
      }

      if (cmd.startsWith('/mode ')) {
        const newMode = cmd.slice(6).trim()
        if (['auto', 'plan', 'write', 'review'].includes(newMode)) {
          setMode(newMode)
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `Mode changed to: ${newMode.toUpperCase()}`
          }])
        }
      }
    }

    if (key.ctrl && input === 'c') {
      process.exit(0)
    }
  })

  return (
    <Box
      flexDirection="row"
      backgroundColor={C.bg}
      width={120}
      height={40}
    >
      {/* Main content area */}
      <Box
        flexDirection="column"
        flexGrow={1}
        paddingX={2}
        paddingY={1}
      >
        <Header />

        <Box marginY={1} flexDirection="column" flexGrow={1} overflowY="auto">
          {messages.map(msg => (
            <Message
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          ))}
        </Box>

        <Input
          value={inputValue}
          onSubmit={handleCommand}
          isProcessing={isProcessing}
        />

        <Box marginTop={1} justifyContent="space-between">
          <Text color={C.muted}>
            <Text color={C.accent}>Tab</Text> switch │
            <Text color={C.accent}> /help</Text> commands │
            <Text color={C.accent}> Ctrl+C</Text> exit
          </Text>
          <Text color={C.muted}>github.com/simpletoolsindia/code-cli</Text>
        </Box>
      </Box>

      {/* Sidebar */}
      <Box marginLeft={1}>
        <Sidebar
          provider={provider}
          model={model}
          mode={mode}
          tokens={tokens}
          toolsCount={39}
          contextLength={contextLength}
        />
      </Box>
    </Box>
  )
}

export default BeastUI
