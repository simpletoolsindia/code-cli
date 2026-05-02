# BeastCLI TUI Code Quality Review

**Date:** 2026-05-02
**Scope:** `/packages/beastcli/src/cli/cmd/tui/`
**Type:** Research Only - No Edits Made

---

## Executive Summary

The BeastCLI TUI codebase is well-structured overall but has several critical areas requiring attention. The most pressing issues are:

1. **Type Safety** - Proliferation of `any` types undermines TypeScript benefits
2. **Error Handling** - Silent error swallowing hides failures from users
3. **Testing** - Zero test coverage in entire TUI codebase
4. **Performance** - Large files with potential re-render cascades

---

## Critical Issues (Highest Priority)

### 1. Type Safety - `any` Type Proliferation

| File | Line | Issue |
|------|------|-------|
| `context/kv.tsx` | 14 | `Record<string, any>` for KV store |
| `context/kv.tsx` | 61-64 | `get/set` methods use untyped `any` |
| `context/editor.ts` | 368 | `JSON.parse` result cast to `unknown`, then bypassed |
| `context/editor.ts` | 413 | `as any` to force WebSocket headers |
| `context/editor-zed.ts` | 276 | `JSON.parse(value) as unknown` - no validation |
| `component/prompt/frecency.tsx` | 29 | Unvalidated JSON parse to typed object |
| `component/prompt/history.tsx` | 41 | `JSON.parse(line)` with no type safety |
| `component/prompt/stash.tsx` | 29 | `JSON.parse(line)` without validation |
| `context/local.tsx` | 149 | `Filesystem.readJson(filePath).then((x: any)` - untyped |

### 2. Error Handling - Silent Failures

| File | Line | Code Pattern |
|------|------|-------------|
| `context/editor.ts` | 165-167 | Empty `catch {}` - silently ignores Zed selection errors |
| `component/prompt/frecency.tsx` | 72 | `appendFile(...).catch(() => {})` |
| `component/prompt/history.tsx` | 104 | `appendFile(...).catch(() => {})` |
| `context/sdk.tsx` | 91 | `.catch(() => {})` - ignores workspace sync errors |
| `context/sdk.tsx` | 108 | `.catch(() => {})` - ignores SSE errors |
| `context/sdk.tsx` | 119 | `.catch(() => {})` - ignores workspace sync errors |
| `context/editor.ts` | 419-423 | `parseMessage` swallows JSON parse errors |

### 3. Security - Potential Code Injection

| File | Line | Issue |
|------|------|-------|
| `util/sound.ts` | 43 | PowerShell command with user-controlled path - single-quote doubling could be bypassed |
| `routes/session/permission.tsx` | 24-40 | Path normalization without sanitization for display |
| `context/editor.ts` | 133 | `socket.send(JSON.stringify(...))` - potential JSON injection if payload not validated |

---

## High Priority Issues

### 4. Performance - Large Files (>500 lines)

| File | Lines | Concern |
|------|-------|---------|
| `routes/session/index.tsx` | 2271 | 600+ memos - potential re-render cascade |
| `context/theme.tsx` | 1243 | Theme resolution could benefit from memoization |
| `plugin/runtime.ts` | 1030 | Complex plugin lifecycle state |
| `component/prompt/index.tsx` | 1477 | Many event handlers, large component |
| `component/dialog-provider.tsx` | 364 | OAuth flows complexity |
| `ui/dialog-select.tsx` | 448 | Many options with filtering |
| `routes/session/question.tsx` | 468 | Question handling logic |
| `ui/spinner.ts` | 368 | Spinner utilities |
| `routes/session/permission.tsx` | 682 | Permission prompts |

### 5. Performance - Unnecessary Re-renders

| File | Lines | Issue |
|------|-------|-------|
| `component/prompt/autocomplete.tsx` | 100-113 | 50ms interval polling without cleanup dependency array |
| `component/prompt/autocomplete.tsx` | 142-147 | Two separate `createEffect` hooks for filter/search |
| `routes/session/index.tsx` | 129-154 | Many `createMemo` calls without proper dependency tracking |
| `context/sync.tsx` | 39-107 | Large store with wide updates |

### 6. Memory Leaks - Missing Cleanup

| File | Lines | Issue |
|------|-------|-------|
| `component/prompt/autocomplete.tsx` | 100-113 | Interval created in `createEffect` without proper cleanup |

---

## Medium Priority Issues

### 7. Error Handling - Missing Error Propagation

