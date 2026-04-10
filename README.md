# 🐉 Beast CLI

**AI Coding Agent for Power Users**

> 51+ native tools, RAG-based code intelligence, multi-theme TUI, and support for 45+ AI providers.

[![npm version](https://img.shields.io/npm/v/@simpletoolsindia/beast-cli)](https://www.npmjs.com/package/@simpletoolsindia/beast-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Overview

Beast CLI is a terminal AI coding assistant built for developers who want powerful AI assistance without leaving the terminal.

- **🧠 RAG Code Intelligence** - TF-IDF + RAG-based retrieval understands your codebase
- **🔧 51+ Native Tools** - File ops, web search, GitHub, code execution
- **🧠 12 Engineering Tools** - Task classification, bug tracing, flow analysis
- **🌈 9 Themes** - Catppuccin, Dracula, Nord, Tokyo Night, and more
- **🤖 45+ Providers** - Claude, GPT, Gemini, Groq, Ollama, LM Studio
- **💾 Smart Context** - Auto-compact at 95%, session persistence, memory checkpoints
- **🔒 Permission System** - Auto-approve safe commands, banned list protection

---

## ⚡ Installation

### npm

```bash
npm install -g @simpletoolsindia/beast-cli
```

### Bun

```bash
bun add -g @simpletoolsindia/beast-cli
```

### One-Line Installer

```bash
curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | bash
```

### Requirements

- Node.js 18+ or Bun 1.0+
- macOS / Linux / Windows (WSL)

---

## 🚀 Quick Start

```bash
# Start the REPL (auto-detects API keys)
beast

# Use specific provider and model
beast --provider ollama --model llama3.2
beast --provider anthropic --model claude-sonnet-4-20250514
beast --provider openai --model gpt-4o
```

---

## 🔧 Configuration

### Environment Variables

```bash
export ANTHROPIC_API_KEY=sk-ant-...    # For Claude
export OPENAI_API_KEY=sk-...           # For GPT
export GEMINI_API_KEY=...               # For Gemini
export GROQ_API_KEY=...                # For Groq
```

### Config File

Create `~/.beast-cli.yml`:

```yaml
provider: anthropic
model: claude-sonnet-4-20250514
theme: catppuccin-mocha
temperature: 0.7
maxTokens: 16384
autoCompact: true
```

---

## 📟 Commands

| Command | Description |
|---------|-------------|
| `beast` | Start the REPL |
| `beast --help` | Show help |
| `beast --version` | Show version |
| `beast --compact` | Force context compaction |
| `beast --theme <name>` | Change theme |

### REPL Commands

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/tools` | List available tools |
| `/clear` | Clear conversation |
| `/compact` | Compact context |
| `/theme` | Change theme |
| `/exit` | Exit CLI |

---

## 🧠 Engineering Intelligence Tools

12 specialized tools for code analysis:

| Tool | Description |
|------|-------------|
| `engi_task_classify` | Classify task type (bug, feature, etc.) |
| `engi_repo_scope_find` | Find minimum relevant files |
| `engi_flow_summarize` | Explain code implementation flow |
| `engi_bug_trace_compact` | Trace likely bug causes |
| `engi_implementation_plan` | Build implementation plan |
| `engi_poc_plan` | Define minimum viable POC |
| `engi_impact_analyze` | Estimate blast radius |
| `engi_test_select` | Choose minimum test set |
| `engi_doc_context_build` | Build docs context |
| `engi_doc_update_plan` | Plan docs updates |
| `engi_memory_checkpoint` | Save task state |
| `engi_memory_restore` | Restore saved task |

---

## 🎨 Themes

Available themes:

- `catppuccin-mocha` (default)
- `catppuccin-frappe`
- `catppuccin-latte`
- `dracula`
- `nord`
- `tokyonight`
- `gruvbox`
- `monokai`
- `one-dark`

```bash
beast --theme dracula
```

---

## 🌐 Supported Providers

| Provider | Models |
|----------|--------|
| **Anthropic** | Claude 3.5, 3.7, Opus, Sonnet, Haiku |
| **OpenAI** | GPT-4o, GPT-4.1, O1, O3 |
| **Google** | Gemini 2.0, 2.5 |
| **Groq** | Llama 4, QWQ-32b |
| **Ollama** | Local models (llama3.2, mistral, etc.) |
| **LM Studio** | Local models |
| **Azure** | OpenAI on Azure |
| **AWS Bedrock** | Claude on AWS |

---

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/simpletoolsindia/code-cli.git
cd code-cli

# Install dependencies
bun install

# Build
bun run build:bin

# Run
bun run src/index.ts
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- [Catppuccin](https://github.com/catppuccin/catppuccin) - Beautiful pastel theme
- [Anthropic](https://anthropic.com) - Claude API
- [OpenAI](https://openai.com) - GPT API
- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - TUI inspiration
