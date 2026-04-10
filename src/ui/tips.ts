// Beast CLI - Random Tips System
// Shows a random CLI tip after responses to educate users

import { s, fg, icon } from './colors.ts'

// ── Tip Categories ─────────────────────────────────────────────────────────

interface Tip {
  cmd: string
  tip: string
  category: 'command' | 'tool' | 'provider' | 'context' | 'fun'
}

// Core command tips
const COMMAND_TIPS: Tip[] = [
  { cmd: '/model <name>', tip: 'Switch models mid-session without restarting', category: 'command' },
  { cmd: '/provider <name>', tip: 'Jump between Ollama, OpenRouter, Claude instantly', category: 'command' },
  { cmd: '/tools', tip: 'See all available MCP tools and their descriptions', category: 'command' },
  { cmd: '/clear', tip: 'Wipes conversation history to reset context window', category: 'command' },
  { cmd: '/models', tip: 'List all available models for your current provider', category: 'command' },
  { cmd: '/login', tip: 'Authenticate with ChatGPT Plus via OAuth (free with subscription)', category: 'command' },
  { cmd: '/logout', tip: 'Clear ChatGPT Plus OAuth tokens', category: 'command' },
  { cmd: 'Tab', tip: 'Auto-complete tool names and common commands', category: 'command' },
  { cmd: '↑ / ↓', tip: 'Navigate through your command history', category: 'command' },
]

// Tool showcase tips
const TOOL_TIPS: Tip[] = [
  { cmd: 'file_read', tip: 'Use file_read tool to read any file in the current directory', category: 'tool' },
  { cmd: 'file_list', tip: 'file_list shows directories, files with sizes and modification times', category: 'tool' },
  { cmd: 'file_tree', tip: 'View your entire project structure at a glance', category: 'tool' },
  { cmd: 'run_code', tip: 'run_code executes shell commands — git, npm, docker, anything', category: 'tool' },
  { cmd: 'run_python', tip: 'run_python runs Python code with a sandboxed interpreter', category: 'tool' },
  { cmd: 'github_search_repos', tip: 'Search GitHub repositories by keyword with stars and language info', category: 'tool' },
  { cmd: 'searxng_search', tip: 'Search the web without leaving the CLI — great for current events', category: 'tool' },
  { cmd: 'fetch_web', tip: 'Fetch full web page content from any URL for detailed research', category: 'tool' },
  { cmd: 'web_search', tip: 'Quick web search for fast answers', category: 'tool' },
  { cmd: 'hacker_news', tip: 'Get top Hacker News stories and comments', category: 'tool' },
  { cmd: 'youtube_transcript', tip: 'Extract transcripts from YouTube videos for learning', category: 'tool' },
  { cmd: 'real-time data', tip: 'Beast auto-detects queries needing live data (news, weather, prices) and fetches them', category: 'tool' },
]

// Provider tips
const PROVIDER_TIPS: Tip[] = [
  { cmd: '/provider codex', tip: 'Use ChatGPT Plus OAuth — free with your $20/mo subscription!', category: 'provider' },
  { cmd: '/provider ollama', tip: 'Ollama runs AI models locally on your machine — no internet needed', category: 'provider' },
  { cmd: 'beast --defaults', tip: 'Auto-selects best available provider — great for beginners!', category: 'provider' },
  { cmd: '45+ providers', tip: 'Use any LLM provider — cloud (OpenRouter, Claude, GPT) or local (Ollama, LM Studio)', category: 'provider' },
  { cmd: 'Claude', tip: 'Anthropic Claude models offer excellent reasoning and long context', category: 'provider' },
  { cmd: 'Groq', tip: 'Groq provides ultra-fast inference with free tier available', category: 'provider' },
]

