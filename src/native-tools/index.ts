// Native Tools Registry
// All MCP tools converted to native local implementations
// This removes the dependency on the MCP Docker server

import * as web from './web.ts'
import * as files from './files.ts'
import * as code from './code.ts'
import * as search from './search.ts'
import * as github from './github.ts'
import * as youtube from './youtube.ts'
import * as browser from './browser.ts'
import { engiTools } from '../engi/tools.ts'

export interface NativeTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  execute(args: Record<string, unknown>): Promise<ToolResult>
}

export interface ToolResult {
  success: boolean
  content: string
  error?: string
}

// ── Tool Registry ──────────────────────────────────────────────────────────

const tools: NativeTool[] = [
  // Web Fetching
  {
    name: 'fetch_web_content',
    description: 'Fetch URL and extract clean content. Optimized for LLM (strips nav/ads, converts to markdown).',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch' },
        max_tokens: { type: 'integer', description: 'Max tokens output (default: 4000)' },
      },
      required: ['url'],
    },
    async execute(args) {
      const result = await web.fetchWebContent(args.url as string, args.max_tokens as number || 4000)
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'quick_fetch',
    description: 'Ultra-fast fetch for quick lookups. Returns title + summary only.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch' },
      },
      required: ['url'],
    },
    async execute(args) {
      const result = await web.quickFetch(args.url as string)
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'open_in_browser',
    description: 'Open URL in default browser. Use when user wants to see results visually or needs interactive web content.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open in browser' },
        search: { type: 'string', description: 'Search query to open in Google (alternative to url)' },
      },
      required: [],
    },
    async execute(args) {
      try {
        let url = args.url as string
        if (!url && args.search) {
          url = `https://www.google.com/search?q=${encodeURIComponent(args.search as string)}`
        }
        if (!url) {
          return { success: false, content: '', error: 'Provide url or search parameter' }
        }
        const { execSync } = await import('node:child_process')
        const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
        execSync(`${opener} "${url}"`, { stdio: 'ignore' })
        return { success: true, content: `Opened in browser: ${url}` }
      } catch (e: any) {
        return { success: false, content: '', error: e.message }
      }
    },
  },
  {
    name: 'fetch_structured',
    description: 'Fetch and extract structured data (article metadata, product info, tables, links).',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        extraction_type: { type: 'string', enum: ['article', 'product', 'table', 'links'] },
        max_tokens: { type: 'integer' },
      },
      required: ['url', 'extraction_type'],
    },
    async execute(args) {
      const result = await web.fetchStructured(
        args.url as string,
        args.extraction_type as 'article' | 'product' | 'table' | 'links',
        args.max_tokens as number
      )
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'fetch_with_selectors',
    description: 'Fetch URL and extract using CSS selectors.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        selectors: { type: 'object' },
        max_tokens: { type: 'integer' },
      },
      required: ['url', 'selectors'],
    },
    async execute(args) {
      const result = await web.fetchWithSelectors(
        args.url as string,
        args.selectors as Record<string, string>,
        args.max_tokens as number
      )
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'scrape_freedium',
    description: 'Scrape Medium via Freedium.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        max_tokens: { type: 'integer' },
      },
      required: ['url'],
    },
    async execute(args) {
      const result = await web.scrapeFreedium(args.url as string, args.max_tokens as number)
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'webclaw_extract_article',
    description: 'Extract article content.',
    inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    async execute(args) {
      const result = await web.webclawExtractArticle(args.url as string)
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'webclaw_extract_product',
    description: 'Extract e-commerce product info.',
    inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    async execute(args) {
      const result = await web.webclawExtractProduct(args.url as string)
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'webclaw_crawl',
    description: 'Crawl with CSS selectors.',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string' }, selectors: { type: 'object' } },
      required: ['url', 'selectors'],
    },
    async execute(args) {
      const result = await web.webclawCrawl(args.url as string, args.selectors as Record<string, string>)
      return { success: result.success, content: result.content, error: result.error }
    },
  },

  // Search
  {
    name: 'searxng_search',
    description: 'Web search via SearXNG. Supports categories, engines, time range.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'integer', description: 'Max results (default: 10)' },
      },
      required: ['query'],
    },
    async execute(args) {
      const result = await search.searxngSearch(args.query as string, args.limit as number || 10)
      if (result.success && result.results) {
        return {
          success: true,
          content: JSON.stringify({ results: result.results }),
        }
      }
      return { success: false, content: '', error: result.error }
    },
  },
  {
    name: 'search_images',
    description: 'Image search via SearXNG.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'integer' },
      },
      required: ['query'],
    },
    async execute(args) {
      const result = await search.searchImages(args.query as string, args.limit as number || 10)
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) }
      }
      return { success: false, content: '', error: result.error }
    },
  },
  {
    name: 'search_news',
    description: 'News search via SearXNG.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        time_range: { type: 'string', enum: ['day', 'week', 'month', 'year'] },
      },
      required: ['query'],
    },
    async execute(args) {
      const result = await search.searchNews(
        args.query as string,
        args.time_range as 'day' | 'week' | 'month' | 'year'
      )
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) }
      }
      return { success: false, content: '', error: result.error }
    },
  },
  {
    name: 'searxng_health',
    description: 'Check SearXNG health.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const result = await search.searxngHealth()
      return { success: result.success, content: result.success ? 'OK' : 'DOWN', error: result.error }
    },
  },

  // Hacker News
  {
    name: 'hackernews_top',
    description: 'Top HN stories.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer' } } },
    async execute(args) {
      const result = await search.hackernewsTop(args.limit as number || 10)
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) }
      }
      return { success: false, content: '', error: result.error }
    },
  },
  {
    name: 'hackernews_new',
    description: 'Newest HN stories.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer' } } },
    async execute(args) {
      const result = await search.hackernewsNew(args.limit as number || 10)
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) }
      }
      return { success: false, content: '', error: result.error }
    },
  },
  {
    name: 'hackernews_best',
    description: 'Best HN stories.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer' } } },
    async execute(args) {
      const result = await search.hackernewsBest(args.limit as number || 10)
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) }
      }
      return { success: false, content: '', error: result.error }
    },
  },
  {
    name: 'hackernews_get_comments',
    description: 'Get story comments.',
    inputSchema: {
      type: 'object',
      properties: { story_id: { type: 'integer' }, limit: { type: 'integer' } },
      required: ['story_id'],
    },
    async execute(args) {
      const result = await search.hackernewsComments(
        args.story_id as number,
        args.limit as number || 20
      )
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) }
      }
      return { success: false, content: '', error: result.error }
    },
  },

  // File System (THE KEY MISSING PIECE)
  {
    name: 'file_read',
    description: 'Read file contents.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        max_size: { type: 'integer', description: 'Max bytes (default: 10MB)' },
      },
      required: ['path'],
    },
    async execute(args) {
      const result = await files.fileRead(args.path as string, args.max_size as number)
      return {
        success: result.success,
        content: result.content || '',
        error: result.error,
      }
    },
  },
  {
    name: 'file_write',
    description: 'Write content to a file.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        content: { type: 'string', description: 'Content to write' },
      },
      required: ['path', 'content'],
    },
    async execute(args) {
      const result = await files.fileWrite(args.path as string, args.content as string)
      return {
        success: result.success,
        content: result.path || '',
        error: result.error,
      }
    },
  },
  {
    name: 'file_list',
    description: 'List directory contents.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path (default: .)' },
        max_items: { type: 'integer' },
      },
    },
    async execute(args) {
      const result = await files.fileList(args.path as string || '.', args.max_items as number)
      return {
        success: result.success,
        content: JSON.stringify(result.items),
        error: result.error,
      }
    },
  },
  {
    name: 'file_search',
    description: 'Search files by name pattern.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: { type: 'string' },
        pattern: { type: 'string' },
        max_results: { type: 'integer' },
      },
      required: ['directory', 'pattern'],
    },
    async execute(args) {
      const result = await files.fileSearch(
        args.directory as string,
        args.pattern as string,
        args.max_results as number
      )
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error,
      }
    },
  },
  {
    name: 'file_grep',
    description: 'Search within files using grep.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: { type: 'string' },
        query: { type: 'string', description: 'Search pattern' },
        max_results: { type: 'integer' },
        file_pattern: { type: 'string' },
      },
      required: ['directory', 'query'],
    },
    async execute(args) {
      const result = await files.fileGrep(
        args.directory as string,
        args.query as string,
        args.max_results as number,
        args.file_pattern as string || '*'
      )
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error,
      }
    },
  },
  {
    name: 'file_glob',
    description: 'Find files matching glob patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: { type: 'string' },
        patterns: { type: 'array', items: { type: 'string' } },
        max_results: { type: 'integer' },
      },
      required: ['directory', 'patterns'],
    },
    async execute(args) {
      const result = await files.fileGlob(
        args.directory as string,
        args.patterns as string[],
        args.max_results as number
      )
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error,
      }
    },
  },

  // Code Execution
  {
    name: 'run_code',
    description: 'Run code sandbox (Python, JS, Bash).',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        language: { type: 'string', enum: ['python', 'javascript', 'bash'] },
        timeout: { type: 'integer' },
      },
      required: ['code', 'language'],
    },
    async execute(args) {
      const result = await code.runCode(
        args.code as string,
        args.language as 'python' | 'javascript' | 'bash',
        args.timeout as number || 30
      )
      return {
        success: result.success,
        content: result.output,
        error: result.error,
      }
    },
  },
  {
    name: 'run_python_snippet',
    description: 'Run Python with common imports.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        timeout: { type: 'integer' },
      },
      required: ['code'],
    },
    async execute(args) {
      const result = await code.runPythonSnippet(args.code as string, args.timeout as number)
      return {
        success: result.success,
        content: result.output,
        error: result.error,
      }
    },
  },
  {
    name: 'run_command',
    description: 'Execute shell command. Supports any command with bash shell. Use for file ops, servers, scripts, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Shell command to execute (full command with args)' },
        cwd: { type: 'string', description: 'Working directory (optional, defaults to current)' },
        background: { type: 'boolean', description: 'Run in background with nohup (default: false)' },
        timeout: { type: 'integer', description: 'Timeout in seconds (default: 30)' },
      },
      required: ['command'],
    },
    async execute(args) {
      const { execSync, spawn } = await import('node:child_process')

      const cmd = args.command as string
      const workingDir = (args.cwd as string) || process.cwd()
      const timeout = (args.timeout as number) || 30
      const runBackground = (args.background as boolean) || false

      // Dangerous commands that need permission
      const dangerous = ['rm -rf', 'dd', 'mkfs', ':(){', 'fork bomb', '> /dev/', 'curl | bash', 'wget -O- |']
      const isDangerous = dangerous.some(d => cmd.toLowerCase().includes(d))

      if (isDangerous) {
        return { success: false, content: '', error: `⚠️  Dangerous command detected: "${cmd.slice(0, 50)}..."\n\nTo execute dangerous commands, run directly in your terminal.` }
      }

      // Handle cd with full command
      let fullCmd = cmd
      if (cmd.startsWith('cd ') && !cmd.includes('&&')) {
        // Single cd command - just validate directory
        const match = cmd.match(/^cd\s+(.+)$/)
        if (match) {
          const targetDir = match[1].replace(/^~/, process.env.HOME || '~')
          try {
            const { statSync } = await import('node:fs')
            statSync(targetDir)
            return { success: true, content: `Directory changed to: ${targetDir}` }
          } catch {
            return { success: false, content: '', error: `Directory not found: ${targetDir}` }
          }
        }
      }

      try {
        // Platform-specific shell
        const isWin = process.platform === 'win32'

        // Handle background execution
        if (runBackground || /\s+&$/.test(cmd)) {
          const cleanCmd = cmd.replace(/\s*&\s*$/, '').trim()
          spawn(cleanCmd, [], {
            shell: true,
            cwd: workingDir,
            detached: true,
            stdio: 'ignore',
          }).unref()
          return { success: true, content: `Started in background: ${cleanCmd}` }
        }

        // Normal execution with timeout via platform-appropriate shell
        let output: string
        if (isWin) {
          output = execSync(`cmd.exe /c ${cmd}`, {
            encoding: 'utf-8',
            timeout: timeout * 1000,
            cwd: workingDir,
            maxBuffer: 10 * 1024 * 1024,
          })
        } else {
          output = execSync(`/bin/bash -c ${JSON.stringify(cmd)}`, {
            encoding: 'utf-8',
            timeout: timeout * 1000,
            cwd: workingDir,
            maxBuffer: 10 * 1024 * 1024,
          })
        }
        return { success: true, content: output }
      } catch (e: any) {
        if (e.killed) {
          return { success: false, content: '', error: `Command timed out after ${timeout}s` }
        }
        return { success: false, content: '', error: e.message }
      }
    },
  },

  // GitHub
  {
    name: 'github_repo',
    description: 'Get repo info.',
    inputSchema: {
      type: 'object',
      properties: { owner: { type: 'string' }, repo: { type: 'string' } },
      required: ['owner', 'repo'],
    },
    async execute(args) {
      const result = await github.githubRepo(args.owner as string, args.repo as string)
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'github_readme',
    description: 'Get repo README.',
    inputSchema: {
      type: 'object',
      properties: { owner: { type: 'string' }, repo: { type: 'string' } },
      required: ['owner', 'repo'],
    },
    async execute(args) {
      const result = await github.githubReadme(args.owner as string, args.repo as string)
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'github_issues',
    description: 'List repo issues.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        state: { type: 'string', enum: ['open', 'closed', 'all'] },
      },
      required: ['owner', 'repo'],
    },
    async execute(args) {
      const result = await github.githubIssues(
        args.owner as string,
        args.repo as string,
        args.state as 'open' | 'closed' | 'all' || 'open'
      )
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'github_commits',
    description: 'List recent commits.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        limit: { type: 'integer' },
      },
      required: ['owner', 'repo'],
    },
    async execute(args) {
      const result = await github.githubCommits(
        args.owner as string,
        args.repo as string,
        args.limit as number || 20
      )
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'github_search_repos',
    description: 'Search repos.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'integer' },
      },
      required: ['query'],
    },
    async execute(args) {
      const result = await github.githubSearchRepos(args.query as string, args.limit as number || 10)
      return { success: result.success, content: result.output, error: result.error }
    },
  },

  // YouTube
  {
    name: 'youtube_transcript',
    description: 'Get transcript from video.',
    inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    async execute(args) {
      const result = await youtube.youtubeTranscript(args.url as string)
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'youtube_video_info',
    description: 'Get video metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        video_id: { type: 'string' },
        url: { type: 'string' },
      },
    },
    async execute(args) {
      const result = await youtube.youtubeVideoInfo(
        args.video_id as string | undefined,
        args.url as string | undefined
      )
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'youtube_search',
    description: 'Search videos.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'integer' },
      },
      required: ['query'],
    },
    async execute(args) {
      const result = await youtube.youtubeSearch(args.query as string, args.limit as number || 10)
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'youtube_summarize',
    description: 'Summarize transcript.',
    inputSchema: {
      type: 'object',
      properties: {
        transcript: { type: 'string' },
        max_words: { type: 'integer' },
      },
      required: ['transcript'],
    },
    async execute(args) {
      const result = await youtube.youtubeSummarize(
        args.transcript as string,
        args.max_words as number || 500
      )
      return { success: result.success, content: result.output, error: result.error }
    },
  },

  // Data Analysis
  {
    name: 'pandas_create',
    description: 'Create DataFrame from data.',
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'JSON data' },
        name: { type: 'string' },
      },
      required: ['data'],
    },
    async execute(args) {
      const result = await code.pandasCreate(args.data as string, args.name as string)
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'pandas_filter',
    description: 'Filter data.',
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        conditions: { type: 'string' },
      },
      required: ['data', 'conditions'],
    },
    async execute(args) {
      const result = await code.pandasFilter(args.data as unknown[], args.conditions as string)
      return { success: result.success, content: result.output, error: result.error }
    },
  },
  {
    name: 'pandas_aggregate',
    description: 'Aggregate/group data.',
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        group_by: { type: 'array', items: { type: 'string' } },
        aggregations: { type: 'object' },
      },
      required: ['data', 'group_by', 'aggregations'],
    },
    async execute(args) {
      const result = await code.pandasAggregate(
        args.data as unknown[],
        args.group_by as string[],
        args.aggregations as Record<string, string>
      )
      return { success: result.success, content: result.output, error: result.error }
    },
  },

  // Plotting
  {
    name: 'plot_line',
    description: 'Generate line plot.',
    inputSchema: {
      type: 'object',
      properties: { x: { type: 'array' }, y: { type: 'array' }, title: { type: 'string' } },
      required: ['x', 'y'],
    },
    async execute(args) {
      return {
        success: true,
        content: `Line chart: ${args.title || 'Plot'}\nX: ${(args.x as unknown[]).slice(0, 5)}\nY: ${(args.y as unknown[]).slice(0, 5)}\n(Use run_code with matplotlib to render)`,
      }
    },
  },
  {
    name: 'plot_bar',
    description: 'Generate bar chart.',
    inputSchema: {
      type: 'object',
      properties: { categories: { type: 'array' }, values: { type: 'array' }, title: { type: 'string' } },
      required: ['categories', 'values'],
    },
    async execute(args) {
      return {
        success: true,
        content: `Bar chart: ${args.title || 'Plot'}\nCategories: ${(args.categories as unknown[]).slice(0, 5)}\nValues: ${(args.values as unknown[]).slice(0, 5)}\n(Use run_code with matplotlib to render)`,
      }
    },
  },
  // TTS: Text-to-Speech
  {
    name: 'tts_speak',
    description: 'Read text aloud using Microsoft Edge TTS (free, high quality). Use when user asks to speak, read aloud, or play audio of content.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to speak aloud' },
        voice: { type: 'string', description: 'Voice name (e.g., en-US-AriaNeural, en-GB-SoniaNeural). Default: en-US-AriaNeural' },
        speed: { type: 'string', description: 'Speed adjustment (e.g., +0%, -10%, +20%). Default: +0%' },
      },
      required: ['text'],
    },
    async execute(args) {
      try {
        const { speak, loadTTSConfig } = await import('../tts/index.ts')
        const config = loadTTSConfig()
        if (!config.enabled) {
          return { success: false, content: '', error: 'TTS is disabled. Run /tts on to enable.' }
        }
        await speak(args.text as string, { voice: args.voice as string | undefined })
        return { success: true, content: `Speaking: ${(args.text as string).slice(0, 100)}...` }
      } catch (e: any) {
        return { success: false, content: '', error: e.message }
      }
    },
  },
  {
    name: 'tts_list_voices',
    description: 'List all available English voices for TTS.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      try {
        const { listVoices } = await import('../tts/index.ts')
        const voices = await listVoices()
        const lines = voices.map(v => `  ${v.ShortName} - ${v.FriendlyName}`)
        return { success: true, content: `${voices.length} English voices:\n${lines.join('\n')}` }
      } catch (e: any) {
        return { success: false, content: '', error: e.message }
      }
    },
  },
  {
    name: 'tts_config',
    description: 'Configure TTS settings. Enable/disable, set default voice.',
    inputSchema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', description: 'Enable or disable TTS' },
        voice: { type: 'string', description: 'Default voice name' },
        autoPlay: { type: 'boolean', description: 'Auto-play TTS when summary is generated' },
      },
    },
    async execute(args) {
      try {
        const { loadTTSConfig, saveTTSConfig } = await import('../tts/index.ts')
        const current = loadTTSConfig()
        const updated = { ...current, ...args as any }
        saveTTSConfig(updated)
        return { success: true, content: `TTS ${updated.enabled ? 'enabled' : 'disabled'}. Voice: ${updated.defaultVoice || 'en-US-AriaNeural'}` }
      } catch (e: any) {
        return { success: false, content: '', error: e.message }
      }
    },
  },
  // Browser (Headless Playwright)
  {
    name: 'browser_navigate',
    description: 'Navigate to URL with headless browser. Returns full page HTML after DOM ready. Supports waitForSelector for dynamic content.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
        waitForSelector: { type: 'string', description: 'CSS selector to wait for before returning' },
        timeout: { type: 'integer', description: 'Timeout in ms (default: 15000)' },
      },
      required: ['url'],
    },
    async execute(args) {
      const result = await browser.browser_navigate(
        args.url as string,
        args.waitForSelector as string | undefined,
        args.timeout as number || 15000
      )
      return { success: result.success, content: result.content, error: result.error, url: result.url, title: result.title }
    },
  },
  {
    name: 'browser_screenshot',
    description: 'Take screenshot of page or element. Returns base64 PNG if screenshot captured.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to screenshot' },
        selector: { type: 'string', description: 'CSS selector for element screenshot (optional)' },
        fullPage: { type: 'boolean', description: 'Screenshot entire page (default: false)' },
      },
      required: ['url'],
    },
    async execute(args) {
      const result = await browser.browser_screenshot(
        args.url as string,
        args.selector as string | undefined,
        args.fullPage as boolean || false
      )
      return {
        success: result.success,
        content: result.content || '',
        screenshot: result.screenshot,
        error: result.error,
      }
    },
  },
  {
    name: 'browser_click',
    description: 'Click element and optionally wait for navigation.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to first' },
        selector: { type: 'string', description: 'CSS selector of element to click' },
        waitForNavigation: { type: 'boolean', description: 'Wait for page navigation after click (default: true)' },
      },
      required: ['url', 'selector'],
    },
    async execute(args) {
      const result = await browser.browser_click(
        args.url as string,
        args.selector as string,
        args.waitForNavigation as boolean !== false
      )
      return { success: result.success, content: result.content, error: result.error, url: result.url }
    },
  },
  {
    name: 'browser_type',
    description: 'Type text into input field and optionally submit.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to first' },
        selector: { type: 'string', description: 'CSS selector of input field' },
        text: { type: 'string', description: 'Text to type' },
        submit: { type: 'boolean', description: 'Click after typing (default: false)' },
      },
      required: ['url', 'selector', 'text'],
    },
    async execute(args) {
      const result = await browser.browser_type(
        args.url as string,
        args.selector as string,
        args.text as string,
        args.submit as boolean || false
      )
      return { success: result.success, content: result.content, error: result.error, url: result.url }
    },
  },
  {
    name: 'browser_evaluate',
    description: 'Run JavaScript in browser context. Useful for extracting dynamic data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
        code: { type: 'string', description: 'JavaScript code to execute (function body, no function keyword needed)' },
      },
      required: ['url', 'code'],
    },
    async execute(args) {
      const result = await browser.browser_evaluate(args.url as string, args.code as string)
      return { success: result.success, content: result.content, error: result.error }
    },
  },
  {
    name: 'browser_extract',
    description: 'Extract multiple elements by CSS selectors in one go. Returns JSON with all extracted values.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
        selectors: { type: 'object', description: 'Key-value pairs: field name -> CSS selector', additionalProperties: { type: 'string' } },
      },
      required: ['url', 'selectors'],
    },
    async execute(args) {
      const result = await browser.browser_extract(
        args.url as string,
        args.selectors as Record<string, string>
      )
      return { success: result.success, content: result.content, error: result.error, url: result.url }
    },
  },
  {
    name: 'browser_health',
    description: 'Check if Playwright/headless browser is available.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const result = await browser.browser_health()
      return { success: result.success, content: result.success ? 'Playwright browser: OK' : 'Playwright browser: unavailable', error: result.error }
    },
  },
  ...engiTools,
]

