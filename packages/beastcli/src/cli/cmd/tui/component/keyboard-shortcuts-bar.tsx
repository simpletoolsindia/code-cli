import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useConnected } from "@tui/component/use-connected"
import { createMemo } from "solid-js"
import os from "os"

// 🎨 Modern gradient key styles for each key type
const KEY_STYLES: Record<string, { bg: string; fg: string; border: string; icon: string }> = {
  command: { bg: "#7B61FF", fg: "#FFFFFF", border: "#957DFF", icon: "◆" },
  leader: { bg: "#00E5FF", fg: "#000000", border: "#33EAFF", icon: "▸" },
  stop: { bg: "#FF3366", fg: "#FFFFFF", border: "#FF6688", icon: "■" },
  model: { bg: "#00E676", fg: "#000000", border: "#33EB91", icon: "◇" },
  provider: { bg: "#FFAB00", fg: "#000000", border: "#FFBC33", icon: "◈" },
  help: { bg: "#7C4DFF", fg: "#FFFFFF", border: "#9E7DFF", icon: "?" },
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

  // Modern gradient items with icons and descriptions
  const items = createMemo(() => {
    const base = [
      {
        key: "command",
        label: `${mod.symbol}+P`,
        desc: "Commands",
        shortcut: ["p"],
        glow: true,
      },
      {
        key: "leader",
        label: `${mod.symbol}+X`,
        desc: "Leader",
        shortcut: ["x"],
        glow: true,
      },
      {
        key: "model",
        label: `${mod.symbol}+K`,
        desc: "Switch Model",
        shortcut: ["k"],
        glow: true,
      },
      {
        key: "provider",
        label: `${mod.symbol}+Shift+P`,
        desc: "Switch Provider",
        shortcut: ["p", "shift"],
        glow: true,
      },
      {
        key: "help",
        label: `${mod.symbol}+X ?`,
        desc: "Help",
        shortcut: ["x"],
        glow: false,
      },
    ]

    if (connected()) {
      base.splice(2, 0, {
        key: "stop",
        label: "Esc",
        desc: "Stop",
        shortcut: ["escape"],
        glow: true,
      })
    }

    return base
  })

  return (
    <box height={1} flexDirection="row" gap={1} width="100%" maxHeight={1} alignItems="center">
      {/* Left decorative bracket */}
      <text flexShrink={0} fg={theme.primary}>
        {"╱"}
      </text>

      {/* Shortcut pills with gradient glow effects */}
      <box flexDirection="row" gap={1} flexShrink={0}>
        {items().map((item) => {
          const style = KEY_STYLES[item.key]
          return (
            <box flexDirection="row" gap={0} flexShrink={0} key={item.key}>
              {/* Glowing key badge */}
              <box
                flexDirection="row"
                gap={0}
                paddingLeft={1}
                paddingRight={1}
                flexShrink={0}
                borderStyle={item.glow ? "round" : "single"}
                borderColor={item.glow ? style.border : theme.border}
              >
                <text
                  fg={item.glow ? style.fg : theme.textMuted}
                  bg={item.glow ? style.bg : undefined}
                  attributes={TextAttributes.BOLD}
                >
                  {style.icon} {item.label}
                </text>
              </box>

              {/* Description with dimming */}
              <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
                {" "}{item.desc}
              </text>

              {/* Separator */}
              <text flexShrink={0} fg={theme.border} attributes={TextAttributes.DIM}>
                {" │ "}
              </text>
            </box>
          )
        })}
      </box>

      {/* Right decorative bracket */}
      <text flexShrink={0} fg={theme.primary}>
        {"╲"}
      </text>

      {/* Platform indicator */}
      <box flexGrow={1} />
      <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
        {os.platform() === "darwin" ? "🍎" : os.platform() === "win32" ? "🪟" : "🐧"} {mod.symbol}-based
      </text>
    </box>
  )
}
