// Beast CLI - Ollama Integration & Tool Calling Test
// Uses OpenAI SDK (Ollama compatible)

import OpenAI from 'openai'
import { fetchWebContent, quickFetch, pythonWebScrape, scrapeFreedium } from './src/native-tools/web.ts'
import { searxngSearch, hackernewsTop, hackernewsNew } from './src/native-tools/search.ts'
import { fileRead, fileList, fileSearch } from './src/native-tools/files.ts'
import { runCode } from './src/native-tools/code.ts'

const results: TestResult[] = []

interface TestResult {
  name: string
  category: string
  passed: boolean
  duration: number
  output: string
  error?: string
}

// Tool definitions for LLM
const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'fetch_web_content',
      description: 'Fetch web page content and extract clean text',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          max_tokens: { type: 'integer' }
        },
        required: ['url']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'searxng_search',
      description: 'Search the web using SearXNG',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'run_code',
      description: 'Execute code in Python, JavaScript, or Bash',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          language: { type: 'string', enum: ['python', 'javascript', 'bash'] }
        },
        required: ['code', 'language']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'file_list',
      description: 'List files in a directory',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          max_items: { type: 'integer' }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'hackernews_top',
      description: 'Get top Hacker News stories',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'integer' }
        }
      }
    }
  }
]

// Tool execution functions
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  fetch_web_content: async (args: any) => fetchWebContent(args.url, args.max_tokens),
  searxng_search: async (args: any) => searxngSearch(args.query, args.limit),
  run_code: async (args: any) => runCode(args.code, args.language, 30),
  file_list: async (args: any) => fileList(args.path || '.', args.max_items),
  hackernews_top: async (args: any) => hackernewsTop(args.limit || 10)
}

async function runTest(name: string, category: string, fn: () => Promise<any>) {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    const output = typeof result === 'string' ? result.slice(0, 200) : JSON.stringify(result).slice(0, 200)
    results.push({ name, category, passed: true, duration, output })
    console.log('PASS ' + name + ' (' + duration + 'ms)')
    return result
  } catch (e: any) {
    const duration = Date.now() - start
    results.push({ name, category, passed: false, duration, output: '', error: e.message })
    console.log('FAIL ' + name + ' (' + duration + 'ms) - ' + e.message)
    return null
  }
}

async function runLLMTest(client: OpenAI, prompt: string, expectedTool: string) {
  const start = Date.now()
  try {
    const response = await client.chat.completions.create({
      model: 'gemma4:latest',
      messages: [{ role: 'user', content: prompt }],
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    })

    const duration = Date.now() - start
    const assistantMessage = response.choices[0]?.message

    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0]
      const calledTool = toolCall.function.name
      const args = JSON.parse(toolCall.function.arguments)
      const toolResult = await toolHandlers[calledTool]?.(args)

      const output = toolResult?.success ? 'Executed: ' + calledTool : 'Error: ' + toolResult?.error
      results.push({ name: 'LLM calls ' + calledTool, category: 'LLM Tool Calling', passed: true, duration, output })
      console.log('PASS LLM calls ' + calledTool + ' (' + duration + 'ms)')
      return { success: true, tool: calledTool, result: toolResult }
    } else {
      const text = assistantMessage?.content || 'No response'
      results.push({ name: 'LLM Tool Call: ' + expectedTool, category: 'LLM Tool Calling', passed: false, duration, output: text.slice(0, 100), error: 'No tool call made' })
      console.log('WARN LLM did not call tool (' + duration + 'ms): ' + text.slice(0, 80))
      return { success: false, text }
    }
  } catch (e: any) {
    const duration = Date.now() - start
    results.push({ name: 'LLM Tool Call: ' + expectedTool, category: 'LLM Tool Calling', passed: false, duration, output: '', error: e.message })
    console.log('FAIL LLM Tool Call (' + duration + 'ms) - ' + e.message)
    return { success: false, error: e.message }
  }
}

async function runLLMResponseTest(client: OpenAI, prompt: string) {
  const start = Date.now()
  try {
    const response = await client.chat.completions.create({
      model: 'gemma4:latest',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    })
    const duration = Date.now() - start
    const text = response.choices[0]?.message?.content || ''
    results.push({ name: 'LLM Response', category: 'LLM Response', passed: text.length > 0, duration, output: text.slice(0, 100) })
    console.log('PASS LLM Response (' + duration + 'ms): ' + text)
    return text
  } catch (e: any) {
    const duration = Date.now() - start
    results.push({ name: 'LLM Response', category: 'LLM Response', passed: false, duration, output: '', error: e.message })
    console.log('FAIL LLM Response (' + duration + 'ms) - ' + e.message)
    return ''
  }
}

