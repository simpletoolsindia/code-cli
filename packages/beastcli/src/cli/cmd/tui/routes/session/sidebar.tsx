import { useProject } from "@tui/context/project"
import { useSync } from "@tui/context/sync"
import { useRoute } from "@tui/context/route"
import { createMemo, createSignal, createEffect, onCleanup, For, Show } from "solid-js"
import { useTheme } from "../../context/theme"
import { useTuiConfig } from "../../context/tui-config"

import { TuiPluginRuntime } from "@/cli/cmd/tui/plugin/runtime"
import { getScrollAcceleration } from "../../util/scroll"
import { useLocal } from "../../context/local"
import { Spinner, SidebarProgress } from "@tui/component/spinner"
import { useKeybind } from "@tui/context/keybind"
import type { AssistantMessage, ToolPart, UserMessage } from "@simpletoolsindia/sdk/v2"

function ContextAnimated(props: { pct?: number; label: string; theme: any; used: number }) {
  const [displayPct, setDisplayPct] = createSignal(0)

  createEffect(() => {
    const target = props.pct
    if (target === undefined) return
    const start = displayPct()
    if (start === target) return
    const frames = 20
    let frame = 0
    const timer = setInterval(() => {
      frame++
      setDisplayPct(Math.round(start + ((target - start) / frames) * frame))
      if (frame >= frames) {
        clearInterval(timer)
        setDisplayPct(target)
      }
    }, 30)
    onCleanup(() => clearInterval(timer))
  })

  const color = () =>
    (props.pct ?? 0) > 90 ? props.theme.error : (props.pct ?? 0) > 70 ? props.theme.warning : props.theme.primary

  return (
    <text fg={color()} attributes={1}>
      <b>Context: {props.pct === undefined ? props.label : `${displayPct()}% — ${props.label}`}</b>
    </text>
  )
}

function StatusBadge(props: { status: string }) {
  const { theme } = useTheme()
  const colors: Record<string, any> = {
    idle: theme.success,
    busy: theme.primary,
    retry: theme.warning,
    error: theme.error,
  }
  const icons: Record<string, string> = {
    idle: "◆",
    busy: "◈",
    retry: "⟳",
    error: "✕",
  }
  const labels: Record<string, string> = {
    idle: "Ready",
    busy: "Thinking",
    retry: "Retrying",
    error: "Error",
  }
  return (
    <box flexDirection="row" gap={1}>
      <text fg={colors[props.status] ?? theme.textMuted}>
        {icons[props.status] ?? "●"}
      </text>
      <text fg={colors[props.status] ?? theme.textMuted} attributes={3}>
        {labels[props.status] ?? props.status.toUpperCase()}
      </text>
    </box>
  )
}

function ToolCallItem(props: { tool: string; status: "running" | "done" | "error"; detail?: string }) {
  const { theme } = useTheme()
  const toolEmojis: Record<string, string> = {
    bash: "🐚",
    read: "📖",
    write: "📄",
    edit: "✏️",
    glob: "🔍",
    grep: "🔎",
    webfetch: "🌐",
    websearch: "🔎",
    task: "🤖",
    apply_patch: "🩹",
    todowrite: "📋",
    question: "❓",
    skill: "⚡",
  }
  const statusIcons: Record<string, string> = {
    running: "◈",
    done: "✓",
    error: "✕",
  }
  const statusColors: Record<string, any> = {
    running: theme.primary,
    done: theme.success,
    error: theme.error,
  }
  const emoji = toolEmojis[props.tool] || "🔧"
  const icon = statusIcons[props.status]
  const color = statusColors[props.status]
  return (
    <box flexDirection="row" gap={1} flexShrink={0}>
      <Show when={props.status === "running"} fallback={<text fg={color}>{`${emoji} ${icon}`}</text>}>
        <Spinner color={color}>{emoji}</Spinner>
      </Show>
      <text fg={theme.textMuted} wrapMode="word" flexShrink={1}>
        {props.tool}
        {props.detail && (
          <>
            {" "}
            <span style={{ fg: theme.textMuted, attributes: "dim" }}>{props.detail}</span>
          </>
        )}
      </text>
    </box>
  )
}

