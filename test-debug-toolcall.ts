// Debug model tool calling behavior
import { TCPTransport } from './src/mcp/index.ts'
import { createProvider } from './src/providers/index.ts'

async function main() {
  const transport = new TCPTransport('localhost', 7710)
  await transport.connect()

  const provider = await createProvider({ provider: 'ollama', model: 'mistral-small3.1:24b', baseUrl: 'http://localhost:11434' })
  const tools = await transport.listTools()
  const searchTool = tools.find((t: any) => t.name === 'searxng_search')

  // Test 1: Simple tool call
  console.log('=== T1: Simple tool call ===')
  const resp1 = await provider.create({
    messages: [{ role: 'user', content: 'Search for the current gold price in India today using the search tool.' }],
    tools: [{ name: searchTool.name, description: searchTool.description, inputSchema: searchTool.inputSchema }],
    maxTokens: 200,
  })
  console.log('Content:', JSON.stringify(resp1.content)?.slice(0, 100))
  console.log('ToolCalls:', resp1.toolCalls?.length ?? 0)
  if (resp1.toolCalls) {
    for (const tc of resp1.toolCalls) {
      console.log('  Tool:', tc.name, 'Args:', JSON.stringify(tc.arguments))
    }
  }

  // Test 2: With system prompt
  console.log('\n=== T2: With system prompt ===')
  const resp2 = await provider.create({
    messages: [
      { role: 'system', content: 'You are a data assistant. When asked about prices, rates, weather or news — ALWAYS use the searxng_search tool immediately. Never say you cannot browse.' },
      { role: 'user', content: 'What is gold price in India today?' },
    ],
    tools: [{ name: searchTool.name, description: searchTool.description, inputSchema: searchTool.inputSchema }],
    maxTokens: 200,
  })
  console.log('Content:', JSON.stringify(resp2.content)?.slice(0, 100))
  console.log('ToolCalls:', resp2.toolCalls?.length ?? 0)
  if (resp2.toolCalls) {
    for (const tc of resp2.toolCalls) {
      console.log('  Tool:', tc.name, 'Args:', JSON.stringify(tc.arguments))
    }
  }

  // Test 3: Very explicit
  console.log('\n=== T3: Explicit JSON tool call instruction ===')
  const resp3 = await provider.create({
    messages: [
      { role: 'system', content: 'You MUST call tools. Format: { name: "searxng_search", arguments: { query: "search terms" } }' },
      { role: 'user', content: 'gold price India per gram' },
    ],
    tools: [{ name: searchTool.name, description: searchTool.description, inputSchema: searchTool.inputSchema }],
    maxTokens: 200,
  })
  console.log('Content:', JSON.stringify(resp3.content)?.slice(0, 100))
  console.log('ToolCalls:', resp3.toolCalls?.length ?? 0)
  if (resp3.toolCalls) {
    for (const tc of resp3.toolCalls) {
      console.log('  Tool:', tc.name, 'Args:', JSON.stringify(tc.arguments))
    }
  }

  // Test 4: Check what the MCP tool actually returns when called with empty args
  console.log('\n=== T4: MCP call with empty args ===')
  const mcpResult = await transport.callTool('searxng_search', {})
  console.log('MCP Result:', JSON.stringify(mcpResult)?.slice(0, 200))

  // Test 5: Check MCP call with correct args
  console.log('\n=== T5: MCP call with correct args ===')
  const mcpResult2 = await transport.callTool('searxng_search', { query: 'gold price India today', limit: 3 })
  const text = (mcpResult2.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join()
  console.log('MCP Result:', text.slice(0, 200))

  await transport.disconnect()
}

main().catch(e => console.error(e))
