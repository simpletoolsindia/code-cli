// Body Component - Scrollable message history
import React, { useRef, useEffect } from 'react'
import { Text, Box, Static } from 'ink'
import { getTheme } from '../theme.ts'

interface ToolCall {
  name: string
  arguments?: Record<string, unknown>
  result?: string
}

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolCalls?: ToolCall[]
}

interface BodyProps {
  messages: Message[]
  onToolExpand?: (tool: ToolCall) => void
}

function CodeBlock({ text }: { text: string }) {
  const theme = getTheme()
  const lines = text.split('\n').slice(0, 20)
  const truncated = text.split('\n').length > 20

  return (
    <Box flexDirection="column" paddingLeft={2}>
      {lines.map((line, i) => (
        <Text key={i} color={theme.code}>
          {line}
        </Text>
      ))}
      {truncated && <Text color={theme.muted}>...</Text>}
    </Box>
  )
}

function MessageContent({ role, content, toolCalls }: Message & { role: string }) {
  const theme = getTheme()
  const roleColors: Record<string, string> = {
    user: theme.green,
    assistant: theme.mauve,
    system: theme.sapphire,
    tool: theme.peach,
  }
  const roleColor = roleColors[role] || theme.muted

  const roleLabels: Record<string, string> = {
    user: '›',
    assistant: '◈',
    system: 'i',
    tool: '›',
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>
        <Text color={roleColor}>{roleLabels[role] || '·'} </Text>
        <Text color={role === 'user' ? undefined : theme.primary}>{content}</Text>
      </Text>
      {toolCalls && toolCalls.length > 0 && (
        <Box flexDirection="column" paddingTop={1}>
          {toolCalls.map((tc, i) => (
            <Text key={i} color={theme.tool}>
              <Text bold>› {tc.name}</Text>
              {tc.arguments && (
                <Text color={theme.muted}>
                  {' '}
                  {JSON.stringify(tc.arguments).slice(0, 60)}
                  {JSON.stringify(tc.arguments).length > 60 ? '...' : ''}
                </Text>
              )}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}

export const Body: React.FC<BodyProps> = ({ messages }) => {
  const theme = getTheme()
  const MAX_VISIBLE = 20

  const visibleMessages = messages.slice(-MAX_VISIBLE)

  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      <Static items={visibleMessages}>
        {(msg) => (
          <Box key={`${msg.role}-${msg.content.slice(0, 20)}`}>
            <MessageContent
              role={msg.role}
              content={msg.content}
              toolCalls={msg.toolCalls}
            />
          </Box>
        )}
      </Static>
    </Box>
  )
}
