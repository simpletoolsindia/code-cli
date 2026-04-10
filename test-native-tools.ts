// Test all native tools on Windows
// Run: bun test-native-tools.ts

import { getAllTools, executeTool } from './src/native-tools/index.ts'

const tools = getAllTools()
console.log(`\n🐉 Testing ${tools.length} Native Tools on Windows\n`)
console.log('═'.repeat(70))

const results: { name: string; passed: boolean; error?: string; time: number }[] = []

async function testTool(name: string, args: Record<string, unknown> = {}): Promise<{ passed: boolean; error?: string; time: number }> {
  const start = Date.now()
  try {
    const result = await executeTool(name, args)
    const time = Date.now() - start
    return {
      passed: result.success,
      error: result.error || (result.content.length === 0 ? 'Empty response' : undefined),
      time
    }
  } catch (e: any) {
    return { passed: false, error: e.message, time: Date.now() - start }
  }
}

async function runTests() {
  // Test each tool with appropriate args
  const testCases: Record<string, Record<string, unknown>> = {
    'fetch_web_content': { url: 'https://httpbin.org/html', max_tokens: 500 },
    'quick_fetch': { url: 'https://httpbin.org/html' },
    'open_in_browser': { url: 'https://example.com' },
    'fetch_structured': { url: 'https://httpbin.org/json' },
    'fetch_with_selectors': { url: 'https://example.com', selectors: ['h1', 'p'] },
    'scrape_freedium': { url: 'https://medium.com/example' },
    'webclaw_extract_article': { url: 'https://example.com/article' },
    'webclaw_extract_product': { url: 'https://example.com/product' },
    'webclaw_crawl': { url: 'https://example.com', max_pages: 2 },
    'searxng_search': { query: 'test search', limit: 3 },
    'search_images': { query: 'nature', limit: 2 },
    'search_news': { query: 'technology', limit: 2 },
    'searxng_health': {},
    'hackernews_top': { limit: 3 },
    'hackernews_new': { limit: 3 },
    'hackernews_best': { limit: 3 },
    'hackernews_get_comments': { story_id: '123' },
    'file_read': { path: 'package.json' },
    'file_write': { path: 'test_output.txt', content: 'Hello Windows!' },
    'file_list': { path: '.' },
    'file_search': { directory: '.', pattern: '*.ts' },
    'file_grep': { path: '.', pattern: 'export' },
    'file_glob': { directory: '.', patterns: ['*.ts'] },
    'run_code': { code: 'print("Hello from Python on Windows")', language: 'python' },
    'run_python_snippet': { code: 'print("Python snippet works!")' },
    'run_command': { command: process.platform === 'win32' ? 'echo Hello from Windows' : 'echo Hello from Unix' },
    'github_repo': { owner: 'simpletoolsindia', repo: 'code-cli' },
    'github_readme': { owner: 'simpletoolsindia', repo: 'code-cli' },
    'github_issues': { owner: 'simpletoolsindia', repo: 'code-cli', limit: 3 },
    'github_commits': { owner: 'simpletoolsindia', repo: 'code-cli', limit: 3 },
    'github_search_repos': { query: 'typescript', limit: 3 },
    'youtube_transcript': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    'youtube_video_info': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    'youtube_search': { query: 'tutorial', limit: 2 },
    'youtube_summarize': { transcript: 'This is a test transcript. It contains multiple sentences that can be summarized. The first part talks about introduction. The second part discusses the main topic. The third part concludes with a summary.', max_words: 50 },
    'pandas_create': { name: 'test_df', data: '{"columns":["a","b"],"data":[[1,2],[3,4]]}' },
    'pandas_filter': { data: [{"a":1,"b":"x"},{"a":2,"b":"y"},{"a":3,"b":"x"}], conditions: '{"a":{"$gt":1}}' },
    'pandas_aggregate': { data: [{"category":"A","value":10},{"category":"A","value":20},{"category":"B","value":30}], group_by: ["category"], aggregations: {"value": "sum"} },
    'plot_line': { x: [1, 2, 3], y: [10, 20, 30], title: 'Test Plot', xlabel: 'X', ylabel: 'Y' },
    'plot_bar': { categories: ['A', 'B', 'C'], values: [10, 20, 30], title: 'Test Bar' },
    'tts_list_voices': {},
    'tts_speak': { text: 'Hello from Windows! This is a test of the text to speech system.' },
    'engi_task_classify': { task: 'Fix bug in login form' },
    'engi_repo_scope_find': { query: 'authentication' },
    'engi_flow_summarize': { code: 'const x = 1; function test() { return x; }' },
    'engi_bug_trace_compact': { error: 'ReferenceError: x is not defined' },
    'engi_implementation_plan': { scope: ['backend', 'frontend'], goal: 'User authentication' },
    'engi_poc_plan': { goal: 'Build a simple API' },
    'engi_impact_analyze': { change: 'Add caching to API' },
    'engi_test_select': { scope: ['src/utils'] },
    'engi_doc_context_build': { pattern: '*.md' },
    'engi_doc_update_plan': { file: 'README.md', changes: 'Update install instructions' },
    'engi_memory_checkpoint': { summary: 'Session checkpoint' },
    'engi_memory_restore': { session_id: 'test-session' },
  }

  for (const tool of tools) {
    const args = testCases[tool.name] || {}
    const testName = tool.name.padEnd(25)

    try {
      const result = await testTool(tool.name, args)
      results.push({ name: tool.name, ...result })

      if (result.passed) {
        console.log(`✅ ${testName} (${result.time}ms)`)
      } else {
        console.log(`❌ ${testName} - ${result.error?.slice(0, 60)} (${result.time}ms)`)
      }
    } catch (e: any) {
      results.push({ name: tool.name, passed: false, error: e.message, time: 0 })
      console.log(`❌ ${testName} - ${e.message.slice(0, 60)}`)
    }
  }

  // Summary
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log('\n' + '═'.repeat(70))
  console.log(`📊 Results: ${passed}/${tools.length} passed, ${failed} failed`)
  console.log('═'.repeat(70))

  if (failed > 0) {
    console.log('\n❌ Failed tools:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`)
    })
  }
}

runTests().catch(console.error)
