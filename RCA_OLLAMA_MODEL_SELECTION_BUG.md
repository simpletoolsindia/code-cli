# Root Cause Analysis: Ollama/Jan/MLX/vLLM Model Selection Bug

**Date:** 2026-05-02
**Severity:** HIGH
**Issue:** When selecting a self-hosted provider (Ollama, Jan AI, MLX, vLLM), the provider connects successfully but models do not appear in the model selection UI

---

## Executive Summary

The bug occurs because local provider configuration uses `dispose: false` to avoid instance recreation, but this prevents the Provider.Service from re-initializing with the new provider's models. Cloud providers work because they exist in the `models.dev` database that is loaded at startup; self-hosted providers only exist in config and require instance disposal to be picked up.

---

## The Exact Bug Location

### Primary Bug: Config Update Skips Instance Disposal
**File:** `packages/beastcli/src/config/config.ts`
**Line:** 754

```typescript
const update = Effect.fn("Config.update")(function* (config: Info, options?: { dispose?: boolean }) {
  const dir = yield* InstanceState.directory
  const file = path.join(dir, "config.json")
  const existing = yield* loadFile(file)
  yield* fs
    .writeFileString(file, JSON.stringify(mergeDeep(writable(existing), writable(config)), null, 2))
    .pipe(Effect.orDie)
  if (options?.dispose !== false) yield* Effect.promise(() => Instance.dispose())
})
```

**The Bug:** When `dispose: false` is passed, `Instance.dispose()` is NOT called. The Provider.Service state remains stale and never sees the newly added local provider.

---

## Complete Code Flow Analysis

### Step 1: User Opens Provider Dialog
**File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx`
**Lines:** 180-349

The `DialogProvider()` component renders with `allOptions()` that include detected local providers.

### Step 2: User Sees Detected Local Providers
**Lines:** 190-197

```typescript
onMount(() => {
  void probeLocalModelProviders().then(setDetectedLocal)
})
```

Results stored in `detectedLocal()` signal. `localOptions` at lines 250-263 filters ready providers.

### Step 3: User Clicks "Connect" on Ollama
**Lines:** 199-248

```typescript
async function onSelectDetected(provider: DetectedLocalProvider) {
  // ... builds nextProvider with baseURL and models ...
  const nextConfig: Config = {
    ...sync.data.config,
    provider: { ...sync.data.config.provider, [provider.id]: nextProvider },
    model: defaultModelID ? `${provider.id}/${defaultModelID}` : sync.data.config.model,
  }
  await sdk.client.config.update({ config: nextConfig }, { throwOnError: true })
  // Don't dispose instance when connecting local provider — just re-bootstrap
  await sync.bootstrap()
  dialog.replace(() => <DialogModel providerID={provider.id} />)
}
```

**Line 234 comment explicitly says:** "Don't dispose instance when connecting local provider"

### Step 4: Models Not Appearing - ROOT CAUSE

#### Step 4a: sync.bootstrap() Runs with Stale State
**File:** `packages/beastcli/src/cli/cmd/tui/context/sync.tsx`
**Lines:** 386-387

```typescript
const providersPromise = sdk.client.config.providers({ workspace }, { throwOnError: true })
const providerListPromise = sdk.client.provider.list({ workspace }, { throwOnError: true })
```

Both calls return **stale data** because:

- **`config.providers()`** → Returns `Object.values(providers)` from `Provider.Service.list()`
- **`provider.list()`** → Returns `s.providers` from Provider.Service state

Provider.Service was initialized at startup and has no knowledge of the newly added local provider.

#### Step 4b: Models Filtered Out
**File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx`
**Line:** 106

```typescript
filter(([_, info]) => (props.providerID ? provider.id === props.providerID : true)),
```

The provider is set via:
```typescript
const provider = createMemo(() =>
  props.providerID ? sync.data.provider.find((x) => x.id === props.providerID) : null,
)
```

But `sync.data.provider` comes from `config.providers()` which returns stale data!

#### Step 4c: Detected Local Models Also Filtered
**Lines:** 141-161

```typescript
const detectedLocalOptions = detectedLocal().flatMap((provider) => {
  if (props.providerID && provider.id !== props.providerID) return []
  // ...
})
```

`detectedLocal()` was populated at mount time and never re-probed after provider connection.

---

