#!/usr/bin/env bun
/**
 * Beast CLI - Main entry point
 * AI Coding Agent with MCP integration
 */

import { StdioTransport } from './mcp/index.ts'

const OPENROUTER_KEY = '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'
const MODEL = 'qwen/qwen3.6-plus'
const BASE_URL = 'https://openrouter.ai/api/v1'

// MCP server config
const MCP_CMD = 'bash'
const MCP_ARGS = ['-c', 'cd /tmp/extra_skills_mcp/src && PYTHONPATH=/tmp/extra_skills_mcp/src /tmp/mcp-venv/bin/python -m mcp_server']

interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

interface MCPToolResult {
  content: Array<{ type: string; text: string }>
  isError?: boolean
}

class MCPToolExecutor {
  private transport: StdioTransport | null = null
  private tools: MCPTool[] = []
  private connected = false

  async connect(): Promise<void> {
    if (this.connected) return

    this.transport = new StdioTransport(MCP_CMD, MCP_ARGS, {})

    try {
      await this.transport.connect()
      await this.transport.send('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'beast-cli', version: '1.0.0' },
      })

      // List available tools
      const result = await this.transport.send('tools/list', {}) as any
      this.tools = result.tools || []
      this.connected = true
      console.log(`✅ Connected to MCP server with ${this.tools.length} tools`)
    } catch (err) {
      console.error('Failed to connect to MCP:', err)
      throw err
    }
  }

  async execute(toolName: string, args: Record<string, unknown>): Promise<string> {
    if (!this.transport || !this.connected) {
      throw new Error('MCP not connected')
    }

    console.log(`🔧 Executing MCP tool: ${toolName}`)
    const result = await this.transport.send('tools/call', {
      name: toolName,
      arguments: args,
    }) as MCPToolResult

    if (result.isError) {
      return `Error: ${JSON.stringify(result)}`
    }

    return result.content?.[0]?.text || JSON.stringify(result)
  }

  getToolsForLLM(): string {
    return this.tools.map(t => `- ${t.name}: ${t.description}`).join('\n')
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.disconnect()
      this.connected = false
    }
  }
}

class BeastCLI {
  private mcp: MCPToolExecutor
  private history: Array<{ role: string; content: string }> = []
  private toolsDescription: string = ''

  constructor() {
    this.mcp = new MCPToolExecutor()
  }

  async init(): Promise<void> {
    console.log('🐉 Beast CLI initializing...\n')
    await this.mcp.connect()
    this.toolsDescription = this.mcp.getToolsForLLM()
  }

  async chat(message: string): Promise<string> {
    // Build system prompt with available MCP tools
    const systemPrompt = `You are Beast CLI, an AI coding agent with access to MCP tools.
You can call tools by outputting JSON in this format (never output anything else):
<tool_call>
{"name": "tool_name", "arguments": {"arg1": "value1"}}
</tool_call>

Available MCP tools:
${this.toolsDescription}

When you need real information (like gold rate, weather, news), call a tool first, then summarize the results.
If no tool is needed, just respond normally.`

    // Build messages - system + history + new user input
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...this.history.slice(-10), // Keep last 10 exchanges
      { role: 'user', content: message },
    ]

    let maxIterations = 5
    let iterations = 0

    while (iterations < maxIterations) {
      iterations++
      console.log('\n🤖 Thinking...')

      // Call LLM
      const response = await this.callLLM(messages)

      // Check if LLM wants to call a tool
      const toolMatch = response.match(/<tool_call>\s*(\{.*?\})\s*<\/tool_call>/s)
      if (toolMatch) {
        try {
          const toolCall = JSON.parse(toolMatch[1])
          console.log(`\n🔧 Calling tool: ${toolCall.name}`)

          const toolResult = await this.mcp.execute(toolCall.name, toolCall.arguments || {})

          // Add tool result to messages
          messages.push({ role: 'assistant', content: response })
          messages.push({
            role: 'user',
            content: `[TOOL RESULT: ${toolCall.name}]\n${toolResult}\n[/TOOL RESULT]`
          })

          console.log(`✅ Tool result: ${toolResult.slice(0, 200)}...`)
          continue // Continue loop to process tool result
        } catch (err) {
          console.error('Tool execution error:', err)
          messages.push({ role: 'assistant', content: response })
          messages.push({ role: 'user', content: `Tool error: ${err}. Please try a different approach.` })
          continue
        }
      }

      // No tool call, return the response
      this.history.push({ role: 'user', content: message })
      this.history.push({ role: 'assistant', content: response })
      return response
    }

    return "I'm sorry, I couldn't find an answer after multiple attempts."
  }

  private async callLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://beast-cli.dev',
        'X-Title': 'Beast CLI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 2048,
        temperature: 0.7,
      }),
    })

    const data = await res.json()
    return data.choices?.[0]?.message?.content || JSON.stringify(data)
  }

  async cleanup(): Promise<void> {
    await this.mcp.disconnect()
  }
}

// Main CLI entry
async function main() {
  const input = Bun.argv.slice(2).join(' ') || 'what is gold rate today in India?'

  console.log(`📝 Question: ${input}\n`)

  const cli = new BeastCLI()

  try {
    await cli.init()
    const answer = await cli.chat(input)
    console.log('\n💬 Answer:', answer)
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    await cli.cleanup()
  }
}

main()