# BeastCLI UX Improvement Analysis

**Date:** 2026-05-02
**Scope:** Model Selection, Provider Switching, Navigation, Error States, Accessibility

---

## 1. Model Selection UI

### Current Implementation
- `dialog-model.tsx` (lines 17-286)
- `dialog-provider.tsx` (lines 1-539)

### Issues Found

#### P1: Dialog Chaining Without Back Navigation (HIGH PRIORITY)
- **Location:** `dialog-model.tsx:267-268`, `dialog-provider.tsx:327`
- **Issue:** User cannot navigate back from provider list to model list. Must close and reopen.
- **Fix:** Add inline provider expansion within model dialog, or add back navigation state.

#### P2: Provider Model Count Missing (MEDIUM)
- **Location:** `dialog-provider.tsx:46-170` - `createDialogProviderOptions()`
- **Issue:** Provider list doesn't show how many models each provider has.
- **Fix:** Add model count: `Anthropic (12 models)` in provider selection.

#### P3: Loading States Inconsistent (MEDIUM)
- **Location:** `dialog-provider.tsx:182-184`, `dialog-model.tsx:34-36`
- **Issue:** Local provider detection (`probeLocalModelProviders()`) has no loading indicator while scanning.
- **Fix:** Add "Detecting local providers..." spinner before results.

#### P4: No Quick Model Switcher (MEDIUM)
- **Location:** `app.tsx:429-564` (command registrations)
- **Issue:** Users must open model dialog to switch models - no quick overlay.
- **Fix:** Add Ctrl+Shift+M for quick switcher showing recent 10 models.

#### P5: Custom Provider Setup Error Handling (MEDIUM)
- **Location:** `dialog-provider.tsx:268-323`
- **Issue:** No validation feedback on custom provider setup failures. Errors only show via toast.
- **Fix:** Add inline error display with retry option.

---

## 2. Provider Switching Experience

### Current Implementation
- `dialog-provider.tsx` (lines 173-328)

### Issues Found

#### P6: Auth Method Selection Confusing (HIGH)
- **Location:** `dialog-provider.tsx:89-107`
- **Issue:** When multiple auth methods exist, user sees numeric options without descriptions.
- **Code:**
```typescript
options={methods.map((x, index) => ({
  title: x.label,  // Only label shown
  value: index,
}))}
```
- **Fix:** Show method descriptions and icons (key icon for API key, browser icon for OAuth).

#### P7: OAuth Flow Unclear Progress (MEDIUM)
- **Location:** `dialog-provider.tsx:336-386` (`AutoMethod`)
- **Issue:** "Waiting for authorization..." with no progress indication or timeout.
- **Fix:** Add timeout warning at 60s and cancel option.

#### P8: API Key Input No Visibility Toggle (MEDIUM)
- **Location:** `dialog-provider.tsx:444-487` (`ApiMethod`)
- **Issue:** API key input is masked but no show/hide toggle for verification.
- **Fix:** Add "reveal" button for users to verify key before submitting.

---

## 3. Navigation Patterns

### Current Implementation
- `app.tsx` (lines 427-910 - command registrations)
- `dialog-command.tsx` (lines 1-206)

### Issues Found

#### P9: Command Palette Search Missing Fuzzy Match Highlighting (MEDIUM)
- **Location:** `dialog-select.tsx:94-99`
- **Issue:** Fuzzy search works but matched characters aren't visually highlighted.
- **Code:**
```typescript
const result = fuzzysort
  .go(needle, options, {
    keys: ["title", "category"],
    scoreFn: (r) => r[0].score * 2 + r[1].score,
  })
  .map((x) => x.obj)
```
- **Fix:** Use `fuzzysort.prepare()` with highlight rendering.

#### P10: No Breadcrumb Click Navigation (LOW)
- **Location:** `breadcrumb-nav.tsx` (lines 1-50+)
- **Issue:** Breadcrumb shows path but isn't clickable to navigate back.
- **Fix:** Make each segment clickable for navigation.

#### P11: Session List Missing Quick Preview (MEDIUM)
- **Location:** `dialog-session-list.tsx`
- **Issue:** Session list shows titles but no preview of last message.
- **Fix:** Add truncated last assistant message as secondary line.

---

## 4. Error States and Feedback

### Current Implementation
- `error-component.tsx` (lines 1-100+)
- `toast.tsx`

### Issues Found

#### P12: Error Component Missing Copy Error Details (MEDIUM)
- **Location:** `error-component.tsx`
- **Issue:** Error message shown but not easily copyable for bug reports.
- **Fix:** Add "Copy error" button with full stack trace.

