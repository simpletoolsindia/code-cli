import { createMemo, createSignal, onMount } from "solid-js"
import { useLocal } from "@tui/context/local"
import { useSync } from "@tui/context/sync"
import { map, pipe, flatMap, entries, filter, sortBy, take } from "remeda"
import { DialogSelect } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { createDialogProviderOptions, DialogProvider } from "./dialog-provider"
import { DialogVariant } from "./dialog-variant"
import { useKeybind } from "../context/keybind"
import * as fuzzysort from "fuzzysort"
import { useConnected } from "./use-connected"
import { probeLocalModelProviders, type DetectedLocalProvider } from "./model-provider-detect"
import { useSDK } from "../context/sdk"
import { useToast } from "../ui/toast"
import type { Config, ProviderConfig, Model } from "@simpletoolsindia/sdk/v2"
import * as Log from "@simpletoolsindia/core/util/log"

const log = Log.create({ service: "tui.dialog.model" })

export function DialogModel(props: { providerID?: string }) {
  const local = useLocal()
  const sync = useSync()
  const dialog = useDialog()
  const keybind = useKeybind()
  const sdk = useSDK()
  const toast = useToast()
  const [query, setQuery] = createSignal("")
  const [detectedLocal, setDetectedLocal] = createSignal<DetectedLocalProvider[]>([])
  const [configuring, setConfiguring] = createSignal(false)
  const [expandedProviders, setExpandedProviders] = createSignal<Set<string>>(new Set())

  const connected = useConnected()
  const providers = createDialogProviderOptions()

  const showExtra = createMemo(() => connected() && !props.providerID)

  onMount(() => {
    void probeLocalModelProviders().then(setDetectedLocal)
  })

  function buildFooter(info: Model, providerID: string): string {
    const parts: string[] = []
    if (info.cost?.input === 0 && providerID === "beast") {
      parts.push("Free")
    } else if (info.cost?.input && info.cost.input > 0) {
      parts.push(`$${info.cost.input}/M`)
    }
    if (info.limit?.context) {
      const ctx = info.limit.context >= 1000 ? `${Math.round(info.limit.context / 1000)}K` : String(info.limit.context)
      parts.push(`${ctx} ctx`)
    }
    const caps: string[] = []
    if (info.capabilities?.reasoning) caps.push("Reasoning")
    if (info.capabilities?.attachment) caps.push("Vision")
    if (info.capabilities?.toolcall) caps.push("Tools")
    if (caps.length) parts.push(caps.join(" · "))
    return parts.join("  ")
  }

  const options = createMemo(() => {
    const needle = query().trim()
    const showSections = showExtra() && needle.length === 0
    const favorites = connected() ? local.model.favorite() : []
    const recents = local.model.recent()

    function toOptions(items: typeof favorites, category: string) {
      if (!showSections) return []
      return items.flatMap((item) => {
        const provider = sync.data.provider.find((x) => x.id === item.providerID)
        if (!provider) return []
        const model = provider.models[item.modelID]
        if (!model) return []
        return [
          {
            key: item,
            value: { providerID: provider.id, modelID: model.id },
            title: model.name ?? item.modelID,
            description: provider.name,
            category,
            disabled: provider.id === "beast" && model.id.includes("-nano"),
            footer: buildFooter(model, provider.id),
            onSelect: () => {
              onSelect(provider.id, model.id)
            },
          },
        ]
      })
    }

    const favoriteOptions = toOptions(favorites, "★ Favorites")
    const recentOptions = toOptions(
      recents.filter(
        (item) => !favorites.some((fav) => fav.providerID === item.providerID && fav.modelID === item.modelID),
      ),
      "🕐 Recent",
    )

    const providerOptions = pipe(
      sync.data.provider,
      sortBy(
        (provider) => provider.id !== "beast",
        (provider) => provider.name,
      ),
      flatMap((provider) =>
        pipe(
          provider.models,
          entries(),
          filter(([_, info]) => info.status !== "deprecated"),
          filter(([_, info]) => (props.providerID ? provider.id === props.providerID : true)),
          map(([model, info]) => ({
            value: { providerID: provider.id, modelID: model },
            title: info.name ?? model,
            description: favorites.some((item) => item.providerID === provider.id && item.modelID === model)
              ? "★"
              : undefined,
            category: connected() ? `☁️  ${provider.name}` : undefined,
            disabled: provider.id === "beast" && model.includes("-nano"),
            footer: buildFooter(info, provider.id),
            onSelect() {
              onSelect(provider.id, model)
            },
          })),
          filter((x) => {
            if (!showSections) return true
            if (favorites.some((item) => item.providerID === x.value.providerID && item.modelID === x.value.modelID))
              return false
            if (recents.some((item) => item.providerID === x.value.providerID && item.modelID === x.value.modelID))
              return false
            return true
          }),
          sortBy(
            (x) => {
              const info = Object.entries(provider.models).find(([id]) => id === x.value.modelID)?.[1]
              return info?.cost?.input !== 0
            },
            (x) => x.title,
          ),
        ),
      ),
    )

    // Always show detected local models — even when providerID is set,
    // because sync might not have refreshed yet after connecting a local provider
    const detectedLocalOptions = detectedLocal().flatMap((provider) => {
      if (provider.status !== "ready") return []
      // When providerID is set, only show matching local provider
      if (props.providerID && provider.id !== props.providerID) return []
      return provider.models.flatMap((model) => {
        return [
          {
            value: { providerID: provider.id, modelID: model.id },
            title: model.name,
            description: provider.name,
            category: props.providerID ? undefined : "💻 Detected local",
            disabled: configuring(),
            footer: props.providerID ? "Select model" : "Click to setup",
            onSelect() {
              // Always setup the provider + select the model
              void onSelectDetected(provider, model.id)
            },
          },
        ]
      })
    })

    const popularProviders = !connected()
      ? pipe(
          providers(),
          map((option) => ({
            ...option,
            category: "Popular providers",
          })),
          take(6),
        )
      : []

    if (needle) {
      return [
        ...fuzzysort.go(needle, providerOptions, { keys: ["title", "category"] }).map((x) => x.obj),
        ...fuzzysort.go(needle, detectedLocalOptions, { keys: ["title", "description", "category"] }).map((x) => x.obj),
        ...fuzzysort.go(needle, popularProviders, { keys: ["title"] }).map((x) => x.obj),
      ]
    }

    return [...favoriteOptions, ...recentOptions, ...detectedLocalOptions, ...providerOptions, ...popularProviders]
  })

  const provider = createMemo(() =>
    props.providerID ? sync.data.provider.find((x) => x.id === props.providerID) : null,
  )

  const title = createMemo(() => {
    const value = provider()
    if (!value) return "Select model"
    return value.name
  })

  function onSelect(providerID: string, modelID: string) {
    log.info("select model", {
      providerID,
      modelID,
      before: local.model.current(),
      providerLoaded: sync.data.provider.some((provider) => provider.id === providerID),
      modelLoaded: sync.data.provider.some((provider) => provider.id === providerID && !!provider.models[modelID]),
    })
    local.model.set({ providerID, modelID }, { recent: true })
    log.info("selected model state", {
      providerID,
      modelID,
      after: local.model.current(),
    })
    const list = local.model.variant.list()
    const cur = local.model.variant.selected()
    if (cur === "default" || (cur && list.includes(cur))) {
      dialog.clear()
      return
    }
    if (list.length > 0) {
      dialog.replace(() => <DialogVariant />)
      return
    }
    dialog.clear()
  }

  async function onSelectDetected(provider: DetectedLocalProvider, modelID: string) {
    if (configuring()) return
    setConfiguring(true)
    try {
      const nextConfig: Config = {
        ...sync.data.config,
        provider: {
          ...sync.data.config.provider,
          [provider.id]: {
            npm: "@ai-sdk/openai-compatible",
            name: provider.name,
            options: { baseURL: provider.baseURL },
            models: {
              ...sync.data.config.provider?.[provider.id]?.models,
              [modelID]: { name: modelID },
            },
          },
        },
        model: `${provider.id}/${modelID}`,
      }
      await sdk.client.config.update({ config: nextConfig }, { throwOnError: true })
      // Just save locally without disposing instance
      local.model.set({ providerID: provider.id, modelID }, { saveToConfig: true })
      toast.show({
        variant: "success",
        message: `${provider.name} is ready — restart beast to use it`,
        duration: 4000,
      })
    } catch (error) {
      toast.error(error)
    } finally {
      setConfiguring(false)
    }
  }

  return (
    <DialogSelect<ReturnType<typeof options>[number]["value"]>
      options={options()}
      keybind={[
        {
          keybind: { name: "escape", ctrl: false, meta: false, shift: false, super: false, leader: false },
          title: "Back to provider list",
          onTrigger() {
            dialog.replace(() => <DialogProvider />)
          },
        },
        {
          keybind: keybind.all.model_provider_list?.[0],
          title: connected() ? "+ Add provider" : "View all providers",
          onTrigger() {
            dialog.replace(() => <DialogProvider />)
          },
        },
        {
          keybind: keybind.all.model_favorite_toggle?.[0],
          title: "★ Favorite",
          disabled: !connected(),
          onTrigger: (option) => {
            local.model.toggleFavorite(option.value as { providerID: string; modelID: string })
          },
        },
      ]}
      onFilter={setQuery}
      flat={true}
      skipFilter={true}
      title={title()}
      current={local.model.current()}
    />
  )
}
