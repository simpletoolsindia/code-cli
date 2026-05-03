import { Show, createSignal, createEffect, onCleanup } from "solid-js"
import { useTheme } from "../context/theme"
import { useKV } from "../context/kv"
import type { JSX } from "@opentui/solid"
import type { RGBA } from "@opentui/core"
import "opentui-spinner/solid"

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

/** Premium gradient progress bar for sidebar context usage */
export function GradientProgressBar(props: {
  percent: number
  width?: number
  color?: RGBA
  showPercent?: boolean
}) {
  const { theme } = useTheme()
  const color = () => props.color ?? theme.primary
  const width = () => props.width ?? 20
  const pct = () => Math.max(0, Math.min(100, Math.round(props.percent)))
  const filled = () => Math.max(0, Math.min(width(), Math.round((pct() / 100) * width())))
  const empty = () => width() - filled()
  const [pulseIdx, setPulseIdx] = createSignal(0)
  createEffect(() => {
    const timer = setInterval(() => setPulseIdx((i) => (i + 1) % 5), 140)
    onCleanup(() => clearInterval(timer))
  })
  const pulseChar = () => {
    const pulse = ["▓", "▒", "░", "▒", "▓"]
    return pulse[pulseIdx()]
  }
  return (
    <box flexDirection="row" gap={1} flexShrink={0}>
      <text fg={color()}>
        {"█".repeat(Math.max(0, filled() - 1))}
        {filled() > 0 ? pulseChar() : ""}
      </text>
      <text fg={theme.textMuted}>{"░".repeat(Math.max(0, empty()))}</text>
      <Show when={props.showPercent}>
        <text fg={color()} attributes={3}>{` ${pct()}%`}</text>
      </Show>
    </box>
  )
}

/** Small circle spinner for prompt bar model indicator */
export function CircleSpinner(props: { color?: RGBA; size?: "sm" | "md" }) {
  const [tick, setTick] = createSignal(0)
  createEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 120)
    onCleanup(() => clearInterval(timer))
  })
  const c = () => props.color ?? theme.primary
  const { theme } = useTheme()
  const quarters = () => {
    const t = tick() % 4
    return ["◐", "◓", "◑", "◒"][t]
  }
  return <text fg={c()}>{quarters()}</text>
}
export function FullWidthProgress(props: {
  width?: number
  color?: RGBA
  state?: string
}) {
  const { theme } = useTheme()
  const c = () => props.color ?? theme.primary
  const state = () => props.state ?? "processing"
  const w = () => props.width ?? 40

  const [tick, setTick] = createSignal(0)
  createEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 120)
    onCleanup(() => clearInterval(timer))
  })

  const frame = () => frames[tick() % frames.length]

  const wave = () => {
    const width = w()
    const t = tick()
    const waveWidth = 6
    const center = t % (width + waveWidth)
    return Array.from({ length: width }, (_, i) => {
      const dist = Math.abs(i - center)
      if (dist === 0) return "█"
      if (dist === 1) return "▓"
      if (dist === 2) return "▒"
      if (dist <= waveWidth) return "░"
      return "░"
    }).join("")
  }

  return (
    <box flexDirection="row" gap={1} flexShrink={0} width="100%">
      <text fg={c()}>{frame()}</text>
      <text fg={c()}>{wave()}</text>
      <text fg={theme.textMuted}>{state()}</text>
    </box>
  )
}

/** Sidebar processing indicator — compact and clean */
export function SidebarProgress(props: { color?: RGBA }) {
  const { theme } = useTheme()
  const c = () => props.color ?? theme.primary
  const [tick, setTick] = createSignal(0)
  createEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 100)
    onCleanup(() => clearInterval(timer))
  })
  const frame = () => frames[tick() % frames.length]
  const dots = () => {
    const t = tick() % 4
    return ["   ", "·  ", "·· ", "···"][t]
  }
  return (
    <box flexDirection="row" gap={1}>
      <text fg={c()}>{frame()}</text>
      <text fg={c()}>Processing{dots()}</text>
    </box>
  )
}

export function Spinner(props: { children?: JSX.Element; color?: RGBA }) {
  const { theme } = useTheme()
  const kv = useKV()
  const color = () => props.color ?? theme.textMuted
  return (
    <Show when={kv.get("animations_enabled", true)} fallback={<text fg={color()}>⋯ {props.children}</text>}>
      <box flexDirection="row" gap={1}>
        <spinner frames={frames} interval={80} color={color()} />
        <Show when={props.children}>
          <text fg={color()}>{props.children}</text>
        </Show>
      </box>
    </Show>
  )
}
