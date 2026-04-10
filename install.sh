#!/usr/bin/env bash
#
# Beast CLI 🐉 - One-Command Installer
# curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | bash
#
# Supports:
#   - npm (Node.js)
#   - bun
#   - Direct binary download (future)
#
# Features:
#   ✅ Zero-touch installation
#   ✅ Automatic upgrade
#   ✅ Config preservation
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
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    CYAN=''
    BOLD=''
    DIM=''
    NC=''
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

has_command() {
    command -v "$1" >/dev/null 2>&1
}

get_version() {
    # Try to get current installed version
    if has_command "$APP_NAME"; then
        "$APP_NAME" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown"
    else
        echo "not installed"
    fi
}

# ─── Pre-flight Checks ───────────────────────────────────────────────────────
check_requirements() {
    log_step "Checking requirements..."

    local os=$(detect_os)
    local arch=$(detect_arch)

    log_info "Detected: ${BOLD}${os}${NC} (${arch})"

    # Check for npm or bun
    if has_command npm; then
        log_info "Using npm: $(npm --version)"
        PACKAGE_MANAGER="npm"
    elif has_command bun; then
        log_info "Using bun: $(bun --version)"
        PACKAGE_MANAGER="bun"
    else
        log_error "Neither npm nor bun found!"
        log_info "Install npm: https://nodejs.org/"
        log_info "Install bun: curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi

    # Check Node/Bun version
    if [[ "$PACKAGE_MANAGER" == "npm" ]]; then
        local node_version=$(node --version | sed 's/v//')
        if [[ $(echo -e "18.0.0\n$node_version" | sort -V | head -1) != "18.0.0" ]]; then
            log_warn "Node.js 18+ recommended, found: $node_version"
        fi
    fi

    log_done "Requirements OK"
}

# ─── Uninstallation ───────────────────────────────────────────────────────────
uninstall() {
    log_step "Uninstalling ${APP_NAME}..."

    # Remove npm package
    if has_command npm; then
        npm uninstall -g "$NPM_PACKAGE" 2>/dev/null || true
    fi

    # Remove bun package
    if has_command bun; then
        bun remove -g "$NPM_PACKAGE" 2>/dev/null || true
    fi

    # Remove symlinks
    sudo rm -f "${INSTALL_DIR}/${APP_NAME}" 2>/dev/null || \
    rm -f "${INSTALL_DIR}/${APP_NAME}" 2>/dev/null || true
    rm -f "${HOME}/.local/bin/${APP_NAME}" 2>/dev/null || true

    # Optionally remove config (ask first)
    if [[ -d "$CONFIG_DIR" ]]; then
        read -p "Remove config directory (~/.beast-cli)? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$CONFIG_DIR"
            log_info "Removed config directory"
        fi
    fi

    log_success "Uninstallation complete"
}

# ─── Installation ─────────────────────────────────────────────────────────────
install_npm() {
    log_step "Installing via npm..."

    # Upgrade if already installed
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

    # Upgrade if already installed
    if bun pm ls -g | grep -q "$NPM_PACKAGE"; then
        log_info "Upgrading existing installation..."
        bun update -g "$NPM_PACKAGE"
    else
        bun add -g "$NPM_PACKAGE"
    fi

    log_done "bun add complete"
}

# ─── Post-Installation ────────────────────────────────────────────────────────
setup_environment() {
    log_step "Setting up environment..."

    # Ensure directories exist
    mkdir -p "$CONFIG_DIR" "$CACHE_DIR" "$STATE_DIR"

    # Add to shell PATH if needed
    local shell_rc=""
    case "${SHELL:-}" in
        */zsh)  shell_rc="${HOME}/.zshrc" ;;
        */bash) shell_rc="${HOME}/.bashrc" ;;
        *)      shell_rc="${HOME}/.bashrc" ;;
    esac

    # Check if already in PATH
    local beast_bin=""
    if has_command "$APP_NAME"; then
        beast_bin=$(which "$APP_NAME")
        log_info "Found at: $beast_bin"
    else
        # Try common locations
        for loc in \
            "${HOME}/.npm-global/bin/${APP_NAME}" \
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
            log_warn "${APP_NAME} installed but not in PATH"
            log_info "Add to PATH: export PATH=\"$(dirname "$beast_bin"):\$PATH\""
            log_info "Or restart your terminal"
        fi
    fi

    log_done "Environment setup complete"
}

# ─── Verification ─────────────────────────────────────────────────────────────
verify_installation() {
    log_step "Verifying installation..."

    if has_command "$APP_NAME"; then
        local version=$("$APP_NAME" --version 2>/dev/null | head -1 || echo "unknown")
        log_success "${APP_NAME} v${version} installed successfully!"

        # Show help
        echo ""
        log_info "Run ${BOLD}${APP_NAME}${NC} to start"
        log_info "Run ${BOLD}${APP_NAME} --help${NC} for options"
        log_info "Docs: ${DIM}https://github.com/${REPO}${NC}"
    else
        log_error "Installation verification failed"
        log_info "Try running: ${APP_NAME} --version"
        return 1
    fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${BOLD}${CYAN}    🐉 Beast CLI Installer${NC}"
    echo -e "${DIM}    AI Coding Agent for Power Users${NC}"
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
            echo "  -u, --uninstall    Uninstall Beast CLI"
            echo "  -h, --help         Show this help"
            echo "  -v, --version      Show version"
            echo ""
            echo "Environment variables:"
            echo "  NO_COLOR=1         Disable colors"
            echo "  INSTALL_DIR=/path  Custom install directory"
            exit 0
            ;;
        --version|-v)
            echo "Beast CLI Installer v1.0"
            echo "Repository: https://github.com/${REPO}"
            exit 0
            ;;
    esac

    # Run installation
    check_requirements

    echo ""
    log_info "Installing ${APP_NAME_DISPLAY}..."
    log_info "Repository: ${DIM}https://github.com/${REPO}${NC}"
    echo ""

    case "$PACKAGE_MANAGER" in
        npm)  install_npm ;;
        bun)  install_bun ;;
    esac

    setup_environment
    verify_installation

    echo ""
    log_success "Installation complete! 🚀"
    echo ""
}

main "$@"
