import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useDialog } from "@tui/ui/dialog"
import { useKeyboard } from "@opentui/solid"
import { useKeybind } from "@tui/context/keybind"
import { createMemo, Show } from "solid-js"
import { useConnected } from "@tui/component/use-connected"
import { useProject } from "@tui/context/project"
import { useSync } from "@tui/context/sync"
import { useRoute } from "@tui/context/route"

export function BreadcrumbNav() {
  const { theme } = useTheme()
  const route = useRoute()

  const crumbs = createMemo(() => {
    switch (route.data.type) {
      case "home": {
        return []
      }
      case "session": {
        const session = useSync().session.get(route.data.sessionID)
        const name = session?.title ?? route.data.sessionID
        return ["Session", name]
      }
      case "plugin": {
        return ["Plugin", route.data.id]
      }
      default:
        return []
    }
  })

  return (
    <box flexDirection="row" gap={1}>
      {crumbs().map((crumb, i) => (
        <box flexDirection="row" gap={1}>
          <text attributes={TextAttributes.BOLD} fg={i === crumbs().length - 1 ? theme.text : theme.textMuted}>
            {crumb.length > 25 ? crumb.slice(0, 22) + "..." : crumb}
          </text>
          {i < crumbs().length - 1 && (
            <text fg={theme.primary}>{" > "}</text>
          )}
        </box>
      ))}
    </box>
  )
}
