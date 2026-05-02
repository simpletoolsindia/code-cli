import { useProject } from "@tui/context/project"
import { useSync } from "@tui/context/sync"
import { createMemo, For, Show } from "solid-js"
import { useTheme } from "../../context/theme"
import { useTuiConfig } from "../../context/tui-config"
import { InstallationVersion } from "@simpletoolsindia/core/installation/version"
import { TuiPluginRuntime } from "@/cli/cmd/tui/plugin/runtime"
import { getScrollAcceleration } from "../../util/scroll"
import { useLocal } from "../../context/local"
import os from "os"

function ProgressBar(props: { percent: number; width: number }) {
  const { theme } = useTheme()
  const filled = Math.max(0, Math.min(props.width, Math.round((props.percent / 100) * props.width)))
  const empty = props.width - filled
  const color =
    props.percent > 95 ? theme.error : props.percent > 80 ? theme.warning : props.percent > 50 ? theme.text : theme.success

  return (
    <box flexDirection="row" flexShrink={0}>
      <text fg={color}>{"█".repeat(filled)}</text>
      <text fg={theme.background}>{"░".repeat(empty)}</text>
      <text fg={color}>{` ${props.percent}%`}</text>
    </box>
  )
}

function StatusBadge(props: { status: string }) {
  const { theme } = useTheme()
  const colors: Record<string, string> = {
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
  return (
    <text fg={colors[props.status] ?? theme.textMuted}>
      {icons[props.status] ?? "●"} {props.status.toUpperCase()}
    </text>
  )
}

function ToolCallItem(props: { tool: string; status: "running" | "done" | "error"; detail?: string }) {
  const { theme } = useTheme()
  const icon = props.status === "running" ? "⚡" : props.status === "done" ? "✓" : "✕"
  const color = props.status === "running" ? theme.primary : props.status === "done" ? theme.success : theme.error
  return (
    <box flexDirection="row" gap={1} flexShrink={0}>
      <text fg={color}>{icon}</text>
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
  const { theme } = useTheme()
  const tuiConfig = useTuiConfig()
  const local = useLocal()

  const session = createMemo(() => sync.session.get(props.sessionID))
  const status = createMemo(() => sync.data.session_status?.[props.sessionID])
  const messages = createMemo(() => sync.data.message[props.sessionID] ?? [])

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

  // Session metrics
  const turnCount = createMemo(() => messages().filter((m) => m.role === "user").length)
  const assistantCount = createMemo(() => messages().filter((m) => m.role === "assistant").length)

  // Context usage
  const lastAssistant = createMemo(() =>
    messages()
      .slice()
      .reverse()
      .find((m) => m.role === "assistant" && "tokens" in m && ((m as any).tokens?.output ?? 0) > 0),
  )

  const contextPercent = createMemo(() => {
    const last = lastAssistant() as any
    if (!last || !last.tokens) return 0
    const used = last.tokens.input + last.tokens.output + (last.tokens.reasoning ?? 0)
    const model = sync.data.provider.find((p) => p.id === last.providerID)?.models[last.modelID]
    if (!model?.limit?.context) return 0
    return Math.round((used / model.limit.context) * 100)
  })

  // Current model
  const currentModel = createMemo(() => local.model.parsed())

  // Connected services
  const mcpCount = createMemo(() => Object.values(sync.data.mcp).filter((x) => x.status === "connected").length)

  const providerCount = createMemo(() => sync.data.provider.filter((p) => (p as any).status === "available").length)

  // Mock recent tool calls from session diffs or messages
  const recentTools = createMemo(() => {
    const diffs = sync.data.session_diff[props.sessionID] ?? []
    const tools: Array<{ tool: string; status: "running" | "done" | "error"; detail: string }> = []
    const diff = diffs[0]
    if (diff) {
      tools.push({ tool: "edit_file", status: "done", detail: (diff as any).path ?? diff.file })
    }
    // Check last few messages for tool calls
    const lastMsgs = messages().slice(-5)
    for (const msg of lastMsgs as any[]) {
      if (msg.role === "tool") {
        tools.push({
          tool: msg.tool ?? "tool",
          status: msg.status === "error" ? "error" : "done",
          detail: msg.path ?? "",
        })
      }
    }
    return tools.slice(-4).reverse()
  })

  const isMac = os.platform() === "darwin"
  const mod = isMac ? "⌘" : "Ctrl"

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
                    📝 {turnCount()} turns · 🤖 {assistantCount()} responses
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

            {/* Context Usage Bar */}
            <box gap={1} paddingTop={1} flexShrink={0}>
              <text fg={theme.text}>
                <b>Context</b>
              </text>
              <ProgressBar percent={contextPercent()} width={30} />
              <text fg={theme.textMuted}>
                {(() => {
                  const last = lastAssistant()
                  if (!last || !(last as any).tokens) return "No context data"
                  const tokens = (last as any).tokens
                  const used = tokens.input + tokens.output
                  const limit = sync.data.provider.find((p) => p.id === (last as any).providerID)?.models[(last as any).modelID]?.limit?.context ?? 0
                  return `${used.toLocaleString()}${limit > 0 ? ` / ${limit.toLocaleString()}` : ""} tokens`
                })()}
              </text>
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

            {/* Live Operations / Current Status */}
            <Show when={status()?.type === "busy"}>
              <box gap={1} paddingTop={1} flexShrink={0}>
                <text fg={theme.primary}>
                  <b>⚡ Processing...</b>
                </text>
                <box flexDirection="row">
                  <text fg={theme.primary}>◈</text>
                  <text fg={theme.textMuted}>Generating response...</text>
                </box>
              </box>
            </Show>

            <Show when={status()?.type === "retry"}>
              <box gap={1} paddingTop={1} flexShrink={0}>
                <text fg={theme.warning}>
                  <b>⟳ Retrying...</b>
                </text>
                <text fg={theme.textMuted}>
                  Attempt {(status() as any)?.attempt ?? 1}
                </text>
              </box>
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
              <text fg={providerCount() > 0 ? theme.success : theme.textMuted}>
                ☁️ {providerCount()} provider{providerCount() !== 1 ? "s" : ""} available
              </text>
            </box>

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
                  Press {mod}+K to switch
                </text>
              </box>
            </Show>

            <TuiPluginRuntime.Slot name="sidebar_content" session_id={props.sessionID} />
          </box>
        </scrollbox>

        {/* Footer */}
        <box flexShrink={0} gap={1} paddingTop={1} borderTop={{ style: "single", color: theme.border }}>
          <TuiPluginRuntime.Slot name="sidebar_footer" mode="single_winner" session_id={props.sessionID}>
            <box flexDirection="row" justifyContent="space-between">
              <text fg={theme.textMuted}>
                <span style={{ fg: theme.success }}>•</span> <b>Beast</b>
                <span style={{ fg: theme.text }}>
                  <b>CLI</b>
                </span>{" "}
                <span>{InstallationVersion}</span>
              </text>
              <text fg={theme.textMuted}>{mod}+B toggle</text>
            </box>
          </TuiPluginRuntime.Slot>
        </box>
      </box>
    </Show>
  )
}
