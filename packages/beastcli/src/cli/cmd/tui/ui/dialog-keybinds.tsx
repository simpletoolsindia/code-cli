import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useDialog } from "@tui/ui/dialog"
import { useKeyboard } from "@opentui/solid"
import { useKeybind } from "@tui/context/keybind"
import { For, onMount } from "solid-js"

export function DialogKeybinds() {
  const dialog = useDialog()
  const { theme } = useTheme()
  const keybind = useKeybind()

  onMount(() => {
    dialog.setSize("large")
  })

  useKeyboard((evt) => {
    if (evt.name === "return" || evt.name === "escape") {
      evt.preventDefault()
      evt.stopPropagation()
      dialog.clear()
    }
  })

  const categories = [
    {
      name: "Navigation",
      items: [
        { action: "Command palette", keybind: keybind.print("command_list") || "Ctrl+P" },
        { action: "New session", keybind: keybind.print("session_new") || "Ctrl+X N" },
        { action: "Switch session", keybind: keybind.print("session_list") || "Ctrl+X L" },
        { action: "Go to start/end", keybind: "Ctrl+G / Ctrl+Alt+G" },
        { action: "Page up/down", keybind: "PgUp / PgDn" },
        { action: "Parent/child sessions", keybind: "Ctrl+X Right/Left" },
        { action: "Timeline", keybind: "Ctrl+X G" },
      ],
    },
    {
      name: "Model & Agent",
      items: [
        { action: "Switch model", keybind: keybind.print("model_list") || "Ctrl+X M" },
        { action: "Cycle recent", keybind: keybind.print("model_cycle_recent") || "F2" },
        { action: "Cycle recent (reverse)", keybind: keybind.print("model_cycle_recent_reverse") || "Shift+F2" },
        { action: "Cycle favorites", keybind: keybind.print("model_cycle_favorite") || "Ctrl+X F" },
        { action: "Switch agent", keybind: keybind.print("agent_list") || "Ctrl+X A" },
        { action: "Cycle agents", keybind: keybind.print("agent_cycle") || "Tab" },
        { action: "Switch variant", keybind: keybind.print("variant_list") || "Ctrl+X V" },
        { action: "Cycle variants", keybind: keybind.print("variant_cycle") || "Ctrl+X C" },
      ],
    },
    {
      name: "Session",
      items: [
        { action: "Rename", keybind: keybind.print("session_rename") || "Ctrl+X R" },
        { action: "Delete", keybind: keybind.print("session_delete") || "Ctrl+X D" },
        { action: "Export", keybind: "Ctrl+X X" },
        { action: "Copy last", keybind: "Ctrl+X Y" },
        { action: "Toggle sidebar", keybind: "Ctrl+X B" },
        { action: "Toggle blocks", keybind: "Ctrl+X H" },
      ],
    },
    {
      name: "System",
      items: [
        { action: "Help", keybind: keybind.print("help_show") || "Ctrl+X ?" },
        { action: "Status", keybind: keybind.print("status_view") || "Ctrl+X S" },
        { action: "Themes", keybind: keybind.print("theme_list") || "Ctrl+X T" },
        { action: "Toggle mode", keybind: "Ctrl+X M" },
        { action: "Suspend", keybind: keybind.print("terminal_suspend") || "Ctrl+Z" },
        { action: "External editor", keybind: "Ctrl+X E" },
      ],
    },
    {
      name: "Prompt",
      items: [
        { action: "Submit", keybind: "Enter" },
        { action: "Newline", keybind: "Shift+Enter / Ctrl+J" },
        { action: "Clear input", keybind: "Ctrl+C" },
        { action: "Stop AI", keybind: "Escape" },
        { action: "Attach file", keybind: "@filename" },
        { action: "Shell command", keybind: "!command" },
      ],
    },
  ]

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between" paddingBottom={1}>
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Keyboard Shortcuts
        </text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc/enter to close
        </text>
      </box>
      <box gap={1} paddingBottom={1}>
        <For each={categories}>
          {(category) => (
            <box gap={1}>
              <text attributes={TextAttributes.BOLD} fg={theme.primary}>
                {category.name}
              </text>
              <For each={category.items}>
                {(item) => (
                  <box flexDirection="row" justifyContent="space-between" paddingLeft={2}>
                    <text flexShrink={0} fg={theme.text} wrapMode="word" maxWidth={40}>
                      {item.action}
                    </text>
                    <text flexShrink={0} fg={theme.textMuted}>
                      {item.keybind}
                    </text>
                  </box>
                )}
              </For>
            </box>
          )}
        </For>
      </box>
    </box>
  )
}