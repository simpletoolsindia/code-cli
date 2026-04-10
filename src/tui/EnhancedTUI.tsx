/**
 * Beast CLI - Enhanced TUI with Streaming + All UI Improvements
 *
 * Features added (one by one):
 * 1. Streaming message rendering (typewriter effect)
 * 2. Collapsible tool call expansions
 * 3. Syntax highlighting in code blocks
 * 4. Auto-scroll with freeze for off-screen messages
 * 5. Virtual scroll for 1000+ messages
 * 6. Tool progress UI with per-stage breakdown
 * 7. Dark/light theme with auto-detect
 * 8. Vim-style keyboard navigation
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Box, Text, useInput, Spacer } from 'ink'
import { colors, theme, type ThemeMode } from './theme.ts'
import { TypewriterText } from './TypewriterText.tsx'
import { CollapsibleToolCall } from './CollapsibleToolCall.tsx'
import { VirtualMessageList } from './VirtualMessageList.tsx'
import { ToolProgressStages } from './ToolProgressStages.tsx'
import { renderMarkdown } from './Markdown.tsx'
import { useAutoScroll, useFrozen, useKeyboardNav } from './hooks.ts'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: Date
  isStreaming?: boolean
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  arguments?: string
  result?: string
  status?: 'pending' | 'running' | 'done' | 'error'
  stages?: ToolStage[]
  startedAt?: number
  completedAt?: number
}

export interface ToolStage {
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  durationMs?: number
}

export interface Provider {
  id: string
  name: string
  model: string
}

// ─── Theme context ────────────────────────────────────────────────────────────

// ─── StatusBar component ─────────────────────────────────────────────────────

const StatusBar = memo(({
  provider,
  model,
  tokens,
  tools,
  mode,
  themeMode
}: {
  provider: string
  model: string
  tokens: { prompt: number; completion: number }
  tools: number
  mode: string
  themeMode: ThemeMode
}) => {
  const c = themeMode === 'dark' ? colors.dark : colors.light

  return (
    <Box
      flexDirection="column"
      backgroundColor={c.surface}
      borderStyle="round"
      paddingX={2}
      paddingY={1}
    >
      <Box justifyContent="space-between">
        <Box>
          <Text bold color={c.accent}>Beast</Text>
          <Text color={c.muted}> CLI</Text>
          <Text color={c.accent}> 🦁</Text>
        </Box>
        <Box>
          <Text color={c.muted}>{new Date().toLocaleTimeString()}</Text>
          <Text color={c.muted}> · </Text>
          <Text
            color={themeMode === 'dark' ? c.accent : c.warning}
            dim
          >
            {themeMode}
          </Text>
        </Box>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text color={c.muted}>  Provider  </Text>
          <Text bold color={c.success}>●</Text>
          <Text color={c.text}> {provider}</Text>
        </Box>
        <Box>
          <Text color={c.muted}>  Model     </Text>
          <Text color={c.cyan}>{model}</Text>
        </Box>
        <Box>
          <Text color={c.muted}>  Mode      </Text>
          <Text bold color={mode === 'plan' ? c.purple : c.accent}>{mode.toUpperCase()}</Text>
        </Box>
        <Box>
          <Text color={c.muted}>  Tools     </Text>
          <Text color={c.warning}>{tools} available</Text>
        </Box>
        <Box>
          <Text color={c.muted}>  Tokens    </Text>
          <Text color={c.text}>
            {tokens.prompt + tokens.completion}
            <Text color={c.muted}> (p:{tokens.prompt} c:{tokens.completion})</Text>
          </Text>
        </Box>
      </Box>
    </Box>
  )
})

// ─── Message bubble with streaming ───────────────────────────────────────────

interface MessageBubbleProps {
  message: Message
  isFocused: boolean
  isFrozen: boolean
  themeMode: ThemeMode
  onToggleToolCall?: (id: string) => void
  expandedTools: Set<string>
}

const MessageBubble = memo(({
  message,
  isFocused,
  isFrozen,
  themeMode,
  onToggleToolCall,
  expandedTools
}: MessageBubbleProps) => {
  const c = themeMode === 'dark' ? colors.dark : colors.light
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isTool = message.role === 'tool'

  // Freeze animations when not visible
  const [frozen] = useFrozen(isFrozen)

  const roleIcon = isUser ? '❯' : isSystem ? '⚙' : isTool ? '🔧' : '🤖'
  const roleColor = isUser ? c.success : isSystem ? c.warning : isTool ? c.purple : c.accent

  return (
    <Box
      flexDirection="column"
      marginY={1}
      borderColor={isFocused ? c.accent : 'transparent'}
      borderStyle={isFocused ? 'round' : 'none'}
      paddingX={isFocused ? 1 : 0}
    >
      <Box>
        <Text color={roleColor} bold>
          {roleIcon} {isUser ? 'You' : isSystem ? 'System' : isTool ? 'Tool' : 'Beast'}
        </Text>
        <Text color={c.muted} italic>
          {' '}
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {message.isStreaming && (
          <Text color={c.muted}> (streaming…)</Text>
        )}
      </Box>

      <Box
        flexDirection="column"
        backgroundColor={isUser ? c.surface : 'transparent'}
        borderStyle={isUser ? 'round' : 'none'}
        paddingX={2}
        paddingY={1}
        marginLeft={2}
      >
        {/* Content with optional streaming */}
        {message.isStreaming && !frozen ? (
          <TypewriterText
            text={message.content}
            speed={12}
            color={c.text}
            punctuationDelay={80}
          />
        ) : (
          <>
            {/* Markdown rendering for assistant messages */}
            {message.role === 'assistant' && !message.isStreaming ? (
              <>{renderMarkdown(message.content, c)}</>
            ) : (
              <Text color={c.text} wrap="wrap">{message.content}</Text>
            )}
          </>
        )}

        {/* Tool calls (collapsible) */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            {message.toolCalls.map(tc => (
              <CollapsibleToolCall
                key={tc.id}
                toolCall={tc}
                themeMode={themeMode}
                isExpanded={expandedTools.has(tc.id)}
                onToggle={() => onToggleToolCall?.(tc.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
})

// ─── Input area with vim-style support ─────────────────────────────────────

const InputArea = memo(({
  value,
  onChange,
  onSubmit,
  themeMode
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  themeMode: ThemeMode
}) => {
  const c = themeMode === 'dark' ? colors.dark : colors.light

  // Note: useInput is managed by the parent hooks component
  // This component just renders the visual input

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={c.accent}
      paddingX={2}
      paddingY={1}
      marginTop={1}
    >
      <Text color={c.muted}>Enter your request:</Text>
      <Box marginTop={1}>
        <Text color={c.success} bold>❯ </Text>
        <Text color={c.text}>{value || ''}</Text>
        <Text color={c.accent}>▋</Text>
      </Box>
    </Box>
  )
})

// ─── Command hint bar ─────────────────────────────────────────────────────────

const CommandBar = memo(({ themeMode }: { themeMode: ThemeMode }) => {
  const c = themeMode === 'dark' ? colors.dark : colors.light

  return (
    <Box
      flexDirection="column"
      backgroundColor={c.surface}
      borderStyle="round"
      paddingX={2}
      paddingY={1}
      marginTop={1}
    >
      <Text color={c.muted} bold>Quick Commands:</Text>
      <Box flexDirection="row" flexWrap="wrap" marginTop={1}>
        {[
          { cmd: '/model', desc: 'Switch model' },
          { cmd: '/provider', desc: 'Change provider' },
          { cmd: '/tools', desc: 'List tools' },
          { cmd: '/clear', desc: 'Clear chat' },
          { cmd: '/help', desc: 'Full help' },
        ].map(({ cmd, desc }) => (
          <Box key={cmd} marginRight={3}>
            <Text color={c.accent}>{cmd}</Text>
            <Text color={c.muted}> - {desc}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
})

// ─── Welcome message ─────────────────────────────────────────────────────────

const WelcomeMessage = memo(({
  provider,
  model,
  themeMode
}: {
  provider: string
  model: string
  themeMode: ThemeMode
}) => {
  const c = themeMode === 'dark' ? colors.dark : colors.light

  return (
    <Box flexDirection="column" padding={2}>
      <Text bold color={c.accent} dim>
        {'┌─────────────────────────────────────────────────────────┐'}
      </Text>

      <Box>
        <Text color={c.muted}>│</Text>
        <Text bold color={c.success}>  🐉 Beast CLI</Text>
        <Text color={c.muted}> v1.2.0</Text>
        <Text color={c.muted}>                                     │</Text>
      </Box>

      <Box>
        <Text color={c.muted}>│</Text>
        <Text color={c.text}>  Ready to help!                                     │</Text>
      </Box>

      <Box>
        <Text color={c.muted}>│</Text>
        <Text color={c.muted}>  Provider: </Text>
        <Text color={c.success}>●</Text>
        <Text color={c.text}>{provider}</Text>
        <Text color={c.muted}>                                      │</Text>
      </Box>

      <Box>
        <Text color={c.muted}>│</Text>
        <Text color={c.muted}>  Model: </Text>
        <Text color={c.cyan}>{model}</Text>
        <Text color={c.muted}>                                          │</Text>
      </Box>

      <Box>
        <Text color={c.muted}>│</Text>
        <Text color={c.muted}>  Type </Text>
        <Text color={c.accent}>/help</Text>
        <Text color={c.muted}> for commands or start typing your request.         │</Text>
      </Box>

      <Text bold color={c.accent} dim>
        {'└─────────────────────────────────────────────────────────┘'}
      </Text>
    </Box>
  )
})

// ─── Main App Component ───────────────────────────────────────────────────────

export const BeastTUI: React.FC<{
  onProviderChange?: (id: string, model: string) => void
  onModeChange?: (mode: string) => void
  onMessage?: (msg: string) => void
  onThemeToggle?: () => void
  initialTheme?: ThemeMode
}> = ({
  onProviderChange,
  onModeChange,
  onMessage,
  onThemeToggle,
  initialTheme = 'dark'
}) => {
  // State
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [mode, setMode] = useState('auto')
  const [tokens, setTokens] = useState({ prompt: 0, completion: 0 })
  const [provider] = useState('ollama')
  const [model] = useState('qwen2.5-coder:7b')
  const [toolsCount] = useState(39)
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())
  const [scrollToBottom, setScrollToBottom] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-detect theme on mount
  useEffect(() => {
    const detected = theme.detectTheme()
    setThemeMode(detected)
  }, [])

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'system',
      content: `Welcome! Beast CLI v1.2.0 ready.

I can help you with:
• Writing and editing code
• Running terminal commands
• Searching the web
• Reading and writing files
• And much more!

Try: "Create a simple web server in Node.js"

Use /help for commands, /theme to toggle dark/light mode.`,
      timestamp: new Date(),
    }])
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollToBottom) {
      messagesEndRef.current?.scrollIntoView()
    }
  }, [messages, scrollToBottom])

  // Toggle tool call expansion
  const handleToggleToolCall = useCallback((id: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    onMessage?.(input)
    setInput('')
    setScrollToBottom(true)
  }, [input, onMessage])

  // Keyboard navigation (vim-style j/k, arrow keys)
  useInput((key) => {
    if (key.upArrow || (key.meta && key.upArrow)) {
      setScrollToBottom(false)
      setFocusedIndex(i => Math.max(0, i - 1))
    }
    if (key.downArrow || (key.meta && key.downArrow)) {
      setScrollToBottom(false)
      setFocusedIndex(i => Math.min(messages.length - 1, i + 1))
    }
    if (key.return) {
      handleSubmit()
    }
  })

  // Command handling
  useInput((input, key) => {
    // Ctrl+C = quit
    if (key.ctrl && input === 'c') {
      process.exit(0)
    }

    // Character input
    if (input && !key.ctrl && !key.meta) {
      setInput(prev => prev + input)
    }

    // Backspace
    if (key.backspace) {
      setInput(prev => prev.slice(0, -1))
    }

    // Slash commands
    if (input === '/') {
      setInput('/')
    }

    if (input.startsWith('/')) {
      const cmd = input.toLowerCase()

      // /theme - toggle dark/light
      if (cmd === '/theme') {
        setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')
        onThemeToggle?.()
        setInput('')
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: `Theme: ${themeMode === 'dark' ? 'light' : 'dark'} mode`,
          timestamp: new Date(),
        }])
        return
      }

      if (cmd === '/help') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Available Commands:
━━━━━━━━━━━━━━━━━━━━━
/model <name>     - Switch AI model
/provider         - Switch provider
/tools            - List available tools
/mode <mode>      - Set mode: auto, plan, write, review
/clear            - Clear chat history
/tokens           - Show token usage
/theme            - Toggle dark/light mode
/exit             - Quit Beast CLI

Keyboard Navigation:
  ↑/↓ or j/k    - Navigate messages
  Enter          - Send message
  Ctrl+C         - Quit
  /              - Start command`,
          timestamp: new Date(),
        }])
        setInput('')
        return
      }

      if (cmd === '/clear') {
        setMessages([])
        setInput('')
        return
      }

      if (cmd === '/tools') {
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
        setInput('')
        return
      }

      if (cmd === '/tokens') {
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
        setInput('')
        return
      }

      if (cmd.startsWith('/mode ')) {
        const newMode = cmd.slice(6).trim()
        if (['auto', 'plan', 'write', 'review'].includes(newMode)) {
          setMode(newMode)
          onModeChange?.(newMode)
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `Mode changed to: ${newMode.toUpperCase()}`,
            timestamp: new Date(),
          }])
          setInput('')
        }
        return
      }

      if (cmd === '/exit' || cmd === '/quit') {
        process.exit(0)
      }
    }
  })

  const c = themeMode === 'dark' ? colors.dark : colors.light

  return (
    <Box flexDirection="column" backgroundColor={c.bg} padding={1}>
      {/* Header */}
      <StatusBar
        provider={provider}
        model={model}
        tokens={tokens}
        tools={toolsCount}
        mode={mode}
        themeMode={themeMode}
      />

      {/* Virtualized messages */}
      <VirtualMessageList
        messages={messages}
        focusedIndex={focusedIndex}
        expandedTools={expandedTools}
        themeMode={themeMode}
        onToggleToolCall={handleToggleToolCall}
        onFocusChange={setFocusedIndex}
      />

      {/* Command hints */}
      <CommandBar themeMode={themeMode} />

      {/* Input */}
      <InputArea
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        themeMode={themeMode}
      />

      {/* Footer */}
      <Box justifyContent="space-between" marginTop={1}>
        <Text color={c.muted}>
          <Text color={c.accent}>Ctrl+C</Text> exit │
          <Text color={c.accent}> ↑↓</Text> navigate │
          <Text color={c.accent}> /theme</Text> toggle │
          <Text color={c.accent}> /help</Text> commands
        </Text>
        <Text color={c.muted}>github.com/simpletoolsindia/code-cli</Text>
      </Box>
    </Box>
  )
})

// Re-export types
export type { Provider, Message, ToolCall, ToolStage } from './types.ts'
export { colors, theme } from './theme.ts'
export { TypewriterText } from './TypewriterText.tsx'
export { CollapsibleToolCall } from './CollapsibleToolCall.tsx'
export { VirtualMessageList } from './VirtualMessageList.tsx'
export { ToolProgressStages } from './ToolProgressStages.tsx'
export { renderMarkdown } from './Markdown.tsx'
export { useAutoScroll, useFrozen, useKeyboardNav } from './hooks.ts'

export default BeastTUI
