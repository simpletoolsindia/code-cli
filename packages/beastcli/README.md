<div align="center">

![BeastCLI](https://img.shields.io/badge/beastcli-v4.0.0-7B61FF?style=for-the-badge&labelColor=1a1a2e)
[![License](https://img.shields.io/badge/license-MIT-00E5FF?style=for-the-badge&labelColor=1a1a2e)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@simpletoolsindia/beast-cli?style=for-the-badge&labelColor=1a1a2e&color=7B61FF)](https://www.npmjs.com/package/@simpletoolsindia/beast-cli)

# @simpletoolsindia/beast-cli

### The Open-Source AI Coding Agent for Your Terminal

**Provider-agnostic. Terminal-native. Zero lock-in.**

<br>

```bash
npm install -g @simpletoolsindia/beast-cli
```

<p align="center">
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-commands">Commands</a> ·
  <a href="#-ai-providers">Providers</a> ·
  <a href="#-tools">Tools</a> ·
  <a href="#-agents">Agents</a> ·
  <a href="#-configuration">Config</a> ·
  <a href="#-plugins">Plugins</a> ·
  <a href="#-skills">Skills</a> ·
  <a href="#-mcp-servers">MCP</a> ·
  <a href="#-notifications">Notifications</a> ·
  <a href="#-development">Development</a>
</p>

</div>

---

## Overview

**BeastCLI** is a provider-agnostic AI coding agent that runs natively in your terminal. It is not a wrapper, not a SaaS product — it is open-source, built with Bun and the Effect framework, and compiled to a native binary.

| | |
|---|---|
| **Runtime** | Bun 1.3+ |
| **Language** | TypeScript |
| **Framework** | Effect v4 (functional effect system) |
| **UI** | OpenTUI (terminal UI framework) |
| **AI SDK** | Vercel AI SDK (multi-provider) |
| **Database** | SQLite + Drizzle ORM |
| **License** | MIT |

### Why BeastCLI?

- **No vendor lock-in** — switch between Claude, OpenAI, Gemini, OpenRouter, or local models with a single flag
- **Runs anywhere** — your laptop, a server, CI/CD pipelines, or Docker containers
- **Rich TUI** — real-time sidebar with context tracking, session management, and model switching
- **Extensible** — plugin SDK for custom tools, agents, and providers
- **Local-first** — auto-detects Ollama, LM Studio, Jan, MLX, and vLLM with zero configuration
- **Session-aware** — fork sessions, continue conversations, export/import history
- **Permission system** — granular control over what the AI can read, write, and execute

---

## Quick Start

### Install

```bash
# npm (recommended)
npm install -g @simpletoolsindia/beast-cli

# Bun
bun install -g @simpletoolsindia/beast-cli

# Homebrew (macOS/Linux)
brew install simpletoolsindia/tap/beastcli

# Scoop (Windows)
scoop install beastcli
```

### Verify

```bash
beast --version
# beast-cli v4.0.0
```

### Start a Session

```bash
# Interactive TUI
cd my-project && beast

# One-shot task
beast run "add unit tests for auth module"

# Use a specific provider
beast --model ollama/llama3.3

# Plan before building
beast --agent plan "refactor the database layer"
```

### Connect a Provider

```bash
# Interactive wizard
beast /connect

# Or check status
beast providers list
```

---

## Features

| Feature | Description |
|---|---|
| **Rich TUI** | Mission Control sidebar with real-time context progress, session list, model picker, and keyboard shortcuts |
| **Multi-Provider** | Claude 4, GPT-4o, Gemini 2.5, OpenRouter (200+ models), GitHub Copilot, GitLab, Azure, and more |
| **Local Auto-Detection** | Ollama, LM Studio, Jan, MLX, vLLM discovered automatically — no API keys needed |
| **Agent Modes** | `build` (default), `plan` (read-only), `general` (research), `explore` (codebase exploration) |
| **Tool Preselection** | Keyword-based tool filtering reduces context window usage for smaller models |
| **Context Compaction** | Automatic summarization when context fills, with configurable tail preservation |
| **MCP Integration** | Full Model Context Protocol support with OAuth, auto-discovery from Claude Desktop/Cursor |
| **Plugin System** | Custom tools, agents, providers, hooks via `@simpletoolsindia/plugin` SDK |
| **Skills** | Load specialized skill packs from `.claude/skills/`, `.agents/skills/`, or remote repos |
| **Session Management** | Fork, continue, export, import, share sessions |
| **Permissions** | Granular allow/deny/ask rules for read, write, bash, task, and external directories |
| **Notifications** | macOS native + Telegram for session events |
| **Headless Server** | `beast serve` for API access, `beast web` for web interface |
| **ACP** | Agent Client Protocol for agent-to-agent communication |

---

## Commands

### Core Commands

| Command | Description |
|---|---|
| `beast` | Start interactive TUI in current directory |
| `beast run <message>` | Execute a task without TUI |
| `beast serve` | Start headless HTTP server |
| `beast web` | Start server + open web interface |
| `beast acp` | Start Agent Client Protocol server |

### `beast run` Options

| Flag | Description |
|---|---|
| `-m, --model <provider/model>` | Model to use (e.g., `anthropic/claude-sonnet-4`) |
| `--agent <name>` | Agent mode: `build`, `plan`, `general`, `explore` |
| `-c, --continue` | Continue the last session |
| `-s, --session <id>` | Continue a specific session |
| `--fork` | Fork session before continuing |
| `--share` | Share the session |
| `-f, --file <path>` | Attach file(s) to the prompt |
| `--title <text>` | Set session title |
| `--variant <name>` | Model variant (reasoning effort) |
| `--thinking` | Show thinking blocks |
| `--format <json\|text>` | Output format |
| `--dangerously-skip-permissions` | Auto-approve all permissions |
| `--attach <url>` | Attach to a running `beast serve` |
| `--port <number>` | Local server port |

### Management Commands

| Command | Description |
|---|---|
| `beast providers list` | List configured providers |
| `beast providers login` | Connect a new provider |
| `beast providers logout` | Disconnect a provider |
| `beast models [provider]` | List available models, `--verbose`, `--refresh` |
| `beast agent create` | Create a custom agent with AI |
| `beast agent list` | List all available agents |
| `beast session list` | List sessions, `--max-count`, `--format json` |
| `beast session delete <id>` | Delete a session (and children) |
| `beast mcp list` | List MCP servers and status |
| `beast mcp add` | Add MCP server (local/remote, OAuth) |
| `beast mcp auth <name>` | Authenticate OAuth MCP server |
| `beast mcp logout <name>` | Remove MCP OAuth credentials |
| `beast mcp debug <name>` | Debug MCP connection |
| `beast mcp discover` | Auto-discover MCP servers from system |
| `beast stats` | Token usage and costs, `--days`, `--tools`, `--models`, `--project` |
| `beast upgrade [target]` | Upgrade to latest version |
| `beast plugins` | Manage installed plugins |

---

## AI Providers

### Cloud Providers

Configure via `beast /connect` or CLI:

| Provider | Auth | Models |
|---|---|---|
| **Anthropic** | API key | Claude 4, 3.5 Sonnet, Opus |
| **OpenAI** | API key / OAuth | GPT-4o, o3, o1 |
| **Google** | API key / OAuth | Gemini 2.5 Pro, Flash |
| **OpenRouter** | API key | 200+ models |
| **GitHub Copilot** | OAuth device flow | GPT-4o, Claude Sonnet |
| **GitLab** | OAuth | Various |
| **Azure** | OAuth | Azure OpenAI models |
| **Cloudflare AI Gateway** | API token | Routed models |
| **Venice** | API key | Various |
| **Together AI** | API key | Various open models |
| **Groq** | API key | Fast inference |
| **Cohere** | API key | Command models |
| **Mistral** | API key | Mistral models |
| **Perplexity** | API key | Search-optimized models |
| **X.ai (Grok)** | API key | Grok models |
| **Alibaba** | API key | Qwen models |
| **Cerebras** | API key | Fast inference |
| **DeepInfra** | API key | Various |
| **Vercel** | API key | Vercel AI Gateway |
| **AI Gateway** | API key | Multi-provider routing |

### Local Providers (Auto-Detected)

Zero configuration — start the server and BeastCLI finds it:

| Provider | Default Port | Models |
|---|---|---|
| **Ollama** | `11434` | llama3.3, mistral, phi, etc. |
| **LM Studio** | `1234` | Any GGUF model |
| **Jan** | `1337` | Mistral, Neural Chat, etc. |
| **MLX** | `8080` | Apple Silicon optimized |
| **vLLM** | `8001` | High-performance serving |

---

## Tools

BeastCLI provides tools that the AI agent uses to interact with your system.

### Core Tools

| Tool | Description | Parameters |
|---|---|---|
| `bash` | Execute shell commands with timeout, tree-sitter parsing | `command`, `timeout`, `workdir`, `description` |
| `read` | Read files or directories with offset/limit, supports images/PDFs | `filePath`, `offset`, `limit` |
| `write` | Create or overwrite files with diff generation | `filePath`, `content` |
| `edit` | Replace text in files with multiple matching algorithms | `filePath`, `oldString`, `newString`, `replaceAll` |
| `glob` | Pattern-based file matching with ripgrep | `pattern`, `path` |
| `grep` | Regex content search across files | `pattern`, `path`, `include`, `exclude` |
| `webfetch` | Fetch and parse web content (markdown/text/html) | `url`, `format` |
| `websearch` | Web search via Exa AI, DuckDuckGo fallback, SearXNG | `query`, `numResults`, `livecrawl` |
| `task` | Delegate to subagents (research, explore, etc.) | `prompt`, `description`, `subagent_type`, `command` |
| `todowrite` | Manage todo lists with priority tracking | `todos[]` with `content`, `status`, `priority` |
| `skill` | Load specialized skill packs | `name` |
| `apply_patch` | Apply unified diff patches (add/update/delete/move) | `code`, `dryRun` |
| `lsp` | Language server operations | `action` (goToDefinition, findReferences, hover, etc.) |
| `question` | Ask user questions in interactive mode | `question`, `options`, `header` |
| `plan` | Enter/exit plan mode for read-only analysis | `action` |

### Specialized Tools

| Tool | Description |
|---|---|
| `searxng_search` | Search via self-hosted SearXNG instance |
| `hackernews_top` | Top Hacker News stories |
| `hackernews_new` | New Hacker News stories |
| `hackernews_best` | Best Hacker News stories |
| `hackernews_comments` | Hacker News comments |
| `youtube_transcript` | Get YouTube video transcript |
| `youtube_video_info` | Get YouTube video metadata |
| `youtube_search` | Search YouTube videos |
| `youtube_summarize` | Summarize YouTube video content |
| `pandas_create` | Create pandas DataFrame |
| `pandas_filter` | Filter pandas DataFrame |
| `pandas_aggregate` | Aggregate pandas DataFrame |
| `plot_line` | Create line chart |
| `plot_bar` | Create bar chart |
| `codecli` | Code CLI integration |

---

## Agents

Agents define how the AI behaves — what tools it has access to and what permissions it operates under.

### Built-in Agents

| Agent | Mode | Description |
|---|---|---|
| `build` | Primary | Default agent — reads, writes, executes based on permissions |
| `plan` | Primary | Read-only analysis — disallows edits, suggests changes |
| `general` | Subagent | Research and multi-step tasks |
| `explore` | Subagent | Fast codebase exploration (grep, glob, read, bash, webfetch) |
| `compaction` | Primary | Hidden — handles context compaction |
| `title` | Primary | Hidden — generates session titles |
| `summary` | Primary | Hidden — generates session summaries |

### Agent Modes

| Mode | Behavior |
|---|---|
| `primary` | Top-level agent that receives user prompts |
| `subagent` | Delegated agent invoked via the `task` tool |

### Create Custom Agents

```bash
# Interactive agent creation with AI
beast agent create

# Options
--path <file>        # Custom config file
--description <text> # Agent description
--mode <all|primary|subagent>
--permissions <rules> # Permission rules
--model <provider/model>
```

### Agent Configuration

```jsonc
// .beastcli/beastcli.jsonc
{
  "agent": {
    "reviewer": {
      "name": "Reviewer",
      "description": "Code review specialist",
      "mode": "subagent",
      "model": { "providerID": "anthropic", "modelID": "claude-sonnet-4" },
      "permission": [
        { "permission": "read", "action": "allow" },
        { "permission": "edit", "action": "ask" },
        { "permission": "bash", "action": "allow" }
      ],
      "temperature": 0.3,
      "prompt": "You are a senior code reviewer..."
    }
  }
}
```

---

## Configuration

### Project Config

Create `.beastcli/beastcli.jsonc` in your project root:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/packages/beastcli/schema.json",
  "model": "anthropic/claude-sonnet-4",
  "small_model": "ollama/llama3.2",
  "default_agent": "build",
  "shell": "bash",
  "share": "manual",
  "autoupdate": true,
  "search_engine": "exa",
  "search_config": {
    "searxng_url": "http://localhost:8080"
  },
  "permission": {
    "read": "allow",
    "edit": { "*.env": "ask", "*": "allow" },
    "bash": "ask"
  },
  "tools": {
    "github-triage": false
  },
  "mcp": {
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp"],
      "enabled": false
    }
  },
  "agent": {},
  "provider": {},
  "skills": {
    "paths": ["./skills"],
    "urls": ["https://github.com/example/skill-repo"]
  },
  "instructions": ["https://example.com/instructions.md"],
  "plugin": [
    { "path": "./plugin.ts" },
    { "npm": "@my-org/my-plugin@1.0.0" }
  ],
  "compaction": {
    "auto": true,
    "prune": true,
    "tail_turns": 5,
    "preserve_recent_tokens": 10000,
    "reserved": 5000
  },
  "tool_output": {
    "max_lines": 2000,
    "max_bytes": 100000
  },
  "experimental": {
    "opentelemetry": false,
    "mcp_timeout": 30000,
    "search_timeout": 15000
  }
}
```

### Global Config

Location: `~/.config/beastcli/`

| File | Purpose |
|---|---|
| `config.json` | Global settings, providers, MCP servers |
| `notifier.json` | Notification configuration |
| `tui.json` | TUI theme and keybinds |
| `auth.json` | Provider credentials |
| `mcp-auth.json` | MCP OAuth tokens |
| `plugins/` | Installed plugin files |

### Environment Variables

| Variable | Description |
|---|---|
| `BEAST_CONFIG` | Override config file path |
| `BEAST_CONFIG_DIR` | Override config directory |
| `BEAST_CONFIG_CONTENT` | Inline JSON config |
| `BEAST_AUTH_CONTENT` | Inline auth config |
| `BEAST_DISABLE_PROJECT_CONFIG` | Disable project-level config |
| `BEAST_DISABLE_EXTERNAL_SKILLS` | Disable external skill discovery |
| `BEAST_DISABLE_CLAUDE_CODE_SKILLS` | Disable Claude Code skills |
| `BEAST_DISABLE_CLAUDE_CODE_PROMPT` | Disable CLAUDE.md loading |
| `BEAST_EXPERIMENTAL_LSP_TOOL` | Enable LSP tool |
| `BEAST_EXPERIMENTAL_PLAN_MODE` | Enable plan mode |
| `BEAST_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS` | Override bash timeout |
| `BEAST_CLIENT` | Client identifier (`app`, `cli`, `desktop`) |
| `BEAST_ENABLE_QUESTION_TOOL` | Enable question tool in CLI |

---

## Plugins

Extend BeastCLI with custom tools, agents, providers, and hooks.

### Install SDK

```bash
npm install -D @simpletoolsindia/plugin
```

### Plugin Hooks

| Hook | Description |
|---|---|
| `provider` | Add custom AI provider with models and auth |
| `auth` | Custom authentication methods |
| `chat.params` | Modify LLM request parameters |
| `chat.headers` | Modify LLM request headers |
| `chat.system.transform` | Transform system prompt |
| `shell.env` | Add environment variables for bash |
| `tool.execute.before` | Pre-tool execution hook |
| `tool.execute.after` | Post-tool execution hook |
| `event` | Handle bus events |
| `config` | Receive config updates |

### Example Plugin

```ts
// .beastcli/plugin.ts
import { Plugin, Tool } from "@simpletoolsindia/plugin"
import { z } from "zod"

export const plugin = Plugin.create({
  tools: {
    greet: {
      description: "Greet someone by name",
      args: { name: z.string() },
      execute: async ({ name }) => ({
        output: `Hello, ${name}!`,
        title: `Greeted ${name}`,
      }),
    },
  },
})
```

### Plugin Configuration

```jsonc
{
  "plugin": [
    { "path": "./plugin.ts" },
    { "npm": "@my-org/my-plugin@1.0.0" }
  ]
}
```

---

## Skills

Skills are markdown files that inject specialized instructions into the conversation context.

### Structure

```markdown
---
name: react-best-practices
description: React 19 best practices and patterns
---

# React Best Practices

## Component Design
...
```

### Discovery Locations

| Location | Pattern |
|---|---|
| Global Claude | `~/.claude/skills/**/SKILL.md` |
| Global Agents | `~/.agents/skills/**/SKILL.md` |
| Project config | `.beastcli/skills/**/SKILL.md` |
| Config paths | Custom paths in `config.skills.paths` |
| Remote repos | URLs in `config.skills.urls` (auto-pulled) |

### Usage

The AI sees available skills and uses the `skill` tool to load them:

```
Use the skill tool to load specialized instructions.

## Available Skills
- **react-best-practices**: React 19 patterns
- **rust-ownership**: Rust ownership patterns
- **python-data-science**: Pandas, NumPy workflows
```

---

## MCP Servers

Model Context Protocol (MCP) enables external tool servers that BeastCLI can connect to.

### Configuration

```jsonc
{
  "mcp": {
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp"],
      "enabled": true,
      "timeout": 30000
    },
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

### MCP Commands

| Command | Description |
|---|---|
| `beast mcp list` | List MCP servers and status |
| `beast mcp add` | Interactive add (local/remote) |
| `beast mcp auth <name>` | OAuth authentication |
| `beast mcp logout <name>` | Remove OAuth credentials |
| `beast mcp debug <name>` | Debug connection |
| `beast mcp discover` | Auto-discover from system |

### Auto-Discovery

BeastCLI scans for MCP servers in:
- Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`)
- Cursor config
- npm global packages

Discovered servers default to `enabled: false` to prevent auth prompt blocking.

### OAuth Flow

1. Server indicates auth required (401 or OAuth metadata)
2. BeastCLI opens browser for authorization
3. User authorizes on provider's site
4. Callback received at `http://127.0.0.1:19876/mcp/callback`
5. Tokens stored in `~/.config/beastcli/mcp-auth.json`

---

## Notifications

Get notified about session events.

### macOS (Default)

Native notifications — enabled out of the box.

### Telegram

```bash
beast /telegram
```

Interactive setup saves to `~/.config/beastcli/notifier.json`:

```json
{
  "enabled": true,
  "channels": {
    "macos": { "enabled": true },
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_TOKEN",
      "chatId": "YOUR_CHAT_ID"
    }
  }
}
```

### Events

| Event | Description |
|---|---|
| `sessionStarted` | Session begins processing |
| `sessionCompleted` | Session finishes |
| `sessionError` | An error occurred |
| `sessionCompacted` | Context was compacted |
| `toolExecuting` | Tool execution started |
| `toolCompleted` | Tool execution finished |
| `permissionRequested` | User input needed |

---

## Session Management

### Commands

| Command | Description |
|---|---|
| `beast session list` | List all sessions |
| `beast session delete <id>` | Delete a session |
| `beast session list --max-count 10` | Limit results |
| `beast session list --format json` | JSON output |

### Features

- **Fork** — branch from any point in a conversation
- **Continue** — resume a previous session
- **Share** — generate a shareable URL
- **Export/Import** — JSON session backup
- **Parent/Child** — subagent sessions link to parent
- **Diff tracking** — records file additions/deletions

### Context Compaction

When the context window fills:
1. Recent turns are preserved (configurable `tail_turns`)
2. Earlier conversation is summarized
3. Summary includes: Goal, Constraints, Progress, Key Decisions, Next Steps, Critical Context
4. Old tool outputs are pruned to free space

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + K` | Commands palette |
| `Cmd/Ctrl + O` | Switch model |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + S` | Switch session |
| `Cmd/Ctrl + T` | Theme switcher |
| `Cmd/Ctrl + H` | Help dialog |
| `Esc` | Stop generation / Close dialog |
| `Q` | Close dialog |

---

## Architecture

### Package Structure

```
beastcli/
├── packages/
│   ├── beastcli/          # Main CLI
│   │   ├── src/
│   │   │   ├── agent/     # Agent definitions and management
│   │   │   ├── auth/      # Authentication providers
│   │   │   ├── bus/       # Event bus system
│   │   │   ├── cli/cmd/   # CLI commands
│   │   │   ├── config/    # Configuration loading
│   │   │   ├── effect/    # Effect utilities
│   │   │   ├── file/      # File operations
│   │   │   ├── lsp/       # Language server protocol
│   │   │   ├── mcp/       # MCP integration
│   │   │   ├── permission/ # Permission system
│   │   │   ├── plugin/    # Plugin loader
│   │   │   ├── provider/  # AI provider adapters
│   │   │   ├── session/   # Session management
│   │   │   ├── shell/     # Shell detection
│   │   │   ├── skill/     # Skills system
│   │   │   ├── tool/      # Built-in tools
│   │   │   └── util/      # Utilities
│   ├── plugin/            # Plugin SDK
│   ├── sdk/               # JavaScript SDK
│   ├── core/              # Core utilities
│   ├── app/               # Web app
│   └── desktop-electron/  # Desktop app
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Bun (native binary compilation) |
| **Effect System** | Effect v4 (functional, typed effects) |
| **Language** | TypeScript |
| **Terminal UI** | OpenTUI + Solid.js |
| **AI Integration** | Vercel AI SDK (provider adapters) |
| **Database** | SQLite + Drizzle ORM |
| **Package Manager** | pnpm 10+ (workspace monorepo) |
| **Build** | Bun build (native binary) |
| **Testing** | Bun test |
| **Type Checking** | TypeScript (tsgo) |
| **Linting** | oxlint |

### Request Flow

```
User Input
    │
    ▼
┌─────────────┐
│  Session    │ ←─ Messages stored in SQLite
│  Manager    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Prompt     │ ←─ Build model messages, resolve tools
│  Builder    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  LLM        │ ←─ Stream to provider via AI SDK
│  Stream     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Processor  │ ←─ Handle tool calls, text, errors
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────┐
│  Tool       │────▶│ Execute  │
│  Registry   │     │          │
└─────────────┘     └──────────┘
```

---

## Development

### Prerequisites

- [Bun](https://bun.sh) 1.3+
- [pnpm](https://pnpm.io) 10+

### Setup

```bash
git clone https://github.com/simpletoolsindia/code-cli.git
cd code-cli
pnpm install

cd packages/beastcli
bun run dev              # Development mode
bun run typecheck        # TypeScript check
bun test                 # Run tests
bun run build            # Build binary
```

### Build Native Binary

```bash
cd packages/beastcli
bun run build --single --baseline
```

### Environment Variables for Development

```bash
BEAST_CONFIG=/path/to/config.json beast
BEAST_CONFIG_DIR=/path/to/dir beast
BEAST_CONFIG_CONTENT='{"model":"ollama/llama3"}' beast
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Model not found | Run `beast providers` to connect a provider |
| Local provider not detected | Verify the server is running on the expected port |
| Permission denied | Check `permission` config in `beastcli.jsonc` |
| TUI rendering issues | Ensure terminal supports UTF-8 and 256 colors |
| MCP server failing | Run `beast mcp debug <name>` for diagnostics |
| Context full too quickly | Adjust `compaction.reserved` or use `small_model` |
| Plugin not loading | Check `.beastcli/plugin.ts` syntax, restart |

---

## Package Ecosystem

| Package | Description |
|---|---|
| [`@simpletoolsindia/beast-cli`](https://www.npmjs.com/package/@simpletoolsindia/beast-cli) | Main CLI binary + npm wrapper |
| [`@simpletoolsindia/plugin`](https://www.npmjs.com/package/@simpletoolsindia/plugin) | Plugin SDK for custom agents/tools |
| [`@simpletoolsindia/sdk`](https://www.npmjs.com/package/@simpletoolsindia/sdk) | JavaScript/TypeScript client SDK |
| [`@simpletoolsindia/core`](https://www.npmjs.com/package/@simpletoolsindia/core) | Core utilities and filesystem |

---

## License

[MIT](./LICENSE) — Built by [@simpletoolsindia](https://github.com/simpletoolsindia)
