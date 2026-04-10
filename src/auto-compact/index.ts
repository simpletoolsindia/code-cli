// Auto-Compact System - Intelligent context management
// Inspired by opencode's auto-compact at 95% context window
// Integrates with Beast CLI's summarizer for creating summaries

import { compact, needsCompaction, type CompactionResult } from '../compaction/index.ts'
import { Message } from '../engine/index.ts'

// Context window sizes for different models (in tokens)
export const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  // Anthropic
  'claude-opus-4-5': 200_000,
  'claude-sonnet-4-5': 200_000,
  'claude-3-5-sonnet': 200_000,
  'claude-3-5-haiku': 200_000,
  'claude-3-opus': 200_000,
  'claude-3-sonnet': 200_000,
  'claude-3-haiku': 200_000,

  // OpenAI
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4-turbo': 128_000,
  'gpt-4': 128_000,
  'gpt-3.5-turbo': 16_385,

  // O1 series
  'o1': 128_000,
  'o1-mini': 65_536,
  'o1-preview': 128_000,
  'o3': 128_000,
  'o3-mini': 128_000,

  // Google
  'gemini-2.5-pro': 1_000_000,
  'gemini-2.5-flash': 1_000_000,
  'gemini-2.0-flash': 1_000_000,
  'gemini-1.5-pro': 2_000_000,
  'gemini-1.5-flash': 1_000_000,

  // Groq
  'llama-4-maverick': 131_072,
  'llama-4-scout': 131_072,
  'qwq-32b': 32_768,

  // Default
  'default': 200_000,
}

export interface AutoCompactConfig {
  /** Trigger compaction when context reaches this percentage (0-1) */
  triggerThreshold: number
  /** Minimum tokens before considering compaction */
  minTokens: number
  /** Budget for compacted messages (default 50K) */
  budget: number
  /** Number of user turns to protect at the end */
  protectUserTurns: number
  /** Whether to use AI summarization */
  useAISummarization: boolean
  /** Callback when compaction happens */
  onCompaction?: (result: CompactEvent) => void
}

export interface CompactEvent {
  reason: string
  removedMessages: number
  originalTokens: number
  newTokens: number
  tokensSaved: number
  restoredFiles: string[]
  timestamp: number
}

export const defaultAutoCompactConfig: AutoCompactConfig = {
  triggerThreshold: 0.95, // Trigger at 95% like opencode
  minTokens: 10_000,       // Don't compact until at least 10K tokens
  budget: 50_000,
  protectUserTurns: 2,
  useAISummarization: false, // Set true to use AI summarizer
}

/**
 * Get context window size for a model
 */
export function getContextWindow(model: string): number {
  // Try exact match first
  if (MODEL_CONTEXT_WINDOWS[model]) {
    return MODEL_CONTEXT_WINDOWS[model]
  }

  // Try partial match
  const modelLower = model.toLowerCase()
  for (const [key, size] of Object.entries(MODEL_CONTEXT_WINDOWS)) {
    if (modelLower.includes(key.toLowerCase())) {
      return size
    }
  }

  return MODEL_CONTEXT_WINDOWS['default']
}

/**
 * Calculate context usage percentage
 */
export function getContextUsage(
  messages: Message[],
  contextWindow: number,
  getTokenCount: (text: string) => number = (t) => Math.ceil(t.length / 4)
): { used: number; max: number; percentage: number } {
  const used = messages.reduce((sum, msg) => sum + getTokenCount(msg.content), 0)
  const max = contextWindow
  const percentage = used / max

  return { used, max, percentage }
}

/**
 * Check if auto-compaction should be triggered
 */
export function shouldAutoCompact(
  messages: Message[],
  model: string,
  config: AutoCompactConfig = defaultAutoCompactConfig
): { should: boolean; reason?: string; usage?: number } {
  const contextWindow = getContextWindow(model)
  const { used, percentage } = getContextUsage(messages, contextWindow)

  // Check minimum tokens
  if (used < config.minTokens) {
    return { should: false }
  }

  // Check threshold
  if (percentage >= config.triggerThreshold) {
    return {
      should: true,
      reason: `Context at ${Math.round(percentage * 100)}% (${used} / ${contextWindow} tokens)`,
      usage: percentage,
    }
  }

  // Check if standard compaction is needed (hard budget)
  if (needsCompaction(messages, { maxTokens: config.budget } as any)) {
    return {
      should: true,
      reason: `Messages exceed ${config.budget} token budget`,
      usage: percentage,
    }
  }

  return { should: false }
}

/**
 * Create a summary of a message sequence for compaction
 */
export function createMessageSummary(messages: Message[]): string {
  const summaryParts: string[] = []

  // Summarize by turns (user-assistant pairs)
  let currentUser = ''
  let currentAssistant = ''

  for (const msg of messages) {
    if (msg.role === 'user') {
      // Save previous turn if exists
      if (currentUser) {
        const userPreview = currentUser.substring(0, 100)
        const assistantPreview = currentAssistant.substring(0, 200)
        summaryParts.push(
          `User: ${userPreview}${userPreview.length < currentUser.length ? '...' : ''}`
        )
        if (currentAssistant) {
          summaryParts.push(
            `Assistant: ${assistantPreview}${assistantPreview.length < currentAssistant.length ? '...' : ''}`
          )
        }
        summaryParts.push('') // Empty line between turns
      }
      currentUser = msg.content
      currentAssistant = ''
    } else if (msg.role === 'assistant') {
      currentAssistant = msg.content
    }
    // Skip system messages
  }

  // Don't forget the last turn
  if (currentUser) {
    const userPreview = currentUser.substring(0, 100)
    const assistantPreview = currentAssistant.substring(0, 200)
    summaryParts.push(`User: ${userPreview}${userPreview.length < currentUser.length ? '...' : ''}`)
    if (currentAssistant) {
      summaryParts.push(
        `Assistant: ${assistantPreview}${assistantPreview.length < currentAssistant.length ? '...' : ''}`
      )
    }
  }

  return summaryParts.join('\n')
}

