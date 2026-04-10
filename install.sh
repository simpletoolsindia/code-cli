#!/usr/bin/env bash
#
# Beast CLI 🐉 - Zero-Config Installer
# curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | bash
#
# Supports: npm, bun
# Features:
#   ✅ Zero-touch installation (no manual actions)
#   ✅ Auto-install Node.js if missing
#   ✅ Auto-install ffmpeg for TTS audio
#   ✅ Automatic upgrade
#   ✅ Config preservation
#   ✅ TTS enabled by default
#   ✅ Cross-platform (macOS, Linux, Windows/WSL)
#   ✅ Idempotent (safe to run multiple times)
#

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
readonly APP_NAME="beast"
readonly APP_NAME_DISPLAY="🐉 Beast CLI"
readonly REPO="simpletoolsindia/code-cli"
readonly NPM_PACKAGE="@simpletoolsindia/beast-cli"
readonly GITHUB_RAW="https://raw.githubusercontent.com/${REPO}/main"
readonly GITHUB_API="https://api.github.com/repos/${REPO}"

# Install locations
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
CONFIG_DIR="${HOME}/.beast-cli"
CACHE_DIR="${HOME}/.cache/beast-cli"
STATE_DIR="${HOME}/.local/state/beast-cli"
NPM_GLOBAL="${HOME}/.npm-global"
BIN_DIR="${NPM_GLOBAL}/bin"

# Colors (disable with NO_COLOR=1)
if [[ -z "${NO_COLOR:-}" ]] && [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    DIM='\033[2m'
    NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; CYAN=''; BOLD=''; DIM=''; NC=''
fi

# ─── Logging ─────────────────────────────────────────────────────────────────
log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✅${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠️${NC} $*"; }
log_error() { echo -e "${RED}❌${NC} $*" >&2; }
log_step() { echo -e "\n${CYAN}▸${NC} ${BOLD}$*${NC}"; }
log_done() { echo -e "${GREEN}✓${NC} $*"; }

# ─── Detection ───────────────────────────────────────────────────────────────
detect_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux" ;;
        Darwin*)    echo "macos" ;;
        CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
        *)          echo "unknown" ;;
    esac
}

detect_arch() {
    case "$(uname -m)" in
        x86_64|amd64)  echo "x64" ;;
        aarch64|arm64) echo "arm64" ;;
        armv7l)        echo "arm" ;;
        *)             echo "x64" ;;
    esac
}

has_command() { command -v "$1" >/dev/null 2>&1; }

get_version() {
    if has_command "$APP_NAME"; then
        "$APP_NAME" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown"
    else
        echo "not installed"
    fi
}

# ─── Auto-Install Node.js ─────────────────────────────────────────────────────
install_nodejs() {
    log_step "Checking Node.js..."

    if has_command node; then
        log_success "Node.js $(node --version) found"
        return 0
    fi

    log_info "Node.js not found. Installing..."

    local os=$(detect_os)
    local install_cmd=""

    case "$os" in
        linux)
            if has_command apt-get; then
                install_cmd="apt-get install -y nodejs npm"
            elif has_command yum; then
                install_cmd="yum install -y nodejs npm"
            elif has_command pacman; then
                install_cmd="pacman -S nodejs npm"
            fi
            ;;
        macos)
            if has_command brew; then
                install_cmd="brew install node"
            fi
            ;;
    esac

    if [[ -n "$install_cmd" ]]; then
        log_info "Installing via: $install_cmd"
        if [[ "$install_cmd" == "apt-get"* ]]; then
            sudo bash -c "$install_cmd" || $install_cmd
        elif [[ "$install_cmd" == "yum"* ]]; then
            sudo bash -c "$install_cmd" || $install_cmd
        elif [[ "$install_cmd" == "pacman"* ]]; then
            sudo $install_cmd
        elif [[ "$install_cmd" == "brew"* ]]; then
            $install_cmd
        fi
    fi

    # Fallback: NodeSource installer
    if ! has_command node && has_command apt-get; then
        log_info "Installing Node.js via NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
        sudo apt-get install -y nodejs
    fi

    # Verify
    if has_command node; then
        log_success "Node.js $(node --version) installed"
    else
        log_error "Failed to install Node.js"
        log_info "Please install manually: https://nodejs.org/"
        exit 1
    fi
}

