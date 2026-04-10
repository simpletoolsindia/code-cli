/**
 * Beast CLI - TUI Components
 * Export all enhanced components
 */

// Main TUI
export { BeastTUI } from './EnhancedTUI.tsx'
export type { Message, ToolCall, ToolStage, Provider, ThemeMode } from './types.ts'

// Theme
export { colors, theme } from './theme.ts'
export type { ColorPalette } from './theme.ts'

// Streaming
export { TypewriterText } from './TypewriterText.tsx'

// Tool calls
export { CollapsibleToolCall } from './CollapsibleToolCall.tsx'
export { ToolProgressStages } from './ToolProgressStages.tsx'

// Message display
export { MessageBubble } from './MessageBubble.tsx'
export { VirtualMessageList } from './VirtualMessageList.tsx'

// Markdown
export { Markdown, renderMarkdown } from './Markdown.tsx'

// Utilities
export { useAutoScroll, useFrozen, useKeyboardNav, useDebounce, useThrottle } from './hooks.ts'

// Legacy exports (backwards compatible)
export { BeastTUI as BeastUI, type Provider, type Message } from './App.tsx'
export { StatusBar } from './StatusBar.tsx'
export { Diff, type DiffLine } from './Diff.tsx'
export type { Theme } from './App.tsx'
