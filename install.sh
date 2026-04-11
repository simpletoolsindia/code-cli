#!/usr/bin/env bash
#
# Beast CLI 🐉 - Zero-Config Installer
# curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | bash
#
# Supports: npm, bun
# Features:
#   ✅ Zero-touch installation (no manual actions)
#   ✅ Auto-install Node.js, bun, Python if missing
#   ✅ Auto-install ffmpeg for TTS audio
#   ✅ Automatic upgrade
#   ✅ Config preservation
#   ✅ TTS enabled by default
#   ✅ SearXNG URL customization
#   ✅ Tool health verification
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

# Default SearXNG URL (can be overridden via SEARX_URL env or config)
DEFAULT_SEARX_URL="${SEARX_URL:-https://search.sridharhomelab.in}"

# ─── Colors ─────────────────────────────────────────────────────────────────
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
            elif has_command apk; then
                install_cmd="apk add --no-cache nodejs npm"
            fi
            ;;
        macos)
            if has_command brew; then
                install_cmd="brew install node"
            fi
            ;;
        windows)
            log_warn "Windows detected - use install.ps1 for best experience"
            return 1
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
        elif [[ "$install_cmd" == "apk"* ]]; then
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
        return 1
    fi
}

# ─── Auto-Install bun ─────────────────────────────────────────────────────────
install_bun() {
    log_step "Checking bun..."

    if has_command bun; then
        log_success "bun $(bun --version) found"
        return 0
    fi

    log_info "bun not found. Installing..."

    local os=$(detect_os)

    # Try official installer (works on Linux/macOS)
    if [[ "$os" == "linux" ]] || [[ "$os" == "macos" ]]; then
        log_info "Installing bun via official installer..."
        if curl -fsSL https://bun.sh/install | bash; then
            # Add bun to PATH for this session
            export BUN_INSTALL="$HOME/.bun"
            export PATH="$BUN_INSTALL/bin:$PATH"

            if has_command bun; then
                log_success "bun $(bun --version) installed"
                return 0
            fi
        fi
    fi

    # Try npm as fallback
    if has_command npm; then
        log_info "Installing bun via npm..."
        npm install -g bun 2>/dev/null && has_command bun
        if has_command bun; then
            log_success "bun $(bun --version) installed via npm"
            return 0
        fi
    fi

    log_warn "Could not install bun - will use npm instead"
    return 1
}

# ─── Auto-Install Python ──────────────────────────────────────────────────────
install_python() {
    log_step "Checking Python..."

    if has_command python3; then
        log_success "Python $(python3 --version) found"
        return 0
    fi

    if has_command python; then
        log_success "Python $(python --version) found"
        return 0
    fi

    log_info "Python not found. Installing..."

    local os=$(detect_os)

    case "$os" in
        linux)
            if has_command apt-get; then
                sudo apt-get update && sudo apt-get install -y python3 python3-pip
            elif has_command yum; then
                sudo yum install -y python3 python3-pip
            elif has_command pacman; then
                sudo pacman -S python python-pip
            elif has_command apk; then
                apk add --no-cache python3 py3-pip
            fi
            ;;
        macos)
            if has_command brew; then
                brew install python
            fi
            ;;
    esac

    if has_command python3 || has_command python; then
        local python_cmd=$(has_command python3 && echo "python3" || echo "python")
        log_success "Python installed"
        # Install required packages
        install_python_packages
        return 0
    fi

    log_warn "Python not installed - some tools may not work"
    log_info "For full functionality, install from: https://www.python.org/"
    return 1
}

# ─── Install Python packages ──────────────────────────────────────────────────
install_python_packages() {
    log_step "Installing Python packages..."

    local python_cmd=$(has_command python3 && echo "python3" || echo "python")

    if ! has_command "$python_cmd"; then
        log_warn "Python not found - skipping package installation"
        return 1
    fi

    log_info "Installing requests and beautifulsoup4..."

    if [[ "$python_cmd" == "python3" ]]; then
        sudo python3 -m pip install requests beautifulsoup4 --quiet 2>/dev/null || \
        python3 -m pip install requests beautifulsoup4 --user --quiet 2>/dev/null || \
        pip3 install requests beautifulsoup4 --quiet 2>/dev/null
    else
        sudo python -m pip install requests beautifulsoup4 --quiet 2>/dev/null || \
        python -m pip install requests beautifulsoup4 --user --quiet 2>/dev/null || \
        pip install requests beautifulsoup4 --quiet 2>/dev/null
    fi

    # Verify
    if $python_cmd -c "import requests; from bs4 import BeautifulSoup" 2>/dev/null; then
        log_success "Python packages installed (requests, beautifulsoup4)"
        return 0
    fi

    log_warn "Could not install Python packages - tools may fail without them"
    return 1
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
            elif has_command apk; then
                apk add --no-cache ffmpeg
            fi
            ;;
        macos)
            if has_command brew; then
                brew install ffmpeg
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

