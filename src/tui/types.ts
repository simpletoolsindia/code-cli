/**
 * Shared types for the enhanced TUI
 */

import type { ColorPalette } from './theme.ts'

// ─── Theme ──────────────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light'

export interface Theme {
  mode: ThemeMode
  colors: ColorPalette
}

// ─── Messages ──────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export interface Message {
  id: string
  role: MessageRole
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

// ─── Provider ────────────────────────────────────────────────────────────────

export interface Provider {
  id: string
  name: string
  model: string
}

// ─── UI State ───────────────────────────────────────────────────────────────

export interface UIState {
  focusedIndex: number
  scrollPosition: number
  expandedTools: Set<string>
  themeMode: ThemeMode
}