## Why Cloud Providers Work

| Aspect | Cloud Providers | Self-Hosted Providers |
|--------|----------------|---------------------|
| In models.dev | ✅ Always | ❌ Never |
| Provider Service initialization | ✅ Loaded from models.dev | ❌ Not loaded |
| Instance disposal needed | ❌ No | ✅ Yes (but skipped) |
| Re-initialization | ❌ Not needed | ❌ Never happens |

Cloud providers work because:
1. **They exist in models.dev** - Loaded at startup
2. **No re-initialization needed** - Already in Provider.Service state
3. **Auth adds to connected list** - Via auth mechanism (triggers dispose)

---

## Why Self-Hosted Providers Fail

1. **No entry in models.dev** - Ollama, Jan, MLX, vLLM not in database
2. **Only added via config** - Config must be read at runtime
3. **Provider.Service doesn't update** - With `dispose: false`, no re-init
4. **InstanceState is stale** - Only cloud providers at startup
5. **probeLocalModelProviders() runs once** - Not re-run after connect

---

## Affected Code Paths

### Path 1: Config Update (Skips Disposal)
- **File:** `packages/beastcli/src/config/config.ts:754`
- Config written to disk but instance NOT disposed
- Provider.Service state remains stale

### Path 2: Provider List (Returns Stale Data)
- **File:** `packages/beastcli/src/provider/provider.ts:1087-1409`
- State initialization only runs once at startup
- New local provider never added to providers map

### Path 3: Bootstrap (Fetches Stale Data)
- **File:** `packages/beastcli/src/cli/cmd/tui/context/sync.tsx:386-387`
- Both provider APIs return old Provider.Service state
- UI displays stale provider list

### Path 4: Model Dialog (Provider Not Found)
- **File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx:96-137`
- `sync.data.provider` doesn't include local provider
- Filter at line 106 returns empty result

### Path 5: Local Detection (Not Re-triggered)
- **File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx:190-197`
- `probeLocalModelProviders()` only called on mount
- Never re-runs after provider is connected

---

## Specific File:Line References

| File | Lines | Issue |
|------|-------|-------|
| `packages/beastcli/src/config/config.ts` | 754 | `dispose: false` prevents instance recreation |
| `packages/beastcli/src/cli/cmd/tui/context/sync.tsx` | 386-387 | Both APIs return stale Provider.Service state |
| `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx` | 96-137 | Provider not found in `sync.data.provider` |
| `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx` | 190-197 | `probeLocalModelProviders()` not re-run |
| `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx` | 234 | Comment explicitly says "don't dispose" |

---

## Recommended Fixes

### Option 1: Smart Disposal (Recommended)
**File:** `packages/beastcli/src/config/config.ts`

Change line 754 from:
```typescript
if (options?.dispose !== false) yield* Effect.promise(() => Instance.dispose())
```

To:
```typescript
if (options?.dispose !== false || config.provider) {
  yield* Effect.promise(() => Instance.dispose())
}
```

This disposes the instance when providers are configured, even if `dispose: false` is set.

### Option 2: Re-probe Local Providers
**File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx`

After line 235 (`await sync.bootstrap()`), add:
```typescript
// Re-probe local providers to update the detected list
const updated = await probeLocalModelProviders()
setDetectedLocal(updated)
```

### Option 3: Refresh Provider State Only
**File:** `packages/beastcli/src/effect/instance-state.ts`

Add a `refreshProviders()` function that reloads only provider state without full instance disposal.

---

## Summary

| Component | File:Line | Issue |
|-----------|-----------|-------|
| Config update skips dispose | `config.ts:754` | `dispose: false` prevents instance recreation |
| Bootstrap uses stale provider list | `sync.tsx:386-387` | Both APIs return old Provider.Service state |
| Local models filtered out | `dialog-model.tsx:106,144` | Provider not found in `sync.data.provider` |
| Probe only runs once | `dialog-provider.tsx:190-197` | `probeLocalModelProviders()` not re-run after connect |

**Root Cause:** Local provider configuration requires instance recreation to update Provider.Service state, but the code deliberately skips this with `dispose: false`.

**Why Cloud Works:** Cloud providers are in models.dev and loaded at startup, so no re-initialization needed.

**Why Self-Hosted Fails:** Only exist in config, which requires instance disposal to be picked up.
