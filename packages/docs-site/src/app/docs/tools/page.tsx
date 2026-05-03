export default function ToolsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tools</h1>
        <p className="text-lg text-slate-400">
          Tools are the actions the AI agent can take — reading files, running commands, searching code, and more. BeastCLI preselects tools based on your prompt to reduce context window usage.
        </p>
      </div>

      {/* For Non-Technical Users */}
      <section className="mb-12 p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
        <h2 className="text-xl font-bold text-white mb-3">What Are Tools?</h2>
        <p className="text-slate-400 mb-4">
          Think of tools as the AI's hands. When you ask BeastCLI to do something, it uses these tools to actually interact with your project — reading files, making changes, running tests, and searching the web.
        </p>
        <p className="text-slate-400">
          You don't need to manually select tools. The AI chooses the right ones automatically based on what you ask. For example, if you say "search for where X is used," it will use the search tools. If you say "create a new file," it will use the write tool.
        </p>
      </section>

      {/* Core Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Core Tools</h2>

        <ToolCard
          id="bash"
          name="Bash"
          description="Execute shell commands with timeout protection, tree-sitter parsing for permission analysis, and dynamic path resolution. Supports both Bash and PowerShell."
          params={[
            { name: 'command', type: 'string', required: true, desc: 'The command to execute' },
            { name: 'timeout', type: 'number', required: false, desc: 'Timeout in milliseconds (default: 120000)' },
            { name: 'workdir', type: 'string', required: false, desc: 'Working directory (default: current)' },
            { name: 'description', type: 'string', required: false, desc: 'Brief description of what the command does' },
          ]}
        />

        <ToolCard
          id="read"
          name="Read"
          description="Read files or directories. Supports text files, images, and PDFs. Can read specific line ranges with offset/limit. Integrates with LSP for code intelligence."
          params={[
            { name: 'filePath', type: 'string', required: true, desc: 'Absolute path to the file or directory' },
            { name: 'offset', type: 'number', required: false, desc: 'Starting line number (1-indexed)' },
            { name: 'limit', type: 'number', required: false, desc: 'Maximum lines to read (default: 2000)' },
          ]}
        />

        <ToolCard
          id="write"
          name="Write"
          description="Create new files or overwrite existing files. Generates diffs for existing files and runs LSP diagnostics after writing."
          params={[
            { name: 'filePath', type: 'string', required: true, desc: 'Absolute path to the file' },
            { name: 'content', type: 'string', required: true, desc: 'Content to write' },
          ]}
        />

        <ToolCard
          id="edit"
          name="Edit"
          description="Replace text in files using old/new string matching. Uses multiple matching algorithms (Simple, LineTrimmed, BlockAnchor, WhitespaceNormalized) for reliable replacements."
          params={[
            { name: 'filePath', type: 'string', required: true, desc: 'Absolute path to the file' },
            { name: 'oldString', type: 'string', required: true, desc: 'Text to replace' },
            { name: 'newString', type: 'string', required: true, desc: 'Replacement text' },
            { name: 'replaceAll', type: 'boolean', required: false, desc: 'Replace all occurrences (default: false)' },
          ]}
        />

        <ToolCard
          id="glob"
          name="Glob"
          description="Pattern-based file matching. Uses ripgrep under the hood for fast file discovery. Checks external directory permissions before scanning."
          params={[
            { name: 'pattern', type: 'string', required: true, desc: 'Glob pattern (e.g., **/*.ts)' },
            { name: 'path', type: 'string', required: false, desc: 'Directory to search in' },
          ]}
        />

        <ToolCard
          id="grep"
          name="Grep"
          description="Search file contents using regex patterns. Fast content search across files with include/exclude filters."
          params={[
            { name: 'pattern', type: 'string', required: true, desc: 'Regex pattern to search for' },
            { name: 'path', type: 'string', required: false, desc: 'Directory to search in' },
            { name: 'include', type: 'string', required: false, desc: 'File pattern to include (e.g., *.ts)' },
            { name: 'exclude', type: 'string', required: false, desc: 'File pattern to exclude' },
          ]}
        />

        <ToolCard
          id="webfetch"
          name="WebFetch"
          description="Fetch and parse web content. Supports markdown, text, and HTML formats. Handles Cloudflare bot detection and includes DuckDuckGo fallback."
          params={[
            { name: 'url', type: 'string', required: true, desc: 'URL to fetch' },
            { name: 'format', type: 'string', required: false, desc: 'Output format: markdown, text, html' },
          ]}
        />

        <ToolCard
          id="websearch"
          name="WebSearch"
          description="Search the web using configured engine (Exa AI, DuckDuckGo, or SearXNG) with automatic fallback."
          params={[
            { name: 'query', type: 'string', required: true, desc: 'Search query' },
            { name: 'numResults', type: 'number', required: false, desc: 'Number of results (default: 8)' },
            { name: 'livecrawl', type: 'string', required: false, desc: 'Crawl mode: fallback, preferred' },
          ]}
        />

        <ToolCard
          id="task"
          name="Task"
          description="Delegate work to subagents. Creates a child session with a specific agent (researcher, explorer, etc.) and runs the task independently."
          params={[
            { name: 'prompt', type: 'string', required: true, desc: 'Task description for the subagent' },
            { name: 'description', type: 'string', required: true, desc: 'Short description of the task' },
            { name: 'subagent_type', type: 'string', required: true, desc: 'Agent to use (general, explore, etc.)' },
            { name: 'command', type: 'string', required: false, desc: 'Command to run' },
          ]}
        />

        <ToolCard
          id="todowrite"
          name="TodoWrite"
          description="Manage a todo list with status tracking and priority levels. Helps track progress during multi-step tasks."
          params={[
            { name: 'todos', type: 'array', required: true, desc: 'Array of todos with content, status, and priority' },
          ]}
        />

        <ToolCard
          id="apply_patch"
          name="ApplyPatch"
          description="Apply unified diff patches. Supports add, update, delete, and move operations. Can be used in dry-run mode."
          params={[
            { name: 'code', type: 'string', required: true, desc: 'Unified diff patch content' },
            { name: 'dryRun', type: 'boolean', required: false, desc: 'Preview without applying' },
          ]}
        />
      </section>

      {/* Specialized Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Specialized Tools</h2>

        <table className="doc-table">
          <thead>
            <tr>
              <th>Tool ID</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code className="doc-code">searxng_search</code></td><td>SearXNG</td><td>Search via self-hosted SearXNG instance with DuckDuckGo fallback</td></tr>
            <tr><td><code className="doc-code">lsp</code></td><td>Language Server</td><td>Go to definition, find references, hover, document symbols, call hierarchy</td></tr>
            <tr><td><code className="doc-code">skill</code></td><td>Skill</td><td>Load specialized instruction packs (SKILL.md files)</td></tr>
            <tr><td><code className="doc-code">question</code></td><td>Question</td><td>Ask the user a question in interactive mode</td></tr>
            <tr><td><code className="doc-code">plan</code></td><td>Plan</td><td>Enter or exit plan mode for read-only analysis</td></tr>
            <tr><td><code className="doc-code">hackernews_top</code></td><td>HN Top</td><td>Get top Hacker News stories</td></tr>
            <tr><td><code className="doc-code">hackernews_new</code></td><td>HN New</td><td>Get new Hacker News stories</td></tr>
            <tr><td><code className="doc-code">hackernews_best</code></td><td>HN Best</td><td>Get best Hacker News stories</td></tr>
            <tr><td><code className="doc-code">hackernews_comments</code></td><td>HN Comments</td><td>Get Hacker News comments</td></tr>
            <tr><td><code className="doc-code">youtube_transcript</code></td><td>YT Transcript</td><td>Get YouTube video transcript</td></tr>
            <tr><td><code className="doc-code">youtube_video_info</code></td><td>YT Info</td><td>Get YouTube video metadata</td></tr>
            <tr><td><code className="doc-code">youtube_search</code></td><td>YT Search</td><td>Search YouTube videos</td></tr>
            <tr><td><code className="doc-code">youtube_summarize</code></td><td>YT Summary</td><td>Summarize YouTube video content</td></tr>
            <tr><td><code className="doc-code">pandas_create</code></td><td>Pandas Create</td><td>Create pandas DataFrame from data</td></tr>
            <tr><td><code className="doc-code">pandas_filter</code></td><td>Pandas Filter</td><td>Filter pandas DataFrame</td></tr>
            <tr><td><code className="doc-code">pandas_aggregate</code></td><td>Pandas Aggregate</td><td>Aggregate pandas DataFrame</td></tr>
            <tr><td><code className="doc-code">plot_line</code></td><td>Line Plot</td><td>Create line chart visualization</td></tr>
            <tr><td><code className="doc-code">plot_bar</code></td><td>Bar Plot</td><td>Create bar chart visualization</td></tr>
          </tbody>
        </table>
      </section>

      {/* Tool Preselection */}
      <section className="p-6 rounded-xl bg-gradient-to-br from-beast-500/10 to-cyber-500/10 border border-beast-500/20">
        <h3 className="text-lg font-semibold text-white mb-3">Tool Preselection</h3>
        <p className="text-slate-300 mb-4">
          BeastCLI uses keyword-based tool preselection to reduce context window usage. When you send a prompt, the system scans for keywords and only sends relevant tools to the LLM.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <KeywordRow keywords="search, web, url, website" tools="websearch, webfetch, searxng_search" />
          <KeywordRow keywords="hacker news, hn, tech news" tools="hackernews_*" />
          <KeywordRow keywords="youtube, video, transcript" tools="youtube_*" />
          <KeywordRow keywords="data, csv, pandas, plot, chart" tools="pandas_*, plot_*" />
          <KeywordRow keywords="lsp, symbol, definition" tools="lsp" />
          <KeywordRow keywords="plan, strategy" tools="plan" />
        </div>
        <p className="text-slate-500 text-sm mt-4">
          Core tools (bash, read, write, edit, glob, grep, task, fetch, todo, skill, etc.) are always available.
          Specialized tools are added only when relevant keywords are detected.
        </p>
      </section>
    </>
  )
}

function ToolCard({ id, name, description, params }: {
  id: string
  name: string
  description: string
  params: { name: string, type: string, required: boolean, desc: string }[]
}) {
  return (
    <div className="mb-4 p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
      <div className="flex items-center gap-3 mb-2">
        <code className="text-lg font-bold text-beast-400">{id}</code>
        <span className="text-white font-medium">{name}</span>
      </div>
      <p className="text-slate-400 mb-4">{description}</p>
      {params.length > 0 && (
        <table className="doc-table">
          <thead>
            <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            {params.map(p => (
              <tr key={p.name}>
                <td>
                  <code className="doc-code">{p.name}</code>
                  {p.required && <span className="text-red-400 ml-1 text-xs">*</span>}
                </td>
                <td><span className="text-cyber-400 text-xs">{p.type}</span></td>
                <td className="text-sm">{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function KeywordRow({ keywords, tools }: { keywords: string, tools: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-slate-800/30 text-xs">
      <span className="text-slate-400">{keywords}</span>
      <span className="text-beast-400 font-mono">{tools}</span>
    </div>
  )
}
