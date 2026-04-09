#!/usr/bin/env bash
#
# Beast CLI - One Line Installer
# curl -Ls https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.sh | sh
#

set -e

# Colors
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}    🐉 Beast CLI Installer${NC}"
echo ""

# Detect package manager
if command -v npm &> /dev/null; then
    echo "Installing via npm..."
    npm install -g @simpletoolsindia/beast-cli
elif command -v bun &> /dev/null; then
    echo "Installing via bun..."
    bun add -g @simpletoolsindia/beast-cli
else
    echo "Error: npm or bun required"
    echo "Install npm: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "Or install bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Detect shell and add to PATH
if [ -d "$HOME/.npm-global/bin" ]; then
    SHELL_RC="$HOME/.bashrc"
    [ -n "$ZSH_VERSION" ] && SHELL_RC="$HOME/.zshrc"
    [ -f "$HOME/.bash_profile" ] && SHELL_RC="$HOME/.bash_profile"

    if ! grep -q 'npm-global/bin' "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# Beast CLI" >> "$SHELL_RC"
        echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> "$SHELL_RC"
    fi
    export PATH="$HOME/.npm-global/bin:$PATH"
fi

echo ""
echo -e "${GREEN}✅ Beast CLI installed!${NC}"
echo ""
echo "Run: ${BOLD}beast${NC}"
echo "Docs: https://github.com/simpletoolsindia/code-cli"
echo ""
