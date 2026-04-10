// Beast CLI - Tips System (Clean)
// Useful tips shown after responses — no emoji, no clutter

import { s, fg } from './colors.ts'

// ── Tip Types ────────────────────────────────────────────────────────────────
interface Tip {
  cmd: string
  tip: string
  category: 'command' | 'tool' | 'provider' | 'context' | 'fun'
}

// 60+ tips — Fisher-Yates shuffle so tips appear in random order
export const ALL_TIPS: Tip[] = [
  // Commands
  { cmd: '/model <name>',  tip: 'Switch models mid-session without restarting', category: 'command' },
  { cmd: '/provider <name>',tip: 'Jump between Ollama, OpenRouter, Claude instantly', category: 'command' },
  { cmd: '/tools',         tip: 'See all available MCP tools and their descriptions', category: 'command' },
  { cmd: '/clear',         tip: 'Wipe conversation history to reset context window', category: 'command' },
  { cmd: '/clean',         tip: 'Nuke everything — history, memory, and agents for a fresh start', category: 'command' },
  { cmd: '/init',          tip: 'Set up project context, known facts, and custom agents', category: 'command' },
  { cmd: '/agents',        tip: 'Manage custom agents — create, use, delete, or info', category: 'command' },
  { cmd: '/models',        tip: 'List all available models for your current provider', category: 'command' },
  { cmd: '/switch',        tip: 'Reconfigure provider, model, and context size interactively', category: 'command' },
  { cmd: '/login',         tip: 'Authenticate with ChatGPT Plus OAuth for free access', category: 'command' },
  { cmd: '/logout',        tip: 'Clear ChatGPT Plus authentication', category: 'command' },
  { cmd: '/provider',      tip: 'Switch to a different LLM provider interactively', category: 'command' },
  { cmd: 'Tab',            tip: 'Auto-complete slash commands and agent names', category: 'command' },
  { cmd: 'Up / Down',     tip: 'Navigate through your command history', category: 'command' },
  { cmd: '/agents create', tip: 'Create a reusable agent with custom instructions', category: 'command' },
  { cmd: '/agents use <name>', tip: 'Set an agent as always-on — prepended to every prompt', category: 'command' },
  { cmd: '@agentname',     tip: 'Activate a custom agent for a single prompt', category: 'command' },

  // Tools
  { cmd: 'searxng_search', tip: 'Web search without leaving the CLI — multiple engines', category: 'tool' },
  { cmd: 'fetch_web',      tip: 'Fetch full web page content from any URL', category: 'tool' },
  { cmd: 'run_code',       tip: 'Execute shell commands — git, npm, docker, anything', category: 'tool' },
  { cmd: 'run_python',     tip: 'Run Python code with a sandboxed interpreter', category: 'tool' },
  { cmd: 'github_search_repos', tip: 'Search GitHub by keyword with stars and language', category: 'tool' },
  { cmd: 'github_issues',  tip: 'View, create, and manage GitHub issues', category: 'tool' },
  { cmd: 'github_commits', tip: 'Browse commit history for any repository', category: 'tool' },
  { cmd: 'hacker_news',    tip: 'Get top Hacker News stories and comments', category: 'tool' },
  { cmd: 'youtube_transcript', tip: 'Extract transcripts from YouTube videos', category: 'tool' },
  { cmd: 'youtube_search',  tip: 'Search YouTube videos and get metadata', category: 'tool' },
  { cmd: 'webclaw_crawl',  tip: 'Crawl an entire website for structured data', category: 'tool' },
  { cmd: 'scrapling_extract', tip: 'Extract structured data from web pages using CSS selectors', category: 'tool' },
  { cmd: 'file_read',      tip: 'Read any file in the current directory', category: 'tool' },
  { cmd: 'file_write',     tip: 'Write or overwrite files with content', category: 'tool' },
  { cmd: 'file_list',      tip: 'Show directories and files with sizes and times', category: 'tool' },
  { cmd: 'file_search',    tip: 'Full-text search across all files in a directory', category: 'tool' },
  { cmd: 'file_grep',      tip: 'Search for patterns in files with context', category: 'tool' },
  { cmd: 'file_glob',      tip: 'Find files by pattern — great for project exploration', category: 'tool' },
  { cmd: 'pandas_create',  tip: 'Create pandas DataFrames for data analysis', category: 'tool' },
  { cmd: 'pandas_filter',  tip: 'Filter DataFrames by column conditions', category: 'tool' },
  { cmd: 'pandas_aggregate', tip: 'Group and aggregate data — sum, mean, count', category: 'tool' },

  // Providers
  { cmd: '/provider codex', tip: 'Use ChatGPT Plus OAuth — free with your subscription', category: 'provider' },
  { cmd: '/provider ollama',tip: 'Ollama runs AI models locally — no internet needed', category: 'provider' },
  { cmd: 'beast --defaults',tip: 'Auto-selects the best available provider', category: 'provider' },
  { cmd: '/model gpt-4o',  tip: 'Use GPT-4o for the latest capabilities', category: 'provider' },
  { cmd: '/model claude-3-5-sonnet', tip: 'Anthropic Claude — best reasoning and analysis', category: 'provider' },
  { cmd: '/model qwen3.5:35b', tip: 'Qwen 35B — strong coding abilities, runs locally', category: 'provider' },
  { cmd: '/provider groq',  tip: 'Groq — ultra-fast inference with a free tier', category: 'provider' },
  { cmd: '/provider deepseek', tip: 'DeepSeek — cost-effective reasoning models', category: 'provider' },
  { cmd: '/provider gemini', tip: 'Google Gemini — huge context window and multimodal', category: 'provider' },
  { cmd: '/provider anthropic', tip: 'Direct Anthropic API — full Claude access', category: 'provider' },
  { cmd: '/provider openai', tip: 'Direct OpenAI API — GPT models with your key', category: 'provider' },
  { cmd: '/provider lmstudio', tip: 'LM Studio — run any GGUF model locally', category: 'provider' },

  // Context & Memory
  { cmd: '/init',           tip: 'Store project context and facts — remember across sessions', category: 'context' },
  { cmd: 'Memory',          tip: 'Context and facts are stored in ~/.beast-cli/agents/', category: 'context' },
  { cmd: 'auto-compact',    tip: 'Context auto-compacts at 95% — never lose your place', category: 'context' },
  { cmd: 'Context',         tip: 'History counts toward your context — /clear to free it', category: 'context' },
  { cmd: '@agentname',      tip: 'Custom agents get injected as system context in prompts', category: 'context' },

  // Themes & UI
  { cmd: '--theme claude', tip: 'Warm editorial styling like claude.ai', category: 'fun' },
  { cmd: '--theme dracula',tip: 'Classic dark theme with vibrant colors', category: 'fun' },
  { cmd: '--theme catppuccin-mocha', tip: 'Subtle dark theme with pastel accents', category: 'fun' },
  { cmd: '--theme nord',   tip: 'Arctic color palette — clean and calming', category: 'fun' },
  { cmd: '--theme tokyonight', tip: 'Japanese-inspired night theme', category: 'fun' },
  { cmd: '--theme gruvbox', tip: 'Retro warmth — perfect for long sessions', category: 'fun' },
  { cmd: 'beast --help',   tip: 'Full command reference and examples', category: 'fun' },
  { cmd: 'beast --setup',  tip: 'Auto-start MCP server with sensible defaults', category: 'fun' },
  { cmd: '51+ tools',      tip: 'Web search, file ops, GitHub, YouTube, code exec, and more', category: 'fun' },
]

