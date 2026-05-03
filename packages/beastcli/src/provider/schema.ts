import { Schema } from "effect"

import { zod } from "@/util/effect-zod"
import { withStatics } from "@/util/schema"

const providerIdSchema = Schema.String.pipe(Schema.brand("ProviderID"))

export type ProviderID = typeof providerIdSchema.Type

export const ProviderID = providerIdSchema.pipe(
  withStatics((schema: typeof providerIdSchema) => ({
    zod: zod(schema),
    // Well-known providers
    beastcli: schema.make("beast"),
    anthropic: schema.make("anthropic"),
    openai: schema.make("openai"),
    google: schema.make("google"),
    googleVertex: schema.make("google-vertex"),
    githubCopilot: schema.make("github-copilot"),
    amazonBedrock: schema.make("amazon-bedrock"),
    azure: schema.make("azure"),
    openrouter: schema.make("openrouter"),
    mistral: schema.make("mistral"),
    gitlab: schema.make("gitlab"),
    // Local/self-hosted providers
    ollama: schema.make("ollama"),
    lmstudio: schema.make("lmstudio"),
    jan: schema.make("jan"),
    llamacpp: schema.make("llamacpp"),
    mlx: schema.make("mlx"),
    vllm: schema.make("vllm"),
  })),
)

const modelIdSchema = Schema.String.pipe(Schema.brand("ModelID"))

export type ModelID = typeof modelIdSchema.Type

export const ModelID = modelIdSchema.pipe(
  withStatics((schema: typeof modelIdSchema) => ({
    zod: zod(schema),
  })),
)
