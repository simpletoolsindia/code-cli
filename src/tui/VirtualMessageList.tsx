/**
 * VirtualMessageList — virtualized message list for 1000+ message sessions
 * Only renders visible messages + buffer above/below
 * Freezes off-screen components to stop timers
 */

import React, { memo, useRef, useEffect, useState } from 'react'
import { Box, Text } from 'ink'
import type { ThemeMode } from './types.ts'
import { colors } from './theme.ts'
import type { Message } from './types.ts'
import { MessageBubble } from './MessageBubble.tsx'

interface VirtualMessageListProps {
  messages: Message[]
  focusedIndex: number
  expandedTools: Set<string>
  themeMode: ThemeMode
  onToggleToolCall: (id: string) => void
  onFocusChange: (index: number) => void
  overscan?: number   // number of extra messages to render above/below viewport (default 3)
  visibleHeight?: number  // approximate visible height in lines (default 25)
}

export const VirtualMessageList = memo(({
  messages,
  focusedIndex,
  expandedTools,
  themeMode,
  onToggleToolCall,
  onFocusChange,
  overscan = 3,
  visibleHeight = 25,
}: VirtualMessageListProps) => {
  const c = colors[themeMode]
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(20)

  // Estimate message height (varies with content)
  const avgMessageHeight = 8 // lines per message average
  const totalHeight = messages.length * avgMessageHeight
  const scrollHeight = Math.max(1, totalHeight)

  // Visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / avgMessageHeight) - overscan)
  const endIndex = Math.min(
    messages.length - 1,
    Math.ceil((scrollTop + containerHeight) / avgMessageHeight) + overscan
  )

  const visibleMessages = messages.slice(startIndex, endIndex + 1)

  // Track scroll position
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      // Ink doesn't have native scroll events, so we approximate
      // based on focused index
    }

    // We handle scrolling through the focused index instead
    // When focused index changes, scroll that message into view
    const targetScrollTop = focusedIndex * avgMessageHeight
    setScrollTop(targetScrollTop)
  }, [focusedIndex])

  // Auto-scroll: when focusedIndex is at the end, scroll to bottom
  useEffect(() => {
    if (focusedIndex >= messages.length - 3) {
      setScrollTop(Math.max(0, totalHeight - containerHeight))
    }
  }, [focusedIndex, messages.length, totalHeight, containerHeight])

  if (messages.length === 0) {
    return (
      <Box
        flexGrow={1}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Text color={c.muted} italic>No messages yet. Start typing to chat!</Text>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      flexGrow={1}
      overflowY="scroll"
      flexDirection="column"
    >
      {/* Spacer for virtualization offset */}
      {startIndex > 0 && (
        <Box height={startIndex * avgMessageHeight}>
          <Text color={c.muted} dim>+{startIndex} messages</Text>
        </Box>
      )}

      {/* Visible messages */}
      {visibleMessages.map((message, i) => {
        const actualIndex = startIndex + i
        const isFocused = actualIndex === focusedIndex

        // Freeze: messages far from focus point stop ticking
        const isFrozen = Math.abs(actualIndex - focusedIndex) > 5

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isFocused={isFocused}
            isFrozen={isFrozen}
            themeMode={themeMode}
            onToggleToolCall={onToggleToolCall}
            expandedTools={expandedTools}
          />
        )
      })}

      {/* Bottom spacer */}
      {endIndex < messages.length - 1 && (
        <Box>
          <Text color={c.muted} dim>
            +{messages.length - endIndex - 1} more messages (scroll to load)
          </Text>
        </Box>
      )}
    </Box>
  )
})

VirtualMessageList.displayName = 'VirtualMessageList'

export default VirtualMessageList
