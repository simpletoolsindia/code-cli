import type { AssistantMessage } from "@simpletoolsindia/sdk/v2"
import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@simpletoolsindia/plugin/tui"
import { createMemo } from "solid-js"

const id = "internal:sidebar-context"

function View(props: { api: TuiPluginApi; session_id: string }) {
  const theme = () => props.api.theme.current
  const msg = createMemo(() => props.api.state.session.messages(props.session_id))

  const state = createMemo(() => {
    const messages = msg()
    const totalTokens = messages.reduce(
      (sum, m) => {
        if ("tokens" in m && m.tokens) {
          sum.input += m.tokens.input ?? 0
          sum.output += m.tokens.output ?? 0
          sum.reasoning += m.tokens.reasoning ?? 0
          sum.cacheRead += m.tokens.cache?.read ?? 0
          sum.cacheWrite += m.tokens.cache?.write ?? 0
        }
        return sum
      },
      { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 },
    )
    const tokens = totalTokens.input + totalTokens.output + totalTokens.reasoning + totalTokens.cacheRead + totalTokens.cacheWrite

    const lastAssistant = messages.findLast(
      (item): item is AssistantMessage => item.role === "assistant" && item.tokens.output > 0,
    )
    const model = lastAssistant
      ? props.api.state.provider.find((item) => item.id === lastAssistant.providerID)?.models[lastAssistant.modelID]
      : undefined
    return {
      tokens,
      percent: model?.limit.context ? Math.min(100, Math.round((tokens / model.limit.context) * 100)) : null,
    }
  })

  return (
    <box>
      <text fg={theme().text}>
        <b>Context</b>
      </text>
      <text fg={theme().textMuted}>{state().tokens.toLocaleString()} tokens</text>
      <text fg={theme().textMuted}>{state().percent ?? 0}% used</text>
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props) {
        return <View api={api} session_id={props.session_id} />
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
