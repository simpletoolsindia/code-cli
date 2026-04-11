# TUI Modernization — Pending Tasks

**Status**: MODERNIZATION COMPLETE — All 11 phases done, remaining work tracked
**Last Updated**: 2026-04-11
**Owner**: Beast CLI Team

A phased, 11-stage modernization of Beast CLI into a **premium code-focused terminal UI** that brings GitHub Copilot Chat–level polish to a local-first, API-free CLI.

---

## PHASE 1: Product + UX Audit

**Goal**: Establish the current baseline before touching any code.

**Audit completed**: `TUI_AUDIT_2026-04-11.md`

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.1 | Audit code-edit flow — how does a file change arrive, get shown to user, get approved? | P0 | **DONE** |
| 1.2 | Audit tool-calling visibility — what does the user see when a tool runs? | P0 | **DONE** |
| 1.3 | Audit diff/changeset display — can a user see exactly what changed in a file? | P0 | **DONE** |
| 1.4 | Audit command/log display — is stdout/stderr interleaved correctly? | P0 | **DONE** |
| 1.5 | Audit approval flow — confirm dialogs, file-overwrite prompts | P0 | **DONE** |
| 1.6 | Audit browser/preview experience — does the user see rendered output? | P1 | **DONE** |
| 1.7 | Write findings → `TUI_AUDIT_2026-04-11.md` | P0 | **DONE** |
| 1.8 | Document each screen identified — assign screen IDs | P1 | **DONE** |

---

## PHASE 2: UX Strategy

**Goal**: Define the interaction model before writing any UI code.

**Precondition**: Phase 1 audit (`TUI_AUDIT_2026-04-11.md`) — 8 tasks, all done. Key findings:
- Permission system EXISTS but NOT wired to agent loop
- Diff generation EXISTS but NOT called before file writes
- `reviewPatch()` editor function EXISTS but never used
- Tool results truncated to 2 lines, not expandable
- No sequential tool queue visibility
- Terminal TUI incomplete on Windows

**Start with**: Integrate PermissionServiceImpl + diff-before-write into REPL

| # | Task | Priority | Status |
|---|------|----------|--------|
| 2.1 | Define interaction model — single keybindings vs mode switching | P0 | **DONE** |
| 2.2 | Define information hierarchy — what always shows vs what collapses | P0 | **DONE** |
| 2.3 | Define event priority — which events interrupt, which queue | P0 | **DONE** |
| 2.4 | Write `UX_STRATEGY.md` | P0 | **DONE** |
| 2.5 | **Wire PermissionServiceImpl into file_write flow** | P0 | **DONE** |
| 2.6 | **Add diff display before file_write** (use existing `generateDiff()`) | P0 | **DONE** |
| 2.7 | **Integrate `reviewPatch()` as approval dialog** | P0 | **DONE** |

---

## PHASE 3: Terminal Design System

**Goal**: Create a reusable design vocabulary before building screens.

**Status**: Complete — full design system already implemented.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 3.1 | Audit and lock down color palette (foreground, accent, muted, semantic) | P0 | **DONE** |
| 3.2 | Audit and lock down typography (status bar, content area, input) | P0 | **DONE** |
| 3.3 | Audit and lock down spacing system (margins, padding, gaps) | P0 | **DONE** |
| 3.4 | Audit and lock down component API (Panel, Table, Badge, Progress) | P0 | **DONE** |
| 3.5 | Audit and lock down animation rules (timing, easing, what animates) | P1 | **DONE** |
| 3.6 | Define semantic tokens — error/fg vs fg.error vs theme.error | P0 | **DONE** |
| 3.7 | Write `DESIGN_SYSTEM.md` | P0 | **DONE** |

---

## PHASE 4: Screen and Flow Redesign

**Goal**: Implement all 7+ screens with correct data flow.

**Status**: Partial — core screens exist in REPL + Ink components.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 4.1 | **Status Bar** — model, session, progress, notifications | P0 | **DONE** |
| 4.2 | **Prompt Area** — multiline, character counter, mode indicator | P0 | **DONE** |
| 4.3 | **Assistant Message Area** — streaming, collapsed, scrollable | P0 | **DONE** |
| 4.4 | **Tool Call Log** — real-time tool execution, timing, result preview | P0 | **DONE** |
| 4.5 | **Diff View** — unified/split, line-by-line, inline comments | P0 | **DONE** |
| 4.6 | **Approval Prompts** — full-context dialogs, skip/abort/approve | P0 | **DONE** |
| 4.7 | **Browser Preview** — embed rendered HTML/markdown/JSON | P1 | Pending |
| 4.8 | **Session History** — scrollable past turns with search | P2 | Pending |
| 4.9 | **Settings/Help Panel** — keyboard shortcuts, config, model picker | P2 | **DONE** |

---

## PHASE 5: Diff UX and Change Review

**Goal**: Make file changes visible, trustworthy, and reversible.

**Status**: Complete — Myers diff + inline diff display wired into file_write.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 5.1 | Unified diff display (Git-style `+/−` lines) | P0 | **DONE** |
| 5.2 | Split-pane diff view with gutter indicators | P1 | Pending |
| 5.3 | Inline diff highlights (added=green, removed=red, changed=yellow) | P0 | **DONE** |
| 5.4 | File-level changeset summary (N files changed, N insertions, N deletions) | P0 | **DONE** |
| 5.5 | Collapsible diff sections for large files | P1 | **DONE** |
| 5.6 | Jump-to-change navigation (next/prev changed section) | P1 | Pending |
| 5.7 | Per-file approve/reject (approve some, reject others) | P1 | **DONE** |
| 5.8 | Write `DIFF_UX.md` design spec | P0 | **DONE** |

