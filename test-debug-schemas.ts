// Debug: check what MCP tool schemas look like
import { TCPTransport } from './src/mcp/index.ts'

async function main() {
  const transport = new TCPTransport('localhost', 7710)
  await transport.connect()

  const tools = await transport.listTools()
  console.log(`Total tools: ${tools.length}\n`)

  // Find searxng_search schema
  const searchTool = tools.find((t: any) => t.name === 'searxng_search')
  if (searchTool) {
    console.log('=== searxng_search ===')
    console.log('Description:', searchTool.description)
    console.log('InputSchema:', JSON.stringify(searchTool.inputSchema, null, 2))
  }

  // Find weather tool
  const weatherTool = tools.find((t: any) => t.name === 'weather')
  if (weatherTool) {
    console.log('\n=== weather ===')
    console.log('Description:', weatherTool.description)
    console.log('InputSchema:', JSON.stringify(weatherTool.inputSchema, null, 2))
  }

  // Show first 5 tools
  console.log('\n=== First 5 tool schemas ===')
  for (const t of tools.slice(0, 5)) {
    console.log(`\n${t.name}:`)
    console.log(JSON.stringify(t.inputSchema, null, 2))
  }

  await transport.disconnect()
}

main().catch(e => console.error(e))
