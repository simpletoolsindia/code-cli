// MCP Server Integration Test - TCP JSON-RPC for extra_skills_mcp_tools
// Run with: ~/.bun/bin/bun test-mcp-integration.ts

console.log('🐉 Beast CLI - MCP Server Integration Test')
console.log('═'.repeat(70))
console.log()

// TCP-based JSON-RPC client for MCP
async function tcpJsonRpc(host: string, port: number, method: string, params?: unknown, id = 1): Promise<unknown> {
  const { connect } = await import('net')

  return new Promise((resolve, reject) => {
    const client = connect(port, host, () => {
      const request = JSON.stringify({ jsonrpc: '2.0', id, method, params: params ?? {} }) + '\n'
      client.write(request)
    })

    let buffer = ''
    const timeout = setTimeout(() => {
      client.destroy()
      reject(new Error(`Request timed out: ${method}`))
    }, 30000)

    client.on('data', (data: Buffer) => {
      buffer += data.toString()
      const lines = buffer.split('\n')
      buffer = ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const response = JSON.parse(line)
          clearTimeout(timeout)
          client.end()
          if (response.error) {
            reject(new Error(`${method}: ${response.error.message}`))
          } else {
            resolve(response.result)
          }
          return
        } catch {
          // Continue buffering
          buffer += line + '\n'
        }
      }
    })

    client.on('error', reject)
    client.on('close', () => {
      clearTimeout(timeout)
      reject(new Error(`Connection closed: ${method}`))
    })
  })
}

async function testExtraSkillsMCP() {
  console.log('📦 Testing extra_skills_mcp_tools Integration')
  console.log('─'.repeat(50))

  const host = process.env.MCP_HOST || 'localhost'
  const port = parseInt(process.env.MCP_PORT || '7710')

  console.log(`  MCP Server: ${host}:${port}`)

  try {
    // Initialize
    console.log('  ⏳ Initializing MCP connection...')
    const initResult = await tcpJsonRpc(host, port, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'beast-cli-test', version: '1.0.0' }
    }) as any
    console.log(`  ✅ Connected: ${initResult.serverInfo?.name || 'mcp-server'}`)
    console.log(`  ✅ Protocol: ${initResult.protocolVersion}`)

    // List tools
    console.log('\n  ⏳ Listing tools...')
    const toolsResult = await tcpJsonRpc(host, port, 'tools/list', {}) as any
    const tools = toolsResult?.tools || []
    console.log(`  ✅ Found ${tools.length} MCP tools`)

    // Group tools by category
    const categories: Record<string, string[]> = {}
    for (const tool of tools) {
      const name = tool.name || 'unknown'
      const parts = name.split('_')
      const cat = parts[0] || 'other'
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(name)
    }

    console.log('\n  📋 Tool Categories:')
    for (const [cat, names] of Object.entries(categories)) {
      console.log(`     ${cat}: ${names.length} tools`)
    }

    console.log('\n  📋 Sample Tools (first 15):')
    for (const tool of tools.slice(0, 15)) {
      const desc = (tool.description || '').slice(0, 50)
      console.log(`     - ${tool.name}: ${desc}${desc.length >= 50 ? '...' : ''}`)
    }
    if (tools.length > 15) {
      console.log(`     ... and ${tools.length - 15} more tools`)
    }

    // Test a simple tool
    console.log('\n  ⏳ Testing get_token_stats tool...')
    try {
      const statsResult = await tcpJsonRpc(host, port, 'tools/call', {
        name: 'get_token_stats',
        arguments: {}
      }) as any
      const statsText = statsResult?.content?.[0]?.text || '{}'
      const stats = JSON.parse(statsText)
      console.log(`  ✅ get_token_stats: ${stats.trimmed_tool_count} tools (reduced ${stats.tool_reduction_percent}%)`)
    } catch (e: any) {
      console.log(`  ⚠️  get_token_stats failed: ${e.message}`)
    }

    // Test searxng_search
    console.log('\n  ⏳ Testing searxng_search...')
    try {
      const searchResult = await tcpJsonRpc(host, port, 'tools/call', {
        name: 'searxng_search',
        arguments: { query: 'test', limit: 2 }
      }) as any
      const searchText = searchResult?.content?.[0]?.text || '{}'
      const searchData = JSON.parse(searchText)
      if (searchData.results) {
        console.log(`  ✅ searxng_search: ${searchData.results.length} results`)
        if (searchData.results[0]) {
          console.log(`     First: ${searchData.results[0].title || searchData.results[0].url}`)
        }
      } else if (searchData.error) {
        console.log(`  ⚠️  searxng_search error: ${searchData.error}`)
      }
    } catch (e: any) {
      console.log(`  ⚠️  searxng_search failed: ${e.message}`)
    }

    console.log('\n  ✅ EXTRA_SKILLS_MCP: PASS')
    return true
  } catch (e: any) {
    console.log(`  ❌ Failed: ${e.message}`)
    console.log('\n  ℹ️  To start MCP server:')
    console.log('     cd /Users/sridhar/extra_skills_mcp_tools')
    console.log('     docker compose -f docker-compose.local.yml up -d')
    return false
  }
}

