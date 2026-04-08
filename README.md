# Beast CLI 🐉

<p align="center">
  <img src="https://raw.githubusercontent.com/simpletoolsindia/beast-cli/refs/heads/main/assets/beast-logo.png" alt="Beast CLI Logo" width="200">
</p>

<h1 align="center">
  AI Coding Agent for Power Users
</h1>

<p align="center">
  Beast CLI is an open-source AI coding agent that combines the best features from Claude Code, Codex, Aider, and Cline — with unique support for local AI models like LM Studio and Jan.ai.
</p>

<p align="center">
  <a href="https://github.com/simpletoolsindia/beast-cli/stargazers">
    <img src="https://img.shields.io/github/stars/simpletoolsindia/beast-cli?style=flat-square&logo=github&color=f1c40f&labelColor=555555" alt="GitHub Stars">
  </a>
  <a href="https://github.com/simpletoolsindia/beast-cli/releases">
    <img src="https://img.shields.io/github/v/release/simpletoolsindia/beast-cli?style=flat-square&labelColor=555555" alt="Latest Release">
  </a>
  <a href="https://github.com/simpletoolsindia/beast-cli/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/simpletoolsindia/beast-cli?style=flat-square&labelColor=555555" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/beast-cli">
    <img src="https://img.shields.io/npm/v/beast-cli?style=flat-square&labelColor=555555" alt="npm">
  </a>
</p>

---

## Why Beast CLI?

| Feature | Beast | Claude | Codex | Aider | Cline |
|---------|-------|--------|-------|-------|-------|
| **45+ Providers** | ✅ | 40+ | 30+ | 15+ | 40+ |
| **LM Studio Support** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Jan.ai Support** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Landlock Sandbox** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Memory System** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Multi-Agent** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Batch Execution** | ✅ | ❌ | ✅ | ❌ | ❌ |

**Beast CLI is the only AI coding agent with Landlock sandbox security AND full memory system AND multi-agent coordination — all in one.**

---

## Features

### Cloud & Local LLMs

Works with 45+ providers including Claude, GPT, DeepSeek, and local models via **Ollama, LM Studio, and Jan.ai**.

### Security First

- **Landlock sandbox** (Linux) — Restricts file access at kernel level
- **Seatbelt** (macOS) — Native sandbox enforcement
- **Dangerous pattern detection** — Blocks `rm -rf`, fork bombs, etc.
- **Network rules** — Per-host/protocol firewall

### Memory System

Like Claude Code, Beast CLI remembers your preferences:
- Typed taxonomy: user, feedback, project, reference
- Staleness warnings
- Team sync for multi-agent
- Auto-extraction from conversations

### Multi-Agent

Spawn coordinated agents for parallel work:
```bash
beast --multi-agent --workers 3
```

### Built-in Tools

| Tool | Description |
|------|-------------|
| Read/Write/Edit | File operations |
| Grep/Glob | Search and find |
| Bash | Shell commands |
| TaskCreate/TaskUpdate | Task management |
| Batch | Parallel execution |
| MCP Tools | Extend with MCP servers |
| Lint Runner | Auto-fix code issues |
| Voice Input | Speak your commands |
| Web Fetch | Scrape URLs to markdown |

### MCP Support

Connect to Model Context Protocol servers for extended capabilities.

### Git Intelligence

- Ghost commits — Snapshots without polluting history
- 6-flag attribution — Full audit trail
- Pre-commit hooks — Enforce checks before AI changes

---

## Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/beast-cli/main/install.sh | bash
```

### Or via npm

```bash
npm install -g beast-cli
```

### Or via Bun

```bash
bun install -g beast-cli
```

### From Source

```bash
git clone https://github.com/simpletoolsindia/beast-cli.git
cd beast-cli
bun install
bun run build
ln -s $(pwd)/dist/beast /usr/local/bin/beast
```

---

## Quick Start

### 1. Configure API Keys

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY=your_key_here
export OPENAI_API_KEY=your_key_here

# For local models
export OLLAMA_HOST=http://localhost:11434
```

### 2. Start Beast CLI

```bash
# Interactive mode
beast

# With specific provider
beast --provider openai --model gpt-4o

# With local model
beast --provider ollama --model llama3.2

# With LM Studio
beast --provider lmstudio --base-url http://localhost:1234/v1
```

