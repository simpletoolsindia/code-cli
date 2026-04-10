/**
 * MessageBubble — single message with frozen detection support
 * Extracted from EnhancedTUI for virtualization
 */

import React, { memo } from 'react'
import { Box, Text, Spacer } from 'ink'
import type { ThemeMode, Message } from './types.ts'
import { colors } from './theme.ts'
import { TypewriterText } from './TypewriterText.tsx'
import { CollapsibleToolCall } from './CollapsibleToolCall.tsx'
import { renderMarkdown } from './Markdown.tsx'
import { useFrozen } from './hooks.ts'

interface MessageBubbleProps {
  message: Message
  isFocused: boolean
  isFrozen: boolean
  themeMode: ThemeMode
  onToggleToolCall: (id: string) => void
  expandedTools: Set<string>
}

export const MessageBubble = memo(({
  message,
  isFocused,
  isFrozen,
  themeMode,
  onToggleToolCall,
  expandedTools,
}: MessageBubbleProps) => {
  const c = colors[themeMode]
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isTool = message.role === 'tool'

  // Freeze animations when not in focus
  const [frozen] = useFrozen(isFrozen)

  const roleIcon = isUser ? '❯' : isSystem ? '⚙' : isTool ? '🔧' : '🤖'
  const roleLabel = isUser ? 'You' : isSystem ? 'System' : isTool ? 'Tool' : 'Beast'
  const roleColor = isUser ? c.success : isSystem ? c.warning : isTool ? c.purple : c.accent

  return (
    <Box
      flexDirection="column"
      marginY={1}
      borderColor={isFocused ? c.accent : 'transparent'}
      borderStyle={isFocused ? 'round' : 'none'}
      paddingX={isFocused ? 1 : 0}
    >
      {/* Role + timestamp */}
      <Box>
        <Text color={roleColor} bold>
          {roleIcon} {roleLabel}
        </Text>
        <Text color={c.muted} italic>
          {' '}
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        {message.isStreaming && !frozen && (
          <Text color={c.muted}> (streaming…)</Text>
        )}
        {frozen && message.isStreaming && (
          <Text color={c.muted} dim> (frozen)</Text>
        )}
      </Box>

      {/* Content box */}
      <Box
        flexDirection="column"
        backgroundColor={isUser ? c.surface : 'transparent'}
        borderStyle={isUser ? 'round' : 'none'}
        paddingX={2}
        paddingY={1}
        marginLeft={2}
      >
        {/* Content — streaming or static */}
        {message.isStreaming && !frozen ? (
          <TypewriterText
            text={message.content}
            speed={12}
            color={c.text}
            punctuationDelay={80}
          />
        ) : message.role === 'assistant' && !message.isStreaming ? (
          // Markdown rendering for assistant
          <>{renderMarkdown(message.content, c)}</>
        ) : (
          <Text color={c.text} wrap="wrap">
            {message.content}
          </Text>
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
                onToggle={() => onToggleToolCall(tc.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
})

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble
