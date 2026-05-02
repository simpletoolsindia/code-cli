import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useDialog } from "@tui/ui/dialog"
import { useKeyboard } from "@opentui/solid"
import { useKeybind } from "@tui/context/keybind"
import { For, createMemo } from "solid-js"
import { useToast } from "./toast"

export type ToastHistoryItem = {
  title?: string
  message: string
  variant: "info" | "success" | "warning" | "error"
  time: number
}

export function ToastHistoryDialog() {
  const dialog = useDialog()
  const { theme } = useTheme()
  const toast = useToast()

  useKeyboard((evt) => {
    if (evt.name === "return" || evt.name === "escape") {
      evt.preventDefault()
      evt.stopPropagation()
      dialog.clear()
    }
  })

  const history = createMemo(() => toast.history ?? [])

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between" paddingBottom={1}>
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Notifications
        </text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc/enter
        </text>
      </box>
      <box gap={1} maxHeight={20}>
        {history().length === 0 && (
          <box paddingBottom={1}>
            <text fg={theme.textMuted}>No notifications yet.</text>
          </box>
        )}
        <For each={history()}>
          {(item) => (
            <box flexDirection="row" gap={1}>
              <text
                flexShrink={0}
                fg={
                  {
                    info: theme.info,
                    success: theme.success,
                    warning: theme.warning,
                    error: theme.error,
                  }[item.variant]
                }
              >
                {"\u25CF"}
              </text>
              <box>
                {item.title && (
                  <text fg={theme.text} attributes={TextAttributes.BOLD} wrapMode="word">
                    {item.title}
                  </text>
                )}
                <text fg={theme.textMuted} wrapMode="word">
                  {item.message}
                </text>
              </box>
            </box>
          )}
        </For>
      </box>
    </box>
  )
}