// ── Tool Name Aliases ─────────────────────────────────────────────────────
// Map common model-generated tool names to actual tool names
// Handles variations from different model prompt styles

const TOOL_ALIASES: Record<string, string> = {
  // File system aliases
  'fs.ls': 'file_list',
  'fs.read': 'file_read',
  'fs.write': 'file_write',
  'fs.search': 'file_search',
  'fs.grep': 'file_grep',
  'fs.glob': 'file_glob',
  'read_file': 'file_read',
  'readFile': 'file_read',
  'write_file': 'file_write',
  'writeFile': 'file_write',
  'list_files': 'file_list',
  'listFiles': 'file_list',
  'list_directory': 'file_list',
  'read_directory': 'file_list',
  'ls_dir': 'file_list',
  'search_files': 'file_search',
  'grep_files': 'file_grep',
  'glob_files': 'file_glob',
  'cat': 'file_read',

  // Web search aliases (comprehensive)
  'google:search': 'searxng_search',
  'google_search': 'searxng_search',
  'search_google': 'searxng_search',
  'googleWebSearch': 'searxng_search',
  'web_search': 'searxng_search',
  'search_web': 'searxng_search',
  'websearch': 'searxng_search',
  'search': 'searxng_search',
  'search_the_web': 'searxng_search',
  'bing_search': 'searxng_search',
  'duckduckgo': 'searxng_search',
  'ddg': 'searxng_search',
  'fetch_url': 'fetch_web_content',
  'fetchWeb': 'fetch_web_content',
  'scrape': 'fetch_web_content',
  'web_fetch': 'fetch_web_content',
  'fetch_url_content': 'fetch_web_content',

  // GitHub aliases
  'github:search': 'github_search_repos',
  'github_search': 'github_search_repos',
  'search_repos': 'github_search_repos',
  'list_issues': 'github_issues',
  'list_commits': 'github_commits',

  // YouTube aliases
  'youtube:transcript': 'youtube_transcript',
  'youtube:search': 'youtube_search',
  'yt_transcript': 'youtube_transcript',
  'yt_search': 'youtube_search',

  // HackerNews aliases
  'hackernews:top': 'hackernews_top',
  'hackernews:new': 'hackernews_new',
  'hackernews:best': 'hackernews_best',
  'hn_top': 'hackernews_top',
  'hn_new': 'hackernews_new',
  'hn_best': 'hackernews_best',

  // Code execution aliases
  'bash': 'run_command',
  'shell': 'run_command',
  'exec': 'run_command',
  'run_bash': 'run_command',
  'run_shell': 'run_command',
  'python': 'run_python_snippet',
  'run_py': 'run_python_snippet',

  // Browser aliases
  'browser:navigate': 'browser_navigate',
  'browser:screenshot': 'browser_screenshot',
  'browser:click': 'browser_click',
  'open_url': 'open_in_browser',
  'visit': 'browser_navigate',
  'goto': 'browser_navigate',
}

