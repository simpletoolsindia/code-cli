// Beast CLI - Random Tips System
// Shows a random CLI tip after responses to educate users

import { s, fg, fg as color, icon } from './colors.ts'

const TIPS = [
  { cmd: '/model <name>', tip: 'Switch models mid-session without restarting' },
  { cmd: '/provider <name>', tip: 'Jump between Ollama, OpenRouter, Claude instantly' },
  { cmd: '/tools', tip: 'See all available MCP tools and their descriptions' },
  { cmd: '/clear', tip: 'Wipes conversation history to reset context window' },
  { cmd: '↑ / ↓', tip: 'Navigate through your command history' },
  { cmd: 'Tab', tip: 'Auto-complete tool names and common commands' },
  { cmd: 'file_read', tip: 'Use file_read tool to read any file in the current directory' },
  { cmd: 'file_list', tip: 'file_list shows directories, files with sizes and modification times' },
  { cmd: 'run_code', tip: 'run_code executes shell commands — git, npm, docker, anything' },
  { cmd: 'run_python', tip: 'run_python runs Python code with a sandboxed interpreter' },
  { cmd: 'github_search_repos', tip: 'Search GitHub repositories by keyword with stars and language info' },
  { cmd: 'searxng_search', tip: 'Search the web without leaving the CLI — great for current events' },
  { cmd: 'fetch_web', tip: 'Fetch full web page content from any URL for detailed research' },
  { cmd: 'real-time data', tip: 'Beast auto-detects queries needing live data (news, weather, prices) and fetches them' },
  { cmd: 'context', tip: 'Chat history counts toward your context window — /clear to free it up' },
  { cmd: 'MCP tools', tip: '39 native tools available: file ops, web, code, GitHub, YouTube, HN, and more' },
  { cmd: '45+ providers', tip: 'Use any LLM provider — cloud (OpenRouter, Claude, GPT) or local (Ollama, LM Studio)' },
  { cmd: 'CLI flags', tip: 'Skip setup: beast --provider openrouter --model qwen/qwen3-14b' },
]

export function randomTip(): string {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)]
  return `${s(icon.sparkles + ' Tip:', fg.warning)} ${s(tip.tip, fg.secondary)} ${s(`(${tip.cmd})`, fg.muted)}`
}

export function tipBanner(): string {
  return '\n' + s('─'.repeat(60), fg.muted) + '\n' + randomTip() + '\n'
}
