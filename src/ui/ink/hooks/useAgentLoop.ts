// useAgentLoop Hook - Bridge to existing backend
import { useState, useCallback } from 'react'
import { createProvider } from '../../../providers/index.ts'
import { executeTool, getFormattedTools } from '../../../native-tools/index.ts'
import { loadMemory, parseAgentContext } from '../../../agents/index.ts'
import { getApiKeyFromEnv, getBaseUrl } from '../../../providers/discover.ts'

export type Phase = 'idle' | 'thinking' | 'streaming' | 'done' | 'error'

interface ToolCallState {
  name: string
  arguments: Record<string, unknown>
  result?: string
  status: 'running' | 'done' | 'error'
}

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolCalls?: unknown[]
}

interface AgentLoopState {
  phase: Phase
  streamedText: string
  toolCalls: ToolCallState[]
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  error?: string
}

interface UseAgentLoopOptions {
  provider: string
  model: string
  apiKey?: string
  baseUrl?: string
  messages?: Message[]
}

const TIMEOUT_MS = 180_000 // 3 minutes - generous for large models

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.abort()
      reject(new Error(`Request timed out after ${ms / 1000}s`))
    }, ms)
    promise.then(val => { clearTimeout(timer); resolve(val) }).catch(err => {
      clearTimeout(timer)
      if (signal?.aborted) err = new Error(`Request timed out after ${ms / 1000}s`)
      reject(err)
    })
  })
}

export function useAgentLoop(options: UseAgentLoopOptions) {
  const [state, setState] = useState<AgentLoopState>({
    phase: 'idle',
    streamedText: '',
    toolCalls: [],
    error: undefined,
  })

  const run = useCallback(async (prompt: string) => {
    setState({ phase: 'thinking', streamedText: '', toolCalls: [], error: undefined })

    // Create abort controller for this request
    const controller = new AbortController()

    try {
      const nativeTools = getFormattedTools()
      const agentCtx = parseAgentContext(prompt)
      const memory = loadMemory()

      // Build system message
      const systemParts: string[] = []
      if (nativeTools.length > 0) {
        systemParts.push(`You have access to ${nativeTools.length} native tools: ${nativeTools.map(t => `${t.name}: ${t.description || ''}`).join(', ')}`)
      }
      if (agentCtx.agentInstructions.length > 0) {
        systemParts.push(...agentCtx.agentInstructions)
      }
      if (memory.context || memory.facts.length > 0) {
        const parts: string[] = []
        if (memory.context) parts.push(`Project Context: ${memory.context}`)
        if (memory.facts.length > 0) parts.push(`Facts: ${memory.facts.join(', ')}`)
        systemParts.push('[MEMORY]\n' + parts.join('\n'))
      }

      const agentMessages: Message[] = systemParts.length > 0
        ? [{ role: 'system', content: systemParts.join('\n\n') } as Message]
        : []

      agentMessages.push({ role: 'user', content: agentCtx.cleanedPrompt || prompt })

      const p = await createProvider({
        provider: options.provider as any,
        model: options.model,
        apiKey: options.apiKey || getApiKeyFromEnv(options.provider),
        baseUrl: options.baseUrl || getBaseUrl(options.provider) || undefined,
      })

      let toolCallCount = 0
      const MAX_TOOL_CALLS = 20
      let response = ''

      while (toolCallCount < MAX_TOOL_CALLS) {
        const tools = nativeTools.length > 0 ? nativeTools : undefined
        const llmResponse = await withTimeout(
          p.create({ messages: agentMessages, tools, maxTokens: 16384, signal: controller.signal }),
          TIMEOUT_MS,
          controller.signal
        )

        response = llmResponse.content || ''

        if (llmResponse.usage) {
          setState(s => ({ ...s, streamedText: response, usage: llmResponse.usage }))
        } else {
          setState(s => ({ ...s, streamedText: response }))
        }

        if (!llmResponse.toolCalls || llmResponse.toolCalls.length === 0) {
          // No tools — done
          agentMessages.push({ role: 'assistant', content: response })
          setState(s => ({ ...s, phase: 'done' }))
          return
        }

        // Process tool calls
        for (const tc of llmResponse.toolCalls) {
          toolCallCount++
          const toolId = `${tc.name}-${toolCallCount}`

          setState(s => ({
            ...s,
            toolCalls: [...s.toolCalls, { name: tc.name, arguments: tc.arguments || {}, status: 'running' }],
          }))

          try {
            const result = await withTimeout(executeTool(tc.name, tc.arguments || {}), TIMEOUT_MS)
            setState(s => ({
              ...s,
              toolCalls: s.toolCalls.map((t, i) =>
                i === s.toolCalls.length - 1
                  ? { ...t, result: result.content, status: result.success ? 'done' : 'error' }
                  : t
              ),
            }))
            agentMessages.push({ role: 'assistant', content: response, toolCalls: [tc] as any })
            agentMessages.push({ role: 'tool', content: result.content } as any)
          } catch (toolErr: any) {
            setState(s => ({
              ...s,
              toolCalls: s.toolCalls.map((t, i) =>
                i === s.toolCalls.length - 1
                  ? { ...t, result: toolErr.message, status: 'error' }
                  : t
              ),
            }))
            agentMessages.push({ role: 'assistant', content: response, toolCalls: [tc] as any })
            agentMessages.push({ role: 'tool', content: `Error: ${toolErr.message}` } as any)
          }
        }
      }

      setState(s => ({ ...s, phase: 'done' }))
    } catch (err: any) {
      controller.abort() // Clean up any in-flight requests
      setState(s => ({ ...s, phase: 'error', error: err.message || String(err) }))
    }
  }, [options])

  const reset = useCallback(() => {
    setState({ phase: 'idle', streamedText: '', toolCalls: [], error: undefined })
  }, [])

  return { state, run, reset }
}
