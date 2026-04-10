// useAgentLoop Hook - Bridge to existing backend
import { useState, useCallback, useRef } from 'react'
import { createProvider } from '../../../providers/index.ts'
import { executeTool, getFormattedTools } from '../../../native-tools/index.ts'
import { loadMemory, saveMemory, parseAgentContext } from '../../../agents/index.ts'
import { getApiKeyFromEnv, getBaseUrl } from '../../../providers/discover.ts'
import type { ToolCall } from '../../../providers/index.ts'

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
  toolCalls?: ToolCall[]
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

export function useAgentLoop(options: UseAgentLoopOptions) {
  const [state, setState] = useState<AgentLoopState>({
    phase: 'idle',
    streamedText: '',
    toolCalls: [],
    usage: undefined,
    error: undefined,
  })

  const messagesRef = useRef<Message[]>(options.messages || [])
  const toolCallCountRef = useRef(0)
  const MAX_TOOL_CALLS = 20

  const run = useCallback(async (prompt: string) => {
    const { provider, model, apiKey, baseUrl } = options
    const nativeTools = getFormattedTools() as any[]

    setState(prev => ({
      ...prev,
      phase: 'thinking',
      streamedText: '',
      toolCalls: [],
      error: undefined,
    }))

    try {
      // Build agent messages (same logic as src/index.ts)
      const agentMessages = [...messagesRef.current]

      if (nativeTools.length > 0) {
        agentMessages.unshift({
          role: 'system',
          content: `You have access to ${nativeTools.length} native tools. Available: ${nativeTools.map((t: any) => `${t.name}: ${t.description || 'no description'}`).join(', ')}`,
        })
      }

      // Parse @agentname
      const agentCtx = parseAgentContext(prompt)
      if (agentCtx.agentInstructions.length > 0) {
        const existingSystem = agentMessages.find(m => m.role === 'system')
        if (existingSystem) {
          existingSystem.content += '\n\n' + agentCtx.agentInstructions.join('\n\n')
        }
      }

      // Memory injection
      const memory = loadMemory()
      if (memory.context || memory.facts.length > 0) {
        const memParts: string[] = []
        if (memory.context) memParts.push(`Project Context: ${memory.context}`)
        if (memory.facts.length > 0) memParts.push(`Facts: ${memory.facts.join(', ')}`)
        const existingSystem = agentMessages.find(m => m.role === 'system')
        if (existingSystem) {
          existingSystem.content += '\n\n[MEMORY]\n' + memParts.join('\n')
        }
      }

      const finalPrompt = agentCtx.cleanedPrompt || prompt
      agentMessages.push({ role: 'user', content: finalPrompt })

      const p = await createProvider({
        provider: provider as any,
        model,
        apiKey: apiKey || getApiKeyFromEnv(provider),
        baseUrl: baseUrl || getBaseUrl(provider) || undefined,
      })

      while (toolCallCountRef.current < MAX_TOOL_CALLS) {
        const tools = nativeTools.length > 0 ? nativeTools : undefined
        const response = await p.create({
          messages: agentMessages,
          tools,
          maxTokens: 16384,
        })

        setState(prev => ({
          ...prev,
          phase: 'streaming',
          streamedText: response.content || '',
          usage: response.usage,
        }))

        if (!response.toolCalls || response.toolCalls.length === 0) {
          // No tool calls - done
          agentMessages.push({ role: 'assistant', content: response.content })
          messagesRef.current = agentMessages
          setState(prev => ({ ...prev, phase: 'done' }))
          return
        }

        // Process tool calls
        for (const tc of response.toolCalls) {
          toolCallCountRef.current++

          setState(prev => ({
            ...prev,
            toolCalls: [
              ...prev.toolCalls,
              { name: tc.name, arguments: tc.arguments || {}, status: 'running' },
            ],
          }))

          const toolResult = await executeTool(tc.name, tc.arguments || {})

          setState(prev => ({
            ...prev,
            toolCalls: prev.toolCalls.map((tc, i) =>
              i === prev.toolCalls.length - 1
                ? { ...tc, result: toolResult.content, status: toolResult.success ? 'done' : 'error' }
                : tc
            ),
          }))

          agentMessages.push({ role: 'assistant', content: response.content, toolCalls: [tc] })
          agentMessages.push({
            role: 'user',
            content: toolResult.content,
            toolCallId: tc.id,
          })
        }
      }

      // Max tool calls reached
      setState(prev => ({ ...prev, phase: 'done' }))
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        phase: 'error',
        error: err.message || String(err),
      }))
    }
  }, [options])

  const reset = useCallback(() => {
    messagesRef.current = []
    toolCallCountRef.current = 0
    setState({
      phase: 'idle',
      streamedText: '',
      toolCalls: [],
      usage: undefined,
      error: undefined,
    })
  }, [])

  return { state, run, reset }
}
