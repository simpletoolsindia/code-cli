#!/bin/bash
#
# Beast CLI - MCP Tools Demo
# Shows how Beast CLI uses MCP tools to answer questions
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

clear

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                                                                   ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ${GREEN}${BOLD}🐉 BEAST CLI${NC} - ${BOLD}MCP Tools Demo${NC}                          ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                                   ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "   ${BLUE}📦 npm: ${CYAN}@simpletoolsindia/beast-cli${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW} Demo: Ask "What is the current gold rate?"${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 1

echo -e "${CYAN}${BOLD}> User:${NC}"
echo -e "   What is the current gold rate in India?"
echo ""

sleep 1

echo -e "${CYAN}${BOLD}> Beast CLI:${NC}"
echo -e "   ⏳ Thinking..."
sleep 1

echo -e "${CYAN}   Using MCP Tool: searxng_search${NC}"
echo -e "${CYAN}   Searching: \"gold rate India today 2026\"${NC}"
echo ""

sleep 1.5

echo -e "${YELLOW}   ┌─────────────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}   │ 🔧 MCP Tool: searxng_search                               │${NC}"
echo -e "${YELLOW}   ├─────────────────────────────────────────────────────────┤${NC}"
echo -e "${YELLOW}   │ Search Query: gold rate India today 2026                │${NC}"
echo -e "${YELLOW}   │ Results Found: 10                                       │${NC}"
echo -e "${YELLOW}   ├─────────────────────────────────────────────────────────┤${NC}"
echo -e "${YELLOW}   │ Top Results:                                             │${NC}"
echo -e "${YELLOW}   │ • goldrate.org - India Gold Rate Today: ₹7,850/gram     │${NC}"
echo -e "${YELLOW}   │ • groww.in - 24K Gold: ₹7,850 | 22K: ₹7,200            │${NC}"
echo -e "${YELLOW}   │ • policybazaar.com - Live Gold Rate Updates              │${NC}"
echo -e "${YELLOW}   └─────────────────────────────────────────────────────────┘${NC}"
echo ""

sleep 1.5

echo -e "${GREEN}${BOLD}> Answer:${NC}"
echo -e "${GREEN}   📊 Gold Rate in India (April 2026)${NC}"
echo ""
echo -e "   ┌─────────────────────────────────────────────────────────┐"
echo -e "   │                                                         │"
echo -e "   │   Gold Type    │   Price per Gram                      │"
echo -e "   │   ─────────────┼───────────────────────                  │"
echo -e "   │   24K Gold     │   ₹7,850                               │"
echo -e "   │   22K Gold     │   ₹7,200                               │"
echo -e "   │   18K Gold     │   ₹5,900                               │"
echo -e "   │                                                         │"
echo -e "   │   💡 Prices may vary by city and jeweler              │"
echo -e "   │   ⚠️  Source: Multiple financial websites              │"
echo -e "   │                                                         │"
echo -e "   └─────────────────────────────────────────────────────────┘"
echo ""

sleep 1

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}${BOLD} Available MCP Tools (64+ tools)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}🌐 Web Search & Fetch${NC}"
echo -e "   • searxng_search    - Search the web"
echo -e "   • fetch_web_content - Get clean page content"
echo -e "   • quick_fetch       - Fast page summary"
echo ""

echo -e "${CYAN}💻 Code Tools${NC}"
echo -e "   • run_code          - Execute Python/JS/Bash"
echo -e "   • run_python_snippet - Run Python with imports"
echo ""

echo -e "${CYAN}📊 Data Tools${NC}"
echo -e "   • pandas_create     - Create DataFrames"
echo -e "   • plot_*             - Charts (line, bar, pie, scatter)"
echo ""

echo -e "${CYAN}🐙 GitHub Tools${NC}"
echo -e "   • github_repo        - Get repo info"
echo -e "   • github_issues      - List issues"
echo -e "   • github_commits    - View commits"
echo ""

echo -e "${CYAN}📺 YouTube Tools${NC}"
echo -e "   • youtube_transcript - Get video transcript"
echo -e "   • youtube_search    - Search videos"
echo ""

sleep 1

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}🎉 Demo Complete!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BOLD}📁 Install Beast CLI:${NC}"
echo -e "   ${GREEN}npm install -g @simpletoolsindia/beast-cli${NC}"
echo ""

echo -e "${BOLD}🔗 Links:${NC}"
echo -e "   ${CYAN}📦 npm:${NC} https://www.npmjs.com/package/@simpletoolsindia/beast-cli"
echo -e "   ${CYAN}🔧 MCP Server:${NC} https://github.com/simpletoolsindia/extra_skills_mcp_tools"
echo ""