// Fisher-Yates shuffle state
let tipShuffle: Tip[] = []
let tipIndex = 0

function shuffleTips(): void {
  tipShuffle = [...ALL_TIPS]
  for (let i = tipShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tipShuffle[i], tipShuffle[j]] = [tipShuffle[j], tipShuffle[i]]
  }
  tipIndex = 0
}

// ── Tip Selection ────────────────────────────────────────────────────────────
export function randomTip(): string {
  if (tipShuffle.length === 0) shuffleTips()
  if (tipIndex >= tipShuffle.length) shuffleTips()
  const tip = tipShuffle[tipIndex++]
  return `${s('*', fg.warning)} ${s(tip.tip, fg.secondary)} ${s(`(${tip.cmd})`, fg.muted)}`
}

export function getTipByCategory(category: Tip['category']): string {
  const tips = ALL_TIPS.filter(t => t.category === category)
  if (tips.length === 0) return randomTip()
  const tip = tips[Math.floor(Math.random() * tips.length)]
  return `${s('💡', fg.warning)} ${s(tip.tip, fg.secondary)} ${s(`(${tip.cmd})`, fg.muted)}`
}

export function contextualTip(provider?: string, hasApiKey?: boolean): string {
  if (provider === 'codex') {
    return `${s('💡', fg.success)} ${s('ChatGPT Plus OAuth active — all usage is free', fg.success)} ${s('(/logout to sign out)', fg.muted)}`
  }
  if (provider === 'ollama') {
    return `${s('💡', fg.info)} ${s('Running locally — no internet needed', fg.info)} ${s('(/provider to switch)', fg.muted)}`
  }
  if (!hasApiKey) {
    return `${s('💡', fg.success)} ${s('Try beast --defaults for free ChatGPT Plus access', fg.success)} ${s('(beast --help)', fg.muted)}`
  }
  return randomTip()
}

export function tipBanner(): string {
  return '\n' + s('─'.repeat(50), fg.muted) + '\n' + randomTip() + '\n'
}

// ── Feature Highlights (clean — no emoji) ────────────────────────────────────
export const FEATURE_HIGHLIGHTS = [
  { title: '10 Themes',    desc: '--theme dracula, catppuccin-mocha, claude...' },
  { title: '45+ Providers',desc: 'Claude, GPT, Gemini, Groq, Ollama, and more' },
  { title: '51+ Tools',    desc: 'File ops, web search, GitHub, code execution' },
  { title: 'Smart Context',desc: 'Auto-compact at 95%, never lose your place' },
  { title: 'ChatGPT Plus', desc: 'Free with your $20/mo subscription via OAuth' },
]
