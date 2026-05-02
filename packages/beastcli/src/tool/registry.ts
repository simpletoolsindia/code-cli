import { PlanExitTool } from "./plan"
import { Session } from "@/session/session"
import { QuestionTool } from "./question"
import { BashTool } from "./bash"
import { EditTool } from "./edit"
import { GlobTool } from "./glob"
import { GrepTool } from "./grep"
import { ReadTool } from "./read"
import { TaskTool } from "./task"
import { TodoWriteTool } from "./todo"
import { WebFetchTool } from "./webfetch"
import { WriteTool } from "./write"
import { InvalidTool } from "./invalid"
import { SkillTool } from "./skill"
import * as Tool from "./tool"
import { Config } from "@/config/config"
import { type ToolContext as PluginToolContext, type ToolDefinition } from "@simpletoolsindia/plugin"
import { Schema } from "effect"
import z from "zod"
import { ZodOverride } from "@/util/effect-zod"
import { Plugin } from "../plugin"
import { Provider } from "@/provider/provider"
import { ProviderID, type ModelID } from "../provider/schema"
import { WebSearchTool } from "./websearch"
import { Flag } from "@simpletoolsindia/core/flag/flag"
import * as Log from "@simpletoolsindia/core/util/log"
import { LspTool } from "./lsp"
import * as Truncate from "./truncate"
import { ApplyPatchTool } from "./apply_patch"
import { CodeCliTool } from "./code-cli"
import { PandasAggregateTool, PandasCreateTool, PandasFilterTool, PlotBarTool, PlotLineTool } from "./data"
import { HackerNewsBestTool, HackerNewsCommentsTool, HackerNewsNewTool, HackerNewsTopTool } from "./hackernews"
import { Glob } from "@simpletoolsindia/core/util/glob"
import path from "path"
import { pathToFileURL } from "url"
import { Effect, Layer, Context } from "effect"
import { FetchHttpClient, HttpClient } from "effect/unstable/http"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"
import { CrossSpawnSpawner } from "@simpletoolsindia/core/cross-spawn-spawner"
import { Ripgrep } from "../file/ripgrep"
import { Format } from "../format"
import { InstanceState } from "@/effect/instance-state"
import { Question } from "../question"
import { Todo } from "../session/todo"
import { LSP } from "@/lsp/lsp"
import { Instruction } from "../session/instruction"
import { AppFileSystem } from "@simpletoolsindia/core/filesystem"
import { Bus } from "../bus"
import { Agent } from "../agent/agent"
import { Skill } from "../skill"
import { Permission } from "@/permission"
import { YouTubeSearchTool, YouTubeSummarizeTool, YouTubeTranscriptTool, YouTubeVideoInfoTool } from "./youtube"

const log = Log.create({ service: "tool.registry" })
const TOOL_DEFINITION_CACHE_TTL = 5_000

type TaskDef = Tool.InferDef<typeof TaskTool>
type ReadDef = Tool.InferDef<typeof ReadTool>

type State = {
  custom: Tool.Def[]
  builtin: Tool.Def[]
  task: TaskDef
  read: ReadDef
}

export interface Interface {
  readonly ids: () => Effect.Effect<string[]>
  readonly all: () => Effect.Effect<Tool.Def[]>
  readonly named: () => Effect.Effect<{ task: TaskDef; read: ReadDef }>
  readonly tools: (model: { providerID: ProviderID; modelID: ModelID; agent: Agent.Info }) => Effect.Effect<Tool.Def[]>
}

export class Service extends Context.Service<Service, Interface>()("@simpletoolsindia/ToolRegistry") {}

export const layer: Layer.Layer<
  Service,
  never,
  | Config.Service
  | Plugin.Service
  | Question.Service
  | Todo.Service
  | Agent.Service
  | Skill.Service
  | Session.Service
  | Provider.Service
  | LSP.Service
  | Instruction.Service
  | AppFileSystem.Service
  | Bus.Service
  | HttpClient.HttpClient
  | ChildProcessSpawner
  | Ripgrep.Service
  | Format.Service
  | Truncate.Service
> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const config = yield* Config.Service
    const plugin = yield* Plugin.Service
    const agents = yield* Agent.Service
    const skill = yield* Skill.Service
    const truncate = yield* Truncate.Service

    const info = yield* Effect.all(
      {
        invalid: InvalidTool,
        task: TaskTool,
        read: ReadTool,
        question: QuestionTool,
        todo: TodoWriteTool,
        lsp: LspTool,
        plan: PlanExitTool,
        webfetch: WebFetchTool,
        websearch: WebSearchTool,
        bash: BashTool,
        glob: GlobTool,
        write: WriteTool,
        edit: EditTool,
        grep: GrepTool,
        patch: ApplyPatchTool,
        skill: SkillTool,
        codecli: CodeCliTool,
        hackernewsTop: HackerNewsTopTool,
        hackernewsNew: HackerNewsNewTool,
        hackernewsBest: HackerNewsBestTool,
        hackernewsComments: HackerNewsCommentsTool,
        pandasCreate: PandasCreateTool,
        pandasFilter: PandasFilterTool,
        pandasAggregate: PandasAggregateTool,
        plotLine: PlotLineTool,
        plotBar: PlotBarTool,
        youtubeTranscript: YouTubeTranscriptTool,
        youtubeVideoInfo: YouTubeVideoInfoTool,
        youtubeSearch: YouTubeSearchTool,
        youtubeSummarize: YouTubeSummarizeTool,
      },
      { concurrency: "unbounded" },
    )
    const agent = yield* Agent.Service

    const state = yield* InstanceState.make<State>(
      Effect.fn("ToolRegistry.state")(function* (ctx) {
        const custom: Tool.Def[] = []

        function fromPlugin(id: string, def: ToolDefinition): Tool.Def {
          // Plugin tools define their args as a raw Zod shape. Wrap the
          // derived Zod object in a `Schema.declare` so it slots into the
          // Schema-typed framework, and annotate with `ZodOverride` so the
          // walker emits the original Zod object for LLM JSON Schema.
          const zodParams = z.object(def.args)
          const parameters = Schema.declare<unknown>((u): u is unknown => zodParams.safeParse(u).success).annotate({
            [ZodOverride]: zodParams,
          })
          return {
            id,
            parameters,
            description: def.description,
            execute: (args, toolCtx) =>
              Effect.gen(function* () {
                const pluginCtx: PluginToolContext = {
                  ...toolCtx,
                  ask: (req) => toolCtx.ask(req),
                  directory: ctx.directory,
                  worktree: ctx.worktree,
                }
                const result = yield* Effect.promise(() => def.execute(args as any, pluginCtx))
                const output = typeof result === "string" ? result : result.output
                const metadata = typeof result === "string" ? {} : (result.metadata ?? {})
                const info = yield* agent.get(toolCtx.agent)
                const out = yield* truncate.output(output, {}, info)
                return {
                  title: "",
                  output: out.truncated ? out.content : output,
                  metadata: {
                    ...metadata,
                    truncated: out.truncated,
                    ...(out.truncated && { outputPath: out.outputPath }),
                  },
                }
              }),
          }
        }

        const dirs = yield* config.directories()
        const matches = dirs.flatMap((dir) =>
          Glob.scanSync("{tool,tools}/*.{js,ts}", { cwd: dir, absolute: true, dot: true, symlink: true }),
        )
        if (matches.length) yield* config.waitForDependencies()
        const fileTools = yield* Effect.forEach(
          matches,
          Effect.fnUntraced(function* (match) {
            const namespace = path.basename(match, path.extname(match))
            // `match` is an absolute filesystem path from `Glob.scanSync(..., { absolute: true })`.
            // Import it as `file://` so Node on Windows accepts the dynamic import.
            const mod = yield* Effect.promise(() => import(pathToFileURL(match).href))
            return Object.entries<ToolDefinition>(mod).map(([id, def]) =>
              fromPlugin(id === "default" ? namespace : `${namespace}_${id}`, def),
            )
          }),
          { concurrency: "unbounded" },
        )
        custom.push(...fileTools.flat())

        const plugins = yield* plugin.list()
        for (const p of plugins) {
          for (const [id, def] of Object.entries(p.tool ?? {})) {
            custom.push(fromPlugin(id, def))
          }
        }

        yield* config.get()
        const questionEnabled = ["app", "cli", "desktop"].includes(Flag.BEAST_CLIENT) || Flag.BEAST_ENABLE_QUESTION_TOOL

        const tool = yield* Effect.all({
          invalid: Tool.init(info.invalid),
          bash: Tool.init(info.bash),
          read: Tool.init(info.read),
          glob: Tool.init(info.glob),
          grep: Tool.init(info.grep),
          edit: Tool.init(info.edit),
          write: Tool.init(info.write),
          task: Tool.init(info.task),
          fetch: Tool.init(info.webfetch),
          todo: Tool.init(info.todo),
          search: Tool.init(info.websearch),
          skill: Tool.init(info.skill),
          patch: Tool.init(info.patch),
          codecli: Tool.init(info.codecli),
          hackernewsTop: Tool.init(info.hackernewsTop),
          hackernewsNew: Tool.init(info.hackernewsNew),
          hackernewsBest: Tool.init(info.hackernewsBest),
          hackernewsComments: Tool.init(info.hackernewsComments),
          pandasCreate: Tool.init(info.pandasCreate),
          pandasFilter: Tool.init(info.pandasFilter),
          pandasAggregate: Tool.init(info.pandasAggregate),
          plotLine: Tool.init(info.plotLine),
          plotBar: Tool.init(info.plotBar),
          youtubeTranscript: Tool.init(info.youtubeTranscript),
          youtubeVideoInfo: Tool.init(info.youtubeVideoInfo),
          youtubeSearch: Tool.init(info.youtubeSearch),
          youtubeSummarize: Tool.init(info.youtubeSummarize),
          question: Tool.init(info.question),
          lsp: Tool.init(info.lsp),
          plan: Tool.init(info.plan),
        })

        return {
          custom,
          builtin: [
            tool.invalid,
            ...(questionEnabled ? [tool.question] : []),
            tool.bash,
            tool.read,
            tool.glob,
            tool.grep,
            tool.edit,
            tool.write,
            tool.task,
            tool.fetch,
            tool.todo,
            tool.search,
            tool.hackernewsTop,
            tool.hackernewsNew,
            tool.hackernewsBest,
            tool.hackernewsComments,
            tool.pandasCreate,
            tool.pandasFilter,
            tool.pandasAggregate,
            tool.plotLine,
            tool.plotBar,
            tool.youtubeTranscript,
            tool.youtubeVideoInfo,
            tool.youtubeSearch,
            tool.youtubeSummarize,
            tool.skill,
            tool.patch,
            tool.codecli,
            ...(Flag.BEAST_EXPERIMENTAL_LSP_TOOL ? [tool.lsp] : []),
            ...(Flag.BEAST_EXPERIMENTAL_PLAN_MODE && Flag.BEAST_CLIENT === "cli" ? [tool.plan] : []),
          ],
          task: tool.task,
          read: tool.read,
        }
      }),
    )

    const all: Interface["all"] = Effect.fn("ToolRegistry.all")(function* () {
      const s = yield* InstanceState.get(state)
      return [...s.builtin, ...s.custom] as Tool.Def[]
    })

    const ids: Interface["ids"] = Effect.fn("ToolRegistry.ids")(function* () {
      return (yield* all()).map((tool) => tool.id)
    })

    const describeSkill = Effect.fn("ToolRegistry.describeSkill")(function* (agent: Agent.Info) {
      const list = yield* skill.available(agent)
      if (list.length === 0) return "No skills are currently available."
      return [
        "Load a specialized skill that provides domain-specific instructions and workflows.",
        "",
        "When you recognize that a task matches one of the available skills listed below, use this tool to load the full skill instructions.",
        "",
        "The skill will inject detailed instructions, workflows, and access to bundled resources (scripts, references, templates) into the conversation context.",
        "",
        'Tool output includes a `<skill_content name="...">` block with the loaded content.',
        "",
        "The following skills provide specialized sets of instructions for particular tasks",
        "Invoke this tool to load a skill when a task matches one of the available skills listed below:",
        "",
        Skill.fmt(list, { verbose: false }),
      ].join("\n")
    })

    const describeTask = Effect.fn("ToolRegistry.describeTask")(function* (agent: Agent.Info) {
      const items = (yield* agents.list()).filter((item) => item.mode !== "primary")
      const filtered = items.filter(
        (item) => Permission.evaluate("task", item.name, agent.permission).action !== "deny",
      )
      const list = filtered.toSorted((a, b) => a.name.localeCompare(b.name))
      const description = list
        .map(
          (item) =>
            `- ${item.name}: ${item.description ?? "This subagent should only be called manually by the user."}`,
        )
        .join("\n")
      return ["Available agent types and the tools they have access to:", description].join("\n")
    })

    const definitionCache = new Map<string, { at: number; tools: Tool.Def[] }>()
    const cacheKey = (input: Parameters<Interface["tools"]>[0]) =>
      JSON.stringify({
        providerID: input.providerID,
        modelID: input.modelID,
        agent: input.agent.name,
        permission: input.agent.permission,
      })

    const tools: Interface["tools"] = Effect.fn("ToolRegistry.tools")(function* (input) {
      const key = cacheKey(input)
      const cached = definitionCache.get(key)
      if (cached && Date.now() - cached.at < TOOL_DEFINITION_CACHE_TTL) return cached.tools

      const filtered = (yield* all()).filter((tool) => {
        if (tool.id === WebSearchTool.id) {
          return input.providerID === ProviderID.beastcli || Flag.BEAST_ENABLE_EXA
        }

        const usePatch =
          input.modelID.includes("gpt-") && !input.modelID.includes("oss") && !input.modelID.includes("gpt-4")
        if (tool.id === ApplyPatchTool.id) return usePatch
        if (tool.id === EditTool.id || tool.id === WriteTool.id) return !usePatch

        return true
      })

      const result = yield* Effect.forEach(
        filtered,
        Effect.fnUntraced(function* (tool: Tool.Def) {
          using _ = log.time(tool.id)
          const output = {
            description: tool.description,
            parameters: tool.parameters,
          }
          yield* plugin.trigger("tool.definition", { toolID: tool.id }, output)
          return {
            id: tool.id,
            description: [
              output.description,
              tool.id === TaskTool.id ? yield* describeTask(input.agent) : undefined,
              tool.id === SkillTool.id ? yield* describeSkill(input.agent) : undefined,
            ]
              .filter(Boolean)
              .join("\n"),
            parameters: output.parameters,
            execute: tool.execute,
            formatValidationError: tool.formatValidationError,
          }
        }),
        { concurrency: "unbounded" },
      )
      definitionCache.set(key, { at: Date.now(), tools: result })
      return result
    })

    const named: Interface["named"] = Effect.fn("ToolRegistry.named")(function* () {
      const s = yield* InstanceState.get(state)
      return { task: s.task, read: s.read }
    })

    return Service.of({ ids, all, named, tools })
  }),
)

export const defaultLayer = Layer.suspend(() =>
  layer.pipe(
    Layer.provide(Config.defaultLayer),
    Layer.provide(Plugin.defaultLayer),
    Layer.provide(Question.defaultLayer),
    Layer.provide(Todo.defaultLayer),
    Layer.provide(Skill.defaultLayer),
    Layer.provide(Agent.defaultLayer),
    Layer.provide(Session.defaultLayer),
    Layer.provide(Provider.defaultLayer),
    Layer.provide(LSP.defaultLayer),
    Layer.provide(Instruction.defaultLayer),
    Layer.provide(AppFileSystem.defaultLayer),
    Layer.provide(Bus.layer),
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(Format.defaultLayer),
    Layer.provide(CrossSpawnSpawner.defaultLayer),
    Layer.provide(Ripgrep.defaultLayer),
    Layer.provide(Truncate.defaultLayer),
  ),
)

export * as ToolRegistry from "./registry"
