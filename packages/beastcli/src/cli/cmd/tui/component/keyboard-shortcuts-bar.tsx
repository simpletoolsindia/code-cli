import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useConnected } from "@tui/component/use-connected"

export function KeyboardShortcutsBar() {
  const { theme } = useTheme()
  const connected = useConnected()

  const items = connected()
    ? [
        { label: "Ctrl+P", description: "Commands" },
        { label: "Ctrl+X", description: "Leader" },
        { label: "Esc", description: "Stop" },
        { label: "Ctrl+X ?", description: "Help" },
      ]
    : [
        { label: "Ctrl+P", description: "Palette" },
        { label: "Ctrl+X", description: "Leader" },
        { label: "Ctrl+X ?", description: "Help" },
      ]

  return (
    <box height={1} flexDirection="row" gap={1} width="100%" maxHeight={1}>
      <text flexShrink={0} fg={theme.textMuted} attributes={TextAttributes.DIM}>
        {" ── "}
      </text>
      {items.map((item) => (
        <box flexDirection="row" gap={0} flexShrink={0}>
          <text fg={theme.primary} attributes={TextAttributes.BOLD}>{item.label}</text>
          <text fg={theme.textMuted}>{" "}{item.description}</text>
        </box>
      ))}
      <text flexShrink={0} fg={theme.textMuted} attributes={TextAttributes.DIM}>
        {" ──"}
      </text>
    </box>
  )
}
