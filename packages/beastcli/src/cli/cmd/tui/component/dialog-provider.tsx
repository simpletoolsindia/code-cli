import { createMemo, createSignal, onMount, Show } from "solid-js"
import { useSync } from "@tui/context/sync"
import { map, pipe, sortBy } from "remeda"
import { DialogSelect } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { useSDK } from "../context/sdk"
import { DialogPrompt } from "../ui/dialog-prompt"
import { Link } from "../ui/link"
import { useTheme } from "../context/theme"
import { TextAttributes } from "@opentui/core"
import type { ProviderAuthAuthorization, ProviderAuthMethod } from "@simpletoolsindia/sdk/v2"
import { DialogModel } from "./dialog-model"
import { useKeyboard } from "@opentui/solid"
import * as Clipboard from "@tui/util/clipboard"
import { useToast } from "../ui/toast"
import { isConsoleManagedProvider } from "@tui/util/provider-origin"
import { useConnected } from "./use-connected"
import { probeLocalModelProviders, type DetectedLocalProvider } from "./model-provider-detect"
import type { Config, ProviderConfig } from "@simpletoolsindia/sdk/v2"
import * as Log from "@simpletoolsindia/core/util/log"

const log = Log.create({ service: "tui.dialog.provider" })

const ALLOWED_PROVIDER_IDS = new Set([
  "beastcli",
  "beastcli-go",
  "openai",
  "anthropic",
  "deepseek",
  "openrouter",
  "nvidia",
  "ollama",
  "ollama-cloud",
  "lmstudio",
  "jan",
  "mlx",
  "vllm",
])

const PROVIDER_PRIORITY: Record<string, number> = {
  beastcli: 0,
  "beastcli-go": 1,
  openai: 2,
  anthropic: 3,
  deepseek: 4,
  openrouter: 5,
  nvidia: 6,
}

export function createDialogProviderOptions() {
  const sync = useSync()
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const { theme } = useTheme()
  const onboarded = useConnected()
  const options = createMemo(() => {
    return pipe(
      sync.data.provider_next.all.filter((p) => ALLOWED_PROVIDER_IDS.has(p.id)),
      sortBy((x) => PROVIDER_PRIORITY[x.id] ?? 99),
      map((provider) => {
        const consoleManaged = isConsoleManagedProvider(sync.data.console_state.consoleManagedProviders, provider.id)
        const connected = sync.data.provider_next.connected.includes(provider.id)
        const p = sync.data.provider.find((x) => x.id === provider.id)
        const providerModelCount = p ? Object.keys(p.models).length : 0

        return {
          title: provider.name,
          value: provider.id,
          description: {
            beastcli: "(Recommended)",
            anthropic: `(${providerModelCount > 0 ? `${providerModelCount} models` : "API key"})`,
            openai: `(${providerModelCount > 0 ? `${providerModelCount} models` : "ChatGPT Plus/Pro or API key"})`,
            openrouter: `(${providerModelCount > 0 ? `${providerModelCount} models` : "Many models, one API key"})`,
            deepseek: `(${providerModelCount > 0 ? `${providerModelCount} models` : "API key"})`,
            nvidia: `(${providerModelCount > 0 ? `${providerModelCount} models` : "API key"})`,
            "beastcli-go": "Low cost subscription for everyone",
          }[provider.id],
          footer: consoleManaged ? sync.data.console_state.activeOrgName : undefined,
          category: provider.id in PROVIDER_PRIORITY ? "Popular" : "Other",
          gutter: connected && onboarded() ? () => <text fg={theme.success}>✓</text> : undefined,
          async onSelect() {
            if (consoleManaged) return

            // If already connected, just open model picker — don't re-ask for auth
            if (connected) {
              dialog.push(() => <DialogModel providerID={provider.id} />)
              return
            }

            const methods = sync.data.provider_auth[provider.id] ?? [
              {
                type: "api",
                label: "API key",
                description: "Enter your API key directly",
              },
            ]
            let index: number | null = 0
            if (methods.length > 1) {
              index = await new Promise<number | null>((resolve) => {
                dialog.replace(
                  () => (
                    <DialogSelect
                      title={`Connect to ${provider.name}`}
                      options={methods.map((x, index) => ({
                        title: x.label,
                        value: index,
                        description: x.type === "oauth" ? "Sign in via your browser" : x.type === "api" ? "Enter your API key" : "",
                        category: x.type === "oauth" ? "Browser" : "Direct",
                      }))}
                      onSelect={(option) => resolve(option.value)}
                    />
                  ),
                  () => resolve(null),
                )
              })
            }
            if (index == null) return
            const method = methods[index]
            if (method.type === "oauth") {
              let inputs: Record<string, string> | undefined
              if (method.prompts?.length) {
                const value = await PromptsMethod({
                  dialog,
                  prompts: method.prompts,
                })
                if (!value) return
                inputs = value
              }

              const result = await sdk.client.provider.oauth.authorize({
                providerID: provider.id,
                method: index,
                inputs,
              })
              if (result.error) {
                toast.show({
                  variant: "error",
                  message: JSON.stringify(result.error),
                })
                dialog.clear()
                return
              }
              if (result.data?.method === "code") {
                dialog.replace(() => (
                  <CodeMethod
                    providerID={provider.id}
                    title={method.label}
                    index={index}
                    authorization={result.data!}
                  />
                ))
              }
              if (result.data?.method === "auto") {
                dialog.replace(() => (
                  <AutoMethod
                    providerID={provider.id}
                    title={method.label}
                    index={index}
                    authorization={result.data!}
                  />
                ))
              }
            }
            if (method.type === "api") {
              let metadata: Record<string, string> | undefined
              if (method.prompts?.length) {
                const value = await PromptsMethod({ dialog, prompts: method.prompts })
                if (!value) return
                metadata = value
              }
              return dialog.replace(() => (
                <ApiMethod providerID={provider.id} title={method.label} metadata={metadata} />
              ))
            }
          },
        }
      }),
    )
  })
  return options
}

