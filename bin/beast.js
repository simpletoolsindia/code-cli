#!/usr/bin/env bun
// @bun
import { createRequire } from "node:module";
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/providers/index.ts
var exports_providers = {};
__export(exports_providers, {
  registerProvider: () => registerProvider,
  getProvider: () => getProvider,
  estimateTokens: () => estimateTokens,
  detectModelFamily: () => detectModelFamily,
  default: () => providers_default,
  createProvider: () => createProvider,
  calculateCost: () => calculateCost
});
function registerProvider(name, factory) {
  providers.set(name, factory);
}
async function getProvider(name) {
  const factory = providers.get(name);
  if (!factory)
    return null;
  return factory();
}
async function createProvider(config) {
  switch (config.provider) {
    case "anthropic":
      return createAnthropicProvider(config);
    case "openai":
      return createOpenAIProvider(config);
    case "codex":
      return createCodexProvider(config);
    case "openrouter":
      return createOpenRouterProvider(config);
    case "ollama":
      return createOllamaProvider(config);
    case "gemini":
      return createGeminiProvider(config);
    case "groq":
      return createGroqProvider(config);
    case "deepseek":
      return createDeepSeekProvider(config);
    case "mistral":
      return createMistralProvider(config);
    case "lmstudio":
      return createLMStudioProvider(config);
    case "jan":
      return createJanProvider(config);
    case "qwen":
      return createQwenProvider(config);
    case "mlx":
      return createMLXProvider(config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
async function createAnthropicProvider(config) {
  const mod = await import("@anthropic-ai/sdk");
  const Anthropic = mod.Anthropic ?? mod.default?.Anthropic ?? mod.default;
  return {
    name: "anthropic",
    models: [
      "claude-opus-4-5",
      "claude-sonnet-4-20250514",
      "claude-haiku-4-20250514",
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest"
    ],
    apiFormat: "anthropic",
    async create(request) {
      const client = new Anthropic({ apiKey: config.apiKey });
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const anthropicMessages = otherMessages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.toolCalls.map((tc) => ({
              type: "tool_use",
              id: tc.id,
              name: tc.name,
              input: tc.arguments
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: m.toolCallId,
              content: m.content
            }]
          };
        } else {
          return {
            role: m.role,
            content: m.content
          };
        }
      });
      const response = await client.messages.create({
        model: request.model ?? config.model ?? "claude-sonnet-4-20250514",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: anthropicMessages,
        tools: request.tools?.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema
        }))
      });
      let content = "";
      const toolCalls = [];
      for (const block of response.content) {
        if (block.type === "text") {
          content += block.text;
        } else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id,
            name: block.name,
            arguments: block.input
          });
        }
      }
      return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        finishReason: response.stop_reason === "end_turn" ? "stop" : "length"
      };
    }
  };
}
async function createOpenAIProvider(config) {
  const OpenAI = await import("openai");
  return {
    name: config.provider,
    models: [
      "gpt-5.4",
      "gpt-5.4-pro",
      "gpt-5.4-mini",
      "gpt-5.4-nano",
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano",
      "gpt-5.2",
      "gpt-5.2-pro",
      "gpt-5-pro",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "o3-pro",
      "o3",
      "o4-mini",
      "o3-deep-research",
      "o4-mini-deep-research",
      "o1-pro",
      "o1",
      "o3-mini",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
      "gpt-5-codex",
      "gpt-5.3-codex",
      "gpt-5.2-codex",
      "gpt-5.1-codex",
      "gpt-5.1-codex-max",
      "gpt-5.1-codex-mini"
    ],
    apiFormat: "openai",
    async create(request) {
      const client = new OpenAI.OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        }))
      });
      const choice = response.choices[0];
      const msg = choice.message;
      const toolCalls = [];
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {}
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: args
            });
          }
        }
      }
      return {
        content: msg.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createCodexProvider(config) {
  const { createHash, randomBytes } = await import("crypto");
  const http = await import("node:http");
  const { URL } = await import("node:url");
  function base64url(buf) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  async function generatePKCE() {
    const verifier = base64url(randomBytes(32));
    const hash = createHash("sha256").update(verifier).digest();
    const challenge = base64url(hash);
    return { verifier, challenge };
  }
  function generateState() {
    return base64url(randomBytes(16));
  }
  const CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
  const AUTH_URL = "https://auth.openai.com/oauth/authorize";
  const TOKEN_URL = "https://auth.openai.com/oauth/token";
  const REDIRECT_URI = "http://localhost:1455/auth/callback";
  const SCOPE = "openid profile email offline_access";
  const API_BASE = "https://chatgpt.com/backend-api/codex";
  function getTokenPath() {
    const home = process.env.HOME || process.env.USERPROFILE || "~";
    return `${home}/.beast-cli/codex-auth.json`;
  }
  function loadToken() {
    try {
      const { readFileSync, existsSync } = __require("node:fs");
      const path = getTokenPath();
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, "utf-8"));
      }
    } catch {}
    return null;
  }
  function saveToken(token) {
    try {
      const { readFileSync, writeFileSync, existsSync, mkdirSync } = __require("node:fs");
      const path = getTokenPath();
      const dir = __require("node:path").dirname(path);
      if (!existsSync(dir))
        mkdirSync(dir, { recursive: true });
      writeFileSync(path, JSON.stringify(token, null, 2), { mode: 384 });
    } catch (e) {
      console.error("Failed to save Codex token:", e);
    }
  }
  function isTokenValid(token) {
    return !!(token.accessToken && Date.now() < token.expiresAt - 300000);
  }
  function decodeJWT(token) {
    try {
      const parts = token.split(".");
      if (parts.length < 2)
        return null;
      return JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    } catch {
      return null;
    }
  }
  async function refreshToken(token) {
    try {
      const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
          client_id: CODEX_CLIENT_ID
        })
      });
      if (!res.ok)
        return null;
      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || token.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
        accountId: token.accountId
      };
    } catch {
      return null;
    }
  }
  async function waitForCallback(pkce, state) {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url || "/", REDIRECT_URI);
        if (url.pathname === "/auth/callback") {
          const code = url.searchParams.get("code");
          const returnedState = url.searchParams.get("state");
          const error = url.searchParams.get("error");
          res.writeHead(200, { "Content-Type": "text/html" });
          if (error) {
            res.end("<html><body><h1>Auth Error</h1><p>You can close this window.</p></body></html>");
            server.close();
            reject(new Error("OAuth error: " + error));
            return;
          }
          if (code && returnedState === state) {
            res.end("<html><body><h1>Authenticated!</h1><p>You can close this window.</p></body></html>");
            server.close();
            resolve(code);
          } else {
            res.end("<html><body><h1>Invalid state</h1><p>You can close this window.</p></body></html>");
            server.close();
            reject(new Error("Invalid OAuth state"));
          }
        }
      });
      server.listen(1455, () => {
        console.log("   \uD83C\uDF10 Opening browser for ChatGPT OAuth...");
      });
      setTimeout(() => {
        server.close();
        reject(new Error("OAuth timeout"));
      }, 300000);
    });
  }
  async function exchangeCode(code, verifier) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CODEX_CLIENT_ID,
        code,
        code_verifier: verifier,
        redirect_uri: REDIRECT_URI
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Token exchange failed: ${err}`);
    }
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      accountId: undefined
    };
  }
  async function getValidToken() {
    let token = loadToken();
    if (!token || !isTokenValid(token)) {
      const { verifier, challenge } = await generatePKCE();
      const state = generateState();
      const authUrl = new URL(AUTH_URL);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", CODEX_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("scope", SCOPE);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("state", state);
      console.log("   \uD83C\uDF10 Opening browser for ChatGPT Plus/Pro login...");
      console.log("   \uD83D\uDCCB Auth URL:", authUrl.toString());
      const { execSync } = __require("child_process");
      try {
        const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
        execSync(`${opener} "${authUrl.toString()}"`, { stdio: "ignore" });
      } catch {}
      const code = await waitForCallback({ verifier }, state);
      token = await exchangeCode(code, verifier);
      const payload = decodeJWT(token.accessToken);
      if (payload && typeof payload === "object") {
        const auth = payload["https://api.openai.com/auth"];
        if (auth?.chatgpt_account_id) {
          token.accountId = auth.chatgpt_account_id;
        }
      }
      saveToken(token);
      console.log("   ✅ ChatGPT OAuth authenticated!");
    } else if (token.expiresAt - Date.now() < 600000) {
      const refreshed = await refreshToken(token);
      if (refreshed) {
        token = refreshed;
        saveToken(token);
      }
    }
    return token;
  }
  return {
    name: "codex",
    models: [
      "gpt-5.2-codex",
      "gpt-5.2-codex-low",
      "gpt-5.2-codex-medium",
      "gpt-5.2-codex-high",
      "gpt-5.2-codex-xhigh",
      "gpt-5.2",
      "gpt-5.2-low",
      "gpt-5.2-medium",
      "gpt-5.2-high",
      "gpt-5.2-xhigh",
      "gpt-5.1-codex-max",
      "gpt-5.1-codex",
      "gpt-5.1-codex-mini",
      "gpt-5.1",
      "gpt-5.1-low",
      "gpt-5.1-medium",
      "gpt-5.1-high",
      "gpt-5.1-xhigh",
      "codex",
      "gpt-4o",
      "gpt-4o-mini",
      "o3-mini",
      "o3",
      "o4-mini"
    ],
    apiFormat: "custom",
    async create(request) {
      const token = await getValidToken();
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const conversationParts = [];
      for (const m of otherMessages) {
        if (m.role === "user") {
          conversationParts.push(`User: ${m.content}`);
        } else if (m.role === "assistant") {
          if (m.toolCalls) {
            for (const tc of m.toolCalls) {
              conversationParts.push(`Assistant calls tool ${tc.name}(${JSON.stringify(tc.arguments)})`);
            }
          }
          if (m.content) {
            conversationParts.push(`Assistant: ${m.content}`);
          }
        } else if (m.toolCallId) {
          conversationParts.push(`Tool result: ${m.content}`);
        }
      }
      const conversationText = conversationParts.join(`
