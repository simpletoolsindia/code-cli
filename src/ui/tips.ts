// Beast CLI - Tips System (Clean)
// Useful tips shown after responses — no emoji, no clutter

import { s, fg } from './colors.ts'

// ── Tip Types ────────────────────────────────────────────────────────────────
interface Tip {
  cmd: string
  tip: string
  category: 'command' | 'tool' | 'provider' | 'context' | 'fun'
}

// Compact tips — high value, no emoji
const TIPS: Tip[] = [
  // Commands
  { cmd: '/model <name>',  tip: 'Switch models mid-session without restarting', category: 'command' },
  { cmd: '/provider <name>',tip: 'Jump between Ollama, OpenRouter, Claude instantly', category: 'command' },
  { cmd: '/tools',         tip: 'See all available MCP tools and their descriptions', category: 'command' },
  { cmd: '/clear',         tip: 'Wipe conversation history to reset context window', category: 'command' },
  { cmd: '/models',        tip: 'List all available models for your current provider', category: 'command' },
  { cmd: 'Tab',            tip: 'Auto-complete tool names and common commands', category: 'command' },
  { cmd: 'Up / Down',      tip: 'Navigate through your command history', category: 'command' },

  // Tools
  { cmd: 'file_read',      tip: 'Read any file in the current directory', category: 'tool' },
  { cmd: 'file_list',      tip: 'Show directories and files with sizes and times', category: 'tool' },
  { cmd: 'file_tree',      tip: 'View your entire project structure at a glance', category: 'tool' },
  { cmd: 'run_code',       tip: 'Execute shell commands — git, npm, docker, anything', category: 'tool' },
  { cmd: 'run_python',     tip: 'Run Python code with a sandboxed interpreter', category: 'tool' },
  { cmd: 'github_search_repos', tip: 'Search GitHub by keyword with stars and language', category: 'tool' },
  { cmd: 'searxng_search', tip: 'Web search without leaving the CLI', category: 'tool' },
  { cmd: 'fetch_web',      tip: 'Fetch full web page content from any URL', category: 'tool' },
  { cmd: 'hacker_news',    tip: 'Get top Hacker News stories and comments', category: 'tool' },
  { cmd: 'youtube_transcript', tip: 'Extract transcripts from YouTube videos', category: 'tool' },

  // Providers
  { cmd: '/provider codex', tip: 'Use ChatGPT Plus OAuth — free with your subscription', category: 'provider' },
  { cmd: '/provider ollama',tip: 'Ollama runs AI models locally — no internet needed', category: 'provider' },
  { cmd: 'beast --defaults',tip: 'Auto-selects the best available provider', category: 'provider' },
  { cmd: 'Claude',         tip: 'Anthropic Claude — excellent reasoning and long context', category: 'provider' },
  { cmd: 'Groq',           tip: 'Ultra-fast inference with a free tier', category: 'provider' },

  // Context
  { cmd: '/compact',       tip: 'Manually trigger context compaction to free up space', category: 'context' },
  { cmd: 'Context',        tip: 'History counts toward your context — /clear to free it', category: 'context' },
  { cmd: 'auto-compact',   tip: 'Context auto-compacts at 95% — never lose your place', category: 'context' },

  // Fun
  { cmd: '--theme claude', tip: 'Use --theme claude for warm editorial styling', category: 'fun' },
  { cmd: '--theme dracula',tip: 'Use --theme dracula for dark mode', category: 'fun' },
]

// ── Tip Selection ────────────────────────────────────────────────────────────
export function randomTip(): string {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)]
  return `${s('💡', fg.warning)} ${s(tip.tip, fg.secondary)} ${s(`(${tip.cmd})`, fg.muted)}`
}

export function getTipByCategory(category: Tip['category']): string {
  const tips = TIPS.filter(t => t.category === category)
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