// ── Argument Transforms ────────────────────────────────────────────────────
// Transform arguments when aliasing tools with different parameter formats

interface ArgTransform {
  from: string   // original parameter name
  to: string     // target parameter name
  transform: (val: unknown) => unknown  // optional value transformation
}

const ARG_TRANSFORMS: Record<string, ArgTransform[]> = {
  // google:search uses queries: ["query"] but searxng_search uses query: "query"
  'searxng_search': [
    { from: 'queries', to: 'query', transform: (v) => Array.isArray(v) ? v[0] : v },
    { from: 'searchQuery', to: 'query', transform: (v) => v },
    { from: 'queryString', to: 'query', transform: (v) => v },
    { from: 'q', to: 'query', transform: (v) => v },
  ],
  // fetch_web_content uses url but other tools might use link or href
  'fetch_web_content': [
    { from: 'url', to: 'url', transform: (v) => v },
    { from: 'link', to: 'url', transform: (v) => v },
    { from: 'href', to: 'url', transform: (v) => v },
    { from: 'pageUrl', to: 'url', transform: (v) => v },
  ],
}

/**
 * Transform arguments based on the target tool name
 * Handles parameter name differences between aliases
 */
function transformArgs(originalName: string, targetTool: string, args: Record<string, unknown>): Record<string, unknown> {
  const transforms = ARG_TRANSFORMS[targetTool]
  if (!transforms) return args

  const result = { ...args }

  for (const t of transforms) {
    if (result[t.from] !== undefined) {
      // Rename the key and apply transformation
      const value = result[t.from]
      delete result[t.from]
      result[t.to] = t.transform(value)
    }
  }

  return result
}