# ─── Auto-Install ffmpeg for TTS ─────────────────────────────────────────────
install_ffmpeg() {
    log_step "Checking ffmpeg for TTS audio..."

    if has_command ffplay; then
        log_success "ffplay found (TTS audio enabled)"
        return 0
    fi

    log_info "Installing ffmpeg for text-to-speech audio..."

    local os=$(detect_os)

    case "$os" in
        linux)
            if has_command apt-get; then
                sudo apt-get update && sudo apt-get install -y ffmpeg
            elif has_command yum; then
                sudo yum install -y ffmpeg
            elif has_command pacman; then
                sudo pacman -S ffmpeg
            fi
            ;;
        macos)
            if has_command brew; then
                brew install ffmpeg
            fi
            ;;
        windows)
            if has_command choco; then
                choco install ffmpeg -y
            fi
            ;;
    esac

    if has_command ffplay; then
        log_success "ffmpeg installed (TTS audio enabled)"
    else
        log_warn "ffmpeg not installed - TTS audio may not work"
        log_info "Install manually: https://ffmpeg.org/download.html"
    fi
}

# ─── Setup npm global ─────────────────────────────────────────────────────────
setup_npm_global() {
    log_step "Setting up npm global..."

    npm config set prefix "$NPM_GLOBAL" 2>/dev/null || true

    if [[ ! -d "$BIN_DIR" ]]; then
        mkdir -p "$BIN_DIR"
    fi

    # Add to shell PATH
    local shell_rc=""
    case "${SHELL:-}" in
        */zsh)  shell_rc="${HOME}/.zshrc" ;;
        */bash) shell_rc="${HOME}/.bashrc" ;;
        *)      shell_rc="${HOME}/.bashrc" ;;
    esac

    if [[ -f "$shell_rc" ]]; then
        if ! grep -q "npm-global/bin" "$shell_rc" 2>/dev/null; then
            echo "export PATH=\"${BIN_DIR}:\$PATH\"" >> "$shell_rc"
        fi
    fi

    export PATH="${BIN_DIR}:$PATH"
    log_done "npm global configured"
}

# ─── Pre-flight Checks ───────────────────────────────────────────────────────
check_requirements() {
    log_step "Checking requirements..."
    local os=$(detect_os)
    local arch=$(detect_arch)
    log_info "Detected: ${BOLD}${os}${NC} (${arch})"

    # Detect package manager
    if has_command bun; then
        PACKAGE_MANAGER="bun"
        log_info "Using bun: $(bun --version)"
    elif has_command npm; then
        PACKAGE_MANAGER="npm"
        log_info "Using npm: $(npm --version)"
    else
        log_error "Neither npm nor bun found!"
        install_nodejs
        if has_command npm; then
            PACKAGE_MANAGER="npm"
            log_info "npm found after Node.js install"
        elif has_command bun; then
            PACKAGE_MANAGER="bun"
            log_info "bun found after Node.js install"
        else
            log_error "No package manager available"
            exit 1
        fi
    fi

    log_done "Requirements OK"
}

# ─── Uninstallation ───────────────────────────────────────────────────────────
uninstall() {
    log_step "Uninstalling ${APP_NAME}..."

    if has_command npm; then
        npm uninstall -g "$NPM_PACKAGE" 2>/dev/null || true
    fi
    if has_command bun; then
        bun remove -g "$NPM_PACKAGE" 2>/dev/null || true
    fi

    sudo rm -f "${INSTALL_DIR}/${APP_NAME}" 2>/dev/null || true
    rm -f "${BIN_DIR}/${APP_NAME}" 2>/dev/null || true
    rm -f "${HOME}/.local/bin/${APP_NAME}" 2>/dev/null || true

    if [[ -d "$CONFIG_DIR" ]]; then
        read -p "Remove config (~/.beast-cli)? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$CONFIG_DIR"
            log_info "Removed config"
        fi
    fi

    log_success "Uninstallation complete"
}