/**
 * Extract file operations from messages for restoration
 */
export function extractFileOperations(messages: Message[]): string[] {
  const files = new Set<string>()

  for (const msg of messages) {
    if (msg.role === 'assistant') {
      // Match common file operation patterns
      const patterns = [
        /FileRead:\s*([^\s]+)/g,
        /FileEdit:\s*([^\s]+)/g,
        /FileWrite:\s*([^\s]+)/g,
        /Edit\s+([^\s]+)/g,
        /Write\s+([^\s]+)/g,
        /view:\s*([^\s]+)/g,
        /read:\s*([^\s]+)/g,
      ]

      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(msg.content)) !== null) {
          if (match[1] && !match[1].startsWith('[')) {
            files.add(match[1])
          }
        }
      }
    }
  }

  return Array.from(files)
}

/**
 * Run auto-compaction on messages
 */
export function runAutoCompact(
  messages: Message[],
  model: string,
  config: AutoCompactConfig = defaultAutoCompactConfig
): { compacted: Message[]; event: CompactEvent } | null {
  const { should, reason, usage } = shouldAutoCompact(messages, model, config)

  if (!should) {
    return null
  }

  const originalTokens = messages.reduce(
    (sum, msg) => sum + Math.ceil(msg.content.length / 4),
    0
  )

  // Run standard compaction
  const result = compact(messages, {
    maxTokens: config.budget,
    maxFilesToRestore: 5,
    maxTokensPerFile: 5000,
    stripImages: true,
    protectLastUserTurns: config.protectUserTurns,
  } as any)

  // Create summary for remaining
  const removedMessages = messages.filter(
    (m) => !result.compactedMessages.includes(m)
  )

  const summaryContent = createMessageSummary(removedMessages)
  const restoredFiles = extractFileOperations(messages)

  // Add summary system message
  const summaryMessage: Message = {
    role: 'system',
    content: `[Previous conversation summary - ${removedMessages.length} messages removed]

Key files that were modified: ${restoredFiles.slice(0, 5).join(', ') || 'none'}

Previous conversation:
${summaryContent.substring(0, 2000)}${summaryContent.length > 2000 ? '...' : ''}`,
    timestamp: Date.now(),
  }

  // Prepend summary, keep protected messages
  const protectedMessages = result.compactedMessages.slice(-(config.protectUserTurns * 2))
  const compacted = [
    summaryMessage,
    ...result.compactedMessages.slice(0, -(config.protectUserTurns * 2)),
    ...protectedMessages,
  ]

  const newTokens = compacted.reduce(
    (sum, msg) => sum + Math.ceil(msg.content.length / 4),
    0
  )

  const event: CompactEvent = {
    reason: reason || 'Auto-compaction triggered',
    removedMessages: result.removedMessages,
    originalTokens,
    newTokens,
    tokensSaved: originalTokens - newTokens,
    restoredFiles,
    timestamp: Date.now(),
  }

  // Call callback if configured
  config.onCompaction?.(event)

  return { compacted, event }
}

/**
 * Auto-compact state manager
 */
export class AutoCompactManager {
  private config: AutoCompactConfig
  private lastUsage = 0
  private compactionCount = 0

  constructor(config: Partial<AutoCompactConfig> = {}) {
    this.config = { ...defaultAutoCompactConfig, ...config }
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<AutoCompactConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Check and potentially compact messages
   */
  check(
    messages: Message[],
    model: string
  ): { shouldCompact: boolean; event?: CompactEvent } {
    const { should, reason } = shouldAutoCompact(messages, model, this.config)

    if (!should) {
      this.lastUsage = getContextUsage(
        messages,
        getContextWindow(model)
      ).percentage
      return { shouldCompact: false }
    }

    // Run compaction
    const result = runAutoCompact(messages, model, this.config)

    if (result) {
      this.compactionCount++
      return { shouldCompact: true, event: result.event }
    }

    return { shouldCompact: false }
  }

  /**
   * Get statistics
   */
  getStats(): { lastUsage: number; compactionCount: number } {
    return {
      lastUsage: Math.round(this.lastUsage * 100),
      compactionCount: this.compactionCount,
    }
  }

  /**
   * Reset stats
   */
  reset(): void {
    this.lastUsage = 0
    this.compactionCount = 0
  }
}

// Singleton
let manager: AutoCompactManager | null = null

export function getAutoCompactManager(): AutoCompactManager {
  if (!manager) {
    manager = new AutoCompactManager()
  }
  return manager
}

export default {
  getContextWindow,
  getContextUsage,
  shouldAutoCompact,
  runAutoCompact,
  AutoCompactManager,
  getAutoCompactManager,
  createMessageSummary,
  extractFileOperations,
  MODEL_CONTEXT_WINDOWS,
}