| File | Line | Issue |
|------|------|-------|
| `plugin/runtime.ts` | 178-186 | Theme save errors only log warning, not propagated |
| `context/sdk.tsx` | 74-108 | SSE failures silently retried without user notification |
| `component/dialog-provider.tsx` | 102-108 | OAuth errors stringified but no structured handling |

### 8. Testing Gaps

**Critical finding: 0 test files in entire TUI codebase**

No coverage for:
- Theme resolution logic (`resolveTheme`)
- Permission prompt logic
- KV store operations
- Editor context/socket management
- Plugin runtime lifecycle

### 9. Code Smells - Magic Numbers

| File | Line | Value | Should Be |
|------|------|-------|-----------|
| `routes/session/index.tsx` | 97 | `86_400_000` | `24 * 60 * 60 * 1000` or `ONE_DAY_MS` |
| `context/sdk.tsx` | 43-44 | `1000`, `30000` | `retryDelay`, `maxRetryDelay` |
| `context/sdk.tsx` | 67 | `16` | `FLUSH_THRESHOLD_MS` |
| `routes/session/index.tsx` | 130 | `30 * 24 * 60 * 60 * 1000` | `THIRTY_DAYS_MS` |
| `util/sound.ts` | 53 | `0.35` | `DEFAULT_VOLUME` |

### 10. Code Smells - Duplicated Code

| Files | Issue |
|-------|-------|
| `frecency.tsx:72`, `history.tsx:104` | Identical `appendFile().catch(() => {})` pattern |
| `theme.tsx:6-38` | 33+ theme imports could be auto-generated |

---

## Low Priority Issues

### 11. Keyboard Navigation
- Most dialogs use `onMouseUp`, keyboard handlers scattered
- `dialog-provider.tsx:168-175` only handles 'c' key
- No comprehensive keyboard navigation documentation

### 12. Documentation - Missing Comments
- `context/editor.ts:406-414` - Complex WebSocket logic without explanation
- `context/sdk.tsx:46-72` - Event queuing logic unclear
- `plugin/runtime.ts:109-129` - `runCleanup` function logic unclear

### 13. Code Organization
- `app.tsx:139-200` - 12-level provider nesting
- Tight coupling via context providers

### 14. Potential Race Conditions
- `context/sdk.tsx:74-108` - SSE reconnect race between `abort.signal` and `ctrl.signal`
- `context/editor.ts:253-271` - `reconnectWithDirectory` could race with `connect()`

---

## Summary by Category

| Category | Critical | High | Medium | Low |
|----------|:--------:|:----:|:------:|:---:|
| Type Safety | 10 | 5 | 2 | 0 |
| Error Handling | 7 | 4 | 3 | 0 |
| Performance | 0 | 5 | 3 | 2 |
| Security | 3 | 2 | 1 | 0 |
| Testing | 0 | 1 | 0 | 0 |
| Code Smells | 4 | 6 | 5 | 3 |

---

## Recommended Actions (Priority Order)

### Immediate (Fix Before Release)

1. **Replace all `any` types** - Create proper TypeScript interfaces
2. **Fix silent error swallowing** - Log errors or notify users
3. **Sanitize PowerShell commands** in `sound.ts`

### Short Term (Next Sprint)

4. **Add unit tests** for critical paths
5. **Memoize large components** in `routes/session/index.tsx`
6. **Document complex state machines** (editor WebSocket, SDK SSE)
7. **Fix memory leak** in autocomplete position tracking
8. **Extract magic numbers** into named constants

### Medium Term (Future)

9. **Refactor large files** - Break up `session/index.tsx` (2271 lines)
10. **Add integration tests** for user flows
11. **Create theme auto-generation** script
12. **Add accessibility labels** for screen readers

---

## What's Working Well

- Solid architecture with proper context separation
- Good use of Effect framework for DI
- Clean plugin system architecture
- Comprehensive keyboard shortcut system
- Theme system with 30+ themes
- Good use of `createMemo` for expensive computations

---

## Related Files for Implementation

| Issue | Primary Files to Review |
|-------|------------------------|
| Type Safety | `kv.tsx`, `local.tsx`, `editor.ts`, `*history.tsx` |
| Error Handling | `sdk.tsx`, `editor.ts`, `*history.tsx` |
| Security | `sound.ts` |
| Performance | `session/index.tsx`, `sync.tsx`, `autocomplete.tsx` |
| Testing | Entire TUI codebase (add test files) |
| Magic Numbers | Multiple files - extract to constants |