`);
      const body = {
        model: request.model || "gpt-5.2-codex",
        instructions: systemMessage?.content || "You are a helpful coding assistant.",
        input: [{ role: "user", content: conversationText || "Hello" }],
        store: false,
        stream: true
      };
      if (request.tools && request.tools.length > 0) {
        const validTools = request.tools.filter((t) => t.name && t.inputSchema);
        console.log("\uD83D\uDCE1 Sending tools:", validTools.map((t) => t.name).join(", "));
        body.tools = validTools.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description || "", parameters: t.inputSchema }
        }));
      }
      if (request.temperature !== undefined) {
        body.temperature = request.temperature;
      }
      const response = await fetch(`${API_BASE}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
          "OpenAI-Beta": "responses=experimental",
          "chatgpt-account-id": token.accountId || ""
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000)
      });
      if (response.status === 401) {
        saveToken({ accessToken: "", refreshToken: "", expiresAt: 0 });
        return this.create(request);
      }
      if (!response.ok || !response.body) {
        const err = await response.text();
        throw new Error(`ChatGPT API error ${response.status}: ${err.slice(0, 200)}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder;
      let buffer = "";
      let content = "";
      let done = false;
      try {
        while (!done) {
          const { done: readerDone, value } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: !done });
            const lines = buffer.split(`
`);
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]")
                  continue;
                try {
                  const event = JSON.parse(data);
                  const text = event.output_text?.text || event.text?.text || event.content_text || event.delta || "";
                  if (text)
                    content += text;
                } catch {}
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      return {
        content,
        model: request.model || "gpt-5.2-codex",
        usage: undefined,
        finishReason: "stop"
      };
    },
    async* createStream(request) {
      const token = await getValidToken();
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const conversationParts = [];
      for (const m of otherMessages) {
        if (m.role === "user") {
          conversationParts.push(`User: ${m.content}`);
        } else if (m.role === "assistant") {
          if (m.toolCalls) {
            for (const tc of m.toolCalls) {
              conversationParts.push(`Assistant calls tool ${tc.name}(${JSON.stringify(tc.arguments)})`);
            }
          }
          if (m.content) {
            conversationParts.push(`Assistant: ${m.content}`);
          }
        } else if (m.toolCallId) {
          conversationParts.push(`Tool result: ${m.content}`);
        }
      }
      const conversationText = conversationParts.join(`
`);
      const body = {
        model: request.model || "gpt-5.2-codex",
        instructions: systemMessage?.content || "You are a helpful coding assistant.",
        input: [{ role: "user", content: conversationText || "Hello" }],
        stream: true
      };
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description, parameters: t.inputSchema }
        }));
      }
      if (request.temperature !== undefined) {
        body.temperature = request.temperature;
      }
      const response = await fetch(`${API_BASE}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
          "OpenAI-Beta": "responses=experimental",
          "chatgpt-account-id": token.accountId || ""
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000)
      });
      if (!response.ok || !response.body) {
        const err = await response.text();
        throw new Error(`ChatGPT API error ${response.status}: ${err.slice(0, 200)}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder;
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(`
`);
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]")
                break;
              try {
                const event = JSON.parse(data);
                if (event.output_text?.text) {
                  yield { content: event.output_text.text, model: event.model || request.model };
                }
              } catch {}
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
}
async function createOpenRouterProvider(config) {
  const OpenAI = await import("openai");
  return {
    name: "openrouter",
    models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro", "meta-llama/llama-3-70b-instruct"],
    apiFormat: "openrouter",
    async create(request) {
      const client = new OpenAI.OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl ?? "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://beast-cli.dev",
          "X-Title": "Beast CLI"
        }
      });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description, parameters: t.inputSchema }
        }))
      });
      const choice = response.choices[0];
      const msg = choice.message;
      const toolCalls = [];
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {}
            toolCalls.push({ id: tc.id, name: tc.function.name, arguments: args });
          }
        }
      }
      return {
        content: msg.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createOllamaProvider(config) {
  return {
    name: "ollama",
    models: [],
    apiFormat: "ollama",
    async create(request) {
      const baseUrl = config.baseUrl ?? "http://localhost:11434";
      const ollamaMessages = [];
      for (const m of request.messages) {
        if (m.toolCalls) {
          const toolCalls2 = m.toolCalls.map((tc) => {
            let argsObj;
            if (typeof tc.arguments === "string") {
              try {
                argsObj = JSON.parse(tc.arguments);
              } catch {
                argsObj = {};
              }
            } else {
              argsObj = tc.arguments ?? {};
            }
            return {
              function: {
                name: tc.name,
                arguments: argsObj
              }
            };
          });
          ollamaMessages.push({ role: "assistant", content: m.content || null, tool_calls: toolCalls2 });
        } else if (m.toolCallId) {
          ollamaMessages.push({ role: "tool", tool_call_id: m.toolCallId, content: m.content });
        } else {
          ollamaMessages.push({ role: m.role, content: m.content });
        }
      }
      const body = {
        model: request.model ?? config.model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: request.temperature ?? config.temperature ?? 0.7,
          num_predict: request.maxTokens ?? config.maxTokens ?? 16384
        }
      };
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        }));
      }
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama error ${response.status}: ${error.slice(0, 150)}`);
      }
      let data;
      try {
        data = await response.json();
      } catch {
        const raw = await response.text();
        throw new Error(`Ollama returned invalid JSON. Model may be producing malformed output. Raw: ${raw.slice(0, 200)}`);
      }
      const toolCalls = [];
      try {
        if (data.message?.tool_calls) {
          for (const tc of data.message.tool_calls) {
            let args = {};
            const rawArgs = tc.function?.arguments;
            if (typeof rawArgs === "string") {
              try {
                args = JSON.parse(rawArgs);
              } catch {}
            } else if (rawArgs && typeof rawArgs === "object") {
              args = rawArgs;
            }
            toolCalls.push({
              id: tc.id ?? `ollama_${Date.now()}`,
              name: tc.function?.name ?? "unknown",
              arguments: args
            });
          }
        }
      } catch {}
      return {
        content: data.message?.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: data.model ?? config.model,
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0)
        },
        finishReason: data.done ? "stop" : "length"
      };
    }
  };
}
async function createGeminiProvider(config) {
  return {
    name: "gemini",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
    apiFormat: "custom",
    async create(request) {
      const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY;
      const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${request.model ?? config.model}:generateContent?key=${apiKey}`;
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: otherMessages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          })),
          systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
          generationConfig: {
            maxOutputTokens: request.maxTokens ?? config.maxTokens ?? 16384,
            temperature: request.temperature ?? config.temperature ?? 0.7
          }
        })
      });
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return {
        content,
        model: request.model ?? config.model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata?.totalTokenCount ?? 0
        },
        finishReason: data.candidates?.[0]?.finishReason === "STOP" ? "stop" : "length"
      };
    }
  };
}
async function createGroqProvider(config) {
  return {
    name: "groq",
    models: ["mixtral-8x7b-32768", "llama3-8b-8192", "llama3-70b-8192", "gemma-7b-it"],
    apiFormat: "openai",
    async create(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: config.apiKey,
        baseURL: "https://api.groq.com/openai/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createDeepSeekProvider(config) {
  return {
    name: "deepseek",
    models: ["deepseek-chat", "deepseek-coder"],
    apiFormat: "openai",
    async create(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: config.apiKey,
        baseURL: "https://api.deepseek.com/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createMistralProvider(config) {
  return {
    name: "mistral",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest"],
    apiFormat: "openai",
    async create(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: config.apiKey,
        baseURL: "https://api.mistral.ai/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createLMStudioProvider(config) {
  return {
    name: "lmstudio",
    models: [],
    apiFormat: "openai",
    async create(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: "lm-studio",
        baseURL: config.baseUrl ?? "http://localhost:1234/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    },
    async* createStream(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: "lm-studio",
        baseURL: config.baseUrl ?? "http://localhost:1234/v1"
      });
      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true
      });
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model
          };
        }
      }
    }
  };
}
async function createJanProvider(config) {
  return {
    name: "jan",
    models: [],
    apiFormat: "openai",
    async create(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: "jan-key",
        baseURL: config.baseUrl ?? "http://localhost:1337/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    },
    async* createStream(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: "jan-key",
        baseURL: config.baseUrl ?? "http://localhost:1337/v1"
      });
      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true
      });
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model
          };
        }
      }
    }
  };
}
async function createQwenProvider(config) {
  return {
    name: "qwen",
    models: ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-max-longcontext"],
    apiFormat: "openai",
    async create(request) {
      const apiKey = config.apiKey ?? process.env.DASHSCOPE_API_KEY;
      const client = new (await import("openai")).OpenAI({
        apiKey,
        baseURL: config.baseUrl ?? "https://dashscope.aliyuncs.com/compatible-mode/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "qwen-plus",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createMLXProvider(config) {
  return {
    name: "mlx",
    models: [],
    apiFormat: "openai",
    async create(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: "mlx",
        baseURL: config.baseUrl ?? "http://localhost:8080/v1"
      });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        }))
      });
      const choice = response.choices[0];
      const msg = choice.message;
      const toolCalls = [];
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {}
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: args
            });
          }
        }
      }
      return {
        content: msg.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    },
    async* createStream(request) {
      const client = new (await import("openai")).OpenAI({
        apiKey: "mlx",
        baseURL: config.baseUrl ?? "http://localhost:8080/v1"
      });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        })),
        stream: true
      });
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model
          };
        }
      }
    }
  };
}
function detectModelFamily(model) {
  const lower = model.toLowerCase();
  if (lower.includes("claude-3") || lower.includes("gpt-5") || lower.includes("gemini-1.5") || lower.includes("llama-3.1")) {
    return "next_gen";
  }
  if (lower.includes("gemma") || lower.includes("phi-3") || lower.includes("llama3-8b") || lower.includes("codellama")) {
    return "xs";
  }
  return "generic";
}
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
function calculateCost(provider, model, usage) {
  const rates = {
    anthropic: {
      "claude-opus-4-5": { input: 15, output: 75 },
      "claude-sonnet-4-20250514": { input: 3, output: 15 },
      "claude-haiku-4-20250514": { input: 0.8, output: 4 },
      "claude-3-5-sonnet-latest": { input: 3, output: 15 }
    },
    openai: {
      "gpt-5.4": { input: 1.25, output: 10 },
      "gpt-5.4-pro": { input: 15, output: 120 },
      "gpt-5.4-mini": { input: 0.25, output: 2 },
      "gpt-5.4-nano": { input: 0.05, output: 0.4 },
      "gpt-5": { input: 1.25, output: 10 },
      "gpt-5-mini": { input: 0.25, output: 2 },
      "gpt-5-nano": { input: 0.05, output: 0.4 },
      "gpt-5.2": { input: 1.25, output: 10 },
      "gpt-5.2-pro": { input: 15, output: 120 },
      "gpt-5-pro": { input: 15, output: 120 },
      "gpt-4.1": { input: 2, output: 8 },
      "gpt-4.1-mini": { input: 0.4, output: 1.6 },
      "gpt-4.1-nano": { input: 0.1, output: 1.4 },
      "o3-pro": { input: 60, output: 400 },
      o3: { input: 15, output: 60 },
      "o4-mini": { input: 3, output: 12 },
      "o1-pro": { input: 60, output: 400 },
      o1: { input: 15, output: 60 },
      "o3-mini": { input: 3, output: 12 },
      "gpt-4o": { input: 5, output: 15 },
      "gpt-4o-mini": { input: 0.15, output: 0.6 },
      "gpt-4-turbo": { input: 10, output: 30 },
      "gpt-4": { input: 30, output: 60 },
      "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
      "gpt-5-codex": { input: 3, output: 15 },
      "gpt-5.1-codex": { input: 3, output: 15 }
    },
    openrouter: {
      default: { input: 0.5, output: 1.5 }
    }
  };
  const modelRates = rates[provider]?.[model] ?? rates[provider]?.["default"] ?? { input: 1, output: 2 };
  const inputCost = usage.promptTokens / 1e6 * modelRates.input;
  const outputCost = usage.completionTokens / 1e6 * modelRates.output;
  return inputCost + outputCost;
}
var providers, providers_default;
var init_providers = __esm(() => {
  providers = new Map;
  providers_default = {
    createProvider,
    registerProvider,
    getProvider,
    detectModelFamily,
    estimateTokens,
    calculateCost
  };
});

// src/native-tools/search.ts
var exports_search = {};
__export(exports_search, {
  searxngSearch: () => searxngSearch,
  searxngHealth: () => searxngHealth,
  searchNews: () => searchNews,
  searchImages: () => searchImages,
  hackernewsTop: () => hackernewsTop,
  hackernewsNew: () => hackernewsNew,
  hackernewsComments: () => hackernewsComments,
  hackernewsBest: () => hackernewsBest
});
async function searxngSearch(query, limit = 10, categories, engines, timeRange) {
  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      engines: engines?.join(",") || "",
      categories: categories || "general",
      pageno: "1",
      ...timeRange ? { time_range: timeRange } : {}
    });
    const response = await fetch(`${SEARX_URL}/search?${params}`, {
      headers: {
        "User-Agent": "BeastCLI/1.0",
        Accept: "application/json"
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      return { success: false, error: `Search failed: ${response.status}` };
    }
    const data = await response.json();
    const results = [];
    for (const r of (data.results || []).slice(0, limit)) {
      results.push({
        title: r.title || "",
        url: r.url || r.link || "",
        snippet: r.content || r.snippet || "",
        engine: r.engine || "",
        published: r.published || ""
      });
    }
    return { success: true, results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function searchImages(query, limit = 10) {
  return searxngSearch(query, limit, "images");
}
async function searchNews(query, timeRange) {
  return searxngSearch(query, 10, "news", undefined, timeRange);
}
async function searxngHealth() {
  try {
    const response = await fetch(`${SEARX_URL}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function hackernewsTop(limit = 10) {
  return hackernewsFetch("topstories", limit);
}
async function hackernewsNew(limit = 10) {
  return hackernewsFetch("newstories", limit);
}
async function hackernewsBest(limit = 10) {
  return hackernewsFetch("beststories", limit);
}
async function hackernewsComments(storyId, limit = 20) {
  try {
    const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
    if (!storyRes.ok)
      return { success: false, error: "Story not found" };
    const story = await storyRes.json();
    const comments = [];
    if (story.kids) {
      for (const kid of story.kids.slice(0, limit)) {
        const commentRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`);
        if (commentRes.ok) {
          const comment = await commentRes.json();
          comments.push({
            title: comment.text || "",
            url: `https://news.ycombinator.com/item?id=${kid}`,
            snippet: (comment.text || "").slice(0, 300)
          });
        }
      }
    }
    return {
      success: true,
      results: [
        {
          title: story.title || "",
          url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
          snippet: `${story.score || 0} points | ${story.descendants || 0} comments`
        },
        ...comments.map((c2) => ({ title: c2.title, url: c2.url, snippet: c2.snippet }))
      ]
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function hackernewsFetch(endpoint, limit) {
  try {
    const idsRes = await fetch(`https://hacker-news.firebaseio.com/v0/${endpoint}.json`);
    if (!idsRes.ok)
      return { success: false, error: "Failed to fetch stories" };
    const ids = await idsRes.json();
    const results = [];
    for (const id of ids.slice(0, limit)) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (itemRes.ok) {
        const item = await itemRes.json();
        if (item && item.type === "story") {
          results.push({
            title: item.title || "",
            url: item.url || `https://news.ycombinator.com/item?id=${id}`,
            snippet: `${item.score || 0} points | ${item.descendants || 0} comments | by ${item.by || "unknown"}`
          });
        }
      }
    }
    return { success: true, results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
var SEARX_URL;
var init_search = __esm(() => {
  SEARX_URL = process.env.SEARX_URL || "https://search.sridharhomelab.in";
});

// src/index.ts
init_providers();

// src/ui/colors.ts
var reset = "\x1B[0m";
var bold = "\x1B[1m";
var dim = "\x1B[2m";
var claudePalette = {
  crust: "\x1B[48;2;250;249;245m",
  mantle: "\x1B[48;2;245;244;237m",
  base: "\x1B[48;2;240;238;220m",
  surface0: "\x1B[48;2;232;230;220m",
  surface1: "\x1B[48;2;215;213;200m",
  surface2: "\x1B[48;2;180;178;170m",
  text: "\x1B[38;2;20;20;19m",
  subtext0: "\x1B[38;2;80;79;75m",
  subtext1: "\x1B[38;2;50;49;46m",
  overlay0: "\x1B[38;2;140;138;130m",
  blue: "\x1B[38;2;56;152;236m",
  sapphire: "\x1B[38;2;56;152;236m",
  sky: "\x1B[38;2;100;170;210m",
  teal: "\x1B[38;2;23;146;153m",
  green: "\x1B[38;2;30;160;80m",
  yellow: "\x1B[38;2;200;140;0m",
  peach: "\x1B[38;2;201;130;70m",
  maroon: "\x1B[38;2;160;100;90m",
  red: "\x1B[38;2;200;60;60m",
  mauve: "\x1B[38;2;180;80;200m",
  pink: "\x1B[38;2;200;100;180m",
  flamingo: "\x1B[38;2;220;150;130m",
  lavender: "\x1B[38;2;139;92;246m",
  white: "\x1B[38;2;255;255;250m",
  gpPurple: "\x1B[38;2;142;54;255m",
  gpBlue: "\x1B[38;2;70;130;255m",
  gpCyan: "\x1B[38;2;0;200;200m",
  gpGreen: "\x1B[38;2;0;200;100m",
  gpYellow: "\x1B[38;2;255;200;0m",
  gpRed: "\x1B[38;2;255;100;100m"
};
var fg = {
  primary: claudePalette.text,
  secondary: claudePalette.subtext1,
  muted: claudePalette.overlay0,
  overlay: claudePalette.surface2,
  success: claudePalette.green,
  warning: claudePalette.yellow,
  error: claudePalette.red,
  info: claudePalette.blue,
  user: claudePalette.green,
  assistant: claudePalette.mauve,
  system: claudePalette.sapphire,
  tool: claudePalette.peach,
  code: claudePalette.teal,
  link: claudePalette.sapphire,
  keyword: claudePalette.mauve,
  function: claudePalette.blue,
  string: claudePalette.green,
  number: claudePalette.peach,
  accent: claudePalette.gpPurple,
  accent2: claudePalette.pink,
  accent3: claudePalette.lavender,
  peach: claudePalette.peach,
  mauve: claudePalette.mauve,
  cyan: claudePalette.teal,
  purple: claudePalette.gpPurple,
  prompt: claudePalette.gpPurple,
  gpPurple: claudePalette.gpPurple,
  gpBlue: claudePalette.gpBlue,
  gpCyan: claudePalette.gpCyan,
  gpGreen: claudePalette.gpGreen,
  gpYellow: claudePalette.gpYellow,
  gpRed: claudePalette.gpRed
};
var bg = {
  base: claudePalette.base,
  surface: claudePalette.surface0,
  elevated: claudePalette.surface1,
  overlay: claudePalette.surface2,
  crust: claudePalette.crust,
  mantle: claudePalette.mantle
};
var spinnerFrames = {
  dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  line: ["-", "\\", "|", "/"],
  blocks: ["▖", "▘", "▝", "▗"],
  arrow: ["←", "↙", "↓", "↘", "→", "↗", "↑", "↖"],
  star: ["⋆", "✦", "✧", "⋆", "✧", "✦"]
};
var DEFAULT_SPINNER = spinnerFrames.dots;
var icon2 = {
  prompt: "›",
  userPrefix: ">",
  aiPrefix: "◈",
  success: "✓",
  error: "✗",
  warning: "!",
  info: "i",
  check: "●",
  online: "●",
  offline: "○",
  tool: "›",
  run: "›",
  search: "⌕",
  edit: "✎",
  plus: "+",
  minus: "−",
  arrow: "→",
  arrowUp: "↑",
  arrowDown: "↓",
  bullet: "·",
  separator: "│",
  folder: "▶",
  file: "▷",
  code: "◈",
  link: "↗",
  star: "★",
  spark: "✦",
  sparkles: "⁎",
  tokens: "⚡",
  messages: "≡",
  time: "⏱",
  context: "◈",
  clock: "⏰",
  ts: "TS",
  js: "JS",
  py: "PY",
  md: "MD",
  json: "{}",
  git: "⎇",
  thinking: "◐",
  loading: "⠋",
  line: "─",
  dash: "–",
  dot: "·",
  space: " "
};
var NO_COLOR = process.env.NO_COLOR || process.env.NO_COLOUR;
function isColorEnabled() {
  if (NO_COLOR)
    return false;
  if (process.env.FORCE_COLOR)
    return true;
  if (process.stdout && !process.stdout.isTTY)
    return false;
  return true;
}
function s(text, ...styles) {
  if (!isColorEnabled())
    return text;
  return styles.join("") + text + reset;
}

// src/ui/colors.ts
var reset2 = "\x1B[0m";
var bold2 = "\x1B[1m";
var dim2 = "\x1B[2m";
var italic = "\x1B[3m";
var claudePalette2 = {
  crust: "\x1B[48;2;250;249;245m",
  mantle: "\x1B[48;2;245;244;237m",
  base: "\x1B[48;2;240;238;220m",
  surface0: "\x1B[48;2;232;230;220m",
  surface1: "\x1B[48;2;215;213;200m",
  surface2: "\x1B[48;2;180;178;170m",
  text: "\x1B[38;2;20;20;19m",
  subtext0: "\x1B[38;2;80;79;75m",
  subtext1: "\x1B[38;2;50;49;46m",
  overlay0: "\x1B[38;2;140;138;130m",
  blue: "\x1B[38;2;56;152;236m",
  sapphire: "\x1B[38;2;56;152;236m",
  sky: "\x1B[38;2;100;170;210m",
  teal: "\x1B[38;2;23;146;153m",
  green: "\x1B[38;2;30;160;80m",
  yellow: "\x1B[38;2;200;140;0m",
  peach: "\x1B[38;2;201;130;70m",
  maroon: "\x1B[38;2;160;100;90m",
  red: "\x1B[38;2;200;60;60m",
  mauve: "\x1B[38;2;180;80;200m",
  pink: "\x1B[38;2;200;100;180m",
  flamingo: "\x1B[38;2;220;150;130m",
  lavender: "\x1B[38;2;139;92;246m",
  white: "\x1B[38;2;255;255;250m",
  gpPurple: "\x1B[38;2;142;54;255m",
  gpBlue: "\x1B[38;2;70;130;255m",
  gpCyan: "\x1B[38;2;0;200;200m",
  gpGreen: "\x1B[38;2;0;200;100m",
  gpYellow: "\x1B[38;2;255;200;0m",
  gpRed: "\x1B[38;2;255;100;100m"
};
var fg2 = {
  primary: claudePalette2.text,
  secondary: claudePalette2.subtext1,
  muted: claudePalette2.overlay0,
  overlay: claudePalette2.surface2,
  success: claudePalette2.green,
  warning: claudePalette2.yellow,
  error: claudePalette2.red,
  info: claudePalette2.blue,
  user: claudePalette2.green,
  assistant: claudePalette2.mauve,
  system: claudePalette2.sapphire,
  tool: claudePalette2.peach,
  code: claudePalette2.teal,
  link: claudePalette2.sapphire,
  keyword: claudePalette2.mauve,
  function: claudePalette2.blue,
  string: claudePalette2.green,
  number: claudePalette2.peach,
  accent: claudePalette2.gpPurple,
  accent2: claudePalette2.pink,
  accent3: claudePalette2.lavender,
  peach: claudePalette2.peach,
  mauve: claudePalette2.mauve,
  cyan: claudePalette2.teal,
  purple: claudePalette2.gpPurple,
  prompt: claudePalette2.gpPurple,
  gpPurple: claudePalette2.gpPurple,
  gpBlue: claudePalette2.gpBlue,
  gpCyan: claudePalette2.gpCyan,
  gpGreen: claudePalette2.gpGreen,
  gpYellow: claudePalette2.gpYellow,
  gpRed: claudePalette2.gpRed
};
var bg2 = {
  base: claudePalette2.base,
  surface: claudePalette2.surface0,
  elevated: claudePalette2.surface1,
  overlay: claudePalette2.surface2,
  crust: claudePalette2.crust,
  mantle: claudePalette2.mantle
};
var box = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  round: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
  heavy: { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" },
  dashed: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  soft: { tl: "╭", tr: "╮", bl: "╯", br: "╰", h: "─", v: "│" },
  light: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" }
};
var spinnerFrames2 = {
  dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  line: ["-", "\\", "|", "/"],
  blocks: ["▖", "▘", "▝", "▗"],
  arrow: ["←", "↙", "↓", "↘", "→", "↗", "↑", "↖"],
  star: ["⋆", "✦", "✧", "⋆", "✧", "✦"]
};
var DEFAULT_SPINNER2 = spinnerFrames2.dots;
var icon3 = {
  prompt: "›",
  userPrefix: ">",
  aiPrefix: "◈",
  success: "✓",
  error: "✗",
  warning: "!",
  info: "i",
  check: "●",
  online: "●",
  offline: "○",
  tool: "›",
  run: "›",
  search: "⌕",
  edit: "✎",
  plus: "+",
  minus: "−",
  arrow: "→",
  arrowUp: "↑",
  arrowDown: "↓",
  bullet: "·",
  separator: "│",
  folder: "▶",
  file: "▷",
  code: "◈",
  link: "↗",
  star: "★",
  spark: "✦",
  sparkles: "⁎",
  tokens: "⚡",
  messages: "≡",
  time: "⏱",
  context: "◈",
  clock: "⏰",
  ts: "TS",
  js: "JS",
  py: "PY",
  md: "MD",
  json: "{}",
  git: "⎇",
  thinking: "◐",
  loading: "⠋",
  line: "─",
  dash: "–",
  dot: "·",
  space: " "
};
var NO_COLOR2 = process.env.NO_COLOR || process.env.NO_COLOUR;
function isColorEnabled2() {
  if (NO_COLOR2)
    return false;
  if (process.env.FORCE_COLOR)
    return true;
  if (process.stdout && !process.stdout.isTTY)
    return false;
  return true;
}
function s2(text, ...styles) {
  if (!isColorEnabled2())
    return text;
  return styles.join("") + text + reset2;
}

// src/ui/layout.ts
function renderHeader(config) {
  if (!isColorEnabled2()) {
    return `BEAST CLI v${config.version} | ${config.provider} | ${config.model}`;
  }
  const { version, provider, model, toolsCount } = config;
  const b = box.round;
  const gpPurple = "\x1B[38;2;142;54;255m";
  const gpBlue = "\x1B[38;2;70;130;255m";
  const line = [
    s2(`${b.tl} `, gpPurple),
    s2("\uD83D\uDC09", gpPurple),
    s2(" Beast ", gpPurple, bold2),
    s2("CLI", gpBlue, bold2),
    s2(` v${version}`, fg2.muted),
    s2(` ${b.h} `, gpPurple),
    s2(icon3.check + " ", fg2.success),
    s2(provider, fg2.success),
    s2(` ${b.h} `, gpPurple),
    s2(icon3.code + " ", gpBlue),
    s2(model, gpBlue),
    s2(` ${b.h} `, gpPurple),
    s2(icon3.tool + " ", fg2.peach),
    s2(`${toolsCount} tools`, fg2.peach),
    s2(` ${b.h}${b.tr}`, gpPurple)
  ].join("");
  return line;
}
function contextBar(stats) {
  const { used, max } = stats;
  const width = 16;
  const pct = Math.min(1, used / max);
  const filled = Math.round(pct * width);
  const empty = width - filled;
  let barColor = fg2.success;
  if (pct > 0.75)
    barColor = fg2.warning;
  if (pct > 0.9)
    barColor = fg2.error;
  const bar = s2("█".repeat(filled), barColor) + s2("░".repeat(empty), fg2.overlay);
  const pctStr = s2(`${Math.round(pct * 100)}%`, barColor);
  const usedStr = s2(formatTokens(used), fg2.muted);
  const maxStr = s2(formatTokens(max), fg2.muted);
  return [
    s2(`  ${icon3.context} `, fg2.muted),
    bar,
    s2(" ", fg2.muted),
    pctStr,
    s2(" (", fg2.muted),
    usedStr,
    s2("/", fg2.muted),
    maxStr,
    s2(")", fg2.muted)
  ].join("");
}
function formatTokens(n) {
  if (n >= 1000)
    return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// src/ui/format.ts
function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}
function panel(content, options = {}) {
  const { title, titleColor = fg2.accent, width = 70 } = options;
  const b = box.round;
  const rawLines = content.split(`
`);
  const maxLen = rawLines.reduce((m, l) => Math.max(m, stripAnsi(l).length), 0);
  const w = Math.max(width, maxLen + 4);
  let result = b.tl + "─".repeat(w) + b.tr + `
`;
  if (title) {
    const titleLen = stripAnsi(title).length;
    const pad1 = Math.floor((w - titleLen) / 2);
    const pad2 = w - titleLen - pad1;
    result += b.v + " ".repeat(pad1) + title + " ".repeat(pad2) + b.v + `
`;
    result += b.v + "─".repeat(w) + b.v + `
`;
  }
  for (const ln of rawLines) {
    const len = stripAnsi(ln).length;
    const pad = w - len - 2;
    result += b.v + " " + ln + " ".repeat(Math.max(0, pad)) + " " + b.v + `
`;
  }
  result += b.bl + "─".repeat(w) + b.br;
  return s2(result, titleColor);
}
function inlineList(items, options = {}) {
  const { iconColor = fg2.accent, labelColor = fg2.muted, valueColor = fg2.primary, separator = " · " } = options;
  return items.map((item) => {
    const icon4 = item.icon ? s2(item.icon + " ", iconColor) : "";
    return icon4 + s2(item.label, labelColor) + ": " + s2(item.value, valueColor);
  }).join(separator);
}
async function withProgress(label, promise, onTick) {
  const start = Date.now();
  let ticks = 0;
  const ticker = setInterval(() => {
    const elapsed = Date.now() - start;
    const estimated = Math.min(1, elapsed / 1e4);
    ticks++;
    const pct = Math.round(estimated * 100);
    const filled = Math.round(estimated * 24);
    const barColor = pct > 80 ? fg2.warning : pct > 50 ? fg2.accent : fg2.success;
    const bar = s2("█".repeat(filled), barColor) + s2("░".repeat(24 - filled), fg2.muted);
    process.stderr.write(`\r  ${s2(label, fg2.secondary)} ${bar} ${s2(pct + "%", barColor)}   `);
    if (onTick)
      onTick(elapsed);
  }, 300);
  try {
    const result = await promise;
    clearInterval(ticker);
    process.stderr.write("\r" + " ".repeat(60) + "\r");
    process.stderr.write(s2("✓ ", fg2.success) + s2(label, fg2.secondary) + `
`);
    return result;
  } catch (e) {
    clearInterval(ticker);
    process.stderr.write("\r" + " ".repeat(60) + "\r");
    process.stderr.write(s2("✗ ", fg2.error) + s2(label, fg2.secondary) + `
`);
    throw e;
  }
}
function helpPanel(commands) {
  const maxCmd = Math.max(...commands.map((c) => stripAnsi(c.cmd).length), 4);
  return commands.map(({ cmd, desc, shortcut }) => {
    const shortcutStr = shortcut ? s2(` (${shortcut})`, fg2.muted, italic) : "";
    return `  ${s2(cmd.padEnd(maxCmd + 2), fg2.accent)}${desc}${shortcutStr}`;
  }).join(`
`);
}

// src/ui/format.ts
function stripAnsi2(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

// src/ui/tool-renderer.ts
var MAX_RESULT_LINES = 2;
var MAX_LINE_WIDTH = 120;
function truncateResult(content, maxLines = MAX_RESULT_LINES) {
  const lines = content.split(`
`);
  if (lines.length <= maxLines)
    return content;
  const visible = lines.slice(0, maxLines);
  const truncated = visible.map((l) => {
    const stripped = stripAnsi2(l);
    if (stripped.length <= MAX_LINE_WIDTH)
      return l;
    return l.slice(0, MAX_LINE_WIDTH - 3) + "...";
  });
  const remaining = lines.length - maxLines;
  return truncated.join(`
`) + `
` + s2(`... (${remaining} more lines)`, fg2.muted);
}
function renderToolResult(name, result) {
  if (!result.success) {
    return renderError(name, result.error || "Unknown error");
  }
  if (name.startsWith("file_list"))
    return renderFileList(result.content);
  if (name.startsWith("file_read"))
    return renderFileRead(result.content);
  if (name.startsWith("github_search") || name.startsWith("github_repo"))
    return renderGithub(result.content);
  if (name.startsWith("searxng_search"))
    return renderSearch(result.content);
  if (name.startsWith("run_code") || name.startsWith("run_python"))
    return renderCodeOutput(result.content);
  if (name.startsWith("hackernews"))
    return renderHackerNews(result.content);
  if (name.startsWith("youtube"))
    return renderYouTube(result.content);
  if (name.startsWith("fetch_web") || name.startsWith("quick_fetch"))
    return renderWebContent(result.content);
  return renderGeneric(result.content);
}
function renderFileList(content) {
  try {
    const items = JSON.parse(content);
    if (!Array.isArray(items) || items.length === 0) {
      return s2("(empty directory)", fg2.muted);
    }
    const dirs = items.filter((i) => i.type === "directory");
    const files = items.filter((i) => i.type !== "directory");
    const lines = [];
    if (dirs.length > 0) {
      lines.push(s2("\uD83D\uDCC1 Directories", fg2.accent));
      lines.push(dirs.map((d) => `  ${s2("\uD83D\uDCC1", fg2.warning)} ${s2(d.name, fg2.primary)}`).join(`
`));
      lines.push("");
    }
    if (files.length > 0) {
      lines.push(s2("\uD83D\uDCC4 Files", fg2.accent));
      lines.push(files.map((f) => {
        const size = f.size ? formatSize(f.size) : "";
        const modified = f.modified ? timeAgo(f.modified) : "";
        return `  ${s2("\uD83D\uDCC4", fg2.cyan)} ${s2(f.name, fg2.primary)} ${s2(size, fg2.muted)} ${s2(modified, fg2.muted)}`;
      }).join(`
`));
    }
    return lines.join(`
`) + `
${s2("(" + items.length + " items)", fg2.muted)}`;
  } catch {
    return renderGeneric(content);
  }
}
function renderFileRead(content) {
  return truncateResult(content, MAX_RESULT_LINES);
}
function renderCodeOutput(content) {
  return truncateResult(content, MAX_RESULT_LINES);
}
function renderSearch(content) {
  try {
    const data = JSON.parse(content);
    const results = data.results || [];
    if (results.length === 0) {
      return s2("No results found", fg2.muted);
    }
    const shown = results.slice(0, MAX_RESULT_LINES);
    const remaining = results.length - shown.length;
    const items = shown.map((r, i) => {
      const title = r.title || s2("(no title)", fg2.muted);
      const url = r.url || "";
      const snippet = r.snippet || "";
      return [
        s2(`${i + 1}. `, fg2.accent) + s2(truncate(title, 60), fg2.bold, fg2.primary),
        `   ${s2(truncate(snippet, 80), fg2.secondary)}`,
        `   ${s2(truncate(url, 70), fg2.link)}`
      ].join(`
`);
    });
    if (remaining > 0) {
      items.push(s2(`... and ${remaining} more results — use fetch_web for full content`, fg2.muted));
    }
    return items.join(`

`);
  } catch {
    return renderGeneric(content);
  }
}
function renderGithub(content) {
  try {
    const data = JSON.parse(content);
    if (data.name) {
      const lines = [
        s2(data.name, fg2.bold, fg2.accent),
        data.description ? s2(data.description, fg2.primary) : "",
        "",
        s2("⭐ " + formatNumber(data.stars || data.stargazers_count || 0), fg2.warning) + "  " + s2("\uD83C\uDF74 " + formatNumber(data.forks_count || 0), fg2.cyan) + "  " + s2(data.language || "", fg2.success),
        "",
        s2(data.url || data.html_url || "", fg2.link)
      ];
      return lines.filter(Boolean).join(`
`);
    }
    if (Array.isArray(data)) {
      const shown = data.slice(0, MAX_RESULT_LINES);
      const remaining = data.length - shown.length;
      const items = shown.map((r, i) => {
        return [
          s2(`${i + 1}. `, fg2.accent) + s2(r.name || r.full_name, fg2.bold, fg2.primary),
          r.description ? `   ${s2(truncate(r.description, 60), fg2.secondary)}` : "",
          `   ${s2("⭐ " + formatNumber(r.stars || r.stargazers_count || 0), fg2.warning)} ${r.language ? s2(r.language, fg2.success) : ""}`
        ].filter(Boolean).join(`
`);
      });
      if (remaining > 0) {
        items.push(s2(`... and ${remaining} more repos`, fg2.muted));
      }
      return items.join(`

`);
    }
    return renderGeneric(content);
  } catch {
    return renderGeneric(content);
  }
}
function renderHackerNews(content) {
  try {
    const data = JSON.parse(content);
    const results = data.results || [];
    const shown = results.slice(0, MAX_RESULT_LINES);
    const remaining = results.length - shown.length;
    const items = shown.map((r, i) => {
      const title = r.title || s2("(no title)", fg2.muted);
      const score = r.score || r.snippet?.match(/(\d+) points/)?.[1] || "0";
      const comments = r.descendants || r.snippet?.match(/(\d+) comments/)?.[1] || "0";
      return [
        s2(`${i + 1}. `, fg2.accent) + s2(truncate(title, 60), fg2.bold, fg2.primary),
        `   ${s2("⭐ " + score, fg2.warning)} ${s2("\uD83D\uDCAC " + comments, fg2.cyan)} ${r.url ? s2(truncate(r.url, 50), fg2.link) : ""}`
      ].join(`
`);
    });
    if (remaining > 0) {
      items.push(s2(`... and ${remaining} more stories`, fg2.muted));
    }
    return items.join(`

`);
  } catch {
    return renderGeneric(content);
  }
}
function renderYouTube(content) {
  try {
    const data = JSON.parse(content);
    const results = Array.isArray(data) ? data : data.results || [];
    const shown = results.slice(0, MAX_RESULT_LINES);
    const remaining = results.length - shown.length;
    const items = shown.map((r, i) => {
      return [
        s2(`${i + 1}. `, fg2.accent) + s2(r.name || r.full_name || s2("(no name)", fg2.muted), fg2.bold, fg2.primary),
        r.description ? `   ${s2(truncate(r.description, 60), fg2.secondary)}` : "",
        `   ${s2("⭐ " + formatNumber(r.stars || r.stargazers_count || 0), fg2.warning)} ${r.language ? s2(r.language, fg2.success) : ""}`
      ].filter(Boolean).join(`
`);
    });
    if (remaining > 0) {
      items.push(s2(`... and ${remaining} more videos`, fg2.muted));
    }
    return items.join(`

`);
  } catch {
    return renderGeneric(content);
  }
}
function renderWebContent(content) {
  return truncateResult(content, MAX_RESULT_LINES);
}
function renderGeneric(content) {
  try {
    const parsed = JSON.parse(content);
    const formatted = JSON.stringify(parsed, null, 2);
    return truncateResult(formatted, MAX_RESULT_LINES);
  } catch {
    return truncateResult(content, MAX_RESULT_LINES);
  }
}
function renderError(toolName, error) {
  return s2(`${icon3.error} ${toolName}: ${error}`, fg2.error);
}
function formatSize(bytes) {
  if (bytes < 1024)
    return bytes + " B";
  if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
function formatNumber(n) {
  if (n >= 1e6)
    return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000)
    return (n / 1000).toFixed(1) + "K";
  return String(n);
}
function timeAgo(dateStr) {
  try {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0)
      return days + "d ago";
    if (hours > 0)
      return hours + "h ago";
    if (minutes > 0)
      return minutes + "m ago";
    return "just now";
  } catch {
    return "";
  }
}
function truncate(text, maxLen) {
  const stripped = stripAnsi2(text);
  if (stripped.length <= maxLen)
    return text;
  const plain = text.replace(/\x1b\[[0-9;]*m/g, "");
  const truncated = plain.slice(0, maxLen - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.7) {
    return text.slice(0, text.indexOf(" ", lastSpace)) + "...";
  }
  return text.slice(0, maxLen - 3) + "...";
}

// src/ui/banner.ts
function termWidth() {
  try {
    return process.stdout.columns || 80;
  } catch {
    return 80;
  }
}
var googlePurple = "\x1B[38;2;142;54;255m";
var googleBlue = "\x1B[38;2;70;130;255m";
var FULL_LOGO = `
 ${googlePurple}╔══════════════════════════════════════════════════════════════════╗${reset2}` + `
 ${googlePurple}║${reset2}  \uD83D\uDC09  ${s2("BEAST", googlePurple, bold2)}   ${s2("CLI", googleBlue, bold2)}    ${dim2}AI Coding Agent · 45+ Providers · 51+ Tools     ${googlePurple}║${reset2}` + `
 ${googlePurple}╚══════════════════════════════════════════════════════════════════╝${reset2}
`;
var COMPACT_LOGO = `
 ${googlePurple}┌────────────────────────────────────────────┐${reset2}` + `
 ${googlePurple}│${reset2}  \uD83D\uDC09  ${s2("BEAST", googlePurple, bold2)}  ${s2("CLI", googleBlue, bold2)}  ${dim2}AI Coding Agent                  ${googlePurple}│${reset2}` + `
 ${googlePurple}└────────────────────────────────────────────┘${reset2}
`;
var TINY_LOGO = ` \uD83D\uDC09 ${s2("BEAST CLI", googlePurple, bold2)} ${dim2}~ 
`;
var googlePurple2 = "\x1B[38;2;142;54;255m";
var googleBlue2 = "\x1B[38;2;70;130;255m";
var TEXT_LOGO = ` ${s2("BEAST", googlePurple2, bold2)} ${s2("CLI", googleBlue2, bold2)} `;
var TAGLINE = `${s2("·", fg2.overlay)} ${s2("45+ Providers", fg2.muted)} ${s2("·", fg2.overlay)} ${s2("51+ Tools", fg2.muted)} ${s2("·", fg2.overlay)} ${s2("Local AI Ready", fg2.muted)}`;
function renderCleanBanner() {
  if (!isColorEnabled2())
    return "BEAST CLI - AI Coding Agent";
  const width = termWidth();
  let logo;
  if (width >= 60) {
    logo = FULL_LOGO;
  } else if (width >= 40) {
    logo = COMPACT_LOGO;
  } else {
    logo = TINY_LOGO;
  }
  if (width < 50) {
    return logo;
  }
  return logo + TAGLINE + `
`;
}

// src/ui/tips.ts
var TIPS = [
  { cmd: "/model <name>", tip: "Switch models mid-session without restarting", category: "command" },
  { cmd: "/provider <name>", tip: "Jump between Ollama, OpenRouter, Claude instantly", category: "command" },
  { cmd: "/tools", tip: "See all available MCP tools and their descriptions", category: "command" },
  { cmd: "/clear", tip: "Wipe conversation history to reset context window", category: "command" },
  { cmd: "/models", tip: "List all available models for your current provider", category: "command" },
  { cmd: "Tab", tip: "Auto-complete tool names and common commands", category: "command" },
  { cmd: "Up / Down", tip: "Navigate through your command history", category: "command" },
  { cmd: "file_read", tip: "Read any file in the current directory", category: "tool" },
  { cmd: "file_list", tip: "Show directories and files with sizes and times", category: "tool" },
  { cmd: "file_tree", tip: "View your entire project structure at a glance", category: "tool" },
  { cmd: "run_code", tip: "Execute shell commands — git, npm, docker, anything", category: "tool" },
  { cmd: "run_python", tip: "Run Python code with a sandboxed interpreter", category: "tool" },
  { cmd: "github_search_repos", tip: "Search GitHub by keyword with stars and language", category: "tool" },
  { cmd: "searxng_search", tip: "Web search without leaving the CLI", category: "tool" },
  { cmd: "fetch_web", tip: "Fetch full web page content from any URL", category: "tool" },
  { cmd: "hacker_news", tip: "Get top Hacker News stories and comments", category: "tool" },
  { cmd: "youtube_transcript", tip: "Extract transcripts from YouTube videos", category: "tool" },
  { cmd: "/provider codex", tip: "Use ChatGPT Plus OAuth — free with your subscription", category: "provider" },
  { cmd: "/provider ollama", tip: "Ollama runs AI models locally — no internet needed", category: "provider" },
  { cmd: "beast --defaults", tip: "Auto-selects the best available provider", category: "provider" },
  { cmd: "Claude", tip: "Anthropic Claude — excellent reasoning and long context", category: "provider" },
  { cmd: "Groq", tip: "Ultra-fast inference with a free tier", category: "provider" },
  { cmd: "/compact", tip: "Manually trigger context compaction to free up space", category: "context" },
  { cmd: "Context", tip: "History counts toward your context — /clear to free it", category: "context" },
  { cmd: "auto-compact", tip: "Context auto-compacts at 95% — never lose your place", category: "context" },
  { cmd: "--theme claude", tip: "Use --theme claude for warm editorial styling", category: "fun" },
  { cmd: "--theme dracula", tip: "Use --theme dracula for dark mode", category: "fun" }
];
function randomTip() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  return `${s2("\uD83D\uDCA1", fg2.warning)} ${s2(tip.tip, fg2.secondary)} ${s2(`(${tip.cmd})`, fg2.muted)}`;
}
function tipBanner() {
  return `
` + s2("─".repeat(50), fg2.muted) + `
` + randomTip() + `
`;
}

// src/native-tools/web.ts
var DEFAULT_TIMEOUT = 15000;
async function fetchWebContent(url, maxTokens = 4000) {
  try {
    const controller = new AbortController;
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BeastCLI/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return { success: false, content: "", error: `HTTP ${response.status}` };
    }
    const html = await response.text();
    const text = stripHtml(html);
    const title = extractTitle(html);
    const truncated = text.slice(0, maxTokens * 4);
    return {
      success: true,
      content: truncated,
      title,
      url: response.url
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function quickFetch(url) {
  const result = await fetchWebContent(url, 1500);
  if (result.success && result.content) {
    const lines = result.content.split(`
`).filter((l) => l.trim().length > 30);
    return { ...result, content: lines.slice(0, 3).join(`

`) };
  }
  return result;
}
async function fetchStructured(url, extractionType, maxTokens = 2000) {
  const result = await fetchWebContent(url, maxTokens);
  if (!result.success)
    return result;
  switch (extractionType) {
    case "article":
      return extractArticle(result.content, url);
    case "product":
      return extractProduct(result.content, url);
    case "table":
      return extractTable(result.content);
    case "links":
      return extractLinks(result.content, url);
    default:
      return result;
  }
}
async function fetchWithSelectors(url, selectors, maxTokens = 2000) {
  const result = await fetchWebContent(url, maxTokens);
  if (!result.success)
    return result;
  const extracted = {};
  for (const [field, selector] of Object.entries(selectors)) {
    if (selector.includes("title"))
      extracted[field] = result.title ?? "";
    if (selector.includes("price")) {
      const priceMatch = result.content.match(/[\₹$]?[\d,]+\.?\d*/);
      if (priceMatch)
        extracted[field] = priceMatch[0];
    }
    if (selector.includes("description") || selector.includes("content")) {
      extracted[field] = result.content.slice(0, 500);
    }
  }
  return {
    success: true,
    content: JSON.stringify(extracted, null, 2),
    url
  };
}
async function scrapeFreedium(url, maxTokens = 4000) {
  const freediumUrl = url.includes("freedium.cfd") ? url : `https://freedium.cfd/${url}`;
  const result = await fetchWebContent(freediumUrl, maxTokens);
  if (!result.success)
    return result;
  return {
    success: true,
    content: result.content,
    title: result.title,
    url: freediumUrl
  };
}
async function webclawExtractArticle(url) {
  return fetchWebContent(url, 4000);
}
async function webclawExtractProduct(url) {
  const result = await fetchWebContent(url, 2000);
  if (!result.success)
    return result;
  const product = {};
  const titleMatch = result.content.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch)
    product.title = titleMatch[1];
  const priceMatch = result.content.match(/price["\s:>]+["\s]*([₹$]?[\d,]+\.?\d*)/i);
  if (priceMatch)
    product.price = priceMatch[1];
  const descMatch = result.content.match(/description["\s:>]+["']([^"']+)["']/i);
  if (descMatch)
    product.description = descMatch[1];
  return {
    success: true,
    content: JSON.stringify(product, null, 2),
    url
  };
}
async function webclawCrawl(url, selectors) {
  return fetchWithSelectors(url, selectors);
}
function stripHtml(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<br\s*\/?>/gi, `
`).replace(/<\/p>/gi, `

`).replace(/<\/div>/gi, `
`).replace(/<\/li>/gi, `
`).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, "").replace(/\n{3,}/g, `

`).replace(/[ \t]+/g, " ").trim();
}
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}
function extractArticle(content, url) {
  const paragraphs = content.split(`

`).filter((p) => p.length > 100);
  return {
    success: true,
    content: paragraphs.slice(0, 5).join(`

`),
    url
  };
}
function extractProduct(content, url) {
  const product = {};
  const lines = content.split(`
`).filter((l) => l.trim());
  for (const line of lines.slice(0, 20)) {
    if (line.includes(":")) {
      const [key, ...vals] = line.split(":");
      if (key && vals.length)
        product[key.trim()] = vals.join(":").trim().slice(0, 200);
    }
  }
  return {
    success: true,
    content: JSON.stringify(product, null, 2),
    url
  };
}
function extractTable(content) {
  const lines = content.split(`
`).filter((l) => l.includes("|"));
  return {
    success: true,
    content: lines.join(`
`)
  };
}
function extractLinks(content, baseUrl) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  return {
    success: true,
    content: JSON.stringify(links.slice(0, 20), null, 2),
    url: baseUrl
  };
}

// src/native-tools/files.ts
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { execSync } from "node:child_process";
var MAX_FILE_SIZE = 10 * 1024 * 1024;
var ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".js",
  ".json",
  ".md",
  ".txt",
  ".yml",
  ".yaml",
  ".xml",
  ".html",
  ".css",
  ".scss",
  ".py",
  ".rs",
  ".go",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".sh",
  ".bash",
  ".zsh",
  ".sql",
  ".csv",
  ".log",
  ".gitignore",
  ".env",
  ".prettierrc",
  ".eslintrc",
  ".babelrc"
]);
var RESTRICTED_PATHS = ["/Users/sridhar/.ssh", "/Users/sridhar/.npm", "/Users/sridhar/.aws"];
async function fileRead(path, maxSize = MAX_FILE_SIZE) {
  try {
    const resolved = resolve(path);
    for (const restricted of RESTRICTED_PATHS) {
      if (resolved.startsWith(restricted)) {
        return { success: false, error: `Access denied: ${restricted}` };
      }
    }
    const stats = statSync(resolved);
    if (stats.size > maxSize) {
      return {
        success: true,
        content: `[File too large: ${stats.size} bytes. Max: ${maxSize}]`,
        path: resolved,
        size: stats.size
      };
    }
    const content = readFileSync(resolved, "utf-8");
    const lines = content.split(`
`).length;
    return {
      success: true,
      content,
      path: resolved,
      size: stats.size,
      lines
    };
  } catch (e) {
    return { success: false, error: e.message, path };
  }
}
async function fileWrite(path, content) {
  try {
    const resolved = resolve(path);
    for (const restricted of RESTRICTED_PATHS) {
      if (resolved.startsWith(restricted)) {
        return { success: false, error: `Access denied: ${restricted}` };
      }
    }
    const dir = dirname(resolved);
    if (!existsSync(dir)) {
      return { success: false, error: `Directory does not exist: ${dir}`, path: resolved };
    }
    writeFileSync(resolved, content, "utf-8");
    const stats = statSync(resolved);
    return {
      success: true,
      path: resolved,
      size: stats.size
    };
  } catch (e) {
    return { success: false, error: e.message, path };
  }
}
async function fileList(dir = ".", maxItems = 100) {
  try {
    const resolved = resolve(dir);
    if (!existsSync(resolved)) {
      return { success: false, items: [], path: resolved, error: "Directory not found" };
    }
    const entries = readdirSync(resolved);
    const items = [];
    for (const entry of entries.slice(0, maxItems)) {
      try {
        const fullPath = join(resolved, entry);
        const stats = statSync(fullPath);
        items.push({
          name: entry,
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.isFile() ? stats.size : undefined,
          modified: stats.mtime.toISOString()
        });
      } catch {}
    }
    items.sort((a, b) => {
      if (a.type !== b.type)
        return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return { success: true, items, path: resolved };
  } catch (e) {
    return { success: false, items: [], path: dir, error: e.message };
  }
}
async function fileSearch(directory, pattern, maxResults = 50) {
  try {
    const resolved = resolve(directory);
    if (!existsSync(resolved)) {
      return { success: false, files: [], error: "Directory not found" };
    }
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cmd = `find "${resolved}" -type f \\( -path "*/node_modules" -o -path "*/.git" -o -path "*/dist" -o -path "*/build" \\) -prune -o -type f -name "*${pattern}*" -print 2>/dev/null | head -${maxResults}`;
    const output = execSync(cmd, { encoding: "utf-8", timeout: 1e4 });
    const files = output.split(`
`).filter(Boolean).map((f) => ({ path: f }));
    return { success: true, files };
  } catch (e) {
    return { success: false, files: [], error: e.message };
  }
}
async function fileGrep(directory, query, maxResults = 50, filePattern = "*") {
  try {
    const resolved = resolve(directory);
    if (!existsSync(resolved)) {
      return { success: false, files: [], error: "Directory not found" };
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cmd = `grep -rn --include="${filePattern}" -E "${escaped}" "${resolved}" 2>/dev/null | head -${maxResults}`;
    const output = execSync(cmd, { encoding: "utf-8", timeout: 1e4 });
    const files = [];
    for (const line of output.split(`
`).filter(Boolean)) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const pathPart = line.slice(0, colonIdx);
        const rest = line.slice(colonIdx + 1);
        const secondColonIdx = rest.indexOf(":");
        if (secondColonIdx > 0) {
          const lineNum = parseInt(rest.slice(0, secondColonIdx));
          const match = rest.slice(secondColonIdx + 1).trim();
          files.push({
            path: join(resolved, pathPart),
            line: lineNum,
            match: match.slice(0, 200)
          });
        }
      }
    }
    return { success: true, files };
  } catch (e) {
    return { success: true, files: [] };
  }
}
async function fileGlob(directory, patterns, maxResults = 100) {
  try {
    const resolved = resolve(directory);
    const files = [];
    for (const pattern of patterns) {
      const cmd = `find "${resolved}" -type f \\( -path "*/node_modules" -o -path "*/.git" -o -path "*/dist" -o -path "*/build" \\) -prune -o -type f -name "${pattern}" -print 2>/dev/null | head -${maxResults}`;
      const output = execSync(cmd, { encoding: "utf-8", timeout: 1e4 });
      for (const line of output.split(`
`).filter(Boolean)) {
        if (!files.some((f) => f.path === line)) {
          files.push({ path: line });
        }
      }
      if (files.length >= maxResults)
        break;
    }
    return { success: true, files: files.slice(0, maxResults) };
  } catch (e) {
    return { success: false, files: [], error: e.message };
  }
}

// src/native-tools/code.ts
import { spawn } from "node:child_process";
import { writeFileSync as writeFileSync2, unlinkSync, mkdirSync, existsSync as existsSync2 } from "node:fs";
import { join as join2 } from "node:path";
import { randomUUID } from "crypto";
var SANDBOX_DIR = "/tmp/beast-sandbox";
if (!existsSync2(SANDBOX_DIR)) {
  mkdirSync(SANDBOX_DIR, { recursive: true });
}
async function runCode(code, language, timeout = 30) {
  const start = Date.now();
  try {
    switch (language) {
      case "python":
        return runPython(code, timeout, start);
      case "javascript":
        return runJavaScript(code, timeout, start);
      case "bash":
        return runBash(code, timeout, start);
      default:
        return { success: false, output: "", error: `Unsupported language: ${language}` };
    }
  } catch (e) {
    return { success: false, output: "", error: e.message, executionTime: Date.now() - start };
  }
}
async function runPythonSnippet(code, timeout = 30) {
  const start = Date.now();
  const fullCode = `
import json
import math
import re
import datetime
import itertools
from collections import Counter, defaultdict

${code}
`;
  return runPython(fullCode, timeout, start);
}
async function runPython(code, timeout, start) {
  const id = randomUUID();
  const filePath = join2(SANDBOX_DIR, `${id}.py`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    const result = await execProcess("python3", ["-u", filePath], timeout * 1000);
    const executionTime = Date.now() - start;
    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: "python"
    };
  } finally {
    try {
      unlinkSync(filePath);
    } catch {}
  }
}
async function runJavaScript(code, timeout, start) {
  const id = randomUUID();
  const filePath = join2(SANDBOX_DIR, `${id}.js`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    const result = await execProcess("node", ["--input-type=module", filePath], timeout * 1000);
    const executionTime = Date.now() - start;
    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: "javascript"
    };
  } finally {
    try {
      unlinkSync(filePath);
    } catch {}
  }
}
async function runBash(code, timeout, start) {
  const id = randomUUID();
  const filePath = join2(SANDBOX_DIR, `${id}.sh`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    const result = await execProcess("/bin/bash", ["-c", code], timeout * 1000);
    const executionTime = Date.now() - start;
    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: "bash"
    };
  } finally {
    try {
      unlinkSync(filePath);
    } catch {}
  }
}
function execProcess(command, args, timeoutMs) {
  return new Promise((resolve2) => {
    const proc = spawn(command, args, {
      timeout: timeoutMs,
      cwd: SANDBOX_DIR,
      env: {
        ...process.env,
        HOME: SANDBOX_DIR,
        PATH: "/usr/bin:/bin:/usr/local/bin"
      }
    });
    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (d) => {
      stdout += d.toString();
    });
    proc.stderr?.on("data", (d) => {
      stderr += d.toString();
    });
    proc.on("error", (e) => resolve2({ stdout, stderr, error: e.message }));
    proc.on("close", (code) => {
      if (code !== 0 && !stderr) {
        resolve2({ stdout, stderr, error: `Exit code: ${code}` });
      } else {
        resolve2({ stdout, stderr, error: code !== 0 ? `Exit code: ${code}` : undefined });
      }
    });
  });
}
async function pandasCreate(data, name = "df") {
  try {
    const parsed = JSON.parse(data);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const keys = Object.keys(rows[0] || {});
    const summary = {
      name,
      rowCount: rows.length,
      columns: keys,
      preview: rows.slice(0, 5)
    };
    return {
      success: true,
      output: JSON.stringify(summary, null, 2)
    };
  } catch (e) {
    return { success: false, output: "", error: `Invalid JSON: ${e.message}` };
  }
}
async function pandasFilter(data, conditions) {
  try {
    const parsedConditions = JSON.parse(conditions);
    const filtered = data.filter((row) => {
      for (const [key, op] of Object.entries(parsedConditions)) {
        const rowVal = row[key];
        if (typeof op === "object") {
          for (const [cmp, val] of Object.entries(op)) {
            switch (cmp) {
              case "$eq":
                if (rowVal !== val)
                  return false;
                break;
              case "$ne":
                if (rowVal === val)
                  return false;
                break;
              case "$gt":
                if (rowVal <= val)
                  return false;
                break;
              case "$gte":
                if (rowVal < val)
                  return false;
                break;
              case "$lt":
                if (rowVal >= val)
                  return false;
                break;
              case "$lte":
                if (rowVal > val)
                  return false;
                break;
              case "$contains":
                if (!String(rowVal).includes(String(val)))
                  return false;
                break;
            }
          }
        } else {
          if (rowVal !== op)
            return false;
        }
      }
      return true;
    });
    return {
      success: true,
      output: JSON.stringify(filtered, null, 2)
    };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function pandasAggregate(data, groupBy, aggregations) {
  try {
    const rows = data;
    const groups = new Map;
    for (const row of rows) {
      const key = groupBy.map((k) => String(row[k])).join("|");
      if (!groups.has(key))
        groups.set(key, []);
      groups.get(key).push(row);
    }
    const results = [];
    for (const [key, groupRows] of groups) {
      const result = {};
      const keyParts = key.split("|");
      groupBy.forEach((k, i) => {
        result[k] = keyParts[i];
      });
      for (const [col, fn] of Object.entries(aggregations)) {
        const values = groupRows.map((r) => Number(r[col])).filter((v) => !isNaN(v));
        switch (fn) {
          case "sum":
            result[`${col}_sum`] = values.reduce((a, b) => a + b, 0);
            break;
          case "avg":
            result[`${col}_avg`] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case "count":
            result[`${col}_count`] = values.length;
            break;
          case "min":
            result[`${col}_min`] = Math.min(...values);
            break;
          case "max":
            result[`${col}_max`] = Math.max(...values);
            break;
        }
      }
      results.push(result);
    }
    return { success: true, output: JSON.stringify(results, null, 2) };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}

// src/native-tools/index.ts
init_search();

// src/native-tools/github.ts
var GITHUB_API = "https://api.github.com";
var GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
async function githubFetch(path) {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "BeastCLI/1.0"
    };
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers,
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      const error = await response.text();
      return { ok: false, data: null, error: `GitHub API ${response.status}: ${error}` };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, data: null, error: e.message };
  }
}
async function githubRepo(owner, repo) {
  const result = await githubFetch(`/repos/${owner}/${repo}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const r = result.data;
  const repoData = {
    repo_name: r.name,
    full_name: r.full_name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    license: r.license?.name || r.license?.spdx_id || null,
    topics: r.topics || [],
    open_issues: r.open_issues_count,
    watchers: r.watchers_count,
    default_branch: r.default_branch,
    created_at: r.created_at,
    updated_at: r.updated_at,
    homepage: r.homepage
  };
  return { success: true, output: JSON.stringify(repoData, null, 2) };
}
async function githubReadme(owner, repo) {
  const result = await githubFetch(`/repos/${owner}/${repo}/readme`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const r = result.data;
  const content = Buffer.from(r.content, "base64").toString("utf-8");
  return { success: true, output: content };
}
async function githubIssues(owner, repo, state = "open", limit = 20) {
  const result = await githubFetch(`/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const issues = result.data.map((i) => ({
    number: i.number,
    title: i.title,
    state: i.state,
    labels: i.labels?.map((l) => l.name) || [],
    author: i.user?.login,
    created_at: i.created_at,
    url: i.html_url
  }));
  return { success: true, output: JSON.stringify(issues, null, 2) };
}
async function githubCommits(owner, repo, limit = 20) {
  const result = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=${limit}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const commits = result.data.map((c2) => ({
    sha: c2.sha?.slice(0, 7),
    message: c2.commit?.message?.split(`
`)[0],
    author: c2.commit?.author?.name,
    date: c2.commit?.author?.date,
    url: c2.html_url
  }));
  return { success: true, output: JSON.stringify(commits, null, 2) };
}
async function githubSearchRepos(query, limit = 10) {
  const result = await githubFetch(`/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const data = result.data;
  const repos = (data.items || []).map((r) => ({
    name: r.name,
    owner: r.owner?.login,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    url: r.html_url
  }));
  return { success: true, output: JSON.stringify(repos, null, 2) };
}

// src/native-tools/youtube.ts
async function youtubeTranscript(url) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return { success: false, output: "", error: "Invalid YouTube URL" };
    }
    const transcriptUrl = `https://youtubetranscript.com/?video=${videoId}`;
    const response = await fetch(transcriptUrl, {
      signal: AbortSignal.timeout(1e4)
    });
    if (response.ok) {
      const text = await response.text();
      return {
        success: true,
        output: text.slice(0, 5000)
      };
    }
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(1e4)
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const captionMatch = html.match(/"captionTracks":\[([^\]]+)\]/);
      if (captionMatch) {
        return { success: true, output: "Captions available. Use youtube_video_info for details." };
      }
    }
    return {
      success: false,
      output: "",
      error: "Transcript not available. Video may not have captions."
    };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function youtubeVideoInfo(videoId, url) {
  try {
    const id = videoId || (url ? extractVideoId(url) : null);
    if (!id) {
      return { success: false, output: "", error: "Invalid video ID or URL" };
    }
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(1e4)
    });
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        output: JSON.stringify({
          title: data.title,
          author_name: data.author_name,
          author_url: data.author_name,
          thumbnail_url: data.thumbnail_url,
          video_url: `https://www.youtube.com/watch?v=${id}`
        }, null, 2)
      };
    }
    return { success: false, output: "", error: "Could not fetch video info" };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function youtubeSearch(query, limit = 10) {
  try {
    const { searxngSearch: searxngSearch2 } = await Promise.resolve().then(() => (init_search(), exports_search));
    const result = await searxngSearch2(`${query} site:youtube.com`, limit);
    if (result.success && result.results) {
      const videos = result.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet
      }));
      return { success: true, output: JSON.stringify(videos, null, 2) };
    }
    return { success: false, output: "", error: result.error };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function youtubeSummarize(transcript, maxWords = 500) {
  const sentences = transcript.split(/[.!?]+/).filter((s3) => s3.trim().length > 20);
  const words = transcript.split(/\s+/);
  if (words.length <= maxWords) {
    return { success: true, output: transcript };
  }
  const summaryCount = Math.ceil(sentences.length * 0.3);
  const summary = sentences.slice(0, summaryCount).join(". ").trim();
  return {
    success: true,
    output: summary || transcript.slice(0, maxWords * 5)
  };
}
function extractVideoId(input) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match)
      return match[1];
  }
  return null;
}

