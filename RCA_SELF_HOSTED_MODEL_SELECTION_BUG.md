# Root Cause Analysis: Model Selection NOT Updating When Self-Hosted Provider Selected

**Date:** 2026-05-02
**Issue:** When selecting self-hosted provider (Ollama, Jan AI, MLX, vLLM, LM Studio), the model list does not update after provider is connected

---

## Summary

The bug occurs because when a self-hosted provider is selected and connected, the provider state is built only from `models.dev` data plus config-based providers. Self-hosted providers have no entry in `models.dev`, and their model lists are only added to the config but NOT to the provider service's `providers` state.

---

## Root Cause

### Location 1: Provider State Initialization
**File:** `packages/beastcli/src/provider/provider.ts`
**Lines:** 1087-1408

The provider state initialization (`Provider.Service` layer) builds providers from:

1. **`database`** = models from `models.dev` (lines 1092-1093):
   ```typescript
   const modelsDev = yield* Effect.promise(() => ModelsDev.get())
   const database = mapValues(modelsDev, fromModelsDevProvider)
   ```

2. **Config providers** are extended into `database` (lines 1170-1262), but the `providers` object (which is what `svc.list()` returns) is built separately.

3. **`discoveryLoaders`** only have `gitlab` implementation (lines 1340-1354):
   ```typescript
   const gitlab = ProviderID.make("gitlab")
   if (discoveryLoaders[gitlab] && providers[gitlab] && isProviderAllowed(gitlab)) {
     yield* Effect.promise(async () => {
       const discovered = await discoveryLoaders[gitlab]()
       // ...
     })
   }
   ```

   **Self-hosted providers have NO `discoverModels` implementation.**

### Location 2: Connected Providers List
**File:** `packages/beastcli/src/provider/provider.ts`
**Lines:** 1311-1328

When custom loaders are processed:
```typescript
for (const [id, fn] of Object.entries(custom(dep))) {
  const providerID = ProviderID.make(id)
  if (disabled.has(providerID)) continue
  const data = database[providerID]
  if (!data) {
    log.error("Provider does not exist in model list " + providerID)
    continue  // <-- SELF-HOSTED PROVIDERS SKIP HERE!
  }
  const result = yield* fn(data)
  if (result && (result.autoload || providers[providerID])) {
    if (result.getModel) modelLoaders[providerID] = result.getModel
    if (result.vars) varsLoaders[providerID] = result.vars
    if (result.discoverModels) discoveryLoaders[providerID] = result.discoverModels
    // ...
  }
}
```

**Self-hosted providers (ollama, jan, mlx, vllm, lmstudio) are NOT in the `custom(dep)` object** - they have no loader entry at all. So they are NOT processed by this loop.

### Location 3: Config Update Handler
**File:** `packages/beastcli/src/server/routes/instance/httpapi/handlers/config.ts`
**Lines:** 18-21

```typescript
const update = Effect.fn("ConfigHttpApi.update")(function* (ctx) {
  yield* configSvc.update(ctx.payload, { dispose: false })  // <-- dispose: false!
  yield* markInstanceForDisposal(yield* InstanceState.context)
  return ctx.payload
})
```

**The key issue**: `dispose: false` means the instance is NOT disposed and recreated. This means the `Provider.Service` state is NOT refreshed.

