# Beast CLI — Bug Tickets

**Date**: 2026-04-11
**Auditor**: Claude Code
**Project**: @simpletoolsindia/beast-cli
**Version**: 1.3.18

---

## BUG-1: Spinner Shows Raw ANSI Escape Codes Instead of Colors

**Severity**: High
**Priority**: P1
**Type**: UX/Display Bug
**Status**: Confirmed

### Description

When running `beast --defaults` in non-TTY or color-limited environments, the spinner progress bar displays raw ANSI escape codes instead of properly rendered colors.

### Reproduction Steps

```bash
cd /home/sridhar/code-cli
bun run bin/beast --defaults
# OR
bun run bin/beast --help
```

### Expected Behavior

Progress bar should show colored output:
```
Thinking ◐ task-name ████████░░░░░░░░░░░░░░░░ 1ms
```

### Actual Behavior

Progress bar shows raw ANSI codes:
```
Thinking ◐  [38;2;30;160;80m▓[38;2;140;138;130m░░░░░░░░░░░[0m 1ms
```

### Root Cause

**Location**: `src/index.ts:134-141`

```typescript
function formatProgressBar(filled: number, width = 12): string {
  const total = width * 4
  const f = Math.round((filled / 100) * total)
  const bar = fg.success + '█'.repeat(Math.floor(f / 4)) +   // ← RAW ANSI
    (f % 4 > 0 ? ['░', '▒', '▓', '█'][f % 4] : '') +
    fg.muted + '░'.repeat(width - Math.ceil(f / 4))           // ← RAW ANSI
  return bar + reset
}
```

**Problem**: The `formatProgressBar()` function directly concatenates ANSI escape codes (`fg.success`, `fg.muted`) without checking `isColorEnabled()`. These are 24-bit RGB color codes:
- `fg.success` = `\x1b[38;2;30;160;80m` (RGB green)
- `fg.muted` = `\x1b[38;2;140;138;130m` (RGB gray)

When `isColorEnabled()` returns `false` (non-TTY), these codes should not be emitted.

### Affected Code Paths

1. `src/index.ts:134-141` - `formatProgressBar()` function
2. `src/index.ts:143-149` - `writeSpinnerFrame()` calls `formatProgressBar()`

### Impact

- **User Experience**: Unreadable/messy output in CI environments, IDE terminals, and remote shells
- **Professionalism**: Makes the CLI look broken when used in automated pipelines
- **Accessibility**: Raw ANSI codes may cause screen readers to malfunction

### Recommended Fix

Modify `formatProgressBar()` to respect color settings:

```typescript
function formatProgressBar(filled: number, width = 12): string {
  if (!isColorEnabled()) {
    const barLen = Math.round((filled / 100) * width)
    return '█'.repeat(barLen) + '░'.repeat(width - barLen)
  }
  const total = width * 4
  const f = Math.round((filled / 100) * total)
  const bar = fg.success + '█'.repeat(Math.floor(f / 4)) +
    (f % 4 > 0 ? ['░', '▒', '▓', '█'][f % 4] : '') +
    fg.muted + '░'.repeat(width - Math.ceil(f / 4))
  return bar + reset
}
```

### Fix Verification

After fix, run:
```bash
bun run bin/beast --defaults
# Should show clean ASCII progress bar: ▓▓▓▓░░░░░░░░░░░░░░░░░░ 1ms
```

---

## BUG-2: TUI Mode Fails with Unclear Error Message

**Severity**: Medium
**Priority**: P2
**Type**: UX/Error Handling
**Status**: Confirmed

### Description

When running `beast --tui` in a non-TTY environment (which is expected for CI/CD, automated scripts, or headless systems), the CLI exits with an error message that doesn't provide actionable guidance.

### Reproduction Steps

```bash
cd /home/sridhar/code-cli
bun run bin/beast --tui
# Exit code: 1
```

### Expected Behavior

Error message should clearly explain:
1. Why the TUI cannot run
2. What alternative modes are available
3. How to use them

### Actual Behavior

```
Ink TUI requires a real terminal (TTY). Use --defaults for REPL mode instead.
```

While this message is helpful, it could be improved to:
- List specific alternative commands
- Explain *why* a TTY is needed
- Provide quick-start commands

### Root Cause

**Location**: `src/ui/ink/index.tsx:182-185`

```tsx
if (!process.stdin.isTTY) {
  console.error('Ink TUI requires a real terminal (TTY). Use --defaults for REPL mode instead.')
  process.exit(1)
}
```

### Impact

- **User Experience**: Users in non-interactive environments (SSH, CI/CD, scripts) get an abrupt exit
- **Discoverability**: Alternative modes are not clearly communicated

### Recommended Fix

Improve the error message with more context and alternatives:

```tsx
if (!process.stdin.isTTY) {
  console.error('')
  console.error('  \x1b[31m✗\x1b[0m  Ink TUI cannot run in non-interactive mode')
  console.error('')
  console.error('  Available alternatives:')
  console.error('    \x1b[36mbeast --defaults\x1b[0m     - REPL mode with AI chat (recommended)')
  console.error('    \x1b[36mbeast\x1b[0m                 - Interactive REPL mode')
  console.error('    \x1b[36mbeast --help\x1b[0m         - Show all commands')
  console.error('')
  console.error('  Note: TUI requires a real terminal (TTY). Use SSH with -t flag or run locally.')
  console.error('')
  process.exit(1)
}
```

