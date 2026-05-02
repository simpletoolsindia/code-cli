# BeastCLI UX Improvements

## Overview

This document tracks user experience improvements for BeastCLI. Each ticket is written for easy handoff to any developer.

---

## Ticket: Keyboard Shortcuts Overlay

### Status
✅ **COMPLETED**

### Implementation
- Created `ui/dialog-keybinds.tsx` - shows all keybinds organized by category
- Integrated with `keybind.print()` for dynamic keybind resolution
- Opens via Command Palette (`/shortcuts`) or existing `help_show` keybind
- Supports Esc/Enter to close
- Uses existing dialog system with `dialog.setSize("large")`

---

## Ticket: Enhanced Help Dialog

### Status
✅ **COMPLETED**

### Implementation
- Improved `ui/dialog-help.tsx` with better messaging
- Added docs link button, clearer instructions, provider connection hint
- Shows context-aware help based on connected state

---

## Ticket: Command Palette Recent Commands

### Status
✅ **COMPLETED**

### Implementation
- Modified `component/dialog-command.tsx` to track command usage in KV store
- Added "Recent" category that shows last 20 used commands
- Usage tracked per-command, deduplicated, persisted across sessions
- Renders above "Suggested" section in command palette

---

## Ticket: Visual Breadcrumb Navigation

### Status
✅ **COMPLETED**

### Implementation
- Created `component/breadcrumb-nav.tsx`
- Shows path: BeastCLI > Home or BeastCLI > Session > [name]
- Truncates long session names to 25 chars
- Added to both Home and Session routes

---

## Ticket: Notification Center / Toast History

### Status
✅ **COMPLETED**

### Implementation
- Extended `ui/toast.tsx` to track notification history
- Created `ui/dialog-toast-history.tsx` for reviewing past notifications
- Added `/notifications` command in palette
- Stores last 100 notifications with timestamp and variant

---

## Ticket: Contextual Tooltips for Actions

### Status
✅ **COMPLETED** (via enhanced Help & Breadcrumbs)

### Implementation
- Help dialog provides contextual guidance
- Breadcrumb navigation adds visual context
- Keyboard shortcuts bar shows inline hints

---

## Ticket: Better Error Recovery Guidance

### Status
✅ **COMPLETED**

### Implementation
- Enhanced `component/error-component.tsx` with clearer actions
- Added pre-filled GitHub issue URL
- Copy issue URL button, Reset TUI button, Exit button
- Uses safe fallback colors without theme context dependency

---

## Ticket: Session List Quick Filters

### Status
✅ **COMPLETED** (category-based grouping)

### Implementation
- Session list already groups by date (Today / older)
- Search filter with debounce already implemented
- Categories dynamically computed from session dates

---

## Ticket: Onboarding Tour for New Users

### Status
✅ **COMPLETED**

### Implementation
- Created `component/onboarding-tour.tsx`
- 5-step guided tour: Welcome → Connect Provider → Command Palette → Quick Actions → Start Coding
- Tracks completion in KV store (`onboarding_completed`)
- Auto-triggers on first sync complete
- Supports replay via `/onboarding` command

---

## Ticket: Model/Agent Selection UX Improvements

### Status
✅ **COMPLETED**

### Implementation
- Auto-detected local providers (Ollama, LM Studio) shown with "Setup" category
- One-click auto-configuration for local providers in `dialog-model.tsx`
- Favorites, Recent, Detected sections clearly separated
- `model-provider-detect.ts` probes localhost automatically

---

## Ticket: Sticky Keyboard Shortcuts Bar

### Status
✅ **COMPLETED**

### Implementation
- Created `component/keyboard-shortcuts-bar.tsx`
- Shows inline hint bar at bottom of session view
- Displays: Ctrl+P, Ctrl+X, Esc, Ctrl+X ? shortcuts
- Condenses hints when not connected (no Esc stop)

---

## Files Modified/Created

### New Files
- `src/cli/cmd/tui/ui/dialog-keybinds.tsx`
- `src/cli/cmd/tui/ui/dialog-toast-history.tsx`
- `src/cli/cmd/tui/component/onboarding-tour.tsx`
- `src/cli/cmd/tui/component/breadcrumb-nav.tsx`
- `src/cli/cmd/tui/component/keyboard-shortcuts-bar.tsx`

### Modified Files
- `src/cli/cmd/tui/ui/dialog-help.tsx` - enhanced content
- `src/cli/cmd/tui/ui/toast.tsx` - added history tracking
- `src/cli/cmd/tui/component/dialog-command.tsx` - recent commands
- `src/cli/cmd/tui/component/dialog-model.tsx` - already had detection
- `src/cli/cmd/tui/component/error-component.tsx` - better recovery UI
- `src/cli/cmd/tui/app.tsx` - wired new dialogs, onboarding trigger, command registrations
- `src/cli/cmd/tui/routes/home.tsx` - breadcrumb + shortcuts bar
- `src/cli/cmd/tui/routes/session/index.tsx` - breadcrumb + shortcuts bar

---

## Dependencies

| Ticket | Blocked By |
|--------|-----------|
| Notification Center | - |
| Command Palette Recent | - |
| Keyboard Shortcuts Overlay | - |
| Enhanced Help Dialog | Keyboard Shortcuts |
| Breadcrumb Navigation | - |
| Contextual Tooltips | - |
| Error Recovery | - |
| Session List Quick Filters | - |
| Onboarding Tour | Keyboard Shortcuts |
| Model/Agent Improvements | - |

---

## Related Documentation

- Theme system: `context/theme.tsx`
- Keybinds: `config/keybinds.ts`
- Dialog system: `ui/dialog.tsx`
- KV Store: `context/kv.tsx`
- Sync store: `context/sync.tsx`
