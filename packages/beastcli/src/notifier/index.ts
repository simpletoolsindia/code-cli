import { Bus } from "@/bus"
import { Config } from "@/config/config"
import { Effect, Layer, Context, Stream } from "effect"
import * as Log from "@simpletoolsindia/core/util/log"
import { ConfigNotifier } from "@/config/notifier"
import path from "path"
import { Global } from "@simpletoolsindia/core/global"
import fs from "fs/promises"
import { existsSync } from "fs"

const log = Log.create({ service: "notifier" })

const CONFIG_FILE = path.join(Global.Path.config, "notifier.json")

export interface Interface {
  readonly sendTelegram: (message: string) => Effect.Effect<void>
  readonly updateConfig: (config: Partial<ConfigNotifier.Info>) => Effect.Effect<void>
  readonly getConfig: () => Effect.Effect<ConfigNotifier.Info>
}

export class Service extends Context.Service<Service, Interface>()("@simpletoolsindia/Notifier") {}

type ConfigWithNotifier = { notifier?: ConfigNotifier.Info }

function isEventEnabled(events: ConfigNotifier.Events | undefined, eventKey: string): boolean {
  if (!events) return true
  const config = (events as Record<string, any>)[eventKey]
  if (!config) return true
  return config.enabled !== false
}

function getMessage(events: ConfigNotifier.Events | undefined, eventKey: string, defaultMessage: string): string {
  if (!events) return defaultMessage
  const config = (events as Record<string, any>)[eventKey]
  if (!config?.message) return defaultMessage
  return config.message
}

async function loadConfigFile(): Promise<ConfigNotifier.Info> {
  if (!existsSync(CONFIG_FILE)) {
    return ConfigNotifier.defaults
  }
  try {
    const content = await fs.readFile(CONFIG_FILE, "utf-8")
    const parsed = JSON.parse(content)
    return {
      ...ConfigNotifier.defaults,
      ...parsed,
      channels: {
        ...ConfigNotifier.defaults.channels,
        ...(parsed.channels ?? {}),
        telegram: {
          ...ConfigNotifier.defaults.channels?.telegram,
          ...(parsed.channels?.telegram ?? {}),
        },
        macos: {
          ...ConfigNotifier.defaults.channels?.macos,
          ...(parsed.channels?.macos ?? {}),
        },
      },
    }
  } catch {
    return ConfigNotifier.defaults
  }
}

async function saveConfigFile(config: ConfigNotifier.Info): Promise<void> {
  await fs.mkdir(Global.Path.config, { recursive: true })
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}

