# BeastCLI Provider/Model Selection UI - Best Solution Design

## Status: PARTIALLY IMPLEMENTED

This document designed ideal UX. Several features have been merged into the codebase while others remain for future PRs.

---

## What Was Implemented

### 1. ✅ Rich Model Footer in Dialog (`dialog-model.tsx`)

**Before:** Only showed "Free" for beastcli free models.  
**After:** Shows cost, context window, and capabilities for every model:
- `$5/M` — cost per 1M input tokens
- `128K ctx` — context window size
- `Reasoning · Vision · Tools` — capability badges

```typescript
function buildFooter(info: Model, providerID: string): string {
  const parts: string[] = []
  if (info.cost?.input === 0 && providerID === "beast") parts.push("Free")
  else if (info.cost?.input && info.cost.input > 0) parts.push(`$${info.cost.input}/M`)
  if (info.limit?.context) parts.push(`${Math.round(info.limit.context / 1000)}K ctx`)
  const caps: string[] = []
  if (info.capabilities?.reasoning) caps.push("Reasoning")
  if (info.capabilities?.attachment) caps.push("Vision")
  if (info.capabilities?.toolcall) caps.push("Tools")
  if (caps.length) parts.push(caps.join(" · "))
  return parts.join("  ")
}
```

**Impact:** Users can see model pricing and capabilities at a glance without leaving the model picker.

### 2. ✅ Better Section Labels (`dialog-model.tsx`)

| Section | Before | After |
|---------|--------|-------|
| Favorites | `Favorites` | `★ Favorites` |
| Recent | `Recent` | `🕐 Recent` |
| Providers | `Anthropic` | `☁️ Anthropic` |
| Local | `Detected local` | `💻 Detected local` |

### 3. ✅ Clearer Action Labels (`dialog-model.tsx`)

- "Connect provider" → "+ Add provider" (more action-oriented)
- "Favorite" → "★ Favorite" (visual star)
- "Setup" → "Click to setup" (more descriptive)

### 4. ✅ Model Indicator in Footer (`routes/session/footer.tsx`)

Added `FooterModelInfo` component that shows:
- Current model name (e.g., GPT-4o)
- 🧠 reasoning badge when active

```
Before: /Users/project  · 2 LSP · 3 MCP · /status
After:  /Users/project  · GPT-4o  · 2 LSP · 3 MCP · /status
```

---

## Pain Points Found (Not Yet Solved)

### P1: Dialog Chaining Without Back Navigation

**Problem:** `dialog-model.tsx` → `dialog-provider.tsx` has no "back" button. User must close and reopen.

**Design Solution:** Replace chained dialogs with inline provider list inside model dialog. Use collapsible sections.

**Status:** Not implemented — requires replacing `DialogSelect` with custom layout component supporting nested expansion.

### P2: Provider Model Count Missing

**Problem:** Provider list doesn't show how many models each provider has.

**Design Solution:** Show `(12 models)` next to each provider in the connect dialog.

**Status:** Not implemented — needs counting models per provider and updating `dialog-provider.tsx`/`createDialogProviderOptions`.

### P3: Missing Model Capabilities Display

**Problem:** No icon-based capability display in model list.

**Design Solution:** Show icons inline:
```
○ GPT-4o    [OpenAI]  $5/M  128K  🧠👁🔧
```

**Status:** Partially solved with text footer. Full icons need JSX footer support in `DialogSelect`'s `Option` component (currently only supports text).

### P4: No Quick Model Switcher

**Design:** Ctrl+Shift+M opens overlay with last 10 models:
```
┌─────────────────────────────┐
│  🔄 Quick Switch Model        │
│  > GPT-4o          [OpenAI]   │
│    Claude 3.5      [Anthropic]│
│    Gemini 2.0      [Google]   │
└─────────────────────────────┘
```

**Status:** Not implemented — needs new dialog component, new keybind, and wiring in `app.tsx`.

### P5: Onboarding Inconsistency

**Design:** Reference new model picker in onboarding tour.

**Status:** Not updated — onboarding mentions `/connect` but should mention `/models` after provider is connected.

---

## Remaining Implementation Priority

| Feature | Effort | Impact | File |
|---------|--------|--------|------|
| Provider inline in model dialog (no chaining) | 4h | High | `dialog-model.tsx` |
| Quick model switcher (Ctrl+Shift+M) | 3h | High | New file + `app.tsx` |
| Model count in provider list | 30m | Medium | `dialog-provider.tsx` |
| Capability icons (🧠👁🔧) | 2h | Medium | `dialog-model.tsx` + `dialog-select.tsx` |
| Onboarding update | 15m | Low | `onboarding-tour.tsx` |

---

## Backward Compatibility

All implemented changes are additive:
- ✅ Existing keybinds preserved (`model_list`, `model_provider_list`, `model_favorite_toggle`)
- ✅ `DialogProvider` kept for full provider management
- ✅ No changes to `local.model.set()` API
- ✅ No changes to KV store schema

---

## Files Modified (Implemented)

| File | Changes |
|------|---------|
| `component/dialog-model.tsx` | `buildFooter()`, section labels, action labels |
| `routes/session/footer.tsx` | Added `FooterModelInfo` component |