export function DialogProvider() {
  const sync = useSync()
  const sdk = useSDK()
  const dialog = useDialog()
  const toast = useToast()
  const options = createDialogProviderOptions()
  const [detectedLocal, setDetectedLocal] = createSignal<DetectedLocalProvider[]>([])
  const [scanning, setScanning] = createSignal(true)
  const [configuring, setConfiguring] = createSignal(false)

  onMount(() => {
    void probeLocalModelProviders()
      .then((results) => {
        setDetectedLocal(results)
        setScanning(false)
      })
      .catch(() => setScanning(false))
  })

  async function onSelectDetected(provider: DetectedLocalProvider) {
    if (configuring()) return
    setConfiguring(true)
    try {
      const existing = sync.data.config.provider?.[provider.id] ?? {}
      const nextProvider: ProviderConfig = {
        ...existing,
        npm: existing.npm ?? "@ai-sdk/openai-compatible",
        name: existing.name ?? provider.name,
        options: {
          ...existing.options,
          baseURL: provider.baseURL,
        },
        models: {
          ...existing.models,
          ...Object.fromEntries(
            provider.models.map((model) => [
              model.id,
              {
                name: model.name,
              },
            ]),
          ),
        },
      }
      const defaultModelID = provider.models[0]?.id ?? ""
      const nextConfig: Config = {
        ...sync.data.config,
        provider: {
          ...sync.data.config.provider,
          [provider.id]: nextProvider,
        },
        model: defaultModelID ? `${provider.id}/${defaultModelID}` : sync.data.config.model,
      }
      await sdk.client.config.update({ config: nextConfig }, { throwOnError: true })
      // Config.update disposes provider state when provider definitions change.
      await sync.bootstrap()
      // After bootstrap refreshes providers, open model picker
      dialog.push(() => <DialogModel providerID={provider.id} />)
      toast.show({
        variant: "success",
        message: `${provider.name} connected`,
        duration: 2500,
      })
    } catch (error) {
      toast.error(error)
    } finally {
      setConfiguring(false)
    }
  }

  const localOptions = createMemo(() => {
    const ready = detectedLocal().filter((p) => p.status === "ready")
    if (ready.length === 0) return []
    return ready.map((provider) => ({
      title: provider.name,
      value: provider.id,
      description: `${provider.models.length} model${provider.models.length !== 1 ? "s" : ""} detected`,
      category: "💻 Local",
      disabled: configuring(),
      async onSelect() {
        await onSelectDetected(provider)
      },
    }))
  })

  const allOptions = createMemo(() => {
    const cloud = options()
    const local = localOptions()
    const result: any[] = [...local]
    if (scanning()) {
      result.push({
        title: "🔍 Scanning for local providers...",
        value: "loading",
        description: "Checking Ollama, LM Studio, Jan, MLX, vLLM",
        category: "Local",
        onSelect: () => {},
      })
    }
    // Remove cloud duplicates if a local provider with same ID exists
    const localIds = new Set<string>(local.map((l) => l.value))
    for (const o of cloud) {
      if (!localIds.has(o.value)) result.push(o)
    }
    // Add "Other (Custom)" option at the end
    result.push({
      title: "Ollama Cloud",
      value: "ollama-cloud",
      disabled: false,
      description: "Run models in the browser/cloud",
      category: "Other",
      async onSelect() {
        dialog.replace(() => (
          <DialogPrompt
            title="Ollama Cloud API Key"
            placeholder="sk-..."
            onConfirm={async (apiKey) => {
              if (!apiKey) return
              const baseURL = "https://api.ollama.com/v1/"
              dialog.replace(() => (
                <DialogPrompt
                  title="Fetching models from Ollama Cloud..."
                  placeholder="Press Enter to retry or Esc to cancel"
                  onConfirm={async () => {}}
                />
              ))
              try {
                const resp = await fetch(`${baseURL}models`, {
                  headers: { Authorization: `Bearer ${apiKey}` },
                })
                if (!resp.ok) {
                  toast.show({
                    message: `Ollama Cloud API error: ${resp.status}`,
                    variant: "error",
                    duration: 4000,
                  })
                  dialog.clear()
                  return
                }
                const data = (await resp.json()) as any
                const models: { id: string; name: string }[] =
                  data?.data?.flatMap((m: any) => {
                    const id = typeof m.id === "string" ? m.id : typeof m.name === "string" ? m.name : ""
                    if (!id) return []
                    return [{ id, name: id }]
                  }) ?? []
                if (models.length === 0) {
                  toast.show({
                    message: "No models found on Ollama Cloud",
                    variant: "error",
                    duration: 4000,
                  })
                  dialog.clear()
                  return
                }
                dialog.replace(() => (
                  <DialogSelect<{ id: string; name: string }>
                    title="Select Ollama Cloud Model"
                    options={models.map((model) => ({
                      title: model.name,
                      value: model,
                      onSelect: async () => {
                        const providerID = "ollama-cloud"
                        const nextConfig: Config = {
                          ...sync.data.config,
                          provider: {
                            ...sync.data.config.provider,
                            [providerID]: {
                              npm: "@ai-sdk/openai-compatible",
                              name: "Ollama Cloud",
                              options: { baseURL, apiKey },
                              models: {
                                [model.id]: {
                                  name: model.name,
                                },
                              },
                            },
                          },
                          model: `${providerID}/${model.id}`,
                        }
                        await sdk.client.config.update({ config: nextConfig }, { throwOnError: true })
                        await sync.bootstrap()
                        dialog.clear()
                        toast.show({
                          message: "Ollama Cloud connected",
                          variant: "success",
                          duration: 2500,
                        })
                      },
                    }))}
                  />
                ))
              } catch (error) {
                toast.error(error)
                dialog.clear()
              }
            }}
          />
        ))
      },
    })
    // Add "Other (Custom)" option at the end
    result.push({
      title: "Other (Custom Provider)",
      value: "other",
      disabled: false,
      description: "Add any OpenAI-compatible API",
      category: "Custom",
      async onSelect() {
        dialog.replace(() => (
          <DialogPrompt
            title="Custom Provider Setup"
            placeholder="Base URL (e.g. https://api.custom.ai/v1)"
            onConfirm={async (baseURL) => {
              const url = baseURL.trim()
              if (!url) return
              dialog.replace(() => (
                <DialogPrompt
                  title="API Key (optional)"
                  placeholder="Leave blank for local endpoints"
                  onConfirm={async (apiKey) => {
                    const key = apiKey.trim()
                    dialog.replace(() => (
                      <DialogPrompt
                        title="Model Name"
                        placeholder="e.g. custom-model-7b"
                        onConfirm={async (modelName) => {
                          const modelID = modelName.trim()
                          if (!modelID) return
                          const providerID = `custom-${Date.now()}`
                          const nextConfig: Config = {
                            ...sync.data.config,
                            provider: {
                              ...sync.data.config.provider,
                              [providerID]: {
                                npm: "@ai-sdk/openai-compatible",
                                name: "Custom Provider",
                                options: {
                                  baseURL: url,
                                  ...(key ? { apiKey: key } : {}),
                                },
                                models: {
                                  [modelID]: {
                                    name: modelID,
                                  },
                                },
                              },
                            },
                            model: `${providerID}/${modelID}`,
                          }
                          await sdk.client.config.update({ config: nextConfig }, { throwOnError: true })
                          await sync.bootstrap()
                          dialog.clear()
                          toast.show({
                            message: "Custom provider connected",
                            variant: "success",
                            duration: 2500,
                          })
                        }}
                      />
                    ))
                  }}
                />
              ))
            }}
          />
        ))
      },
    })
    return result
  })

  return <DialogSelect title="Connect a provider" options={allOptions()} />
}

