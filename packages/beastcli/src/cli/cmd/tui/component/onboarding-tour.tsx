import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useDialog } from "@tui/ui/dialog"
import { useKeyboard } from "@opentui/solid"
import { useKeybind } from "@tui/context/keybind"
import { createSignal, onMount } from "solid-js"
import { Show } from "solid-js"

export function OnboardingTour() {
  const dialog = useDialog()
  const { theme } = useTheme()

  const steps = [
    {
      title: "Welcome to BeastCLI",
      body: "Your AI-powered coding assistant in the terminal.",
      onNext: () => setStep(step() + 1),
    },
    {
      title: "Connect a Provider",
      body: "Before you start, press Ctrl+P and search for 'connect provider' to add your first AI model (e.g., OpenAI, Anthropic, or Ollama).",
      onNext: () => setStep(step() + 1),
    },
    {
      title: "Command Palette",
      body: "Use Ctrl+P (or the Command key on Mac) to open the command palette at any time. Everything you need is there.",
      onNext: () => setStep(step() + 1),
    },
    {
      title: "Quick Actions",
      body: "Press the leader key (Ctrl+X or Command+X) and then another key to switch models, themes, sessions, etc.",
      onNext: () => setStep(step() + 1),
    },
    {
      title: "Start Coding",
      body: "Once connected, type a prompt and press Enter. Visit beastcli.sridharhomelab.in/docs for more tips.",
      onNext: () => finish(),
    },
  ]

  const [step, setStep] = createSignal(0)

  onMount(() => {
    dialog.setSize("medium")
  })

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      evt.preventDefault()
      evt.stopPropagation()
      finish()
    }
    if (evt.name === "return" || evt.name === "right") {
      evt.preventDefault()
      evt.stopPropagation()
      steps[step()]?.onNext?.()
    }
  })

  function finish() {
    dialog.clear()
  }

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          {steps[step()]?.title ?? "BeastCLI"}
        </text>
        <text fg={theme.textMuted}>
          {step() + 1}/{steps.length}
        </text>
      </box>
      <box paddingBottom={1}>
        <text fg={theme.textMuted} wrapMode="word">
          {steps[step()]?.body ?? ""}
        </text>
      </box>
      <box flexDirection="row" justifyContent="space-between" paddingBottom={1}>
        <text fg={theme.textMuted} onMouseUp={() => finish()}>
          skip
        </text>
        <box flexDirection="row" gap={1}>
          <Show when={step() > 0}>
            <box
              paddingLeft={2}
              paddingRight={2}
              backgroundColor={theme.backgroundPanel}
              onMouseUp={() => setStep((s) => Math.max(0, s - 1))}
            >
              <text fg={theme.text}>{"< back"}</text>
            </box>
          </Show>
          <box paddingLeft={2} paddingRight={2} backgroundColor={theme.primary} onMouseUp={() => steps[step()]?.onNext?.()}>
            <text fg={theme.selectedListItemText}>{step() < steps.length - 1 ? "next >" : "done"}</text>
          </box>
        </box>
      </box>
    </box>
  )
}