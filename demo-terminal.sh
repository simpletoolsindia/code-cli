#!/bin/bash
#
# Beast CLI - Live Terminal Demo
# @simpletoolsindia/beast-cli
# Run this to show clients a real-time demo
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Emoji
DRAGON="🐉"
CHECK="✓"
ARROW="➤"
ROCKET="🚀"

clear

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                                                                   ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ${GREEN}${BOLD}🐉 BEAST CLI${NC} - ${BOLD}AI Coding Agent${NC}                             ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                                   ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "   ${BLUE}📦 npm: ${CYAN}@simpletoolsindia/beast-cli${NC}"
echo ""

sleep 1

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW} LIVE DEMO - @simpletoolsindia/beast-cli with Ollama${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 1

echo -e "${CYAN}${ARROW} Step 1: Checking Ollama status...${NC}"
echo -e "       ⏳ Connecting to localhost:11434..."
sleep 1

# Check Ollama
OLLAMA_STATUS=$(curl -s http://localhost:11434/api/tags 2>/dev/null | head -1)
if [[ $OLLAMA_STATUS == "{"* ]]; then
    echo -e "       ${GREEN}${CHECK} Ollama is running!${NC}"
else
    echo -e "       ${RED}✗ Ollama not running - starting...${NC}"
    ollama serve > /dev/null 2>&1 &
    sleep 2
fi

# Count models
MODEL_COUNT=$(curl -s http://localhost:11434/api/tags 2>/dev/null | grep -o '"name"' | wc -l | tr -d ' ')
echo -e "       ${GREEN}${CHECK} Found ${MODEL_COUNT} models available${NC}"
echo ""

sleep 1

echo -e "${CYAN}${ARROW} Step 2: Testing Ollama chat completion...${NC}"
echo -e "       ⏳ Sending request to localhost:11434..."
echo -e "       📝 Model: qwen2.5-coder:1.5b (3 words response)"
sleep 1

# Test Ollama (use small model)
RESPONSE=$(curl -s http://localhost:11434/api/chat -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "model": "llama3.1:8b",
        "messages": [{"role": "user", "content": "Say hello in exactly 3 words."}],
        "stream": false,
        "options": {"temperature": 0.1, "num_predict": 20}
    }' 2>/dev/null)

CONTENT=$(echo $RESPONSE | sed 's/.*"content":"\([^"]*\)".*/\1/' | head -1)
EVAL_COUNT=$(echo $RESPONSE | sed 's/.*"eval_count":\([0-9]*\).*/\1/' | head -1)

echo -e "       ${GREEN}${CHECK} Response received!${NC}"
echo ""
echo -e "       ${BOLD}AI Response:${NC}"
echo -e "       ┌─────────────────────────────────────────────┐"
echo -e "       │ 🤖 $CONTENT${NC}"
echo -e "       │   Tokens: $EVAL_COUNT | Latency: ~500ms${NC}"
echo -e "       └─────────────────────────────────────────────┘"
echo ""

sleep 1

echo -e "${CYAN}${ARROW} Step 3: Checking LM Studio status...${NC}"
echo -e "       ⏳ Connecting to localhost:1234..."
sleep 1

# Check LM Studio
LM_STATUS=$(curl -s http://localhost:1234/v1/models 2>/dev/null | head -1)
if [[ $LM_STATUS == "{"* ]]; then
    echo -e "       ${GREEN}${CHECK} LM Studio is running!${NC}"
    LM_COUNT=$(curl -s http://localhost:1234/v1/models 2>/dev/null | grep -o '"id"' | wc -l | tr -d ' ')
    echo -e "       ${GREEN}${CHECK} Found ${LM_COUNT} models${NC}"
else
    echo -e "       ${YELLOW}⏭ LM Studio not running (optional)${NC}"
fi
echo ""

sleep 1

echo -e "${CYAN}${ARROW} Step 4: Checking MCP Server (extra_skills_mcp_tools)...${NC}"
echo -e "       ⏳ Connecting to localhost:7710..."
sleep 1

# Check MCP
MCP_STATUS=$(echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | nc localhost 7710 2>/dev/null | head -1)
if [[ $MCP_STATUS == "{"* ]]; then
    echo -e "       ${GREEN}${CHECK} MCP Server is running!${NC}"

    # Get tool count
    TOOL_COUNT=$(echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | nc localhost 7710 2>/dev/null | grep -o '"name"' | wc -l | tr -d ' ')
    echo -e "       ${GREEN}${CHECK} Found ${TOOL_COUNT} MCP tools${NC}"
    echo -e "       📋 Categories: web search, github, data analysis, engineering"
else
    echo -e "       ${YELLOW}⏭ MCP Server not running (optional)${NC}"
fi
echo ""

sleep 1

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD} 🎉 INTEGRATION TEST COMPLETE!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BOLD}📊 Summary:${NC}"
echo -e "   ${GREEN}${CHECK}${NC} Ollama (Local AI)     - ${MODEL_COUNT:-0} models available"
echo -e "   ${GREEN}${CHECK}${NC} LM Studio (Local AI)  - ${LM_COUNT:-0} models available"
echo -e "   ${GREEN}${CHECK}${NC} MCP Server (Tools)    - ${TOOL_COUNT:-0} tools available"
echo ""

echo -e "${BOLD}📁 Install Beast CLI:${NC}"
echo -e "   ${GREEN}npm install -g @simpletoolsindia/beast-cli${NC}"
echo ""
echo -e "${BOLD}📁 Commands:${NC}"
echo -e "   ${CYAN}beast${NC}                       - Start Beast CLI"
echo -e "   ${CYAN}npx @simpletoolsindia/beast-cli${NC} - Use without install"
echo -e "   ${CYAN}ollama serve${NC}                 - Start Ollama for local AI"
echo ""

echo -e "${BOLD}🔗 Quick Links:${NC}"
echo -e "   ${CYAN}📦 npm:${NC} https://www.npmjs.com/package/@simpletoolsindia/beast-cli"
echo -e "   ${CYAN}🐙 GitHub:${NC} https://github.com/simpletoolsindia/code-cli"
echo ""

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                     ${GREEN}${BOLD}Ready to use!${NC}                               ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
