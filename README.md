<div align="center">

<a href="https://github.com/simpletoolsindia/code-cli">
  
</a>

# BeastCLI

### The open-source AI coding agent that runs in your terminal

[![npm](https://img.shields.io/npm/v/@simpletoolsindia/beast-cli?style=for-the-badge&color=7B61FF)](https://www.npmjs.com/package/@simpletoolsindia/beast-cli)
[![downloads](https://img.shields.io/npm/dm/@simpletoolsindia/beast-cli?style=for-the-badge&color=00E676)](https://www.npmjs.com/package/@simpletoolsindia/beast-cli)
[![license](https://img.shields.io/github/license/simpletoolsindia/code-cli?style=for-the-badge&color=FF3366)](https://github.com/simpletoolsindia/code-cli/blob/dev/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/simpletoolsindia/code-cli/publish.yml?style=for-the-badge&color=00E5FF&label=build)](https://github.com/simpletoolsindia/code-cli/actions/workflows/publish.yml)

<br>

```bash
npm install -g @simpletoolsindia/beast-cli
```

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#installation">Install</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#providers">Providers</a> ·
  <a href="#development">Dev</a>
</p>

</div>

---

## Overview

BeastCLI is an **open-source, provider-agnostic AI coding agent** designed for developers who want full control over their tools. Built with [Bun](https://bun.sh) and compiled to a single native binary, it delivers a rich Terminal User Interface (TUI) for autonomous software development without vendor lock-in.

> **Open-source.** Not a wrapper around a closed API. Not a SaaS product. A real terminal-native coding agent.

---

## Features

| | |
|:---|:---|
| **🎨 Rich TUI** | Mission Control sidebar with real-time context progress, service status, and keyboard shortcut hints |
| **🌐 Multi-Provider** | Claude, OpenAI, Google, OpenRouter, GitHub Copilot + 5 local providers (Ollama, LM Studio, Jan, MLX, vLLM) |
| **⚡ Bun-Native** | Compiled to a single ~80MB native binary. No Node.js runtime required |
| **📦 Auto-Detection** | Local AI servers discovered automatically — no configuration needed |
| **🔌 Plugin SDK** | Build custom agents, tools, and providers with the `@simpletoolsindia/plugin` SDK |
| **🤖 Multiple Agents** | Build (full-access), Plan (read-only), and General (subagent) modes |

---

## Installation

### npm (Recommended)
Auto-downloads the correct native binary for your platform:

```bash
npm install -g @simpletoolsindia/beast-cli
```

### Bun
```bash
bun install -g @simpletoolsindia/beast-cli
```

### Homebrew (macOS/Linux)
```bash
brew install simpletoolsindia/tap/beastcli
```

### Scoop (Windows)
```powershell
scoop install beastcli
```

### Manual
Download the latest release for your platform from [GitHub Releases](https://github.com/simpletoolsindia/code-cli/releases).

---

## Quick Start

```bash
# Start an interactive session
beast

# Connect a provider
beast /connect

# Pick a model
beast /model

# Use a specific agent
beast --agent plan

# Run in server mode
beast server
```

### Default Keybinds

| Action | Key |
|:---|:---|
| Commands palette | `Ctrl/Cmd + K` |
| Switch model | `Ctrl/Cmd + O` |
| Toggle sidebar | `Ctrl/Cmd + B` |
| Stop generation | `Esc` |
| Help | `Ctrl/Cmd + H` |

---

<a name="providers"></a>
## Supported Providers

### Cloud
- **BeastCLI** — Built-in models with competitive pricing
- **Anthropic** — Claude 4 / 3.5 Sonnet / Opus
- **OpenAI** — GPT-4o / o3 / o1
- **Google** — Gemini 2.5 Pro / Flash
- **OpenRouter** — 200+ models via single API key
- **GitHub Copilot** — Native Copilot integration

### Local (Auto-Detected)
| Provider | Port | Status |
|:---|:---|:---|
| Ollama | `11434` | Auto-connect |
| LM Studio | `1234` | Auto-connect |
| Jan | `1337` | Auto-connect |
| MLX | `8080` | Auto-connect |
| vLLM | `8001` | Auto-connect |

Local providers are discovered automatically — no API keys, no manual configuration.

---

## Architecture

```
BeastCLI
├── packages/
│   ├── beastcli/     CLI binary (Bun → native)
│   ├── app/          Web application (SolidJS)
│   ├── sdk/            JavaScript/TypeScript SDK
│   ├── plugin/         Plugin SDK
│   ├── core/           Filesystem & utilities
│   └── script/         Build tooling
```

---

## Packages

| Package | Version | Description |
|:---|:---|:---|
| `@simpletoolsindia/beast-cli` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/beast-cli?style=flat-square&color=7B61FF)](https://www.npmjs.com/package/@simpletoolsindia/beast-cli) | Native CLI binary + npm wrapper |
| `@simpletoolsindia/plugin` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/plugin?style=flat-square&color=00E5FF)](https://www.npmjs.com/package/@simpletoolsindia/plugin) | Plugin SDK for custom agents/tools |
| `@simpletoolsindia/sdk` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/sdk?style=flat-square&color=00E676)](https://www.npmjs.com/package/@simpletoolsindia/sdk) | JavaScript/TypeScript client |
| `@simpletoolsindia/core` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/core?style=flat-square&color=FFAB00)](https://www.npmjs.com/package/@simpletoolsindia/core) | Core utilities & filesystem |

---

<a name="development"></a>
## Development

### Prerequisites
- [Bun](https://bun.sh) 1.3+
- Git

### Build from Source

```bash
# Clone
git clone https://github.com/simpletoolsindia/code-cli.git
cd code-cli

# Install dependencies
bun install

# Build CLI binary (current platform only)
cd packages/beastcli
bun run build --single --baseline

# Run in development mode
bun run dev
```

### Testing
```bash
cd packages/beastcli
bun test        # Run tests
bun typecheck   # TypeScript check
```

### Publishing
```bash
cd packages/beastcli
bun run build --single --baseline --skip-install
npm publish --access public
```

---

## Configuration

Config directory: `~/.config/beastcli/`

```bash
# Global config
~/.config/beastcli/config.json

# Session history
~/.config/beastcli/data/

# Installed plugins
~/.config/beastcli/plugins/
```

### Example `config.json`

```json
{
  "model": "anthropic/claude-sonnet-4",
  "theme": "dark",
  "agent": "build"
}
```

---

## FAQ

**How is BeastCLI different from Claude Code?**

BeastCLI is 100% open-source, provider-agnostic (not locked to Anthropic), compiled to a native binary, and supports local AI models without requiring cloud access.

**What runtime is required?**

Bun for development. End users get a native binary — no runtime required.

**Can I use BeastCLI without an API key?**

Yes. Five local providers (Ollama, LM Studio, Jan, MLX, vLLM) are auto-detected and require no configuration.

**Is there a desktop app?**

A desktop application is under development. Follow [GitHub Releases](https://github.com/simpletoolsindia/code-cli/releases) for updates.

---

## Contributing

We welcome contributions. Please read our [Contributing Guide](./CONTRIBUTING.md).

- 🐛 [Report bugs](https://github.com/simpletoolsindia/code-cli/issues)
- 💡 [Request features](https://github.com/simpletoolsindia/code-cli/discussions)
- 🔌 [Develop plugins](./docs/PLUGINS.md)

---

## License

[MIT](./LICENSE) — Built by [@simpletoolsindia](https://github.com/simpletoolsindia)

<div align="center">
<br>
<a href="https://github.com/simpletoolsindia/code-cli/releases">
  <img src="https://img.shields.io/github/v/release/simpletoolsindia/code-cli?style=for-the-badge&color=7B61FF&label=latest%20release">
</a>
</div>
