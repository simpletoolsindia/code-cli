import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import * as Log from "@simpletoolsindia/core/util/log"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"
import { ChildProcess } from "effect/unstable/process"
import { Stream } from "effect"
import path from "path"

const log = Log.create({ service: "beastcli" })

type Metadata = {
  action: Schema.Schema.Type<typeof Parameters>["action"]
  target?: string
  line?: number
  left?: string
  right?: string
}

function result(input: Tool.ExecuteResult<Metadata>) {
  return input
}

export const Parameters = Schema.Struct({
  action: Schema.Literals(["open", "goto", "diff", "folder", "reveal"]).annotate({
    description: "The VS Code: action to perform",
  }),
  target: Schema.String.annotate({
    description:
      "File path or folder path to open. For 'goto', use 'file:line' format. For 'diff', use comma-separated paths.",
  }),
})

export const CodeCliTool = Tool.define(
  "code_cli",
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner

    const findCode = Effect.gen(function* () {
      const candidates =
        process.platform === "win32" ? ["code.cmd", "code.exe", "code"] : ["code", "code-insiders", "codium"]

      for (const candidate of candidates) {
        const proc = ChildProcess.make("which", [candidate], { extendEnv: true })
        const handle = yield* spawner.spawn(proc)
        const out = yield* Stream.mkString(Stream.decodeText(handle.stdout))
        const code = yield* handle.exitCode
        if (code === 0 && out.trim()) return candidate
      }

      return "code"
    })

    const runCode = Effect.fnUntraced(function* (args: string[]) {
      const code = yield* findCode
      log.info("beastcli editor integration executing", { code, args })
      const proc = ChildProcess.make(code, args, { extendEnv: true })
      const handle = yield* spawner.spawn(proc)
      const out = yield* Stream.mkString(Stream.decodeText(handle.stdout))
      const err = yield* Stream.mkString(Stream.decodeText(handle.stderr))
      const exit = yield* handle.exitCode
      if (exit !== 0) {
        log.warn("beastcli editor integration failed", { exit, err })
        return { output: `VS Code: command failed: ${err || out}`, success: false }
      }
      return { output: out.trim() || "Done", success: true }
    }, Effect.scoped)

    return {
      description: `Integrates with the VS Code: CLI (code) to open files, navigate to lines, show diffs, or reveal folders in the editor.\n\n- action=open: Opens a file in VS Code:\n- action=goto: Opens a file at a specific line using file:line format\n- action=diff: Opens a diff between two files\n- action=folder: Opens a folder in VS Code:\n- action=reveal: Reveals a file in the explorer sidebar`,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const { action, target } = params

          switch (action) {
            case "open": {
              const abs = path.resolve(target)
              const { output, success } = yield* runCode(["--goto", abs])
              return result({
                title: `Open ${path.basename(abs)}`,
                metadata: { action, target: abs },
                output: success ? `Opened ${abs} in VS Code:` : output,
              })
            }
            case "goto": {
              const [file, lineStr] = target.split(":")
              const abs = path.resolve(file)
              const line = lineStr ? Number(lineStr) : 1
              const arg = `${abs}:${line}`
              const { output, success } = yield* runCode(["--goto", arg])
              return result({
                title: `Go to ${path.basename(abs)}:${line}`,
                metadata: { action, target: abs, line },
                output: success ? `Opened ${arg} in VS Code:` : output,
              })
            }
            case "diff": {
              const [left, right] = target.split(",").map((s) => s.trim())
              if (!left || !right) throw new Error("Diff target must be two comma-separated paths")
              const absLeft = path.resolve(left)
              const absRight = path.resolve(right)
              const { output, success } = yield* runCode(["--diff", absLeft, absRight])
              return result({
                title: `Diff ${path.basename(absLeft)} ↔ ${path.basename(absRight)}`,
                metadata: { action, left: absLeft, right: absRight },
                output: success ? `Opened diff in VS Code:` : output,
              })
            }
            case "folder": {
              const abs = path.resolve(target)
              const { output, success } = yield* runCode(["--new-window", abs])
              return result({
                title: `Open folder ${path.basename(abs)}`,
                metadata: { action, target: abs },
                output: success ? `Opened folder ${abs} in VS Code:` : output,
              })
            }
            case "reveal": {
              const abs = path.resolve(target)
              const { output, success } = yield* runCode(["--reveal", abs])
              return result({
                title: `Reveal ${path.basename(abs)}`,
                metadata: { action, target: abs },
                output: success ? `Revealed ${abs} in VS Code: explorer` : output,
              })
            }
            default:
              throw new Error(`Unsupported VS Code action: ${action}`)
          }
        }).pipe(Effect.orDie),
    }
  }),
)