#### P13: Toast Notifications Missing Action Buttons (MEDIUM)
- **Location:** `toast.tsx`
- **Issue:** Error toasts have no "Retry" or "View Details" action.
- **Fix:** Add optional action button to toast variants.

#### P14: Connection Error Retry UX Unclear (HIGH)
- **Location:** `app.tsx:239-284` (`ConnectionError`)
- **Issue:** Server unreachable shows countdown but retry is automatic. User doesn't know what to do.
- **Code:**
```typescript
const timer = setInterval(() => props.onRetry?.(), 1000)
// No indication to user that retry is happening
```
- **Fix:** Show "Retrying..." with attempt count and manual "Try Now" button.

---

## 5. Accessibility Considerations

### Current Implementation
- `keyboard-shortcuts-bar.tsx` (lines 1-50+)

### Issues Found

#### P15: Screen Reader No ARIA Labels on Interactive Elements (MEDIUM)
- **Location:** Multiple dialog components using `box` with `onMouseUp`
- **Issue:** Custom TUI components lack accessibility labels.
- **Fix:** Add `aria-label` to all interactive `box` elements.

#### P16: Focus Management After Dialog Close (MEDIUM)
- **Location:** `dialog.tsx`
- **Issue:** After closing dialog, focus may not return to previous focusable element.
- **Fix:** Track and restore focus on dialog close.

#### P17: Color Contrast in Theme Variables (LOW)
- **Location:** `context/theme.tsx`
- **Issue:** Some theme color combinations may fail WCAG AA contrast.
- **Fix:** Audit all foreground/background combinations.

---

## 6. Missing Loading States

#### P18: Provider List Loading (HIGH)
- **Location:** `dialog-provider.tsx:252-324` (`allOptions`)
- **Issue:** While `options()` computes, no loading skeleton shown.
- **Fix:** Add "Loading providers..." placeholder.

#### P19: Model List Loading (MEDIUM)
- **Location:** `dialog-model.tsx:57-183` (`options`)
- **Issue:** Model list computed inline, no loading state.
- **Fix:** Show spinner with "Loading models..." during sync.

#### P20: Session List Loading (MEDIUM)
- **Location:** `dialog-session-list.tsx`
- **Issue:** Empty state shown immediately, even during loading.
- **Fix:** Add "Loading sessions..." with skeleton placeholders.

---

## 7. Code-Level Recommendations

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `dialog-model.tsx` | 195-208 | `onSelect()` doesn't show loading | Add `setLoading(true)` while switching |
| `dialog-provider.tsx` | 252 | `allOptions()` computed inline | Memoize with `createMemo()` |
| `dialog-select.tsx` | 281-283 | "No results" is static text | Add retry or clear filter action |
| `app.tsx` | 403-412 | Empty provider trigger has no UX | Add "Connect first provider" CTA |
| `toast.tsx` | N/A | Error toasts expire at 5s | Increase to 10s or add persistent option |

---

## Priority Summary

| Priority | Count | Items |
|----------|-------|-------|
| **HIGH** | 4 | P1, P6, P14, P18 |
| **MEDIUM** | 12 | P2, P3, P4, P5, P7, P8, P9, P11, P12, P13, P15, P19, P20 |
| **LOW** | 3 | P10, P16, P17 |

---

## Top Impact Improvements

1. **Dialog chaining (P1)** — biggest friction point, users stuck without back navigation
2. **Auth method presentation (P6)** — common onboarding blocker, unclear options
3. **Connection error UX (P14)** — first-time user experience, confusing retry behavior
4. **Provider loading state (P18)** — prevents confusion during setup, shows blank state

---

## Files Reference

| Component | File Path |
|-----------|-----------|
| Model Dialog | `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx` |
| Provider Dialog | `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx` |
| Command Dialog | `packages/beastcli/src/cli/cmd/tui/component/dialog-command.tsx` |
| Session List | `packages/beastcli/src/cli/cmd/tui/component/dialog-session-list.tsx` |
| Select Dialog | `packages/beastcli/src/cli/cmd/tui/component/dialog-select.tsx` |
| Main App | `packages/beastcli/src/cli/cmd/tui/app.tsx` |
| Toast | `packages/beastcli/src/cli/cmd/tui/ui/toast.tsx` |
| Error Component | `packages/beastcli/src/cli/cmd/tui/component/error-component.tsx` |
| Breadcrumb | `packages/beastcli/src/cli/cmd/tui/component/breadcrumb-nav.tsx` |
| Keybinds Bar | `packages/beastcli/src/cli/cmd/tui/component/keyboard-shortcuts-bar.tsx` |