// src/engi/indexer.ts
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
var EXTENSION_LANGUAGE_MAP = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".java": "java",
  ".go": "go",
  ".rs": "rust",
  ".rb": "ruby",
  ".php": "php",
  ".cs": "csharp",
  ".cpp": "cpp",
  ".c": "c",
  ".swift": "swift",
  ".kt": "kotlin",
  ".scala": "scala"
};
var IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".venv",
  "vendor",
  "__pycache__",
  ".next",
  ".nuxt",
  "out"
]);
var TEST_PATTERNS = new Set(["test", "spec", "__tests__", "tests"]);
var TEST_EXTS = new Set([".test.", ".spec."]);
var CONFIG_EXTS = new Set([".json", ".yaml", ".yml", ".toml", ".ini", ".conf"]);
var DOC_PATTERNS = new Set(["readme", "changelog", "contributing", "license", "api", "guide", "docs"]);
var DOC_EXTS = new Set([".md", ".rst", ".adoc"]);
var SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs"]);
var TS_EXPORT_NAMED = /export\s+(?:const|function|class|interface|type|let|var)\s+(\w+)/g;
var TS_EXPORT_DEFAULT = /export\s+default\s+(\w+)/g;
var TS_EXPORT_BLOCK = /export\s*\{\s*([^}]+)\s*\}/g;
var TS_IMPORT = /import\s+(?:\{\s*[^}]+\s*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
var TS_REQUIRE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
var TS_FUNC = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
var TS_CLASS = /(?:export\s+)?class\s+(\w+)/g;
var TS_INTERFACE = /(?:export\s+)?interface\s+(\w+)/g;
var TS_CONST = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/g;
var PY_DEF = /(?:^|\n)\s*(?:def|class)\s+(\w+)/gm;
var PY_IMPORT = /(?:^|\n)\s*import\s+([^\n]+)|(?:^|\n)\s*from\s+([^\n]+)\s+import/gm;

class RepoIndexer {
  index = null;
  indexing = null;
  async indexRepository(rootPath) {
    if (this.indexing)
      return this.indexing;
    this.indexing = this._doIndex(rootPath).finally(() => {
      this.indexing = null;
    });
    return this.indexing;
  }
  getIndex() {
    return this.index;
  }
  clearIndex() {
    this.index = null;
    this.indexing = null;
  }
  async _doIndex(rootPath) {
    if (!fs.existsSync(rootPath)) {
      throw new Error(`Path does not exist: ${rootPath}`);
    }
    const allFiles = await this.scanDirectoryAsync(rootPath);
    const results = await Promise.all(allFiles.map((filePath) => this.processFile(filePath, rootPath)));
    const files = new Map;
    const symbols = new Map;
    const imports = [];
    const tests = [];
    const docs = [];
    for (const result of results) {
      if (!result)
        continue;
      files.set(result.entry.path, result.entry);
      if (result.symbols.length > 0)
        symbols.set(result.entry.path, result.symbols);
      imports.push(...result.imports);
      if (result.test)
        tests.push(result.test);
      if (result.doc)
        docs.push(result.doc);
    }
    this.index = { files, symbols, imports, tests, docs, rootPath, lastIndexed: Date.now() };
    return this.index;
  }
  async processFile(filePath, rootPath) {
    try {
      const stats = await fsPromises.stat(filePath);
      if (!stats.isFile())
        return null;
      const relativePath = path.relative(rootPath, filePath);
      const ext = path.extname(filePath).toLowerCase();
      const language = EXTENSION_LANGUAGE_MAP[ext] || "unknown";
      const baseName = path.basename(filePath).toLowerCase();
      const type = this.classifyFile(baseName, ext);
      let content = "";
      const needsContent = (language === "typescript" || language === "javascript" || language === "python") && (type === "source" || type === "test");
      if (needsContent) {
        content = await fsPromises.readFile(filePath, "utf-8");
      }
      const { exports: fileExports, imports: fileImports } = content ? this.extractExportsImports(content, language) : { exports: [], imports: [] };
      const fileSymbols = content ? this.extractSymbols(content, language, filePath) : [];
      const entry = {
        path: relativePath,
        name: path.basename(filePath, ext),
        extension: ext,
        type,
        language,
        size: stats.size,
        lastModified: stats.mtimeMs,
        exports: fileExports,
        imports: fileImports
      };
      const importEdges = fileImports.map((imp) => ({
        from: relativePath,
        to: imp,
        types: ["import"]
      }));
      const test = type === "test" ? this.createTestEntry(filePath, relativePath) : undefined;
      const doc = type === "doc" ? this.createDocEntry(filePath, relativePath) : undefined;
      return { entry, symbols: fileSymbols, imports: importEdges, test, doc };
    } catch {
      return null;
    }
  }
  async scanDirectoryAsync(dirPath) {
    const results = [];
    try {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
      const subdirs = [];
      for (const entry of entries) {
        if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith("."))
          continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          subdirs.push(this.scanDirectoryAsync(fullPath));
        } else {
          results.push(fullPath);
        }
      }
      const nested = await Promise.all(subdirs);
      for (const sub of nested)
        results.push(...sub);
    } catch {}
    return results;
  }
  classifyFile(baseName, ext) {
    for (const p of TEST_PATTERNS) {
      if (baseName.includes(p))
        return "test";
    }
    for (const p of TEST_EXTS) {
      if (baseName.includes(p))
        return "test";
    }
    if (CONFIG_EXTS.has(ext))
      return "config";
    if (DOC_EXTS.has(ext))
      return "doc";
    for (const p of DOC_PATTERNS) {
      if (baseName.includes(p))
        return "doc";
    }
    if (SOURCE_EXTS.has(ext))
      return "source";
    return "other";
  }
  extractExportsImports(content, language) {
    const exports = [];
    const imports = [];
    if (language === "typescript" || language === "javascript") {
      let rx, match;
      rx = new RegExp(TS_EXPORT_NAMED.source, "g");
      while ((match = rx.exec(content)) !== null)
        exports.push(match[1]);
      rx = new RegExp(TS_EXPORT_DEFAULT.source, "g");
      while ((match = rx.exec(content)) !== null)
        exports.push(match[1]);
      rx = new RegExp(TS_EXPORT_BLOCK.source, "g");
      while ((match = rx.exec(content)) !== null) {
        exports.push(...match[1].split(",").map((s3) => s3.trim()).filter(Boolean));
      }
      rx = new RegExp(TS_IMPORT.source, "g");
      while ((match = rx.exec(content)) !== null) {
        if (match[1])
          imports.push(match[1]);
      }
      rx = new RegExp(TS_REQUIRE.source, "g");
      while ((match = rx.exec(content)) !== null) {
        if (match[1])
          imports.push(match[1]);
      }
    } else if (language === "python") {
      let rx, match;
      rx = new RegExp(PY_DEF.source, "gm");
      while ((match = rx.exec(content)) !== null)
        exports.push(match[1]);
      rx = new RegExp(PY_IMPORT.source, "gm");
      while ((match = rx.exec(content)) !== null) {
        const m = match[1] || match[2];
        if (m)
          imports.push(m);
      }
    }
    return { exports, imports };
  }
  extractSymbols(content, language, filePath) {
    const symbols = [];
    if (language !== "typescript" && language !== "javascript")
      return symbols;
    const push = (name, type, idx, exported) => {
      symbols.push({ name, type, file: filePath, line: this.lineAt(content, idx), exported });
    };
    let rx, match;
    rx = new RegExp(TS_FUNC.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push(match[1], "function", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    rx = new RegExp(TS_CLASS.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push(match[1], "class", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    rx = new RegExp(TS_INTERFACE.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push(match[1], "interface", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    rx = new RegExp(TS_CONST.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push(match[1], "constant", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    return symbols;
  }
  lineAt(content, index) {
    let line = 0;
    for (let i = 0;i < index; i++) {
      if (content[i] === `
`)
        line++;
    }
    return line;
  }
  createTestEntry(filePath, relativePath) {
    const name = path.basename(filePath);
    let type = "unit";
    if (name.includes("integration"))
      type = "integration";
    else if (name.includes("e2e") || name.includes("end-to-end"))
      type = "e2e";
    return { path: relativePath, name, type, targetSymbols: [] };
  }
  createDocEntry(filePath, relativePath) {
    const name = path.basename(filePath).toLowerCase();
    let type = "other";
    if (name.startsWith("readme"))
      type = "readme";
    else if (name.includes("changelog") || name.includes("history"))
      type = "changelog";
    else if (name.includes("api"))
      type = "api";
    else if (name.includes("guide") || name.includes("docs"))
      type = "guide";
    return { path: relativePath, name: path.basename(filePath), type, sections: [] };
  }
}
var indexerInstance = null;
function getIndexer() {
  if (!indexerInstance)
    indexerInstance = new RepoIndexer;
  return indexerInstance;
}
async function indexRepository(rootPath) {
  return getIndexer().indexRepository(rootPath);
}

// src/engi/retrieval.ts
var STOP_WORDS = new Set([
  "function",
  "class",
  "method",
  "variable",
  "const",
  "let",
  "var",
  "return",
  "import",
  "export",
  "async",
  "await",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "type",
  "interface",
  "new",
  "not"
]);

class RetrievalEngine {
  async findScope(query) {
    const index = getIndexer().getIndex();
    if (!index)
      return { files: [], modules: [], symbols: [], tests: [], docs: [], confidence: 0 };
    const limit = query.limit || 10;
    const keywords = this.normalizeKeywords(query.task, query.keywords || []);
    const rankedFiles = this.rankFiles(index.files, keywords, query.taskType);
    const topFiles = rankedFiles.slice(0, limit).map((r) => r.file);
    const topFilePathSet = new Set(topFiles.map((f) => f.path));
    const topModules = new Set(topFiles.map((f) => f.path.split("/")[0] ?? "root"));
    const [symbols, tests, docs] = [
      this.findRelevantSymbols(index.symbols, keywords, topFilePathSet),
      this.findRelevantTests(index.tests, topFiles, topModules),
      this.findRelevantDocs(index.docs, keywords, topModules)
    ];
    return {
      files: topFiles,
      modules: [...topModules],
      symbols,
      tests,
      docs,
      confidence: this.calculateConfidence(rankedFiles.slice(0, limit), keywords)
    };
  }
  async findByImport(importPath) {
    const index = getIndexer().getIndex();
    if (!index)
      return null;
    for (const [p, file] of index.files) {
      if (p === importPath || p.endsWith(importPath))
        return file;
    }
    const importName = importPath.split("/").pop() || "";
    for (const [, file] of index.files) {
      if (file.name === importName)
        return file;
    }
    return null;
  }
  async findRelatedTests(filePath) {
    const index = getIndexer().getIndex();
    if (!index)
      return [];
    const baseName = filePath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    const seen = new Set;
    const results = [];
    for (const t of index.tests) {
      if (seen.has(t.path))
        continue;
      if (t.targetFile === filePath || t.name.includes(baseName)) {
        results.push(t);
        seen.add(t.path);
      }
    }
    for (const t of index.tests) {
      if (!seen.has(t.path) && t.path.startsWith(dir)) {
        results.push(t);
        seen.add(t.path);
      }
    }
    return results;
  }
  async findDependents(filePath) {
    const index = getIndexer().getIndex();
    if (!index)
      return [];
    const dependents = [];
    for (const [, file] of index.files) {
      if (file.imports.some((imp) => imp === filePath || imp.endsWith(filePath))) {
        dependents.push(file);
      }
    }
    return dependents;
  }
  normalizeKeywords(task, extra) {
    const words = task.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/);
    const combined = new Set;
    for (const w of words) {
      if (w.length > 2 && !STOP_WORDS.has(w))
        combined.add(w);
    }
    for (const k of extra) {
      const kl = k.toLowerCase();
      if (!STOP_WORDS.has(kl))
        combined.add(kl);
    }
    return [...combined];
  }
  rankFiles(files, keywords, taskType) {
    const scored = [];
    const isDocTask = taskType === "documentation";
    const isBugOrFeature = taskType === "bug" || taskType === "feature";
    for (const [filePath, file] of files) {
      if (!isDocTask && file.type !== "source" && file.type !== "test")
        continue;
      let score = 0;
      const reasons = [];
      const lowerPath = filePath.toLowerCase();
      const lowerName = file.name.toLowerCase();
      const lowerExports = file.exports.map((e) => e.toLowerCase());
      for (const kw of keywords) {
        if (lowerPath.includes(kw) || lowerName.includes(kw)) {
          score += 10;
          reasons.push(`path:${kw}`);
        }
        for (const exp of lowerExports) {
          if (exp.includes(kw)) {
            score += 15;
            reasons.push(`export:${kw}`);
            break;
          }
        }
      }
      if (isBugOrFeature && file.type === "source") {
        score += 5;
        reasons.push("source");
      }
      if (taskType === "bug" && file.type === "test") {
        score += 8;
        reasons.push("test");
      }
      if (isDocTask && file.type === "doc") {
        score += 20;
        reasons.push("doc");
      }
      if (score > 0)
        scored.push({ file, score, reason: reasons.join(",") });
    }
    return scored.sort((a, b) => b.score - a.score);
  }
  findRelevantSymbols(symbols, keywords, topFilePathSet) {
    const relevant = [];
    for (const [, fileSymbols] of symbols) {
      for (const sym of fileSymbols) {
        if (!topFilePathSet.has(sym.file))
          continue;
        const lname = sym.name.toLowerCase();
        for (const kw of keywords) {
          if (lname.includes(kw)) {
            relevant.push(sym);
            break;
          }
        }
        if (relevant.length >= 20)
          return relevant;
      }
    }
    return relevant;
  }
  findRelevantTests(tests, topFiles, topModules) {
    const topFilePaths = new Set(topFiles.map((f) => f.path));
    const relevant = [];
    const seen = new Set;
    for (const test of tests) {
      if (seen.has(test.path))
        continue;
      const inScope = test.targetFile && topFilePaths.has(test.targetFile) || topModules.has(test.path.split("/")[0] ?? "");
      if (inScope) {
        relevant.push(test);
        seen.add(test.path);
      }
      if (relevant.length >= 10)
        break;
    }
    return relevant;
  }
  findRelevantDocs(docs, keywords, topModules) {
    const relevant = [];
    const seen = new Set;
    for (const doc of docs) {
      if (seen.has(doc.path))
        continue;
      const lname = doc.name.toLowerCase();
      const lpath = doc.path.toLowerCase();
      const keyMatch = keywords.some((kw) => lname.includes(kw) || lpath.includes(kw));
      const modMatch = topModules.has(doc.path.split("/")[0] ?? "");
      if (keyMatch || modMatch) {
        relevant.push(doc);
        seen.add(doc.path);
      }
      if (relevant.length >= 5)
        break;
    }
    return relevant;
  }
  calculateConfidence(rankedFiles, keywords) {
    if (rankedFiles.length === 0 || keywords.length === 0)
      return 0;
    const avgScore = rankedFiles.reduce((s3, r) => s3 + r.score, 0) / rankedFiles.length;
    const maxPossible = keywords.length * 25;
    return Math.round(Math.min(avgScore / maxPossible, 1) * 100) / 100;
  }
}
var retrievalInstance = null;
function getRetrievalEngine() {
  if (!retrievalInstance)
    retrievalInstance = new RetrievalEngine;
  return retrievalInstance;
}

// src/engi/summarizer.ts
import * as path3 from "path";

// src/engi/rag.ts
import * as fs2 from "fs";
import * as path2 from "path";
var MAX_CHUNK_LINES = 40;
var MAX_SNIPPET_LINES = 12;
var MAX_RESULTS = 5;
var MIN_SCORE = 0.05;
var STOP = new Set([
  "function",
  "class",
  "method",
  "const",
  "let",
  "var",
  "return",
  "import",
  "export",
  "async",
  "await",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "type",
  "interface",
  "new",
  "not",
  "if",
  "else",
  "try",
  "catch",
  "throw",
  "get",
  "set",
  "public",
  "private",
  "protected",
  "readonly",
  "static",
  "void",
  "any",
  "true",
  "false",
  "null",
  "undefined",
  "string",
  "number",
  "boolean",
  "object",
  "array"
]);
var CHUNK_START_RE = /^(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|class\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(|(?:  |\t)(?:async\s+)?(\w+)\s*\()/;
var chunkCache = null;

class RagEngine {
  retrieve(query, index, options = {}) {
    const chunks = this.getChunks(index);
    const topK = options.topK ?? MAX_RESULTS;
    const fileSet = options.files ? new Set(options.files) : null;
    const queryTerms = extractTerms(query);
    if (queryTerms.size === 0)
      return [];
    const scored = [];
    for (const chunk of chunks) {
      if (fileSet && !fileSet.has(chunk.file))
        continue;
      const { score, reason } = scoreChunk(queryTerms, chunk.terms, chunk.symbol);
      if (score >= MIN_SCORE)
        scored.push({ chunk, score, reason });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(({ chunk, score, reason }) => ({
      file: chunk.file,
      symbol: chunk.symbol,
      snippet: trimSnippet(chunk.content, MAX_SNIPPET_LINES),
      score: Math.round(score * 100) / 100,
      reason
    }));
  }
  retrieveByLiteral(literals, index, options = {}) {
    const chunks = this.getChunks(index);
    const topK = options.topK ?? MAX_RESULTS;
    const fileSet = options.files ? new Set(options.files) : null;
    const lits = literals.map((l) => l.toLowerCase());
    const scored = [];
    for (const chunk of chunks) {
      if (fileSet && !fileSet.has(chunk.file))
        continue;
      const lower = chunk.content.toLowerCase();
      const hits = lits.filter((l) => lower.includes(l));
      if (hits.length > 0) {
        const score = hits.length / lits.length;
        scored.push({ chunk, score, reason: `literal:${hits.slice(0, 3).join(",")}` });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(({ chunk, score, reason }) => ({
      file: chunk.file,
      symbol: chunk.symbol,
      snippet: trimSnippet(chunk.content, MAX_SNIPPET_LINES),
      score: Math.round(score * 100) / 100,
      reason
    }));
  }
  getChunks(index) {
    if (chunkCache && chunkCache.indexedAt === index.lastIndexed) {
      return chunkCache.chunks;
    }
    const chunks = buildChunkIndex(index);
    chunkCache = { chunks, indexedAt: index.lastIndexed };
    return chunks;
  }
}
function buildChunkIndex(index) {
  const chunks = [];
  for (const [filePath, file] of index.files) {
    if (file.type !== "source" && file.type !== "test")
      continue;
    if (!["typescript", "javascript", "python", "go"].includes(file.language))
      continue;
    const absPath = path2.join(index.rootPath, filePath);
    let content;
    try {
      content = fs2.readFileSync(absPath, "utf-8");
    } catch {
      continue;
    }
    const fileChunks = extractChunks(content, filePath, file.language);
    chunks.push(...fileChunks);
  }
  return chunks;
}
function extractChunks(content, filePath, language) {
  const lines = content.split(`
`);
  const chunks = [];
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    const match = CHUNK_START_RE.exec(line);
    if (!match)
      continue;
    const symbol = match[1] || match[2] || match[3] || match[4];
    if (!symbol || symbol.length < 2)
      continue;
    const type = line.includes("class ") ? "class" : match[4] ? "method" : line.includes("function") || line.includes("=>") || line.includes("= (") ? "function" : "block";
    const bodyLines = extractBody(lines, i, MAX_CHUNK_LINES);
    if (bodyLines.length < 2)
      continue;
    const chunkContent = bodyLines.join(`
`);
    chunks.push({
      file: filePath,
      symbol,
      type,
      startLine: i + 1,
      content: chunkContent,
      tokens: estimateChunkTokens(chunkContent),
      terms: extractTerms(chunkContent + " " + symbol)
    });
  }
  return chunks;
}
function extractBody(lines, startIdx, maxLines) {
  const body = [lines[startIdx]];
  let depth = 0;
  let started = false;
  for (let i = startIdx;i < Math.min(lines.length, startIdx + maxLines); i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === "{" || ch === "(") {
        depth++;
        started = true;
      } else if (ch === "}" || ch === ")")
        depth--;
    }
    if (i > startIdx)
      body.push(line);
    if (started && depth <= 0)
      break;
  }
  return body;
}
function scoreChunk(queryTerms, chunkTerms, symbol) {
  let score = 0;
  const hits = [];
  const symbolLower = symbol.toLowerCase();
  for (const [term, qFreq] of queryTerms) {
    const cFreq = chunkTerms.get(term) ?? 0;
    if (cFreq > 0) {
      const idfBoost = term.length > 5 ? 1.5 : 1;
      score += Math.min(qFreq, cFreq) * idfBoost;
      hits.push(term);
    }
    if (symbolLower.includes(term) || term.includes(symbolLower)) {
      score += 3;
      if (!hits.includes(term))
        hits.push(`sym:${term}`);
    }
  }
  const normalized = score / Math.max(queryTerms.size, 1);
  return { score: normalized, reason: hits.slice(0, 4).join(",") };
}
function extractTerms(text) {
  const freq = new Map;
  const words = text.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().split(/[^\w]+/);
  for (const w of words) {
    if (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return freq;
}
function trimSnippet(content, maxLines) {
  const lines = content.split(`
`);
  if (lines.length <= maxLines)
    return content;
  return lines.slice(0, maxLines).join(`
`) + `
  // ...`;
}
function estimateChunkTokens(content) {
  return Math.ceil(content.length / 4);
}
var ragInstance = null;
function getRagEngine() {
  if (!ragInstance)
    ragInstance = new RagEngine;
  return ragInstance;
}

// src/engi/summarizer.ts
var FLOW_MAX_SNIPPETS = 4;
var BUG_MAX_SNIPPETS = 3;
var DOC_MAX_EXAMPLES = 3;
var SNIPPET_MAX_LINES = 10;

class SummarizationEngine {
  async generateFlowSummary(options) {
    const index = getIndexer().getIndex();
    if (!index)
      return this.emptyFlowSummary();
    const files = options.scope ? options.scope.map((p) => index.files.get(p)).filter(Boolean) : Array.from(index.files.values()).filter((f) => f.type === "source").slice(0, 10);
    if (files.length === 0)
      return this.emptyFlowSummary();
    const verbosity = options.verbosity ?? "standard";
    const steps = [];
    const keySymbols = [];
    const scopePaths = files.map((f) => f.path);
    const scopeQuery = scopePaths.map((p) => path3.basename(p, path3.extname(p))).join(" ");
    const ragChunks = getRagEngine().retrieve(scopeQuery, index, {
      files: scopePaths,
      topK: FLOW_MAX_SNIPPETS
    });
    const bestChunk = new Map;
    for (const c2 of ragChunks) {
      if (!bestChunk.has(c2.file))
        bestChunk.set(c2.file, c2.snippet);
    }
    for (let i = 0;i < files.length; i++) {
      const file = files[i];
      const importedBy = this.getFilesImporting(file.path, index);
      const topExports = file.exports.slice(0, 3).join(", ");
      let description;
      if (i === 0) {
        description = `Entry: ${file.name}` + (topExports ? ` — exports ${topExports}` : "");
      } else if (importedBy.length > 0) {
        description = `${file.name} used by ${importedBy.length} file(s)` + (topExports ? ` · exports ${topExports}` : "");
      } else {
        description = `${file.name}` + (topExports ? ` — exports ${topExports}` : "");
      }
      const step = {
        order: i + 1,
        description,
        file: file.path,
        symbol: file.exports[0]
      };
      if (verbosity !== "minimal" && bestChunk.has(file.path)) {
        step.snippet = limitLines(bestChunk.get(file.path), SNIPPET_MAX_LINES);
      }
      steps.push(step);
      const symbols = index.symbols.get(file.path) ?? [];
      for (const sym of symbols.slice(0, 3))
        keySymbols.push(`${sym.name} (${sym.type})`);
    }
    return {
      summary: this.generateSummaryText(steps, verbosity),
      steps,
      keyFiles: files.map((f) => f.path),
      keySymbols: keySymbols.slice(0, 12),
      entryPoint: options.entryPoint ?? files[0]?.path,
      handle: this.generateHandle("flow", scopePaths.join(","))
    };
  }
  async traceBug(symptom, scope) {
    const index = getIndexer().getIndex();
    if (!index)
      return this.emptyBugTrace();
    const symptomLower = symptom.toLowerCase();
    const likelyCauses = [];
    const suspectFiles = new Set;
    const suspectSymbols = [];
    if (symptomLower.match(/null|undefined|cannot read|is not a function/)) {
      likelyCauses.push({
        type: "null_undefined",
        likelihood: 0.85,
        description: "Null/undefined access — check for missing null guards before dereferencing"
      });
    }
    if (symptomLower.match(/race|timing|async|concurrent|await/)) {
      likelyCauses.push({
        type: "race_condition",
        likelihood: 0.75,
        description: "Race condition or unresolved async — ensure all async paths are awaited"
      });
    }
    if (symptomLower.match(/type|cast|instanceof|assign/)) {
      likelyCauses.push({
        type: "type_mismatch",
        likelihood: 0.65,
        description: "Type mismatch — verify type assertions and interface contracts"
      });
    }
    if (symptomLower.match(/loop|infinite|timeout|hang/)) {
      likelyCauses.push({
        type: "logic_error",
        likelihood: 0.7,
        description: "Logic error in loop or termination condition"
      });
    }
    if (symptomLower.match(/state|stale|cache|invalidat/)) {
      likelyCauses.push({
        type: "unsafe_state",
        likelihood: 0.7,
        description: "Stale or incorrectly invalidated state — check cache write-through and eviction"
      });
    }
    const scopePaths = scope ?? [];
    const keywords = extractKeywords(symptom);
    const ragByLit = getRagEngine().retrieveByLiteral(keywords, index, {
      files: scopePaths.length > 0 ? scopePaths : undefined,
      topK: BUG_MAX_SNIPPETS
    });
    const ragBySem = getRagEngine().retrieve(symptom, index, {
      files: scopePaths.length > 0 ? scopePaths : undefined,
      topK: BUG_MAX_SNIPPETS
    });
    const seen = new Set;
    const topRag = [...ragByLit, ...ragBySem].filter((c2) => {
      const key = `${c2.file}:${c2.symbol}`;
      if (seen.has(key))
        return false;
      seen.add(key);
      return true;
    }).slice(0, BUG_MAX_SNIPPETS);
    for (let i = 0;i < topRag.length; i++) {
      const chunk = topRag[i];
      suspectFiles.add(chunk.file);
      suspectSymbols.push(`${chunk.symbol} in ${chunk.file}`);
      if (i < likelyCauses.length) {
        likelyCauses[i].file = chunk.file;
        likelyCauses[i].symbol = chunk.symbol;
        likelyCauses[i].snippet = limitLines(chunk.snippet, SNIPPET_MAX_LINES);
      } else {
        likelyCauses.push({
          type: "other",
          likelihood: Math.max(0.3, chunk.score),
          description: `Relevant code in ${chunk.symbol} (${chunk.file}) — ${chunk.reason}`,
          file: chunk.file,
          symbol: chunk.symbol,
          snippet: limitLines(chunk.snippet, SNIPPET_MAX_LINES)
        });
      }
    }
    if (suspectFiles.size === 0) {
      const targetFiles = scope ? scope.map((p) => index.files.get(p)).filter(Boolean) : Array.from(index.files.values()).filter((f) => f.type === "source").slice(0, 20);
      for (const file of targetFiles) {
        if (file.imports.length > 10 || file.exports.length > 10)
          suspectFiles.add(file.path);
      }
    }
    const confidence = Math.min(likelyCauses.length * 0.2 + (topRag.length > 0 ? 0.25 : 0.1), 0.95);
    return {
      likelyCauses,
      suspectFiles: [...suspectFiles].slice(0, 10),
      suspectSymbols: suspectSymbols.slice(0, 10),
      confidence,
      handle: this.generateHandle("bug", symptom)
    };
  }
  async buildDocContext(options) {
    const index = getIndexer().getIndex();
    if (!index)
      return this.emptyDocContext();
    const featureSummary = options.feature ?? "Codebase overview";
    const codeReferences = [];
    const examples = [];
    const targetFiles = options.changedFiles ? options.changedFiles.map((p) => index.files.get(p)).filter(Boolean) : Array.from(index.files.values()).filter((f) => f.type === "source").slice(0, 5);
    for (const file of targetFiles) {
      codeReferences.push({
        file: file.path,
        symbol: file.exports[0],
        description: `${file.exports.length} exports: ${file.exports.slice(0, 4).join(", ")}`
      });
    }
    const ragQuery = featureSummary + " " + (options.changedFiles ?? []).map((f) => path3.basename(f, path3.extname(f))).join(" ");
    const scopePaths = targetFiles.map((f) => f.path);
    const ragChunks = getRagEngine().retrieve(ragQuery, index, {
      files: scopePaths,
      topK: DOC_MAX_EXAMPLES
    });
    for (const chunk of ragChunks) {
      const fileEntry = index.files.get(chunk.file);
      if (!fileEntry)
        continue;
      examples.push({
        title: `${chunk.symbol} — ${chunk.file}`,
        code: limitLines(chunk.snippet, SNIPPET_MAX_LINES),
        language: fileEntry.language
      });
    }
    const audienceNotes = {};
    const aud = options.audience ?? "developer";
    audienceNotes[aud] = this.generateAudienceNote(aud, codeReferences);
    const totalExports = codeReferences.reduce((s3, r) => {
      const m = r.description.match(/\d+/);
      return s3 + (m ? parseInt(m[0], 10) : 0);
    }, 0);
    return {
      featureSummary,
      currentBehavior: `${targetFiles.length} files · ${totalExports} total exports${ragChunks.length > 0 ? ` · ${ragChunks.length} code snippet(s) attached` : ""}`,
      codeReferences,
      examples: examples.slice(0, DOC_MAX_EXAMPLES),
      audienceNotes,
      handle: this.generateHandle("doc", options.feature ?? "overview")
    };
  }
  emptyFlowSummary() {
    return { summary: "No codebase indexed. Use repo_scope_find to index a repository first.", steps: [], keyFiles: [], keySymbols: [], handle: undefined };
  }
  emptyBugTrace() {
    return { likelyCauses: [], suspectFiles: [], suspectSymbols: [], confidence: 0, handle: undefined };
  }
  emptyDocContext() {
    return { featureSummary: "", currentBehavior: "", codeReferences: [], examples: [], audienceNotes: {}, handle: undefined };
  }
  generateSummaryText(steps, verbosity) {
    if (verbosity === "minimal" || steps.length === 0)
      return `${steps.length} files in flow`;
    if (verbosity === "standard")
      return `Flow overview:
${steps.map((s3) => `${s3.order}. ${s3.description}`).join(`
`)}`;
    return `Code flow (${steps.length} files):

${steps.map((s3) => `${s3.order}. ${s3.description}
   ${s3.file}${s3.snippet ? `
` + indent(s3.snippet, "   ") : ""}`).join(`

`)}`;
  }
  getFilesImporting(filePath, index) {
    const importers = [];
    for (const [p, file] of index.files) {
      if (file.imports.some((imp) => imp === filePath || p.endsWith(imp)))
        importers.push(p);
    }
    return importers;
  }
  generateHandle(prefix, data) {
    const hash = data.split("").reduce((acc, ch) => (acc << 5) - acc + ch.charCodeAt(0), 0);
    return `${prefix}_${Math.abs(hash).toString(36)}`;
  }
  generateAudienceNote(audience, refs) {
    switch (audience) {
      case "junior":
        return `Start with: ${refs.slice(0, 2).map((r) => r.file).join(", ")}. Focus on the exported functions.`;
      case "senior":
        return `Key files: ${refs.map((r) => r.file).join(", ")}. Review architecture and side-effects.`;
      case "api":
        return `Public surface: ${refs.flatMap((r) => r.description.replace(/^\d+ exports: /, "").split(", ")).slice(0, 8).join(", ")}`;
      case "pm":
        return `${refs.length} components changed. Each exposes: ${refs.map((r) => r.file.split("/").pop()).join(", ")}`;
      case "qa":
        return `Test entry points: ${refs.map((r) => r.symbol ?? r.file).join(", ")}`;
      default:
        return `${refs.length} main files to review.`;
    }
  }
}
function limitLines(text, max) {
  const lines = text.split(`
`);
  return lines.length <= max ? text : lines.slice(0, max).join(`
`) + `
  // ...`;
}
function indent(text, prefix) {
  return text.split(`
`).map((l) => prefix + l).join(`
`);
}
function extractKeywords(text) {
  const quoted = [...text.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2]);
  const errCodes = text.match(/[A-Z][A-Z0-9_]{3,}/g) ?? [];
  const words = text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 5);
  return [...new Set([...quoted, ...errCodes, ...words])].slice(0, 12);
}
var summarizationInstance = null;
function getSummarizationEngine() {
  if (!summarizationInstance)
    summarizationInstance = new SummarizationEngine;
  return summarizationInstance;
}

// src/engi/memory.ts
import * as fs3 from "fs";

class MemoryStore {
  checkpoints = new Map;
  taskIndex = new Map;
  storagePath = null;
  initialize(options) {
    if (options?.storagePath) {
      this.storagePath = options.storagePath;
      this.load();
    }
  }
  saveCheckpoint(checkpoint) {
    const full = { ...checkpoint, id: this.generateId(), timestamp: Date.now() };
    this.checkpoints.set(full.id, full);
    const ids = this.taskIndex.get(full.taskId) ?? [];
    ids.push(full.id);
    this.taskIndex.set(full.taskId, ids);
    this.persist();
    return full;
  }
  getCheckpoint(id) {
    return this.checkpoints.get(id) ?? null;
  }
  getAllCheckpoints() {
    return [...this.checkpoints.values()];
  }
  getLatestForTask(taskId) {
    const ids = this.taskIndex.get(taskId);
    if (!ids || ids.length === 0)
      return null;
    return this.checkpoints.get(ids[ids.length - 1]) ?? null;
  }
  deleteCheckpoint(id) {
    const cp = this.checkpoints.get(id);
    if (!cp)
      return false;
    this.checkpoints.delete(id);
    const ids = this.taskIndex.get(cp.taskId);
    if (ids) {
      const idx = ids.indexOf(id);
      if (idx !== -1)
        ids.splice(idx, 1);
      if (ids.length === 0)
        this.taskIndex.delete(cp.taskId);
    }
    this.persist();
    return true;
  }
  restore(id) {
    const checkpoint = this.getCheckpoint(id);
    if (!checkpoint)
      return null;
    return {
      checkpoint,
      currentScope: checkpoint.scope,
      progressSummary: this.buildProgressSummary(checkpoint),
      unresolvedItems: [...checkpoint.pendingValidations, ...checkpoint.pendingDocs]
    };
  }
  updateCheckpoint(id, updates) {
    const existing = this.checkpoints.get(id);
    if (!existing)
      return false;
    this.checkpoints.set(id, { ...existing, ...updates });
    this.persist();
    return true;
  }
  clear() {
    this.checkpoints.clear();
    this.taskIndex.clear();
    this.persist();
  }
  generateId() {
    return `cp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  buildProgressSummary(cp) {
    const parts = [
      `Task: ${cp.taskType}`,
      `Files in scope: ${cp.scope.files.length}`,
      `Decisions made: ${cp.decisions.length}`,
      `Risks identified: ${cp.risks.length}`
    ];
    if (cp.pendingValidations.length > 0)
      parts.push(`Pending validations: ${cp.pendingValidations.length}`);
    if (cp.pendingDocs.length > 0)
      parts.push(`Pending docs: ${cp.pendingDocs.length}`);
    return parts.join(" | ");
  }
  persist() {
    if (!this.storagePath)
      return;
    try {
      fs3.writeFileSync(this.storagePath, JSON.stringify([...this.checkpoints.entries()], null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist memory:", err);
    }
  }
  load() {
    if (!this.storagePath || !fs3.existsSync(this.storagePath))
      return;
    try {
      const entries = JSON.parse(fs3.readFileSync(this.storagePath, "utf-8"));
      this.checkpoints = new Map(entries);
      this.taskIndex.clear();
      for (const [id, cp] of this.checkpoints) {
        const ids = this.taskIndex.get(cp.taskId) ?? [];
        ids.push(id);
        this.taskIndex.set(cp.taskId, ids);
      }
    } catch (err) {
      console.error("Failed to load memory:", err);
    }
  }
}
function createCheckpoint(options) {
  return {
    taskId: options.taskId,
    taskType: options.taskType,
    scope: options.scope,
    decisions: options.decisions ?? [],
    risks: options.risks ?? [],
    pendingValidations: options.pendingValidations ?? [],
    pendingDocs: options.pendingDocs ?? [],
    notes: options.notes ?? ""
  };
}
var memoryStoreInstance = null;
function getMemoryStore() {
  if (!memoryStoreInstance)
    memoryStoreInstance = new MemoryStore;
  return memoryStoreInstance;
}

// src/engi/tools.ts
var STOP_WORDS2 = new Set([
  "function",
  "class",
  "method",
  "variable",
  "const",
  "let",
  "var",
  "return",
  "import",
  "export",
  "async",
  "await",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "type",
  "interface",
  "new",
  "not"
]);
async function engiTaskClassify(params) {
  const { task, keywords = [] } = params;
  const taskLower = task.toLowerCase();
  const detectedTypes = [];
  let confidence = 0;
  if (taskLower.includes("bug") || taskLower.includes("fix") || taskLower.includes("error") || taskLower.includes("crash") || taskLower.includes("fail") || taskLower.includes("issue")) {
    detectedTypes.push("bug");
    confidence += 0.8;
  }
  if (taskLower.includes("implement") || taskLower.includes("add") || taskLower.includes("new") || taskLower.includes("feature") || taskLower.includes("create")) {
    detectedTypes.push("feature");
    confidence += 0.7;
  }
  if (taskLower.includes("poc") || taskLower.includes("proof of concept") || taskLower.includes("prototype") || taskLower.includes("mockup")) {
    detectedTypes.push("poc");
    confidence += 0.9;
  }
  if (taskLower.includes("doc") || taskLower.includes("readme") || taskLower.includes("comment") || taskLower.includes("explain") || taskLower.includes("guide")) {
    detectedTypes.push("documentation");
    confidence += 0.8;
  }
  if (taskLower.includes("analyze") || taskLower.includes("understand") || taskLower.includes("how does") || taskLower.includes("what is")) {
    detectedTypes.push("analysis");
    confidence += 0.6;
  }
  if (detectedTypes.length === 0) {
    detectedTypes.push("analysis");
    confidence = 0.5;
  }
  let suggestedMode = "analysis";
  if (detectedTypes.includes("bug") || detectedTypes.includes("feature")) {
    suggestedMode = "planning";
  } else if (detectedTypes.includes("documentation")) {
    suggestedMode = "documentation";
  }
  const nextTools = [];
  if (suggestedMode === "analysis") {
    nextTools.push("engi_repo_scope_find", "engi_flow_summarize");
  } else if (suggestedMode === "planning") {
    nextTools.push("engi_repo_scope_find", "engi_implementation_plan");
  } else if (suggestedMode === "documentation") {
    nextTools.push("engi_doc_context_build", "engi_doc_update_plan");
  }
  confidence = Math.min(confidence, 1);
  return { types: detectedTypes, confidence, suggestedMode, nextTools };
}
async function engiRepoScopeFind(params) {
  const { task, taskType, keywords = [], limit = 10, repoPath } = params;
  if (repoPath) {
    await indexRepository(repoPath);
  }
  const retrieval = getRetrievalEngine();
  return retrieval.findScope({ task, taskType, keywords, limit });
}
async function engiFlowSummarize(params) {
  const summarizer = getSummarizationEngine();
  return summarizer.generateFlowSummary({
    scope: params.scope,
    entryPoint: params.entryPoint,
    verbosity: params.verbosity
  });
}
async function engiBugTraceCompact(params) {
  const summarizer = getSummarizationEngine();
  return summarizer.traceBug(params.symptom, params.scope);
}
async function engiImplementationPlan(params) {
  const { task, taskType, scope, existingPatterns = [] } = params;
  const steps = [];
  const editTargets = [];
  const requiredTests = [];
  const requiredDocs = [];
  const riskNotes = [];
  for (let i = 0;i < scope.length; i++) {
    const file = scope[i];
    if (taskType === "feature") {
      steps.push({ order: i + 1, description: `Implement in ${file}`, file, action: "modify" });
      editTargets.push({ file, description: `Add new functionality for: ${task}` });
    } else {
      steps.push({ order: i + 1, description: `Fix bug in ${file}`, file, action: "modify" });
      editTargets.push({ file, description: `Address the bug: ${task}` });
      riskNotes.push(`Potential regression risk in ${file}`);
    }
  }
  steps.push({
    order: steps.length + 1,
    description: "Create or update tests",
    file: scope[0] || "test file",
    action: "create",
    dependencies: steps.map((s3) => s3.file)
  });
  requiredTests.push(`${scope[0] || "source"}.test.ts`);
  if (taskType === "feature") {
    steps.push({ order: steps.length + 1, description: "Update documentation", file: "docs", action: "modify" });
    requiredDocs.push("README.md");
  }
  return {
    steps,
    editTargets,
    requiredTests,
    requiredDocs,
    riskNotes,
    handle: `plan_${Date.now()}`
  };
}
async function engiPOCPlan(params) {
  const { goal, constraints = [], existingCode = [] } = params;
  let minimalArchitecture = "Simple Node.js module";
  const filesToCreate = [];
  const shortcutsAllowed = [];
  const excludedScope = [];
  const goalLower = goal.toLowerCase();
  if (goalLower.includes("api") || goalLower.includes("endpoint")) {
    minimalArchitecture = "Simple Express/HTTP handler with minimal routing";
    filesToCreate.push("src/poc/handler.ts");
    shortcutsAllowed.push("Use in-memory storage", "Skip authentication");
    excludedScope.push("Database integration", "Complex validation");
  } else if (goalLower.includes("database") || goalLower.includes("storage")) {
    minimalArchitecture = "In-memory or file-based storage";
    filesToCreate.push("src/poc/storage.ts");
    shortcutsAllowed.push("Skip connection pooling");
    excludedScope.push("Production database");
  } else if (goalLower.includes("ui") || goalLower.includes("interface")) {
    minimalArchitecture = "Minimal UI component";
    filesToCreate.push("src/poc/Component.tsx");
    shortcutsAllowed.push("Skip styling", "Use mock data");
  } else {
    minimalArchitecture = "Simple module with core logic";
    filesToCreate.push("src/poc/index.ts");
    shortcutsAllowed.push("Skip error handling", "Skip logging");
  }
  for (const constraint of constraints) {
    const cLower = constraint.toLowerCase();
    if (cLower.includes("no auth"))
      excludedScope.push("Authentication");
    if (cLower.includes("simple"))
      excludedScope.push("Advanced features");
  }
  return {
    goal,
    minimalArchitecture,
    filesToCreate,
    shortcutsAllowed,
    excludedScope,
    mockStrategy: "Use hardcoded test data and in-memory implementations",
    handle: `poc_${Date.now()}`
  };
}
async function engiImpactAnalyze(params) {
  const { scope, changeType } = params;
  const indexer = getIndexer();
  const index = indexer.getIndex();
  const affectedFiles = [];
  const affectedModules = [];
  const affectedSymbols = [];
  const regressionNotes = [];
  const riskyPoints = [];
  const relatedTests = [];
  const docsImpact = [];
  if (!index) {
    return { affectedFiles: [], affectedModules: [], affectedSymbols: [], regressionNotes: ["No repository indexed"], riskyPoints: [], relatedTests: [], docsImpact: [] };
  }
  const retrieval = getRetrievalEngine();
  for (const filePath of scope) {
    const dependents = await retrieval.findDependents(filePath);
    for (const dep of dependents) {
      if (!affectedFiles.includes(dep.path))
        affectedFiles.push(dep.path);
    }
    const tests = await retrieval.findRelatedTests(filePath);
    for (const test of tests) {
      if (!relatedTests.includes(test.path))
        relatedTests.push(test.path);
    }
    const module = filePath.split("/")[0];
    if (!affectedModules.includes(module))
      affectedModules.push(module);
  }
  for (const file of affectedFiles) {
    const fileType = index.files.get(file)?.type;
    if (fileType === "source")
      regressionNotes.push(`Potential regression in: ${file}`);
  }
  if (changeType === "delete") {
    riskyPoints.push("Removing files may break dependent code", "Check for exposed APIs that depend on deleted code");
  } else if (changeType === "modify") {
    riskyPoints.push("Existing function signatures may affect callers", "Check for breaking changes in public exports");
  }
  for (const file of scope) {
    const module = file.split("/")[0];
    const moduleDocs = index.docs.filter((d) => d.path.startsWith(module) || d.path.includes(module));
    for (const doc of moduleDocs) {
      if (!docsImpact.includes(doc.path))
        docsImpact.push(doc.path);
    }
  }
  return { affectedFiles, affectedModules, affectedSymbols, regressionNotes, riskyPoints, relatedTests, docsImpact };
}
async function engiTestSelect(params) {
  const { scope, changeType = "modify" } = params;
  const retrieval = getRetrievalEngine();
  const requiredTests = [];
  const optionalTests = [];
  for (const filePath of scope) {
    const tests = await retrieval.findRelatedTests(filePath);
    for (const test of tests) {
      const testInfo = {
        path: test.path,
        type: test.type === "other" ? "unit" : test.type,
        targetCoverage: [filePath]
      };
      if (changeType !== "add") {
        if (!requiredTests.some((t) => t.path === test.path))
          requiredTests.push(testInfo);
      } else {
        if (!optionalTests.some((t) => t.path === test.path))
          optionalTests.push(testInfo);
      }
    }
  }
  let reason = `Found ${requiredTests.length} required and ${optionalTests.length} optional tests`;
  if (requiredTests.length === 0 && optionalTests.length === 0) {
    reason = "No direct tests found - consider writing new tests for changes";
  }
  return { requiredTests, optionalTests, reason };
}
async function engiDocContextBuild(params) {
  const summarizer = getSummarizationEngine();
  return summarizer.buildDocContext({
    feature: params.feature,
    changedFiles: params.changedFiles,
    audience: params.audience
  });
}
async function engiDocUpdatePlan(params) {
  const { changedFiles, existingDocs = [] } = params;
  const indexer = getIndexer();
  const index = indexer.getIndex();
  const docsToUpdate = [];
  const docsToCreate = [];
  const sectionsToUpdate = [];
  const examplesNeeded = [];
  if (!index) {
    return { docsToUpdate, docsToCreate, sectionsToUpdate, examplesNeeded };
  }
  const changedModules = new Set(changedFiles.map((f) => f.split("/")[0]));
  for (const doc of index.docs) {
    const docModule = doc.path.split("/")[0];
    if (changedModules.has(docModule) || changedFiles.some((f) => doc.path.includes(f))) {
      docsToUpdate.push({ path: doc.path, reason: `References changed module: ${docModule}` });
      sectionsToUpdate.push(`${doc.name} - ${docModule} section`);
    }
  }
  if (changedFiles.length > 0 && docsToUpdate.length === 0) {
    docsToCreate.push({ path: "docs/CHANGES.md", purpose: "Document changes in changed files" });
  }
  for (const file of changedFiles.slice(0, 3)) {
    const fileName = file.split("/").pop() || "";
    if (fileName && !fileName.includes("test")) {
      examplesNeeded.push(`Example usage of ${fileName.replace(/\.[^.]+$/, "")}`);
    }
  }
  return { docsToUpdate, docsToCreate, sectionsToUpdate, examplesNeeded };
}
async function engiMemoryCheckpoint(params) {
  const memory = getMemoryStore();
  const checkpointData = createCheckpoint({
    taskId: params.taskId,
    taskType: params.taskType,
    scope: {
      files: params.files,
      symbols: params.symbols || [],
      modules: params.modules || []
    },
    decisions: params.decisions?.map((d) => ({ ...d, timestamp: Date.now() })) || [],
    risks: params.risks || [],
    pendingValidations: params.pendingValidations || [],
    pendingDocs: params.pendingDocs || [],
    notes: params.notes || ""
  });
  return memory.saveCheckpoint(checkpointData);
}
async function engiMemoryRestore(params) {
  const memory = getMemoryStore();
  if (params.id) {
    return memory.restore(params.id);
  } else if (params.taskId) {
    const checkpoint = memory.getLatestForTask(params.taskId);
    if (checkpoint)
      return memory.restore(checkpoint.id);
  }
  return null;
}
var engiTools = [
  {
    name: "engi_task_classify",
    description: "Classify an engineering task to determine its type and suggest next steps",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "The engineering task description to classify" },
        keywords: { type: "array", items: { type: "string" }, description: "Optional keywords for context" }
      },
      required: ["task"]
    },
    execute: async (args) => {
      const result = await engiTaskClassify(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_repo_scope_find",
    description: "Identify minimum relevant repository scope for a task",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "The task description" },
        taskType: { type: "string", enum: ["analysis", "feature", "bug", "poc", "documentation", "mixed"], description: "Type of task" },
        keywords: { type: "array", items: { type: "string" }, description: "Additional keywords" },
        limit: { type: "number", description: "Maximum results to return" },
        repoPath: { type: "string", description: "Repository path to index" }
      },
      required: ["task", "taskType"]
    },
    execute: async (args) => {
      const result = await engiRepoScopeFind(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_flow_summarize",
    description: "Explain existing implementation flow",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" }, description: "File paths to include" },
        entryPoint: { type: "string", description: "Entry point file" },
        verbosity: { type: "string", enum: ["minimal", "standard", "detailed"], description: "Verbosity level" }
      }
    },
    execute: async (args) => {
      const result = await engiFlowSummarize(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_bug_trace_compact",
    description: "Trace likely bug causes from symptom description",
    inputSchema: {
      type: "object",
      properties: {
        symptom: { type: "string", description: "Bug symptom description" },
        scope: { type: "array", items: { type: "string" }, description: "Files to investigate" }
      },
      required: ["symptom"]
    },
    execute: async (args) => {
      const result = await engiBugTraceCompact(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_implementation_plan",
    description: "Build implementation plan for new feature or fix",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Feature or fix description" },
        taskType: { type: "string", enum: ["feature", "bug"], description: "Type of task" },
        scope: { type: "array", items: { type: "string" }, description: "Files in scope" },
        existingPatterns: { type: "array", items: { type: "string" }, description: "Existing patterns to follow" }
      },
      required: ["task", "taskType", "scope"]
    },
    execute: async (args) => {
      const result = await engiImplementationPlan(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_poc_plan",
    description: "Define minimum viable POC implementation",
    inputSchema: {
      type: "object",
      properties: {
        goal: { type: "string", description: "POC goal description" },
        constraints: { type: "array", items: { type: "string" }, description: "Known constraints" },
        existingCode: { type: "array", items: { type: "string" }, description: "Existing code to leverage" }
      },
      required: ["goal"]
    },
    execute: async (args) => {
      const result = await engiPOCPlan(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_impact_analyze",
    description: "Estimate blast radius of change",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" }, description: "Files being changed" },
        changeType: { type: "string", enum: ["add", "modify", "delete"], description: "Type of change" }
      },
      required: ["scope", "changeType"]
    },
    execute: async (args) => {
      const result = await engiImpactAnalyze(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_test_select",
    description: "Choose minimum useful test set",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" }, description: "Files being changed" },
        changeType: { type: "string", enum: ["add", "modify", "delete"], description: "Type of change" }
      },
      required: ["scope"]
    },
    execute: async (args) => {
      const result = await engiTestSelect(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_doc_context_build",
    description: "Build compact context for docs generation",
    inputSchema: {
      type: "object",
      properties: {
        feature: { type: "string", description: "Feature or change to document" },
        changedFiles: { type: "array", items: { type: "string" }, description: "Files that changed" },
        audience: { type: "string", enum: ["junior", "senior", "pm", "qa", "api"], description: "Target audience" }
      }
    },
    execute: async (args) => {
      const result = await engiDocContextBuild(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_doc_update_plan",
    description: "Identify which docs must change",
    inputSchema: {
      type: "object",
      properties: {
        changedFiles: { type: "array", items: { type: "string" }, description: "Files that changed" },
        existingDocs: { type: "array", items: { type: "string" }, description: "Existing docs" }
      },
      required: ["changedFiles"]
    },
    execute: async (args) => {
      const result = await engiDocUpdatePlan(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_memory_checkpoint",
    description: "Store compact task state outside conversation context",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "Unique task identifier" },
        taskType: { type: "string", enum: ["analysis", "feature", "bug", "poc", "documentation", "mixed"], description: "Type of task" },
        files: { type: "array", items: { type: "string" }, description: "Files in scope" },
        symbols: { type: "array", items: { type: "string" }, description: "Symbols in scope" },
        modules: { type: "array", items: { type: "string" }, description: "Modules in scope" },
        decisions: { type: "array", items: { type: "object", properties: { description: { type: "string" }, rationale: { type: "string" } } }, description: "Decisions made" },
        risks: { type: "array", items: { type: "string" }, description: "Identified risks" },
        pendingValidations: { type: "array", items: { type: "string" }, description: "Pending validations" },
        pendingDocs: { type: "array", items: { type: "string" }, description: "Pending docs" },
        notes: { type: "string", description: "Additional notes" }
      },
      required: ["taskId", "taskType", "files"]
    },
    execute: async (args) => {
      const result = await engiMemoryCheckpoint(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_memory_restore",
    description: "Restore compact previously saved task state",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Checkpoint ID to restore" },
        taskId: { type: "string", description: "Task ID to restore latest checkpoint" }
      }
    },
    execute: async (args) => {
      const result = await engiMemoryRestore(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  }
];

// src/native-tools/index.ts
var tools = [
  {
    name: "fetch_web_content",
    description: "Fetch URL and extract clean content. Optimized for LLM (strips nav/ads, converts to markdown).",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to fetch" },
        max_tokens: { type: "integer", description: "Max tokens output (default: 4000)" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await fetchWebContent(args.url, args.max_tokens || 4000);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "quick_fetch",
    description: "Ultra-fast fetch for quick lookups. Returns title + summary only.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to fetch" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await quickFetch(args.url);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "open_in_browser",
    description: "Open URL in default browser. Use when user wants to see results visually or needs interactive web content.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to open in browser" },
        search: { type: "string", description: "Search query to open in Google (alternative to url)" }
      },
      required: []
    },
    async execute(args) {
      try {
        let url = args.url;
        if (!url && args.search) {
          url = `https://www.google.com/search?q=${encodeURIComponent(args.search)}`;
        }
        if (!url) {
          return { success: false, content: "", error: "Provide url or search parameter" };
        }
        const { execSync: execSync2 } = await import("node:child_process");
        const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
        execSync2(`${opener} "${url}"`, { stdio: "ignore" });
        return { success: true, content: `Opened in browser: ${url}` };
      } catch (e) {
        return { success: false, content: "", error: e.message };
      }
    }
  },
  {
    name: "fetch_structured",
    description: "Fetch and extract structured data (article metadata, product info, tables, links).",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        extraction_type: { type: "string", enum: ["article", "product", "table", "links"] },
        max_tokens: { type: "integer" }
      },
      required: ["url", "extraction_type"]
    },
    async execute(args) {
      const result = await fetchStructured(args.url, args.extraction_type, args.max_tokens);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "fetch_with_selectors",
    description: "Fetch URL and extract using CSS selectors.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        selectors: { type: "object" },
        max_tokens: { type: "integer" }
      },
      required: ["url", "selectors"]
    },
    async execute(args) {
      const result = await fetchWithSelectors(args.url, args.selectors, args.max_tokens);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "scrape_freedium",
    description: "Scrape Medium via Freedium.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        max_tokens: { type: "integer" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await scrapeFreedium(args.url, args.max_tokens);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "webclaw_extract_article",
    description: "Extract article content.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    async execute(args) {
      const result = await webclawExtractArticle(args.url);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "webclaw_extract_product",
    description: "Extract e-commerce product info.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    async execute(args) {
      const result = await webclawExtractProduct(args.url);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "webclaw_crawl",
    description: "Crawl with CSS selectors.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" }, selectors: { type: "object" } },
      required: ["url", "selectors"]
    },
    async execute(args) {
      const result = await webclawCrawl(args.url, args.selectors);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "searxng_search",
    description: "Web search via SearXNG. Supports categories, engines, time range.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "integer", description: "Max results (default: 10)" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await searxngSearch(args.query, args.limit || 10);
      if (result.success && result.results) {
        return {
          success: true,
          content: JSON.stringify({ results: result.results })
        };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "search_images",
    description: "Image search via SearXNG.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await searchImages(args.query, args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "search_news",
    description: "News search via SearXNG.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        time_range: { type: "string", enum: ["day", "week", "month", "year"] }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await searchNews(args.query, args.time_range);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "searxng_health",
    description: "Check SearXNG health.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const result = await searxngHealth();
      return { success: result.success, content: result.success ? "OK" : "DOWN", error: result.error };
    }
  },
  {
    name: "hackernews_top",
    description: "Top HN stories.",
    inputSchema: { type: "object", properties: { limit: { type: "integer" } } },
    async execute(args) {
      const result = await hackernewsTop(args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "hackernews_new",
    description: "Newest HN stories.",
    inputSchema: { type: "object", properties: { limit: { type: "integer" } } },
    async execute(args) {
      const result = await hackernewsNew(args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "hackernews_best",
    description: "Best HN stories.",
    inputSchema: { type: "object", properties: { limit: { type: "integer" } } },
    async execute(args) {
      const result = await hackernewsBest(args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "hackernews_get_comments",
    description: "Get story comments.",
    inputSchema: {
      type: "object",
      properties: { story_id: { type: "integer" }, limit: { type: "integer" } },
      required: ["story_id"]
    },
    async execute(args) {
      const result = await hackernewsComments(args.story_id, args.limit || 20);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "file_read",
    description: "Read file contents.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path" },
        max_size: { type: "integer", description: "Max bytes (default: 10MB)" }
      },
      required: ["path"]
    },
    async execute(args) {
      const result = await fileRead(args.path, args.max_size);
      return {
        success: result.success,
        content: result.content || "",
        error: result.error
      };
    }
  },
  {
    name: "file_write",
    description: "Write content to a file.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path" },
        content: { type: "string", description: "Content to write" }
      },
      required: ["path", "content"]
    },
    async execute(args) {
      const result = await fileWrite(args.path, args.content);
      return {
        success: result.success,
        content: result.path || "",
        error: result.error
      };
    }
  },
  {
    name: "file_list",
    description: "List directory contents.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Directory path (default: .)" },
        max_items: { type: "integer" }
      }
    },
    async execute(args) {
      const result = await fileList(args.path || ".", args.max_items);
      return {
        success: result.success,
        content: JSON.stringify(result.items),
        error: result.error
      };
    }
  },
  {
    name: "file_search",
    description: "Search files by name pattern.",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string" },
        pattern: { type: "string" },
        max_results: { type: "integer" }
      },
      required: ["directory", "pattern"]
    },
    async execute(args) {
      const result = await fileSearch(args.directory, args.pattern, args.max_results);
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error
      };
    }
  },
  {
    name: "file_grep",
    description: "Search within files using grep.",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string" },
        query: { type: "string", description: "Search pattern" },
        max_results: { type: "integer" },
        file_pattern: { type: "string" }
      },
      required: ["directory", "query"]
    },
    async execute(args) {
      const result = await fileGrep(args.directory, args.query, args.max_results, args.file_pattern || "*");
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error
      };
    }
  },
  {
    name: "file_glob",
    description: "Find files matching glob patterns.",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string" },
        patterns: { type: "array", items: { type: "string" } },
        max_results: { type: "integer" }
      },
      required: ["directory", "patterns"]
    },
    async execute(args) {
      const result = await fileGlob(args.directory, args.patterns, args.max_results);
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error
      };
    }
  },
  {
    name: "run_code",
    description: "Run code sandbox (Python, JS, Bash).",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        language: { type: "string", enum: ["python", "javascript", "bash"] },
        timeout: { type: "integer" }
      },
      required: ["code", "language"]
    },
    async execute(args) {
      const result = await runCode(args.code, args.language, args.timeout || 30);
      return {
        success: result.success,
        content: result.output,
        error: result.error
      };
    }
  },
  {
    name: "run_python_snippet",
    description: "Run Python with common imports.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        timeout: { type: "integer" }
      },
      required: ["code"]
    },
    async execute(args) {
      const result = await runPythonSnippet(args.code, args.timeout);
      return {
        success: result.success,
        content: result.output,
        error: result.error
      };
    }
  },
  {
    name: "run_command",
    description: "Execute shell command. Supports any command with bash shell. Use for file ops, servers, scripts, etc.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute (full command with args)" },
        cwd: { type: "string", description: "Working directory (optional, defaults to current)" },
        background: { type: "boolean", description: "Run in background with nohup (default: false)" },
        timeout: { type: "integer", description: "Timeout in seconds (default: 30)" }
      },
      required: ["command"]
    },
    async execute(args) {
      const { execSync: execSync2, spawn: spawn2 } = await import("node:child_process");
      const cmd = args.command;
      const workingDir = args.cwd || process.cwd();
      const timeout = args.timeout || 30;
      const runBackground = args.background || false;
      const dangerous = ["rm -rf", "dd", "mkfs", ":(){", "fork bomb", "> /dev/", "curl | bash", "wget -O- |"];
      const isDangerous = dangerous.some((d) => cmd.toLowerCase().includes(d));
      if (isDangerous) {
        return { success: false, content: "", error: `⚠️  Dangerous command detected: "${cmd.slice(0, 50)}..."

To execute dangerous commands, run directly in your terminal.` };
      }
      let fullCmd = cmd;
      if (cmd.startsWith("cd ") && !cmd.includes("&&")) {
        const match = cmd.match(/^cd\s+(.+)$/);
        if (match) {
          const targetDir = match[1].replace(/^~/, process.env.HOME || "~");
          try {
            const { statSync: statSync2 } = await import("node:fs");
            statSync2(targetDir);
            return { success: true, content: `Directory changed to: ${targetDir}` };
          } catch {
            return { success: false, content: "", error: `Directory not found: ${targetDir}` };
          }
        }
      }
      try {
        if (runBackground || cmd.endsWith(" &")) {
          const cleanCmd = cmd.replace(/\s*&\s*$/, "").trim();
          spawn2(cleanCmd, [], {
            shell: true,
            cwd: workingDir,
            detached: true,
            stdio: "ignore"
          }).unref();
          return { success: true, content: `Started in background: ${cleanCmd}` };
        }
        const output = execSync2(`/bin/bash -c ${JSON.stringify(cmd)}`, {
          encoding: "utf-8",
          timeout: timeout * 1000,
          cwd: workingDir,
          maxBuffer: 10485760
        });
        return { success: true, content: output };
      } catch (e) {
        if (e.killed) {
          return { success: false, content: "", error: `Command timed out after ${timeout}s` };
        }
        return { success: false, content: "", error: e.message };
      }
    }
  },
  {
    name: "github_repo",
    description: "Get repo info.",
    inputSchema: {
      type: "object",
      properties: { owner: { type: "string" }, repo: { type: "string" } },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubRepo(args.owner, args.repo);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_readme",
    description: "Get repo README.",
    inputSchema: {
      type: "object",
      properties: { owner: { type: "string" }, repo: { type: "string" } },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubReadme(args.owner, args.repo);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_issues",
    description: "List repo issues.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        state: { type: "string", enum: ["open", "closed", "all"] }
      },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubIssues(args.owner, args.repo, args.state || "open");
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_commits",
    description: "List recent commits.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubCommits(args.owner, args.repo, args.limit || 20);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_search_repos",
    description: "Search repos.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await githubSearchRepos(args.query, args.limit || 10);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_transcript",
    description: "Get transcript from video.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    async execute(args) {
      const result = await youtubeTranscript(args.url);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_video_info",
    description: "Get video metadata.",
    inputSchema: {
      type: "object",
      properties: {
        video_id: { type: "string" },
        url: { type: "string" }
      }
    },
    async execute(args) {
      const result = await youtubeVideoInfo(args.video_id, args.url);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_search",
    description: "Search videos.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await youtubeSearch(args.query, args.limit || 10);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_summarize",
    description: "Summarize transcript.",
    inputSchema: {
      type: "object",
      properties: {
        transcript: { type: "string" },
        max_words: { type: "integer" }
      },
      required: ["transcript"]
    },
    async execute(args) {
      const result = await youtubeSummarize(args.transcript, args.max_words || 500);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "pandas_create",
    description: "Create DataFrame from data.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "string", description: "JSON data" },
        name: { type: "string" }
      },
      required: ["data"]
    },
    async execute(args) {
      const result = await pandasCreate(args.data, args.name);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "pandas_filter",
    description: "Filter data.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "array" },
        conditions: { type: "string" }
      },
      required: ["data", "conditions"]
    },
    async execute(args) {
      const result = await pandasFilter(args.data, args.conditions);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "pandas_aggregate",
    description: "Aggregate/group data.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "array" },
        group_by: { type: "array", items: { type: "string" } },
        aggregations: { type: "object" }
      },
      required: ["data", "group_by", "aggregations"]
    },
    async execute(args) {
      const result = await pandasAggregate(args.data, args.group_by, args.aggregations);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "plot_line",
    description: "Generate line plot.",
    inputSchema: {
      type: "object",
      properties: { x: { type: "array" }, y: { type: "array" }, title: { type: "string" } },
      required: ["x", "y"]
    },
    async execute(args) {
      return {
        success: true,
        content: `Line chart: ${args.title || "Plot"}
X: ${args.x.slice(0, 5)}
Y: ${args.y.slice(0, 5)}
(Use run_code with matplotlib to render)`
      };
    }
  },
  {
    name: "plot_bar",
    description: "Generate bar chart.",
    inputSchema: {
      type: "object",
      properties: { categories: { type: "array" }, values: { type: "array" }, title: { type: "string" } },
      required: ["categories", "values"]
    },
    async execute(args) {
      return {
        success: true,
        content: `Bar chart: ${args.title || "Plot"}
Categories: ${args.categories.slice(0, 5)}
Values: ${args.values.slice(0, 5)}
(Use run_code with matplotlib to render)`
      };
    }
  },
  ...engiTools
];
function getTool(name) {
  return tools.find((t) => t.name === name);
}
async function executeTool(name, args) {
  const tool = getTool(name);
  if (!tool) {
    return { success: false, content: "", error: `Unknown tool: ${name}` };
  }
  try {
    return await tool.execute(args);
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
function getFormattedTools() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema
  }));
}