/**
 * Get the original tool name that was aliased
 */
function getOriginalAlias(name: string): string | undefined {
  if (TOOL_ALIASES[name]) return name

  const lowerName = name.toLowerCase()
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (alias.toLowerCase() === lowerName) {
      return alias
    }
  }

  // Check partial match
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (lowerName.includes(alias.toLowerCase())) {
      return alias
    }
  }

  return undefined
}

/**
 * Normalize a tool name by checking aliases
 * Returns the canonical tool name if found, otherwise returns original
 */
export function normalizeToolName(name: string): string {
  // Check direct alias first
  if (TOOL_ALIASES[name]) {
    return TOOL_ALIASES[name]
  }

  // Try case-insensitive exact match
  const lowerName = name.toLowerCase()
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (alias.toLowerCase() === lowerName) {
      return canonical
    }
  }

  // Try partial match - check if alias is contained in name
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (lowerName.includes(alias.toLowerCase())) {
      return canonical
    }
  }

  // Try fuzzy match - for names like "google:search" split by : or _
  const parts = name.split(/[:_\-.]/)
  for (const part of parts) {
    if (part && TOOL_ALIASES[part]) {
      return TOOL_ALIASES[part]
    }
    for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
      if (alias.toLowerCase() === part.toLowerCase()) {
        return canonical
      }
    }
  }

  return name
}

// ── Registry Access ───────────────────────────────────────────────────────

export function getAllTools(): NativeTool[] {
  return tools
}

export function getTool(name: string): NativeTool | undefined {
  const normalized = normalizeToolName(name)
  return tools.find(t => t.name === normalized)
}

export function getToolNames(): string[] {
  return tools.map(t => t.name)
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const normalizedName = normalizeToolName(name)
  const tool = getTool(name)

  if (!tool) {
    // Tool not found even after normalization
    return { success: false, content: '', error: `Unknown tool: ${name}` }
  }

  // Transform arguments if this is an aliased tool
  const originalAlias = getOriginalAlias(name)
  const transformedArgs = originalAlias
    ? transformArgs(originalAlias, normalizedName, args)
    : args

  try {
    return await tool.execute(transformedArgs)
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export function getFormattedTools(): {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}[] {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }))
}
