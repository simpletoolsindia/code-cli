/**
 * Beast CLI - Claude Code Style UI
 * Clean, professional, modern terminal interface
 */

import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useInput, Spacer } from 'ink'

const C = {
  bg: '#0a0a0f',
  surface: '#141419',
  border: '#303040',
  text: '#e4e4e7',
  muted: '#6b6b7b',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  user: '#a78bfa',
}

// Props interface
interface BeastUIProps {
  onMessage?: (msg: string) => void
  provider?: string
  model?: string
  workspace?: string
  onExit?: () => void
}

// Main UI Component
export const BeastUI: React.FC<BeastUIProps> = ({
  onMessage,
  provider = 'ollama',
  model = 'qwen2.5-coder:7b',
  workspace = process.cwd(),
  onExit
}) => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    ts: Date
  }>>([])
  const [mode, setMode] = useState('auto')
  const [isThinking, setIsThinking] = useState(false)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef('')

  // Welcome
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'system',
      content: `🐉 Beast CLI v1.1.0 ready

I can help you build, debug, and understand code.
Share a task or question to get started.`,
      ts: new Date()
    }])
  }, [])

  // Handle submit
  const handleSubmit = () => {
    if (!inputRef.current.trim() || isThinking) return

    const userMsg = inputRef.current
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      ts: new Date()
    }])

    setIsThinking(true)
    setInput('')
    inputRef.current = ''
    setCursor(0)
    onMessage?.(userMsg)

    // Demo response
    setTimeout(() => {
      setIsThinking(false)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Got it: "${userMsg}"

This is a demo. In production, I would process this with the AI provider.`,
        ts: new Date()
      }])
    }, 800)
  }

  // Input handling
  useInput((key, input) => {
    if (key.return) {
      handleSubmit()
    } else if (key.backspace) {
      inputRef.current = inputRef.current.slice(0, -1)
      setInput(inputRef.current)
      setCursor(c => Math.max(0, c - 1))
    } else if (key.ctrl && input === 'c') {
      process.exit(0)
    } else if (input && !key.ctrl && !key.meta) {
      inputRef.current += input
      setInput(inputRef.current)
      setCursor(c => c + input.length)
    }
  })

  const shortPath = workspace.split('/').slice(-2).join('/')
  const isMac = process.platform === 'darwin'

  return (
    <Box flexDirection="column" backgroundColor={C.bg} height={isMac ? 35 : 40}>
      {/* Top Bar - Claude Code Style */}
      <Box
        backgroundColor={C.surface}
        paddingX={2}
        paddingY={0}
        justifyContent="space-between"
        borderColor={C.border}
        borderBottom={1}
      >
        <Box>
          <Text color={C.accent} bold>🐉 Beast</Text>
          <Text color={C.muted}> · {shortPath}</Text>
        </Box>
        <Box>
          <Text color={C.success}>●</Text>
          <Text color={C.muted}> {provider}</Text>
          <Text color={C.muted}> · </Text>
          <Text color={C.accent}>{model.split(':')[0]}</Text>
        </Box>
      </Box>

      {/* Mode Bar */}
      <Box
        backgroundColor={C.surface}
        paddingX={2}
        paddingY={0}
        borderColor={C.border}
        borderBottom={1}
      >
        <Box marginRight={4}>
          <Text color={mode === 'auto' ? C.success : C.muted} bold>{mode.toUpperCase()}</Text>
        </Box>
        <Box marginRight={4}>
          <Text color={C.muted}>39 tools</Text>
        </Box>
        <Spacer />
        <Text color={C.muted}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </Box>

      {/* Messages Area */}
      <Box flexGrow={1} paddingX={3} paddingY={1} overflowY="auto">
        {messages.map(msg => (
          <Box key={msg.id} flexDirection="column" marginY={1}>
            <Text color={msg.role === 'user' ? C.user : msg.role === 'system' ? C.warning : C.accent}>
              {msg.role === 'user' ? '❯' : msg.role === 'system' ? '⚙' : '🤖'}
            </Text>
            <Text color={C.text} wrap="wrap" marginLeft={2}>
              {msg.content}
            </Text>
          </Box>
        ))}
        {isThinking && (
          <Box marginY={1}>
            <Text color={C.muted} italic>Thinking...</Text>
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box
        paddingX={3}
        paddingY={1}
        borderColor={C.border}
        borderTop={1}
      >
        <Box>
          <Text color={C.success} bold>❯ </Text>
          <Text color={isThinking ? C.muted : C.text}>
            {isThinking ? 'Processing...' : input || ''}
          </Text>
          <Text color={C.accent}>▋</Text>
        </Box>
      </Box>

      {/* Bottom Hint Bar */}
      <Box
        backgroundColor={C.surface}
        paddingX={2}
        paddingY={0}
        borderColor={C.border}
        borderTop={1}
      >
        <Text color={C.muted} italic>
          Type /help for commands · Ctrl+C to exit
        </Text>
        <Spacer />
        <Text color={C.muted}>github.com/simpletoolsindia/code-cli</Text>
      </Box>
    </Box>
  )
}

export default BeastUI