### Fix Verification

After fix, run:
```bash
bun run bin/beast --tui 2>&1 | head -20
# Should show enhanced error with alternatives
```

---

## BUG-3: No Fallback UI for Headless/Non-Interactive Environments

**Severity**: Medium
**Priority**: P2
**Type**: UX/Feature Gap
**Status**: Confirmed

### Description

The Beast CLI lacks a proper fallback experience for headless environments, CI/CD pipelines, and non-interactive shells. While REPL mode exists, there's no streamlined way to use it programmatically or in automated contexts.

### Reproduction Steps

1. CI/CD Pipeline:
```bash
echo "Summarize this file" | bun run bin/beast
# Spinner shows raw ANSI codes
```

2. Scripted Usage:
```bash
bun run bin/beast --model qwen/qwen3.6-plus --provider openrouter <<EOF
What is 2+2?
EOF
# No structured output mode available
```

3. SSH without -t flag:
```bash
ssh server "bun run bin/beast --defaults"
# TTY check fails with unhelpful error
```

### Expected Behavior

The CLI should gracefully handle non-interactive scenarios with:
1. **Structured Output Mode**: `--json` or `--output-format` flag for programmatic use
2. **Batch Mode**: Process multiple prompts from files/stdin
3. **Quiet Mode**: Suppress spinners and progress indicators (`--quiet` or `--no-progress`)
4. **Color Control**: Explicit `--color=auto|always|never` option

### Root Cause

**Location**: Multiple files
- `src/index.ts` - No `--json` or `--quiet` flags
- `src/ui/spinner.ts` - No explicit color/TTY checks
- `src/ui/fun-animations.ts` - `FunSpinner` checks `isColorEnabled()` but progress bar doesn't

### Impact

- **CI/CD Integration**: Hard to integrate into automated pipelines
- **Scripting**: Cannot use Beast CLI in shell scripts without workarounds
- **Remote Execution**: Limited utility over SSH without TTY

### Recommended Fixes

#### Fix 1: Add `--quiet` Flag

Modify `src/index.ts` to add CLI option:

```typescript
interface CLIOptions {
  // ... existing options
  quiet?: boolean    // Suppress progress indicators
}
```

And update spinner functions to check `isColorEnabled()` or `options.quiet`.

#### Fix 2: Add `--json` Output Mode

Add a mode that outputs responses as JSON:

```typescript
// New flag
interface CLIOptions {
  json?: boolean     // Output as JSON
}

// Output format
interface Response {
  role: 'assistant'
  content: string
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}
```

#### Fix 3: Fix Progress Bar Color Handling

Update `formatProgressBar()` in `src/index.ts` to check `isColorEnabled()` (see BUG-1 fix).

### Fix Verification

After fixes:
```bash
# Should work in CI without ANSI codes
bun run bin/beast --quiet --defaults --provider openrouter --model qwen/qwen3.6-plus <<< "Hello"

# Should output structured JSON
echo '{"prompt": "What is 2+2?"}' | bun run bin/beast --json
```

---

## Additional Findings

### Finding 1: Duplicate Import in index.ts

**Location**: `src/index.ts:19-22`

```typescript
import { quickApproval, getOldContent } from './approval/index.ts'
import { generateDiff, formatDiffStats } from './diff/index.ts'
import { quickApproval, getOldContent, type ApprovalResult } from './approval/index.ts'  // DUPLICATE
import { generateDiff, formatDiffStats } from './diff/index.ts'  // DUPLICATE
```

**Severity**: Low (doesn't cause runtime errors but creates confusion)

### Finding 2: TUI Audit Identifies Multiple Unwired Systems

The `TUI_AUDIT_2026-04-11.md` documents several P0 gaps:

1. **Permission System Not Wired**: `PermissionServiceImpl` is defined but never called
2. **Diff Generation Not Wired**: `generateDiff()` exists but not used before file writes
3. **Editor Review Not Integrated**: `reviewPatch()` is unused

**Recommendation**: These should be prioritized for Phase 5 (as noted in audit).

---

## Summary Table

| Bug ID | Title | Severity | Priority | Status |
|--------|-------|----------|----------|--------|
| BUG-1 | Spinner shows raw ANSI codes | High | P1 | Confirmed |
| BUG-2 | TUI mode unclear error | Medium | P2 | Confirmed |
| BUG-3 | No fallback for headless envs | Medium | P2 | Confirmed |
| FIND-1 | Duplicate imports | Low | P3 | Minor |

---

## Files Modified for This Audit

- `src/index.ts` - Spinner progress bar, duplicate imports
- `src/ui/ink/index.tsx` - TTY check error message
- `src/ui/format.ts` - Progress bar utilities (reference)
- `src/ui/fun-animations.ts` - FunSpinner class (reference)
- `src/ui/colors.ts` - Color system (reference)
- `.planning/reports/BUG-TICKETS-2026-04-11.md` - This file
