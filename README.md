# 🐉 Beast CLI

**AI Coding Assistant in Your Terminal**

> Ask questions, write code, search the web, and more — all from the command line.

[![npm version](https://img.shields.io/npm/v/@simpletoolsindia/beast-cli)](https://www.npmjs.com/package/@simpletoolsindia/beast-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-simpletoolsindia.github.io-blue)](https://simpletoolsindia.github.io/code-cli/)

---

## 📚 Documentation

**Full documentation at:** [https://simpletoolsindia.github.io/code-cli/](https://simpletoolsindia.github.io/code-cli/)

Includes:
- Installation guide
- All REPL commands
- Provider configuration
- Theme customization
- Engineering tools

---

## ✨ What is Beast CLI?

Beast CLI is an **AI assistant in your terminal**. Instead of opening a website or app, you can chat with AI directly from your command line.

**Use it to:**
- 💬 Ask coding questions
- 🔍 Search the web for information
- 📝 Write and edit code
- 🛠️ Run terminal commands
- 📚 Explain how code works
- 🔊 **Speak summaries aloud** with text-to-speech (TTS)

**You can use:**
- 🤖 **Free AI models** (like Ollama) — runs on YOUR computer
- 💳 **ChatGPT Plus** — use your existing $20/month subscription (NEW!)
- 💰 **Paid AI APIs** — OpenAI, Claude, Gemini, and more

---

## 🚀 Getting Started (Zero-Config — One Command!)

```bash
# One-line install (auto-installs Node.js & ffmpeg if needed)
curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | bash
```

That's it! The installer handles everything automatically:
- ✅ Auto-installs Node.js if missing
- ✅ Auto-installs ffmpeg for audio playback
- ✅ Enables TTS (text-to-speech) by default
- ✅ Configures PATH automatically

### Start Using Beast

```bash
# Recommended for beginners — uses ChatGPT Plus automatically!
beast --defaults

# Or just run with prompts:
beast
```

Beast will guide you through choosing an AI model.

---

## ⚡ Quick Install

```bash
# Zero-config installer (auto Node.js + ffmpeg + TTS)
curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | bash

# If you already have Node.js
npm install -g @simpletoolsindia/beast-cli
bun add -g @simpletoolsindia/beast-cli
```

---

## 🚀 Quick Start

```bash
# Start the REPL (auto-detects API keys)
beast

# Use specific provider and model
beast --provider ollama --model llama3.2
beast --provider anthropic --model claude-sonnet-4-20250514
beast --provider openai --model gpt-5.4     # Latest GPT-5
beast --provider openai --model o3          # o-series reasoning
```

---

## 🔧 Configuration

### Environment Variables

```bash
export OPENAI_API_KEY=sk-...           # For GPT-5, o-series (get from platform.openai.com)
export ANTHROPIC_API_KEY=sk-ant-...    # For Claude
export GEMINI_API_KEY=...              # For Gemini
export GROQ_API_KEY=...                # For Groq
export DEEPSEEK_API_KEY=...            # For DeepSeek
export MISTRAL_API_KEY=...            # For Mistral
```

### Config File

Create `~/.beast-cli.yml`:

```yaml
provider: openai
model: gpt-5.4
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

## 🔊 Text-to-Speech (TTS)

Beast CLI can **speak summaries aloud** using Microsoft Edge TTS (free, high quality, 47 English voices).

### REPL TTS Commands

| Command | Description |
|---------|-------------|
| `/tts speak <text>` | Speak text aloud |
| `/tts list` | List available English voices |
| `/tts config` | Show current TTS configuration |
| `/tts set <voice>` | Change the default voice |
| `/tts on/off` | Enable/disable auto-play |

### Example

```bash
beast> /tts speak Hello! I'm Beast CLI, your AI coding assistant.
```

### Available Voices

```bash
beast> /tts list
en-US-AriaNeural      # Neural voice (default) — best quality
en-US-GuyNeural       # Male neural voice
en-US-JennyNeural     # Female neural voice
en-GB-SoniaNeural     # British female
en-AU-NatashaNeural   # Australian female
# ... 47 total English voices
```

### Install Audio Player

TTS requires **ffmpeg** for audio playback. The installer handles this automatically. To install manually:

```bash
# Linux
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows (with Chocolatey)
choco install ffmpeg -y
```

---

## 🎨 Themes

Available themes:

- `catppuccin-mocha` (default)
- `catppuccin-frappe`
- `catppuccin-latte`
- `claude` (warm editorial style)
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
| **ChatGPT Plus** (OAuth) | GPT-5.2-codex, o3, o4-mini, GPT-5.1 — **Free with Plus!** |
| **OpenAI API** | GPT-5.4, o3-pro, GPT-4.1, GPT-4o, Codex |
| **Anthropic** | Claude Opus 4, Sonnet 4, Haiku 4 |
| **Google** | Gemini 2.0, 2.5 |
| **Groq** | Llama 4, QWQ-32b |
| **DeepSeek** | DeepSeek Chat, Coder |
| **Mistral** | Mistral Large, Codestral |
| **Ollama** | Local models (llama3.2, mistral, etc.) |
| **LM Studio** | Local models |
| **Jan** | Local models |
| **OpenRouter** | 75+ models via single API |

---

## 🔑 Using ChatGPT Plus/Pro with Beast CLI

Beast CLI supports **two ways** to use GPT-5 models:

### Option A: ChatGPT Plus OAuth (Free with Plus subscription!) ✅

**No API billing needed** — use your existing ChatGPT Plus/Pro subscription:

```bash
beast
# Select provider: 3) ChatGPT Plus (CHT) — OAuth
beast --provider codex --model gpt-5.2-codex
```

**First-time OAuth login:**
```bash
beast
# When prompted, a browser window opens for ChatGPT login
# After login, tokens are saved automatically
```

**Commands:**
```bash
/login    # Re-authenticate ChatGPT Plus
/logout   # Clear ChatGPT authentication
```

> **Models available via ChatGPT Plus OAuth:** GPT-5.2, GPT-5.2-codex, GPT-5.1-codex, GPT-5.1, o3, o4-mini, and more. See full list with `/models` after selecting ChatGPT Plus.

### Option B: OpenAI API (Pay-as-you-go)

Use any OpenAI model with an API key from [platform.openai.com](https://platform.openai.com):

```bash
export OPENAI_API_KEY=sk-...
beast --provider openai --model gpt-5.4
```

| Model | Best For | Pricing |
|-------|----------|---------|
| `gpt-5.4` | General use, latest frontier | $1.25/M input |
| `gpt-5.4-pro` | Maximum intelligence | $15/M input |
| `o3` | Complex reasoning, coding | $15/M input |
| `o3-pro` | Advanced reasoning | $60/M input |
| `o4-mini` | Fast reasoning | $3/M input |
| `gpt-4.1` | Smart non-reasoning | $2/M input |
| `gpt-5-codex` | Code generation | $3/M input |

### Which should I use?

| | ChatGPT Plus OAuth | OpenAI API |
|---|---|---|
| **Cost** | Free (with $20/mo Plus) | $1-5/month |
| **Auth** | Browser OAuth login | API key |
| **Models** | GPT-5.2, o3, Codex | All OpenAI models |
| **Best for** | Daily CLI use | Full API access |

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
- [edge-tts-universal](https://github.com/jingfelix/edge-tts-universal) - Free Microsoft Edge TTS
