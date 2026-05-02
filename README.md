<p align="center">
  <a href="https://github.com/simpletoolsindia/code-cli">
    <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="BeastCLI logo" width="200">
  </a>
</p>
<h1 align="center">BeastCLI</h1>
<p align="center">
  <strong>The open source AI coding agent.</strong>
  <br>
  Powered by <a href="https://github.com/simpletoolsindia">@simpletoolsindia</a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@simpletoolsindia/beast-cli"><img alt="npm version" src="https://img.shields.io/npm/v/@simpletoolsindia/beast-cli?style=flat-square&color=blue" /></a>
  <a href="https://www.npmjs.com/package/@simpletoolsindia/beast-cli"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@simpletoolsindia/beast-cli?style=flat-square&color=green" /></a>
  <a href="https://github.com/simpletoolsindia/code-cli/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/simpletoolsindia/code-cli/publish.yml?style=flat-square&branch=dev" /></a>
  <a href="https://github.com/simpletoolsindia/code-cli/blob/dev/LICENSE"><img alt="License" src="https://img.shields.io/github/license/simpletoolsindia/code-cli?style=flat-square&color=purple" /></a>
</p>

---

## Overview

**BeastCLI** is a powerful, provider-agnostic AI coding agent that runs in your terminal. Built with modern web technologies and compiled to native binaries via Bun, it delivers a rich Terminal User Interface (TUI) for autonomous software development, code exploration, and project automation.

- **100% Open Source** — No vendor lock-in, fully transparent
- **Provider Agnostic** — Works with Claude, OpenAI, Google, local models, and more
- **Bun-Native** — Ultra-fast, compiled to a single binary
- **Rich TUI** — Beautiful interface with Mission Control sidebar, context tracking, and modern keyboard shortcuts
- **Client/Server Architecture** — Run locally, control remotely
- **LSP Support** — Out-of-the-box Language Server Protocol integration

---

## Installation

### Quick Install (Recommended)

```bash
# Via npm (auto-downloads native binary)
npm install -g @simpletoolsindia/beast-cli

# Via bun
bun install -g @simpletoolsindia/beast-cli
```

### Platform-Specific

```bash
# macOS / Linux (Homebrew)
brew install simpletoolsindia/tap/code-cli

# Windows (Scoop)
scoop install beastcli

# Windows (Chocolatey)
choco install beastcli

# Arch Linux
sudo pacman -S beastcli
# or from AUR
paru -S beastcli-bin
```

### Manual Install

```bash
# Download from GitHub Releases
curl -fsSL https://github.com/simpletoolsindia/code-cli/releases/latest/download/beastcli-$(uname -s)-$(uname -m) -o beastcli
chmod +x beastcli
sudo mv beastcli /usr/local/bin/
```

---

## Quick Start

```bash
# Start a new session
beast

# Run with a specific model
beast --model claude-sonnet-4

# Use the plan agent for read-only exploration
beast --agent plan

# Run in server mode
beast server
```

---

## Features

### 🎯 Mission Control Sidebar
A redesigned sidebar showing real-time session information, context usage with visual progress bars, active services status, and recent tool calls at a glance.

### ⌨️ Modern Keyboard Shortcuts
OS-aware keyboard shortcuts with beautiful gradient badges:
- **Model Picker** (`Ctrl/Cmd + P`) — Switch AI models instantly
- **New Session** (`Ctrl/Cmd + N`) — Start fresh
- **Context Breakdown** (`Ctrl/Cmd + I`) — Inspect token usage
- **Settings** (`Ctrl/Cmd + ,`) — Configure preferences

### 🤖 Multiple Agents
- **Build** — Full-access agent for coding, editing, and executing commands
- **Plan** — Read-only agent for analysis and exploration
- **General** — Subagent for complex multi-step tasks

### 🔌 Extensible
- **Plugin System** — Load custom providers and tools
- **MCP Support** — Model Context Protocol integration
- **Custom Providers** — Add your own API endpoints

---

## Architecture

```
BeastCLI
├── packages/beastcli    CLI binary (Bun-native, compiled)
├── packages/app           Web application (SolidJS)
├── packages/ui            Shared UI components
├── packages/core          Core utilities
├── packages/plugin        Plugin SDK
├── packages/sdk           JavaScript SDK
└── packages/script        Build scripts
```

