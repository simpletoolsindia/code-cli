import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useDialog } from "@tui/ui/dialog"
import { useKeyboard } from "@opentui/solid"
import { useKeybind } from "@tui/context/keybind"
import { useConnected } from "@tui/component/use-connected"
import open from "open"

export function DialogHelp() {
  const dialog = useDialog()
  const { theme } = useTheme()
  const keybind = useKeybind()
  const connected = useConnected()

  useKeyboard((evt) => {
    if (evt.name === "return" || evt.name === "escape") {
      evt.preventDefault()
      evt.stopPropagation()
      dialog.clear()
    }
  })

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Help
        </text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc/enter
        </text>
      </box>
      <box paddingBottom={1} gap={1}>
        <text fg={theme.textMuted}>
          Press {keybind.print("command_list") ?? "Ctrl+P"} to see all available actions and commands in any context.
        </text>
        {!connected() && (
          <text fg={theme.textMuted}>
            No providers connected. Run /connect or open {keybind.print("command_list") ?? "the command palette"} to add one and get started.
          </text>
        )}
        <text fg={theme.textMuted}>
          All custom keybinds can be overridden in your tui.json configuration.
        </text>
        <text fg={theme.textMuted} wrapMode="word">
          Support: https://beastcli.sridharhomelab.in/docs or open an issue on the GitHub repository.
        </text>
      </box>
      <box flexDirection="row" justifyContent="flex-end" gap={1} paddingBottom={1}>
        <box paddingLeft={2} paddingRight={2} backgroundColor={theme.backgroundPanel} onMouseUp={() => open("https://beastcli.sridharhomelab.in/docs").catch(() => {})}>
          <text fg={theme.text}>docs</text>
        </box>
        <box
          paddingLeft={3}
          paddingRight={3}
          backgroundColor={theme.primary}
          onMouseUp={() => dialog.clear()}
        >
          <text fg={theme.selectedListItemText}>ok</text>
        </box>
      </box>
    </box>
  )
}
