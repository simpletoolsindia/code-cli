import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useConnected } from "@tui/component/use-connected"
import { createMemo } from "solid-js"
import os from "os"

// 🎨 Modern gradient key styles for each key type
const KEY_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  command:  { bg: "#7B61FF", fg: "#FFFFFF", icon: "◆" },
  leader:   { bg: "#00E5FF", fg: "#000000", icon: "▸" },
  stop:     { bg: "#FF3366", fg: "#FFFFFF", icon: "■" },
  model:    { bg: "#00E676", fg: "#000000", icon: "◇" },
  provider: { bg: "#FFAB00", fg: "#000000", icon: "◈" },
  help:     { bg: "#7C4DFF", fg: "#FFFFFF", icon: "?" },
}

// Detect platform for correct modifier key symbols
function getPlatformModifier() {
  const platform = os.platform()
  return {
    symbol: platform === "darwin" ? "⌘" : platform === "win32" ? "⊞" : "Ctrl",
    alt: platform === "darwin" ? "⌥" : "Alt",
  }
}

export function KeyboardShortcutsBar() {
  const { theme } = useTheme()
  const connected = useConnected()
  const mod = getPlatformModifier()

  const items = createMemo(() => {
    const base: Array<{ key: keyof typeof KEY_STYLES; label: string; desc: string }> = [
      { key: "command",  label: `${mod.symbol}+P`,   desc: "Commands" },
      { key: "leader",   label: `${mod.symbol}+X`,   desc: "Leader" },
      { key: "model",    label: `${mod.symbol}+K`,   desc: "Switch Model" },
      { key: "provider", label: `${mod.symbol}+S+P`, desc: "Switch Provider" },
      { key: "help",     label: `${mod.symbol}+X ?`, desc: "Help" },
    ]

    if (connected()) {
      base.splice(2, 0, { key: "stop", label: "Esc", desc: "Stop" })
    }

    return base
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

      {/* Spacer */}
      <box flexGrow={1} />

      {/* Platform indicator */}
      <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
        {os.platform() === "darwin" ? "🍎" : os.platform() === "win32" ? "🪟" : "🐧"} {mod.symbol}-based
      </text>
    </box>
  )
}
