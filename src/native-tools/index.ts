// Native Tools Registry
// All MCP tools converted to native local implementations
// This removes the dependency on the MCP Docker server

import * as web from './web.ts'
import * as files from './files.ts'
import * as code from './code.ts'
import * as search from './search.ts'
import * as github from './github.ts'
import * as youtube from './youtube.ts'
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
    description: 'Execute whitelisted system command. Supports cd, python3, npm, git, and background commands with &.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        args: { type: 'array', items: { type: 'string' }, description: 'Command arguments' },
        cwd: { type: 'string', description: 'Working directory (optional)' },
        background: { type: 'boolean', description: 'Run in background with nohup (default: false)' },
        timeout: { type: 'integer', description: 'Timeout in seconds (default: 30)' },
      },
      required: ['command'],
    },
    async execute(args) {
      // Extended allowlist with common dev commands
      const allowed = [
        'ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'find', 'grep', 'head', 'tail', 'wc',
        'cd', 'pwd', 'echo', 'touch', 'chmod', 'chown', 'tar', 'zip', 'unzip',
        'python', 'python2', 'python3', 'node', 'npm', 'npx', 'bun', 'deno',
        'git', 'gh', 'curl', 'wget', 'ssh', 'scp', 'rsync',
        'docker', 'kubectl', 'helm',
        'kill', 'pkill', 'ps', 'top', 'htop', 'df', 'du', 'free',
        'netstat', 'lsof', 'ping', 'traceroute', 'nslookup', 'dig',
        'sed', 'awk', 'cut', 'sort', 'uniq', 'diff',
        'nohup', 'bg', 'jobs', 'fg',
        'code', 'nano', 'vim', 'vi', 'nano',
      ]

      const cmd = args.command as string
      const cmdArgs = (args.args as string[]) || []
      const workingDir = (args.cwd as string) || process.cwd()
      const timeout = (args.timeout as number) || 30
      const runBackground = (args.background as boolean) || false

      if (!allowed.includes(cmd)) {
        return { success: false, content: '', error: `Command not allowed: ${cmd}. Allowed: ${allowed.slice(0, 20).join(', ')}...` }
      }

      // Handle cd specially - it needs shell execution
      if (cmd === 'cd') {
        const targetDir = cmdArgs[0] || workingDir
        try {
          const { statSync } = await import('node:fs')
          statSync(targetDir)
          return { success: true, content: `Changed directory to: ${targetDir}` }
        } catch (e: any) {
          return { success: false, content: '', error: `Directory not found: ${targetDir}` }
        }
      }

      const { execSync, spawn } = await import('node:child_process')
      try {
        let fullCommand = cmdArgs.length > 0 ? `${cmd} ${cmdArgs.join(' ')}` : cmd

        // Handle background execution
        if (runBackground || fullCommand.includes(' &')) {
          fullCommand = fullCommand.replace(/\s*&\s*$/, '').trim()
          spawn(fullCommand, [], {
            shell: true,
            cwd: workingDir,
            detached: true,
            stdio: 'ignore',
          }).unref()

          return { success: true, content: `Started in background: ${fullCommand} (PID: process detached)` }
        }

        // Normal execution with timeout
        const output = execSync(fullCommand, {
          encoding: 'utf-8',
          timeout: timeout * 1000,
          cwd: workingDir,
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        })
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
  ...engiTools,
]

// ── Registry Access ───────────────────────────────────────────────────────

export function getAllTools(): NativeTool[] {
  return tools
}

export function getTool(name: string): NativeTool | undefined {
  return tools.find(t => t.name === name)
}

export function getToolNames(): string[] {
  return tools.map(t => t.name)
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const tool = getTool(name)
  if (!tool) {
    return { success: false, content: '', error: `Unknown tool: ${name}` }
  }

  try {
    return await tool.execute(args)
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