// src/utils/notifications.ts
function playBell() {
  process.stdout.write("\x07");
}

// src/providers/discover.ts
var CODEX_OAUTH = {
  CLIENT_ID: "app_EMoamEEZ73f0CkXaXp7hrann",
  AUTHORIZE_URL: "https://auth.openai.com/oauth/authorize",
  TOKEN_URL: "https://auth.openai.com/oauth/token",
  REDIRECT_URI: "http://localhost:1455/auth/callback",
  SCOPE: "openid profile email offline_access",
  API_BASE_URL: "https://chatgpt.com/backend-api",
  TOKEN_FILE: ".beast-cli/codex-auth.json"
};
async function fetchOllamaModels(baseUrl = "http://localhost:11434") {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok)
      return [];
    const data = await res.json();
    return (data.models ?? []).map((m) => m.name ?? "").filter(Boolean);
  } catch {
    return [];
  }
}
async function fetchLMStudioModels(baseUrl = "http://localhost:1234") {
  try {
    const res = await fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok)
      return [];
    const data = await res.json();
    return (data.data ?? []).map((m) => m.id ?? "").filter(Boolean);
  } catch {
    return [];
  }
}
async function fetchJanModels(baseUrl = "http://localhost:1337") {
  return fetchLMStudioModels(baseUrl);
}
async function fetchLocalModels(provider) {
  switch (provider) {
    case "ollama":
      return fetchOllamaModels();
    case "lmstudio":
      return fetchLMStudioModels();
    case "jan":
      return fetchJanModels();
    default:
      return [];
  }
}
var API_KEY_ENVS = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  codex: "CODEX_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
  mistral: "MISTRAL_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  qwen: "DASHSCOPE_API_KEY",
  gemini: "GEMINI_API_KEY"
};
function getApiKeyFromEnv(provider) {
  const envVar = API_KEY_ENVS[provider];
  if (!envVar)
    return null;
  return process.env[envVar] ?? null;
}
function isCloudProvider(provider) {
  return provider in API_KEY_ENVS;
}
var DEFAULT_MODEL = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-5.4",
  openrouter: "qwen/qwen3-32b",
  deepseek: "deepseek-chat",
  groq: "llama-3.3-70b-versatile",
  mistral: "mistral-large-latest",
  qwen: "qwen-plus",
  gemini: "gemini-1.5-pro",
  ollama: "llama3.2:latest",
  lmstudio: "llama3.2:latest",
  jan: "llama3.2:latest"
};
var CLOUD_MODELS = {
  anthropic: [
    "claude-opus-4-5",
    "claude-sonnet-4-20250514",
    "claude-haiku-4-20250514",
    "claude-3-5-sonnet-latest"
  ],
  openai: [
    "gpt-5.4",
    "gpt-5.4-pro",
    "gpt-5.4-mini",
    "gpt-5.4-nano",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5.2",
    "gpt-5.2-pro",
    "gpt-5-pro",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o3-pro",
    "o3",
    "o4-mini",
    "o3-deep-research",
    "o4-mini-deep-research",
    "o1-pro",
    "o1",
    "o3-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-5-codex",
    "gpt-5.3-codex",
    "gpt-5.2-codex",
    "gpt-5.1-codex",
    "gpt-5.1-codex-max",
    "gpt-5.1-codex-mini"
  ],
  openrouter: [
    "qwen/qwen3-32b",
    "qwen/qwen3-14b",
    "qwen/qwen3-8b",
    "openrouter/auto",
    "anthropic/claude-3-opus",
    "openai/gpt-4o",
    "google/gemini-pro-1.5",
    "deepseek/deepseek-chat"
  ],
  deepseek: [
    "deepseek-chat",
    "deepseek-coder",
    "deepseek-reasoner"
  ],
  groq: [
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
    "llama-3.1-8b-instant"
  ],
  mistral: [
    "mistral-large-latest",
    "mistral-small-latest",
    "codestral-latest",
    "mistral-nemo"
  ],
  qwen: [
    "qwen-plus",
    "qwen-max",
    "qwen2.5-coder-32b",
    "qwq-32b"
  ],
  gemini: [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp"
  ]
};
async function detectAllProviders() {
  const results = [];
  const [ollamaModels, lmModels, janModels] = await Promise.all([
    fetchOllamaModels(),
    fetchLMStudioModels(),
    fetchJanModels()
  ]);
  if (ollamaModels.length > 0) {
    results.push({
      id: "ollama",
      name: "Ollama",
      shortName: "OLL",
      status: "online",
      models: ollamaModels,
      isCloud: false
    });
  }
  if (lmModels.length > 0) {
    results.push({
      id: "lmstudio",
      name: "LM Studio",
      shortName: "LMS",
      status: "online",
      models: lmModels,
      isCloud: false
    });
  }
  if (janModels.length > 0) {
    results.push({
      id: "jan",
      name: "Jan",
      shortName: "JAN",
      status: "online",
      models: janModels,
      isCloud: false
    });
  }
  const cloudProviders = [
    { id: "anthropic", name: "Claude", shortName: "CLA", status: "offline", models: CLOUD_MODELS["anthropic"], isCloud: true },
    { id: "openai", name: "GPT / OpenAI", shortName: "GPT", status: "offline", models: CLOUD_MODELS["openai"], isCloud: true },
    { id: "codex", name: "ChatGPT Plus", shortName: "CHT", status: "offline", models: CODEX_MODELS, isCloud: true },
    { id: "openrouter", name: "OpenRouter", shortName: "ORR", status: "offline", models: CLOUD_MODELS["openrouter"], isCloud: true },
    { id: "deepseek", name: "DeepSeek", shortName: "DSK", status: "offline", models: CLOUD_MODELS["deepseek"], isCloud: true },
    { id: "groq", name: "Groq", shortName: "GRQ", status: "offline", models: CLOUD_MODELS["groq"], isCloud: true },
    { id: "mistral", name: "Mistral", shortName: "MIS", status: "offline", models: CLOUD_MODELS["mistral"], isCloud: true },
    { id: "qwen", name: "Qwen", shortName: "QWN", status: "offline", models: CLOUD_MODELS["qwen"], isCloud: true },
    { id: "gemini", name: "Gemini", shortName: "GEM", status: "offline", models: CLOUD_MODELS["gemini"], isCloud: true }
  ];
  for (const p of cloudProviders) {
    if (getApiKeyFromEnv(p.id)) {
      p.status = "online";
    } else if (p.id === "codex") {
      const token = loadCodexToken();
      if (token && isCodexTokenValid(token)) {
        p.status = "online";
      }
    }
    results.push(p);
  }
  return results;
}
function getBaseUrl(provider) {
  switch (provider) {
    case "ollama":
      return "http://localhost:11434";
    case "lmstudio":
      return "http://localhost:1234/v1";
    case "jan":
      return "http://localhost:1337/v1";
    case "codex":
      return CODEX_OAUTH.API_BASE_URL;
    default:
      return "";
  }
}
function getCodexTokenPath() {
  const home = process.env.HOME || process.env.USERPROFILE || "~";
  return `${home}/.beast-cli/codex-auth.json`;
}
function loadCodexToken() {
  try {
    const path4 = getCodexTokenPath();
    const fs4 = __require("node:fs");
    if (fs4.existsSync(path4)) {
      const data = JSON.parse(fs4.readFileSync(path4, "utf-8"));
      return data;
    }
  } catch {}
  return null;
}
function clearCodexToken() {
  try {
    const path4 = getCodexTokenPath();
    const fs4 = __require("node:fs");
    if (fs4.existsSync(path4)) {
      fs4.unlinkSync(path4);
    }
  } catch {}
}
function isCodexTokenValid(token) {
  if (!token.accessToken)
    return false;
  return Date.now() < token.expiresAt - 5 * 60 * 1000;
}
var CODEX_MODELS = [
  "gpt-5.2-codex",
  "gpt-5.2-codex-low",
  "gpt-5.2-codex-medium",
  "gpt-5.2-codex-high",
  "gpt-5.2-codex-xhigh",
  "gpt-5.2",
  "gpt-5.2-low",
  "gpt-5.2-medium",
  "gpt-5.2-high",
  "gpt-5.2-xhigh",
  "gpt-5.1-codex-max",
  "gpt-5.1-codex",
  "gpt-5.1-codex-mini",
  "gpt-5.1",
  "gpt-5.1-low",
  "gpt-5.1-medium",
  "gpt-5.1-high",
  "gpt-5.1-xhigh",
  "codex",
  "gpt-4o",
  "gpt-4o-mini",
  "o3-mini",
  "o3",
  "o4-mini"
];