// Context management tips
const CONTEXT_TIPS: Tip[] = [
  { cmd: '/compact', tip: 'Manually trigger context compaction to free up space', category: 'context' },
  { cmd: 'context', tip: 'Chat history counts toward your context window — /clear to free it up', category: 'context' },
  { cmd: 'auto-compact', tip: 'Context auto-compacts at 95% usage — never lose your place!', category: 'context' },
  { cmd: 'memory', tip: 'Memory checkpoints save your task state between sessions', category: 'context' },
]

// Fun/interesting tips
const FUN_TIPS: Tip[] = [
  { cmd: 'CLI flags', tip: 'Skip setup: beast --provider openrouter --model qwen/qwen3-14b', category: 'fun' },
  { cmd: 'MCP tools', tip: '51+ native tools available: file ops, web, code, GitHub, YouTube, HN, and more', category: 'fun' },
  { cmd: 'themes', tip: 'Use --theme claude for warm editorial styling or --theme dracula for dark mode', category: 'fun' },
  { cmd: 'code execution', tip: 'Write and run code in any language — Python, JavaScript, Bash, and more', category: 'fun' },
]

// Combine all tips
const ALL_TIPS: Tip[] = [
  ...COMMAND_TIPS,
  ...TOOL_TIPS,
  ...PROVIDER_TIPS,
  ...CONTEXT_TIPS,
  ...FUN_TIPS,
]

// ── Tip Selection ──────────────────────────────────────────────────────────

/**
 * Get a random tip from all categories
 */
export function randomTip(): string {
  const tip = ALL_TIPS[Math.floor(Math.random() * ALL_TIPS.length)]
  return `${s(icon.sparkles + ' Tip:', fg.warning)} ${s(tip.tip, fg.secondary)} ${s(`(${tip.cmd})`, fg.muted)}`
}

/**
 * Get a tip from a specific category
 */
export function getTipByCategory(category: Tip['category']): string {
  const tips = ALL_TIPS.filter(t => t.category === category)
  if (tips.length === 0) return randomTip()
  const tip = tips[Math.floor(Math.random() * tips.length)]
  return `${s(icon.sparkles + ' Tip:', fg.warning)} ${s(tip.tip, fg.secondary)} ${s(`(${tip.cmd})`, fg.muted)}`
}

/**
 * Get a tip based on context (provider, model, etc.)
 */
export function contextualTip(provider?: string, hasApiKey?: boolean): string {
  // If using ChatGPT Plus, highlight OAuth
  if (provider === 'codex') {
    return `${s(icon.sparkles + ' Tip:', fg.warning)} ${s('ChatGPT Plus OAuth active — all usage is free!', fg.success)} ${s('(/logout to sign out)', fg.muted)}`
  }

  // If using Ollama, highlight local capability
  if (provider === 'ollama') {
    return `${s(icon.sparkles + ' Tip:', fg.warning)} ${s('Running locally — no internet needed!', fg.info)} ${s('(/provider to switch)', fg.muted)}`
  }

  // If no API key, suggest ChatGPT Plus
  if (!hasApiKey) {
    return `${s(icon.sparkles + ' Tip:', fg.warning)} ${s('Try beast --defaults for free ChatGPT Plus access!', fg.success)} ${s('(beast --help)', fg.muted)}`
  }

  // Default random tip
  return randomTip()
}

export function tipBanner(): string {
  return '\n' + s('─'.repeat(60), fg.muted) + '\n' + randomTip() + '\n'
}

// ── Feature Highlights ──────────────────────────────────────────────────────

export const FEATURE_HIGHLIGHTS = [
  { icon: '🎨', title: '10 Themes', desc: 'Use --theme dracula, catppuccin-mocha, claude...' },
  { icon: '🤖', title: '45+ Providers', desc: 'Claude, GPT, Gemini, Groq, Ollama, and more' },
  { icon: '🔧', title: '51+ Tools', desc: 'File ops, web search, GitHub, code execution' },
  { icon: '💾', title: 'Smart Context', desc: 'Auto-compact at 95%, never lose your place' },
  { icon: '💳', title: 'ChatGPT Plus', desc: 'Free with your $20/mo subscription via OAuth' },
]