### Location 4: UI Model Dialog Doesn't Re-Detect Local Providers
**File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx`
**Lines:** 34-36, 139-161

```typescript
onMount(() => {
  void probeLocalModelProviders().then(setDetectedLocal)
})
```

The `probeLocalModelProviders()` is only called on `onMount`. When a self-hosted provider is connected:
1. Config is updated with `dispose: false`
2. `sync.bootstrap()` is called to refresh provider data
3. But the local provider detection (`detectedLocal` signal) is NOT re-triggered
4. The newly connected self-hosted provider's models appear in `sync.data.provider` (from the config update)
5. But `detectedLocal` still has stale data

---

## Why Cloud Providers Work Differently

Cloud providers work because:

1. **They exist in `models.dev`** - They are pre-defined in the database with all their models
2. **Auth credentials** are stored via `Auth.Service`, which triggers instance disposal
3. **Provider discovery** is not needed - all models are already in the static `models.dev` snapshot

Self-hosted providers:
1. **NOT in `models.dev`** - No static entry exists
2. **Models are fetched dynamically** via `probeLocalModelProviders()` at UI mount time
3. **Models are stored in config** when selected (not discovered through a provider service mechanism)
4. **No `discoverModels` loader** exists for self-hosted providers

---

## The Critical Bug Flow

1. User opens Provider Dialog (`DialogProvider`)
2. User sees detected local provider (Ollama) via `probeLocalModelProviders()`
3. User clicks "Connect" → `onSelectDetected(provider)` is called (lines 186-235 of `dialog-provider.tsx`)
4. Config is updated with `sdk.client.config.update()`:
   ```typescript
   const nextConfig: Config = {
     ...sync.data.config,
     provider: {
       ...sync.data.config.provider,
       [provider.id]: nextProvider,  // <-- Provider with models added to config
     },
     model: `${provider.id}/${modelID}`,
   }
   await sdk.client.config.update({ config: nextConfig }, { throwOnError: true })
   await sync.bootstrap()  // <-- Re-fetches provider list
   ```
5. `sync.bootstrap()` calls `sdk.client.provider.list()` which hits the provider route
6. Provider route calls `Provider.Service.list()` which returns `s.providers`
7. **`s.providers` does NOT include the self-hosted provider** because:
   - It was never added to the `providers` object during state initialization
   - The state was NOT disposed and recreated (`dispose: false`)
   - The config update only affected `Config.Service`, not `Provider.Service`

---

## Affected Code Paths

### Path 1: Config Update (No Provider State Refresh)
- **File:** `packages/beastcli/src/server/routes/instance/httpapi/handlers/config.ts:18-21`
- Config is updated with `dispose: false`
- Provider state is never rebuilt

### Path 2: Provider List (Missing Self-Hosted Providers)
- **File:** `packages/beastcli/src/provider/provider.ts:1087-1408`
- State initialization only processes providers from `database` + `custom()` loaders
- Self-hosted providers have no `custom()` loader entry
- Self-hosted providers are not in `models.dev`

### Path 3: UI Detection (Not Re-Triggered After Connection)
- **File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx:34-36`
- `probeLocalModelProviders()` only called on mount
- Not re-called after provider is connected

### Path 4: Provider Options Building
- **File:** `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx:55`
- `provider_next.all` filtered by `ALLOWED_PROVIDER_IDS`
- Self-hosted provider IDs (ollama, jan, mlx, vllm, lmstudio) are in the allowed list
- But they have no models in the provider service state

---

## Specific File:Line References

| File | Lines | Issue |
|------|-------|-------|
| `packages/beastcli/src/provider/provider.ts` | 1087-1093 | State initializes from `models.dev` only |
| `packages/beastcli/src/provider/provider.ts` | 1116-1127 | `mergeProvider` only merges existing providers |
| `packages/beastcli/src/provider/provider.ts` | 1311-1328 | `custom(dep)` has no self-hosted provider entries |
| `packages/beastcli/src/provider/provider.ts` | 1340-1354 | Only `gitlab` has model discovery |
| `packages/beastcli/src/server/routes/instance/httpapi/handlers/config.ts` | 18-21 | Config update uses `dispose: false` |
| `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx` | 34-36 | Local detection only on mount |
| `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx` | 186-235 | `onSelectDetected` updates config but provider state not refreshed |

---

## Why Cloud Works But Self-Hosted Doesn't

| Aspect | Cloud Providers | Self-Hosted Providers |
|--------|----------------|---------------------|
| Entry in `models.dev` | Yes | No |
| Models in static database | Yes | No |
| Model discovery mechanism | Pre-built | Dynamic (probe at mount) |
| Provider in `custom()` loaders | Yes | No |
| Instance disposal on connect | Yes | No (uses `dispose: false`) |
| Models in provider service state | Yes | No |

---

## Fix Direction

The fix requires either:

1. **Option A**: Make `dispose: true` (default) when updating config with a self-hosted provider so the provider state is rebuilt

2. **Option B**: Add self-hosted provider model discovery (call `probeLocalModelProviders()` on provider state rebuild)

3. **Option C**: Make `provider.list()` merge config-based provider models into the returned `providers` object, not just rely on the service state

The cleanest fix is **Option A** - changing the config update to trigger instance disposal when a self-hosted provider is added, so the provider state is rebuilt with the new provider's models.

---

## Files Reference

| Component | File Path |
|-----------|-----------|
| Provider Service | `packages/beastcli/src/provider/provider.ts` |
| Config Handler | `packages/beastcli/src/server/routes/instance/httpapi/handlers/config.ts` |
| Model Dialog | `packages/beastcli/src/cli/cmd/tui/component/dialog-model.tsx` |
| Provider Dialog | `packages/beastcli/src/cli/cmd/tui/component/dialog-provider.tsx` |
| Provider HTTP API | `packages/beastcli/src/server/routes/instance/httpapi/groups/provider.ts` |