# ─── Setup SearXNG ────────────────────────────────────────────────────────────
setup_searxng() {
    log_step "Configuring SearXNG search..."

    mkdir -p "$CONFIG_DIR"

    local searx_config="${CONFIG_DIR}/searx.json"

    # Check for custom URL in config
    local custom_url=""
    if [[ -f "$searx_config" ]]; then
        custom_url=$(grep -o '"url"[[:space:]]*:[[:space:]]*"[^"]*"' "$searx_config" 2>/dev/null | sed 's/.*"\(.*\)"/\1/' | head -1)
    fi

    # Fall back to env var or default
    if [[ -z "$custom_url" ]]; then
        if [[ -n "${SEARX_URL:-}" ]]; then
            custom_url="$SEARX_URL"
        else
            custom_url="$DEFAULT_SEARX_URL"
        fi
    fi

    cat > "$searx_config" << EOF
{
  "url": "$custom_url",
  "enabled": true
}
EOF

    log_success "SearXNG configured: $custom_url"
    log_info "To customize, edit: $searx_config"
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
        echo -n "Remove config (~/.beast-cli)? [y/N] "
        read -r
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

install_bun_pkg() {
    log_step "Installing via bun..."

    if bun pm ls -g 2>/dev/null | grep -q "$NPM_PACKAGE"; then
        log_info "Upgrading existing installation..."
        bun update -g "$NPM_PACKAGE"
    else
        bun add -g "$NPM_PACKAGE"
    fi

    log_done "bun add complete"
}

# ─── TTS Setup ───────────────────────────────────────────────────────────────
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
            "${HOME}/.bun/bin/${APP_NAME}" \
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

# ─── Tool Health Check ────────────────────────────────────────────────────────
check_tool_health() {
    log_step "Running tool health check..."
    echo ""

    local passed=0
    local failed=0

    # Node.js
    if has_command node; then
        echo -e "  ${GREEN}✅${NC} Node.js: v$(node --version)"
        ((passed++))
    else
        echo -e "  ${YELLOW}❌${NC} Node.js: Not installed"
        ((failed++))
    fi

    # bun
    if has_command bun; then
        echo -e "  ${GREEN}✅${NC} bun: v$(bun --version)"
        ((passed++))
    else
        echo -e "  ${YELLOW}⚠️${NC} bun: Not installed (npm fallback available)"
    fi

    # Python
    local python_cmd=""
    if has_command python3; then
        python_cmd="python3"
    elif has_command python; then
        python_cmd="python"
    fi

    if [[ -n "$python_cmd" ]]; then
        echo -e "  ${GREEN}✅${NC} Python: $($python_cmd --version)"
        ((passed++))
    else
        echo -e "  ${YELLOW}❌${NC} Python: Not installed"
        ((failed++))
    fi

    # Python packages
    if [[ -n "$python_cmd" ]]; then
        if $python_cmd -c "import requests; from bs4 import BeautifulSoup" 2>/dev/null; then
            echo -e "  ${GREEN}✅${NC} Python packages: requests, beautifulsoup4"
            ((passed++))
        else
            echo -e "  ${YELLOW}⚠️${NC} Python packages: Not installed (web scraping may fail)"
        fi
    fi

    # ffmpeg
    if has_command ffplay; then
        echo -e "  ${GREEN}✅${NC} ffmpeg: Installed (TTS audio enabled)"
        ((passed++))
    else
        echo -e "  ${YELLOW}⚠️${NC} ffmpeg: Not installed (TTS will use fallback)"
    fi

    # Beast CLI
    if has_command "$APP_NAME"; then
        local version=$("$APP_NAME" --version 2>/dev/null | head -1 || echo "unknown")
        echo -e "  ${GREEN}✅${NC} Beast CLI: v$version"
        ((passed++))
    else
        echo -e "  ${RED}❌${NC} Beast CLI: Not installed or not in PATH"
        ((failed++))
    fi

    echo ""

    if [[ $failed -gt 0 ]]; then
        log_warn "Some tools are not available. CLI may have limited functionality."
    else
        log_success "All tools healthy!"
    fi
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
    local os=$(detect_os)
    local skip_python=false
    local skip_bun=false

    # Parse args
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --uninstall|-u)
                uninstall
                exit 0
                ;;
            --skip-python)
                skip_python=true
                ;;
            --skip-bun)
                skip_bun=true
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -u, --uninstall    Uninstall"
                echo "  --skip-python      Skip Python installation"
                echo "  --skip-bun         Skip bun installation"
                echo "  -h, --help         Show help"
                echo ""
                echo "Environment Variables:"
                echo "  SEARX_URL          Custom SearXNG URL (default: $DEFAULT_SEARX_URL)"
                echo ""
                echo "Features:"
                echo "  ✓ Auto Node.js/bun install"
                echo "  ✓ Auto Python install"
                echo "  ✓ Auto ffmpeg for TTS"
                echo "  ✓ TTS enabled by default"
                echo "  ✓ SearXNG customization"
                exit 0
                ;;
            *)
                shift
                ;;
        esac
    done

    echo ""
    echo -e "${BOLD}${CYAN}    🐉 Beast CLI - Zero-Config Installer${NC}"
    echo -e "${DIM}    AI Coding Agent with TTS & Web Scraping${NC}"
    echo ""

    # Windows-specific notes
    if [[ "$os" == "windows" ]]; then
        echo -e "${YELLOW}  ⚠️  Windows detected${NC}"
        echo -e "${DIM}  For best experience, use PowerShell with install.ps1${NC}"
        echo ""
    fi

    # Run installation steps
    check_requirements

    # Install bun if not skipped
    if [[ "$skip_bun" != "true" ]]; then
        install_bun || true
    fi

    # Install Python if not skipped
    if [[ "$skip_python" != "true" ]]; then
        install_python || true
    fi

    install_ffmpeg
    setup_npm_global
    setup_searxng

    echo ""
    log_info "Installing ${APP_NAME_DISPLAY}..."
    echo ""

    case "$PACKAGE_MANAGER" in
        npm)  install_npm ;;
        bun)  install_bun_pkg ;;
    esac

    setup_tts
    setup_environment
    verify_installation
    check_tool_health

    echo ""
    log_success "Installation complete! 🚀"
    echo ""
}

main "$@"