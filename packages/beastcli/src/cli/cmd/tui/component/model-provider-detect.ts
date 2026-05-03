export type DetectedLocalProvider = {
  id: "ollama" | "lmstudio" | "jan" | "llamacpp" | "mlx" | "vllm"
  name: string
  baseURL: string
  status: "ready" | "not_running" | "error"
  message?: string
  models: {
    id: string
    name: string
  }[]
}

const LOCAL_PROVIDERS = [
  {
    id: "ollama",
    name: "Ollama",
    baseURL: "http://localhost:11434/v1",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    baseURL: "http://localhost:1234/v1",
  },
  {
    id: "jan",
    name: "Jan",
    baseURL: "http://localhost:1337/v1",
  },
  {
    id: "llamacpp",
    name: "llama.cpp",
    baseURL: "http://localhost:8080/v1",
  },
  {
    id: "mlx",
    name: "MLX",
    baseURL: "http://localhost:8080/v1",
  },
  {
    id: "vllm",
    name: "vLLM",
    baseURL: "http://localhost:8000/v1",
  },
] as const

function timeoutSignal(ms: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return {
    signal: controller.signal,
    clear() {
      clearTimeout(timer)
    },
  }
}

export async function probeLocalModelProviders(input: { timeout?: number } = {}) {
  return Promise.all(
    LOCAL_PROVIDERS.map(async (provider): Promise<DetectedLocalProvider> => {
      const timeout = timeoutSignal(input.timeout ?? 900)
      try {
        const response = await fetch(`${provider.baseURL}/models`, {
          signal: timeout.signal,
        })
        if (!response.ok) {
          return {
            ...provider,
            status: "error",
            message: `${response.status} ${response.statusText}`,
            models: [],
          }
        }
        const data: unknown = await response.json()
        const models: unknown[] =
          typeof data === "object" && data !== null && "data" in data && Array.isArray(data.data) ? data.data : []
        return {
          ...provider,
          status: "ready",
          models: models.flatMap((model) => {
            if (typeof model !== "object" || model === null || !("id" in model)) return []
            if (typeof model.id !== "string" || model.id.length === 0) return []
            return [
              {
                id: model.id,
                name: "name" in model && typeof model.name === "string" && model.name.length > 0 ? model.name : model.id,
              },
            ]
          }),
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {
          ...provider,
          status:
            (error instanceof DOMException && error.name === "AbortError") ||
            error instanceof TypeError ||
            message.includes("Unable to connect")
              ? "not_running"
              : "error",
          message,
          models: [],
        }
      } finally {
        timeout.clear()
      }
    }),
  )
}
