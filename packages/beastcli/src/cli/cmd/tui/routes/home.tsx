import { Prompt, type PromptRef } from "@tui/component/prompt"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import { Logo } from "../component/logo"
import { useProject } from "../context/project"
import { useSync } from "../context/sync"
import { Toast } from "../ui/toast"
import { useArgs } from "../context/args"
import { useRoute, useRouteData } from "@tui/context/route"
import { usePromptRef } from "../context/prompt"
import { useLocal } from "../context/local"
import { TuiPluginRuntime } from "@/cli/cmd/tui/plugin/runtime"
import { BreadcrumbNav } from "@tui/component/breadcrumb-nav"
import { KeyboardShortcutsBar } from "@tui/component/keyboard-shortcuts-bar"
import { useTheme } from "../context/theme"
import { useTerminalDimensions } from "@opentui/solid"

let once = false
const placeholder = {
  normal: ["Fix a TODO in the codebase", "What is the tech stack of this project?", "Fix broken tests"],
  shell: ["ls -la", "git status", "pwd"],
}

export function Home() {
  const sync = useSync()
  const project = useProject()
  const routeData = useRouteData("home")
  const route = useRoute()
  const { theme } = useTheme()
  const dimensions = useTerminalDimensions()
  const promptRef = usePromptRef()
  const [ref, setRef] = createSignal<PromptRef | undefined>()
  const [hoveredSession, setHoveredSession] = createSignal<string>()
  const args = useArgs()
  const local = useLocal()
  let sent = false

  const bind = (r: PromptRef | undefined) => {
    setRef(r)
    promptRef.set(r)
    if (once || !r) return
    if (routeData.prompt) {
      r.set(routeData.prompt)
      once = true
      return
    }
    if (!args.prompt) return
    r.set({ input: args.prompt, parts: [] })
    once = true
  }

  // Wait for sync and model store to be ready before auto-submitting --prompt
  createEffect(() => {
    const r = ref()
    if (sent) return
    if (!r) return
    if (!sync.ready || !local.model.ready) return
    if (!args.prompt) return
    if (r.current.input !== args.prompt) return
    sent = true
    r.submit()
  })

  const recentChats = createMemo(() =>
    sync.data.session.reduce<typeof sync.data.session>((acc, item) => {
      if (item.parentID !== undefined || item.time.archived) return acc
      const index = acc.findIndex((existing) => item.time.updated > existing.time.updated)
      const next = index === -1 ? [...acc, item] : [...acc.slice(0, index), item, ...acc.slice(index)]
      return next.slice(0, 5)
    }, []),
  )
  const showRecentRail = createMemo(() => dimensions().width >= 112 && recentChats().length > 0)

  function timeAgo(updated: number) {
    const mins = Math.max(0, Math.floor((Date.now() - updated) / 60000))
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  function sessionTitle(title: string, max: number) {
    if (!title.trim()) return "Untitled chat"
    if (title.length <= max) return title
    return title.slice(0, max - 3) + "..."
  }

  function recentChatRows(maxTitle: number) {
    return (
      <For each={recentChats()}>
        {(session, index) => (
          <box
            flexDirection="row"
            justifyContent="space-between"
            gap={2}
            paddingLeft={1}
            paddingRight={1}
            backgroundColor={hoveredSession() === session.id ? theme.backgroundElement : theme.backgroundPanel}
            onMouseOver={() => setHoveredSession(session.id)}
            onMouseOut={() => setHoveredSession(undefined)}
            onMouseUp={() => route.navigate({ type: "session", sessionID: session.id })}
          >
            <text fg={hoveredSession() === session.id ? theme.text : theme.textMuted} flexShrink={1} wrapMode="none" overflow="hidden">
              <span style={{ fg: index() === 0 ? theme.primary : theme.textMuted }}>💬</span>{" "}
              {sessionTitle(session.title, maxTitle)}
            </text>
            <text fg={theme.textMuted} flexShrink={0}>
              {timeAgo(session.time.updated)}
            </text>
          </box>
        )}
      </For>
    )
  }

  return (
    <>
      <box flexDirection="row" flexGrow={1} minHeight={0}>
        <box flexGrow={1} alignItems="center" paddingLeft={2} paddingRight={2}>
          <box flexGrow={1} minHeight={0} />
          <BreadcrumbNav />
          <box flexGrow={1} minHeight={0} />
          <box height={4} minHeight={0} flexShrink={1} />
          <box flexShrink={0}>
            <TuiPluginRuntime.Slot name="home_logo" mode="replace">
              <Logo />
            </TuiPluginRuntime.Slot>
          </box>
          <box height={1} minHeight={0} flexShrink={1} />
          <box width="100%" maxWidth={75} zIndex={1000} paddingTop={1} flexShrink={0}>
            <TuiPluginRuntime.Slot
              name="home_prompt"
              mode="replace"
              workspace_id={project.workspace.current()}
              ref={bind}
            >
              <Prompt
                ref={bind}
                workspaceID={project.workspace.current()}
                right={<TuiPluginRuntime.Slot name="home_prompt_right" workspace_id={project.workspace.current()} />}
                placeholders={placeholder}
              />
            </TuiPluginRuntime.Slot>
          </box>
          <Show when={!showRecentRail() && recentChats().length > 0}>
            <box width="100%" maxWidth={75} paddingTop={1} gap={1} flexShrink={0}>
              <box flexDirection="row" justifyContent="space-between">
                <text fg={theme.text}>
                  <b>💬 Recent Chats</b>
                </text>
                <text fg={theme.textMuted}>select to continue</text>
              </box>
              {recentChatRows(58)}
            </box>
          </Show>
          <box flexGrow={1} minHeight={0} />
          <KeyboardShortcutsBar />
          <Toast />
        </box>
        <Show when={showRecentRail()}>
          <box
            width={34}
            height="100%"
            paddingTop={1}
            paddingBottom={1}
            paddingLeft={2}
            paddingRight={2}
            backgroundColor={theme.backgroundPanel}
            border={["left"]}
            borderColor={theme.border}
            gap={1}
            flexShrink={0}
          >
            <box gap={0} flexShrink={0}>
              <text fg={theme.text}>
                <b>💬 Recent Chats</b>
              </text>
              <text fg={theme.textMuted}>Pick up where you left off</text>
            </box>
            {recentChatRows(22)}
            <box flexGrow={1} minHeight={0} />
          </box>
        </Show>
      </box>
      <box width="100%" flexShrink={0}>
        <TuiPluginRuntime.Slot name="home_footer" mode="single_winner" />
      </box>
    </>
  )
}