async function testLocalOllama() {
  console.log('\n📦 Testing Ollama (Local)')
  console.log('─'.repeat(50))

  try {
    const response = await fetch('http://localhost:11434/api/tags')
    if (!response.ok) {
      console.log('  ⏭️  SKIP - Ollama not running')
      return false
    }

    const data = await response.json()
    const models = data.models || []
    console.log(`  ✅ Ollama accessible: ${models.length} models`)

    console.log('\n  📋 Available Models:')
    for (const model of models.slice(0, 8)) {
      const size = (model.size / 1e9).toFixed(1)
      console.log(`     - ${model.name} (${size} GB)`)
    }
    if (models.length > 8) {
      console.log(`     ... and ${models.length - 8} more`)
    }

    // Test a chat completion
    console.log('\n  ⏳ Testing chat completion...')
    const chatResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        messages: [{ role: 'user', content: 'Say "Hello from Ollama!" exactly.' }],
        stream: false,
        options: { temperature: 0.1, num_predict: 50 }
      }),
    })

    if (chatResponse.ok) {
      const chatData = await chatResponse.json()
      console.log(`  ✅ Chat response: ${chatData.message?.content || 'N/A'}`)
      console.log(`  ✅ Eval count: ${chatData.eval_count || 0} tokens`)
      console.log('\n  ✅ OLLAMA: PASS')
      return true
    } else {
      console.log(`  ❌ Chat failed: ${chatResponse.status}`)
      return false
    }
  } catch (e: any) {
    console.log(`  ⏭️  SKIP - Ollama not reachable: ${e.message}`)
    return false
  }
}

async function testLMStudio() {
  console.log('\n📦 Testing LM Studio (Local)')
  console.log('─'.repeat(50))

  try {
    const response = await fetch('http://localhost:1234/v1/models')
    if (!response.ok) {
      console.log('  ⏭️  SKIP - LM Studio not running')
      return false
    }

    const data = await response.json()
    const models = data.data || []
    console.log(`  ✅ LM Studio accessible: ${models.length} models`)

    if (models.length > 0) {
      console.log('\n  📋 Available Models:')
      for (const model of models.slice(0, 5)) {
        console.log(`     - ${model.id}`)
      }

      // Test chat completion
      console.log('\n  ⏳ Testing chat completion...')
      const chatResponse = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: models[0].id,
          messages: [{ role: 'user', content: 'Say "Hello from LM Studio!" exactly.' }],
          max_tokens: 50,
        }),
      })

      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        console.log(`  ✅ Chat response: ${chatData.choices?.[0]?.message?.content || 'N/A'}`)
        console.log('\n  ✅ LM STUDIO: PASS')
        return true
      }
    }
    return false
  } catch (e: any) {
    console.log(`  ⏭️  SKIP - LM Studio not reachable: ${e.message}`)
    return false
  }
}

async function main() {
  const mcpResult = await testExtraSkillsMCP()
  const ollamaResult = await testLocalOllama()
  const lmResult = await testLMStudio()

  console.log('\n' + '═'.repeat(70))
  console.log('📊 INTEGRATION SUMMARY')
  console.log('═'.repeat(70))
  console.log(`  extra_skills_mcp_tools: ${mcpResult ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Ollama (Local):          ${ollamaResult ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  LM Studio (Local):       ${lmResult ? '✅ PASS' : '❌ FAIL'}`)

  const passed = [mcpResult, ollamaResult, lmResult].filter(Boolean).length
  console.log(`\n  ${passed}/3 integrations working`)

  process.exit(passed >= 1 ? 0 : 1)
}

main().catch(console.error)