---

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@simpletoolsindia/beast-cli` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/beast-cli?style=flat-square)](https://www.npmjs.com/package/@simpletoolsindia/beast-cli) | CLI wrapper with native binary |
| `@simpletoolsindia/core` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/core?style=flat-square)](https://www.npmjs.com/package/@simpletoolsindia/core) | Core filesystem & npm utilities |
| `@simpletoolsindia/ui` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/ui?style=flat-square)](https://www.npmjs.com/package/@simpletoolsindia/ui) | Shared UI components |
| `@simpletoolsindia/app` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/app?style=flat-square)](https://www.npmjs.com/package/@simpletoolsindia/app) | Web application |
| `@simpletoolsindia/plugin` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/plugin?style=flat-square)](https://www.npmjs.com/package/@simpletoolsindia/plugin) | Plugin SDK |
| `@simpletoolsindia/sdk` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/sdk?style=flat-square)](https://www.npmjs.com/package/@simpletoolsindia/sdk) | JavaScript SDK |
| `@simpletoolsindia/script` | [![npm](https://img.shields.io/npm/v/@simpletoolsindia/script?style=flat-square)](https://www.npmjs.com/package/@simpletoolsindia/script) | Build tooling |

---

## Configuration

BeastCLI stores configuration in `~/.beastcli/`:

```bash
# Global config
~/.beastcli/config.json

# Session history
~/.beastcli/sessions/

# Installed plugins
~/.beastcli/plugins/
```

### Example `config.json`

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "theme": "dark",
  "keybinds": {
    "newSession": "ctrl+n",
    "openModelPicker": "ctrl+p",
    "contextBreakdown": "ctrl+i",
    "settings": "ctrl+,"
  }
}
```

---

## Development

### Prerequisites

- [Bun](https://bun.sh) 1.2.10+
- Git

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/simpletoolsindia/code-cli.git
cd code-cli

# Install dependencies
bun install

# Build CLI binary
bun run packages/beastcli/script/build.ts --single --baseline

# Run in development mode
bun run packages/beastcli/src/cli/cmd/tui/app.tsx
```

### Testing

```bash
# Run tests for a specific package
cd packages/beastcli
bun test

# Type checking
cd packages/beastcli
bun typecheck
```

### Publishing

```bash
# Publish all packages
bun run packages/beastcli/script/publish.ts

# Publish individual package
cd packages/core
bun publish --access public
```

---

## Documentation

- 📖 [Full Documentation](https://github.com/simpletoolsindia/code-cli/wiki)
- 🚀 [Quick Start Guide](https://github.com/simpletoolsindia/code-cli/blob/dev/docs/QUICKSTART.md)
- 🔧 [Configuration Reference](https://github.com/simpletoolsindia/code-cli/blob/dev/docs/CONFIG.md)
- 🤖 [Agent Guide](https://github.com/simpletoolsindia/code-cli/blob/dev/docs/AGENTS.md)
- 🔌 [Plugin Development](https://github.com/simpletoolsindia/code-cli/blob/dev/docs/PLUGINS.md)

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a pull request.

### Ways to Contribute

- 🐛 Report bugs via [GitHub Issues](https://github.com/simpletoolsindia/code-cli/issues)
- 💡 Suggest features or improvements
- 📝 Improve documentation
- 🔌 Develop plugins or providers
- 🌍 Translate the README

---

## Community

- 🌐 [GitHub Discussions](https://github.com/simpletoolsindia/code-cli/discussions)
- 💬 [Discord](https://discord.gg/beastcli)
- 🐦 [X (Twitter)](https://x.com/beastcli)

---

## FAQ

### How is BeastCLI different from Claude Code?

- **100% open source** — No proprietary black box
- **Provider agnostic** — Use Claude, OpenAI, Google, or local models
- **Bun-native** — Single compiled binary, no Node.js runtime needed
- **Rich TUI** — Advanced terminal interface with sidebar, context tracking, and modern shortcuts
- **Plugin ecosystem** — Extensible architecture for custom tools

### What runtime is required?

BeastCLI requires **Bun** as its runtime. The npm package includes a wrapper that downloads and caches the native binary automatically.

### Can I use BeastCLI without Bun installed?

The npm package (`@simpletoolsindia/beast-cli`) automatically downloads the correct native binary for your platform on first run. No separate Bun installation is required for end users.

### Is there a desktop application?

Yes! A desktop application is in development. Stay tuned for releases on our [GitHub Releases](https://github.com/simpletoolsindia/code-cli/releases) page.

---

## License

BeastCLI is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/simpletoolsindia">@simpletoolsindia</a></strong>
</p>