interface AutoMethodProps {
  index: number
  providerID: string
  title: string
  authorization: ProviderAuthAuthorization
}
function AutoMethod(props: AutoMethodProps) {
  const { theme } = useTheme()
  const sdk = useSDK()
  const dialog = useDialog()
  const sync = useSync()
  const toast = useToast()

  useKeyboard((evt) => {
    if (evt.name === "c" && !evt.ctrl && !evt.meta) {
      const code = props.authorization.instructions.match(/[A-Z0-9]{4}-[A-Z0-9]{4,5}/)?.[0] ?? props.authorization.url
      Clipboard.copy(code)
        .then(() => toast.show({ message: "Copied to clipboard", variant: "info" }))
        .catch(toast.error)
    }
  })

  onMount(async () => {
    const result = await sdk.client.provider.oauth.callback({
      providerID: props.providerID,
      method: props.index,
    })
    if (result.error) {
      dialog.clear()
      return
    }
    await sdk.client.instance.dispose()
    await sync.bootstrap()
    dialog.push(() => <DialogModel providerID={props.providerID} />)
  })

  return (
    <box paddingLeft={2} paddingRight={2} gap={1} paddingBottom={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          {props.title}
        </text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc
        </text>
      </box>
      <box gap={1}>
        <Link href={props.authorization.url} fg={theme.primary} />
        <text fg={theme.textMuted}>{props.authorization.instructions}</text>
      </box>
      <text fg={theme.textMuted}>Waiting for authorization...</text>
      <text fg={theme.text}>
        c <span style={{ fg: theme.textMuted }}>copy</span>
      </text>
    </box>
  )
}

interface CodeMethodProps {
  index: number
  title: string
  providerID: string
  authorization: ProviderAuthAuthorization
}
function CodeMethod(props: CodeMethodProps) {
  const { theme } = useTheme()
  const sdk = useSDK()
  const sync = useSync()
  const dialog = useDialog()
  const [error, setError] = createSignal(false)

  return (
    <DialogPrompt
      title={props.title}
      placeholder="Authorization code"
      onConfirm={async (value) => {
        const { error } = await sdk.client.provider.oauth.callback({
          providerID: props.providerID,
          method: props.index,
          code: value,
        })
        if (!error) {
          await sdk.client.instance.dispose()
          await sync.bootstrap()
          dialog.push(() => <DialogModel providerID={props.providerID} />)
          return
        }
        setError(true)
      }}
      description={() => (
        <box gap={1}>
          <text fg={theme.textMuted}>{props.authorization.instructions}</text>
          <Link href={props.authorization.url} fg={theme.primary} />
          <Show when={error()}>
            <text fg={theme.error}>Invalid code</text>
          </Show>
        </box>
      )}
    />
  )
}

interface ApiMethodProps {
  providerID: string
  title: string
  metadata?: Record<string, string>
}
function ApiMethod(props: ApiMethodProps) {
  const dialog = useDialog()
  const sdk = useSDK()
  const sync = useSync()
  const { theme } = useTheme()
  const [error, setError] = createSignal<string>()

  return (
    <DialogPrompt
      title={props.title}
      placeholder="API key"
      onConfirm={async (value) => {
        if (!value) return
        setError(undefined)
        try {
          await sdk.client.auth.set({
            providerID: props.providerID,
            auth: {
              type: "api",
              key: value,
              ...(props.metadata ? { metadata: props.metadata } : {}),
            },
          })
          await sdk.client.instance.dispose()
          await sync.bootstrap()
          dialog.push(() => <DialogModel providerID={props.providerID} />)
        } catch (error) {
          setError(error instanceof Error ? error.message : String(error))
        }
      }}
      description={() => (
        <box gap={1}>
          {
            {
              beastcli: (
                <box gap={1}>
                  <text fg={theme.textMuted}>
                    BeastCLI Zen gives you access to all the best coding models at the cheapest prices with a single API
                    key.
                  </text>
                  <text fg={theme.text}>
                    Go to <span style={{ fg: theme.primary }}>https://beastcli.sridharhomelab.in/zen</span> to get a key
                  </text>
                </box>
              ),
              "beastcli-go": (
                <box gap={1}>
                  <text fg={theme.textMuted}>
                    BeastCLI Go is a $10 per month subscription that provides reliable access to popular open coding
                    models with generous usage limits.
                  </text>
                  <text fg={theme.text}>
                    Go to <span style={{ fg: theme.primary }}>https://beastcli.sridharhomelab.in/zen</span> and enable
                    BeastCLI Go
                  </text>
                </box>
              ),
            }[props.providerID]
          }
          <Show when={error()}>
            {(message) => <text fg={theme.error}>Could not connect: {message()}</text>}
          </Show>
        </box>
      )}
    />
  )
}

interface PromptsMethodProps {
  dialog: ReturnType<typeof useDialog>
  prompts: NonNullable<ProviderAuthMethod["prompts"]>[number][]
}
async function PromptsMethod(props: PromptsMethodProps) {
  const inputs: Record<string, string> = {}
  for (const prompt of props.prompts) {
    if (prompt.when) {
      const value = inputs[prompt.when.key]
      if (value === undefined) continue
      const matches = prompt.when.op === "eq" ? value === prompt.when.value : value !== prompt.when.value
      if (!matches) continue
    }

    if (prompt.type === "select") {
      const value = await new Promise<string | null>((resolve) => {
        props.dialog.replace(
          () => (
            <DialogSelect
              title={prompt.message}
              options={prompt.options.map((x) => ({
                title: x.label,
                value: x.value,
                description: x.hint,
              }))}
              onSelect={(option) => resolve(option.value)}
            />
          ),
          () => resolve(null),
        )
      })
      if (value === null) return null
      inputs[prompt.key] = value
      continue
    }

    const value = await new Promise<string | null>((resolve) => {
      props.dialog.replace(
        () => (
          <DialogPrompt title={prompt.message} placeholder={prompt.placeholder} onConfirm={(value) => resolve(value)} />
        ),
        () => resolve(null),
      )
    })
    if (value === null) return null
    inputs[prompt.key] = value
  }
  return inputs
}