export function Sidebar(props: { sessionID: string; overlay?: boolean }) {
  const project = useProject()
  const sync = useSync()
  const route = useRoute()
  const { theme } = useTheme()
  const tuiConfig = useTuiConfig()
  const local = useLocal()
  const keybind = useKeybind()

  const session = createMemo(() => sync.session.get(props.sessionID))
  const status = createMemo(() => sync.data.session_status?.[props.sessionID])
  const messages = createMemo(() => sync.data.message[props.sessionID] ?? [])

  const recentSessions = createMemo(() => {
    const current = props.sessionID
    return sync.data.session.reduce<typeof sync.data.session>((acc, item) => {
      if (item.id === current || item.parentID !== undefined || item.time.archived) return acc
      const index = acc.findIndex((existing) => item.time.updated > existing.time.updated)
      const next = index === -1 ? [...acc, item] : [...acc.slice(0, index), item, ...acc.slice(index)]
      return next.slice(0, 5)
    }, [])
  })

  const workspaceStatus = () => {
    const workspaceID = session()?.workspaceID
    if (!workspaceID) return "error"
    return project.workspace.status(workspaceID) ?? "error"
  }

  const workspaceLabel = () => {
    const workspaceID = session()?.workspaceID
    if (!workspaceID) return "unknown"
    const info = project.workspace.get(workspaceID)
    if (!info) return "unknown"
    return `${info.type}: ${info.name}`
  }

  const scrollAcceleration = createMemo(() => getScrollAcceleration(tuiConfig))

  const messageStats = createMemo(() =>
    messages().reduce(
      (acc, message) => ({
        turns: acc.turns + (message.role === "user" ? 1 : 0),
        assistants: acc.assistants + (message.role === "assistant" ? 1 : 0),
      }),
      { turns: 0, assistants: 0 },
    ),
  )

  const lastUsage = createMemo(() => {
    const assistant = messages().findLast(
      (m): m is AssistantMessage => m.role === "assistant" && m.tokens.output > 0,
    )
    if (!assistant) return undefined
    const user = messages().findLast(
      (m): m is UserMessage => m.role === "user" && m.id < assistant.id,
    )
    return { assistant, user }
  })

  function contextLimit(input: { providerID: string; modelID: string; fallbackModelID?: string }) {
    const provider = sync.data.provider.find((p) => p.id === input.providerID)
    if (!provider) return 0
    const model =
      provider.models[input.modelID] ??
      (input.fallbackModelID ? provider.models[input.fallbackModelID] : undefined) ??
      Object.values(provider.models).find(
        (item) =>
          item.id === input.modelID ||
          item.api.id === input.modelID ||
          item.name === input.modelID ||
          (input.fallbackModelID &&
            (item.id === input.fallbackModelID ||
              item.api.id === input.fallbackModelID ||
              item.name === input.fallbackModelID)),
      )
    return model?.limit?.context ?? 0
  }

  const contextInfo = createMemo(() => {
    const usage = lastUsage()
    if (!usage) return { used: 0, limit: 0, pct: undefined, label: "No context data" }
    const tokens = usage.assistant.tokens
    const used = tokens.input + tokens.output + tokens.reasoning + (tokens.cache?.read ?? 0) + (tokens.cache?.write ?? 0)
    const limit = contextLimit({
      providerID: usage.assistant.providerID,
      modelID: usage.assistant.modelID,
      fallbackModelID:
        usage.user?.model.providerID === usage.assistant.providerID ? usage.user.model.modelID : undefined,
    })
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : undefined
    return {
      used,
      limit,
      pct,
      label: `${used.toLocaleString()}${limit > 0 ? ` / ${limit.toLocaleString()}` : ""} tokens`,
    }
  })

  // Current model
  const currentModel = createMemo(() => local.model.parsed())

  // Connected services
  const mcpCount = createMemo(() => Object.values(sync.data.mcp).filter((x) => x.status === "connected").length)

  const recentTools = createMemo(() => {
    const diffs = sync.data.session_diff[props.sessionID] ?? []
    const tools: Array<{ tool: string; status: "running" | "done" | "error"; detail: string }> = []
    const diff = diffs[0]
    if (diff) {
      tools.push({ tool: "edit_file", status: "done", detail: diff.file })
    }
    const recentParts = messages()
      .slice(-5)
      .flatMap((message) => sync.data.part[message.id] ?? [])
      .filter((part): part is ToolPart => part.type === "tool")
      .filter((part) => part.state.status !== "running")
      .map((part) => ({
        tool: part.tool,
        status: part.state.status === "error" ? "error" as const : "done" as const,
        detail: part.state.status === "completed" ? part.state.title : "",
      }))
    tools.push(...recentParts)
    return tools.slice(-4).reverse()
  })

  const runningTool = createMemo(() => {
    const list = messages()
    for (let i = list.length - 1; i >= 0; i--) {
      const part = (sync.data.part[list[i].id] ?? []).findLast(
        (part): part is ToolPart => part.type === "tool" && part.state.status === "running",
      )
      if (part?.state.status === "running") return { tool: part.tool, title: part.state.title }
    }
    return undefined
  })

  const retryStatus = createMemo(() => {
    const current = status()
    if (current?.type !== "retry") return undefined
    return current
  })

  const activityRows = createMemo(() => {
    const busy = status()?.type === "busy"
    const retry = status()?.type === "retry"
    const tool = runningTool()
    if (!busy && !retry && !tool) {
      return [{ label: "Ready", active: false, text: "Waiting for input" }]
    }
    return [
      { label: "Think", active: busy || retry, text: retry ? "Retrying..." : busy ? "Thinking..." : "Ready" },
      {
        label: "Process",
        active: Boolean(tool),
        text: tool ? `${tool.tool}${tool.title ? ` - ${tool.title}` : ""}` : "Idle",
      },
      { label: "Respond", active: busy && !tool, text: busy ? "Generating response..." : "Waiting" },
    ]
  })

  return (
    <Show when={session()}>
      <box
        backgroundColor={theme.backgroundPanel}
        width={42}
        height="100%"
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
        position={props.overlay ? "absolute" : "relative"}
        gap={1}
      >
        <scrollbox
          flexGrow={1}
          scrollAcceleration={scrollAcceleration()}
          verticalScrollbarOptions={{
            trackOptions: {
              backgroundColor: theme.background,
              foregroundColor: theme.borderActive,
            },
          }}
        >
          <box flexShrink={0} gap={1}>
            {/* Title + Session Info */}
            <TuiPluginRuntime.Slot
              name="sidebar_title"
              mode="single_winner"
              session_id={props.sessionID}
              title={session()!.title}
            >
              <box gap={1}>
                <box flexDirection="row" justifyContent="space-between" flexShrink={0}>
                  <text fg={theme.text} wrapMode="word" flexShrink={1}>
                    <b>{session()!.title}</b>
                  </text>
                  <StatusBadge status={status()?.type ?? "idle"} />
                </box>
                <box flexDirection="row" gap={2} flexShrink={0}>
                  <text fg={theme.textMuted}>
                    📝 {messageStats().turns} turns · 🤖 {messageStats().assistants} responses
                  </text>
                </box>
                <Show when={session()!.workspaceID}>
                  <text fg={theme.textMuted} flexShrink={0}>
                    <span style={{ fg: workspaceStatus() === "connected" ? theme.success : theme.error }}>●</span>{" "}
                    {workspaceLabel()}
                  </text>
                </Show>
              </box>
            </TuiPluginRuntime.Slot>

            {/* Context Usage */}
            <box gap={1} paddingTop={1} flexShrink={0}>
              <ContextAnimated pct={contextInfo().pct} label={contextInfo().label} theme={theme} used={contextInfo().used} />
            </box>

            <box gap={1} paddingTop={1} flexShrink={0}>
              <text fg={theme.text}>
                <b>Activity</b>
              </text>
              <Show when={status()?.type === "busy"} fallback={(
                <For each={activityRows()}>
                  {(row) => (
                    <box flexDirection="row" gap={1} flexShrink={0}>
                      <Show when={row.active} fallback={<text fg={theme.textMuted}>○</text>}>
                        <Spinner color={theme.primary}>◉</Spinner>
                      </Show>
                      <text fg={row.active ? theme.text : theme.textMuted} wrapMode="word" flexShrink={1}>
                        {row.label}: <span style={{ fg: theme.textMuted }}>{row.text}</span>
                      </text>
                    </box>
                  )}
                </For>
              )}>
                <SidebarProgress />
              </Show>
            </box>

            {/* Recent Tool Calls */}
            <Show when={recentTools().length > 0}>
              <box gap={1} paddingTop={1} flexShrink={0}>
                <text fg={theme.text}>
                  <b>Recent Operations</b>
                </text>
                <For each={recentTools()}>
                  {(tool) => (
                    <ToolCallItem tool={tool.tool} status={tool.status} detail={tool.detail} />
                  )}
                </For>
              </box>
            </Show>

            <Show when={retryStatus()}>
              {(retry) => (
              <box gap={1} flexShrink={0} border={["top"]} borderColor={theme.warning} paddingTop={1}>
                <box flexDirection="row" gap={1}>
                  <text fg={theme.warning}>⟳</text>
                  <text fg={theme.warning} attributes={2}>
                    <b>Retrying...</b>
                  </text>
                </box>
                <text fg={theme.textMuted}>
                  Attempt {retry().attempt}
                </text>
              </box>
              )}
            </Show>

            {/* Connected Services */}
            <box gap={1} paddingTop={1} flexShrink={0}>
              <text fg={theme.text}>
                <b>Services</b>
              </text>
              <box flexDirection="row" gap={2}>
                <text fg={mcpCount() > 0 ? theme.success : theme.textMuted}>
                  🔧 {mcpCount()} MCP{mcpCount() !== 1 ? "s" : ""}
                </text>
              </box>
            </box>

            {/* Recent Chat History */}
            <Show when={recentSessions().length > 0}>
              <box gap={1} paddingTop={1} flexShrink={0}>
                <text fg={theme.text}>
                  <b>Recent Chats</b>
                </text>
                <For each={recentSessions()}>
                  {(s) => {
                    const timeAgo = () => {
                      const diff = Date.now() - s.time.updated
                      const mins = Math.floor(diff / 60000)
                      if (mins < 60) return `${mins}m ago`
                      const hours = Math.floor(mins / 60)
                      if (hours < 24) return `${hours}h ago`
                      const days = Math.floor(hours / 24)
                      return `${days}d ago`
                    }
                    return (
                      <box
                        flexDirection="row"
                        justifyContent="space-between"
                        flexShrink={0}
                        onMouseUp={() => route.navigate({ type: "session", sessionID: s.id })}
                      >
                        <text fg={theme.text} wrapMode="word" flexShrink={1}>
                          💬 {s.title.length > 27 ? s.title.slice(0, 24) + "..." : s.title}
                        </text>
                        <text fg={theme.textMuted}>{timeAgo()}</text>
                      </box>
                    )
                  }}
                </For>
              </box>
            </Show>

            {/* Current Model */}
            <Show when={currentModel().provider !== "No provider"}>
              <box gap={1} paddingTop={1} flexShrink={0}>
                <text fg={theme.text}>
                  <b>Model</b>
                </text>
                <box flexDirection="row" gap={1}>
                  <text fg={theme.text}>{currentModel().model}</text>
                  <Show when={currentModel().reasoning}>
                    <text fg={theme.primary}>🧠</text>
                  </Show>
                </box>
                <text fg={theme.textMuted}>{currentModel().provider}</text>
                <text fg={theme.textMuted}>
                  Press {keybind.print("model_list")} to switch
                </text>
              </box>
            </Show>

            <TuiPluginRuntime.Slot name="sidebar_content" session_id={props.sessionID} />
          </box>
        </scrollbox>

        {/* Footer */}
        <box flexShrink={0} gap={1} paddingTop={1} border={["top"]} borderColor={theme.border}>
          <TuiPluginRuntime.Slot name="sidebar_footer" mode="single_winner" session_id={props.sessionID}>
            <box flexDirection="row" justifyContent="space-between">
              <text fg={theme.textMuted}>
                <span style={{ fg: theme.success }}>•</span> <b>Beast</b>
                <span style={{ fg: theme.text }}>
                  <b>CLI</b>
                </span>{" "}
                <span style={{ fg: theme.textMuted }}>— Made with love by SimpleTools India</span>
              </text>
              <text fg={theme.textMuted}>{keybind.print("sidebar_toggle")} toggle</text>
            </box>
          </TuiPluginRuntime.Slot>
        </box>
      </box>
    </Show>
  )
}