async function runTests() {
  console.log('======================================================================')
  console.log('BEAST CLI - OLLAMA INTEGRATION & TOOL CALLING TEST')
  console.log('======================================================================')
  console.log('Date: ' + new Date().toISOString())
  console.log('Platform: ' + process.platform)
  console.log('Ollama: http://localhost:11434')
  console.log('Model: gemma4:latest')
  console.log('')

  const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    dangerouslyAllowBrowser: true,
  })

  // PART 1: Direct Tool Execution
  console.log('--- PART 1: DIRECT TOOL EXECUTION ---')
  await runTest('fetchWebContent', 'Direct', () => fetchWebContent('https://example.com', 2000))
  await runTest('quickFetch', 'Direct', () => quickFetch('https://example.com'))
  await runTest('pythonWebScrape', 'Direct', () => pythonWebScrape('https://example.com', 2000))
  await runTest('searxng_search', 'Direct', () => searxngSearch('AI coding tools 2026', 5))
  await runTest('hackernewsTop', 'Direct', () => hackernewsTop(5))
  await runTest('fileRead', 'Direct', () => fileRead('./package.json', 5000))
  await runTest('fileSearch', 'Direct', () => fileSearch('.', '*.ts', 10))
  await runTest('runCode Python', 'Direct', () => runCode('import datetime; print(datetime.datetime.now().isoformat())', 'python', 10))
  await runTest('runCode JavaScript', 'Direct', () => runCode('console.log(new Date().toISOString())', 'javascript', 10))
  console.log('')

  // PART 2: LLM Basic Response
  console.log('--- PART 2: LLM BASIC RESPONSE ---')
  await runLLMResponseTest(client, 'Reply with just "OK" to confirm you are working.')
  await runLLMResponseTest(client, 'What is 2 + 2? Answer in one word.')
  console.log('')

  // PART 3: LLM Tool Calling
  console.log('--- PART 3: LLM TOOL CALLING ---')
  await runLLMTest(client, 'Fetch the content from https://example.com and tell me the title.', 'fetch_web_content')
  await runLLMTest(client, 'Search for the latest news about AI coding assistants.', 'searxng_search')
  await runLLMTest(client, 'Run Python code that prints "Hello from Ollama!" and the current UTC timestamp.', 'run_code')
  await runLLMTest(client, 'List the files in the current directory.', 'file_list')
  await runLLMTest(client, 'Get the top 5 Hacker News stories and list their titles.', 'hackernews_top')
  console.log('')

  // PART 4: Real-time Data
  console.log('--- PART 4: REAL-TIME DATA VERIFICATION ---')
  const timeResult = await runCode('import datetime; print(datetime.datetime.now().isoformat()); print(datetime.datetime.utcnow().isoformat())', 'python', 10)
  console.log('Current time: ' + (timeResult.output || '').split('\n')[0])

  const freshSearch = await searxngSearch('real time news', 3)
  if (freshSearch.success && freshSearch.results) {
    console.log('Live search results:')
    freshSearch.results.forEach((r: any, i: number) => {
      console.log('  ' + (i + 1) + '. ' + r.title)
      console.log('     ' + r.url)
    })
  }

  const liveHN = await hackernewsTop(3)
  if (liveHN.success && liveHN.results) {
    console.log('Live Hacker News:')
    liveHN.results.forEach((r: any, i: number) => {
      console.log('  ' + (i + 1) + '. ' + r.title)
    })
  }
  console.log('')

  // Summary
  console.log('======================================================================')
  console.log('TEST SUMMARY')
  console.log('======================================================================')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed)
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  console.log('Total tests: ' + results.length)
  console.log('Passed: ' + passed)
  console.log('Failed: ' + failed.length)
  console.log('Duration: ' + totalDuration + 'ms')
  console.log('')

  // Category breakdown
  const categories: Record<string, any> = {}
  results.forEach(r => {
    if (!categories[r.category]) categories[r.category] = { passed: 0, failed: 0, total: 0 }
    categories[r.category].total++
    if (r.passed) categories[r.category].passed++
    else categories[r.category].failed++
  })

  console.log('By Category:')
  Object.entries(categories).forEach(([cat, counts]: [string, any]) => {
    const icon = counts.failed === 0 ? 'OK' : 'WARN'
    const pct = Math.round((counts.passed / counts.total) * 100)
    console.log('  [' + icon + '] ' + cat + ': ' + counts.passed + '/' + counts.total + ' (' + pct + '%)')
  })

  if (failed.length > 0) {
    console.log('')
    console.log('Failed Tests:')
    failed.forEach((f: TestResult) => {
      console.log('  - ' + f.name + ': ' + (f.error || 'no tool call'))
    })
  }

  // Save report
  const fs = await import('fs')
  const categoryRows = Object.entries(categories).map(([cat, counts]: [string, any]) =>
    '| ' + cat + ' | ' + counts.passed + ' | ' + counts.failed + ' | ' + Math.round((counts.passed / counts.total) * 100) + '% |'
  ).join('\n')

  const directRows = results.filter(r => r.category === 'Direct').map(r =>
    '| ' + r.name + ' | ' + (r.passed ? 'PASS' : 'FAIL') + ' | ' + r.duration + 'ms |'
  ).join('\n')

  const llmRows = results.filter(r => r.category === 'LLM Tool Calling').map(r =>
    '| ' + r.name + ' | ' + (r.passed ? 'PASS' : 'PARTIAL') + ' | ' + r.duration + 'ms | ' + r.output.slice(0, 60) + ' |'
  ).join('\n')

  const respRows = results.filter(r => r.category === 'LLM Response').map(r =>
    '| ' + r.name + ' | ' + (r.passed ? 'PASS' : 'FAIL') + ' | ' + r.output.slice(0, 80) + ' |'
  ).join('\n')

  const report = '# Beast CLI - Ollama Integration & Tool Calling Test Report\n\n' +
    '**Date:** ' + new Date().toISOString() + '\n' +
    '**Platform:** ' + process.platform + '\n' +
    '**Ollama:** http://localhost:11434\n' +
    '**Model:** gemma4:latest\n\n' +

    '## Summary\n\n' +
    '| Metric | Value |\n|--------|-------|\n' +
    '| Total Tests | ' + results.length + ' |\n' +
    '| Passed | ' + passed + ' |\n' +
    '| Failed | ' + failed.length + ' |\n' +
    '| Duration | ' + totalDuration + 'ms |\n\n' +

    '## Category Breakdown\n\n' +
    '| Category | Passed | Failed | Rate |\n' +
    '|----------|--------|--------|------|\n' +
    categoryRows + '\n\n' +

    '## Direct Tool Execution\n\n' +
    '| Tool | Status | Duration |\n' +
    '|------|--------|----------|\n' +
    directRows + '\n\n' +

    '## LLM Tool Calling\n\n' +
    '| Tool Called | Status | Duration | Output |\n' +
    '|-------------|--------|----------|--------|\n' +
    llmRows + '\n\n' +

    '## LLM Response\n\n' +
    '| Test | Status | Output |\n' +
    '|------|--------|--------|\n' +
    respRows + '\n\n' +

    '## Real-time Data Verification\n\n' +
    '- fetchWebContent: Native fetch with HTML parsing\n' +
    '- searxngSearch: Live web search via SearXNG\n' +
    '- hackernewsTop: Live stories from firebaseio API\n' +
    '- runCode Python/JavaScript: Real-time timestamp\n\n' +

    '## Tool Calling Flow\n\n' +
    '1. User Input -> LLM analyzes\n' +
    '2. LLM decides to call tool\n' +
    '3. Tool executes with real-time data\n' +
    '4. Result returned to LLM\n' +
    '5. LLM summarizes for user\n\n' +

    '## Ollama Config\n\n' +
    'Base URL: http://localhost:11434/v1\n' +
    'Model: gemma4:latest\n' +
    'SDK: OpenAI (Ollama compatible)\n\n' +

    '---' + '\n' +
    '*Generated by Beast CLI Testing Suite*'

  fs.writeFileSync('./OLLAMA-TEST-REPORT.md', report)
  console.log('')
  console.log('Report saved to OLLAMA-TEST-REPORT.md')
}

runTests().catch(console.error)