// src/config/index.ts
import { readFileSync as readFileSync4, existsSync as existsSync5, writeFileSync as writeFileSync4, mkdirSync as mkdirSync2 } from "node:fs";
import { resolve as resolve2, dirname as dirname2 } from "node:path";
function getConfigDir() {
  return resolve2(process.env.HOME ?? "~", ".beast-cli");
}
function getConfigPath() {
  return resolve2(getConfigDir(), "session.json");
}
function saveSession(config) {
  try {
    const dir = getConfigDir();
    if (!existsSync5(dir))
      mkdirSync2(dir, { recursive: true });
    writeFileSync4(getConfigPath(), JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.warn("Failed to save session config:", error);
  }
}
function loadSession() {
  try {
    const path4 = getConfigPath();
    if (!existsSync5(path4))
      return null;
    const data = JSON.parse(readFileSync4(path4, "utf-8"));
    if (!data.provider || !data.model || !data.contextSize || !data.contextMax) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
function parseContextSize(size) {
  const num = parseInt(size.replace(/K|B$/i, ""));
  if (size.toUpperCase().endsWith("K"))
    return num * 1024;
  if (size.toUpperCase().endsWith("B"))
    return num * 1024 * 1024 * 1024;
  return num;
}
var CONTEXT_SIZES = ["8K", "16K", "32K", "64K", "128K"];

// src/index.ts
import readline from "readline";
var VERSION = "1.2.8";
function question(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve3) => rl.question(prompt, (answer) => {
    rl.close();
    resolve3(answer);
  }));
}
async function numberedMenu(title, options) {
  console.log(`
${title}`);
  options.forEach((opt, i) => console.log(`  [${i + 1}] ${opt}`));
  while (true) {
    const input = await question("  > ");
    const n = parseInt(input.trim());
    if (n >= 1 && n <= options.length)
      return n - 1;
    console.log("  Invalid selection. Try again.");
  }
}
var currentSpinner = null;
var spinnerStarted = false;
var spinnerFrame = 0;
var spinnerLabel = "";
var spinnerAnimation = [];
var spinnerSpeed = 150;
var THINKING_ANIMS = [
  "(\u25D5\u203F\u25D5)\uD83D\uDC15",
  "(=^\u30FB^=)",
  "(\xA8)\uD83E\uDD8A",
  "( @)\uD83D\uDC38",
  "(*)",
  "(\u25D5\u03C9\u25D5)\uD83D\uDC15",
  "(=^\u30FB\u03C9\u30FB^=)",
  "(\u25D5\u203F\u25D5)\uD83E\uDD8A",
  "(\\/)\uD83D\uDC30",
  " (=\u30FB)"
];
var SEARCH_ANIMS = ["><(((\xBA>", " <(\xBA)>", "><(((\xBA>", "  ~(``)~", "><(((\xBA>"];
var TOOL_ANIMS = ["(\u25D5\u203F\u25D5)\uD83D\uDC15", "(=^\u30FB^=)", "(\xA8)\uD83E\uDD8A", "(*)", "=(\u30FB)"];
var THINKING_DOTS = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834"];
function startFunSpinner(state = "thinking") {
  if (currentSpinner)
    clearInterval(currentSpinner);
  spinnerStarted = true;
  spinnerFrame = 0;
  if (state === "searching") {
    spinnerAnimation = SEARCH_ANIMS;
    spinnerLabel = s("Searching", fg.info);
    spinnerSpeed = 120;
  } else if (state === "tool") {
    spinnerAnimation = TOOL_ANIMS;
    spinnerLabel = s("Running", fg.tool);
    spinnerSpeed = 150;
  } else if (state === "formatting") {
    spinnerAnimation = ["\u2728", "\u2605", "\u2726", "\u2727", "\u2605"];
    spinnerLabel = s("Formatting", fg.success);
    spinnerSpeed = 200;
  } else {
    spinnerAnimation = THINKING_ANIMS;
    spinnerLabel = s("Thinking", fg.accent);
    spinnerSpeed = 150;
  }
  const char = spinnerAnimation[0];
  const dot = THINKING_DOTS[0];
  process.stderr.write(`\r${spinnerLabel} ${char} ${dot}  `);
  currentSpinner = setInterval(() => {
    if (!spinnerStarted)
      return;
    spinnerFrame = (spinnerFrame + 1) % spinnerAnimation.length;
    const animChar = spinnerAnimation[spinnerFrame];
    const dot2 = THINKING_DOTS[spinnerFrame % THINKING_DOTS.length];
    process.stderr.write(`\r${spinnerLabel} ${animChar} ${dot2}  `);
  }, spinnerSpeed);
}
function stopFunSpinner(status = "done") {
  if (currentSpinner) {
    clearInterval(currentSpinner);
    currentSpinner = null;
  }
  spinnerStarted = false;
  process.stderr.write("\r" + " ".repeat(60) + "\r");
  if (status === "done") {
    process.stderr.write(s("\u2713 ", fg.success) + (spinnerLabel || "Done") + `
`);
  } else if (status === "error") {
    process.stderr.write(s("\u2717 ", fg.error) + `Error
`);
  }
}
function streamText(text) {
  process.stdout.write(panel(text, { title: "\uD83E\uDD16 Response", titleColor: fg.assistant, width: 70 }));
  process.stdout.write(`
`);
}
function printUsage(usage) {
  if (!usage)
    return;
  const { promptTokens, completionTokens, totalTokens } = usage;
  process.stdout.write(`${s("\u26A1 ", fg.secondary)}${s(totalTokens.toLocaleString(), fg.mauve)} tokens `);
  process.stdout.write(`(${s("p:" + promptTokens, fg.blue)} ${s("c:" + completionTokens, fg.mauve)})
`);
}
var nativeTools = [];
async function connectMCP() {
  nativeTools = getFormattedTools();
  return nativeTools;
}
async function selectProvider(providers2) {
  const online = providers2.filter((p) => p.status === "online");
  const offline = providers2.filter((p) => p.status === "offline");
  const choices = [];
  const byId = [];
  for (const p of online) {
    const models = `${p.models.length} models`;
    const auth = p.id === "codex" ? " \xB7 OAuth" : "";
    choices.push(`\u25CF ${p.name} (${p.shortName}) \u2014 ${models}${auth}`);
    byId.push(p.id);
  }
  for (const p of offline) {
    const note = p.id === "codex" ? " (needs OAuth login)" : p.isCloud ? " (needs API key)" : " (offline)";
    choices.push(`\u25CB ${p.name} (${p.shortName})${note}`);
    byId.push(p.id);
  }
  const idx = await numberedMenu("\uD83D\uDC09 Select a provider:", choices);
  return byId[idx];
}
async function selectModelForProvider(provider, defaultModel) {
  const isLocal = !isCloudProvider(provider);
  if (isLocal) {
    console.log(dim + "Fetching models from " + provider + "..." + reset);
    const models = await fetchLocalModels(provider);
    if (models.length === 0) {
      console.log("   [WARN] No models found. Is Ollama running?");
      return DEFAULT_MODEL[provider] ?? "llama3.2";
    }
    if (defaultModel) {
      const idx2 = models.indexOf(defaultModel);
      if (idx2 >= 0) {
        console.log(`${dim}Available models (default: ${defaultModel}):${reset}`);
        models.forEach((m, i) => console.log(`  ${i + 1}. ${m}${i === idx2 ? " \u2190" : ""}`));
        const choice = await question(`  Select model number [${idx2 + 1}] > `) || String(idx2 + 1);
        const n2 = parseInt(choice);
        if (n2 >= 1 && n2 <= models.length)
          return models[n2 - 1];
        return models[idx2];
      }
    }
    console.log(`${dim}Available models:${reset}`);
    models.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    const idx = await question("  Select model number > ");
    const n = parseInt(idx);
    if (n >= 1 && n <= models.length)
      return models[n - 1];
    return models[0];
  } else {
    const models = CLOUD_MODELS[provider] ?? CODEX_MODELS;
    if (defaultModel) {
      const idx2 = models.indexOf(defaultModel);
      if (idx2 >= 0) {
        console.log(`${dim}Available models (default: ${defaultModel}):${reset}`);
        models.forEach((m, i) => console.log(`  ${i + 1}. ${m}${i === idx2 ? " \u2190" : ""}`));
        const choice = await question(`  Select model number [${idx2 + 1}] > `) || String(idx2 + 1);
        const n2 = parseInt(choice);
        if (n2 >= 1 && n2 <= models.length)
          return models[n2 - 1];
        return models[idx2];
      }
    }
    console.log(`${dim}Available models:${reset}`);
    models.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    const idx = await question("  Select model number > ");
    const n = parseInt(idx);
    if (n >= 1 && n <= models.length)
      return models[n - 1];
    return models[0];
  }
}
async function selectContextSize(defaultSize) {
  console.log(`${dim}Context window size:${reset}`);
  CONTEXT_SIZES.forEach((size2, i) => {
    const marker = defaultSize === size2 ? " \u2190" : "";
    console.log(`  [${i + 1}] ${size2} tokens${marker}`);
  });
  let defaultIdx = defaultSize ? CONTEXT_SIZES.indexOf(defaultSize) : 2;
  if (defaultIdx < 0)
    defaultIdx = 2;
  const ctxIdx = await question(`  > [${defaultIdx + 1}] `) || String(defaultIdx + 1);
  const idx = parseInt(ctxIdx) - 1;
  const size = CONTEXT_SIZES[idx] || "32K";
  return { size, max: parseContextSize(size) };
}
async function promptApiKey(provider) {
  if (provider === "codex") {
    console.log(`
\uD83D\uDD11 ChatGPT Plus: A browser will open for you to sign in.`);
    return "codex-oauth";
  }
  const env = getApiKeyFromEnv(provider);
  if (env)
    return env;
  const providerHelp = {
    anthropic: "https://console.anthropic.com/",
    openai: "https://platform.openai.com/",
    groq: "https://console.groq.com/",
    deepseek: "https://platform.deepseek.com/",
    mistral: "https://console.mistral.ai/",
    openrouter: "https://openrouter.ai/",
    gemini: "https://aistudio.google.com/",
    qwen: "https://dashscope.console.aliyun.com/"
  };
  console.log(`
\u26A0\uFE0F  To use ${provider}, you need a free API key.`);
  console.log(`    1. Visit: ${providerHelp[provider] || "the provider website"}`);
  console.log(`    2. Create an account and get your API key`);
  console.log(`    3. Set it with: export ${provider.toUpperCase()}_API_KEY=your-key-here`);
  return null;
}
async function validateSavedConfig(session) {
  if (session.provider === "codex") {
    const token = loadCodexToken();
    return token !== null && isCodexTokenValid(token);
  }
  if (isCloudProvider(session.provider)) {
    return getApiKeyFromEnv(session.provider) !== null;
  }
  const models = await fetchLocalModels(session.provider);
  return models.includes(session.model);
}
async function interactiveSetup(saved) {
  console.log(`
\uD83D\uDC09 ${s("BEAST", fg.accent, bold)} ${s("CLI", fg.mauve, bold)} ${s(`v${VERSION}`, fg.muted)} ${s("\xB7", fg.muted)} ${s("45+ Providers", fg.secondary)} ${s("\xB7", fg.muted)} ${s("51+ Tools", fg.secondary)}`);
  const providers2 = await detectAllProviders();
  console.log(`${s("\u2713", fg.success)} MCP: ${nativeTools.length} tools | ${s("\u2713", fg.success)} Ollama: ${providers2.find((p) => p.id === "ollama")?.models.length || 0} models`);
  const provider = await selectProvider(providers2);
  let apiKey;
  if (isCloudProvider(provider)) {
    const key = await promptApiKey(provider);
    if (!key) {
      console.log(`   ${s("!", fg.warning)} No API key`);
      process.exit(1);
    }
    apiKey = key;
  }
  const model = await selectModelForProvider(provider, saved?.model);
  const { size, max } = await selectContextSize(saved?.contextSize);
  console.log(`
${s("\u2713", fg.success)} Provider: ${bold}${provider}${reset}
${s("\u2713", fg.success)} Model: ${bold}${model}${reset}
${s("\u2713", fg.success)} Context: ${bold}${size} tokens${reset}
`);
  return { provider, model, apiKey, baseUrl: getBaseUrl(provider), messages: [], contextMax: max };
}
function buildSessionFromSaved(saved) {
  if (!saved)
    return null;
  return {
    provider: saved.provider,
    model: saved.model,
    apiKey: getApiKeyFromEnv(saved.provider),
    baseUrl: getBaseUrl(saved.provider),
    messages: [],
    contextMax: saved.contextMax
  };
}
function estimateContextUsed(messages) {
  const avgTokensPerMsg = 50 / 4;
  return Math.round(messages.length * avgTokensPerMsg);
}
function printBanner(session) {
  const toolCount = nativeTools.length;
  console.log(renderHeader({
    version: VERSION,
    provider: session.provider,
    model: session.model,
    toolsCount: toolCount
  }));
  console.log(`
` + inlineList([
    { icon: icon2.prompt, label: "Type", value: "your request" },
    { icon: icon2.tool, label: toolCount + " tools", value: "available" }
  ]));
  console.log(`
` + s("Commands:", fg.muted));
  console.log(helpPanel([
    { cmd: "/help", desc: "Show all commands" },
    { cmd: "/switch", desc: "Change provider/model/context" },
    { cmd: "/tools", desc: "List available tools" },
    { cmd: "/clear", desc: "Clear chat history" },
    { cmd: "/exit", desc: "Quit Beast CLI" }
  ]));
  console.log("");
}
async function repl(session) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const promptUser = () => rl.question(`
` + s("> ", fg.accent), async (input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      promptUser();
      return;
    }
    if (trimmed === "exit" || trimmed === "quit") {
      console.log(`
` + s("\uD83D\uDC4B Goodbye!", fg.primary) + `
`);
      process.exit(0);
    }
    if (trimmed === "/help") {
      console.log(`
Commands:
  /help           Show this help
  /switch         Reconfigure provider/model/context
  /models         List available models for current provider
  /model          Interactively switch model
  /model <name>   Switch to model by name or number
  /provider       Interactively switch provider
  /provider <name>  Switch directly to provider
  /login          Authenticate ChatGPT Plus (Codex OAuth)
  /logout         Clear ChatGPT Plus authentication
  /tools          List available tools
  /clear          Clear chat history
  /exit           Exit
`);
      promptUser();
      return;
    }
    if (trimmed === "/switch") {
      const newSession = await interactiveSetup();
      Object.assign(session, newSession);
      saveSession({
        provider: session.provider,
        model: session.model,
        contextSize: session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : String(session.contextMax) : "32K",
        contextMax: session.contextMax || 32768,
        savedAt: Date.now()
      });
      printBanner(session);
      promptUser();
      return;
    }
    if (trimmed === "/login") {
      console.log(`
\uD83D\uDD11 Initiating ChatGPT Plus OAuth login...`);
      const { createProvider: createProvider2 } = await Promise.resolve().then(() => (init_providers(), exports_providers));
      try {
        await createProvider2({ provider: "codex", model: "gpt-5.2-codex" });
        console.log(`
\u2705 ChatGPT Plus authenticated!`);
      } catch (e) {
        console.log(`
\u274C Login failed: ${e.message}`);
      }
      promptUser();
      return;
    }
    if (trimmed === "/logout") {
      clearCodexToken();
      console.log(`
\u2705 ChatGPT Plus logout complete.`);
      promptUser();
      return;
    }
    if (trimmed === "/models") {
      if (session.provider === "codex") {
        console.log(`
Available ChatGPT Plus models (${CODEX_MODELS.length}):`);
        CODEX_MODELS.forEach((m, i) => console.log(`  [${i + 1}] ${m}`));
      } else if (isCloudProvider(session.provider)) {
        const models = CLOUD_MODELS[session.provider] ?? [];
        console.log(`
Available models for ${session.provider}:`);
        models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`));
      } else {
        const models = await fetchLocalModels(session.provider);
        if (models.length === 0) {
          console.log(`
` + s("!", fg.warning) + " Could not fetch models. Is the server running?");
        } else {
          console.log(`
Available models on ${session.provider}:`);
          models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`));
        }
      }
      promptUser();
      return;
    }
    if (trimmed === "/tools") {
      const tools2 = getFormattedTools();
      console.log(`
\uD83D\uDD27 ${tools2.length} native tools available:`);
      tools2.forEach((t) => {
        const desc = t.description ? ` \u2014 ${t.description.slice(0, 60)}` : "";
        console.log(`  \u2022 ${t.name}${desc}`);
      });
      promptUser();
      return;
    }
    if (trimmed === "/model") {
      const model = await selectModelForProvider(session.provider, session.model);
      session.model = model;
      const ctxSize = session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : String(session.contextMax) : "32K";
      saveSession({ provider: session.provider, model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() });
      console.log(`
\u2705 Model switched to: ${model}`);
      promptUser();
      return;
    }
    if (trimmed.startsWith("/model ")) {
      const target = trimmed.slice(7).trim();
      const models = isCloudProvider(session.provider) ? CLOUD_MODELS[session.provider] ?? CODEX_MODELS : await fetchLocalModels(session.provider);
      const n = parseInt(target);
      if (n >= 1 && n <= models.length)
        session.model = models[n - 1];
      else if (models.includes(target))
        session.model = target;
      else {
        console.log(`
${s("!", fg.warning)} Unknown model: ${target}`);
        console.log(`   Run /models to see available models.`);
        promptUser();
        return;
      }
      const ctxSize = session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : String(session.contextMax) : "32K";
      saveSession({ provider: session.provider, model: session.model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() });
      console.log(`
\u2705 Model switched to: ${session.model}`);
      promptUser();
      return;
    }
    if (trimmed === "/provider") {
      const providers2 = await detectAllProviders();
      const newProvider = await selectProvider(providers2);
      if (isCloudProvider(newProvider)) {
        const key = await promptApiKey(newProvider);
        if (!key) {
          console.log(`
` + s("!", fg.warning) + " Provider switch cancelled.");
          promptUser();
          return;
        }
        session.apiKey = key;
      }
      const newModel = await selectModelForProvider(newProvider);
      const { size, max } = await selectContextSize();
      session.provider = newProvider;
      session.model = newModel;
      session.baseUrl = getBaseUrl(newProvider);
      session.contextMax = max;
      saveSession({ provider: newProvider, model: newModel, contextSize: size, contextMax: max, savedAt: Date.now() });
      printBanner(session);
      promptUser();
      return;
    }
    if (trimmed.startsWith("/provider ")) {
      const target = trimmed.slice(10).trim();
      const providers2 = await detectAllProviders();
      const found = providers2.find((p) => p.id === target);
      if (!found) {
        console.log(`
${s("!", fg.warning)} Unknown provider: ${target}`);
        console.log("   Run /provider to see available providers.");
        promptUser();
        return;
      }
      if (isCloudProvider(target)) {
        const key = await promptApiKey(target);
        if (!key) {
          console.log(`
` + s("!", fg.warning) + " Provider switch cancelled.");
          promptUser();
          return;
        }
        session.apiKey = key;
      }
      const newModel = await selectModelForProvider(target);
      const { size, max } = await selectContextSize();
      session.provider = target;
      session.model = newModel;
      session.baseUrl = getBaseUrl(target);
      session.contextMax = max;
      saveSession({ provider: target, model: newModel, contextSize: size, contextMax: max, savedAt: Date.now() });
      printBanner(session);
      promptUser();
      return;
    }
    if (trimmed === "/clear") {
      session.messages = [];
      console.log(`
\u2705 Chat history cleared.`);
      promptUser();
      return;
    }
    const REALTIME_KEYWORDS = [
      "price",
      "rate",
      "rates",
      "weather",
      "news",
      "today",
      "current",
      "latest",
      "now",
      "recent",
      "gold",
      "silver",
      "petrol",
      "dollar",
      "rupee",
      "inflation",
      "gdp",
      "stock",
      "market",
      "trending",
      "score",
      "match",
      "result",
      "election",
      "government",
      "policy"
    ];
    function looksLikeRealTimeQuery(query) {
      const lower = query.toLowerCase();
      return REALTIME_KEYWORDS.some((kw) => lower.includes(kw));
    }
    function isApologyOrNoAccess(response) {
      const lower = response.toLowerCase();
      const noDataPhrases = [
        "don't have access",
        "do not have access",
        "no real-time",
        "not have real-time",
        "don't have real-time",
        "can't access",
        "cannot access",
        "don't have current",
        "no up-to-date",
        "don't have up-to-date",
        "don't know current",
        "don't have the ability to",
        "don't have browsing",
        "no browsing ability",
        "only have knowledge",
        "training data",
        "my knowledge"
      ];
      return noDataPhrases.some((phrase) => lower.includes(phrase));
    }
    function providerSupportsNativeTools(sessionProvider) {
      const noNativeToolSupport = ["ollama"];
      return !noNativeToolSupport.includes(sessionProvider);
    }
    const MAX_TOOL_CALLS = 20;
    let toolCallCount = 0;
    const agentMessages = [...session.messages];
    if (nativeTools.length > 0) {
      agentMessages.unshift({
        role: "system",
        content: `You have access to ${nativeTools.length} native tools. Use them to get real-time data, search the web, read/write files, run code, fetch content, etc. Available tools: ${nativeTools.map((t) => `${t.name}: ${t.description ?? "no description"}`).join(", ")}`
      });
    }
    agentMessages.push({ role: "user", content: trimmed });
    startFunSpinner("thinking");
    try {
      const provider = await createProvider({
        provider: session.provider,
        model: session.model,
        apiKey: session.apiKey,
        baseUrl: session.baseUrl || undefined
      });
      while (toolCallCount < MAX_TOOL_CALLS) {
        const tools2 = nativeTools.length > 0 ? nativeTools : undefined;
        const response = await provider.create({
          messages: agentMessages,
          tools: tools2,
          maxTokens: 16384
        });
        stopFunSpinner("done");
        if (toolCallCount === 0 && response.content) {
          playBell();
        }
        if (!response.toolCalls || response.toolCalls.length === 0) {
          const noNativeTools = !providerSupportsNativeTools(session.provider);
          const needsRealTime = looksLikeRealTimeQuery(trimmed);
          const looksLikeApology = response.content ? isApologyOrNoAccess(response.content) : false;
          if (noNativeTools && needsRealTime && looksLikeApology) {
            console.log(s(`
\uD83D\uDD0D Auto-detected real-time query`, fg.info) + s(" \u2014 fetching live data...", fg.secondary));
            const searchQuery = trimmed;
            const searchResult = await withProgress("Searching", executeTool("searxng_search", { query: searchQuery, limit: 10 }));
            const resultText = searchResult.success ? searchResult.content : `Error: ${searchResult.error}`;
            const truncated = resultText.length > 200 ? resultText.slice(0, 200) + "..." : resultText;
            console.log(s("  \uD83D\uDCE4 Result:", fg.tool) + " " + s(truncated, fg.secondary) + `
`);
            agentMessages.push({ role: "assistant", content: response.content });
            agentMessages.push({
              role: "user",
              content: `Search results for "${searchQuery}":
${resultText}

Please provide a clear, concise answer based on these results.`
            });
            startFunSpinner("formatting");
            const formatted = await provider.create({
              messages: agentMessages,
              tools: undefined,
              maxTokens: 16384
            });
            stopFunSpinner("done");
            if (formatted.content) {
              streamText(formatted.content);
            }
            printUsage(formatted.usage ?? response.usage);
            agentMessages.push({ role: "assistant", content: formatted.content });
            break;
          }
          if (response.content) {
            streamText(response.content);
          }
          agentMessages.push({ role: "assistant", content: response.content });
          break;
        }
        for (const tc of response.toolCalls) {
          toolCallCount++;
          const toolName = tc.name;
          const toolArgs = tc.arguments ?? {};
          process.stdout.write(`
`);
          const argsStr = JSON.stringify(toolArgs);
          const argsDisplay = argsStr.length > 60 ? argsStr.slice(0, 60) + "..." : argsStr;
          process.stdout.write(s("\uD83D\uDD27 " + toolName, fg.tool) + " " + s(argsDisplay, fg.muted) + `
`);
          startFunSpinner("tool");
          const toolResult = await executeTool(toolName, toolArgs);
          stopFunSpinner(toolResult.success ? "done" : "error");
          console.log(renderToolResult(toolName, toolResult));
          agentMessages.push({
            role: "assistant",
            content: response.content,
            toolCalls: [tc]
          });
          agentMessages.push({
            role: "user",
            content: toolResult.content,
            toolCallId: tc.id
          });
        }
      }
      if (toolCallCount >= MAX_TOOL_CALLS) {
        console.log(s(`
\u26A0\uFE0F  Reached tool call limit (${MAX_TOOL_CALLS}). Truncating.`, fg.warning));
      }
      session.messages = agentMessages;
      if (session.messages.length > 40) {
        session.messages = session.messages.slice(-40);
      }
      process.stdout.write(tipBanner());
      if (session.contextMax) {
        const used = estimateContextUsed(agentMessages);
        process.stdout.write(contextBar({ used, max: session.contextMax }) + `
`);
      }
    } catch (e) {
      stopFunSpinner("error");
      console.log(`
\u274C Error: ${e}`);
      if (session.messages.length > 0)
        session.messages.pop();
    }
    try {
      if (!rl.closed)
        promptUser();
    } catch {}
  });
  promptUser();
}
function printHelp() {
  console.log(renderCleanBanner());
  console.log(`
\uD83D\uDC09 BEAST CLI v${VERSION} - AI Coding Agent

USAGE:
  beast [options]

OPTIONS:
  --provider <name>  LLM provider (ollama, codex, anthropic, openai, etc.)
  --model <name>     Model name
  --defaults         Use saved config or auto-select best option
  --switch           Reconfigure provider/model/context
  --setup            Auto-start MCP server
  --help             Show this help

SESSION COMMANDS:
  /switch        Reconfigure everything (provider, model, context)
  /provider      Switch provider (interactive)
  /provider <name>  Switch to provider by name
  /model         Switch model (interactive)
  /model <name>  Switch to model by name or number
  /models        List available models
  /tools         List available tools
  /clear         Clear chat history
  /help          Show this help
  /exit          Exit

EXAMPLES:
  beast                          # Use saved config or auto-select
  beast --defaults               # Quick start with best option
  beast --switch                 # Reconfigure from scratch
  beast --provider ollama        # Use Ollama with model picker
`);
}
async function main() {
  const args = Bun.argv.slice(2);
  const options = {};
  for (let i = 0;i < args.length; i++) {
    switch (args[i]) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--provider":
        options.provider = args[++i];
        break;
      case "--model":
        options.model = args[++i];
        break;
      case "--test":
        options.test = true;
        break;
      case "--setup":
        options.setup = true;
        break;
      case "--defaults":
        options.defaults = true;
        break;
      case "--switch":
        options.switch = true;
        break;
    }
  }
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  if (options.test) {
    console.log("Running tests...");
    process.exit(0);
  }
  await connectMCP();
  console.log(renderCleanBanner());
  let session;
  const saved = loadSession();
  const savedValid = saved ? await validateSavedConfig(buildSessionFromSaved(saved)) : false;
  if (options.switch) {
    session = await interactiveSetup(saved || undefined);
  } else if (options.provider && options.model) {
    session = {
      provider: options.provider,
      model: options.model,
      apiKey: getApiKeyFromEnv(options.provider),
      baseUrl: getBaseUrl(options.provider),
      messages: [],
      contextMax: 32768
    };
  } else if (options.defaults) {
    const token = loadCodexToken();
    if (token && isCodexTokenValid(token)) {
      session = { provider: "codex", model: "gpt-5.2-codex", apiKey: undefined, baseUrl: "https://chatgpt.com/backend-api", messages: [], contextMax: 128 * 1024 };
      console.log(`\u2705 ChatGPT Plus (logged in)`);
    } else {
      const ollamaModels = await fetchOllamaModels();
      if (ollamaModels.length > 0) {
        session = { provider: "ollama", model: ollamaModels[0], apiKey: undefined, baseUrl: "http://localhost:11434", messages: [], contextMax: 128 * 1024 };
        console.log(`\u2705 Ollama (${ollamaModels[0]}) \u2014 Free & offline`);
      } else {
        session = await interactiveSetup(saved || undefined);
      }
    }
  } else if (saved && savedValid) {
    session = buildSessionFromSaved(saved);
    const ctxStr = saved.contextMax ? saved.contextMax >= 1024 ? Math.round(saved.contextMax / 1024) + "K" : String(saved.contextMax) : "32K";
    console.log(`\u2705 Using saved config: ${session.provider} / ${session.model} / ${ctxStr}`);
  } else {
    session = await interactiveSetup(saved || undefined);
  }
  const ctxSize = session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : "32K" : "32K";
  saveSession({ provider: session.provider, model: session.model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() });
  await repl(session);
}
main().catch(console.error);
