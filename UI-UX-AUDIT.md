# Beast CLI UI/UX Audit & Redesign

## 🧾 Current State Analysis

### Environment
- **Runtime**: Bun (JavaScript/TypeScript)
- **UI Framework**: Ink (React for terminals) + readline fallback
- **Entry Points**: REPL mode (readline) + TUI components (unused in main flow)
- **Status**: REPL is the active CLI — TUI components exist but aren't wired up

---

## 🧾 UI Audit Summary

### Critical Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | **No visual hierarchy** — all output uses same font weight/color | 🔴 Critical | `index.ts` |
| 2 | **ASCII banner is oversized** — wastes 8 lines per session | 🔴 Critical | `printBanner()` |
| 3 | **Spinner clutters output** — `\r` overwrites lines, leaves artifacts | 🔴 Critical | `startSpinner()` |
| 4 | **No markdown/code rendering** — raw text with backticks | 🔴 Critical | `streamText()` |
| 5 | **Tool results dump raw JSON** — unreadable without formatting | 🔴 Critical | `executeTool()` |
| 6 | **TUI components exist but unused** — 6 files of dead code | 🟡 Major | `src/tui/` |
| 7 | **No keyboard shortcuts** — Tab navigation, Ctrl+C hints missing from REPL | 🟡 Major | REPL loop |
| 8 | **Command discoverability is poor** — `/help` is only guide | 🟡 Major | UX |

### Moderate Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 9 | **Token usage line is noisy** — verbose format every response | 🟡 Moderate | `printUsage()` |
| 10 | **No loading state distinction** — "Thinking" spinner is generic | 🟡 Moderate | Agent loop |
| 11 | **Error messages lack formatting** — `❌ Error: ${e}` is raw | 🟡 Moderate | Catch blocks |
| 12 | **Provider/model info hidden** — shown at start, not in REPL | 🟡 Moderate | UX |
| 13 | **No status indicator** — user doesn't know if provider is responding | 🟡 Moderate | UX |
| 14 | **Session commands scattered** — not grouped or contextualized | 🟡 Moderate | REPL |

### Minor Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 15 | **Inconsistent emoji usage** — mixed 🐉 ❯ 🤖 🔧 ⚠️ | 🟢 Minor | Throughout |
| 16 | **Color codes are magic numbers** — `'\x1b[32m'` not named | 🟢 Minor | `index.ts` |
| 17 | **No clear between sessions** — REPL starts with stale state | 🟢 Minor | UX |
| 18 | **Version in banner only** — no build date, git hash | 🟢 Minor | Branding |

---

## ❌ UX Problems Identified

### 1. **Cognitive Overload at Startup**
- ASCII banner takes 8 lines
- Provider detection output adds 3-4 more lines
- Before user types anything, 12+ lines of boilerplate

### 2. **Poor Feedback During Tool Execution**
- Tool call shows raw JSON args: `file_read({"path":"/etc/hostname"})`
- Result dumps unformatted JSON: `[{"name":".git","type":"directory"...`
- No progress indication for slow tools

### 3. **No Context Awareness**
- Can't tell from output what provider/model is active
- Chat history not visible
- Context window usage unknown during conversation

### 4. **Flat Output Hierarchy**
- User messages, AI responses, tool results all look the same
- No visual separation between conversation turns
- Code blocks blend into prose

### 5. **Discoverability Gap**
- `/help` is plain text, no categorization
- No inline hints during conversation
- Keyboard shortcuts invisible until crash (`Ctrl+C`)

### 6. **TUI Components Are Dead Code**
- `ModernUI.tsx` (448 lines), `App.tsx` (436 lines) exist but aren't wired to main flow
- Main REPL uses raw readline instead
- Two codebases for one UI

---

## 🎨 Proposed Design System

### Color Palette

```
Background:     #0a0a0f   (near-black, reduces eye strain)
Surface:        #151520   (slightly elevated areas)
Border:        #2a2a3a   (subtle separators)
Text Primary:  #e4e4e7   (high contrast)
Text Muted:    #71717a   (secondary info)
Text Dim:      #52525b   (timestamps, hints)

Accent Blue:   #3b82f6   (primary actions, links)
Success Green: #22c55e  (confirmations, user input)
Warning Amber: #f59e0b  (cautions, tool calls)
Error Red:     #ef4444  (errors, destructive)
Purple:        #a855f7  (AI responses, modes)
Cyan:          #06b6d4  (model, tokens)
```

