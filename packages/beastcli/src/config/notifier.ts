import { Schema } from "effect"
import { withStatics } from "@/util/schema"
import { zod } from "@/util/effect-zod"

const TelegramChannelRaw = Schema.Struct({
  enabled: Schema.Boolean.annotate({ description: "Enable/disable Telegram notifications" }),
  botToken: Schema.String.annotate({ description: "Telegram Bot API token from @BotFather" }),
  chatId: Schema.String.annotate({ description: "Target chat/group ID" }),
}).annotate({ identifier: "TelegramChannel" })
export type TelegramChannel = Schema.Schema.Type<typeof TelegramChannelRaw>

const MacOSChannelRaw = Schema.Struct({
  enabled: Schema.Boolean.annotate({ description: "Enable/disable macOS native notifications" }),
}).annotate({ identifier: "MacOSChannel" })
export type MacOSChannel = Schema.Schema.Type<typeof MacOSChannelRaw>

const EventConfigRaw = Schema.Struct({
  enabled: Schema.Boolean.annotate({ description: "Whether to send this notification" }),
  message: Schema.optional(Schema.String).annotate({ description: "Custom message template" }),
}).annotate({ identifier: "EventConfig" })
export type EventConfig = Schema.Schema.Type<typeof EventConfigRaw>

const EventsRaw = Schema.Struct({
  sessionStarted: Schema.optional(EventConfigRaw),
  sessionCompleted: Schema.optional(EventConfigRaw),
  sessionError: Schema.optional(EventConfigRaw),
  sessionCompacted: Schema.optional(EventConfigRaw),
  toolExecuting: Schema.optional(EventConfigRaw),
  toolCompleted: Schema.optional(EventConfigRaw),
  permissionRequested: Schema.optional(EventConfigRaw),
  decisionNeeded: Schema.optional(EventConfigRaw),
  subagentStarted: Schema.optional(EventConfigRaw),
  subagentCompleted: Schema.optional(EventConfigRaw),
}).annotate({ identifier: "NotifierEvents" })
export type Events = Schema.Schema.Type<typeof EventsRaw>

const ChannelsRaw = Schema.Struct({
  macos: Schema.optional(MacOSChannelRaw),
  telegram: Schema.optional(TelegramChannelRaw),
}).annotate({ identifier: "NotifierChannels" })
export type Channels = Schema.Schema.Type<typeof ChannelsRaw>

export const Info = Schema.Struct({
  enabled: Schema.Boolean.annotate({ description: "Master toggle for all notifications" }),
  locale: Schema.optional(Schema.Literals(["en", "ko"])).annotate({ description: "Notification language" }),
  events: Schema.optional(EventsRaw),
  channels: Schema.optional(ChannelsRaw),
})
  .annotate({ identifier: "NotifierConfig" })
  .pipe(withStatics((s) => ({ zod: zod(s) })))
export type Info = Schema.Schema.Type<typeof Info>

export const defaults: Info = {
  enabled: true,
  locale: "en",
  events: {},
  channels: {
    macos: { enabled: true },
    telegram: { enabled: false, botToken: "", chatId: "" },
  },
}

export * as ConfigNotifier from "./notifier"