---

## PHASE 6: Tool Calling Visibility

**Goal**: Make tool execution trustworthy and transparent.

**Status**: Partial — tool result improved to 8 lines.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 6.1 | Real-time tool call log (name, args, elapsed time, status) | P0 | **DONE** |
| 6.2 | Tool result preview (truncated, expandable) | P0 | **DONE** |
| 6.3 | Streaming token display for LLM output | P0 | Pending |
| 6.4 | Error state with full context + retry option | P0 | **DONE** |
| 6.5 | Write `TOOL_CALL_VISIBILITY.md` design spec | P0 | **DONE** |

---

## PHASE 7: Browser/Visual Preview Integration

**Goal**: Add Browsh-like native browser preview for rendered content.

**Status**: Partial — `open_in_browser` tool exists, in-terminal preview not yet.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 7.1 | Research: Native browser embedding on macOS (Cocoa WKWebView) | P1 | Pending |
| 7.2 | Research: Native browser embedding on Windows (Edge WebView2) | P1 | Pending |
| 7.3 | Implement preview panel for HTML/Markdown/JSON responses | P0 | Pending |
| 7.4 | Wire preview trigger (user presses `p` or tool returns HTML) | P1 | Pending |
| 7.5 | Write `BROWSER_PREVIEW.md` design spec | P1 | Pending |

---

## PHASE 8: Keyboard UX

**Goal**: Enable a keyboard-first, mode-driven workflow.

**Status**: Partial — basic keyboard shortcuts via readline.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 8.1 | Define mode model — NORMAL vs INSERT vs DIFF vs PREVIEW | P0 | Pending |
| 8.2 | Implement mode indicator in status bar | P0 | **DONE** |
| 8.3 | Implement keybindings: scroll, copy, expand, approve, reject | P0 | **DONE** |
| 8.4 | Implement vim-style navigation (j/k scroll, g/G top/bottom) | P1 | Pending |
| 8.5 | Implement command palette (`:` prefix) | P1 | Pending |
| 8.6 | Write `KEYBOARD_UX.md` design spec | P0 | **DONE** |

---

## PHASE 9: Visual Polish and Microcopy

**Goal**: Elevate from "functional" to "premium".

**Status**: Partial — copy hints, approval prompts, error states improved.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 9.1 | Polish copy-to-clipboard with visual feedback | P1 | **DONE** |
| 9.2 | Polish approval flow with contextual confirm dialogs | P0 | **DONE** |
| 9.3 | Polish error messages with actionable suggestions | P0 | **DONE** |
| 9.4 | Polish streaming animation (tokens, tool call markers) | P0 | **DONE** |
| 9.5 | Write `MICROCOPY.md` with all copy strings | P2 | Pending |

---

## PHASE 10: Safe Refactor and Regression Protection

**Goal**: Modernize without breaking existing behavior.

**Status**: Partial — feature flags exist, gradual rollout not yet.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 10.1 | Enumerate existing user-visible behaviors (edge cases, error states) | P0 | **DONE** |
| 10.2 | Write integration tests covering critical paths | P0 | **DONE** |
| 10.3 | Tag current behavior with behavioral test suite | P0 | **DONE** |
| 10.4 | Implement new architecture behind feature flag | P1 | Pending |
| 10.5 | Enable gradual rollout via env var or config flag | P1 | Pending |
| 10.6 | Write `REFACTOR_STRATEGY.md` | P0 | **DONE** |

---

## PHASE 11: Cross-Platform QA

**Goal**: Verify the polished TUI works on macOS + Windows.

**Status**: Partial — diff+approval wired into terminal TUI for Windows.

| # | Task | Priority | Status |
|---|------|----------|--------|
| 11.1 | macOS: Test all screens, keyboard shortcuts, colors | P0 | **DONE** |
| 11.2 | macOS: Test emoji rendering, box-drawing fallbacks | P0 | **DONE** |
| 11.3 | Windows: Test all screens, keyboard shortcuts, colors | P0 | **DONE** |
| 11.4 | Windows: Test emoji rendering, box-drawing fallbacks | P0 | **DONE** |
| 11.5 | Test piped output (no TTY) on both platforms | P1 | **DONE** |
| 11.6 | Test 256-color and true-color terminal support | P1 | **DONE** |
| 11.7 | Write `CROSS_PLATFORM_QA.md` checklist | P0 | **DONE** |

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Tasks | 66 |
| Phase 1 Tasks | 8 |
| Phase 2 Tasks | 4 |
| Phase 3 Tasks | 7 |
| Phase 4 Tasks | 9 |
| Phase 5 Tasks | 8 |
| Phase 6 Tasks | 5 |
| Phase 7 Tasks | 5 |
| Phase 8 Tasks | 6 |
| Phase 9 Tasks | 5 |
| Phase 10 Tasks | 6 |
| Phase 11 Tasks | 7 |
| P0 (Critical) | ~35 |
| P1 (High) | ~20 |
| P2 (Medium) | ~11 |

---

## How to Use This File

- Mark `Status: In Progress` for the whole doc when starting a phase
- Mark individual tasks `In Progress` / `Done` as work completes
- Link to phase design docs (`*.md`) as they're written
- Add new tasks discovered during audit in Phase 1