### Typography Rules

| Element | Style | Color |
|---------|-------|-------|
| Prompt | `❯` bold | `success` |
| User Message | bold, surface bg | `text` |
| AI Response | normal | `purple` |
| Tool Name | bold | `warning` |
| Tool Result | dim, surface bg | `muted` |
| Error | bold | `error` |
| Hint/Footer | dim italic | `dim` |

### Spacing Rules

- **Unit**: 2 spaces (no half-measures)
- **Section gap**: 1 blank line between conversation turns
- **Indent**: 2 spaces for sub-items
- **Max width**: 120 chars (wrap gracefully)

---

## 🧩 Component Redesign

### 1. Header (Minimal)

**Before** (8 lines of ASCII art):
```
   ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗
   ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝
   ...
```

**After** (2 lines):
```
🐉 Beast CLI  v1.2.4  │  openrouter  │  qwen3-14b  │  39 tools
────────────────────────────────────────────────────────────────
```

### 2. User Input Line

**Before**:
```
❯
```

**After**:
```
❯ Type your request...                          [Ctrl+C: exit · /help: commands]
```

### 3. Conversation Turn

**Before** (no visual separation):
```
❯ hello
⏳ Thinking ⠋
🤖 Hello! How can I help you today?

❯ read /etc/hostname
🔧 Calling tool: file_read({"path":"/etc/hostname"})...
   📤 Result: deploy
🤖 The content of the file at `/etc/hostname` is: deploy
```

**After** (clear hierarchy):
```
┌──────────────────────────────────────────────────────────┐
│ ❯ hello                                               │
└──────────────────────────────────────────────────────────┘
  ⏳ Thinking...

┌──────────────────────────────────────────────────────────┐
│ 🤖 Hello! How can I help you today?                     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ❯ read /etc/hostname                                    │
└──────────────────────────────────────────────────────────┘
  🔧 file_read
  ┌────────────────────────────────────────────────────┐
  │ deploy                                              │
  └────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 🤖 The content of the file at `/etc/hostname` is:      │
│                                                     │
│ ```                                                  │
│ deploy                                               │
│ ```                                                  │
└──────────────────────────────────────────────────────────┘
```

### 4. Tool Result Panel

**Before** (raw JSON dump):
```
   📤 Result: [{"name":".git","type":"directory","modified":"2026-04-09T18:00:58.481Z"},...
```

**After** (structured table):
```
   📤 file_list — 44 items in /home/sridhar/code-cli
   ┌─────────┬────────────────────────────┬────────┐
   │ TYPE    │ NAME                      │ SIZE   │
   ├─────────┼────────────────────────────┼────────┤
   │ 📁      │ .git                      │ —      │
   │ 📁      │ src                       │ —      │
   │ 📄      │ package.json              │ 772 B  │
   │ 📄      │ README.md                 │ 14 KB  │
   └─────────┴────────────────────────────┴────────┘
```

### 5. Status Footer

**Before** (nonexistent):
```
```

**After**:
```
   💬 3 messages · ⚡ ~3500 tokens · ⏱ ~12s
   ─────────────────────────────────────────────
   [Ctrl+C: exit · ↑↓: history · Tab: tools]
```

---

## 🔄 User Flow Improvements

### Before vs After

#### Flow 1: Startup
| Before | After |
|--------|-------|
| 8 lines ASCII art | 2 lines compact header |
| 3 lines detection output | 2 lines inline status |
| 8 lines banner box | No box |
| **Total: 19+ lines** | **Total: 4 lines** |

#### Flow 2: Tool Execution
| Before | After |
|--------|-------|
| Raw JSON dump | Structured table |
| 200 char truncation | Expandable view |
| No tool name emphasis | Named badge |
| **Total: unreadable** | **Total: scannable** |

