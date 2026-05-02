<p align="center">
  <a href="https://beastcli.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="BeastCLI logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://beastcli.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/beastcli-ai"><img alt="npm" src="https://img.shields.io/npm/v/beastcli-ai?style=flat-square" /></a>
  <a href="https://github.com/simpletoolsindia/code-cli/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/simpletoolsindia/code-cli/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![BeastCLI Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://beastcli.ai)

---

### Installation

```bash
# YOLO
curl -fsSL https://beastcli.ai/install | bash

# Package managers
npm i -g beastcli@latest        # or bun/pnpm/yarn
scoop install beastcli             # Windows
choco install beastcli             # Windows
brew install simpletoolsindia/tap/code-cli # macOS and Linux (recommended, always up to date)
brew install beastcli              # macOS and Linux (official brew formula, updated less)
sudo pacman -S beastcli            # Arch Linux (Stable)
paru -S beastcli-bin               # Arch Linux (Latest from AUR)
mise use -g beastcli               # Any OS
nix run nixpkgs#beastcli           # or github:simpletoolsindia/code-cli for latest dev branch
```

> [!TIP]
> Remove versions older than 0.1.x before installing.

### Desktop App (BETA)

BeastCLI is also available as a desktop application. Download directly from the [releases page](https://github.com/simpletoolsindia/code-cli/releases) or [beastcli.ai/download](https://beastcli.ai/download).

| Platform              | Download                              |
| --------------------- | ------------------------------------- |
| macOS (Apple Silicon) | `beastcli-desktop-darwin-aarch64.dmg` |
| macOS (Intel)         | `beastcli-desktop-darwin-x64.dmg`     |
| Windows               | `beastcli-desktop-windows-x64.exe`    |
| Linux                 | `.deb`, `.rpm`, or AppImage           |

```bash
# macOS (Homebrew)
brew install --cask beastcli-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/beastcli-desktop
```

#### Installation Directory

The install script respects the following priority order for the installation path:

1. `$BEAST_INSTALL_DIR` - Custom installation directory
2. `$XDG_BIN_DIR` - XDG Base Directory Specification compliant path
3. `$HOME/bin` - Standard user binary directory (if it exists or can be created)
4. `$HOME/.beastcli/bin` - Default fallback

```bash
# Examples
BEAST_INSTALL_DIR=/usr/local/bin curl -fsSL https://beastcli.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://beastcli.ai/install | bash
```

### Agents

BeastCLI includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

Learn more about [agents](https://beastcli.ai/docs/agents).

### Documentation

For more info on how to configure BeastCLI, [**head over to our docs**](https://beastcli.ai/docs).

### Contributing

If you're interested in contributing to BeastCLI, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

### Building on BeastCLI

If you are working on a project that's related to BeastCLI and is using "beast" as part of its name, for example "beastcli-dashboard" or "beastcli-mobile", please add a note to your README to clarify that it is not built by the BeastCLI team and is not affiliated with us in any way.

### FAQ

#### How is this different from Claude Code?

It's very similar to Claude Code in terms of capability. Here are the key differences:

- 100% open source
- Not coupled to any provider. Although we recommend the models we provide through [BeastCLI Zen](https://beastcli.ai/zen), BeastCLI can be used with Claude, OpenAI, Google, or even local models. As models evolve, the gaps between them will close and pricing will drop, so being provider-agnostic is important.
- Out-of-the-box LSP support
- A focus on TUI. BeastCLI is built by neovim users and the creators of [terminal.shop](https://terminal.shop); we are going to push the limits of what's possible in the terminal.
- A client/server architecture. This, for example, can allow BeastCLI to run on your computer while you drive it remotely from a mobile app, meaning that the TUI frontend is just one of the possible clients.

---

**Join our community** [Discord](https://discord.gg/beastcli) | [X.com](https://x.com/beastcli)
