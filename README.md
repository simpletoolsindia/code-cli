# Beast CLI 🐉

**AI Coding Agent for Power Users**

```bash
npm install -g @simpletoolsindia/beast-cli
```

Or one-liner:

```bash
curl -Ls https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | sh
```

---

## Quick Start

```bash
# Start (auto-detects providers)
beast

# Use specific model
beast --provider ollama --model llama3.2
beast --provider anthropic --model claude-sonnet-4-20250514
```

---

## Features

- **45+ LLM Providers** - Claude, OpenAI, Ollama, LM Studio, Jan.ai, and more
- **Local AI Support** - Run on your own GPU with Ollama/LM Studio
- **39 Built-in Tools** - File ops, web search, code execution, GitHub
- **Memory System** - Remembers your project context
- **Real-time Data** - Web search, HackerNews, YouTube transcripts

---

## Requirements

- Node.js 18+ or Bun
- Optional: Ollama, LM Studio, or Jan.ai for local models

---

## Documentation

- [Installation](https://github.com/simpletoolsindia/code-cli#installation)
- [Configuration](docs/configuration.md)
- [Providers](docs/providers.md)
- [Commands](docs/commands.md)

---

## License

MIT