#### Flow 3: Error Recovery
| Before | After |
|--------|-------|
| `❌ Error: ${e}` plain text | Styled error with hint |
| REPL crashes (`ERR_USE_AFTER_CLOSE`) | Graceful recovery, prompt reappears |
| **Total: crashes** | **Total: recoverable** |

---

## 🛠 Implementation Plan

### Phase 1: Core UI Layer (Day 1)
**Goal**: Replace raw readline REPL with structured output

1. **Create `src/ui/colors.ts`** — Centralized ANSI color system
2. **Create `src/ui/format.ts`** — Output formatters (tables, boxes, lists)
3. **Create `src/ui/spinner.ts`** — Non-destructive spinner
4. **Create `src/ui/layout.ts`** — Header, footer, conversation turn components
5. **Integrate into `src/index.ts`** — Replace inline `console.log` calls

### Phase 2: Tool Result Renderer (Day 2)
**Goal**: Make tool output scannable

1. **Create `src/ui/tool-renderer.ts`** — Format tool results by type:
   - `file_list` → table with icons
   - `github_*` → markdown card
   - `searxng_search` → result list with snippets
   - `run_code` → syntax-highlighted output
2. **Add truncation toggle** — `/tools verbose` expands results

### Phase 3: TUI Integration (Day 3)
**Goal**: Wire existing TUI components OR remove dead code

Option A (recommended): Integrate Ink-based TUI as optional mode
```
beast --tui              # Full-screen TUI (Ink)
beast                    # Structured REPL (ANSI, default)
```

Option B: Remove dead TUI code (`ModernUI.tsx`, `App.tsx`, etc.)
- Reduce codebase by 1000+ lines
- Cleaner maintenance

### Phase 4: UX Polish (Day 4)
**Goal**: Improve discoverability and feedback

1. Add inline hints in footer
2. Add keyboard shortcut overlay (`?` key shows shortcuts)
3. Add session stats (messages, tokens, time)
4. Add `/tokens` toggle to hide/show usage

---

## 📸 Proposed ASCII Mockups

### Compact Header
```
╭──────────────────────────────────────────────────────────╮
│ 🐉 Beast CLI  v1.2.4  │  ☁ openrouter  │  qwen3-14b   │
╰──────────────────────────────────────────────────────────╯
```

### Conversation Turn (Minimal)
```
│ ❯ hello, how are you?
│
│ 🤖 I'm doing well! How can I help you today?
│
│ ❯ search for TypeScript tutorials
│
│   🔧 searxng_search: "TypeScript tutorials" (10 results)
│   • TypeScript Official Docs — typescriptlang.org
│   • TypeScript Deep Dive — basarat.gitbook.io
│   • TypeScript Exercises —typescript-exercises.github.io
│
│ 🤖 Here are some great TypeScript resources...
```

### Tool Result (Table Format)
```
│   📤 file_list — /home/sridhar/code-cli (44 items)
│   ┌──────┬─────────────────────────┬──────────────┐
│   │ TYPE │ NAME                   │ MODIFIED     │
│   ├──────┼─────────────────────────┼──────────────┤
│   │ 📁   │ .git                   │ 2h ago       │
│   │ 📁   │ src                    │ 5m ago       │
│   │ 📄   │ package.json            │ 2m ago       │
│   └──────┴─────────────────────────┴──────────────┘
```

### Status Footer
```
│   💬 5  │  ⚡ 3.2K  │  ⏱ 34s  │  🧠 32K ctx
│   ─────────────────────────────────────────────────
│   [Ctrl+C: exit] [↑↓: history] [Tab: switch] [/help]
```

---

## Summary

| Phase | Effort | Impact |
|-------|--------|--------|
| Phase 1: Core UI | 4-6 hours | Reduces startup from 19 to 4 lines |
| Phase 2: Tool Renderer | 3-4 hours | Makes tool output scannable |
| Phase 3: TUI Integration | 2-4 hours | Cleans up dead code or adds TUI mode |
| Phase 4: UX Polish | 2-3 hours | Improves discoverability |

**Total estimated time**: 11-17 hours
**Code reduction potential**: Remove 800+ lines of unused TUI code
**UX improvement**: ~60% reduction in visual noise, ~80% improvement in tool result readability