### 3. Basic Commands

```
beast > help                    # Show all commands
beast > read src/index.ts       # Read a file
beast > edit src/index.ts       # Edit a file
beast > bash npm test           # Run shell command
beast > search "login"          # Search code
beast > task "Fix bug"          # Create task
beast > mode architect          # Switch to architect mode
beast > exit                    # Quit
```

---

## Configuration

### Config File

Create `~/.beast/config.yaml`:

```yaml
# Provider settings
provider:
  default: anthropic
  model: claude-sonnet-4-20250514

# Sandbox mode
sandbox:
  mode: workspace-write  # read-only | workspace-write | danger-full-access
  allowedCommands:
    - git
    - npm
    - node
    - bun
    - python

# Memory settings
memory:
  enabled: true
  autoSync: true

# Collaboration mode
collab:
  mode: solo  # solo | pair | review | teach
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENROUTER_API_KEY` | OpenRouter API key | - |
| `DEEPSEEK_API_KEY` | DeepSeek API key | - |
| `GROQ_API_KEY` | Groq API key | - |
| `OLLAMA_HOST` | Ollama host | localhost:11434 |
| `LMSTUDIO_HOST` | LM Studio host | localhost:1234 |
| `JAN_HOST` | Jan.ai host | localhost:1337 |
| `BEAST_SANDBOX_MODE` | Sandbox level | workspace-write |
| `BEAST_MAX_TOKENS` | Token budget | 100000 |

---

## Modes

| Mode | Description |
|------|-------------|
| **solo** | Default mode, full access |
| **pair** | Two agents working together |
| **review** | Code review without editing |
| **teach** | Teaching mode, explain concepts |
| **architect** | Planning and design mode |

Switch modes with `/mode <name>` or `mode architect`.

---

## Troubleshooting

### "Provider not found"

```bash
# Check your API key is set
echo $ANTHROPIC_API_KEY

# Verify provider is installed
beast doctor
```

### "Local model not connecting"

```bash
# Start Ollama
ollama serve

# Or start LM Studio and enable "API" in settings

# Then test connection
beast --provider ollama --model llama3.2 "Hello"
```

### "Sandbox blocked command"

```bash
# View current sandbox mode
beast config sandbox

# Switch to full access (not recommended)
beast config sandbox.mode=danger-full-access
```

### Run diagnostics

```bash
beast doctor  # Check all configurations
beast info    # Show version and environment
```

---

## Comparison with Other Tools

| Feature | Beast | Claude Code | Codex | Aider | Cline |
|---------|-------|-------------|-------|-------|-------|
| License | MIT | Proprietary | Apache 2.0 | Apache 2.0 | MIT |
| Local Models | ✅ LM Studio, Jan | Limited | Limited | Limited | Limited |
| Sandbox | ✅ Landlock | ❌ | ✅ | ❌ | ❌ |
| Memory | ✅ Full | ✅ | ❌ | ❌ | ❌ |
| Multi-Agent | ✅ | ✅ | ❌ | ❌ | ❌ |
| Batch | ✅ | ❌ | ✅ | ❌ | ❌ |
| Auto-Lint | ✅ | ❌ | ❌ | ✅ | ❌ |
| Voice | ✅ | ✅ | ❌ | ✅ | ❌ |
| MCP | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Lines of Code** | **28K** | 380K | 150K | 15K | 160K |

---

## Roadmap

- [ ] Publish to npm registry
- [ ] VS Code extension
- [ ] JetBrains plugin
- [ ] Web UI dashboard
- [ ] Team collaboration server
- [ ] GitHub Actions integration

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork and clone
git clone https://github.com/simpletoolsindia/beast-cli.git
cd beast-cli

# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Beast CLI is built on the shoulders of giants:

- **Claude Code** — Memory system, multi-agent patterns
- **Codex (openai/codex)** — Landlock sandbox, ghost commits, repo map
- **Aider** — Auto-lint, lazy loading, voice input
- **Cline** — MCP integration, prompt variants

---

<p align="center">
  Made with ❤️ by <a href="https://simpletools.in">SimpleTools</a>
</p>