# ─── Installation ─────────────────────────────────────────────────────────────
install_npm() {
    log_step "Installing via npm..."

    if npm list -g "$NPM_PACKAGE" >/dev/null 2>&1; then
        log_info "Upgrading existing installation..."
        npm update -g "$NPM_PACKAGE"
    else
        npm install -g "$NPM_PACKAGE"
    fi

    log_done "npm install complete"
}

install_bun() {
    log_step "Installing via bun..."

    if bun pm ls -g 2>/dev/null | grep -q "$NPM_PACKAGE"; then
        log_info "Upgrading existing installation..."
        bun update -g "$NPM_PACKAGE"
    else
        bun add -g "$NPM_PACKAGE"
    fi

    log_done "bun add complete"
}

# ─── TTS Setup ────────────────────────────────────────────────────────────────
setup_tts() {
    log_step "Setting up TTS (text-to-speech)..."

    mkdir -p "$CONFIG_DIR"

    if [[ ! -f "${CONFIG_DIR}/tts.json" ]]; then
        cat > "${CONFIG_DIR}/tts.json" << 'EOF'
{
  "enabled": true,
  "defaultVoice": "en-US-AriaNeural",
  "autoPlay": true
}
EOF
        log_success "TTS enabled with AriaNeural voice"
    else
        log_success "TTS already configured"
    fi

    log_done "TTS setup complete"
}

# ─── Environment Setup ────────────────────────────────────────────────────────
setup_environment() {
    log_step "Setting up environment..."

    mkdir -p "$CONFIG_DIR" "$CACHE_DIR" "$STATE_DIR"

    local beast_bin=""
    if has_command "$APP_NAME"; then
        beast_bin=$(which "$APP_NAME")
        log_success "Found at: $beast_bin"
    else
        for loc in \
            "${BIN_DIR}/${APP_NAME}" \
            "${HOME}/.bun/install/bin/${APP_NAME}" \
            "${HOME}/.local/bin/${APP_NAME}" \
            "/usr/local/bin/${APP_NAME}"
        do
            if [[ -f "$loc" ]]; then
                beast_bin="$loc"
                break
            fi
        done

        if [[ -n "$beast_bin" ]]; then
            log_warn "${APP_NAME} installed but may need PATH update"
            log_info "Run: export PATH=\"${BIN_DIR}:\$PATH\""
            log_info "Or restart terminal"
        fi
    fi

    log_done "Environment setup complete"
}

# ─── Verification ─────────────────────────────────────────────────────────────
verify_installation() {
    log_step "Verifying installation..."

    if has_command "$APP_NAME"; then
        local version=$("$APP_NAME" --version 2>/dev/null | head -1 || echo "unknown")
        log_success "${APP_NAME} v${version} installed!"
        echo ""
        log_info "Run ${BOLD}${APP_NAME} --defaults${NC} to start"
        log_info "Docs: ${DIM}https://github.com/${REPO}${NC}"
    else
        log_error "Installation verification failed"
        log_info "Try: export PATH=\"${BIN_DIR}:\$PATH\" && ${APP_NAME} --version"
        return 1
    fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${BOLD}${CYAN}    🐉 Beast CLI - Zero-Config Installer${NC}"
    echo -e "${DIM}    AI Coding Agent with TTS Support${NC}"
    echo ""

    # Parse arguments
    case "${1:-}" in
        --uninstall|-u)
            uninstall
            exit 0
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -u, --uninstall    Uninstall"
            echo "  -h, --help         Show help"
            echo ""
            echo "Features:"
            echo "  ✓ Auto Node.js install"
            echo "  ✓ Auto ffmpeg for TTS"
            echo "  ✓ TTS enabled by default"
            exit 0
            ;;
        --version|-v)
            echo "Beast CLI Installer v1.1"
            echo "Repository: https://github.com/${REPO}"
            exit 0
            ;;
    esac

    # Run installation steps
    check_requirements
    install_ffmpeg
    setup_npm_global

    echo ""
    log_info "Installing ${APP_NAME_DISPLAY}..."
    echo ""

    case "$PACKAGE_MANAGER" in
        npm)  install_npm ;;
        bun)  install_bun ;;
    esac

    setup_tts
    setup_environment
    verify_installation

    echo ""
    log_success "Installation complete! 🚀"
    echo ""
}

main "$@"
