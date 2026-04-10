// Body Component - Scrollable message history with improved readability
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
    <Box flexDirection="column" paddingLeft={2} borderStyle="round" paddingX={1}>
      {lines.map((line, i) => (
        <Text key={i} color={theme.code}>
          {line}
        </Text>
      ))}
      {truncated && <Text color={theme.muted}>... (truncated)</Text>}
    </Box>
  )
}

// Improved message content with better formatting
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
    user: '> You',
    assistant: '* Assistant',
    system: '[System]',
    tool: '~ Tool',
  }

  // Format content with better readability
  const formatContent = (text: string): React.ReactNode => {
    // Check if it's a code block
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g)
      return parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/, '').replace(/```$/, '')
          return <CodeBlock key={i} text={code} />
        }
        // Format regular text with better spacing
        return <Text key={i}>{part}</Text>
      })
    }

    // Format bullet points and sections
    const lines = text.split('\n')
    return (
      <Box flexDirection="column">
        {lines.map((line, i) => {
          // Bullet point formatting
          if (line.match(/^[-*•]\s/)) {
            return (
              <Text key={i}>
                <Text color={theme.accent}>  * </Text>
                <Text>{line.replace(/^[-*•]\s/, '')}</Text>
              </Text>
            )
          }
          // Numbered list
          if (line.match(/^\d+\.\s/)) {
            return (
              <Text key={i}>
                <Text color={theme.info}>  {line.match(/^\d+/)?.[0]}. </Text>
                <Text>{line.replace(/^\d+\.\s/, '')}</Text>
              </Text>
            )
          }
          // Section headers
          if (line.match(/^#{1,3}\s/)) {
            return (
              <Text key={i} bold color={theme.primary}>
                {'\n'}{line}{'\n'}
              </Text>
            )
          }
          // Empty lines for spacing
          if (!line.trim()) {
            return <Text key={i}>{'\n'}</Text>
          }
          return <Text key={i}>{line}</Text>
        })}
      </Box>
    )
  }

  return (
    <Box flexDirection="column" marginBottom={2} borderStyle="round" paddingX={1} paddingY={1}>
      {/* Role header with visual distinction */}
      <Box marginBottom={1}>
        <Text color={roleColor} bold>{roleLabels[role] || '·'} </Text>
        <Text color={theme.muted}>{'─'.repeat(30)}</Text>
      </Box>

      {/* Content with better formatting */}
      <Box paddingLeft={2}>
        {formatContent(content)}
      </Box>

      {/* Tool calls with collapsible display */}
      {toolCalls && toolCalls.length > 0 && (
        <Box flexDirection="column" marginTop={1} borderStyle="single" paddingX={1}>
          <Text color={theme.accent} bold>Tool Calls:</Text>
          {toolCalls.map((tc, i) => (
            <Box key={i} flexDirection="column" paddingLeft={2}>
              <Text color={theme.tool} bold>
                {'  ├─'} {tc.name}
              </Text>
              {tc.arguments && (
                <Text color={theme.muted} italic>
                  {'  │  Args: '}{JSON.stringify(tc.arguments).slice(0, 60)}
                  {JSON.stringify(tc.arguments).length > 60 ? '...' : ''}
                </Text>
              )}
              {tc.result && (
                <Text color={theme.secondary}>
                  {'  │  Result: '}{tc.result.slice(0, 100)}
                  {tc.result.length > 100 ? '...' : ''}
                </Text>
              )}
            </Box>
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
      {visibleMessages.length === 0 && (
        <Box paddingLeft={2}>
          <Text color={theme.muted} italic>No messages yet. Type your message below...</Text>
        </Box>
      )}
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