function sendTelegramMessage(botToken: string, chatId: string, text: string): Effect.Effect<void> {
  return Effect.tryPromise({
    try: async () => {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Telegram API error: ${body}`)
      }
    },
    catch: (err) => {
      log.error("failed to send telegram notification", { error: err instanceof Error ? err.message : String(err) })
    },
  }).pipe(Effect.option, Effect.asVoid)
}

function sendMacOSNotification(title: string, message: string): Effect.Effect<void> {
  return Effect.sync(() => {
    try {
      const { execSync } = require("child_process")
      const safeTitle = JSON.stringify(title)
      const safeMessage = JSON.stringify(message)
      const script = `display notification ${safeMessage} with title ${safeTitle}`
      execSync(`osascript -e ${JSON.stringify(script)}`, { stdio: "ignore" })
    } catch {
      // macOS notification failed, silently ignore
    }
  })
}

function notifyAll(channels: ConfigNotifier.Channels | undefined, title: string, message: string): Effect.Effect<void> {
  return Effect.gen(function* () {
    if (channels?.macos?.enabled) {
      yield* sendMacOSNotification(title, message)
    }
    if (channels?.telegram?.enabled && channels.telegram.botToken && channels.telegram.chatId) {
      const text = `<b>${title}</b>\n${message}`
      yield* sendTelegramMessage(channels.telegram.botToken, channels.telegram.chatId, text)
    }
  })
}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const bus = yield* Bus.Service
    const config = yield* Config.Service

    let cachedConfig = yield* Effect.promise(() => loadConfigFile())

    const getConfig = (): Effect.Effect<ConfigNotifier.Info> => Effect.sync(() => cachedConfig)

    const updateConfig = Effect.fn("Notifier.updateConfig")(function* (updates: Partial<ConfigNotifier.Info>) {
      const next: ConfigNotifier.Info = {
        enabled: updates.enabled ?? cachedConfig.enabled,
        locale: updates.locale ?? cachedConfig.locale,
        events: updates.events ?? cachedConfig.events,
        channels: {
          macos: {
            enabled: updates.channels?.macos?.enabled ?? cachedConfig.channels?.macos?.enabled ?? true,
          },
          telegram: {
            enabled: updates.channels?.telegram?.enabled ?? cachedConfig.channels?.telegram?.enabled ?? false,
            botToken: updates.channels?.telegram?.botToken ?? cachedConfig.channels?.telegram?.botToken ?? "",
            chatId: updates.channels?.telegram?.chatId ?? cachedConfig.channels?.telegram?.chatId ?? "",
          },
        },
      }
      cachedConfig = next
      yield* Effect.promise(() => saveConfigFile(cachedConfig))
    })

    const sendTelegram = Effect.fn("Notifier.sendTelegram")(function* (message: string) {
      const telegramChannel = cachedConfig.channels?.telegram
      if (!telegramChannel?.enabled || !telegramChannel.botToken || !telegramChannel.chatId) return
      yield* sendTelegramMessage(telegramChannel.botToken, telegramChannel.chatId, message)
    })

    yield* bus.subscribeAll().pipe(
      Stream.runForEach((event: any) =>
        Effect.gen(function* () {
          if (!cachedConfig.enabled) return

          const cfg = yield* config.get().pipe(Effect.orElseSucceed((): ConfigWithNotifier => ({})))
          const notifierConfig = cfg.notifier ?? cachedConfig
          if (!notifierConfig?.enabled) return

          const events = notifierConfig.events
          const channels = notifierConfig.channels

          if (event.type === "session.status") {
            const props = event.properties as { status: { type: string } }
            if (props.status?.type === "busy" && isEventEnabled(events, "sessionStarted")) {
              const message = getMessage(events, "sessionStarted", "Session started (busy)")
              yield* notifyAll(channels, "Session Started", message)
            }
            if (props.status?.type === "idle" && isEventEnabled(events, "sessionCompleted")) {
              const message = getMessage(events, "sessionCompleted", "Session completed")
              yield* notifyAll(channels, "Session Completed", message)
            }
          }

          if (event.type === "session.error") {
            if (isEventEnabled(events, "sessionError")) {
              const props = event.properties as { error?: any }
              const error = props.error
              const msg = typeof error === "string" ? error : (error?.message ?? "An error occurred")
              const message = getMessage(events, "sessionError", msg)
              yield* notifyAll(channels, "Session Error", message)
            }
          }

          if (event.type === "tool.execute.before") {
            if (isEventEnabled(events, "toolExecuting")) {
              const props = event.properties as { tool: string }
              const toolName = props.tool
              const message = getMessage(events, "toolExecuting", `Tool executing: ${toolName}`)
              yield* notifyAll(channels, "Tool Executing", message)
            }
          }

          if (event.type === "tool.execute.after") {
            if (isEventEnabled(events, "toolCompleted")) {
              const props = event.properties as { tool: string }
              const toolName = props.tool
              const message = getMessage(events, "toolCompleted", `Tool completed: ${toolName}`)
              yield* notifyAll(channels, "Tool Completed", message)
            }
          }

          if (event.type === "permission.asked") {
            if (isEventEnabled(events, "permissionRequested")) {
              const message = getMessage(events, "permissionRequested", "Permission approval requested")
              yield* notifyAll(channels, "Permission Requested", message)
            }
          }
        }).pipe(Effect.ignore),
      ),
      Effect.forkScoped,
    )

    return Service.of({ sendTelegram, updateConfig, getConfig })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Bus.layer),
  Layer.provide(Config.defaultLayer),
)

export * as Notifier from "."
