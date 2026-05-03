import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useConnected } from "@tui/component/use-connected"
import { createMemo } from "solid-js"
import { useKeybind } from "@tui/context/keybind"

// 🎨 Modern gradient key styles for each key type
const KEY_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  command:  { bg: "#7B61FF", fg: "#FFFFFF", icon: "◆" },
  model:    { bg: "#00E676", fg: "#000000", icon: "◇" },
  agent:    { bg: "#FFAB00", fg: "#000000", icon: "◈" },
  stop:     { bg: "#FF3366", fg: "#FFFFFF", icon: "■" },
  help:     { bg: "#7C4DFF", fg: "#FFFFFF", icon: "?" },
}

export function KeyboardShortcutsBar() {
  const { theme } = useTheme()
  const connected = useConnected()
  const keybind = useKeybind()

  // Simplified shortcuts matching actual defaults from config/keybinds.ts
  const items = createMemo(() => {
    const base: Array<{ key: keyof typeof KEY_STYLES; label: string; desc: string }> = [
      { key: "command", label: keybind.print("command_list"), desc: "Commands" },
      { key: "model",   label: keybind.print("model_list"), desc: "Switch Model" },
      { key: "agent",   label: keybind.print("agent_cycle"), desc: "Switch Agent" },
      { key: "help",    label: keybind.print("help_show"), desc: "Help" },
    ]

    if (connected()) {
      base.splice(2, 0, { key: "stop", label: keybind.print("session_interrupt"), desc: "Stop" })
    }

    return base.filter((item) => item.label && item.label !== "none")
  })

  return (
    <box height={1} flexDirection="row" gap={1} width="100%" alignItems="center">
      {/* Left bracket */}
      <text flexShrink={0} fg={theme.primary}>{"["}</text>

      {/* Shortcut pills */}
      {items().map((item, i, arr) => {
        const style = KEY_STYLES[item.key]
        return (
          <box flexDirection="row" gap={0} flexShrink={0}>
            {/* Key badge with solid background */}
            <text
              flexShrink={0}
              fg={style.fg}
              bg={style.bg}
              attributes={TextAttributes.BOLD}
            >
              {" "}{style.icon}{" "}{item.label}{" "}
            </text>

            {/* Description */}
            <text flexShrink={0} fg={theme.textMuted}>
              {" "}{item.desc}
            </text>

            {/* Separator */}
            {i < arr.length - 1 && (
              <text flexShrink={0} fg={theme.border}>
                {" │ "}
              </text>
            )}
          </box>
        )
      })}

      {/* Right bracket */}
      <text flexShrink={0} fg={theme.primary}>{"]"}</text>

      <box flexGrow={1} />
    </box>
  )
}
