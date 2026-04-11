#!/usr/bin/env bun
// @bun
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
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
  const { URL: URL2 } = await import("node:url");
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
        const url = new URL2(req.url || "/", REDIRECT_URI);
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
      const authUrl = new URL2(AUTH_URL);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", CODEX_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("scope", SCOPE);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("state", state);
      console.log("   \uD83C\uDF10 Opening browser for ChatGPT Plus/Pro login...");
      console.log("   \uD83D\uDCCB Auth URL:", authUrl.toString());
      const { execSync: execSync2 } = __require("child_process");
      try {
        const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
        execSync2(`${opener} "${authUrl.toString()}"`, { stdio: "ignore" });
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
        signal: request.signal ?? AbortSignal.timeout(120000)
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
        signal: request.signal ?? AbortSignal.timeout(120000)
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
    models: [
      "qwen/qwen3.6-plus",
      "qwen/qwen3-32b",
      "qwen/qwen3-14b",
      "qwen/qwen3-8b",
      "qwen/qwq-32b",
      "openrouter/auto",
      "meta-llama/llama-3.1-8b-instruct",
      "google/gemini-2.0-flash-exp",
      "deepseek/deepseek-chat"
    ],
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
        signal: request.signal ?? AbortSignal.timeout(120000)
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

// src/ui/colors.ts
function supportsUnicode() {
  if (NO_COLOR2)
    return false;
  if (process.env.FORCE_COLOR === "1" || process.env.FORCE_COLOR === "true")
    return true;
  if (!process.stdout?.isTTY)
    return false;
  if (process.platform === "win32") {
    const termProgram2 = process.env.TERM_PROGRAM || "";
    if (termProgram2.includes("Windows-Terminal")) {
      return true;
    }
    if (termProgram2.includes("vscode")) {
      return true;
    }
    try {
      const { execSync: execSync2 } = __require("child_process");
      const codepage = execSync2("chcp", { encoding: "ascii" }).toString().trim();
      if (codepage.includes("65001"))
        return true;
    } catch {}
    return false;
  }
  const encoding = process.stdout?.encoding?.() || process.stdout?.encoding || "";
  if (encoding.toLowerCase() === "utf8" || encoding.toLowerCase() === "utf-8")
    return true;
  const termProgram = process.env.TERM_PROGRAM || "";
  if (termProgram.includes("iTerm") || termProgram.includes("Apple_Terminal") || termProgram.includes("vscode")) {
    return true;
  }
  const term = process.env.TERM || "";
  if (term.includes("xterm") || term.includes("screen") || term.includes("tmux") || term.includes("256color")) {
    return true;
  }
  const lang = (process.env.LANG || process.env.LC_ALL || "").toLowerCase();
  if (lang.includes("utf-8") || lang.includes("utf8"))
    return true;
  return true;
}
function getBoxChars() {
  return supportsUnicode() ? box : boxAscii;
}
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
var reset2 = "\x1B[0m", bold2 = "\x1B[1m", dim2 = "\x1B[2m", italic = "\x1B[3m", claudePalette2, fg2, bg2, box, boxAscii, spinnerFrames2, DEFAULT_SPINNER2, icon2, NO_COLOR2;
var init_colors = __esm(() => {
  claudePalette2 = {
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
  fg2 = {
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
  bg2 = {
    base: claudePalette2.base,
    surface: claudePalette2.surface0,
    elevated: claudePalette2.surface1,
    overlay: claudePalette2.surface2,
    crust: claudePalette2.crust,
    mantle: claudePalette2.mantle
  };
  box = {
    single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
    round: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
    heavy: { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" },
    dashed: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
    soft: { tl: "╭", tr: "╮", bl: "╯", br: "╰", h: "─", v: "│" },
    light: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
    polished: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" }
  };
  boxAscii = {
    single: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
    round: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
    heavy: { tl: "+", tr: "+", bl: "+", br: "+", h: "=", v: "|" },
    dashed: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
    soft: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
    light: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
    polished: { tl: "+", tr: "+", bl: "+", br: "+", h: "=", v: "|" }
  };
  spinnerFrames2 = {
    dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    line: ["-", "\\", "|", "/"],
    blocks: ["▖", "▘", "▝", "▗"],
    arrow: ["←", "↙", "↓", "↘", "→", "↗", "↑", "↖"],
    star: ["⋆", "✦", "✧", "⋆", "✧", "✦"]
  };
  DEFAULT_SPINNER2 = spinnerFrames2.dots;
  icon2 = {
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
  NO_COLOR2 = process.env.NO_COLOR || process.env.NO_COLOUR;
});

// src/native-tools/search.ts
var exports_search = {};
__export(exports_search, {
  setSearxUrl: () => setSearxUrl,
  searxngSearch: () => searxngSearch,
  searxngHealth: () => searxngHealth,
  searchNews: () => searchNews,
  searchImages: () => searchImages,
  hackernewsTop: () => hackernewsTop,
  hackernewsNew: () => hackernewsNew,
  hackernewsComments: () => hackernewsComments,
  hackernewsBest: () => hackernewsBest,
  getSearxUrlFromConfig: () => getSearxUrlFromConfig,
  getSearxUrl: () => getSearxUrl
});
function getSearxUrl() {
  if (process.env.SEARX_URL) {
    return process.env.SEARX_URL;
  }
  try {
    const { existsSync: existsSync3, readFileSync: readFileSync2 } = __require("node:fs");
    const { join: join3 } = __require("node:path");
    const homeDir = __require("node:os").homedir();
    const searxConfigPath = join3(homeDir, ".beast-cli", "searx.json");
    if (existsSync3(searxConfigPath)) {
      const config = JSON.parse(readFileSync2(searxConfigPath, "utf-8"));
      if (config.url)
        return config.url;
    }
  } catch {}
  return "https://search.sridharhomelab.in";
}
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
function getSearxUrlFromConfig() {
  return getSearxUrl();
}
async function setSearxUrl(url) {
  try {
    const { existsSync: existsSync3, writeFileSync: writeFileSync3, mkdirSync: mkdirSync2 } = __require("node:fs");
    const { join: join3 } = __require("node:path");
    const homeDir = __require("node:os").homedir();
    const configDir = join3(homeDir, ".beast-cli");
    const searxConfigPath = join3(configDir, "searx.json");
    if (!existsSync3(configDir)) {
      mkdirSync2(configDir, { recursive: true });
    }
    const config = { url, enabled: true };
    writeFileSync3(searxConfigPath, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch {
    return false;
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
  SEARX_URL = getSearxUrl();
});

// node_modules/uuid/dist/esm/native.js
import { randomUUID as randomUUID2 } from "crypto";
var native_default;
var init_native = __esm(() => {
  native_default = { randomUUID: randomUUID2 };
});

// node_modules/uuid/dist/esm/rng.js
import { randomFillSync } from "crypto";
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var rnds8Pool, poolPtr;
var init_rng = __esm(() => {
  rnds8Pool = new Uint8Array(256);
  poolPtr = rnds8Pool.length;
});

// node_modules/uuid/dist/esm/stringify.js
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
var byteToHex;
var init_stringify = __esm(() => {
  byteToHex = [];
  for (let i = 0;i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
});

// node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0;i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm(() => {
  init_native();
  init_rng();
  init_stringify();
  v4_default = v4;
});

// node_modules/uuid/dist/esm/index.js
var init_esm = __esm(() => {
  init_v4();
});

// node_modules/xml-escape/index.js
var require_xml_escape = __commonJS((exports, module) => {
  var escape = module.exports = function escape2(string, ignore) {
    var pattern;
    if (string === null || string === undefined)
      return;
    ignore = (ignore || "").replace(/[^&"<>\']/g, "");
    pattern = `([&"<>'])`.replace(new RegExp("[" + ignore + "]", "g"), "");
    return string.replace(new RegExp(pattern, "g"), function(str, item) {
      return escape2.map[item];
    });
  };
  var map = escape.map = {
    ">": "&gt;",
    "<": "&lt;",
    "'": "&apos;",
    '"': "&quot;",
    "&": "&amp;"
  };
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS((exports, module) => {
  var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
  var hasBlob = typeof Blob !== "undefined";
  if (hasBlob)
    BINARY_TYPES.push("blob");
  module.exports = {
    BINARY_TYPES,
    CLOSE_TIMEOUT: 30000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
    hasBlob,
    kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
    kListener: Symbol("kListener"),
    kStatusCode: Symbol("status-code"),
    kWebSocket: Symbol("websocket"),
    NOOP: () => {}
  };
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS((exports, module) => {
  var { EMPTY_BUFFER } = require_constants();
  var FastBuffer = Buffer[Symbol.species];
  function concat(list, totalLength) {
    if (list.length === 0)
      return EMPTY_BUFFER;
    if (list.length === 1)
      return list[0];
    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;
    for (let i = 0;i < list.length; i++) {
      const buf = list[i];
      target.set(buf, offset);
      offset += buf.length;
    }
    if (offset < totalLength) {
      return new FastBuffer(target.buffer, target.byteOffset, offset);
    }
    return target;
  }
  function _mask(source, mask, output, offset, length) {
    for (let i = 0;i < length; i++) {
      output[offset + i] = source[i] ^ mask[i & 3];
    }
  }
  function _unmask(buffer, mask) {
    for (let i = 0;i < buffer.length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  }
  function toArrayBuffer(buf) {
    if (buf.length === buf.buffer.byteLength) {
      return buf.buffer;
    }
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
  }
  function toBuffer(data) {
    toBuffer.readOnly = true;
    if (Buffer.isBuffer(data))
      return data;
    let buf;
    if (data instanceof ArrayBuffer) {
      buf = new FastBuffer(data);
    } else if (ArrayBuffer.isView(data)) {
      buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
    } else {
      buf = Buffer.from(data);
      toBuffer.readOnly = false;
    }
    return buf;
  }
  module.exports = {
    concat,
    mask: _mask,
    toArrayBuffer,
    toBuffer,
    unmask: _unmask
  };
  if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
      const bufferUtil = (()=>{throw new Error("Cannot require module "+"bufferutil");})();
      module.exports.mask = function(source, mask, output, offset, length) {
        if (length < 48)
          _mask(source, mask, output, offset, length);
        else
          bufferUtil.mask(source, mask, output, offset, length);
      };
      module.exports.unmask = function(buffer, mask) {
        if (buffer.length < 32)
          _unmask(buffer, mask);
        else
          bufferUtil.unmask(buffer, mask);
      };
    } catch (e) {}
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS((exports, module) => {
  var kDone = Symbol("kDone");
  var kRun = Symbol("kRun");

  class Limiter {
    constructor(concurrency) {
      this[kDone] = () => {
        this.pending--;
        this[kRun]();
      };
      this.concurrency = concurrency || Infinity;
      this.jobs = [];
      this.pending = 0;
    }
    add(job) {
      this.jobs.push(job);
      this[kRun]();
    }
    [kRun]() {
      if (this.pending === this.concurrency)
        return;
      if (this.jobs.length) {
        const job = this.jobs.shift();
        this.pending++;
        job(this[kDone]);
      }
    }
  }
  module.exports = Limiter;
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS((exports, module) => {
  var zlib = __require("zlib");
  var bufferUtil = require_buffer_util();
  var Limiter = require_limiter();
  var { kStatusCode } = require_constants();
  var FastBuffer = Buffer[Symbol.species];
  var TRAILER = Buffer.from([0, 0, 255, 255]);
  var kPerMessageDeflate = Symbol("permessage-deflate");
  var kTotalLength = Symbol("total-length");
  var kCallback = Symbol("callback");
  var kBuffers = Symbol("buffers");
  var kError = Symbol("error");
  var zlibLimiter;

  class PerMessageDeflate {
    constructor(options) {
      this._options = options || {};
      this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
      this._maxPayload = this._options.maxPayload | 0;
      this._isServer = !!this._options.isServer;
      this._deflate = null;
      this._inflate = null;
      this.params = null;
      if (!zlibLimiter) {
        const concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
        zlibLimiter = new Limiter(concurrency);
      }
    }
    static get extensionName() {
      return "permessage-deflate";
    }
    offer() {
      const params = {};
      if (this._options.serverNoContextTakeover) {
        params.server_no_context_takeover = true;
      }
      if (this._options.clientNoContextTakeover) {
        params.client_no_context_takeover = true;
      }
      if (this._options.serverMaxWindowBits) {
        params.server_max_window_bits = this._options.serverMaxWindowBits;
      }
      if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits == null) {
        params.client_max_window_bits = true;
      }
      return params;
    }
    accept(configurations) {
      configurations = this.normalizeParams(configurations);
      this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
      return this.params;
    }
    cleanup() {
      if (this._inflate) {
        this._inflate.close();
        this._inflate = null;
      }
      if (this._deflate) {
        const callback = this._deflate[kCallback];
        this._deflate.close();
        this._deflate = null;
        if (callback) {
          callback(new Error("The deflate stream was closed while data was being processed"));
        }
      }
    }
    acceptAsServer(offers) {
      const opts = this._options;
      const accepted = offers.find((params) => {
        if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
          return false;
        }
        return true;
      });
      if (!accepted) {
        throw new Error("None of the extension offers can be accepted");
      }
      if (opts.serverNoContextTakeover) {
        accepted.server_no_context_takeover = true;
      }
      if (opts.clientNoContextTakeover) {
        accepted.client_no_context_takeover = true;
      }
      if (typeof opts.serverMaxWindowBits === "number") {
        accepted.server_max_window_bits = opts.serverMaxWindowBits;
      }
      if (typeof opts.clientMaxWindowBits === "number") {
        accepted.client_max_window_bits = opts.clientMaxWindowBits;
      } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
        delete accepted.client_max_window_bits;
      }
      return accepted;
    }
    acceptAsClient(response) {
      const params = response[0];
      if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
        throw new Error('Unexpected parameter "client_no_context_takeover"');
      }
      if (!params.client_max_window_bits) {
        if (typeof this._options.clientMaxWindowBits === "number") {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        }
      } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
        throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
      }
      return params;
    }
    normalizeParams(configurations) {
      configurations.forEach((params) => {
        Object.keys(params).forEach((key) => {
          let value = params[key];
          if (value.length > 1) {
            throw new Error(`Parameter "${key}" must have only a single value`);
          }
          value = value[0];
          if (key === "client_max_window_bits") {
            if (value !== true) {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (!this._isServer) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
          } else if (key === "server_max_window_bits") {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
            value = num;
          } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
            if (value !== true) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
          } else {
            throw new Error(`Unknown parameter "${key}"`);
          }
          params[key] = value;
        });
      });
      return configurations;
    }
    decompress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._decompress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    compress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._compress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    _decompress(data, fin, callback) {
      const endpoint = this._isServer ? "client" : "server";
      if (!this._inflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._inflate = zlib.createInflateRaw({
          ...this._options.zlibInflateOptions,
          windowBits
        });
        this._inflate[kPerMessageDeflate] = this;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate.on("error", inflateOnError);
        this._inflate.on("data", inflateOnData);
      }
      this._inflate[kCallback] = callback;
      this._inflate.write(data);
      if (fin)
        this._inflate.write(TRAILER);
      this._inflate.flush(() => {
        const err = this._inflate[kError];
        if (err) {
          this._inflate.close();
          this._inflate = null;
          callback(err);
          return;
        }
        const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
        if (this._inflate._readableState.endEmitted) {
          this._inflate.close();
          this._inflate = null;
        } else {
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._inflate.reset();
          }
        }
        callback(null, data2);
      });
    }
    _compress(data, fin, callback) {
      const endpoint = this._isServer ? "server" : "client";
      if (!this._deflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._deflate = zlib.createDeflateRaw({
          ...this._options.zlibDeflateOptions,
          windowBits
        });
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        this._deflate.on("data", deflateOnData);
      }
      this._deflate[kCallback] = callback;
      this._deflate.write(data);
      this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
        if (!this._deflate) {
          return;
        }
        let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
        if (fin) {
          data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
        }
        this._deflate[kCallback] = null;
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._deflate.reset();
        }
        callback(null, data2);
      });
    }
  }
  module.exports = PerMessageDeflate;
  function deflateOnData(chunk) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
  }
  function inflateOnData(chunk) {
    this[kTotalLength] += chunk.length;
    if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
      this[kBuffers].push(chunk);
      return;
    }
    this[kError] = new RangeError("Max payload size exceeded");
    this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
    this[kError][kStatusCode] = 1009;
    this.removeListener("data", inflateOnData);
    this.reset();
  }
  function inflateOnError(err) {
    this[kPerMessageDeflate]._inflate = null;
    if (this[kError]) {
      this[kCallback](this[kError]);
      return;
    }
    err[kStatusCode] = 1007;
    this[kCallback](err);
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS((exports, module) => {
  var { isUtf8 } = __require("buffer");
  var { hasBlob } = require_constants();
  var tokenChars = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0
  ];
  function isValidStatusCode(code) {
    return code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3000 && code <= 4999;
  }
  function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 128) === 0) {
        i++;
      } else if ((buf[i] & 224) === 192) {
        if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
          return false;
        }
        i += 2;
      } else if ((buf[i] & 240) === 224) {
        if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
          return false;
        }
        i += 3;
      } else if ((buf[i] & 248) === 240) {
        if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }
  function isBlob(value) {
    return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
  }
  module.exports = {
    isBlob,
    isValidStatusCode,
    isValidUTF8: _isValidUTF8,
    tokenChars
  };
  if (isUtf8) {
    module.exports.isValidUTF8 = function(buf) {
      return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
    };
  } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const isValidUTF8 = (()=>{throw new Error("Cannot require module "+"utf-8-validate");})();
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
      };
    } catch (e) {}
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS((exports, module) => {
  var { Writable } = __require("stream");
  var PerMessageDeflate = require_permessage_deflate();
  var {
    BINARY_TYPES,
    EMPTY_BUFFER,
    kStatusCode,
    kWebSocket
  } = require_constants();
  var { concat, toArrayBuffer, unmask } = require_buffer_util();
  var { isValidStatusCode, isValidUTF8 } = require_validation();
  var FastBuffer = Buffer[Symbol.species];
  var GET_INFO = 0;
  var GET_PAYLOAD_LENGTH_16 = 1;
  var GET_PAYLOAD_LENGTH_64 = 2;
  var GET_MASK = 3;
  var GET_DATA = 4;
  var INFLATING = 5;
  var DEFER_EVENT = 6;

  class Receiver extends Writable {
    constructor(options = {}) {
      super();
      this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined ? options.allowSynchronousEvents : true;
      this._binaryType = options.binaryType || BINARY_TYPES[0];
      this._extensions = options.extensions || {};
      this._isServer = !!options.isServer;
      this._maxPayload = options.maxPayload | 0;
      this._skipUTF8Validation = !!options.skipUTF8Validation;
      this[kWebSocket] = undefined;
      this._bufferedBytes = 0;
      this._buffers = [];
      this._compressed = false;
      this._payloadLength = 0;
      this._mask = undefined;
      this._fragmented = 0;
      this._masked = false;
      this._fin = false;
      this._opcode = 0;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragments = [];
      this._errored = false;
      this._loop = false;
      this._state = GET_INFO;
    }
    _write(chunk, encoding, cb) {
      if (this._opcode === 8 && this._state == GET_INFO)
        return cb();
      this._bufferedBytes += chunk.length;
      this._buffers.push(chunk);
      this.startLoop(cb);
    }
    consume(n) {
      this._bufferedBytes -= n;
      if (n === this._buffers[0].length)
        return this._buffers.shift();
      if (n < this._buffers[0].length) {
        const buf = this._buffers[0];
        this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
        return new FastBuffer(buf.buffer, buf.byteOffset, n);
      }
      const dst = Buffer.allocUnsafe(n);
      do {
        const buf = this._buffers[0];
        const offset = dst.length - n;
        if (n >= buf.length) {
          dst.set(this._buffers.shift(), offset);
        } else {
          dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
          this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
        }
        n -= buf.length;
      } while (n > 0);
      return dst;
    }
    startLoop(cb) {
      this._loop = true;
      do {
        switch (this._state) {
          case GET_INFO:
            this.getInfo(cb);
            break;
          case GET_PAYLOAD_LENGTH_16:
            this.getPayloadLength16(cb);
            break;
          case GET_PAYLOAD_LENGTH_64:
            this.getPayloadLength64(cb);
            break;
          case GET_MASK:
            this.getMask();
            break;
          case GET_DATA:
            this.getData(cb);
            break;
          case INFLATING:
          case DEFER_EVENT:
            this._loop = false;
            return;
        }
      } while (this._loop);
      if (!this._errored)
        cb();
    }
    getInfo(cb) {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      const buf = this.consume(2);
      if ((buf[0] & 48) !== 0) {
        const error = this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
        cb(error);
        return;
      }
      const compressed = (buf[0] & 64) === 64;
      if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
        const error = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        cb(error);
        return;
      }
      this._fin = (buf[0] & 128) === 128;
      this._opcode = buf[0] & 15;
      this._payloadLength = buf[1] & 127;
      if (this._opcode === 0) {
        if (compressed) {
          const error = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          cb(error);
          return;
        }
        if (!this._fragmented) {
          const error = this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
          cb(error);
          return;
        }
        this._opcode = this._fragmented;
      } else if (this._opcode === 1 || this._opcode === 2) {
        if (this._fragmented) {
          const error = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
          cb(error);
          return;
        }
        this._compressed = compressed;
      } else if (this._opcode > 7 && this._opcode < 11) {
        if (!this._fin) {
          const error = this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
          cb(error);
          return;
        }
        if (compressed) {
          const error = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          cb(error);
          return;
        }
        if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
          const error = this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          cb(error);
          return;
        }
      } else {
        const error = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
        cb(error);
        return;
      }
      if (!this._fin && !this._fragmented)
        this._fragmented = this._opcode;
      this._masked = (buf[1] & 128) === 128;
      if (this._isServer) {
        if (!this._masked) {
          const error = this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
          cb(error);
          return;
        }
      } else if (this._masked) {
        const error = this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
        cb(error);
        return;
      }
      if (this._payloadLength === 126)
        this._state = GET_PAYLOAD_LENGTH_16;
      else if (this._payloadLength === 127)
        this._state = GET_PAYLOAD_LENGTH_64;
      else
        this.haveLength(cb);
    }
    getPayloadLength16(cb) {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      this._payloadLength = this.consume(2).readUInt16BE(0);
      this.haveLength(cb);
    }
    getPayloadLength64(cb) {
      if (this._bufferedBytes < 8) {
        this._loop = false;
        return;
      }
      const buf = this.consume(8);
      const num = buf.readUInt32BE(0);
      if (num > Math.pow(2, 53 - 32) - 1) {
        const error = this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
        cb(error);
        return;
      }
      this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
      this.haveLength(cb);
    }
    haveLength(cb) {
      if (this._payloadLength && this._opcode < 8) {
        this._totalPayloadLength += this._payloadLength;
        if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
          cb(error);
          return;
        }
      }
      if (this._masked)
        this._state = GET_MASK;
      else
        this._state = GET_DATA;
    }
    getMask() {
      if (this._bufferedBytes < 4) {
        this._loop = false;
        return;
      }
      this._mask = this.consume(4);
      this._state = GET_DATA;
    }
    getData(cb) {
      let data = EMPTY_BUFFER;
      if (this._payloadLength) {
        if (this._bufferedBytes < this._payloadLength) {
          this._loop = false;
          return;
        }
        data = this.consume(this._payloadLength);
        if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
          unmask(data, this._mask);
        }
      }
      if (this._opcode > 7) {
        this.controlMessage(data, cb);
        return;
      }
      if (this._compressed) {
        this._state = INFLATING;
        this.decompress(data, cb);
        return;
      }
      if (data.length) {
        this._messageLength = this._totalPayloadLength;
        this._fragments.push(data);
      }
      this.dataMessage(cb);
    }
    decompress(data, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      perMessageDeflate.decompress(data, this._fin, (err, buf) => {
        if (err)
          return cb(err);
        if (buf.length) {
          this._messageLength += buf.length;
          if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
            cb(error);
            return;
          }
          this._fragments.push(buf);
        }
        this.dataMessage(cb);
        if (this._state === GET_INFO)
          this.startLoop(cb);
      });
    }
    dataMessage(cb) {
      if (!this._fin) {
        this._state = GET_INFO;
        return;
      }
      const messageLength = this._messageLength;
      const fragments = this._fragments;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];
      if (this._opcode === 2) {
        let data;
        if (this._binaryType === "nodebuffer") {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === "arraybuffer") {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else if (this._binaryType === "blob") {
          data = new Blob(fragments);
        } else {
          data = fragments;
        }
        if (this._allowSynchronousEvents) {
          this.emit("message", data, true);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit("message", data, true);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      } else {
        const buf = concat(fragments, messageLength);
        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
          cb(error);
          return;
        }
        if (this._state === INFLATING || this._allowSynchronousEvents) {
          this.emit("message", buf, false);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit("message", buf, false);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
    }
    controlMessage(data, cb) {
      if (this._opcode === 8) {
        if (data.length === 0) {
          this._loop = false;
          this.emit("conclude", 1005, EMPTY_BUFFER);
          this.end();
        } else {
          const code = data.readUInt16BE(0);
          if (!isValidStatusCode(code)) {
            const error = this.createError(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
            cb(error);
            return;
          }
          const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            cb(error);
            return;
          }
          this._loop = false;
          this.emit("conclude", code, buf);
          this.end();
        }
        this._state = GET_INFO;
        return;
      }
      if (this._allowSynchronousEvents) {
        this.emit(this._opcode === 9 ? "ping" : "pong", data);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }
    createError(ErrorCtor, message, prefix, statusCode, errorCode) {
      this._loop = false;
      this._errored = true;
      const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
      Error.captureStackTrace(err, this.createError);
      err.code = errorCode;
      err[kStatusCode] = statusCode;
      return err;
    }
  }
  module.exports = Receiver;
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS((exports, module) => {
  var { Duplex } = __require("stream");
  var { randomFillSync: randomFillSync2 } = __require("crypto");
  var PerMessageDeflate = require_permessage_deflate();
  var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
  var { isBlob, isValidStatusCode } = require_validation();
  var { mask: applyMask, toBuffer } = require_buffer_util();
  var kByteLength = Symbol("kByteLength");
  var maskBuffer = Buffer.alloc(4);
  var RANDOM_POOL_SIZE = 8 * 1024;
  var randomPool;
  var randomPoolPointer = RANDOM_POOL_SIZE;
  var DEFAULT = 0;
  var DEFLATING = 1;
  var GET_BLOB_DATA = 2;

  class Sender {
    constructor(socket, extensions, generateMask) {
      this._extensions = extensions || {};
      if (generateMask) {
        this._generateMask = generateMask;
        this._maskBuffer = Buffer.alloc(4);
      }
      this._socket = socket;
      this._firstFragment = true;
      this._compress = false;
      this._bufferedBytes = 0;
      this._queue = [];
      this._state = DEFAULT;
      this.onerror = NOOP;
      this[kWebSocket] = undefined;
    }
    static frame(data, options) {
      let mask;
      let merge = false;
      let offset = 2;
      let skipMasking = false;
      if (options.mask) {
        mask = options.maskBuffer || maskBuffer;
        if (options.generateMask) {
          options.generateMask(mask);
        } else {
          if (randomPoolPointer === RANDOM_POOL_SIZE) {
            if (randomPool === undefined) {
              randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
            }
            randomFillSync2(randomPool, 0, RANDOM_POOL_SIZE);
            randomPoolPointer = 0;
          }
          mask[0] = randomPool[randomPoolPointer++];
          mask[1] = randomPool[randomPoolPointer++];
          mask[2] = randomPool[randomPoolPointer++];
          mask[3] = randomPool[randomPoolPointer++];
        }
        skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
        offset = 6;
      }
      let dataLength;
      if (typeof data === "string") {
        if ((!options.mask || skipMasking) && options[kByteLength] !== undefined) {
          dataLength = options[kByteLength];
        } else {
          data = Buffer.from(data);
          dataLength = data.length;
        }
      } else {
        dataLength = data.length;
        merge = options.mask && options.readOnly && !skipMasking;
      }
      let payloadLength = dataLength;
      if (dataLength >= 65536) {
        offset += 8;
        payloadLength = 127;
      } else if (dataLength > 125) {
        offset += 2;
        payloadLength = 126;
      }
      const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
      target[0] = options.fin ? options.opcode | 128 : options.opcode;
      if (options.rsv1)
        target[0] |= 64;
      target[1] = payloadLength;
      if (payloadLength === 126) {
        target.writeUInt16BE(dataLength, 2);
      } else if (payloadLength === 127) {
        target[2] = target[3] = 0;
        target.writeUIntBE(dataLength, 4, 6);
      }
      if (!options.mask)
        return [target, data];
      target[1] |= 128;
      target[offset - 4] = mask[0];
      target[offset - 3] = mask[1];
      target[offset - 2] = mask[2];
      target[offset - 1] = mask[3];
      if (skipMasking)
        return [target, data];
      if (merge) {
        applyMask(data, mask, target, offset, dataLength);
        return [target];
      }
      applyMask(data, mask, data, 0, dataLength);
      return [target, data];
    }
    close(code, data, mask, cb) {
      let buf;
      if (code === undefined) {
        buf = EMPTY_BUFFER;
      } else if (typeof code !== "number" || !isValidStatusCode(code)) {
        throw new TypeError("First argument must be a valid error code number");
      } else if (data === undefined || !data.length) {
        buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(code, 0);
      } else {
        const length = Buffer.byteLength(data);
        if (length > 123) {
          throw new RangeError("The message must not be greater than 123 bytes");
        }
        buf = Buffer.allocUnsafe(2 + length);
        buf.writeUInt16BE(code, 0);
        if (typeof data === "string") {
          buf.write(data, 2);
        } else {
          buf.set(data, 2);
        }
      }
      const options = {
        [kByteLength]: buf.length,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 8,
        readOnly: false,
        rsv1: false
      };
      if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, buf, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(buf, options), cb);
      }
    }
    ping(data, mask, cb) {
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (byteLength > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      const options = {
        [kByteLength]: byteLength,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 9,
        readOnly,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, false, options, cb]);
        } else {
          this.getBlobData(data, false, options, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(data, options), cb);
      }
    }
    pong(data, mask, cb) {
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (byteLength > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      const options = {
        [kByteLength]: byteLength,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 10,
        readOnly,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, false, options, cb]);
        } else {
          this.getBlobData(data, false, options, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(data, options), cb);
      }
    }
    send(data, options, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      let opcode = options.binary ? 2 : 1;
      let rsv1 = options.compress;
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (this._firstFragment) {
        this._firstFragment = false;
        if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
          rsv1 = byteLength >= perMessageDeflate._threshold;
        }
        this._compress = rsv1;
      } else {
        rsv1 = false;
        opcode = 0;
      }
      if (options.fin)
        this._firstFragment = true;
      const opts = {
        [kByteLength]: byteLength,
        fin: options.fin,
        generateMask: this._generateMask,
        mask: options.mask,
        maskBuffer: this._maskBuffer,
        opcode,
        readOnly,
        rsv1
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
        } else {
          this.getBlobData(data, this._compress, opts, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, this._compress, opts, cb]);
      } else {
        this.dispatch(data, this._compress, opts, cb);
      }
    }
    getBlobData(blob, compress, options, cb) {
      this._bufferedBytes += options[kByteLength];
      this._state = GET_BLOB_DATA;
      blob.arrayBuffer().then((arrayBuffer) => {
        if (this._socket.destroyed) {
          const err = new Error("The socket was closed while the blob was being read");
          process.nextTick(callCallbacks, this, err, cb);
          return;
        }
        this._bufferedBytes -= options[kByteLength];
        const data = toBuffer(arrayBuffer);
        if (!compress) {
          this._state = DEFAULT;
          this.sendFrame(Sender.frame(data, options), cb);
          this.dequeue();
        } else {
          this.dispatch(data, compress, options, cb);
        }
      }).catch((err) => {
        process.nextTick(onError, this, err, cb);
      });
    }
    dispatch(data, compress, options, cb) {
      if (!compress) {
        this.sendFrame(Sender.frame(data, options), cb);
        return;
      }
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      this._bufferedBytes += options[kByteLength];
      this._state = DEFLATING;
      perMessageDeflate.compress(data, options.fin, (_, buf) => {
        if (this._socket.destroyed) {
          const err = new Error("The socket was closed while data was being compressed");
          callCallbacks(this, err, cb);
          return;
        }
        this._bufferedBytes -= options[kByteLength];
        this._state = DEFAULT;
        options.readOnly = false;
        this.sendFrame(Sender.frame(buf, options), cb);
        this.dequeue();
      });
    }
    dequeue() {
      while (this._state === DEFAULT && this._queue.length) {
        const params = this._queue.shift();
        this._bufferedBytes -= params[3][kByteLength];
        Reflect.apply(params[0], this, params.slice(1));
      }
    }
    enqueue(params) {
      this._bufferedBytes += params[3][kByteLength];
      this._queue.push(params);
    }
    sendFrame(list, cb) {
      if (list.length === 2) {
        this._socket.cork();
        this._socket.write(list[0]);
        this._socket.write(list[1], cb);
        this._socket.uncork();
      } else {
        this._socket.write(list[0], cb);
      }
    }
  }
  module.exports = Sender;
  function callCallbacks(sender, err, cb) {
    if (typeof cb === "function")
      cb(err);
    for (let i = 0;i < sender._queue.length; i++) {
      const params = sender._queue[i];
      const callback = params[params.length - 1];
      if (typeof callback === "function")
        callback(err);
    }
  }
  function onError(sender, err, cb) {
    callCallbacks(sender, err, cb);
    sender.onerror(err);
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS((exports, module) => {
  var { kForOnEventAttribute, kListener } = require_constants();
  var kCode = Symbol("kCode");
  var kData = Symbol("kData");
  var kError = Symbol("kError");
  var kMessage = Symbol("kMessage");
  var kReason = Symbol("kReason");
  var kTarget = Symbol("kTarget");
  var kType = Symbol("kType");
  var kWasClean = Symbol("kWasClean");

  class Event {
    constructor(type) {
      this[kTarget] = null;
      this[kType] = type;
    }
    get target() {
      return this[kTarget];
    }
    get type() {
      return this[kType];
    }
  }
  Object.defineProperty(Event.prototype, "target", { enumerable: true });
  Object.defineProperty(Event.prototype, "type", { enumerable: true });

  class CloseEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this[kCode] = options.code === undefined ? 0 : options.code;
      this[kReason] = options.reason === undefined ? "" : options.reason;
      this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
    }
    get code() {
      return this[kCode];
    }
    get reason() {
      return this[kReason];
    }
    get wasClean() {
      return this[kWasClean];
    }
  }
  Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
  Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
  Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });

  class ErrorEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this[kError] = options.error === undefined ? null : options.error;
      this[kMessage] = options.message === undefined ? "" : options.message;
    }
    get error() {
      return this[kError];
    }
    get message() {
      return this[kMessage];
    }
  }
  Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
  Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });

  class MessageEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this[kData] = options.data === undefined ? null : options.data;
    }
    get data() {
      return this[kData];
    }
  }
  Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
  var EventTarget = {
    addEventListener(type, handler, options = {}) {
      for (const listener of this.listeners(type)) {
        if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
          return;
        }
      }
      let wrapper;
      if (type === "message") {
        wrapper = function onMessage(data, isBinary) {
          const event = new MessageEvent("message", {
            data: isBinary ? data : data.toString()
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "close") {
        wrapper = function onClose(code, message) {
          const event = new CloseEvent("close", {
            code,
            reason: message.toString(),
            wasClean: this._closeFrameReceived && this._closeFrameSent
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "error") {
        wrapper = function onError(error) {
          const event = new ErrorEvent("error", {
            error,
            message: error.message
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "open") {
        wrapper = function onOpen() {
          const event = new Event("open");
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else {
        return;
      }
      wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
      wrapper[kListener] = handler;
      if (options.once) {
        this.once(type, wrapper);
      } else {
        this.on(type, wrapper);
      }
    },
    removeEventListener(type, handler) {
      for (const listener of this.listeners(type)) {
        if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
          this.removeListener(type, listener);
          break;
        }
      }
    }
  };
  module.exports = {
    CloseEvent,
    ErrorEvent,
    Event,
    EventTarget,
    MessageEvent
  };
  function callListener(listener, thisArg, event) {
    if (typeof listener === "object" && listener.handleEvent) {
      listener.handleEvent.call(listener, event);
    } else {
      listener.call(thisArg, event);
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS((exports, module) => {
  var { tokenChars } = require_validation();
  function push(dest, name, elem) {
    if (dest[name] === undefined)
      dest[name] = [elem];
    else
      dest[name].push(elem);
  }
  function parse(header) {
    const offers = Object.create(null);
    let params = Object.create(null);
    let mustUnescape = false;
    let isEscaping = false;
    let inQuotes = false;
    let extensionName;
    let paramName;
    let start = -1;
    let code = -1;
    let end = -1;
    let i = 0;
    for (;i < header.length; i++) {
      code = header.charCodeAt(i);
      if (extensionName === undefined) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const name = header.slice(start, end);
          if (code === 44) {
            push(offers, name, params);
            params = Object.create(null);
          } else {
            extensionName = name;
          }
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (paramName === undefined) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (code === 32 || code === 9) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          push(params, header.slice(start, end), true);
          if (code === 44) {
            push(offers, extensionName, params);
            params = Object.create(null);
            extensionName = undefined;
          }
          start = end = -1;
        } else if (code === 61 && start !== -1 && end === -1) {
          paramName = header.slice(start, i);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else {
        if (isEscaping) {
          if (tokenChars[code] !== 1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (start === -1)
            start = i;
          else if (!mustUnescape)
            mustUnescape = true;
          isEscaping = false;
        } else if (inQuotes) {
          if (tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 34 && start !== -1) {
            inQuotes = false;
            end = i;
          } else if (code === 92) {
            isEscaping = true;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
          inQuotes = true;
        } else if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (start !== -1 && (code === 32 || code === 9)) {
          if (end === -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          let value = header.slice(start, end);
          if (mustUnescape) {
            value = value.replace(/\\/g, "");
            mustUnescape = false;
          }
          push(params, paramName, value);
          if (code === 44) {
            push(offers, extensionName, params);
            params = Object.create(null);
            extensionName = undefined;
          }
          paramName = undefined;
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
    }
    if (start === -1 || inQuotes || code === 32 || code === 9) {
      throw new SyntaxError("Unexpected end of input");
    }
    if (end === -1)
      end = i;
    const token = header.slice(start, end);
    if (extensionName === undefined) {
      push(offers, token, params);
    } else {
      if (paramName === undefined) {
        push(params, token, true);
      } else if (mustUnescape) {
        push(params, paramName, token.replace(/\\/g, ""));
      } else {
        push(params, paramName, token);
      }
      push(offers, extensionName, params);
    }
    return offers;
  }
  function format(extensions) {
    return Object.keys(extensions).map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations))
        configurations = [configurations];
      return configurations.map((params) => {
        return [extension].concat(Object.keys(params).map((k) => {
          let values = params[k];
          if (!Array.isArray(values))
            values = [values];
          return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
        })).join("; ");
      }).join(", ");
    }).join(", ");
  }
  module.exports = { format, parse };
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  var https = __require("https");
  var http = __require("http");
  var net = __require("net");
  var tls = __require("tls");
  var { randomBytes, createHash } = __require("crypto");
  var { Duplex, Readable } = __require("stream");
  var { URL: URL2 } = __require("url");
  var PerMessageDeflate = require_permessage_deflate();
  var Receiver = require_receiver();
  var Sender = require_sender();
  var { isBlob } = require_validation();
  var {
    BINARY_TYPES,
    CLOSE_TIMEOUT,
    EMPTY_BUFFER,
    GUID,
    kForOnEventAttribute,
    kListener,
    kStatusCode,
    kWebSocket,
    NOOP
  } = require_constants();
  var {
    EventTarget: { addEventListener, removeEventListener }
  } = require_event_target();
  var { format, parse } = require_extension();
  var { toBuffer } = require_buffer_util();
  var kAborted = Symbol("kAborted");
  var protocolVersions = [8, 13];
  var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
  var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

  class WebSocket2 extends EventEmitter {
    constructor(address, protocols, options) {
      super();
      this._binaryType = BINARY_TYPES[0];
      this._closeCode = 1006;
      this._closeFrameReceived = false;
      this._closeFrameSent = false;
      this._closeMessage = EMPTY_BUFFER;
      this._closeTimer = null;
      this._errorEmitted = false;
      this._extensions = {};
      this._paused = false;
      this._protocol = "";
      this._readyState = WebSocket2.CONNECTING;
      this._receiver = null;
      this._sender = null;
      this._socket = null;
      if (address !== null) {
        this._bufferedAmount = 0;
        this._isServer = false;
        this._redirects = 0;
        if (protocols === undefined) {
          protocols = [];
        } else if (!Array.isArray(protocols)) {
          if (typeof protocols === "object" && protocols !== null) {
            options = protocols;
            protocols = [];
          } else {
            protocols = [protocols];
          }
        }
        initAsClient(this, address, protocols, options);
      } else {
        this._autoPong = options.autoPong;
        this._closeTimeout = options.closeTimeout;
        this._isServer = true;
      }
    }
    get binaryType() {
      return this._binaryType;
    }
    set binaryType(type) {
      if (!BINARY_TYPES.includes(type))
        return;
      this._binaryType = type;
      if (this._receiver)
        this._receiver._binaryType = type;
    }
    get bufferedAmount() {
      if (!this._socket)
        return this._bufferedAmount;
      return this._socket._writableState.length + this._sender._bufferedBytes;
    }
    get extensions() {
      return Object.keys(this._extensions).join();
    }
    get isPaused() {
      return this._paused;
    }
    get onclose() {
      return null;
    }
    get onerror() {
      return null;
    }
    get onopen() {
      return null;
    }
    get onmessage() {
      return null;
    }
    get protocol() {
      return this._protocol;
    }
    get readyState() {
      return this._readyState;
    }
    get url() {
      return this._url;
    }
    setSocket(socket, head, options) {
      const receiver = new Receiver({
        allowSynchronousEvents: options.allowSynchronousEvents,
        binaryType: this.binaryType,
        extensions: this._extensions,
        isServer: this._isServer,
        maxPayload: options.maxPayload,
        skipUTF8Validation: options.skipUTF8Validation
      });
      const sender = new Sender(socket, this._extensions, options.generateMask);
      this._receiver = receiver;
      this._sender = sender;
      this._socket = socket;
      receiver[kWebSocket] = this;
      sender[kWebSocket] = this;
      socket[kWebSocket] = this;
      receiver.on("conclude", receiverOnConclude);
      receiver.on("drain", receiverOnDrain);
      receiver.on("error", receiverOnError);
      receiver.on("message", receiverOnMessage);
      receiver.on("ping", receiverOnPing);
      receiver.on("pong", receiverOnPong);
      sender.onerror = senderOnError;
      if (socket.setTimeout)
        socket.setTimeout(0);
      if (socket.setNoDelay)
        socket.setNoDelay();
      if (head.length > 0)
        socket.unshift(head);
      socket.on("close", socketOnClose);
      socket.on("data", socketOnData);
      socket.on("end", socketOnEnd);
      socket.on("error", socketOnError);
      this._readyState = WebSocket2.OPEN;
      this.emit("open");
    }
    emitClose() {
      if (!this._socket) {
        this._readyState = WebSocket2.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
        return;
      }
      if (this._extensions[PerMessageDeflate.extensionName]) {
        this._extensions[PerMessageDeflate.extensionName].cleanup();
      }
      this._receiver.removeAllListeners();
      this._readyState = WebSocket2.CLOSED;
      this.emit("close", this._closeCode, this._closeMessage);
    }
    close(code, data) {
      if (this.readyState === WebSocket2.CLOSED)
        return;
      if (this.readyState === WebSocket2.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        abortHandshake(this, this._req, msg);
        return;
      }
      if (this.readyState === WebSocket2.CLOSING) {
        if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
          this._socket.end();
        }
        return;
      }
      this._readyState = WebSocket2.CLOSING;
      this._sender.close(code, data, !this._isServer, (err) => {
        if (err)
          return;
        this._closeFrameSent = true;
        if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
          this._socket.end();
        }
      });
      setCloseTimer(this);
    }
    pause() {
      if (this.readyState === WebSocket2.CONNECTING || this.readyState === WebSocket2.CLOSED) {
        return;
      }
      this._paused = true;
      this._socket.pause();
    }
    ping(data, mask, cb) {
      if (this.readyState === WebSocket2.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = undefined;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = undefined;
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket2.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === undefined)
        mask = !this._isServer;
      this._sender.ping(data || EMPTY_BUFFER, mask, cb);
    }
    pong(data, mask, cb) {
      if (this.readyState === WebSocket2.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = undefined;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = undefined;
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket2.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === undefined)
        mask = !this._isServer;
      this._sender.pong(data || EMPTY_BUFFER, mask, cb);
    }
    resume() {
      if (this.readyState === WebSocket2.CONNECTING || this.readyState === WebSocket2.CLOSED) {
        return;
      }
      this._paused = false;
      if (!this._receiver._writableState.needDrain)
        this._socket.resume();
    }
    send(data, options, cb) {
      if (this.readyState === WebSocket2.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket2.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      const opts = {
        binary: typeof data !== "string",
        mask: !this._isServer,
        compress: true,
        fin: true,
        ...options
      };
      if (!this._extensions[PerMessageDeflate.extensionName]) {
        opts.compress = false;
      }
      this._sender.send(data || EMPTY_BUFFER, opts, cb);
    }
    terminate() {
      if (this.readyState === WebSocket2.CLOSED)
        return;
      if (this.readyState === WebSocket2.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        abortHandshake(this, this._req, msg);
        return;
      }
      if (this._socket) {
        this._readyState = WebSocket2.CLOSING;
        this._socket.destroy();
      }
    }
  }
  Object.defineProperty(WebSocket2, "CONNECTING", {
    enumerable: true,
    value: readyStates.indexOf("CONNECTING")
  });
  Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
    enumerable: true,
    value: readyStates.indexOf("CONNECTING")
  });
  Object.defineProperty(WebSocket2, "OPEN", {
    enumerable: true,
    value: readyStates.indexOf("OPEN")
  });
  Object.defineProperty(WebSocket2.prototype, "OPEN", {
    enumerable: true,
    value: readyStates.indexOf("OPEN")
  });
  Object.defineProperty(WebSocket2, "CLOSING", {
    enumerable: true,
    value: readyStates.indexOf("CLOSING")
  });
  Object.defineProperty(WebSocket2.prototype, "CLOSING", {
    enumerable: true,
    value: readyStates.indexOf("CLOSING")
  });
  Object.defineProperty(WebSocket2, "CLOSED", {
    enumerable: true,
    value: readyStates.indexOf("CLOSED")
  });
  Object.defineProperty(WebSocket2.prototype, "CLOSED", {
    enumerable: true,
    value: readyStates.indexOf("CLOSED")
  });
  [
    "binaryType",
    "bufferedAmount",
    "extensions",
    "isPaused",
    "protocol",
    "readyState",
    "url"
  ].forEach((property) => {
    Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
  });
  ["open", "error", "close", "message"].forEach((method) => {
    Object.defineProperty(WebSocket2.prototype, `on${method}`, {
      enumerable: true,
      get() {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute])
            return listener[kListener];
        }
        return null;
      },
      set(handler) {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute]) {
            this.removeListener(method, listener);
            break;
          }
        }
        if (typeof handler !== "function")
          return;
        this.addEventListener(method, handler, {
          [kForOnEventAttribute]: true
        });
      }
    });
  });
  WebSocket2.prototype.addEventListener = addEventListener;
  WebSocket2.prototype.removeEventListener = removeEventListener;
  module.exports = WebSocket2;
  function initAsClient(websocket, address, protocols, options) {
    const opts = {
      allowSynchronousEvents: true,
      autoPong: true,
      closeTimeout: CLOSE_TIMEOUT,
      protocolVersion: protocolVersions[1],
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: true,
      followRedirects: false,
      maxRedirects: 10,
      ...options,
      socketPath: undefined,
      hostname: undefined,
      protocol: undefined,
      timeout: undefined,
      method: "GET",
      host: undefined,
      path: undefined,
      port: undefined
    };
    websocket._autoPong = opts.autoPong;
    websocket._closeTimeout = opts.closeTimeout;
    if (!protocolVersions.includes(opts.protocolVersion)) {
      throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} ` + `(supported versions: ${protocolVersions.join(", ")})`);
    }
    let parsedUrl;
    if (address instanceof URL2) {
      parsedUrl = address;
    } else {
      try {
        parsedUrl = new URL2(address);
      } catch {
        throw new SyntaxError(`Invalid URL: ${address}`);
      }
    }
    if (parsedUrl.protocol === "http:") {
      parsedUrl.protocol = "ws:";
    } else if (parsedUrl.protocol === "https:") {
      parsedUrl.protocol = "wss:";
    }
    websocket._url = parsedUrl.href;
    const isSecure = parsedUrl.protocol === "wss:";
    const isIpcUrl = parsedUrl.protocol === "ws+unix:";
    let invalidUrlMessage;
    if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
      invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", ` + '"http:", "https:", or "ws+unix:"';
    } else if (isIpcUrl && !parsedUrl.pathname) {
      invalidUrlMessage = "The URL's pathname is empty";
    } else if (parsedUrl.hash) {
      invalidUrlMessage = "The URL contains a fragment identifier";
    }
    if (invalidUrlMessage) {
      const err = new SyntaxError(invalidUrlMessage);
      if (websocket._redirects === 0) {
        throw err;
      } else {
        emitErrorAndClose(websocket, err);
        return;
      }
    }
    const defaultPort = isSecure ? 443 : 80;
    const key = randomBytes(16).toString("base64");
    const request = isSecure ? https.request : http.request;
    const protocolSet = new Set;
    let perMessageDeflate;
    opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
    opts.defaultPort = opts.defaultPort || defaultPort;
    opts.port = parsedUrl.port || defaultPort;
    opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
    opts.headers = {
      ...opts.headers,
      "Sec-WebSocket-Version": opts.protocolVersion,
      "Sec-WebSocket-Key": key,
      Connection: "Upgrade",
      Upgrade: "websocket"
    };
    opts.path = parsedUrl.pathname + parsedUrl.search;
    opts.timeout = opts.handshakeTimeout;
    if (opts.perMessageDeflate) {
      perMessageDeflate = new PerMessageDeflate({
        ...opts.perMessageDeflate,
        isServer: false,
        maxPayload: opts.maxPayload
      });
      opts.headers["Sec-WebSocket-Extensions"] = format({
        [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
      });
    }
    if (protocols.length) {
      for (const protocol of protocols) {
        if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
          throw new SyntaxError("An invalid or duplicated subprotocol was specified");
        }
        protocolSet.add(protocol);
      }
      opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
    }
    if (opts.origin) {
      if (opts.protocolVersion < 13) {
        opts.headers["Sec-WebSocket-Origin"] = opts.origin;
      } else {
        opts.headers.Origin = opts.origin;
      }
    }
    if (parsedUrl.username || parsedUrl.password) {
      opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
    }
    if (isIpcUrl) {
      const parts = opts.path.split(":");
      opts.socketPath = parts[0];
      opts.path = parts[1];
    }
    let req;
    if (opts.followRedirects) {
      if (websocket._redirects === 0) {
        websocket._originalIpc = isIpcUrl;
        websocket._originalSecure = isSecure;
        websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
        const headers = options && options.headers;
        options = { ...options, headers: {} };
        if (headers) {
          for (const [key2, value] of Object.entries(headers)) {
            options.headers[key2.toLowerCase()] = value;
          }
        }
      } else if (websocket.listenerCount("redirect") === 0) {
        const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
        if (!isSameHost || websocket._originalSecure && !isSecure) {
          delete opts.headers.authorization;
          delete opts.headers.cookie;
          if (!isSameHost)
            delete opts.headers.host;
          opts.auth = undefined;
        }
      }
      if (opts.auth && !options.headers.authorization) {
        options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
      }
      req = websocket._req = request(opts);
      if (websocket._redirects) {
        websocket.emit("redirect", websocket.url, req);
      }
    } else {
      req = websocket._req = request(opts);
    }
    if (opts.timeout) {
      req.on("timeout", () => {
        abortHandshake(websocket, req, "Opening handshake has timed out");
      });
    }
    req.on("error", (err) => {
      if (req === null || req[kAborted])
        return;
      req = websocket._req = null;
      emitErrorAndClose(websocket, err);
    });
    req.on("response", (res) => {
      const location = res.headers.location;
      const statusCode = res.statusCode;
      if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
        if (++websocket._redirects > opts.maxRedirects) {
          abortHandshake(websocket, req, "Maximum redirects exceeded");
          return;
        }
        req.abort();
        let addr;
        try {
          addr = new URL2(location, address);
        } catch (e) {
          const err = new SyntaxError(`Invalid URL: ${location}`);
          emitErrorAndClose(websocket, err);
          return;
        }
        initAsClient(websocket, addr, protocols, options);
      } else if (!websocket.emit("unexpected-response", req, res)) {
        abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
      }
    });
    req.on("upgrade", (res, socket, head) => {
      websocket.emit("upgrade", res);
      if (websocket.readyState !== WebSocket2.CONNECTING)
        return;
      req = websocket._req = null;
      const upgrade = res.headers.upgrade;
      if (upgrade === undefined || upgrade.toLowerCase() !== "websocket") {
        abortHandshake(websocket, socket, "Invalid Upgrade header");
        return;
      }
      const digest = createHash("sha1").update(key + GUID).digest("base64");
      if (res.headers["sec-websocket-accept"] !== digest) {
        abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
        return;
      }
      const serverProt = res.headers["sec-websocket-protocol"];
      let protError;
      if (serverProt !== undefined) {
        if (!protocolSet.size) {
          protError = "Server sent a subprotocol but none was requested";
        } else if (!protocolSet.has(serverProt)) {
          protError = "Server sent an invalid subprotocol";
        }
      } else if (protocolSet.size) {
        protError = "Server sent no subprotocol";
      }
      if (protError) {
        abortHandshake(websocket, socket, protError);
        return;
      }
      if (serverProt)
        websocket._protocol = serverProt;
      const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
      if (secWebSocketExtensions !== undefined) {
        if (!perMessageDeflate) {
          const message = "Server sent a Sec-WebSocket-Extensions header but no extension " + "was requested";
          abortHandshake(websocket, socket, message);
          return;
        }
        let extensions;
        try {
          extensions = parse(secWebSocketExtensions);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Extensions header";
          abortHandshake(websocket, socket, message);
          return;
        }
        const extensionNames = Object.keys(extensions);
        if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
          const message = "Server indicated an extension that was not requested";
          abortHandshake(websocket, socket, message);
          return;
        }
        try {
          perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Extensions header";
          abortHandshake(websocket, socket, message);
          return;
        }
        websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
      }
      websocket.setSocket(socket, head, {
        allowSynchronousEvents: opts.allowSynchronousEvents,
        generateMask: opts.generateMask,
        maxPayload: opts.maxPayload,
        skipUTF8Validation: opts.skipUTF8Validation
      });
    });
    if (opts.finishRequest) {
      opts.finishRequest(req, websocket);
    } else {
      req.end();
    }
  }
  function emitErrorAndClose(websocket, err) {
    websocket._readyState = WebSocket2.CLOSING;
    websocket._errorEmitted = true;
    websocket.emit("error", err);
    websocket.emitClose();
  }
  function netConnect(options) {
    options.path = options.socketPath;
    return net.connect(options);
  }
  function tlsConnect(options) {
    options.path = undefined;
    if (!options.servername && options.servername !== "") {
      options.servername = net.isIP(options.host) ? "" : options.host;
    }
    return tls.connect(options);
  }
  function abortHandshake(websocket, stream, message) {
    websocket._readyState = WebSocket2.CLOSING;
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshake);
    if (stream.setHeader) {
      stream[kAborted] = true;
      stream.abort();
      if (stream.socket && !stream.socket.destroyed) {
        stream.socket.destroy();
      }
      process.nextTick(emitErrorAndClose, websocket, err);
    } else {
      stream.destroy(err);
      stream.once("error", websocket.emit.bind(websocket, "error"));
      stream.once("close", websocket.emitClose.bind(websocket));
    }
  }
  function sendAfterClose(websocket, data, cb) {
    if (data) {
      const length = isBlob(data) ? data.size : toBuffer(data).length;
      if (websocket._socket)
        websocket._sender._bufferedBytes += length;
      else
        websocket._bufferedAmount += length;
    }
    if (cb) {
      const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} ` + `(${readyStates[websocket.readyState]})`);
      process.nextTick(cb, err);
    }
  }
  function receiverOnConclude(code, reason) {
    const websocket = this[kWebSocket];
    websocket._closeFrameReceived = true;
    websocket._closeMessage = reason;
    websocket._closeCode = code;
    if (websocket._socket[kWebSocket] === undefined)
      return;
    websocket._socket.removeListener("data", socketOnData);
    process.nextTick(resume, websocket._socket);
    if (code === 1005)
      websocket.close();
    else
      websocket.close(code, reason);
  }
  function receiverOnDrain() {
    const websocket = this[kWebSocket];
    if (!websocket.isPaused)
      websocket._socket.resume();
  }
  function receiverOnError(err) {
    const websocket = this[kWebSocket];
    if (websocket._socket[kWebSocket] !== undefined) {
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      websocket.close(err[kStatusCode]);
    }
    if (!websocket._errorEmitted) {
      websocket._errorEmitted = true;
      websocket.emit("error", err);
    }
  }
  function receiverOnFinish() {
    this[kWebSocket].emitClose();
  }
  function receiverOnMessage(data, isBinary) {
    this[kWebSocket].emit("message", data, isBinary);
  }
  function receiverOnPing(data) {
    const websocket = this[kWebSocket];
    if (websocket._autoPong)
      websocket.pong(data, !this._isServer, NOOP);
    websocket.emit("ping", data);
  }
  function receiverOnPong(data) {
    this[kWebSocket].emit("pong", data);
  }
  function resume(stream) {
    stream.resume();
  }
  function senderOnError(err) {
    const websocket = this[kWebSocket];
    if (websocket.readyState === WebSocket2.CLOSED)
      return;
    if (websocket.readyState === WebSocket2.OPEN) {
      websocket._readyState = WebSocket2.CLOSING;
      setCloseTimer(websocket);
    }
    this._socket.end();
    if (!websocket._errorEmitted) {
      websocket._errorEmitted = true;
      websocket.emit("error", err);
    }
  }
  function setCloseTimer(websocket) {
    websocket._closeTimer = setTimeout(websocket._socket.destroy.bind(websocket._socket), websocket._closeTimeout);
  }
  function socketOnClose() {
    const websocket = this[kWebSocket];
    this.removeListener("close", socketOnClose);
    this.removeListener("data", socketOnData);
    this.removeListener("end", socketOnEnd);
    websocket._readyState = WebSocket2.CLOSING;
    if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
      const chunk = this.read(this._readableState.length);
      websocket._receiver.write(chunk);
    }
    websocket._receiver.end();
    this[kWebSocket] = undefined;
    clearTimeout(websocket._closeTimer);
    if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
      websocket.emitClose();
    } else {
      websocket._receiver.on("error", receiverOnFinish);
      websocket._receiver.on("finish", receiverOnFinish);
    }
  }
  function socketOnData(chunk) {
    if (!this[kWebSocket]._receiver.write(chunk)) {
      this.pause();
    }
  }
  function socketOnEnd() {
    const websocket = this[kWebSocket];
    websocket._readyState = WebSocket2.CLOSING;
    websocket._receiver.end();
    this.end();
  }
  function socketOnError() {
    const websocket = this[kWebSocket];
    this.removeListener("error", socketOnError);
    this.on("error", NOOP);
    if (websocket) {
      websocket._readyState = WebSocket2.CLOSING;
      this.destroy();
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS((exports, module) => {
  var WebSocket2 = require_websocket();
  var { Duplex } = __require("stream");
  function emitClose(stream) {
    stream.emit("close");
  }
  function duplexOnEnd() {
    if (!this.destroyed && this._writableState.finished) {
      this.destroy();
    }
  }
  function duplexOnError(err) {
    this.removeListener("error", duplexOnError);
    this.destroy();
    if (this.listenerCount("error") === 0) {
      this.emit("error", err);
    }
  }
  function createWebSocketStream(ws, options) {
    let terminateOnDestroy = true;
    const duplex = new Duplex({
      ...options,
      autoDestroy: false,
      emitClose: false,
      objectMode: false,
      writableObjectMode: false
    });
    ws.on("message", function message(msg, isBinary) {
      const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
      if (!duplex.push(data))
        ws.pause();
    });
    ws.once("error", function error(err) {
      if (duplex.destroyed)
        return;
      terminateOnDestroy = false;
      duplex.destroy(err);
    });
    ws.once("close", function close() {
      if (duplex.destroyed)
        return;
      duplex.push(null);
    });
    duplex._destroy = function(err, callback) {
      if (ws.readyState === ws.CLOSED) {
        callback(err);
        process.nextTick(emitClose, duplex);
        return;
      }
      let called = false;
      ws.once("error", function error(err2) {
        called = true;
        callback(err2);
      });
      ws.once("close", function close() {
        if (!called)
          callback(err);
        process.nextTick(emitClose, duplex);
      });
      if (terminateOnDestroy)
        ws.terminate();
    };
    duplex._final = function(callback) {
      if (ws.readyState === ws.CONNECTING) {
        ws.once("open", function open() {
          duplex._final(callback);
        });
        return;
      }
      if (ws._socket === null)
        return;
      if (ws._socket._writableState.finished) {
        callback();
        if (duplex._readableState.endEmitted)
          duplex.destroy();
      } else {
        ws._socket.once("finish", function finish() {
          callback();
        });
        ws.close();
      }
    };
    duplex._read = function() {
      if (ws.isPaused)
        ws.resume();
    };
    duplex._write = function(chunk, encoding, callback) {
      if (ws.readyState === ws.CONNECTING) {
        ws.once("open", function open() {
          duplex._write(chunk, encoding, callback);
        });
        return;
      }
      ws.send(chunk, callback);
    };
    duplex.on("end", duplexOnEnd);
    duplex.on("error", duplexOnError);
    return duplex;
  }
  module.exports = createWebSocketStream;
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS((exports, module) => {
  var { tokenChars } = require_validation();
  function parse(header) {
    const protocols = new Set;
    let start = -1;
    let end = -1;
    let i = 0;
    for (i;i < header.length; i++) {
      const code = header.charCodeAt(i);
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1)
          start = i;
      } else if (i !== 0 && (code === 32 || code === 9)) {
        if (end === -1 && start !== -1)
          end = i;
      } else if (code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end === -1)
          end = i;
        const protocol2 = header.slice(start, end);
        if (protocols.has(protocol2)) {
          throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
        }
        protocols.add(protocol2);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
    if (start === -1 || end !== -1) {
      throw new SyntaxError("Unexpected end of input");
    }
    const protocol = header.slice(start, i);
    if (protocols.has(protocol)) {
      throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
    }
    protocols.add(protocol);
    return protocols;
  }
  module.exports = { parse };
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  var http = __require("http");
  var { Duplex } = __require("stream");
  var { createHash } = __require("crypto");
  var extension = require_extension();
  var PerMessageDeflate = require_permessage_deflate();
  var subprotocol = require_subprotocol();
  var WebSocket2 = require_websocket();
  var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
  var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
  var RUNNING = 0;
  var CLOSING = 1;
  var CLOSED = 2;

  class WebSocketServer extends EventEmitter {
    constructor(options, callback) {
      super();
      options = {
        allowSynchronousEvents: true,
        autoPong: true,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: false,
        handleProtocols: null,
        clientTracking: true,
        closeTimeout: CLOSE_TIMEOUT,
        verifyClient: null,
        noServer: false,
        backlog: null,
        server: null,
        host: null,
        path: null,
        port: null,
        WebSocket: WebSocket2,
        ...options
      };
      if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
        throw new TypeError('One and only one of the "port", "server", or "noServer" options ' + "must be specified");
      }
      if (options.port != null) {
        this._server = http.createServer((req, res) => {
          const body = http.STATUS_CODES[426];
          res.writeHead(426, {
            "Content-Length": body.length,
            "Content-Type": "text/plain"
          });
          res.end(body);
        });
        this._server.listen(options.port, options.host, options.backlog, callback);
      } else if (options.server) {
        this._server = options.server;
      }
      if (this._server) {
        const emitConnection = this.emit.bind(this, "connection");
        this._removeListeners = addListeners(this._server, {
          listening: this.emit.bind(this, "listening"),
          error: this.emit.bind(this, "error"),
          upgrade: (req, socket, head) => {
            this.handleUpgrade(req, socket, head, emitConnection);
          }
        });
      }
      if (options.perMessageDeflate === true)
        options.perMessageDeflate = {};
      if (options.clientTracking) {
        this.clients = new Set;
        this._shouldEmitClose = false;
      }
      this.options = options;
      this._state = RUNNING;
    }
    address() {
      if (this.options.noServer) {
        throw new Error('The server is operating in "noServer" mode');
      }
      if (!this._server)
        return null;
      return this._server.address();
    }
    close(cb) {
      if (this._state === CLOSED) {
        if (cb) {
          this.once("close", () => {
            cb(new Error("The server is not running"));
          });
        }
        process.nextTick(emitClose, this);
        return;
      }
      if (cb)
        this.once("close", cb);
      if (this._state === CLOSING)
        return;
      this._state = CLOSING;
      if (this.options.noServer || this.options.server) {
        if (this._server) {
          this._removeListeners();
          this._removeListeners = this._server = null;
        }
        if (this.clients) {
          if (!this.clients.size) {
            process.nextTick(emitClose, this);
          } else {
            this._shouldEmitClose = true;
          }
        } else {
          process.nextTick(emitClose, this);
        }
      } else {
        const server = this._server;
        this._removeListeners();
        this._removeListeners = this._server = null;
        server.close(() => {
          emitClose(this);
        });
      }
    }
    shouldHandle(req) {
      if (this.options.path) {
        const index = req.url.indexOf("?");
        const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
        if (pathname !== this.options.path)
          return false;
      }
      return true;
    }
    handleUpgrade(req, socket, head, cb) {
      socket.on("error", socketOnError);
      const key = req.headers["sec-websocket-key"];
      const upgrade = req.headers.upgrade;
      const version = +req.headers["sec-websocket-version"];
      if (req.method !== "GET") {
        const message = "Invalid HTTP method";
        abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
        return;
      }
      if (upgrade === undefined || upgrade.toLowerCase() !== "websocket") {
        const message = "Invalid Upgrade header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
      if (key === undefined || !keyRegex.test(key)) {
        const message = "Missing or invalid Sec-WebSocket-Key header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
      if (version !== 13 && version !== 8) {
        const message = "Missing or invalid Sec-WebSocket-Version header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
          "Sec-WebSocket-Version": "13, 8"
        });
        return;
      }
      if (!this.shouldHandle(req)) {
        abortHandshake(socket, 400);
        return;
      }
      const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
      let protocols = new Set;
      if (secWebSocketProtocol !== undefined) {
        try {
          protocols = subprotocol.parse(secWebSocketProtocol);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Protocol header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
      }
      const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
      const extensions = {};
      if (this.options.perMessageDeflate && secWebSocketExtensions !== undefined) {
        const perMessageDeflate = new PerMessageDeflate({
          ...this.options.perMessageDeflate,
          isServer: true,
          maxPayload: this.options.maxPayload
        });
        try {
          const offers = extension.parse(secWebSocketExtensions);
          if (offers[PerMessageDeflate.extensionName]) {
            perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
            extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
          }
        } catch (err) {
          const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
      }
      if (this.options.verifyClient) {
        const info = {
          origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
          secure: !!(req.socket.authorized || req.socket.encrypted),
          req
        };
        if (this.options.verifyClient.length === 2) {
          this.options.verifyClient(info, (verified, code, message, headers) => {
            if (!verified) {
              return abortHandshake(socket, code || 401, message, headers);
            }
            this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
          });
          return;
        }
        if (!this.options.verifyClient(info))
          return abortHandshake(socket, 401);
      }
      this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
    }
    completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
      if (!socket.readable || !socket.writable)
        return socket.destroy();
      if (socket[kWebSocket]) {
        throw new Error("server.handleUpgrade() was called more than once with the same " + "socket, possibly due to a misconfiguration");
      }
      if (this._state > RUNNING)
        return abortHandshake(socket, 503);
      const digest = createHash("sha1").update(key + GUID).digest("base64");
      const headers = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${digest}`
      ];
      const ws = new this.options.WebSocket(null, undefined, this.options);
      if (protocols.size) {
        const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
        if (protocol) {
          headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
          ws._protocol = protocol;
        }
      }
      if (extensions[PerMessageDeflate.extensionName]) {
        const params = extensions[PerMessageDeflate.extensionName].params;
        const value = extension.format({
          [PerMessageDeflate.extensionName]: [params]
        });
        headers.push(`Sec-WebSocket-Extensions: ${value}`);
        ws._extensions = extensions;
      }
      this.emit("headers", headers, req);
      socket.write(headers.concat(`\r
`).join(`\r
`));
      socket.removeListener("error", socketOnError);
      ws.setSocket(socket, head, {
        allowSynchronousEvents: this.options.allowSynchronousEvents,
        maxPayload: this.options.maxPayload,
        skipUTF8Validation: this.options.skipUTF8Validation
      });
      if (this.clients) {
        this.clients.add(ws);
        ws.on("close", () => {
          this.clients.delete(ws);
          if (this._shouldEmitClose && !this.clients.size) {
            process.nextTick(emitClose, this);
          }
        });
      }
      cb(ws, req);
    }
  }
  module.exports = WebSocketServer;
  function addListeners(server, map) {
    for (const event of Object.keys(map))
      server.on(event, map[event]);
    return function removeListeners() {
      for (const event of Object.keys(map)) {
        server.removeListener(event, map[event]);
      }
    };
  }
  function emitClose(server) {
    server._state = CLOSED;
    server.emit("close");
  }
  function socketOnError() {
    this.destroy();
  }
  function abortHandshake(socket, code, message, headers) {
    message = message || http.STATUS_CODES[code];
    headers = {
      Connection: "close",
      "Content-Type": "text/html",
      "Content-Length": Buffer.byteLength(message),
      ...headers
    };
    socket.once("finish", socket.destroy);
    socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join(`\r
`) + `\r
\r
` + message);
  }
  function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
    if (server.listenerCount("wsClientError")) {
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
      server.emit("wsClientError", err, socket, req);
    } else {
      abortHandshake(socket, code, message, headers);
    }
  }
});

// node_modules/ws/index.js
var require_ws = __commonJS((exports, module) => {
  var createWebSocketStream = require_stream();
  var extension = require_extension();
  var PerMessageDeflate = require_permessage_deflate();
  var Receiver = require_receiver();
  var Sender = require_sender();
  var subprotocol = require_subprotocol();
  var WebSocket2 = require_websocket();
  var WebSocketServer = require_websocket_server();
  WebSocket2.createWebSocketStream = createWebSocketStream;
  WebSocket2.extension = extension;
  WebSocket2.PerMessageDeflate = PerMessageDeflate;
  WebSocket2.Receiver = Receiver;
  WebSocket2.Sender = Sender;
  WebSocket2.Server = WebSocketServer;
  WebSocket2.subprotocol = subprotocol;
  WebSocket2.WebSocket = WebSocket2;
  WebSocket2.WebSocketServer = WebSocketServer;
  module.exports = WebSocket2;
});

// node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// node_modules/axios/lib/utils.js
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
function getGlobal() {
  if (typeof globalThis !== "undefined")
    return globalThis;
  if (typeof self !== "undefined")
    return self;
  if (typeof window !== "undefined")
    return window;
  if (typeof global !== "undefined")
    return global;
  return {};
}
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length;i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0;i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return;
    }
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length;i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
var toString, getPrototypeOf, iterator, toStringTag, kindOf, kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
}, typeOfTest = (type) => (thing) => typeof thing === type, isArray, isUndefined, isArrayBuffer, isString, isFunction, isNumber, isObject = (thing) => thing !== null && typeof thing === "object", isBoolean = (thing) => thing === true || thing === false, isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype = getPrototypeOf(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(toStringTag in val) && !(iterator in val);
}, isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
}, isDate, isFile, isReactNativeBlob = (value) => {
  return !!(value && typeof value.uri !== "undefined");
}, isReactNative = (formData) => formData && typeof formData.getParts !== "undefined", isBlob, isFileList, isStream = (val) => isObject(val) && isFunction(val.pipe), G, FormDataCtor, isFormData = (thing) => {
  let kind;
  return thing && (FormDataCtor && thing instanceof FormDataCtor || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
}, isURLSearchParams, isReadableStream, isRequest, isResponse, isHeaders, trim = (str) => {
  return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}, _global, isContextDefined = (context) => !isUndefined(context) && context !== _global, extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      Object.defineProperty(a, key, {
        value: bind(val, thisArg),
        writable: true,
        enumerable: true,
        configurable: true
      });
    } else {
      Object.defineProperty(a, key, {
        value: val,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
  }, { allOwnKeys });
  return a;
}, stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
}, inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  Object.defineProperty(constructor.prototype, "constructor", {
    value: constructor,
    writable: true,
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
}, toFlatObject = (sourceObj, destObj, filter, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null)
    return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
}, endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}, toArray = (thing) => {
  if (!thing)
    return null;
  if (isArray(thing))
    return thing;
  let i = thing.length;
  if (!isNumber(i))
    return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
}, isTypedArray, forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
}, matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
}, isHTMLForm, toCamelCase = (str) => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
    return p1.toUpperCase() + p2;
  });
}, hasOwnProperty, isRegExp, reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
}, freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value))
      return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
}, toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
}, noop = () => {}, toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
}, toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = undefined;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
}, isAsyncFn, isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch), _setImmediate, asap, isIterable = (thing) => thing != null && isFunction(thing[iterator]), utils_default;
var init_utils = __esm(() => {
  ({ toString } = Object.prototype);
  ({ getPrototypeOf } = Object);
  ({ iterator, toStringTag } = Symbol);
  kindOf = ((cache) => (thing) => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(Object.create(null));
  ({ isArray } = Array);
  isUndefined = typeOfTest("undefined");
  isArrayBuffer = kindOfTest("ArrayBuffer");
  isString = typeOfTest("string");
  isFunction = typeOfTest("function");
  isNumber = typeOfTest("number");
  isDate = kindOfTest("Date");
  isFile = kindOfTest("File");
  isBlob = kindOfTest("Blob");
  isFileList = kindOfTest("FileList");
  G = getGlobal();
  FormDataCtor = typeof G.FormData !== "undefined" ? G.FormData : undefined;
  isURLSearchParams = kindOfTest("URLSearchParams");
  [isReadableStream, isRequest, isResponse, isHeaders] = [
    "ReadableStream",
    "Request",
    "Response",
    "Headers"
  ].map(kindOfTest);
  _global = (() => {
    if (typeof globalThis !== "undefined")
      return globalThis;
    return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
  })();
  isTypedArray = ((TypedArray) => {
    return (thing) => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
  isHTMLForm = kindOfTest("HTMLFormElement");
  hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
  isRegExp = kindOfTest("RegExp");
  isAsyncFn = kindOfTest("AsyncFunction");
  _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }
    return postMessageSupported ? ((token, callbacks) => {
      _global.addEventListener("message", ({ source, data }) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      }, false);
      return (cb) => {
        callbacks.push(cb);
        _global.postMessage(token, "*");
      };
    })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
  })(typeof setImmediate === "function", isFunction(_global.postMessage));
  asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
  utils_default = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isEmptyObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isReactNativeBlob,
    isReactNative,
    isBlob,
    isRegExp,
    isFunction,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty,
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap,
    isIterable
  };
});

// node_modules/axios/lib/core/AxiosError.js
var AxiosError, AxiosError_default;
var init_AxiosError = __esm(() => {
  init_utils();
  AxiosError = class AxiosError extends Error {
    static from(error, code, config, request, response, customProps) {
      const axiosError = new AxiosError(error.message, code || error.code, config, request, response);
      axiosError.cause = error;
      axiosError.name = error.name;
      if (error.status != null && axiosError.status == null) {
        axiosError.status = error.status;
      }
      customProps && Object.assign(axiosError, customProps);
      return axiosError;
    }
    constructor(message, code, config, request, response) {
      super(message);
      Object.defineProperty(this, "message", {
        value: message,
        enumerable: true,
        writable: true,
        configurable: true
      });
      this.name = "AxiosError";
      this.isAxiosError = true;
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      if (response) {
        this.response = response;
        this.status = response.status;
      }
    }
    toJSON() {
      return {
        message: this.message,
        name: this.name,
        description: this.description,
        number: this.number,
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        config: utils_default.toJSONObject(this.config),
        code: this.code,
        status: this.status
      };
    }
  };
  AxiosError.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
  AxiosError.ERR_BAD_OPTION = "ERR_BAD_OPTION";
  AxiosError.ECONNABORTED = "ECONNABORTED";
  AxiosError.ETIMEDOUT = "ETIMEDOUT";
  AxiosError.ERR_NETWORK = "ERR_NETWORK";
  AxiosError.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
  AxiosError.ERR_DEPRECATED = "ERR_DEPRECATED";
  AxiosError.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
  AxiosError.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
  AxiosError.ERR_CANCELED = "ERR_CANCELED";
  AxiosError.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
  AxiosError.ERR_INVALID_URL = "ERR_INVALID_URL";
  AxiosError_default = AxiosError;
});

// node_modules/delayed-stream/lib/delayed_stream.js
var require_delayed_stream = __commonJS((exports, module) => {
  var Stream = __require("stream").Stream;
  var util = __require("util");
  module.exports = DelayedStream;
  function DelayedStream() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
  }
  util.inherits(DelayedStream, Stream);
  DelayedStream.create = function(source, options) {
    var delayedStream = new this;
    options = options || {};
    for (var option in options) {
      delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
      delayedStream._handleEmit(arguments);
      return realEmit.apply(source, arguments);
    };
    source.on("error", function() {});
    if (delayedStream.pauseStream) {
      source.pause();
    }
    return delayedStream;
  };
  Object.defineProperty(DelayedStream.prototype, "readable", {
    configurable: true,
    enumerable: true,
    get: function() {
      return this.source.readable;
    }
  });
  DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
  };
  DelayedStream.prototype.resume = function() {
    if (!this._released) {
      this.release();
    }
    this.source.resume();
  };
  DelayedStream.prototype.pause = function() {
    this.source.pause();
  };
  DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach(function(args) {
      this.emit.apply(this, args);
    }.bind(this));
    this._bufferedEvents = [];
  };
  DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
  };
  DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
      this.emit.apply(this, args);
      return;
    }
    if (args[0] === "data") {
      this.dataSize += args[1].length;
      this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
  };
  DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
      return;
    }
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    this._maxDataSizeExceeded = true;
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this.emit("error", new Error(message));
  };
});

// node_modules/combined-stream/lib/combined_stream.js
var require_combined_stream = __commonJS((exports, module) => {
  var util = __require("util");
  var Stream = __require("stream").Stream;
  var DelayedStream = require_delayed_stream();
  module.exports = CombinedStream;
  function CombinedStream() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
  }
  util.inherits(CombinedStream, Stream);
  CombinedStream.create = function(options) {
    var combinedStream = new this;
    options = options || {};
    for (var option in options) {
      combinedStream[option] = options[option];
    }
    return combinedStream;
  };
  CombinedStream.isStreamLike = function(stream) {
    return typeof stream !== "function" && typeof stream !== "string" && typeof stream !== "boolean" && typeof stream !== "number" && !Buffer.isBuffer(stream);
  };
  CombinedStream.prototype.append = function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      if (!(stream instanceof DelayedStream)) {
        var newStream = DelayedStream.create(stream, {
          maxDataSize: Infinity,
          pauseStream: this.pauseStreams
        });
        stream.on("data", this._checkDataSize.bind(this));
        stream = newStream;
      }
      this._handleErrors(stream);
      if (this.pauseStreams) {
        stream.pause();
      }
    }
    this._streams.push(stream);
    return this;
  };
  CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
  };
  CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
      this._pendingNext = true;
      return;
    }
    this._insideLoop = true;
    try {
      do {
        this._pendingNext = false;
        this._realGetNext();
      } while (this._pendingNext);
    } finally {
      this._insideLoop = false;
    }
  };
  CombinedStream.prototype._realGetNext = function() {
    var stream = this._streams.shift();
    if (typeof stream == "undefined") {
      this.end();
      return;
    }
    if (typeof stream !== "function") {
      this._pipeNext(stream);
      return;
    }
    var getStream = stream;
    getStream(function(stream2) {
      var isStreamLike = CombinedStream.isStreamLike(stream2);
      if (isStreamLike) {
        stream2.on("data", this._checkDataSize.bind(this));
        this._handleErrors(stream2);
      }
      this._pipeNext(stream2);
    }.bind(this));
  };
  CombinedStream.prototype._pipeNext = function(stream) {
    this._currentStream = stream;
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      stream.on("end", this._getNext.bind(this));
      stream.pipe(this, { end: false });
      return;
    }
    var value = stream;
    this.write(value);
    this._getNext();
  };
  CombinedStream.prototype._handleErrors = function(stream) {
    var self2 = this;
    stream.on("error", function(err) {
      self2._emitError(err);
    });
  };
  CombinedStream.prototype.write = function(data) {
    this.emit("data", data);
  };
  CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
      return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function")
      this._currentStream.pause();
    this.emit("pause");
  };
  CombinedStream.prototype.resume = function() {
    if (!this._released) {
      this._released = true;
      this.writable = true;
      this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function")
      this._currentStream.resume();
    this.emit("resume");
  };
  CombinedStream.prototype.end = function() {
    this._reset();
    this.emit("end");
  };
  CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit("close");
  };
  CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
  };
  CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this._emitError(new Error(message));
  };
  CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self2 = this;
    this._streams.forEach(function(stream) {
      if (!stream.dataSize) {
        return;
      }
      self2.dataSize += stream.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
      this.dataSize += this._currentStream.dataSize;
    }
  };
  CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit("error", err);
  };
});

// node_modules/mime-db/db.json
var require_db = __commonJS((exports, module) => {
  module.exports = {
    "application/1d-interleaved-parityfec": {
      source: "iana"
    },
    "application/3gpdash-qoe-report+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/3gpp-ims+xml": {
      source: "iana",
      compressible: true
    },
    "application/3gpphal+json": {
      source: "iana",
      compressible: true
    },
    "application/3gpphalforms+json": {
      source: "iana",
      compressible: true
    },
    "application/a2l": {
      source: "iana"
    },
    "application/ace+cbor": {
      source: "iana"
    },
    "application/activemessage": {
      source: "iana"
    },
    "application/activity+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-directory+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcost+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcostparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointprop+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointpropparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-error+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamcontrol+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamparams+json": {
      source: "iana",
      compressible: true
    },
    "application/aml": {
      source: "iana"
    },
    "application/andrew-inset": {
      source: "iana",
      extensions: ["ez"]
    },
    "application/applefile": {
      source: "iana"
    },
    "application/applixware": {
      source: "apache",
      extensions: ["aw"]
    },
    "application/at+jwt": {
      source: "iana"
    },
    "application/atf": {
      source: "iana"
    },
    "application/atfx": {
      source: "iana"
    },
    "application/atom+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atom"]
    },
    "application/atomcat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomcat"]
    },
    "application/atomdeleted+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomdeleted"]
    },
    "application/atomicmail": {
      source: "iana"
    },
    "application/atomsvc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomsvc"]
    },
    "application/atsc-dwd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dwd"]
    },
    "application/atsc-dynamic-event-message": {
      source: "iana"
    },
    "application/atsc-held+xml": {
      source: "iana",
      compressible: true,
      extensions: ["held"]
    },
    "application/atsc-rdt+json": {
      source: "iana",
      compressible: true
    },
    "application/atsc-rsat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsat"]
    },
    "application/atxml": {
      source: "iana"
    },
    "application/auth-policy+xml": {
      source: "iana",
      compressible: true
    },
    "application/bacnet-xdd+zip": {
      source: "iana",
      compressible: false
    },
    "application/batch-smtp": {
      source: "iana"
    },
    "application/bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/beep+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/calendar+json": {
      source: "iana",
      compressible: true
    },
    "application/calendar+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xcs"]
    },
    "application/call-completion": {
      source: "iana"
    },
    "application/cals-1840": {
      source: "iana"
    },
    "application/captive+json": {
      source: "iana",
      compressible: true
    },
    "application/cbor": {
      source: "iana"
    },
    "application/cbor-seq": {
      source: "iana"
    },
    "application/cccex": {
      source: "iana"
    },
    "application/ccmp+xml": {
      source: "iana",
      compressible: true
    },
    "application/ccxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ccxml"]
    },
    "application/cdfx+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdfx"]
    },
    "application/cdmi-capability": {
      source: "iana",
      extensions: ["cdmia"]
    },
    "application/cdmi-container": {
      source: "iana",
      extensions: ["cdmic"]
    },
    "application/cdmi-domain": {
      source: "iana",
      extensions: ["cdmid"]
    },
    "application/cdmi-object": {
      source: "iana",
      extensions: ["cdmio"]
    },
    "application/cdmi-queue": {
      source: "iana",
      extensions: ["cdmiq"]
    },
    "application/cdni": {
      source: "iana"
    },
    "application/cea": {
      source: "iana"
    },
    "application/cea-2018+xml": {
      source: "iana",
      compressible: true
    },
    "application/cellml+xml": {
      source: "iana",
      compressible: true
    },
    "application/cfw": {
      source: "iana"
    },
    "application/city+json": {
      source: "iana",
      compressible: true
    },
    "application/clr": {
      source: "iana"
    },
    "application/clue+xml": {
      source: "iana",
      compressible: true
    },
    "application/clue_info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cms": {
      source: "iana"
    },
    "application/cnrp+xml": {
      source: "iana",
      compressible: true
    },
    "application/coap-group+json": {
      source: "iana",
      compressible: true
    },
    "application/coap-payload": {
      source: "iana"
    },
    "application/commonground": {
      source: "iana"
    },
    "application/conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cose": {
      source: "iana"
    },
    "application/cose-key": {
      source: "iana"
    },
    "application/cose-key-set": {
      source: "iana"
    },
    "application/cpl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cpl"]
    },
    "application/csrattrs": {
      source: "iana"
    },
    "application/csta+xml": {
      source: "iana",
      compressible: true
    },
    "application/cstadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/csvm+json": {
      source: "iana",
      compressible: true
    },
    "application/cu-seeme": {
      source: "apache",
      extensions: ["cu"]
    },
    "application/cwt": {
      source: "iana"
    },
    "application/cybercash": {
      source: "iana"
    },
    "application/dart": {
      compressible: true
    },
    "application/dash+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpd"]
    },
    "application/dash-patch+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpp"]
    },
    "application/dashdelta": {
      source: "iana"
    },
    "application/davmount+xml": {
      source: "iana",
      compressible: true,
      extensions: ["davmount"]
    },
    "application/dca-rft": {
      source: "iana"
    },
    "application/dcd": {
      source: "iana"
    },
    "application/dec-dx": {
      source: "iana"
    },
    "application/dialog-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/dicom": {
      source: "iana"
    },
    "application/dicom+json": {
      source: "iana",
      compressible: true
    },
    "application/dicom+xml": {
      source: "iana",
      compressible: true
    },
    "application/dii": {
      source: "iana"
    },
    "application/dit": {
      source: "iana"
    },
    "application/dns": {
      source: "iana"
    },
    "application/dns+json": {
      source: "iana",
      compressible: true
    },
    "application/dns-message": {
      source: "iana"
    },
    "application/docbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dbk"]
    },
    "application/dots+cbor": {
      source: "iana"
    },
    "application/dskpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/dssc+der": {
      source: "iana",
      extensions: ["dssc"]
    },
    "application/dssc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdssc"]
    },
    "application/dvcs": {
      source: "iana"
    },
    "application/ecmascript": {
      source: "iana",
      compressible: true,
      extensions: ["es", "ecma"]
    },
    "application/edi-consent": {
      source: "iana"
    },
    "application/edi-x12": {
      source: "iana",
      compressible: false
    },
    "application/edifact": {
      source: "iana",
      compressible: false
    },
    "application/efi": {
      source: "iana"
    },
    "application/elm+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/elm+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.cap+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/emergencycalldata.comment+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.control+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.deviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.ecall.msd": {
      source: "iana"
    },
    "application/emergencycalldata.providerinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.serviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.subscriberinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.veds+xml": {
      source: "iana",
      compressible: true
    },
    "application/emma+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emma"]
    },
    "application/emotionml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emotionml"]
    },
    "application/encaprtp": {
      source: "iana"
    },
    "application/epp+xml": {
      source: "iana",
      compressible: true
    },
    "application/epub+zip": {
      source: "iana",
      compressible: false,
      extensions: ["epub"]
    },
    "application/eshop": {
      source: "iana"
    },
    "application/exi": {
      source: "iana",
      extensions: ["exi"]
    },
    "application/expect-ct-report+json": {
      source: "iana",
      compressible: true
    },
    "application/express": {
      source: "iana",
      extensions: ["exp"]
    },
    "application/fastinfoset": {
      source: "iana"
    },
    "application/fastsoap": {
      source: "iana"
    },
    "application/fdt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fdt"]
    },
    "application/fhir+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fhir+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fido.trusted-apps+json": {
      compressible: true
    },
    "application/fits": {
      source: "iana"
    },
    "application/flexfec": {
      source: "iana"
    },
    "application/font-sfnt": {
      source: "iana"
    },
    "application/font-tdpfr": {
      source: "iana",
      extensions: ["pfr"]
    },
    "application/font-woff": {
      source: "iana",
      compressible: false
    },
    "application/framework-attributes+xml": {
      source: "iana",
      compressible: true
    },
    "application/geo+json": {
      source: "iana",
      compressible: true,
      extensions: ["geojson"]
    },
    "application/geo+json-seq": {
      source: "iana"
    },
    "application/geopackage+sqlite3": {
      source: "iana"
    },
    "application/geoxacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/gltf-buffer": {
      source: "iana"
    },
    "application/gml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["gml"]
    },
    "application/gpx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["gpx"]
    },
    "application/gxf": {
      source: "apache",
      extensions: ["gxf"]
    },
    "application/gzip": {
      source: "iana",
      compressible: false,
      extensions: ["gz"]
    },
    "application/h224": {
      source: "iana"
    },
    "application/held+xml": {
      source: "iana",
      compressible: true
    },
    "application/hjson": {
      extensions: ["hjson"]
    },
    "application/http": {
      source: "iana"
    },
    "application/hyperstudio": {
      source: "iana",
      extensions: ["stk"]
    },
    "application/ibe-key-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pkg-reply+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pp-data": {
      source: "iana"
    },
    "application/iges": {
      source: "iana"
    },
    "application/im-iscomposing+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/index": {
      source: "iana"
    },
    "application/index.cmd": {
      source: "iana"
    },
    "application/index.obj": {
      source: "iana"
    },
    "application/index.response": {
      source: "iana"
    },
    "application/index.vnd": {
      source: "iana"
    },
    "application/inkml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ink", "inkml"]
    },
    "application/iotp": {
      source: "iana"
    },
    "application/ipfix": {
      source: "iana",
      extensions: ["ipfix"]
    },
    "application/ipp": {
      source: "iana"
    },
    "application/isup": {
      source: "iana"
    },
    "application/its+xml": {
      source: "iana",
      compressible: true,
      extensions: ["its"]
    },
    "application/java-archive": {
      source: "apache",
      compressible: false,
      extensions: ["jar", "war", "ear"]
    },
    "application/java-serialized-object": {
      source: "apache",
      compressible: false,
      extensions: ["ser"]
    },
    "application/java-vm": {
      source: "apache",
      compressible: false,
      extensions: ["class"]
    },
    "application/javascript": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["js", "mjs"]
    },
    "application/jf2feed+json": {
      source: "iana",
      compressible: true
    },
    "application/jose": {
      source: "iana"
    },
    "application/jose+json": {
      source: "iana",
      compressible: true
    },
    "application/jrd+json": {
      source: "iana",
      compressible: true
    },
    "application/jscalendar+json": {
      source: "iana",
      compressible: true
    },
    "application/json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["json", "map"]
    },
    "application/json-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/json-seq": {
      source: "iana"
    },
    "application/json5": {
      extensions: ["json5"]
    },
    "application/jsonml+json": {
      source: "apache",
      compressible: true,
      extensions: ["jsonml"]
    },
    "application/jwk+json": {
      source: "iana",
      compressible: true
    },
    "application/jwk-set+json": {
      source: "iana",
      compressible: true
    },
    "application/jwt": {
      source: "iana"
    },
    "application/kpml-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/kpml-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/ld+json": {
      source: "iana",
      compressible: true,
      extensions: ["jsonld"]
    },
    "application/lgr+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lgr"]
    },
    "application/link-format": {
      source: "iana"
    },
    "application/load-control+xml": {
      source: "iana",
      compressible: true
    },
    "application/lost+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lostxml"]
    },
    "application/lostsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/lpf+zip": {
      source: "iana",
      compressible: false
    },
    "application/lxf": {
      source: "iana"
    },
    "application/mac-binhex40": {
      source: "iana",
      extensions: ["hqx"]
    },
    "application/mac-compactpro": {
      source: "apache",
      extensions: ["cpt"]
    },
    "application/macwriteii": {
      source: "iana"
    },
    "application/mads+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mads"]
    },
    "application/manifest+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["webmanifest"]
    },
    "application/marc": {
      source: "iana",
      extensions: ["mrc"]
    },
    "application/marcxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mrcx"]
    },
    "application/mathematica": {
      source: "iana",
      extensions: ["ma", "nb", "mb"]
    },
    "application/mathml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mathml"]
    },
    "application/mathml-content+xml": {
      source: "iana",
      compressible: true
    },
    "application/mathml-presentation+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-associated-procedure-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-deregister+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-envelope+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-protection-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-reception-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-schedule+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-user-service-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbox": {
      source: "iana",
      extensions: ["mbox"]
    },
    "application/media-policy-dataset+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpf"]
    },
    "application/media_control+xml": {
      source: "iana",
      compressible: true
    },
    "application/mediaservercontrol+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mscml"]
    },
    "application/merge-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/metalink+xml": {
      source: "apache",
      compressible: true,
      extensions: ["metalink"]
    },
    "application/metalink4+xml": {
      source: "iana",
      compressible: true,
      extensions: ["meta4"]
    },
    "application/mets+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mets"]
    },
    "application/mf4": {
      source: "iana"
    },
    "application/mikey": {
      source: "iana"
    },
    "application/mipc": {
      source: "iana"
    },
    "application/missing-blocks+cbor-seq": {
      source: "iana"
    },
    "application/mmt-aei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["maei"]
    },
    "application/mmt-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musd"]
    },
    "application/mods+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mods"]
    },
    "application/moss-keys": {
      source: "iana"
    },
    "application/moss-signature": {
      source: "iana"
    },
    "application/mosskey-data": {
      source: "iana"
    },
    "application/mosskey-request": {
      source: "iana"
    },
    "application/mp21": {
      source: "iana",
      extensions: ["m21", "mp21"]
    },
    "application/mp4": {
      source: "iana",
      extensions: ["mp4s", "m4p"]
    },
    "application/mpeg4-generic": {
      source: "iana"
    },
    "application/mpeg4-iod": {
      source: "iana"
    },
    "application/mpeg4-iod-xmt": {
      source: "iana"
    },
    "application/mrb-consumer+xml": {
      source: "iana",
      compressible: true
    },
    "application/mrb-publish+xml": {
      source: "iana",
      compressible: true
    },
    "application/msc-ivr+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msc-mixer+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msword": {
      source: "iana",
      compressible: false,
      extensions: ["doc", "dot"]
    },
    "application/mud+json": {
      source: "iana",
      compressible: true
    },
    "application/multipart-core": {
      source: "iana"
    },
    "application/mxf": {
      source: "iana",
      extensions: ["mxf"]
    },
    "application/n-quads": {
      source: "iana",
      extensions: ["nq"]
    },
    "application/n-triples": {
      source: "iana",
      extensions: ["nt"]
    },
    "application/nasdata": {
      source: "iana"
    },
    "application/news-checkgroups": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-groupinfo": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-transmission": {
      source: "iana"
    },
    "application/nlsml+xml": {
      source: "iana",
      compressible: true
    },
    "application/node": {
      source: "iana",
      extensions: ["cjs"]
    },
    "application/nss": {
      source: "iana"
    },
    "application/oauth-authz-req+jwt": {
      source: "iana"
    },
    "application/oblivious-dns-message": {
      source: "iana"
    },
    "application/ocsp-request": {
      source: "iana"
    },
    "application/ocsp-response": {
      source: "iana"
    },
    "application/octet-stream": {
      source: "iana",
      compressible: false,
      extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
    },
    "application/oda": {
      source: "iana",
      extensions: ["oda"]
    },
    "application/odm+xml": {
      source: "iana",
      compressible: true
    },
    "application/odx": {
      source: "iana"
    },
    "application/oebps-package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["opf"]
    },
    "application/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogx"]
    },
    "application/omdoc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["omdoc"]
    },
    "application/onenote": {
      source: "apache",
      extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
    },
    "application/opc-nodeset+xml": {
      source: "iana",
      compressible: true
    },
    "application/oscore": {
      source: "iana"
    },
    "application/oxps": {
      source: "iana",
      extensions: ["oxps"]
    },
    "application/p21": {
      source: "iana"
    },
    "application/p21+zip": {
      source: "iana",
      compressible: false
    },
    "application/p2p-overlay+xml": {
      source: "iana",
      compressible: true,
      extensions: ["relo"]
    },
    "application/parityfec": {
      source: "iana"
    },
    "application/passport": {
      source: "iana"
    },
    "application/patch-ops-error+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xer"]
    },
    "application/pdf": {
      source: "iana",
      compressible: false,
      extensions: ["pdf"]
    },
    "application/pdx": {
      source: "iana"
    },
    "application/pem-certificate-chain": {
      source: "iana"
    },
    "application/pgp-encrypted": {
      source: "iana",
      compressible: false,
      extensions: ["pgp"]
    },
    "application/pgp-keys": {
      source: "iana",
      extensions: ["asc"]
    },
    "application/pgp-signature": {
      source: "iana",
      extensions: ["asc", "sig"]
    },
    "application/pics-rules": {
      source: "apache",
      extensions: ["prf"]
    },
    "application/pidf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pidf-diff+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pkcs10": {
      source: "iana",
      extensions: ["p10"]
    },
    "application/pkcs12": {
      source: "iana"
    },
    "application/pkcs7-mime": {
      source: "iana",
      extensions: ["p7m", "p7c"]
    },
    "application/pkcs7-signature": {
      source: "iana",
      extensions: ["p7s"]
    },
    "application/pkcs8": {
      source: "iana",
      extensions: ["p8"]
    },
    "application/pkcs8-encrypted": {
      source: "iana"
    },
    "application/pkix-attr-cert": {
      source: "iana",
      extensions: ["ac"]
    },
    "application/pkix-cert": {
      source: "iana",
      extensions: ["cer"]
    },
    "application/pkix-crl": {
      source: "iana",
      extensions: ["crl"]
    },
    "application/pkix-pkipath": {
      source: "iana",
      extensions: ["pkipath"]
    },
    "application/pkixcmp": {
      source: "iana",
      extensions: ["pki"]
    },
    "application/pls+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pls"]
    },
    "application/poc-settings+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/postscript": {
      source: "iana",
      compressible: true,
      extensions: ["ai", "eps", "ps"]
    },
    "application/ppsp-tracker+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+xml": {
      source: "iana",
      compressible: true
    },
    "application/provenance+xml": {
      source: "iana",
      compressible: true,
      extensions: ["provx"]
    },
    "application/prs.alvestrand.titrax-sheet": {
      source: "iana"
    },
    "application/prs.cww": {
      source: "iana",
      extensions: ["cww"]
    },
    "application/prs.cyn": {
      source: "iana",
      charset: "7-BIT"
    },
    "application/prs.hpub+zip": {
      source: "iana",
      compressible: false
    },
    "application/prs.nprend": {
      source: "iana"
    },
    "application/prs.plucker": {
      source: "iana"
    },
    "application/prs.rdf-xml-crypt": {
      source: "iana"
    },
    "application/prs.xsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/pskc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pskcxml"]
    },
    "application/pvd+json": {
      source: "iana",
      compressible: true
    },
    "application/qsig": {
      source: "iana"
    },
    "application/raml+yaml": {
      compressible: true,
      extensions: ["raml"]
    },
    "application/raptorfec": {
      source: "iana"
    },
    "application/rdap+json": {
      source: "iana",
      compressible: true
    },
    "application/rdf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rdf", "owl"]
    },
    "application/reginfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rif"]
    },
    "application/relax-ng-compact-syntax": {
      source: "iana",
      extensions: ["rnc"]
    },
    "application/remote-printing": {
      source: "iana"
    },
    "application/reputon+json": {
      source: "iana",
      compressible: true
    },
    "application/resource-lists+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rl"]
    },
    "application/resource-lists-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rld"]
    },
    "application/rfc+xml": {
      source: "iana",
      compressible: true
    },
    "application/riscos": {
      source: "iana"
    },
    "application/rlmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/rls-services+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rs"]
    },
    "application/route-apd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rapd"]
    },
    "application/route-s-tsid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sls"]
    },
    "application/route-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rusd"]
    },
    "application/rpki-ghostbusters": {
      source: "iana",
      extensions: ["gbr"]
    },
    "application/rpki-manifest": {
      source: "iana",
      extensions: ["mft"]
    },
    "application/rpki-publication": {
      source: "iana"
    },
    "application/rpki-roa": {
      source: "iana",
      extensions: ["roa"]
    },
    "application/rpki-updown": {
      source: "iana"
    },
    "application/rsd+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rsd"]
    },
    "application/rss+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rss"]
    },
    "application/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "application/rtploopback": {
      source: "iana"
    },
    "application/rtx": {
      source: "iana"
    },
    "application/samlassertion+xml": {
      source: "iana",
      compressible: true
    },
    "application/samlmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/sarif+json": {
      source: "iana",
      compressible: true
    },
    "application/sarif-external-properties+json": {
      source: "iana",
      compressible: true
    },
    "application/sbe": {
      source: "iana"
    },
    "application/sbml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sbml"]
    },
    "application/scaip+xml": {
      source: "iana",
      compressible: true
    },
    "application/scim+json": {
      source: "iana",
      compressible: true
    },
    "application/scvp-cv-request": {
      source: "iana",
      extensions: ["scq"]
    },
    "application/scvp-cv-response": {
      source: "iana",
      extensions: ["scs"]
    },
    "application/scvp-vp-request": {
      source: "iana",
      extensions: ["spq"]
    },
    "application/scvp-vp-response": {
      source: "iana",
      extensions: ["spp"]
    },
    "application/sdp": {
      source: "iana",
      extensions: ["sdp"]
    },
    "application/secevent+jwt": {
      source: "iana"
    },
    "application/senml+cbor": {
      source: "iana"
    },
    "application/senml+json": {
      source: "iana",
      compressible: true
    },
    "application/senml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["senmlx"]
    },
    "application/senml-etch+cbor": {
      source: "iana"
    },
    "application/senml-etch+json": {
      source: "iana",
      compressible: true
    },
    "application/senml-exi": {
      source: "iana"
    },
    "application/sensml+cbor": {
      source: "iana"
    },
    "application/sensml+json": {
      source: "iana",
      compressible: true
    },
    "application/sensml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sensmlx"]
    },
    "application/sensml-exi": {
      source: "iana"
    },
    "application/sep+xml": {
      source: "iana",
      compressible: true
    },
    "application/sep-exi": {
      source: "iana"
    },
    "application/session-info": {
      source: "iana"
    },
    "application/set-payment": {
      source: "iana"
    },
    "application/set-payment-initiation": {
      source: "iana",
      extensions: ["setpay"]
    },
    "application/set-registration": {
      source: "iana"
    },
    "application/set-registration-initiation": {
      source: "iana",
      extensions: ["setreg"]
    },
    "application/sgml": {
      source: "iana"
    },
    "application/sgml-open-catalog": {
      source: "iana"
    },
    "application/shf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["shf"]
    },
    "application/sieve": {
      source: "iana",
      extensions: ["siv", "sieve"]
    },
    "application/simple-filter+xml": {
      source: "iana",
      compressible: true
    },
    "application/simple-message-summary": {
      source: "iana"
    },
    "application/simplesymbolcontainer": {
      source: "iana"
    },
    "application/sipc": {
      source: "iana"
    },
    "application/slate": {
      source: "iana"
    },
    "application/smil": {
      source: "iana"
    },
    "application/smil+xml": {
      source: "iana",
      compressible: true,
      extensions: ["smi", "smil"]
    },
    "application/smpte336m": {
      source: "iana"
    },
    "application/soap+fastinfoset": {
      source: "iana"
    },
    "application/soap+xml": {
      source: "iana",
      compressible: true
    },
    "application/sparql-query": {
      source: "iana",
      extensions: ["rq"]
    },
    "application/sparql-results+xml": {
      source: "iana",
      compressible: true,
      extensions: ["srx"]
    },
    "application/spdx+json": {
      source: "iana",
      compressible: true
    },
    "application/spirits-event+xml": {
      source: "iana",
      compressible: true
    },
    "application/sql": {
      source: "iana"
    },
    "application/srgs": {
      source: "iana",
      extensions: ["gram"]
    },
    "application/srgs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["grxml"]
    },
    "application/sru+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sru"]
    },
    "application/ssdl+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ssdl"]
    },
    "application/ssml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ssml"]
    },
    "application/stix+json": {
      source: "iana",
      compressible: true
    },
    "application/swid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["swidtag"]
    },
    "application/tamp-apex-update": {
      source: "iana"
    },
    "application/tamp-apex-update-confirm": {
      source: "iana"
    },
    "application/tamp-community-update": {
      source: "iana"
    },
    "application/tamp-community-update-confirm": {
      source: "iana"
    },
    "application/tamp-error": {
      source: "iana"
    },
    "application/tamp-sequence-adjust": {
      source: "iana"
    },
    "application/tamp-sequence-adjust-confirm": {
      source: "iana"
    },
    "application/tamp-status-query": {
      source: "iana"
    },
    "application/tamp-status-response": {
      source: "iana"
    },
    "application/tamp-update": {
      source: "iana"
    },
    "application/tamp-update-confirm": {
      source: "iana"
    },
    "application/tar": {
      compressible: true
    },
    "application/taxii+json": {
      source: "iana",
      compressible: true
    },
    "application/td+json": {
      source: "iana",
      compressible: true
    },
    "application/tei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tei", "teicorpus"]
    },
    "application/tetra_isi": {
      source: "iana"
    },
    "application/thraud+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tfi"]
    },
    "application/timestamp-query": {
      source: "iana"
    },
    "application/timestamp-reply": {
      source: "iana"
    },
    "application/timestamped-data": {
      source: "iana",
      extensions: ["tsd"]
    },
    "application/tlsrpt+gzip": {
      source: "iana"
    },
    "application/tlsrpt+json": {
      source: "iana",
      compressible: true
    },
    "application/tnauthlist": {
      source: "iana"
    },
    "application/token-introspection+jwt": {
      source: "iana"
    },
    "application/toml": {
      compressible: true,
      extensions: ["toml"]
    },
    "application/trickle-ice-sdpfrag": {
      source: "iana"
    },
    "application/trig": {
      source: "iana",
      extensions: ["trig"]
    },
    "application/ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ttml"]
    },
    "application/tve-trigger": {
      source: "iana"
    },
    "application/tzif": {
      source: "iana"
    },
    "application/tzif-leap": {
      source: "iana"
    },
    "application/ubjson": {
      compressible: false,
      extensions: ["ubj"]
    },
    "application/ulpfec": {
      source: "iana"
    },
    "application/urc-grpsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/urc-ressheet+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsheet"]
    },
    "application/urc-targetdesc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["td"]
    },
    "application/urc-uisocketdesc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vcard+json": {
      source: "iana",
      compressible: true
    },
    "application/vcard+xml": {
      source: "iana",
      compressible: true
    },
    "application/vemmi": {
      source: "iana"
    },
    "application/vividence.scriptfile": {
      source: "apache"
    },
    "application/vnd.1000minds.decision-model+xml": {
      source: "iana",
      compressible: true,
      extensions: ["1km"]
    },
    "application/vnd.3gpp-prose+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc3ch+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-v2x-local-service-information": {
      source: "iana"
    },
    "application/vnd.3gpp.5gnas": {
      source: "iana"
    },
    "application/vnd.3gpp.access-transfer-events+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.bsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gmop+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gtpc": {
      source: "iana"
    },
    "application/vnd.3gpp.interworking-data": {
      source: "iana"
    },
    "application/vnd.3gpp.lpp": {
      source: "iana"
    },
    "application/vnd.3gpp.mc-signalling-ear": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-payload": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-signalling": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-floor-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-signed+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-init-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-transmission-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mid-call+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ngap": {
      source: "iana"
    },
    "application/vnd.3gpp.pfcp": {
      source: "iana"
    },
    "application/vnd.3gpp.pic-bw-large": {
      source: "iana",
      extensions: ["plb"]
    },
    "application/vnd.3gpp.pic-bw-small": {
      source: "iana",
      extensions: ["psb"]
    },
    "application/vnd.3gpp.pic-bw-var": {
      source: "iana",
      extensions: ["pvb"]
    },
    "application/vnd.3gpp.s1ap": {
      source: "iana"
    },
    "application/vnd.3gpp.sms": {
      source: "iana"
    },
    "application/vnd.3gpp.sms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-ext+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.state-and-event-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ussd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.bcmcsinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.sms": {
      source: "iana"
    },
    "application/vnd.3gpp2.tcap": {
      source: "iana",
      extensions: ["tcap"]
    },
    "application/vnd.3lightssoftware.imagescal": {
      source: "iana"
    },
    "application/vnd.3m.post-it-notes": {
      source: "iana",
      extensions: ["pwn"]
    },
    "application/vnd.accpac.simply.aso": {
      source: "iana",
      extensions: ["aso"]
    },
    "application/vnd.accpac.simply.imp": {
      source: "iana",
      extensions: ["imp"]
    },
    "application/vnd.acucobol": {
      source: "iana",
      extensions: ["acu"]
    },
    "application/vnd.acucorp": {
      source: "iana",
      extensions: ["atc", "acutc"]
    },
    "application/vnd.adobe.air-application-installer-package+zip": {
      source: "apache",
      compressible: false,
      extensions: ["air"]
    },
    "application/vnd.adobe.flash.movie": {
      source: "iana"
    },
    "application/vnd.adobe.formscentral.fcdt": {
      source: "iana",
      extensions: ["fcdt"]
    },
    "application/vnd.adobe.fxp": {
      source: "iana",
      extensions: ["fxp", "fxpl"]
    },
    "application/vnd.adobe.partial-upload": {
      source: "iana"
    },
    "application/vnd.adobe.xdp+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdp"]
    },
    "application/vnd.adobe.xfdf": {
      source: "iana",
      extensions: ["xfdf"]
    },
    "application/vnd.aether.imp": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata-pagedef": {
      source: "iana"
    },
    "application/vnd.afpc.cmoca-cmresource": {
      source: "iana"
    },
    "application/vnd.afpc.foca-charset": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codedfont": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codepage": {
      source: "iana"
    },
    "application/vnd.afpc.modca": {
      source: "iana"
    },
    "application/vnd.afpc.modca-cmtable": {
      source: "iana"
    },
    "application/vnd.afpc.modca-formdef": {
      source: "iana"
    },
    "application/vnd.afpc.modca-mediummap": {
      source: "iana"
    },
    "application/vnd.afpc.modca-objectcontainer": {
      source: "iana"
    },
    "application/vnd.afpc.modca-overlay": {
      source: "iana"
    },
    "application/vnd.afpc.modca-pagesegment": {
      source: "iana"
    },
    "application/vnd.age": {
      source: "iana",
      extensions: ["age"]
    },
    "application/vnd.ah-barcode": {
      source: "iana"
    },
    "application/vnd.ahead.space": {
      source: "iana",
      extensions: ["ahead"]
    },
    "application/vnd.airzip.filesecure.azf": {
      source: "iana",
      extensions: ["azf"]
    },
    "application/vnd.airzip.filesecure.azs": {
      source: "iana",
      extensions: ["azs"]
    },
    "application/vnd.amadeus+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.amazon.ebook": {
      source: "apache",
      extensions: ["azw"]
    },
    "application/vnd.amazon.mobi8-ebook": {
      source: "iana"
    },
    "application/vnd.americandynamics.acc": {
      source: "iana",
      extensions: ["acc"]
    },
    "application/vnd.amiga.ami": {
      source: "iana",
      extensions: ["ami"]
    },
    "application/vnd.amundsen.maze+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.android.ota": {
      source: "iana"
    },
    "application/vnd.android.package-archive": {
      source: "apache",
      compressible: false,
      extensions: ["apk"]
    },
    "application/vnd.anki": {
      source: "iana"
    },
    "application/vnd.anser-web-certificate-issue-initiation": {
      source: "iana",
      extensions: ["cii"]
    },
    "application/vnd.anser-web-funds-transfer-initiation": {
      source: "apache",
      extensions: ["fti"]
    },
    "application/vnd.antix.game-component": {
      source: "iana",
      extensions: ["atx"]
    },
    "application/vnd.apache.arrow.file": {
      source: "iana"
    },
    "application/vnd.apache.arrow.stream": {
      source: "iana"
    },
    "application/vnd.apache.thrift.binary": {
      source: "iana"
    },
    "application/vnd.apache.thrift.compact": {
      source: "iana"
    },
    "application/vnd.apache.thrift.json": {
      source: "iana"
    },
    "application/vnd.api+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.aplextor.warrp+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apothekende.reservation+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apple.installer+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpkg"]
    },
    "application/vnd.apple.keynote": {
      source: "iana",
      extensions: ["key"]
    },
    "application/vnd.apple.mpegurl": {
      source: "iana",
      extensions: ["m3u8"]
    },
    "application/vnd.apple.numbers": {
      source: "iana",
      extensions: ["numbers"]
    },
    "application/vnd.apple.pages": {
      source: "iana",
      extensions: ["pages"]
    },
    "application/vnd.apple.pkpass": {
      compressible: false,
      extensions: ["pkpass"]
    },
    "application/vnd.arastra.swi": {
      source: "iana"
    },
    "application/vnd.aristanetworks.swi": {
      source: "iana",
      extensions: ["swi"]
    },
    "application/vnd.artisan+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.artsquare": {
      source: "iana"
    },
    "application/vnd.astraea-software.iota": {
      source: "iana",
      extensions: ["iota"]
    },
    "application/vnd.audiograph": {
      source: "iana",
      extensions: ["aep"]
    },
    "application/vnd.autopackage": {
      source: "iana"
    },
    "application/vnd.avalon+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.avistar+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.balsamiq.bmml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["bmml"]
    },
    "application/vnd.balsamiq.bmpr": {
      source: "iana"
    },
    "application/vnd.banana-accounting": {
      source: "iana"
    },
    "application/vnd.bbf.usp.error": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bekitzur-stech+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bint.med-content": {
      source: "iana"
    },
    "application/vnd.biopax.rdf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.blink-idb-value-wrapper": {
      source: "iana"
    },
    "application/vnd.blueice.multipass": {
      source: "iana",
      extensions: ["mpm"]
    },
    "application/vnd.bluetooth.ep.oob": {
      source: "iana"
    },
    "application/vnd.bluetooth.le.oob": {
      source: "iana"
    },
    "application/vnd.bmi": {
      source: "iana",
      extensions: ["bmi"]
    },
    "application/vnd.bpf": {
      source: "iana"
    },
    "application/vnd.bpf3": {
      source: "iana"
    },
    "application/vnd.businessobjects": {
      source: "iana",
      extensions: ["rep"]
    },
    "application/vnd.byu.uapi+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cab-jscript": {
      source: "iana"
    },
    "application/vnd.canon-cpdl": {
      source: "iana"
    },
    "application/vnd.canon-lips": {
      source: "iana"
    },
    "application/vnd.capasystems-pg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cendio.thinlinc.clientconf": {
      source: "iana"
    },
    "application/vnd.century-systems.tcp_stream": {
      source: "iana"
    },
    "application/vnd.chemdraw+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdxml"]
    },
    "application/vnd.chess-pgn": {
      source: "iana"
    },
    "application/vnd.chipnuts.karaoke-mmd": {
      source: "iana",
      extensions: ["mmd"]
    },
    "application/vnd.ciedi": {
      source: "iana"
    },
    "application/vnd.cinderella": {
      source: "iana",
      extensions: ["cdy"]
    },
    "application/vnd.cirpack.isdn-ext": {
      source: "iana"
    },
    "application/vnd.citationstyles.style+xml": {
      source: "iana",
      compressible: true,
      extensions: ["csl"]
    },
    "application/vnd.claymore": {
      source: "iana",
      extensions: ["cla"]
    },
    "application/vnd.cloanto.rp9": {
      source: "iana",
      extensions: ["rp9"]
    },
    "application/vnd.clonk.c4group": {
      source: "iana",
      extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
    },
    "application/vnd.cluetrust.cartomobile-config": {
      source: "iana",
      extensions: ["c11amc"]
    },
    "application/vnd.cluetrust.cartomobile-config-pkg": {
      source: "iana",
      extensions: ["c11amz"]
    },
    "application/vnd.coffeescript": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet-template": {
      source: "iana"
    },
    "application/vnd.collection+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.doc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.next+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.comicbook+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.comicbook-rar": {
      source: "iana"
    },
    "application/vnd.commerce-battelle": {
      source: "iana"
    },
    "application/vnd.commonspace": {
      source: "iana",
      extensions: ["csp"]
    },
    "application/vnd.contact.cmsg": {
      source: "iana",
      extensions: ["cdbcmsg"]
    },
    "application/vnd.coreos.ignition+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cosmocaller": {
      source: "iana",
      extensions: ["cmc"]
    },
    "application/vnd.crick.clicker": {
      source: "iana",
      extensions: ["clkx"]
    },
    "application/vnd.crick.clicker.keyboard": {
      source: "iana",
      extensions: ["clkk"]
    },
    "application/vnd.crick.clicker.palette": {
      source: "iana",
      extensions: ["clkp"]
    },
    "application/vnd.crick.clicker.template": {
      source: "iana",
      extensions: ["clkt"]
    },
    "application/vnd.crick.clicker.wordbank": {
      source: "iana",
      extensions: ["clkw"]
    },
    "application/vnd.criticaltools.wbs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wbs"]
    },
    "application/vnd.cryptii.pipe+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.crypto-shade-file": {
      source: "iana"
    },
    "application/vnd.cryptomator.encrypted": {
      source: "iana"
    },
    "application/vnd.cryptomator.vault": {
      source: "iana"
    },
    "application/vnd.ctc-posml": {
      source: "iana",
      extensions: ["pml"]
    },
    "application/vnd.ctct.ws+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cups-pdf": {
      source: "iana"
    },
    "application/vnd.cups-postscript": {
      source: "iana"
    },
    "application/vnd.cups-ppd": {
      source: "iana",
      extensions: ["ppd"]
    },
    "application/vnd.cups-raster": {
      source: "iana"
    },
    "application/vnd.cups-raw": {
      source: "iana"
    },
    "application/vnd.curl": {
      source: "iana"
    },
    "application/vnd.curl.car": {
      source: "apache",
      extensions: ["car"]
    },
    "application/vnd.curl.pcurl": {
      source: "apache",
      extensions: ["pcurl"]
    },
    "application/vnd.cyan.dean.root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cybank": {
      source: "iana"
    },
    "application/vnd.cyclonedx+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cyclonedx+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.d2l.coursepackage1p0+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.d3m-dataset": {
      source: "iana"
    },
    "application/vnd.d3m-problem": {
      source: "iana"
    },
    "application/vnd.dart": {
      source: "iana",
      compressible: true,
      extensions: ["dart"]
    },
    "application/vnd.data-vision.rdz": {
      source: "iana",
      extensions: ["rdz"]
    },
    "application/vnd.datapackage+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dataresource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dbf": {
      source: "iana",
      extensions: ["dbf"]
    },
    "application/vnd.debian.binary-package": {
      source: "iana"
    },
    "application/vnd.dece.data": {
      source: "iana",
      extensions: ["uvf", "uvvf", "uvd", "uvvd"]
    },
    "application/vnd.dece.ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uvt", "uvvt"]
    },
    "application/vnd.dece.unspecified": {
      source: "iana",
      extensions: ["uvx", "uvvx"]
    },
    "application/vnd.dece.zip": {
      source: "iana",
      extensions: ["uvz", "uvvz"]
    },
    "application/vnd.denovo.fcselayout-link": {
      source: "iana",
      extensions: ["fe_launch"]
    },
    "application/vnd.desmume.movie": {
      source: "iana"
    },
    "application/vnd.dir-bi.plate-dl-nosuffix": {
      source: "iana"
    },
    "application/vnd.dm.delegation+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dna": {
      source: "iana",
      extensions: ["dna"]
    },
    "application/vnd.document+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dolby.mlp": {
      source: "apache",
      extensions: ["mlp"]
    },
    "application/vnd.dolby.mobile.1": {
      source: "iana"
    },
    "application/vnd.dolby.mobile.2": {
      source: "iana"
    },
    "application/vnd.doremir.scorecloud-binary-document": {
      source: "iana"
    },
    "application/vnd.dpgraph": {
      source: "iana",
      extensions: ["dpg"]
    },
    "application/vnd.dreamfactory": {
      source: "iana",
      extensions: ["dfac"]
    },
    "application/vnd.drive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ds-keypoint": {
      source: "apache",
      extensions: ["kpxx"]
    },
    "application/vnd.dtg.local": {
      source: "iana"
    },
    "application/vnd.dtg.local.flash": {
      source: "iana"
    },
    "application/vnd.dtg.local.html": {
      source: "iana"
    },
    "application/vnd.dvb.ait": {
      source: "iana",
      extensions: ["ait"]
    },
    "application/vnd.dvb.dvbisl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.dvbj": {
      source: "iana"
    },
    "application/vnd.dvb.esgcontainer": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcdftnotifaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess2": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgpdd": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcroaming": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-base": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-enhancement": {
      source: "iana"
    },
    "application/vnd.dvb.notif-aggregate-root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-container+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-generic+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-msglist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-init+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.pfr": {
      source: "iana"
    },
    "application/vnd.dvb.service": {
      source: "iana",
      extensions: ["svc"]
    },
    "application/vnd.dxr": {
      source: "iana"
    },
    "application/vnd.dynageo": {
      source: "iana",
      extensions: ["geo"]
    },
    "application/vnd.dzr": {
      source: "iana"
    },
    "application/vnd.easykaraoke.cdgdownload": {
      source: "iana"
    },
    "application/vnd.ecdis-update": {
      source: "iana"
    },
    "application/vnd.ecip.rlp": {
      source: "iana"
    },
    "application/vnd.eclipse.ditto+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ecowin.chart": {
      source: "iana",
      extensions: ["mag"]
    },
    "application/vnd.ecowin.filerequest": {
      source: "iana"
    },
    "application/vnd.ecowin.fileupdate": {
      source: "iana"
    },
    "application/vnd.ecowin.series": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesrequest": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesupdate": {
      source: "iana"
    },
    "application/vnd.efi.img": {
      source: "iana"
    },
    "application/vnd.efi.iso": {
      source: "iana"
    },
    "application/vnd.emclient.accessrequest+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.enliven": {
      source: "iana",
      extensions: ["nml"]
    },
    "application/vnd.enphase.envoy": {
      source: "iana"
    },
    "application/vnd.eprints.data+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.epson.esf": {
      source: "iana",
      extensions: ["esf"]
    },
    "application/vnd.epson.msf": {
      source: "iana",
      extensions: ["msf"]
    },
    "application/vnd.epson.quickanime": {
      source: "iana",
      extensions: ["qam"]
    },
    "application/vnd.epson.salt": {
      source: "iana",
      extensions: ["slt"]
    },
    "application/vnd.epson.ssf": {
      source: "iana",
      extensions: ["ssf"]
    },
    "application/vnd.ericsson.quickcall": {
      source: "iana"
    },
    "application/vnd.espass-espass+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.eszigno3+xml": {
      source: "iana",
      compressible: true,
      extensions: ["es3", "et3"]
    },
    "application/vnd.etsi.aoc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.asic-e+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.asic-s+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.cug+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvcommand+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-bc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-cod+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-npvr+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvservice+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mcid+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mheg5": {
      source: "iana"
    },
    "application/vnd.etsi.overload-control-policy-dataset+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.pstn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.sci+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.simservs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.timestamp-token": {
      source: "iana"
    },
    "application/vnd.etsi.tsl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.tsl.der": {
      source: "iana"
    },
    "application/vnd.eu.kasparian.car+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.eudora.data": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.profile": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.settings": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.theme": {
      source: "iana"
    },
    "application/vnd.exstream-empower+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.exstream-package": {
      source: "iana"
    },
    "application/vnd.ezpix-album": {
      source: "iana",
      extensions: ["ez2"]
    },
    "application/vnd.ezpix-package": {
      source: "iana",
      extensions: ["ez3"]
    },
    "application/vnd.f-secure.mobile": {
      source: "iana"
    },
    "application/vnd.familysearch.gedcom+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.fastcopy-disk-image": {
      source: "iana"
    },
    "application/vnd.fdf": {
      source: "iana",
      extensions: ["fdf"]
    },
    "application/vnd.fdsn.mseed": {
      source: "iana",
      extensions: ["mseed"]
    },
    "application/vnd.fdsn.seed": {
      source: "iana",
      extensions: ["seed", "dataless"]
    },
    "application/vnd.ffsns": {
      source: "iana"
    },
    "application/vnd.ficlab.flb+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.filmit.zfc": {
      source: "iana"
    },
    "application/vnd.fints": {
      source: "iana"
    },
    "application/vnd.firemonkeys.cloudcell": {
      source: "iana"
    },
    "application/vnd.flographit": {
      source: "iana",
      extensions: ["gph"]
    },
    "application/vnd.fluxtime.clip": {
      source: "iana",
      extensions: ["ftc"]
    },
    "application/vnd.font-fontforge-sfd": {
      source: "iana"
    },
    "application/vnd.framemaker": {
      source: "iana",
      extensions: ["fm", "frame", "maker", "book"]
    },
    "application/vnd.frogans.fnc": {
      source: "iana",
      extensions: ["fnc"]
    },
    "application/vnd.frogans.ltf": {
      source: "iana",
      extensions: ["ltf"]
    },
    "application/vnd.fsc.weblaunch": {
      source: "iana",
      extensions: ["fsc"]
    },
    "application/vnd.fujifilm.fb.docuworks": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.binder": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.jfi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fujitsu.oasys": {
      source: "iana",
      extensions: ["oas"]
    },
    "application/vnd.fujitsu.oasys2": {
      source: "iana",
      extensions: ["oa2"]
    },
    "application/vnd.fujitsu.oasys3": {
      source: "iana",
      extensions: ["oa3"]
    },
    "application/vnd.fujitsu.oasysgp": {
      source: "iana",
      extensions: ["fg5"]
    },
    "application/vnd.fujitsu.oasysprs": {
      source: "iana",
      extensions: ["bh2"]
    },
    "application/vnd.fujixerox.art-ex": {
      source: "iana"
    },
    "application/vnd.fujixerox.art4": {
      source: "iana"
    },
    "application/vnd.fujixerox.ddd": {
      source: "iana",
      extensions: ["ddd"]
    },
    "application/vnd.fujixerox.docuworks": {
      source: "iana",
      extensions: ["xdw"]
    },
    "application/vnd.fujixerox.docuworks.binder": {
      source: "iana",
      extensions: ["xbd"]
    },
    "application/vnd.fujixerox.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujixerox.hbpl": {
      source: "iana"
    },
    "application/vnd.fut-misnet": {
      source: "iana"
    },
    "application/vnd.futoin+cbor": {
      source: "iana"
    },
    "application/vnd.futoin+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fuzzysheet": {
      source: "iana",
      extensions: ["fzs"]
    },
    "application/vnd.genomatix.tuxedo": {
      source: "iana",
      extensions: ["txd"]
    },
    "application/vnd.gentics.grd+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geo+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geocube+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geogebra.file": {
      source: "iana",
      extensions: ["ggb"]
    },
    "application/vnd.geogebra.slides": {
      source: "iana"
    },
    "application/vnd.geogebra.tool": {
      source: "iana",
      extensions: ["ggt"]
    },
    "application/vnd.geometry-explorer": {
      source: "iana",
      extensions: ["gex", "gre"]
    },
    "application/vnd.geonext": {
      source: "iana",
      extensions: ["gxt"]
    },
    "application/vnd.geoplan": {
      source: "iana",
      extensions: ["g2w"]
    },
    "application/vnd.geospace": {
      source: "iana",
      extensions: ["g3w"]
    },
    "application/vnd.gerber": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt-response": {
      source: "iana"
    },
    "application/vnd.gmx": {
      source: "iana",
      extensions: ["gmx"]
    },
    "application/vnd.google-apps.document": {
      compressible: false,
      extensions: ["gdoc"]
    },
    "application/vnd.google-apps.presentation": {
      compressible: false,
      extensions: ["gslides"]
    },
    "application/vnd.google-apps.spreadsheet": {
      compressible: false,
      extensions: ["gsheet"]
    },
    "application/vnd.google-earth.kml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["kml"]
    },
    "application/vnd.google-earth.kmz": {
      source: "iana",
      compressible: false,
      extensions: ["kmz"]
    },
    "application/vnd.gov.sk.e-form+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gov.sk.e-form+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.gov.sk.xmldatacontainer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.grafeq": {
      source: "iana",
      extensions: ["gqf", "gqs"]
    },
    "application/vnd.gridmp": {
      source: "iana"
    },
    "application/vnd.groove-account": {
      source: "iana",
      extensions: ["gac"]
    },
    "application/vnd.groove-help": {
      source: "iana",
      extensions: ["ghf"]
    },
    "application/vnd.groove-identity-message": {
      source: "iana",
      extensions: ["gim"]
    },
    "application/vnd.groove-injector": {
      source: "iana",
      extensions: ["grv"]
    },
    "application/vnd.groove-tool-message": {
      source: "iana",
      extensions: ["gtm"]
    },
    "application/vnd.groove-tool-template": {
      source: "iana",
      extensions: ["tpl"]
    },
    "application/vnd.groove-vcard": {
      source: "iana",
      extensions: ["vcg"]
    },
    "application/vnd.hal+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hal+xml": {
      source: "iana",
      compressible: true,
      extensions: ["hal"]
    },
    "application/vnd.handheld-entertainment+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zmm"]
    },
    "application/vnd.hbci": {
      source: "iana",
      extensions: ["hbci"]
    },
    "application/vnd.hc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hcl-bireports": {
      source: "iana"
    },
    "application/vnd.hdt": {
      source: "iana"
    },
    "application/vnd.heroku+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hhe.lesson-player": {
      source: "iana",
      extensions: ["les"]
    },
    "application/vnd.hl7cda+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hl7v2+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hp-hpgl": {
      source: "iana",
      extensions: ["hpgl"]
    },
    "application/vnd.hp-hpid": {
      source: "iana",
      extensions: ["hpid"]
    },
    "application/vnd.hp-hps": {
      source: "iana",
      extensions: ["hps"]
    },
    "application/vnd.hp-jlyt": {
      source: "iana",
      extensions: ["jlt"]
    },
    "application/vnd.hp-pcl": {
      source: "iana",
      extensions: ["pcl"]
    },
    "application/vnd.hp-pclxl": {
      source: "iana",
      extensions: ["pclxl"]
    },
    "application/vnd.httphone": {
      source: "iana"
    },
    "application/vnd.hydrostatix.sof-data": {
      source: "iana",
      extensions: ["sfd-hdstx"]
    },
    "application/vnd.hyper+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyper-item+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyperdrive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hzn-3d-crossword": {
      source: "iana"
    },
    "application/vnd.ibm.afplinedata": {
      source: "iana"
    },
    "application/vnd.ibm.electronic-media": {
      source: "iana"
    },
    "application/vnd.ibm.minipay": {
      source: "iana",
      extensions: ["mpy"]
    },
    "application/vnd.ibm.modcap": {
      source: "iana",
      extensions: ["afp", "listafp", "list3820"]
    },
    "application/vnd.ibm.rights-management": {
      source: "iana",
      extensions: ["irm"]
    },
    "application/vnd.ibm.secure-container": {
      source: "iana",
      extensions: ["sc"]
    },
    "application/vnd.iccprofile": {
      source: "iana",
      extensions: ["icc", "icm"]
    },
    "application/vnd.ieee.1905": {
      source: "iana"
    },
    "application/vnd.igloader": {
      source: "iana",
      extensions: ["igl"]
    },
    "application/vnd.imagemeter.folder+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.imagemeter.image+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.immervision-ivp": {
      source: "iana",
      extensions: ["ivp"]
    },
    "application/vnd.immervision-ivu": {
      source: "iana",
      extensions: ["ivu"]
    },
    "application/vnd.ims.imsccv1p1": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p2": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p3": {
      source: "iana"
    },
    "application/vnd.ims.lis.v2.result+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy.id+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings.simple+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informedcontrol.rms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informix-visionary": {
      source: "iana"
    },
    "application/vnd.infotech.project": {
      source: "iana"
    },
    "application/vnd.infotech.project+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.innopath.wamp.notification": {
      source: "iana"
    },
    "application/vnd.insors.igm": {
      source: "iana",
      extensions: ["igm"]
    },
    "application/vnd.intercon.formnet": {
      source: "iana",
      extensions: ["xpw", "xpx"]
    },
    "application/vnd.intergeo": {
      source: "iana",
      extensions: ["i2g"]
    },
    "application/vnd.intertrust.digibox": {
      source: "iana"
    },
    "application/vnd.intertrust.nncp": {
      source: "iana"
    },
    "application/vnd.intu.qbo": {
      source: "iana",
      extensions: ["qbo"]
    },
    "application/vnd.intu.qfx": {
      source: "iana",
      extensions: ["qfx"]
    },
    "application/vnd.iptc.g2.catalogitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.conceptitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.knowledgeitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.packageitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.planningitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ipunplugged.rcprofile": {
      source: "iana",
      extensions: ["rcprofile"]
    },
    "application/vnd.irepository.package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["irp"]
    },
    "application/vnd.is-xpr": {
      source: "iana",
      extensions: ["xpr"]
    },
    "application/vnd.isac.fcs": {
      source: "iana",
      extensions: ["fcs"]
    },
    "application/vnd.iso11783-10+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.jam": {
      source: "iana",
      extensions: ["jam"]
    },
    "application/vnd.japannet-directory-service": {
      source: "iana"
    },
    "application/vnd.japannet-jpnstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-payment-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-registration": {
      source: "iana"
    },
    "application/vnd.japannet-registration-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-setstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-verification": {
      source: "iana"
    },
    "application/vnd.japannet-verification-wakeup": {
      source: "iana"
    },
    "application/vnd.jcp.javame.midlet-rms": {
      source: "iana",
      extensions: ["rms"]
    },
    "application/vnd.jisp": {
      source: "iana",
      extensions: ["jisp"]
    },
    "application/vnd.joost.joda-archive": {
      source: "iana",
      extensions: ["joda"]
    },
    "application/vnd.jsk.isdn-ngn": {
      source: "iana"
    },
    "application/vnd.kahootz": {
      source: "iana",
      extensions: ["ktz", "ktr"]
    },
    "application/vnd.kde.karbon": {
      source: "iana",
      extensions: ["karbon"]
    },
    "application/vnd.kde.kchart": {
      source: "iana",
      extensions: ["chrt"]
    },
    "application/vnd.kde.kformula": {
      source: "iana",
      extensions: ["kfo"]
    },
    "application/vnd.kde.kivio": {
      source: "iana",
      extensions: ["flw"]
    },
    "application/vnd.kde.kontour": {
      source: "iana",
      extensions: ["kon"]
    },
    "application/vnd.kde.kpresenter": {
      source: "iana",
      extensions: ["kpr", "kpt"]
    },
    "application/vnd.kde.kspread": {
      source: "iana",
      extensions: ["ksp"]
    },
    "application/vnd.kde.kword": {
      source: "iana",
      extensions: ["kwd", "kwt"]
    },
    "application/vnd.kenameaapp": {
      source: "iana",
      extensions: ["htke"]
    },
    "application/vnd.kidspiration": {
      source: "iana",
      extensions: ["kia"]
    },
    "application/vnd.kinar": {
      source: "iana",
      extensions: ["kne", "knp"]
    },
    "application/vnd.koan": {
      source: "iana",
      extensions: ["skp", "skd", "skt", "skm"]
    },
    "application/vnd.kodak-descriptor": {
      source: "iana",
      extensions: ["sse"]
    },
    "application/vnd.las": {
      source: "iana"
    },
    "application/vnd.las.las+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.las.las+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lasxml"]
    },
    "application/vnd.laszip": {
      source: "iana"
    },
    "application/vnd.leap+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.liberty-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.llamagraphics.life-balance.desktop": {
      source: "iana",
      extensions: ["lbd"]
    },
    "application/vnd.llamagraphics.life-balance.exchange+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lbe"]
    },
    "application/vnd.logipipe.circuit+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.loom": {
      source: "iana"
    },
    "application/vnd.lotus-1-2-3": {
      source: "iana",
      extensions: ["123"]
    },
    "application/vnd.lotus-approach": {
      source: "iana",
      extensions: ["apr"]
    },
    "application/vnd.lotus-freelance": {
      source: "iana",
      extensions: ["pre"]
    },
    "application/vnd.lotus-notes": {
      source: "iana",
      extensions: ["nsf"]
    },
    "application/vnd.lotus-organizer": {
      source: "iana",
      extensions: ["org"]
    },
    "application/vnd.lotus-screencam": {
      source: "iana",
      extensions: ["scm"]
    },
    "application/vnd.lotus-wordpro": {
      source: "iana",
      extensions: ["lwp"]
    },
    "application/vnd.macports.portpkg": {
      source: "iana",
      extensions: ["portpkg"]
    },
    "application/vnd.mapbox-vector-tile": {
      source: "iana",
      extensions: ["mvt"]
    },
    "application/vnd.marlin.drm.actiontoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.conftoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.license+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.mdcf": {
      source: "iana"
    },
    "application/vnd.mason+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.maxar.archive.3tz+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.maxmind.maxmind-db": {
      source: "iana"
    },
    "application/vnd.mcd": {
      source: "iana",
      extensions: ["mcd"]
    },
    "application/vnd.medcalcdata": {
      source: "iana",
      extensions: ["mc1"]
    },
    "application/vnd.mediastation.cdkey": {
      source: "iana",
      extensions: ["cdkey"]
    },
    "application/vnd.meridian-slingshot": {
      source: "iana"
    },
    "application/vnd.mfer": {
      source: "iana",
      extensions: ["mwf"]
    },
    "application/vnd.mfmp": {
      source: "iana",
      extensions: ["mfm"]
    },
    "application/vnd.micro+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.micrografx.flo": {
      source: "iana",
      extensions: ["flo"]
    },
    "application/vnd.micrografx.igx": {
      source: "iana",
      extensions: ["igx"]
    },
    "application/vnd.microsoft.portable-executable": {
      source: "iana"
    },
    "application/vnd.microsoft.windows.thumbnail-cache": {
      source: "iana"
    },
    "application/vnd.miele+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.mif": {
      source: "iana",
      extensions: ["mif"]
    },
    "application/vnd.minisoft-hp3000-save": {
      source: "iana"
    },
    "application/vnd.mitsubishi.misty-guard.trustweb": {
      source: "iana"
    },
    "application/vnd.mobius.daf": {
      source: "iana",
      extensions: ["daf"]
    },
    "application/vnd.mobius.dis": {
      source: "iana",
      extensions: ["dis"]
    },
    "application/vnd.mobius.mbk": {
      source: "iana",
      extensions: ["mbk"]
    },
    "application/vnd.mobius.mqy": {
      source: "iana",
      extensions: ["mqy"]
    },
    "application/vnd.mobius.msl": {
      source: "iana",
      extensions: ["msl"]
    },
    "application/vnd.mobius.plc": {
      source: "iana",
      extensions: ["plc"]
    },
    "application/vnd.mobius.txf": {
      source: "iana",
      extensions: ["txf"]
    },
    "application/vnd.mophun.application": {
      source: "iana",
      extensions: ["mpn"]
    },
    "application/vnd.mophun.certificate": {
      source: "iana",
      extensions: ["mpc"]
    },
    "application/vnd.motorola.flexsuite": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.adsi": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.fis": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.gotap": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.kmr": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.ttc": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.wem": {
      source: "iana"
    },
    "application/vnd.motorola.iprm": {
      source: "iana"
    },
    "application/vnd.mozilla.xul+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xul"]
    },
    "application/vnd.ms-3mfdocument": {
      source: "iana"
    },
    "application/vnd.ms-artgalry": {
      source: "iana",
      extensions: ["cil"]
    },
    "application/vnd.ms-asf": {
      source: "iana"
    },
    "application/vnd.ms-cab-compressed": {
      source: "iana",
      extensions: ["cab"]
    },
    "application/vnd.ms-color.iccprofile": {
      source: "apache"
    },
    "application/vnd.ms-excel": {
      source: "iana",
      compressible: false,
      extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
    },
    "application/vnd.ms-excel.addin.macroenabled.12": {
      source: "iana",
      extensions: ["xlam"]
    },
    "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
      source: "iana",
      extensions: ["xlsb"]
    },
    "application/vnd.ms-excel.sheet.macroenabled.12": {
      source: "iana",
      extensions: ["xlsm"]
    },
    "application/vnd.ms-excel.template.macroenabled.12": {
      source: "iana",
      extensions: ["xltm"]
    },
    "application/vnd.ms-fontobject": {
      source: "iana",
      compressible: true,
      extensions: ["eot"]
    },
    "application/vnd.ms-htmlhelp": {
      source: "iana",
      extensions: ["chm"]
    },
    "application/vnd.ms-ims": {
      source: "iana",
      extensions: ["ims"]
    },
    "application/vnd.ms-lrm": {
      source: "iana",
      extensions: ["lrm"]
    },
    "application/vnd.ms-office.activex+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-officetheme": {
      source: "iana",
      extensions: ["thmx"]
    },
    "application/vnd.ms-opentype": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-outlook": {
      compressible: false,
      extensions: ["msg"]
    },
    "application/vnd.ms-package.obfuscated-opentype": {
      source: "apache"
    },
    "application/vnd.ms-pki.seccat": {
      source: "apache",
      extensions: ["cat"]
    },
    "application/vnd.ms-pki.stl": {
      source: "apache",
      extensions: ["stl"]
    },
    "application/vnd.ms-playready.initiator+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-powerpoint": {
      source: "iana",
      compressible: false,
      extensions: ["ppt", "pps", "pot"]
    },
    "application/vnd.ms-powerpoint.addin.macroenabled.12": {
      source: "iana",
      extensions: ["ppam"]
    },
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
      source: "iana",
      extensions: ["pptm"]
    },
    "application/vnd.ms-powerpoint.slide.macroenabled.12": {
      source: "iana",
      extensions: ["sldm"]
    },
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
      source: "iana",
      extensions: ["ppsm"]
    },
    "application/vnd.ms-powerpoint.template.macroenabled.12": {
      source: "iana",
      extensions: ["potm"]
    },
    "application/vnd.ms-printdevicecapabilities+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-printing.printticket+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-printschematicket+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-project": {
      source: "iana",
      extensions: ["mpp", "mpt"]
    },
    "application/vnd.ms-tnef": {
      source: "iana"
    },
    "application/vnd.ms-windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.nwprinting.oob": {
      source: "iana"
    },
    "application/vnd.ms-windows.printerpairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.wsd.oob": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-resp": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-resp": {
      source: "iana"
    },
    "application/vnd.ms-word.document.macroenabled.12": {
      source: "iana",
      extensions: ["docm"]
    },
    "application/vnd.ms-word.template.macroenabled.12": {
      source: "iana",
      extensions: ["dotm"]
    },
    "application/vnd.ms-works": {
      source: "iana",
      extensions: ["wps", "wks", "wcm", "wdb"]
    },
    "application/vnd.ms-wpl": {
      source: "iana",
      extensions: ["wpl"]
    },
    "application/vnd.ms-xpsdocument": {
      source: "iana",
      compressible: false,
      extensions: ["xps"]
    },
    "application/vnd.msa-disk-image": {
      source: "iana"
    },
    "application/vnd.mseq": {
      source: "iana",
      extensions: ["mseq"]
    },
    "application/vnd.msign": {
      source: "iana"
    },
    "application/vnd.multiad.creator": {
      source: "iana"
    },
    "application/vnd.multiad.creator.cif": {
      source: "iana"
    },
    "application/vnd.music-niff": {
      source: "iana"
    },
    "application/vnd.musician": {
      source: "iana",
      extensions: ["mus"]
    },
    "application/vnd.muvee.style": {
      source: "iana",
      extensions: ["msty"]
    },
    "application/vnd.mynfc": {
      source: "iana",
      extensions: ["taglet"]
    },
    "application/vnd.nacamar.ybrid+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ncd.control": {
      source: "iana"
    },
    "application/vnd.ncd.reference": {
      source: "iana"
    },
    "application/vnd.nearst.inv+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nebumind.line": {
      source: "iana"
    },
    "application/vnd.nervana": {
      source: "iana"
    },
    "application/vnd.netfpx": {
      source: "iana"
    },
    "application/vnd.neurolanguage.nlu": {
      source: "iana",
      extensions: ["nlu"]
    },
    "application/vnd.nimn": {
      source: "iana"
    },
    "application/vnd.nintendo.nitro.rom": {
      source: "iana"
    },
    "application/vnd.nintendo.snes.rom": {
      source: "iana"
    },
    "application/vnd.nitf": {
      source: "iana",
      extensions: ["ntf", "nitf"]
    },
    "application/vnd.noblenet-directory": {
      source: "iana",
      extensions: ["nnd"]
    },
    "application/vnd.noblenet-sealer": {
      source: "iana",
      extensions: ["nns"]
    },
    "application/vnd.noblenet-web": {
      source: "iana",
      extensions: ["nnw"]
    },
    "application/vnd.nokia.catalogs": {
      source: "iana"
    },
    "application/vnd.nokia.conml+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.conml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.iptv.config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.isds-radio-presets": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.landmarkcollection+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.n-gage.ac+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ac"]
    },
    "application/vnd.nokia.n-gage.data": {
      source: "iana",
      extensions: ["ngdat"]
    },
    "application/vnd.nokia.n-gage.symbian.install": {
      source: "iana",
      extensions: ["n-gage"]
    },
    "application/vnd.nokia.ncd": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.radio-preset": {
      source: "iana",
      extensions: ["rpst"]
    },
    "application/vnd.nokia.radio-presets": {
      source: "iana",
      extensions: ["rpss"]
    },
    "application/vnd.novadigm.edm": {
      source: "iana",
      extensions: ["edm"]
    },
    "application/vnd.novadigm.edx": {
      source: "iana",
      extensions: ["edx"]
    },
    "application/vnd.novadigm.ext": {
      source: "iana",
      extensions: ["ext"]
    },
    "application/vnd.ntt-local.content-share": {
      source: "iana"
    },
    "application/vnd.ntt-local.file-transfer": {
      source: "iana"
    },
    "application/vnd.ntt-local.ogw_remote-access": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_remote": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_tcp_stream": {
      source: "iana"
    },
    "application/vnd.oasis.opendocument.chart": {
      source: "iana",
      extensions: ["odc"]
    },
    "application/vnd.oasis.opendocument.chart-template": {
      source: "iana",
      extensions: ["otc"]
    },
    "application/vnd.oasis.opendocument.database": {
      source: "iana",
      extensions: ["odb"]
    },
    "application/vnd.oasis.opendocument.formula": {
      source: "iana",
      extensions: ["odf"]
    },
    "application/vnd.oasis.opendocument.formula-template": {
      source: "iana",
      extensions: ["odft"]
    },
    "application/vnd.oasis.opendocument.graphics": {
      source: "iana",
      compressible: false,
      extensions: ["odg"]
    },
    "application/vnd.oasis.opendocument.graphics-template": {
      source: "iana",
      extensions: ["otg"]
    },
    "application/vnd.oasis.opendocument.image": {
      source: "iana",
      extensions: ["odi"]
    },
    "application/vnd.oasis.opendocument.image-template": {
      source: "iana",
      extensions: ["oti"]
    },
    "application/vnd.oasis.opendocument.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["odp"]
    },
    "application/vnd.oasis.opendocument.presentation-template": {
      source: "iana",
      extensions: ["otp"]
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      source: "iana",
      compressible: false,
      extensions: ["ods"]
    },
    "application/vnd.oasis.opendocument.spreadsheet-template": {
      source: "iana",
      extensions: ["ots"]
    },
    "application/vnd.oasis.opendocument.text": {
      source: "iana",
      compressible: false,
      extensions: ["odt"]
    },
    "application/vnd.oasis.opendocument.text-master": {
      source: "iana",
      extensions: ["odm"]
    },
    "application/vnd.oasis.opendocument.text-template": {
      source: "iana",
      extensions: ["ott"]
    },
    "application/vnd.oasis.opendocument.text-web": {
      source: "iana",
      extensions: ["oth"]
    },
    "application/vnd.obn": {
      source: "iana"
    },
    "application/vnd.ocf+cbor": {
      source: "iana"
    },
    "application/vnd.oci.image.manifest.v1+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oftn.l10n+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessdownload+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessstreaming+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.cspg-hexbinary": {
      source: "iana"
    },
    "application/vnd.oipf.dae.svg+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.dae.xhtml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.mippvcontrolmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.pae.gem": {
      source: "iana"
    },
    "application/vnd.oipf.spdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.spdlist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.ueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.userprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.olpc-sugar": {
      source: "iana",
      extensions: ["xo"]
    },
    "application/vnd.oma-scws-config": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-request": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-response": {
      source: "iana"
    },
    "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.drm-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.imd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.ltkm": {
      source: "iana"
    },
    "application/vnd.oma.bcast.notification+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.provisioningtrigger": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgboot": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgdd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sgdu": {
      source: "iana"
    },
    "application/vnd.oma.bcast.simple-symbol-container": {
      source: "iana"
    },
    "application/vnd.oma.bcast.smartcard-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sprov+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.stkm": {
      source: "iana"
    },
    "application/vnd.oma.cab-address-book+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-feature-handler+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-pcc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-subs-invite+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-user-prefs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.dcd": {
      source: "iana"
    },
    "application/vnd.oma.dcdc": {
      source: "iana"
    },
    "application/vnd.oma.dd2+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dd2"]
    },
    "application/vnd.oma.drm.risd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.group-usage-list+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+cbor": {
      source: "iana"
    },
    "application/vnd.oma.lwm2m+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+tlv": {
      source: "iana"
    },
    "application/vnd.oma.pal+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.detailed-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.final-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.groups+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.invocation-descriptor+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.optimized-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.push": {
      source: "iana"
    },
    "application/vnd.oma.scidm.messages+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.xcap-directory+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.omads-email+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-file+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-folder+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omaloc-supl-init": {
      source: "iana"
    },
    "application/vnd.onepager": {
      source: "iana"
    },
    "application/vnd.onepagertamp": {
      source: "iana"
    },
    "application/vnd.onepagertamx": {
      source: "iana"
    },
    "application/vnd.onepagertat": {
      source: "iana"
    },
    "application/vnd.onepagertatp": {
      source: "iana"
    },
    "application/vnd.onepagertatx": {
      source: "iana"
    },
    "application/vnd.openblox.game+xml": {
      source: "iana",
      compressible: true,
      extensions: ["obgx"]
    },
    "application/vnd.openblox.game-binary": {
      source: "iana"
    },
    "application/vnd.openeye.oeb": {
      source: "iana"
    },
    "application/vnd.openofficeorg.extension": {
      source: "apache",
      extensions: ["oxt"]
    },
    "application/vnd.openstreetmap.data+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osm"]
    },
    "application/vnd.opentimestamps.ots": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawing+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["pptx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide": {
      source: "iana",
      extensions: ["sldx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
      source: "iana",
      extensions: ["ppsx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template": {
      source: "iana",
      extensions: ["potx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      source: "iana",
      compressible: false,
      extensions: ["xlsx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
      source: "iana",
      extensions: ["xltx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.theme+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.vmldrawing": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      source: "iana",
      compressible: false,
      extensions: ["docx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
      source: "iana",
      extensions: ["dotx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.core-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.relationships+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oracle.resource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.orange.indata": {
      source: "iana"
    },
    "application/vnd.osa.netdeploy": {
      source: "iana"
    },
    "application/vnd.osgeo.mapguide.package": {
      source: "iana",
      extensions: ["mgp"]
    },
    "application/vnd.osgi.bundle": {
      source: "iana"
    },
    "application/vnd.osgi.dp": {
      source: "iana",
      extensions: ["dp"]
    },
    "application/vnd.osgi.subsystem": {
      source: "iana",
      extensions: ["esa"]
    },
    "application/vnd.otps.ct-kip+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oxli.countgraph": {
      source: "iana"
    },
    "application/vnd.pagerduty+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.palm": {
      source: "iana",
      extensions: ["pdb", "pqa", "oprc"]
    },
    "application/vnd.panoply": {
      source: "iana"
    },
    "application/vnd.paos.xml": {
      source: "iana"
    },
    "application/vnd.patentdive": {
      source: "iana"
    },
    "application/vnd.patientecommsdoc": {
      source: "iana"
    },
    "application/vnd.pawaafile": {
      source: "iana",
      extensions: ["paw"]
    },
    "application/vnd.pcos": {
      source: "iana"
    },
    "application/vnd.pg.format": {
      source: "iana",
      extensions: ["str"]
    },
    "application/vnd.pg.osasli": {
      source: "iana",
      extensions: ["ei6"]
    },
    "application/vnd.piaccess.application-licence": {
      source: "iana"
    },
    "application/vnd.picsel": {
      source: "iana",
      extensions: ["efif"]
    },
    "application/vnd.pmi.widget": {
      source: "iana",
      extensions: ["wg"]
    },
    "application/vnd.poc.group-advertisement+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.pocketlearn": {
      source: "iana",
      extensions: ["plf"]
    },
    "application/vnd.powerbuilder6": {
      source: "iana",
      extensions: ["pbd"]
    },
    "application/vnd.powerbuilder6-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder7": {
      source: "iana"
    },
    "application/vnd.powerbuilder7-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder75": {
      source: "iana"
    },
    "application/vnd.powerbuilder75-s": {
      source: "iana"
    },
    "application/vnd.preminet": {
      source: "iana"
    },
    "application/vnd.previewsystems.box": {
      source: "iana",
      extensions: ["box"]
    },
    "application/vnd.proteus.magazine": {
      source: "iana",
      extensions: ["mgz"]
    },
    "application/vnd.psfs": {
      source: "iana"
    },
    "application/vnd.publishare-delta-tree": {
      source: "iana",
      extensions: ["qps"]
    },
    "application/vnd.pvi.ptid1": {
      source: "iana",
      extensions: ["ptid"]
    },
    "application/vnd.pwg-multiplexed": {
      source: "iana"
    },
    "application/vnd.pwg-xhtml-print+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.qualcomm.brew-app-res": {
      source: "iana"
    },
    "application/vnd.quarantainenet": {
      source: "iana"
    },
    "application/vnd.quark.quarkxpress": {
      source: "iana",
      extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
    },
    "application/vnd.quobject-quoxdocument": {
      source: "iana"
    },
    "application/vnd.radisys.moml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-stream+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-base+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-detect+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-group+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-speech+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-transform+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rainstor.data": {
      source: "iana"
    },
    "application/vnd.rapid": {
      source: "iana"
    },
    "application/vnd.rar": {
      source: "iana",
      extensions: ["rar"]
    },
    "application/vnd.realvnc.bed": {
      source: "iana",
      extensions: ["bed"]
    },
    "application/vnd.recordare.musicxml": {
      source: "iana",
      extensions: ["mxl"]
    },
    "application/vnd.recordare.musicxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musicxml"]
    },
    "application/vnd.renlearn.rlprint": {
      source: "iana"
    },
    "application/vnd.resilient.logic": {
      source: "iana"
    },
    "application/vnd.restful+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rig.cryptonote": {
      source: "iana",
      extensions: ["cryptonote"]
    },
    "application/vnd.rim.cod": {
      source: "apache",
      extensions: ["cod"]
    },
    "application/vnd.rn-realmedia": {
      source: "apache",
      extensions: ["rm"]
    },
    "application/vnd.rn-realmedia-vbr": {
      source: "apache",
      extensions: ["rmvb"]
    },
    "application/vnd.route66.link66+xml": {
      source: "iana",
      compressible: true,
      extensions: ["link66"]
    },
    "application/vnd.rs-274x": {
      source: "iana"
    },
    "application/vnd.ruckus.download": {
      source: "iana"
    },
    "application/vnd.s3sms": {
      source: "iana"
    },
    "application/vnd.sailingtracker.track": {
      source: "iana",
      extensions: ["st"]
    },
    "application/vnd.sar": {
      source: "iana"
    },
    "application/vnd.sbm.cid": {
      source: "iana"
    },
    "application/vnd.sbm.mid2": {
      source: "iana"
    },
    "application/vnd.scribus": {
      source: "iana"
    },
    "application/vnd.sealed.3df": {
      source: "iana"
    },
    "application/vnd.sealed.csf": {
      source: "iana"
    },
    "application/vnd.sealed.doc": {
      source: "iana"
    },
    "application/vnd.sealed.eml": {
      source: "iana"
    },
    "application/vnd.sealed.mht": {
      source: "iana"
    },
    "application/vnd.sealed.net": {
      source: "iana"
    },
    "application/vnd.sealed.ppt": {
      source: "iana"
    },
    "application/vnd.sealed.tiff": {
      source: "iana"
    },
    "application/vnd.sealed.xls": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.html": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.pdf": {
      source: "iana"
    },
    "application/vnd.seemail": {
      source: "iana",
      extensions: ["see"]
    },
    "application/vnd.seis+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.sema": {
      source: "iana",
      extensions: ["sema"]
    },
    "application/vnd.semd": {
      source: "iana",
      extensions: ["semd"]
    },
    "application/vnd.semf": {
      source: "iana",
      extensions: ["semf"]
    },
    "application/vnd.shade-save-file": {
      source: "iana"
    },
    "application/vnd.shana.informed.formdata": {
      source: "iana",
      extensions: ["ifm"]
    },
    "application/vnd.shana.informed.formtemplate": {
      source: "iana",
      extensions: ["itp"]
    },
    "application/vnd.shana.informed.interchange": {
      source: "iana",
      extensions: ["iif"]
    },
    "application/vnd.shana.informed.package": {
      source: "iana",
      extensions: ["ipk"]
    },
    "application/vnd.shootproof+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shopkick+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shp": {
      source: "iana"
    },
    "application/vnd.shx": {
      source: "iana"
    },
    "application/vnd.sigrok.session": {
      source: "iana"
    },
    "application/vnd.simtech-mindmapper": {
      source: "iana",
      extensions: ["twd", "twds"]
    },
    "application/vnd.siren+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.smaf": {
      source: "iana",
      extensions: ["mmf"]
    },
    "application/vnd.smart.notebook": {
      source: "iana"
    },
    "application/vnd.smart.teacher": {
      source: "iana",
      extensions: ["teacher"]
    },
    "application/vnd.snesdev-page-table": {
      source: "iana"
    },
    "application/vnd.software602.filler.form+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fo"]
    },
    "application/vnd.software602.filler.form-xml-zip": {
      source: "iana"
    },
    "application/vnd.solent.sdkm+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sdkm", "sdkd"]
    },
    "application/vnd.spotfire.dxp": {
      source: "iana",
      extensions: ["dxp"]
    },
    "application/vnd.spotfire.sfs": {
      source: "iana",
      extensions: ["sfs"]
    },
    "application/vnd.sqlite3": {
      source: "iana"
    },
    "application/vnd.sss-cod": {
      source: "iana"
    },
    "application/vnd.sss-dtf": {
      source: "iana"
    },
    "application/vnd.sss-ntf": {
      source: "iana"
    },
    "application/vnd.stardivision.calc": {
      source: "apache",
      extensions: ["sdc"]
    },
    "application/vnd.stardivision.draw": {
      source: "apache",
      extensions: ["sda"]
    },
    "application/vnd.stardivision.impress": {
      source: "apache",
      extensions: ["sdd"]
    },
    "application/vnd.stardivision.math": {
      source: "apache",
      extensions: ["smf"]
    },
    "application/vnd.stardivision.writer": {
      source: "apache",
      extensions: ["sdw", "vor"]
    },
    "application/vnd.stardivision.writer-global": {
      source: "apache",
      extensions: ["sgl"]
    },
    "application/vnd.stepmania.package": {
      source: "iana",
      extensions: ["smzip"]
    },
    "application/vnd.stepmania.stepchart": {
      source: "iana",
      extensions: ["sm"]
    },
    "application/vnd.street-stream": {
      source: "iana"
    },
    "application/vnd.sun.wadl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wadl"]
    },
    "application/vnd.sun.xml.calc": {
      source: "apache",
      extensions: ["sxc"]
    },
    "application/vnd.sun.xml.calc.template": {
      source: "apache",
      extensions: ["stc"]
    },
    "application/vnd.sun.xml.draw": {
      source: "apache",
      extensions: ["sxd"]
    },
    "application/vnd.sun.xml.draw.template": {
      source: "apache",
      extensions: ["std"]
    },
    "application/vnd.sun.xml.impress": {
      source: "apache",
      extensions: ["sxi"]
    },
    "application/vnd.sun.xml.impress.template": {
      source: "apache",
      extensions: ["sti"]
    },
    "application/vnd.sun.xml.math": {
      source: "apache",
      extensions: ["sxm"]
    },
    "application/vnd.sun.xml.writer": {
      source: "apache",
      extensions: ["sxw"]
    },
    "application/vnd.sun.xml.writer.global": {
      source: "apache",
      extensions: ["sxg"]
    },
    "application/vnd.sun.xml.writer.template": {
      source: "apache",
      extensions: ["stw"]
    },
    "application/vnd.sus-calendar": {
      source: "iana",
      extensions: ["sus", "susp"]
    },
    "application/vnd.svd": {
      source: "iana",
      extensions: ["svd"]
    },
    "application/vnd.swiftview-ics": {
      source: "iana"
    },
    "application/vnd.sycle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.syft+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.symbian.install": {
      source: "apache",
      extensions: ["sis", "sisx"]
    },
    "application/vnd.syncml+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xsm"]
    },
    "application/vnd.syncml.dm+wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["bdm"]
    },
    "application/vnd.syncml.dm+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xdm"]
    },
    "application/vnd.syncml.dm.notification": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["ddf"]
    },
    "application/vnd.syncml.dmtnds+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmtnds+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.syncml.ds.notification": {
      source: "iana"
    },
    "application/vnd.tableschema+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tao.intent-module-archive": {
      source: "iana",
      extensions: ["tao"]
    },
    "application/vnd.tcpdump.pcap": {
      source: "iana",
      extensions: ["pcap", "cap", "dmp"]
    },
    "application/vnd.think-cell.ppttc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tmd.mediaflex.api+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tml": {
      source: "iana"
    },
    "application/vnd.tmobile-livetv": {
      source: "iana",
      extensions: ["tmo"]
    },
    "application/vnd.tri.onesource": {
      source: "iana"
    },
    "application/vnd.trid.tpt": {
      source: "iana",
      extensions: ["tpt"]
    },
    "application/vnd.triscape.mxs": {
      source: "iana",
      extensions: ["mxs"]
    },
    "application/vnd.trueapp": {
      source: "iana",
      extensions: ["tra"]
    },
    "application/vnd.truedoc": {
      source: "iana"
    },
    "application/vnd.ubisoft.webplayer": {
      source: "iana"
    },
    "application/vnd.ufdl": {
      source: "iana",
      extensions: ["ufd", "ufdl"]
    },
    "application/vnd.uiq.theme": {
      source: "iana",
      extensions: ["utz"]
    },
    "application/vnd.umajin": {
      source: "iana",
      extensions: ["umj"]
    },
    "application/vnd.unity": {
      source: "iana",
      extensions: ["unityweb"]
    },
    "application/vnd.uoml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uoml"]
    },
    "application/vnd.uplanet.alert": {
      source: "iana"
    },
    "application/vnd.uplanet.alert-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.channel": {
      source: "iana"
    },
    "application/vnd.uplanet.channel-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.list": {
      source: "iana"
    },
    "application/vnd.uplanet.list-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.signal": {
      source: "iana"
    },
    "application/vnd.uri-map": {
      source: "iana"
    },
    "application/vnd.valve.source.material": {
      source: "iana"
    },
    "application/vnd.vcx": {
      source: "iana",
      extensions: ["vcx"]
    },
    "application/vnd.vd-study": {
      source: "iana"
    },
    "application/vnd.vectorworks": {
      source: "iana"
    },
    "application/vnd.vel+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.verimatrix.vcas": {
      source: "iana"
    },
    "application/vnd.veritone.aion+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.veryant.thin": {
      source: "iana"
    },
    "application/vnd.ves.encrypted": {
      source: "iana"
    },
    "application/vnd.vidsoft.vidconference": {
      source: "iana"
    },
    "application/vnd.visio": {
      source: "iana",
      extensions: ["vsd", "vst", "vss", "vsw"]
    },
    "application/vnd.visionary": {
      source: "iana",
      extensions: ["vis"]
    },
    "application/vnd.vividence.scriptfile": {
      source: "iana"
    },
    "application/vnd.vsf": {
      source: "iana",
      extensions: ["vsf"]
    },
    "application/vnd.wap.sic": {
      source: "iana"
    },
    "application/vnd.wap.slc": {
      source: "iana"
    },
    "application/vnd.wap.wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["wbxml"]
    },
    "application/vnd.wap.wmlc": {
      source: "iana",
      extensions: ["wmlc"]
    },
    "application/vnd.wap.wmlscriptc": {
      source: "iana",
      extensions: ["wmlsc"]
    },
    "application/vnd.webturbo": {
      source: "iana",
      extensions: ["wtb"]
    },
    "application/vnd.wfa.dpp": {
      source: "iana"
    },
    "application/vnd.wfa.p2p": {
      source: "iana"
    },
    "application/vnd.wfa.wsc": {
      source: "iana"
    },
    "application/vnd.windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.wmc": {
      source: "iana"
    },
    "application/vnd.wmf.bootstrap": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica.package": {
      source: "iana"
    },
    "application/vnd.wolfram.player": {
      source: "iana",
      extensions: ["nbp"]
    },
    "application/vnd.wordperfect": {
      source: "iana",
      extensions: ["wpd"]
    },
    "application/vnd.wqd": {
      source: "iana",
      extensions: ["wqd"]
    },
    "application/vnd.wrq-hp3000-labelled": {
      source: "iana"
    },
    "application/vnd.wt.stf": {
      source: "iana",
      extensions: ["stf"]
    },
    "application/vnd.wv.csp+wbxml": {
      source: "iana"
    },
    "application/vnd.wv.csp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.wv.ssp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xacml+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xara": {
      source: "iana",
      extensions: ["xar"]
    },
    "application/vnd.xfdl": {
      source: "iana",
      extensions: ["xfdl"]
    },
    "application/vnd.xfdl.webform": {
      source: "iana"
    },
    "application/vnd.xmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xmpie.cpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.dpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.plan": {
      source: "iana"
    },
    "application/vnd.xmpie.ppkg": {
      source: "iana"
    },
    "application/vnd.xmpie.xlim": {
      source: "iana"
    },
    "application/vnd.yamaha.hv-dic": {
      source: "iana",
      extensions: ["hvd"]
    },
    "application/vnd.yamaha.hv-script": {
      source: "iana",
      extensions: ["hvs"]
    },
    "application/vnd.yamaha.hv-voice": {
      source: "iana",
      extensions: ["hvp"]
    },
    "application/vnd.yamaha.openscoreformat": {
      source: "iana",
      extensions: ["osf"]
    },
    "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osfpvg"]
    },
    "application/vnd.yamaha.remote-setup": {
      source: "iana"
    },
    "application/vnd.yamaha.smaf-audio": {
      source: "iana",
      extensions: ["saf"]
    },
    "application/vnd.yamaha.smaf-phrase": {
      source: "iana",
      extensions: ["spf"]
    },
    "application/vnd.yamaha.through-ngn": {
      source: "iana"
    },
    "application/vnd.yamaha.tunnel-udpencap": {
      source: "iana"
    },
    "application/vnd.yaoweme": {
      source: "iana"
    },
    "application/vnd.yellowriver-custom-menu": {
      source: "iana",
      extensions: ["cmp"]
    },
    "application/vnd.youtube.yt": {
      source: "iana"
    },
    "application/vnd.zul": {
      source: "iana",
      extensions: ["zir", "zirz"]
    },
    "application/vnd.zzazz.deck+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zaz"]
    },
    "application/voicexml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["vxml"]
    },
    "application/voucher-cms+json": {
      source: "iana",
      compressible: true
    },
    "application/vq-rtcpxr": {
      source: "iana"
    },
    "application/wasm": {
      source: "iana",
      compressible: true,
      extensions: ["wasm"]
    },
    "application/watcherinfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wif"]
    },
    "application/webpush-options+json": {
      source: "iana",
      compressible: true
    },
    "application/whoispp-query": {
      source: "iana"
    },
    "application/whoispp-response": {
      source: "iana"
    },
    "application/widget": {
      source: "iana",
      extensions: ["wgt"]
    },
    "application/winhlp": {
      source: "apache",
      extensions: ["hlp"]
    },
    "application/wita": {
      source: "iana"
    },
    "application/wordperfect5.1": {
      source: "iana"
    },
    "application/wsdl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wsdl"]
    },
    "application/wspolicy+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wspolicy"]
    },
    "application/x-7z-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["7z"]
    },
    "application/x-abiword": {
      source: "apache",
      extensions: ["abw"]
    },
    "application/x-ace-compressed": {
      source: "apache",
      extensions: ["ace"]
    },
    "application/x-amf": {
      source: "apache"
    },
    "application/x-apple-diskimage": {
      source: "apache",
      extensions: ["dmg"]
    },
    "application/x-arj": {
      compressible: false,
      extensions: ["arj"]
    },
    "application/x-authorware-bin": {
      source: "apache",
      extensions: ["aab", "x32", "u32", "vox"]
    },
    "application/x-authorware-map": {
      source: "apache",
      extensions: ["aam"]
    },
    "application/x-authorware-seg": {
      source: "apache",
      extensions: ["aas"]
    },
    "application/x-bcpio": {
      source: "apache",
      extensions: ["bcpio"]
    },
    "application/x-bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/x-bittorrent": {
      source: "apache",
      extensions: ["torrent"]
    },
    "application/x-blorb": {
      source: "apache",
      extensions: ["blb", "blorb"]
    },
    "application/x-bzip": {
      source: "apache",
      compressible: false,
      extensions: ["bz"]
    },
    "application/x-bzip2": {
      source: "apache",
      compressible: false,
      extensions: ["bz2", "boz"]
    },
    "application/x-cbr": {
      source: "apache",
      extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
    },
    "application/x-cdlink": {
      source: "apache",
      extensions: ["vcd"]
    },
    "application/x-cfs-compressed": {
      source: "apache",
      extensions: ["cfs"]
    },
    "application/x-chat": {
      source: "apache",
      extensions: ["chat"]
    },
    "application/x-chess-pgn": {
      source: "apache",
      extensions: ["pgn"]
    },
    "application/x-chrome-extension": {
      extensions: ["crx"]
    },
    "application/x-cocoa": {
      source: "nginx",
      extensions: ["cco"]
    },
    "application/x-compress": {
      source: "apache"
    },
    "application/x-conference": {
      source: "apache",
      extensions: ["nsc"]
    },
    "application/x-cpio": {
      source: "apache",
      extensions: ["cpio"]
    },
    "application/x-csh": {
      source: "apache",
      extensions: ["csh"]
    },
    "application/x-deb": {
      compressible: false
    },
    "application/x-debian-package": {
      source: "apache",
      extensions: ["deb", "udeb"]
    },
    "application/x-dgc-compressed": {
      source: "apache",
      extensions: ["dgc"]
    },
    "application/x-director": {
      source: "apache",
      extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
    },
    "application/x-doom": {
      source: "apache",
      extensions: ["wad"]
    },
    "application/x-dtbncx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ncx"]
    },
    "application/x-dtbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dtb"]
    },
    "application/x-dtbresource+xml": {
      source: "apache",
      compressible: true,
      extensions: ["res"]
    },
    "application/x-dvi": {
      source: "apache",
      compressible: false,
      extensions: ["dvi"]
    },
    "application/x-envoy": {
      source: "apache",
      extensions: ["evy"]
    },
    "application/x-eva": {
      source: "apache",
      extensions: ["eva"]
    },
    "application/x-font-bdf": {
      source: "apache",
      extensions: ["bdf"]
    },
    "application/x-font-dos": {
      source: "apache"
    },
    "application/x-font-framemaker": {
      source: "apache"
    },
    "application/x-font-ghostscript": {
      source: "apache",
      extensions: ["gsf"]
    },
    "application/x-font-libgrx": {
      source: "apache"
    },
    "application/x-font-linux-psf": {
      source: "apache",
      extensions: ["psf"]
    },
    "application/x-font-pcf": {
      source: "apache",
      extensions: ["pcf"]
    },
    "application/x-font-snf": {
      source: "apache",
      extensions: ["snf"]
    },
    "application/x-font-speedo": {
      source: "apache"
    },
    "application/x-font-sunos-news": {
      source: "apache"
    },
    "application/x-font-type1": {
      source: "apache",
      extensions: ["pfa", "pfb", "pfm", "afm"]
    },
    "application/x-font-vfont": {
      source: "apache"
    },
    "application/x-freearc": {
      source: "apache",
      extensions: ["arc"]
    },
    "application/x-futuresplash": {
      source: "apache",
      extensions: ["spl"]
    },
    "application/x-gca-compressed": {
      source: "apache",
      extensions: ["gca"]
    },
    "application/x-glulx": {
      source: "apache",
      extensions: ["ulx"]
    },
    "application/x-gnumeric": {
      source: "apache",
      extensions: ["gnumeric"]
    },
    "application/x-gramps-xml": {
      source: "apache",
      extensions: ["gramps"]
    },
    "application/x-gtar": {
      source: "apache",
      extensions: ["gtar"]
    },
    "application/x-gzip": {
      source: "apache"
    },
    "application/x-hdf": {
      source: "apache",
      extensions: ["hdf"]
    },
    "application/x-httpd-php": {
      compressible: true,
      extensions: ["php"]
    },
    "application/x-install-instructions": {
      source: "apache",
      extensions: ["install"]
    },
    "application/x-iso9660-image": {
      source: "apache",
      extensions: ["iso"]
    },
    "application/x-iwork-keynote-sffkey": {
      extensions: ["key"]
    },
    "application/x-iwork-numbers-sffnumbers": {
      extensions: ["numbers"]
    },
    "application/x-iwork-pages-sffpages": {
      extensions: ["pages"]
    },
    "application/x-java-archive-diff": {
      source: "nginx",
      extensions: ["jardiff"]
    },
    "application/x-java-jnlp-file": {
      source: "apache",
      compressible: false,
      extensions: ["jnlp"]
    },
    "application/x-javascript": {
      compressible: true
    },
    "application/x-keepass2": {
      extensions: ["kdbx"]
    },
    "application/x-latex": {
      source: "apache",
      compressible: false,
      extensions: ["latex"]
    },
    "application/x-lua-bytecode": {
      extensions: ["luac"]
    },
    "application/x-lzh-compressed": {
      source: "apache",
      extensions: ["lzh", "lha"]
    },
    "application/x-makeself": {
      source: "nginx",
      extensions: ["run"]
    },
    "application/x-mie": {
      source: "apache",
      extensions: ["mie"]
    },
    "application/x-mobipocket-ebook": {
      source: "apache",
      extensions: ["prc", "mobi"]
    },
    "application/x-mpegurl": {
      compressible: false
    },
    "application/x-ms-application": {
      source: "apache",
      extensions: ["application"]
    },
    "application/x-ms-shortcut": {
      source: "apache",
      extensions: ["lnk"]
    },
    "application/x-ms-wmd": {
      source: "apache",
      extensions: ["wmd"]
    },
    "application/x-ms-wmz": {
      source: "apache",
      extensions: ["wmz"]
    },
    "application/x-ms-xbap": {
      source: "apache",
      extensions: ["xbap"]
    },
    "application/x-msaccess": {
      source: "apache",
      extensions: ["mdb"]
    },
    "application/x-msbinder": {
      source: "apache",
      extensions: ["obd"]
    },
    "application/x-mscardfile": {
      source: "apache",
      extensions: ["crd"]
    },
    "application/x-msclip": {
      source: "apache",
      extensions: ["clp"]
    },
    "application/x-msdos-program": {
      extensions: ["exe"]
    },
    "application/x-msdownload": {
      source: "apache",
      extensions: ["exe", "dll", "com", "bat", "msi"]
    },
    "application/x-msmediaview": {
      source: "apache",
      extensions: ["mvb", "m13", "m14"]
    },
    "application/x-msmetafile": {
      source: "apache",
      extensions: ["wmf", "wmz", "emf", "emz"]
    },
    "application/x-msmoney": {
      source: "apache",
      extensions: ["mny"]
    },
    "application/x-mspublisher": {
      source: "apache",
      extensions: ["pub"]
    },
    "application/x-msschedule": {
      source: "apache",
      extensions: ["scd"]
    },
    "application/x-msterminal": {
      source: "apache",
      extensions: ["trm"]
    },
    "application/x-mswrite": {
      source: "apache",
      extensions: ["wri"]
    },
    "application/x-netcdf": {
      source: "apache",
      extensions: ["nc", "cdf"]
    },
    "application/x-ns-proxy-autoconfig": {
      compressible: true,
      extensions: ["pac"]
    },
    "application/x-nzb": {
      source: "apache",
      extensions: ["nzb"]
    },
    "application/x-perl": {
      source: "nginx",
      extensions: ["pl", "pm"]
    },
    "application/x-pilot": {
      source: "nginx",
      extensions: ["prc", "pdb"]
    },
    "application/x-pkcs12": {
      source: "apache",
      compressible: false,
      extensions: ["p12", "pfx"]
    },
    "application/x-pkcs7-certificates": {
      source: "apache",
      extensions: ["p7b", "spc"]
    },
    "application/x-pkcs7-certreqresp": {
      source: "apache",
      extensions: ["p7r"]
    },
    "application/x-pki-message": {
      source: "iana"
    },
    "application/x-rar-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["rar"]
    },
    "application/x-redhat-package-manager": {
      source: "nginx",
      extensions: ["rpm"]
    },
    "application/x-research-info-systems": {
      source: "apache",
      extensions: ["ris"]
    },
    "application/x-sea": {
      source: "nginx",
      extensions: ["sea"]
    },
    "application/x-sh": {
      source: "apache",
      compressible: true,
      extensions: ["sh"]
    },
    "application/x-shar": {
      source: "apache",
      extensions: ["shar"]
    },
    "application/x-shockwave-flash": {
      source: "apache",
      compressible: false,
      extensions: ["swf"]
    },
    "application/x-silverlight-app": {
      source: "apache",
      extensions: ["xap"]
    },
    "application/x-sql": {
      source: "apache",
      extensions: ["sql"]
    },
    "application/x-stuffit": {
      source: "apache",
      compressible: false,
      extensions: ["sit"]
    },
    "application/x-stuffitx": {
      source: "apache",
      extensions: ["sitx"]
    },
    "application/x-subrip": {
      source: "apache",
      extensions: ["srt"]
    },
    "application/x-sv4cpio": {
      source: "apache",
      extensions: ["sv4cpio"]
    },
    "application/x-sv4crc": {
      source: "apache",
      extensions: ["sv4crc"]
    },
    "application/x-t3vm-image": {
      source: "apache",
      extensions: ["t3"]
    },
    "application/x-tads": {
      source: "apache",
      extensions: ["gam"]
    },
    "application/x-tar": {
      source: "apache",
      compressible: true,
      extensions: ["tar"]
    },
    "application/x-tcl": {
      source: "apache",
      extensions: ["tcl", "tk"]
    },
    "application/x-tex": {
      source: "apache",
      extensions: ["tex"]
    },
    "application/x-tex-tfm": {
      source: "apache",
      extensions: ["tfm"]
    },
    "application/x-texinfo": {
      source: "apache",
      extensions: ["texinfo", "texi"]
    },
    "application/x-tgif": {
      source: "apache",
      extensions: ["obj"]
    },
    "application/x-ustar": {
      source: "apache",
      extensions: ["ustar"]
    },
    "application/x-virtualbox-hdd": {
      compressible: true,
      extensions: ["hdd"]
    },
    "application/x-virtualbox-ova": {
      compressible: true,
      extensions: ["ova"]
    },
    "application/x-virtualbox-ovf": {
      compressible: true,
      extensions: ["ovf"]
    },
    "application/x-virtualbox-vbox": {
      compressible: true,
      extensions: ["vbox"]
    },
    "application/x-virtualbox-vbox-extpack": {
      compressible: false,
      extensions: ["vbox-extpack"]
    },
    "application/x-virtualbox-vdi": {
      compressible: true,
      extensions: ["vdi"]
    },
    "application/x-virtualbox-vhd": {
      compressible: true,
      extensions: ["vhd"]
    },
    "application/x-virtualbox-vmdk": {
      compressible: true,
      extensions: ["vmdk"]
    },
    "application/x-wais-source": {
      source: "apache",
      extensions: ["src"]
    },
    "application/x-web-app-manifest+json": {
      compressible: true,
      extensions: ["webapp"]
    },
    "application/x-www-form-urlencoded": {
      source: "iana",
      compressible: true
    },
    "application/x-x509-ca-cert": {
      source: "iana",
      extensions: ["der", "crt", "pem"]
    },
    "application/x-x509-ca-ra-cert": {
      source: "iana"
    },
    "application/x-x509-next-ca-cert": {
      source: "iana"
    },
    "application/x-xfig": {
      source: "apache",
      extensions: ["fig"]
    },
    "application/x-xliff+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/x-xpinstall": {
      source: "apache",
      compressible: false,
      extensions: ["xpi"]
    },
    "application/x-xz": {
      source: "apache",
      extensions: ["xz"]
    },
    "application/x-zmachine": {
      source: "apache",
      extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
    },
    "application/x400-bp": {
      source: "iana"
    },
    "application/xacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/xaml+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xaml"]
    },
    "application/xcap-att+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xav"]
    },
    "application/xcap-caps+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xca"]
    },
    "application/xcap-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdf"]
    },
    "application/xcap-el+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xel"]
    },
    "application/xcap-error+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcap-ns+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xns"]
    },
    "application/xcon-conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcon-conference-info-diff+xml": {
      source: "iana",
      compressible: true
    },
    "application/xenc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xenc"]
    },
    "application/xhtml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xhtml", "xht"]
    },
    "application/xhtml-voice+xml": {
      source: "apache",
      compressible: true
    },
    "application/xliff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml", "xsl", "xsd", "rng"]
    },
    "application/xml-dtd": {
      source: "iana",
      compressible: true,
      extensions: ["dtd"]
    },
    "application/xml-external-parsed-entity": {
      source: "iana"
    },
    "application/xml-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/xmpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/xop+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xop"]
    },
    "application/xproc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xpl"]
    },
    "application/xslt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xsl", "xslt"]
    },
    "application/xspf+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xspf"]
    },
    "application/xv+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mxml", "xhvml", "xvml", "xvm"]
    },
    "application/yang": {
      source: "iana",
      extensions: ["yang"]
    },
    "application/yang-data+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-data+xml": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/yin+xml": {
      source: "iana",
      compressible: true,
      extensions: ["yin"]
    },
    "application/zip": {
      source: "iana",
      compressible: false,
      extensions: ["zip"]
    },
    "application/zlib": {
      source: "iana"
    },
    "application/zstd": {
      source: "iana"
    },
    "audio/1d-interleaved-parityfec": {
      source: "iana"
    },
    "audio/32kadpcm": {
      source: "iana"
    },
    "audio/3gpp": {
      source: "iana",
      compressible: false,
      extensions: ["3gpp"]
    },
    "audio/3gpp2": {
      source: "iana"
    },
    "audio/aac": {
      source: "iana"
    },
    "audio/ac3": {
      source: "iana"
    },
    "audio/adpcm": {
      source: "apache",
      extensions: ["adp"]
    },
    "audio/amr": {
      source: "iana",
      extensions: ["amr"]
    },
    "audio/amr-wb": {
      source: "iana"
    },
    "audio/amr-wb+": {
      source: "iana"
    },
    "audio/aptx": {
      source: "iana"
    },
    "audio/asc": {
      source: "iana"
    },
    "audio/atrac-advanced-lossless": {
      source: "iana"
    },
    "audio/atrac-x": {
      source: "iana"
    },
    "audio/atrac3": {
      source: "iana"
    },
    "audio/basic": {
      source: "iana",
      compressible: false,
      extensions: ["au", "snd"]
    },
    "audio/bv16": {
      source: "iana"
    },
    "audio/bv32": {
      source: "iana"
    },
    "audio/clearmode": {
      source: "iana"
    },
    "audio/cn": {
      source: "iana"
    },
    "audio/dat12": {
      source: "iana"
    },
    "audio/dls": {
      source: "iana"
    },
    "audio/dsr-es201108": {
      source: "iana"
    },
    "audio/dsr-es202050": {
      source: "iana"
    },
    "audio/dsr-es202211": {
      source: "iana"
    },
    "audio/dsr-es202212": {
      source: "iana"
    },
    "audio/dv": {
      source: "iana"
    },
    "audio/dvi4": {
      source: "iana"
    },
    "audio/eac3": {
      source: "iana"
    },
    "audio/encaprtp": {
      source: "iana"
    },
    "audio/evrc": {
      source: "iana"
    },
    "audio/evrc-qcp": {
      source: "iana"
    },
    "audio/evrc0": {
      source: "iana"
    },
    "audio/evrc1": {
      source: "iana"
    },
    "audio/evrcb": {
      source: "iana"
    },
    "audio/evrcb0": {
      source: "iana"
    },
    "audio/evrcb1": {
      source: "iana"
    },
    "audio/evrcnw": {
      source: "iana"
    },
    "audio/evrcnw0": {
      source: "iana"
    },
    "audio/evrcnw1": {
      source: "iana"
    },
    "audio/evrcwb": {
      source: "iana"
    },
    "audio/evrcwb0": {
      source: "iana"
    },
    "audio/evrcwb1": {
      source: "iana"
    },
    "audio/evs": {
      source: "iana"
    },
    "audio/flexfec": {
      source: "iana"
    },
    "audio/fwdred": {
      source: "iana"
    },
    "audio/g711-0": {
      source: "iana"
    },
    "audio/g719": {
      source: "iana"
    },
    "audio/g722": {
      source: "iana"
    },
    "audio/g7221": {
      source: "iana"
    },
    "audio/g723": {
      source: "iana"
    },
    "audio/g726-16": {
      source: "iana"
    },
    "audio/g726-24": {
      source: "iana"
    },
    "audio/g726-32": {
      source: "iana"
    },
    "audio/g726-40": {
      source: "iana"
    },
    "audio/g728": {
      source: "iana"
    },
    "audio/g729": {
      source: "iana"
    },
    "audio/g7291": {
      source: "iana"
    },
    "audio/g729d": {
      source: "iana"
    },
    "audio/g729e": {
      source: "iana"
    },
    "audio/gsm": {
      source: "iana"
    },
    "audio/gsm-efr": {
      source: "iana"
    },
    "audio/gsm-hr-08": {
      source: "iana"
    },
    "audio/ilbc": {
      source: "iana"
    },
    "audio/ip-mr_v2.5": {
      source: "iana"
    },
    "audio/isac": {
      source: "apache"
    },
    "audio/l16": {
      source: "iana"
    },
    "audio/l20": {
      source: "iana"
    },
    "audio/l24": {
      source: "iana",
      compressible: false
    },
    "audio/l8": {
      source: "iana"
    },
    "audio/lpc": {
      source: "iana"
    },
    "audio/melp": {
      source: "iana"
    },
    "audio/melp1200": {
      source: "iana"
    },
    "audio/melp2400": {
      source: "iana"
    },
    "audio/melp600": {
      source: "iana"
    },
    "audio/mhas": {
      source: "iana"
    },
    "audio/midi": {
      source: "apache",
      extensions: ["mid", "midi", "kar", "rmi"]
    },
    "audio/mobile-xmf": {
      source: "iana",
      extensions: ["mxmf"]
    },
    "audio/mp3": {
      compressible: false,
      extensions: ["mp3"]
    },
    "audio/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["m4a", "mp4a"]
    },
    "audio/mp4a-latm": {
      source: "iana"
    },
    "audio/mpa": {
      source: "iana"
    },
    "audio/mpa-robust": {
      source: "iana"
    },
    "audio/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
    },
    "audio/mpeg4-generic": {
      source: "iana"
    },
    "audio/musepack": {
      source: "apache"
    },
    "audio/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["oga", "ogg", "spx", "opus"]
    },
    "audio/opus": {
      source: "iana"
    },
    "audio/parityfec": {
      source: "iana"
    },
    "audio/pcma": {
      source: "iana"
    },
    "audio/pcma-wb": {
      source: "iana"
    },
    "audio/pcmu": {
      source: "iana"
    },
    "audio/pcmu-wb": {
      source: "iana"
    },
    "audio/prs.sid": {
      source: "iana"
    },
    "audio/qcelp": {
      source: "iana"
    },
    "audio/raptorfec": {
      source: "iana"
    },
    "audio/red": {
      source: "iana"
    },
    "audio/rtp-enc-aescm128": {
      source: "iana"
    },
    "audio/rtp-midi": {
      source: "iana"
    },
    "audio/rtploopback": {
      source: "iana"
    },
    "audio/rtx": {
      source: "iana"
    },
    "audio/s3m": {
      source: "apache",
      extensions: ["s3m"]
    },
    "audio/scip": {
      source: "iana"
    },
    "audio/silk": {
      source: "apache",
      extensions: ["sil"]
    },
    "audio/smv": {
      source: "iana"
    },
    "audio/smv-qcp": {
      source: "iana"
    },
    "audio/smv0": {
      source: "iana"
    },
    "audio/sofa": {
      source: "iana"
    },
    "audio/sp-midi": {
      source: "iana"
    },
    "audio/speex": {
      source: "iana"
    },
    "audio/t140c": {
      source: "iana"
    },
    "audio/t38": {
      source: "iana"
    },
    "audio/telephone-event": {
      source: "iana"
    },
    "audio/tetra_acelp": {
      source: "iana"
    },
    "audio/tetra_acelp_bb": {
      source: "iana"
    },
    "audio/tone": {
      source: "iana"
    },
    "audio/tsvcis": {
      source: "iana"
    },
    "audio/uemclip": {
      source: "iana"
    },
    "audio/ulpfec": {
      source: "iana"
    },
    "audio/usac": {
      source: "iana"
    },
    "audio/vdvi": {
      source: "iana"
    },
    "audio/vmr-wb": {
      source: "iana"
    },
    "audio/vnd.3gpp.iufp": {
      source: "iana"
    },
    "audio/vnd.4sb": {
      source: "iana"
    },
    "audio/vnd.audiokoz": {
      source: "iana"
    },
    "audio/vnd.celp": {
      source: "iana"
    },
    "audio/vnd.cisco.nse": {
      source: "iana"
    },
    "audio/vnd.cmles.radio-events": {
      source: "iana"
    },
    "audio/vnd.cns.anp1": {
      source: "iana"
    },
    "audio/vnd.cns.inf1": {
      source: "iana"
    },
    "audio/vnd.dece.audio": {
      source: "iana",
      extensions: ["uva", "uvva"]
    },
    "audio/vnd.digital-winds": {
      source: "iana",
      extensions: ["eol"]
    },
    "audio/vnd.dlna.adts": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.1": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.2": {
      source: "iana"
    },
    "audio/vnd.dolby.mlp": {
      source: "iana"
    },
    "audio/vnd.dolby.mps": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2x": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2z": {
      source: "iana"
    },
    "audio/vnd.dolby.pulse.1": {
      source: "iana"
    },
    "audio/vnd.dra": {
      source: "iana",
      extensions: ["dra"]
    },
    "audio/vnd.dts": {
      source: "iana",
      extensions: ["dts"]
    },
    "audio/vnd.dts.hd": {
      source: "iana",
      extensions: ["dtshd"]
    },
    "audio/vnd.dts.uhd": {
      source: "iana"
    },
    "audio/vnd.dvb.file": {
      source: "iana"
    },
    "audio/vnd.everad.plj": {
      source: "iana"
    },
    "audio/vnd.hns.audio": {
      source: "iana"
    },
    "audio/vnd.lucent.voice": {
      source: "iana",
      extensions: ["lvp"]
    },
    "audio/vnd.ms-playready.media.pya": {
      source: "iana",
      extensions: ["pya"]
    },
    "audio/vnd.nokia.mobile-xmf": {
      source: "iana"
    },
    "audio/vnd.nortel.vbk": {
      source: "iana"
    },
    "audio/vnd.nuera.ecelp4800": {
      source: "iana",
      extensions: ["ecelp4800"]
    },
    "audio/vnd.nuera.ecelp7470": {
      source: "iana",
      extensions: ["ecelp7470"]
    },
    "audio/vnd.nuera.ecelp9600": {
      source: "iana",
      extensions: ["ecelp9600"]
    },
    "audio/vnd.octel.sbc": {
      source: "iana"
    },
    "audio/vnd.presonus.multitrack": {
      source: "iana"
    },
    "audio/vnd.qcelp": {
      source: "iana"
    },
    "audio/vnd.rhetorex.32kadpcm": {
      source: "iana"
    },
    "audio/vnd.rip": {
      source: "iana",
      extensions: ["rip"]
    },
    "audio/vnd.rn-realaudio": {
      compressible: false
    },
    "audio/vnd.sealedmedia.softseal.mpeg": {
      source: "iana"
    },
    "audio/vnd.vmx.cvsd": {
      source: "iana"
    },
    "audio/vnd.wave": {
      compressible: false
    },
    "audio/vorbis": {
      source: "iana",
      compressible: false
    },
    "audio/vorbis-config": {
      source: "iana"
    },
    "audio/wav": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/wave": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/webm": {
      source: "apache",
      compressible: false,
      extensions: ["weba"]
    },
    "audio/x-aac": {
      source: "apache",
      compressible: false,
      extensions: ["aac"]
    },
    "audio/x-aiff": {
      source: "apache",
      extensions: ["aif", "aiff", "aifc"]
    },
    "audio/x-caf": {
      source: "apache",
      compressible: false,
      extensions: ["caf"]
    },
    "audio/x-flac": {
      source: "apache",
      extensions: ["flac"]
    },
    "audio/x-m4a": {
      source: "nginx",
      extensions: ["m4a"]
    },
    "audio/x-matroska": {
      source: "apache",
      extensions: ["mka"]
    },
    "audio/x-mpegurl": {
      source: "apache",
      extensions: ["m3u"]
    },
    "audio/x-ms-wax": {
      source: "apache",
      extensions: ["wax"]
    },
    "audio/x-ms-wma": {
      source: "apache",
      extensions: ["wma"]
    },
    "audio/x-pn-realaudio": {
      source: "apache",
      extensions: ["ram", "ra"]
    },
    "audio/x-pn-realaudio-plugin": {
      source: "apache",
      extensions: ["rmp"]
    },
    "audio/x-realaudio": {
      source: "nginx",
      extensions: ["ra"]
    },
    "audio/x-tta": {
      source: "apache"
    },
    "audio/x-wav": {
      source: "apache",
      extensions: ["wav"]
    },
    "audio/xm": {
      source: "apache",
      extensions: ["xm"]
    },
    "chemical/x-cdx": {
      source: "apache",
      extensions: ["cdx"]
    },
    "chemical/x-cif": {
      source: "apache",
      extensions: ["cif"]
    },
    "chemical/x-cmdf": {
      source: "apache",
      extensions: ["cmdf"]
    },
    "chemical/x-cml": {
      source: "apache",
      extensions: ["cml"]
    },
    "chemical/x-csml": {
      source: "apache",
      extensions: ["csml"]
    },
    "chemical/x-pdb": {
      source: "apache"
    },
    "chemical/x-xyz": {
      source: "apache",
      extensions: ["xyz"]
    },
    "font/collection": {
      source: "iana",
      extensions: ["ttc"]
    },
    "font/otf": {
      source: "iana",
      compressible: true,
      extensions: ["otf"]
    },
    "font/sfnt": {
      source: "iana"
    },
    "font/ttf": {
      source: "iana",
      compressible: true,
      extensions: ["ttf"]
    },
    "font/woff": {
      source: "iana",
      extensions: ["woff"]
    },
    "font/woff2": {
      source: "iana",
      extensions: ["woff2"]
    },
    "image/aces": {
      source: "iana",
      extensions: ["exr"]
    },
    "image/apng": {
      compressible: false,
      extensions: ["apng"]
    },
    "image/avci": {
      source: "iana",
      extensions: ["avci"]
    },
    "image/avcs": {
      source: "iana",
      extensions: ["avcs"]
    },
    "image/avif": {
      source: "iana",
      compressible: false,
      extensions: ["avif"]
    },
    "image/bmp": {
      source: "iana",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/cgm": {
      source: "iana",
      extensions: ["cgm"]
    },
    "image/dicom-rle": {
      source: "iana",
      extensions: ["drle"]
    },
    "image/emf": {
      source: "iana",
      extensions: ["emf"]
    },
    "image/fits": {
      source: "iana",
      extensions: ["fits"]
    },
    "image/g3fax": {
      source: "iana",
      extensions: ["g3"]
    },
    "image/gif": {
      source: "iana",
      compressible: false,
      extensions: ["gif"]
    },
    "image/heic": {
      source: "iana",
      extensions: ["heic"]
    },
    "image/heic-sequence": {
      source: "iana",
      extensions: ["heics"]
    },
    "image/heif": {
      source: "iana",
      extensions: ["heif"]
    },
    "image/heif-sequence": {
      source: "iana",
      extensions: ["heifs"]
    },
    "image/hej2k": {
      source: "iana",
      extensions: ["hej2"]
    },
    "image/hsj2": {
      source: "iana",
      extensions: ["hsj2"]
    },
    "image/ief": {
      source: "iana",
      extensions: ["ief"]
    },
    "image/jls": {
      source: "iana",
      extensions: ["jls"]
    },
    "image/jp2": {
      source: "iana",
      compressible: false,
      extensions: ["jp2", "jpg2"]
    },
    "image/jpeg": {
      source: "iana",
      compressible: false,
      extensions: ["jpeg", "jpg", "jpe"]
    },
    "image/jph": {
      source: "iana",
      extensions: ["jph"]
    },
    "image/jphc": {
      source: "iana",
      extensions: ["jhc"]
    },
    "image/jpm": {
      source: "iana",
      compressible: false,
      extensions: ["jpm"]
    },
    "image/jpx": {
      source: "iana",
      compressible: false,
      extensions: ["jpx", "jpf"]
    },
    "image/jxr": {
      source: "iana",
      extensions: ["jxr"]
    },
    "image/jxra": {
      source: "iana",
      extensions: ["jxra"]
    },
    "image/jxrs": {
      source: "iana",
      extensions: ["jxrs"]
    },
    "image/jxs": {
      source: "iana",
      extensions: ["jxs"]
    },
    "image/jxsc": {
      source: "iana",
      extensions: ["jxsc"]
    },
    "image/jxsi": {
      source: "iana",
      extensions: ["jxsi"]
    },
    "image/jxss": {
      source: "iana",
      extensions: ["jxss"]
    },
    "image/ktx": {
      source: "iana",
      extensions: ["ktx"]
    },
    "image/ktx2": {
      source: "iana",
      extensions: ["ktx2"]
    },
    "image/naplps": {
      source: "iana"
    },
    "image/pjpeg": {
      compressible: false
    },
    "image/png": {
      source: "iana",
      compressible: false,
      extensions: ["png"]
    },
    "image/prs.btif": {
      source: "iana",
      extensions: ["btif"]
    },
    "image/prs.pti": {
      source: "iana",
      extensions: ["pti"]
    },
    "image/pwg-raster": {
      source: "iana"
    },
    "image/sgi": {
      source: "apache",
      extensions: ["sgi"]
    },
    "image/svg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["svg", "svgz"]
    },
    "image/t38": {
      source: "iana",
      extensions: ["t38"]
    },
    "image/tiff": {
      source: "iana",
      compressible: false,
      extensions: ["tif", "tiff"]
    },
    "image/tiff-fx": {
      source: "iana",
      extensions: ["tfx"]
    },
    "image/vnd.adobe.photoshop": {
      source: "iana",
      compressible: true,
      extensions: ["psd"]
    },
    "image/vnd.airzip.accelerator.azv": {
      source: "iana",
      extensions: ["azv"]
    },
    "image/vnd.cns.inf2": {
      source: "iana"
    },
    "image/vnd.dece.graphic": {
      source: "iana",
      extensions: ["uvi", "uvvi", "uvg", "uvvg"]
    },
    "image/vnd.djvu": {
      source: "iana",
      extensions: ["djvu", "djv"]
    },
    "image/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "image/vnd.dwg": {
      source: "iana",
      extensions: ["dwg"]
    },
    "image/vnd.dxf": {
      source: "iana",
      extensions: ["dxf"]
    },
    "image/vnd.fastbidsheet": {
      source: "iana",
      extensions: ["fbs"]
    },
    "image/vnd.fpx": {
      source: "iana",
      extensions: ["fpx"]
    },
    "image/vnd.fst": {
      source: "iana",
      extensions: ["fst"]
    },
    "image/vnd.fujixerox.edmics-mmr": {
      source: "iana",
      extensions: ["mmr"]
    },
    "image/vnd.fujixerox.edmics-rlc": {
      source: "iana",
      extensions: ["rlc"]
    },
    "image/vnd.globalgraphics.pgb": {
      source: "iana"
    },
    "image/vnd.microsoft.icon": {
      source: "iana",
      compressible: true,
      extensions: ["ico"]
    },
    "image/vnd.mix": {
      source: "iana"
    },
    "image/vnd.mozilla.apng": {
      source: "iana"
    },
    "image/vnd.ms-dds": {
      compressible: true,
      extensions: ["dds"]
    },
    "image/vnd.ms-modi": {
      source: "iana",
      extensions: ["mdi"]
    },
    "image/vnd.ms-photo": {
      source: "apache",
      extensions: ["wdp"]
    },
    "image/vnd.net-fpx": {
      source: "iana",
      extensions: ["npx"]
    },
    "image/vnd.pco.b16": {
      source: "iana",
      extensions: ["b16"]
    },
    "image/vnd.radiance": {
      source: "iana"
    },
    "image/vnd.sealed.png": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.gif": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.jpg": {
      source: "iana"
    },
    "image/vnd.svf": {
      source: "iana"
    },
    "image/vnd.tencent.tap": {
      source: "iana",
      extensions: ["tap"]
    },
    "image/vnd.valve.source.texture": {
      source: "iana",
      extensions: ["vtf"]
    },
    "image/vnd.wap.wbmp": {
      source: "iana",
      extensions: ["wbmp"]
    },
    "image/vnd.xiff": {
      source: "iana",
      extensions: ["xif"]
    },
    "image/vnd.zbrush.pcx": {
      source: "iana",
      extensions: ["pcx"]
    },
    "image/webp": {
      source: "apache",
      extensions: ["webp"]
    },
    "image/wmf": {
      source: "iana",
      extensions: ["wmf"]
    },
    "image/x-3ds": {
      source: "apache",
      extensions: ["3ds"]
    },
    "image/x-cmu-raster": {
      source: "apache",
      extensions: ["ras"]
    },
    "image/x-cmx": {
      source: "apache",
      extensions: ["cmx"]
    },
    "image/x-freehand": {
      source: "apache",
      extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
    },
    "image/x-icon": {
      source: "apache",
      compressible: true,
      extensions: ["ico"]
    },
    "image/x-jng": {
      source: "nginx",
      extensions: ["jng"]
    },
    "image/x-mrsid-image": {
      source: "apache",
      extensions: ["sid"]
    },
    "image/x-ms-bmp": {
      source: "nginx",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/x-pcx": {
      source: "apache",
      extensions: ["pcx"]
    },
    "image/x-pict": {
      source: "apache",
      extensions: ["pic", "pct"]
    },
    "image/x-portable-anymap": {
      source: "apache",
      extensions: ["pnm"]
    },
    "image/x-portable-bitmap": {
      source: "apache",
      extensions: ["pbm"]
    },
    "image/x-portable-graymap": {
      source: "apache",
      extensions: ["pgm"]
    },
    "image/x-portable-pixmap": {
      source: "apache",
      extensions: ["ppm"]
    },
    "image/x-rgb": {
      source: "apache",
      extensions: ["rgb"]
    },
    "image/x-tga": {
      source: "apache",
      extensions: ["tga"]
    },
    "image/x-xbitmap": {
      source: "apache",
      extensions: ["xbm"]
    },
    "image/x-xcf": {
      compressible: false
    },
    "image/x-xpixmap": {
      source: "apache",
      extensions: ["xpm"]
    },
    "image/x-xwindowdump": {
      source: "apache",
      extensions: ["xwd"]
    },
    "message/cpim": {
      source: "iana"
    },
    "message/delivery-status": {
      source: "iana"
    },
    "message/disposition-notification": {
      source: "iana",
      extensions: [
        "disposition-notification"
      ]
    },
    "message/external-body": {
      source: "iana"
    },
    "message/feedback-report": {
      source: "iana"
    },
    "message/global": {
      source: "iana",
      extensions: ["u8msg"]
    },
    "message/global-delivery-status": {
      source: "iana",
      extensions: ["u8dsn"]
    },
    "message/global-disposition-notification": {
      source: "iana",
      extensions: ["u8mdn"]
    },
    "message/global-headers": {
      source: "iana",
      extensions: ["u8hdr"]
    },
    "message/http": {
      source: "iana",
      compressible: false
    },
    "message/imdn+xml": {
      source: "iana",
      compressible: true
    },
    "message/news": {
      source: "iana"
    },
    "message/partial": {
      source: "iana",
      compressible: false
    },
    "message/rfc822": {
      source: "iana",
      compressible: true,
      extensions: ["eml", "mime"]
    },
    "message/s-http": {
      source: "iana"
    },
    "message/sip": {
      source: "iana"
    },
    "message/sipfrag": {
      source: "iana"
    },
    "message/tracking-status": {
      source: "iana"
    },
    "message/vnd.si.simp": {
      source: "iana"
    },
    "message/vnd.wfa.wsc": {
      source: "iana",
      extensions: ["wsc"]
    },
    "model/3mf": {
      source: "iana",
      extensions: ["3mf"]
    },
    "model/e57": {
      source: "iana"
    },
    "model/gltf+json": {
      source: "iana",
      compressible: true,
      extensions: ["gltf"]
    },
    "model/gltf-binary": {
      source: "iana",
      compressible: true,
      extensions: ["glb"]
    },
    "model/iges": {
      source: "iana",
      compressible: false,
      extensions: ["igs", "iges"]
    },
    "model/mesh": {
      source: "iana",
      compressible: false,
      extensions: ["msh", "mesh", "silo"]
    },
    "model/mtl": {
      source: "iana",
      extensions: ["mtl"]
    },
    "model/obj": {
      source: "iana",
      extensions: ["obj"]
    },
    "model/step": {
      source: "iana"
    },
    "model/step+xml": {
      source: "iana",
      compressible: true,
      extensions: ["stpx"]
    },
    "model/step+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpz"]
    },
    "model/step-xml+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpxz"]
    },
    "model/stl": {
      source: "iana",
      extensions: ["stl"]
    },
    "model/vnd.collada+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dae"]
    },
    "model/vnd.dwf": {
      source: "iana",
      extensions: ["dwf"]
    },
    "model/vnd.flatland.3dml": {
      source: "iana"
    },
    "model/vnd.gdl": {
      source: "iana",
      extensions: ["gdl"]
    },
    "model/vnd.gs-gdl": {
      source: "apache"
    },
    "model/vnd.gs.gdl": {
      source: "iana"
    },
    "model/vnd.gtw": {
      source: "iana",
      extensions: ["gtw"]
    },
    "model/vnd.moml+xml": {
      source: "iana",
      compressible: true
    },
    "model/vnd.mts": {
      source: "iana",
      extensions: ["mts"]
    },
    "model/vnd.opengex": {
      source: "iana",
      extensions: ["ogex"]
    },
    "model/vnd.parasolid.transmit.binary": {
      source: "iana",
      extensions: ["x_b"]
    },
    "model/vnd.parasolid.transmit.text": {
      source: "iana",
      extensions: ["x_t"]
    },
    "model/vnd.pytha.pyox": {
      source: "iana"
    },
    "model/vnd.rosette.annotated-data-model": {
      source: "iana"
    },
    "model/vnd.sap.vds": {
      source: "iana",
      extensions: ["vds"]
    },
    "model/vnd.usdz+zip": {
      source: "iana",
      compressible: false,
      extensions: ["usdz"]
    },
    "model/vnd.valve.source.compiled-map": {
      source: "iana",
      extensions: ["bsp"]
    },
    "model/vnd.vtu": {
      source: "iana",
      extensions: ["vtu"]
    },
    "model/vrml": {
      source: "iana",
      compressible: false,
      extensions: ["wrl", "vrml"]
    },
    "model/x3d+binary": {
      source: "apache",
      compressible: false,
      extensions: ["x3db", "x3dbz"]
    },
    "model/x3d+fastinfoset": {
      source: "iana",
      extensions: ["x3db"]
    },
    "model/x3d+vrml": {
      source: "apache",
      compressible: false,
      extensions: ["x3dv", "x3dvz"]
    },
    "model/x3d+xml": {
      source: "iana",
      compressible: true,
      extensions: ["x3d", "x3dz"]
    },
    "model/x3d-vrml": {
      source: "iana",
      extensions: ["x3dv"]
    },
    "multipart/alternative": {
      source: "iana",
      compressible: false
    },
    "multipart/appledouble": {
      source: "iana"
    },
    "multipart/byteranges": {
      source: "iana"
    },
    "multipart/digest": {
      source: "iana"
    },
    "multipart/encrypted": {
      source: "iana",
      compressible: false
    },
    "multipart/form-data": {
      source: "iana",
      compressible: false
    },
    "multipart/header-set": {
      source: "iana"
    },
    "multipart/mixed": {
      source: "iana"
    },
    "multipart/multilingual": {
      source: "iana"
    },
    "multipart/parallel": {
      source: "iana"
    },
    "multipart/related": {
      source: "iana",
      compressible: false
    },
    "multipart/report": {
      source: "iana"
    },
    "multipart/signed": {
      source: "iana",
      compressible: false
    },
    "multipart/vnd.bint.med-plus": {
      source: "iana"
    },
    "multipart/voice-message": {
      source: "iana"
    },
    "multipart/x-mixed-replace": {
      source: "iana"
    },
    "text/1d-interleaved-parityfec": {
      source: "iana"
    },
    "text/cache-manifest": {
      source: "iana",
      compressible: true,
      extensions: ["appcache", "manifest"]
    },
    "text/calendar": {
      source: "iana",
      extensions: ["ics", "ifb"]
    },
    "text/calender": {
      compressible: true
    },
    "text/cmd": {
      compressible: true
    },
    "text/coffeescript": {
      extensions: ["coffee", "litcoffee"]
    },
    "text/cql": {
      source: "iana"
    },
    "text/cql-expression": {
      source: "iana"
    },
    "text/cql-identifier": {
      source: "iana"
    },
    "text/css": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["css"]
    },
    "text/csv": {
      source: "iana",
      compressible: true,
      extensions: ["csv"]
    },
    "text/csv-schema": {
      source: "iana"
    },
    "text/directory": {
      source: "iana"
    },
    "text/dns": {
      source: "iana"
    },
    "text/ecmascript": {
      source: "iana"
    },
    "text/encaprtp": {
      source: "iana"
    },
    "text/enriched": {
      source: "iana"
    },
    "text/fhirpath": {
      source: "iana"
    },
    "text/flexfec": {
      source: "iana"
    },
    "text/fwdred": {
      source: "iana"
    },
    "text/gff3": {
      source: "iana"
    },
    "text/grammar-ref-list": {
      source: "iana"
    },
    "text/html": {
      source: "iana",
      compressible: true,
      extensions: ["html", "htm", "shtml"]
    },
    "text/jade": {
      extensions: ["jade"]
    },
    "text/javascript": {
      source: "iana",
      compressible: true
    },
    "text/jcr-cnd": {
      source: "iana"
    },
    "text/jsx": {
      compressible: true,
      extensions: ["jsx"]
    },
    "text/less": {
      compressible: true,
      extensions: ["less"]
    },
    "text/markdown": {
      source: "iana",
      compressible: true,
      extensions: ["markdown", "md"]
    },
    "text/mathml": {
      source: "nginx",
      extensions: ["mml"]
    },
    "text/mdx": {
      compressible: true,
      extensions: ["mdx"]
    },
    "text/mizar": {
      source: "iana"
    },
    "text/n3": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["n3"]
    },
    "text/parameters": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/parityfec": {
      source: "iana"
    },
    "text/plain": {
      source: "iana",
      compressible: true,
      extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
    },
    "text/provenance-notation": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/prs.fallenstein.rst": {
      source: "iana"
    },
    "text/prs.lines.tag": {
      source: "iana",
      extensions: ["dsc"]
    },
    "text/prs.prop.logic": {
      source: "iana"
    },
    "text/raptorfec": {
      source: "iana"
    },
    "text/red": {
      source: "iana"
    },
    "text/rfc822-headers": {
      source: "iana"
    },
    "text/richtext": {
      source: "iana",
      compressible: true,
      extensions: ["rtx"]
    },
    "text/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "text/rtp-enc-aescm128": {
      source: "iana"
    },
    "text/rtploopback": {
      source: "iana"
    },
    "text/rtx": {
      source: "iana"
    },
    "text/sgml": {
      source: "iana",
      extensions: ["sgml", "sgm"]
    },
    "text/shaclc": {
      source: "iana"
    },
    "text/shex": {
      source: "iana",
      extensions: ["shex"]
    },
    "text/slim": {
      extensions: ["slim", "slm"]
    },
    "text/spdx": {
      source: "iana",
      extensions: ["spdx"]
    },
    "text/strings": {
      source: "iana"
    },
    "text/stylus": {
      extensions: ["stylus", "styl"]
    },
    "text/t140": {
      source: "iana"
    },
    "text/tab-separated-values": {
      source: "iana",
      compressible: true,
      extensions: ["tsv"]
    },
    "text/troff": {
      source: "iana",
      extensions: ["t", "tr", "roff", "man", "me", "ms"]
    },
    "text/turtle": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["ttl"]
    },
    "text/ulpfec": {
      source: "iana"
    },
    "text/uri-list": {
      source: "iana",
      compressible: true,
      extensions: ["uri", "uris", "urls"]
    },
    "text/vcard": {
      source: "iana",
      compressible: true,
      extensions: ["vcard"]
    },
    "text/vnd.a": {
      source: "iana"
    },
    "text/vnd.abc": {
      source: "iana"
    },
    "text/vnd.ascii-art": {
      source: "iana"
    },
    "text/vnd.curl": {
      source: "iana",
      extensions: ["curl"]
    },
    "text/vnd.curl.dcurl": {
      source: "apache",
      extensions: ["dcurl"]
    },
    "text/vnd.curl.mcurl": {
      source: "apache",
      extensions: ["mcurl"]
    },
    "text/vnd.curl.scurl": {
      source: "apache",
      extensions: ["scurl"]
    },
    "text/vnd.debian.copyright": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.dmclientscript": {
      source: "iana"
    },
    "text/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "text/vnd.esmertec.theme-descriptor": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.familysearch.gedcom": {
      source: "iana",
      extensions: ["ged"]
    },
    "text/vnd.ficlab.flt": {
      source: "iana"
    },
    "text/vnd.fly": {
      source: "iana",
      extensions: ["fly"]
    },
    "text/vnd.fmi.flexstor": {
      source: "iana",
      extensions: ["flx"]
    },
    "text/vnd.gml": {
      source: "iana"
    },
    "text/vnd.graphviz": {
      source: "iana",
      extensions: ["gv"]
    },
    "text/vnd.hans": {
      source: "iana"
    },
    "text/vnd.hgl": {
      source: "iana"
    },
    "text/vnd.in3d.3dml": {
      source: "iana",
      extensions: ["3dml"]
    },
    "text/vnd.in3d.spot": {
      source: "iana",
      extensions: ["spot"]
    },
    "text/vnd.iptc.newsml": {
      source: "iana"
    },
    "text/vnd.iptc.nitf": {
      source: "iana"
    },
    "text/vnd.latex-z": {
      source: "iana"
    },
    "text/vnd.motorola.reflex": {
      source: "iana"
    },
    "text/vnd.ms-mediapackage": {
      source: "iana"
    },
    "text/vnd.net2phone.commcenter.command": {
      source: "iana"
    },
    "text/vnd.radisys.msml-basic-layout": {
      source: "iana"
    },
    "text/vnd.senx.warpscript": {
      source: "iana"
    },
    "text/vnd.si.uricatalogue": {
      source: "iana"
    },
    "text/vnd.sosi": {
      source: "iana"
    },
    "text/vnd.sun.j2me.app-descriptor": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["jad"]
    },
    "text/vnd.trolltech.linguist": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.wap.si": {
      source: "iana"
    },
    "text/vnd.wap.sl": {
      source: "iana"
    },
    "text/vnd.wap.wml": {
      source: "iana",
      extensions: ["wml"]
    },
    "text/vnd.wap.wmlscript": {
      source: "iana",
      extensions: ["wmls"]
    },
    "text/vtt": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["vtt"]
    },
    "text/x-asm": {
      source: "apache",
      extensions: ["s", "asm"]
    },
    "text/x-c": {
      source: "apache",
      extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
    },
    "text/x-component": {
      source: "nginx",
      extensions: ["htc"]
    },
    "text/x-fortran": {
      source: "apache",
      extensions: ["f", "for", "f77", "f90"]
    },
    "text/x-gwt-rpc": {
      compressible: true
    },
    "text/x-handlebars-template": {
      extensions: ["hbs"]
    },
    "text/x-java-source": {
      source: "apache",
      extensions: ["java"]
    },
    "text/x-jquery-tmpl": {
      compressible: true
    },
    "text/x-lua": {
      extensions: ["lua"]
    },
    "text/x-markdown": {
      compressible: true,
      extensions: ["mkd"]
    },
    "text/x-nfo": {
      source: "apache",
      extensions: ["nfo"]
    },
    "text/x-opml": {
      source: "apache",
      extensions: ["opml"]
    },
    "text/x-org": {
      compressible: true,
      extensions: ["org"]
    },
    "text/x-pascal": {
      source: "apache",
      extensions: ["p", "pas"]
    },
    "text/x-processing": {
      compressible: true,
      extensions: ["pde"]
    },
    "text/x-sass": {
      extensions: ["sass"]
    },
    "text/x-scss": {
      extensions: ["scss"]
    },
    "text/x-setext": {
      source: "apache",
      extensions: ["etx"]
    },
    "text/x-sfv": {
      source: "apache",
      extensions: ["sfv"]
    },
    "text/x-suse-ymp": {
      compressible: true,
      extensions: ["ymp"]
    },
    "text/x-uuencode": {
      source: "apache",
      extensions: ["uu"]
    },
    "text/x-vcalendar": {
      source: "apache",
      extensions: ["vcs"]
    },
    "text/x-vcard": {
      source: "apache",
      extensions: ["vcf"]
    },
    "text/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml"]
    },
    "text/xml-external-parsed-entity": {
      source: "iana"
    },
    "text/yaml": {
      compressible: true,
      extensions: ["yaml", "yml"]
    },
    "video/1d-interleaved-parityfec": {
      source: "iana"
    },
    "video/3gpp": {
      source: "iana",
      extensions: ["3gp", "3gpp"]
    },
    "video/3gpp-tt": {
      source: "iana"
    },
    "video/3gpp2": {
      source: "iana",
      extensions: ["3g2"]
    },
    "video/av1": {
      source: "iana"
    },
    "video/bmpeg": {
      source: "iana"
    },
    "video/bt656": {
      source: "iana"
    },
    "video/celb": {
      source: "iana"
    },
    "video/dv": {
      source: "iana"
    },
    "video/encaprtp": {
      source: "iana"
    },
    "video/ffv1": {
      source: "iana"
    },
    "video/flexfec": {
      source: "iana"
    },
    "video/h261": {
      source: "iana",
      extensions: ["h261"]
    },
    "video/h263": {
      source: "iana",
      extensions: ["h263"]
    },
    "video/h263-1998": {
      source: "iana"
    },
    "video/h263-2000": {
      source: "iana"
    },
    "video/h264": {
      source: "iana",
      extensions: ["h264"]
    },
    "video/h264-rcdo": {
      source: "iana"
    },
    "video/h264-svc": {
      source: "iana"
    },
    "video/h265": {
      source: "iana"
    },
    "video/iso.segment": {
      source: "iana",
      extensions: ["m4s"]
    },
    "video/jpeg": {
      source: "iana",
      extensions: ["jpgv"]
    },
    "video/jpeg2000": {
      source: "iana"
    },
    "video/jpm": {
      source: "apache",
      extensions: ["jpm", "jpgm"]
    },
    "video/jxsv": {
      source: "iana"
    },
    "video/mj2": {
      source: "iana",
      extensions: ["mj2", "mjp2"]
    },
    "video/mp1s": {
      source: "iana"
    },
    "video/mp2p": {
      source: "iana"
    },
    "video/mp2t": {
      source: "iana",
      extensions: ["ts"]
    },
    "video/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["mp4", "mp4v", "mpg4"]
    },
    "video/mp4v-es": {
      source: "iana"
    },
    "video/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
    },
    "video/mpeg4-generic": {
      source: "iana"
    },
    "video/mpv": {
      source: "iana"
    },
    "video/nv": {
      source: "iana"
    },
    "video/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogv"]
    },
    "video/parityfec": {
      source: "iana"
    },
    "video/pointer": {
      source: "iana"
    },
    "video/quicktime": {
      source: "iana",
      compressible: false,
      extensions: ["qt", "mov"]
    },
    "video/raptorfec": {
      source: "iana"
    },
    "video/raw": {
      source: "iana"
    },
    "video/rtp-enc-aescm128": {
      source: "iana"
    },
    "video/rtploopback": {
      source: "iana"
    },
    "video/rtx": {
      source: "iana"
    },
    "video/scip": {
      source: "iana"
    },
    "video/smpte291": {
      source: "iana"
    },
    "video/smpte292m": {
      source: "iana"
    },
    "video/ulpfec": {
      source: "iana"
    },
    "video/vc1": {
      source: "iana"
    },
    "video/vc2": {
      source: "iana"
    },
    "video/vnd.cctv": {
      source: "iana"
    },
    "video/vnd.dece.hd": {
      source: "iana",
      extensions: ["uvh", "uvvh"]
    },
    "video/vnd.dece.mobile": {
      source: "iana",
      extensions: ["uvm", "uvvm"]
    },
    "video/vnd.dece.mp4": {
      source: "iana"
    },
    "video/vnd.dece.pd": {
      source: "iana",
      extensions: ["uvp", "uvvp"]
    },
    "video/vnd.dece.sd": {
      source: "iana",
      extensions: ["uvs", "uvvs"]
    },
    "video/vnd.dece.video": {
      source: "iana",
      extensions: ["uvv", "uvvv"]
    },
    "video/vnd.directv.mpeg": {
      source: "iana"
    },
    "video/vnd.directv.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dlna.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dvb.file": {
      source: "iana",
      extensions: ["dvb"]
    },
    "video/vnd.fvt": {
      source: "iana",
      extensions: ["fvt"]
    },
    "video/vnd.hns.video": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsavc": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsmpeg2": {
      source: "iana"
    },
    "video/vnd.motorola.video": {
      source: "iana"
    },
    "video/vnd.motorola.videop": {
      source: "iana"
    },
    "video/vnd.mpegurl": {
      source: "iana",
      extensions: ["mxu", "m4u"]
    },
    "video/vnd.ms-playready.media.pyv": {
      source: "iana",
      extensions: ["pyv"]
    },
    "video/vnd.nokia.interleaved-multimedia": {
      source: "iana"
    },
    "video/vnd.nokia.mp4vr": {
      source: "iana"
    },
    "video/vnd.nokia.videovoip": {
      source: "iana"
    },
    "video/vnd.objectvideo": {
      source: "iana"
    },
    "video/vnd.radgamettools.bink": {
      source: "iana"
    },
    "video/vnd.radgamettools.smacker": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg1": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg4": {
      source: "iana"
    },
    "video/vnd.sealed.swf": {
      source: "iana"
    },
    "video/vnd.sealedmedia.softseal.mov": {
      source: "iana"
    },
    "video/vnd.uvvu.mp4": {
      source: "iana",
      extensions: ["uvu", "uvvu"]
    },
    "video/vnd.vivo": {
      source: "iana",
      extensions: ["viv"]
    },
    "video/vnd.youtube.yt": {
      source: "iana"
    },
    "video/vp8": {
      source: "iana"
    },
    "video/vp9": {
      source: "iana"
    },
    "video/webm": {
      source: "apache",
      compressible: false,
      extensions: ["webm"]
    },
    "video/x-f4v": {
      source: "apache",
      extensions: ["f4v"]
    },
    "video/x-fli": {
      source: "apache",
      extensions: ["fli"]
    },
    "video/x-flv": {
      source: "apache",
      compressible: false,
      extensions: ["flv"]
    },
    "video/x-m4v": {
      source: "apache",
      extensions: ["m4v"]
    },
    "video/x-matroska": {
      source: "apache",
      compressible: false,
      extensions: ["mkv", "mk3d", "mks"]
    },
    "video/x-mng": {
      source: "apache",
      extensions: ["mng"]
    },
    "video/x-ms-asf": {
      source: "apache",
      extensions: ["asf", "asx"]
    },
    "video/x-ms-vob": {
      source: "apache",
      extensions: ["vob"]
    },
    "video/x-ms-wm": {
      source: "apache",
      extensions: ["wm"]
    },
    "video/x-ms-wmv": {
      source: "apache",
      compressible: false,
      extensions: ["wmv"]
    },
    "video/x-ms-wmx": {
      source: "apache",
      extensions: ["wmx"]
    },
    "video/x-ms-wvx": {
      source: "apache",
      extensions: ["wvx"]
    },
    "video/x-msvideo": {
      source: "apache",
      extensions: ["avi"]
    },
    "video/x-sgi-movie": {
      source: "apache",
      extensions: ["movie"]
    },
    "video/x-smv": {
      source: "apache",
      extensions: ["smv"]
    },
    "x-conference/x-cooltalk": {
      source: "apache",
      extensions: ["ice"]
    },
    "x-shader/x-fragment": {
      compressible: true
    },
    "x-shader/x-vertex": {
      compressible: true
    }
  };
});

// node_modules/mime-types/index.js
var require_mime_types = __commonJS((exports) => {
  /*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   */
  var db = require_db();
  var extname4 = __require("path").extname;
  var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  var TEXT_TYPE_REGEXP = /^text\//i;
  exports.charset = charset;
  exports.charsets = { lookup: charset };
  exports.contentType = contentType;
  exports.extension = extension;
  exports.extensions = Object.create(null);
  exports.lookup = lookup;
  exports.types = Object.create(null);
  populateMaps(exports.extensions, exports.types);
  function charset(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var mime = match && db[match[1].toLowerCase()];
    if (mime && mime.charset) {
      return mime.charset;
    }
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
      return "UTF-8";
    }
    return false;
  }
  function contentType(str) {
    if (!str || typeof str !== "string") {
      return false;
    }
    var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
    if (!mime) {
      return false;
    }
    if (mime.indexOf("charset") === -1) {
      var charset2 = exports.charset(mime);
      if (charset2)
        mime += "; charset=" + charset2.toLowerCase();
    }
    return mime;
  }
  function extension(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var exts = match && exports.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
      return false;
    }
    return exts[0];
  }
  function lookup(path4) {
    if (!path4 || typeof path4 !== "string") {
      return false;
    }
    var extension2 = extname4("x." + path4).toLowerCase().substr(1);
    if (!extension2) {
      return false;
    }
    return exports.types[extension2] || false;
  }
  function populateMaps(extensions, types) {
    var preference = ["nginx", "apache", undefined, "iana"];
    Object.keys(db).forEach(function forEachMimeType(type) {
      var mime = db[type];
      var exts = mime.extensions;
      if (!exts || !exts.length) {
        return;
      }
      extensions[type] = exts;
      for (var i = 0;i < exts.length; i++) {
        var extension2 = exts[i];
        if (types[extension2]) {
          var from = preference.indexOf(db[types[extension2]].source);
          var to = preference.indexOf(mime.source);
          if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
            continue;
          }
        }
        types[extension2] = type;
      }
    });
  }
});

// node_modules/asynckit/lib/defer.js
var require_defer = __commonJS((exports, module) => {
  module.exports = defer;
  function defer(fn) {
    var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
    if (nextTick) {
      nextTick(fn);
    } else {
      setTimeout(fn, 0);
    }
  }
});

// node_modules/asynckit/lib/async.js
var require_async = __commonJS((exports, module) => {
  var defer = require_defer();
  module.exports = async;
  function async(callback) {
    var isAsync = false;
    defer(function() {
      isAsync = true;
    });
    return function async_callback(err, result) {
      if (isAsync) {
        callback(err, result);
      } else {
        defer(function nextTick_callback() {
          callback(err, result);
        });
      }
    };
  }
});

// node_modules/asynckit/lib/abort.js
var require_abort = __commonJS((exports, module) => {
  module.exports = abort;
  function abort(state) {
    Object.keys(state.jobs).forEach(clean.bind(state));
    state.jobs = {};
  }
  function clean(key) {
    if (typeof this.jobs[key] == "function") {
      this.jobs[key]();
    }
  }
});

// node_modules/asynckit/lib/iterate.js
var require_iterate = __commonJS((exports, module) => {
  var async = require_async();
  var abort = require_abort();
  module.exports = iterate;
  function iterate(list, iterator2, state, callback) {
    var key = state["keyedList"] ? state["keyedList"][state.index] : state.index;
    state.jobs[key] = runJob(iterator2, key, list[key], function(error, output) {
      if (!(key in state.jobs)) {
        return;
      }
      delete state.jobs[key];
      if (error) {
        abort(state);
      } else {
        state.results[key] = output;
      }
      callback(error, state.results);
    });
  }
  function runJob(iterator2, key, item, callback) {
    var aborter;
    if (iterator2.length == 2) {
      aborter = iterator2(item, async(callback));
    } else {
      aborter = iterator2(item, key, async(callback));
    }
    return aborter;
  }
});

// node_modules/asynckit/lib/state.js
var require_state = __commonJS((exports, module) => {
  module.exports = state;
  function state(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
      index: 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs: {},
      results: isNamedList ? {} : [],
      size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
      initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
        return sortMethod(list[a], list[b]);
      });
    }
    return initState;
  }
});

// node_modules/asynckit/lib/terminator.js
var require_terminator = __commonJS((exports, module) => {
  var abort = require_abort();
  var async = require_async();
  module.exports = terminator;
  function terminator(callback) {
    if (!Object.keys(this.jobs).length) {
      return;
    }
    this.index = this.size;
    abort(this);
    async(callback)(null, this.results);
  }
});

// node_modules/asynckit/parallel.js
var require_parallel = __commonJS((exports, module) => {
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = parallel;
  function parallel(list, iterator2, callback) {
    var state = initState(list);
    while (state.index < (state["keyedList"] || list).length) {
      iterate(list, iterator2, state, function(error, result) {
        if (error) {
          callback(error, result);
          return;
        }
        if (Object.keys(state.jobs).length === 0) {
          callback(null, state.results);
          return;
        }
      });
      state.index++;
    }
    return terminator.bind(state, callback);
  }
});

// node_modules/asynckit/serialOrdered.js
var require_serialOrdered = __commonJS((exports, module) => {
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = serialOrdered;
  module.exports.ascending = ascending;
  module.exports.descending = descending;
  function serialOrdered(list, iterator2, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator2, state, function iteratorHandler(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      state.index++;
      if (state.index < (state["keyedList"] || list).length) {
        iterate(list, iterator2, state, iteratorHandler);
        return;
      }
      callback(null, state.results);
    });
    return terminator.bind(state, callback);
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function descending(a, b) {
    return -1 * ascending(a, b);
  }
});

// node_modules/asynckit/serial.js
var require_serial = __commonJS((exports, module) => {
  var serialOrdered = require_serialOrdered();
  module.exports = serial;
  function serial(list, iterator2, callback) {
    return serialOrdered(list, iterator2, null, callback);
  }
});

// node_modules/asynckit/index.js
var require_asynckit = __commonJS((exports, module) => {
  module.exports = {
    parallel: require_parallel(),
    serial: require_serial(),
    serialOrdered: require_serialOrdered()
  };
});

// node_modules/es-object-atoms/index.js
var require_es_object_atoms = __commonJS((exports, module) => {
  module.exports = Object;
});

// node_modules/es-errors/index.js
var require_es_errors = __commonJS((exports, module) => {
  module.exports = Error;
});

// node_modules/es-errors/eval.js
var require_eval = __commonJS((exports, module) => {
  module.exports = EvalError;
});

// node_modules/es-errors/range.js
var require_range = __commonJS((exports, module) => {
  module.exports = RangeError;
});

// node_modules/es-errors/ref.js
var require_ref = __commonJS((exports, module) => {
  module.exports = ReferenceError;
});

// node_modules/es-errors/syntax.js
var require_syntax = __commonJS((exports, module) => {
  module.exports = SyntaxError;
});

// node_modules/es-errors/type.js
var require_type = __commonJS((exports, module) => {
  module.exports = TypeError;
});

// node_modules/es-errors/uri.js
var require_uri = __commonJS((exports, module) => {
  module.exports = URIError;
});

// node_modules/math-intrinsics/abs.js
var require_abs = __commonJS((exports, module) => {
  module.exports = Math.abs;
});

// node_modules/math-intrinsics/floor.js
var require_floor = __commonJS((exports, module) => {
  module.exports = Math.floor;
});

// node_modules/math-intrinsics/max.js
var require_max = __commonJS((exports, module) => {
  module.exports = Math.max;
});

// node_modules/math-intrinsics/min.js
var require_min = __commonJS((exports, module) => {
  module.exports = Math.min;
});

// node_modules/math-intrinsics/pow.js
var require_pow = __commonJS((exports, module) => {
  module.exports = Math.pow;
});

// node_modules/math-intrinsics/round.js
var require_round = __commonJS((exports, module) => {
  module.exports = Math.round;
});

// node_modules/math-intrinsics/isNaN.js
var require_isNaN = __commonJS((exports, module) => {
  module.exports = Number.isNaN || function isNaN2(a) {
    return a !== a;
  };
});

// node_modules/math-intrinsics/sign.js
var require_sign = __commonJS((exports, module) => {
  var $isNaN = require_isNaN();
  module.exports = function sign(number) {
    if ($isNaN(number) || number === 0) {
      return number;
    }
    return number < 0 ? -1 : 1;
  };
});

// node_modules/gopd/gOPD.js
var require_gOPD = __commonJS((exports, module) => {
  module.exports = Object.getOwnPropertyDescriptor;
});

// node_modules/gopd/index.js
var require_gopd = __commonJS((exports, module) => {
  var $gOPD = require_gOPD();
  if ($gOPD) {
    try {
      $gOPD([], "length");
    } catch (e) {
      $gOPD = null;
    }
  }
  module.exports = $gOPD;
});

// node_modules/es-define-property/index.js
var require_es_define_property = __commonJS((exports, module) => {
  var $defineProperty = Object.defineProperty || false;
  if ($defineProperty) {
    try {
      $defineProperty({}, "a", { value: 1 });
    } catch (e) {
      $defineProperty = false;
    }
  }
  module.exports = $defineProperty;
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS((exports, module) => {
  module.exports = function hasSymbols() {
    if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
      return false;
    }
    if (typeof Symbol.iterator === "symbol") {
      return true;
    }
    var obj = {};
    var sym = Symbol("test");
    var symObj = Object(sym);
    if (typeof sym === "string") {
      return false;
    }
    if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
      return false;
    }
    if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
      return false;
    }
    var symVal = 42;
    obj[sym] = symVal;
    for (var _ in obj) {
      return false;
    }
    if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
      return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === "function") {
      var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
      if (descriptor.value !== symVal || descriptor.enumerable !== true) {
        return false;
      }
    }
    return true;
  };
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS((exports, module) => {
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = require_shams();
  module.exports = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
});

// node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = __commonJS((exports, module) => {
  module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
});

// node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = __commonJS((exports, module) => {
  var $Object = require_es_object_atoms();
  module.exports = $Object.getPrototypeOf || null;
});

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS((exports, module) => {
  var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
  var toStr = Object.prototype.toString;
  var max = Math.max;
  var funcType = "[object Function]";
  var concatty = function concatty2(a, b) {
    var arr = [];
    for (var i = 0;i < a.length; i += 1) {
      arr[i] = a[i];
    }
    for (var j = 0;j < b.length; j += 1) {
      arr[j + a.length] = b[j];
    }
    return arr;
  };
  var slicy = function slicy2(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0;i < arrLike.length; i += 1, j += 1) {
      arr[j] = arrLike[i];
    }
    return arr;
  };
  var joiny = function(arr, joiner) {
    var str = "";
    for (var i = 0;i < arr.length; i += 1) {
      str += arr[i];
      if (i + 1 < arr.length) {
        str += joiner;
      }
    }
    return str;
  };
  module.exports = function bind2(that) {
    var target = this;
    if (typeof target !== "function" || toStr.apply(target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
      if (this instanceof bound) {
        var result = target.apply(this, concatty(args, arguments));
        if (Object(result) === result) {
          return result;
        }
        return this;
      }
      return target.apply(that, concatty(args, arguments));
    };
    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0;i < boundLength; i++) {
      boundArgs[i] = "$" + i;
    }
    bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
    if (target.prototype) {
      var Empty = function Empty2() {};
      Empty.prototype = target.prototype;
      bound.prototype = new Empty;
      Empty.prototype = null;
    }
    return bound;
  };
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS((exports, module) => {
  var implementation = require_implementation();
  module.exports = Function.prototype.bind || implementation;
});

// node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = __commonJS((exports, module) => {
  module.exports = Function.prototype.call;
});

// node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = __commonJS((exports, module) => {
  module.exports = Function.prototype.apply;
});

// node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = __commonJS((exports, module) => {
  module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
});

// node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = __commonJS((exports, module) => {
  var bind2 = require_function_bind();
  var $apply = require_functionApply();
  var $call = require_functionCall();
  var $reflectApply = require_reflectApply();
  module.exports = $reflectApply || bind2.call($call, $apply);
});

// node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = __commonJS((exports, module) => {
  var bind2 = require_function_bind();
  var $TypeError = require_type();
  var $call = require_functionCall();
  var $actualApply = require_actualApply();
  module.exports = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== "function") {
      throw new $TypeError("a function is required");
    }
    return $actualApply(bind2, $call, args);
  };
});

// node_modules/dunder-proto/get.js
var require_get = __commonJS((exports, module) => {
  var callBind = require_call_bind_apply_helpers();
  var gOPD = require_gopd();
  var hasProtoAccessor;
  try {
    hasProtoAccessor = [].__proto__ === Array.prototype;
  } catch (e) {
    if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
      throw e;
    }
  }
  var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, "__proto__");
  var $Object = Object;
  var $getPrototypeOf = $Object.getPrototypeOf;
  module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? function getDunder(value) {
    return $getPrototypeOf(value == null ? value : $Object(value));
  } : false;
});

// node_modules/get-proto/index.js
var require_get_proto = __commonJS((exports, module) => {
  var reflectGetProto = require_Reflect_getPrototypeOf();
  var originalGetProto = require_Object_getPrototypeOf();
  var getDunderProto = require_get();
  module.exports = reflectGetProto ? function getProto(O) {
    return reflectGetProto(O);
  } : originalGetProto ? function getProto(O) {
    if (!O || typeof O !== "object" && typeof O !== "function") {
      throw new TypeError("getProto: not an object");
    }
    return originalGetProto(O);
  } : getDunderProto ? function getProto(O) {
    return getDunderProto(O);
  } : null;
});

// node_modules/hasown/index.js
var require_hasown = __commonJS((exports, module) => {
  var call = Function.prototype.call;
  var $hasOwn = Object.prototype.hasOwnProperty;
  var bind2 = require_function_bind();
  module.exports = bind2.call(call, $hasOwn);
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS((exports, module) => {
  var undefined2;
  var $Object = require_es_object_atoms();
  var $Error = require_es_errors();
  var $EvalError = require_eval();
  var $RangeError = require_range();
  var $ReferenceError = require_ref();
  var $SyntaxError = require_syntax();
  var $TypeError = require_type();
  var $URIError = require_uri();
  var abs = require_abs();
  var floor = require_floor();
  var max = require_max();
  var min = require_min();
  var pow = require_pow();
  var round = require_round();
  var sign = require_sign();
  var $Function = Function;
  var getEvalledConstructor = function(expressionSyntax) {
    try {
      return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
    } catch (e) {}
  };
  var $gOPD = require_gopd();
  var $defineProperty = require_es_define_property();
  var throwTypeError = function() {
    throw new $TypeError;
  };
  var ThrowTypeError = $gOPD ? function() {
    try {
      arguments.callee;
      return throwTypeError;
    } catch (calleeThrows) {
      try {
        return $gOPD(arguments, "callee").get;
      } catch (gOPDthrows) {
        return throwTypeError;
      }
    }
  }() : throwTypeError;
  var hasSymbols = require_has_symbols()();
  var getProto = require_get_proto();
  var $ObjectGPO = require_Object_getPrototypeOf();
  var $ReflectGPO = require_Reflect_getPrototypeOf();
  var $apply = require_functionApply();
  var $call = require_functionCall();
  var needsEval = {};
  var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
  var INTRINSICS = {
    __proto__: null,
    "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
    "%Array%": Array,
    "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
    "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
    "%AsyncFromSyncIteratorPrototype%": undefined2,
    "%AsyncFunction%": needsEval,
    "%AsyncGenerator%": needsEval,
    "%AsyncGeneratorFunction%": needsEval,
    "%AsyncIteratorPrototype%": needsEval,
    "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
    "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
    "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
    "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
    "%Boolean%": Boolean,
    "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
    "%Date%": Date,
    "%decodeURI%": decodeURI,
    "%decodeURIComponent%": decodeURIComponent,
    "%encodeURI%": encodeURI,
    "%encodeURIComponent%": encodeURIComponent,
    "%Error%": $Error,
    "%eval%": eval,
    "%EvalError%": $EvalError,
    "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
    "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
    "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
    "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
    "%Function%": $Function,
    "%GeneratorFunction%": needsEval,
    "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
    "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
    "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
    "%isFinite%": isFinite,
    "%isNaN%": isNaN,
    "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
    "%JSON%": typeof JSON === "object" ? JSON : undefined2,
    "%Map%": typeof Map === "undefined" ? undefined2 : Map,
    "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto(new Map()[Symbol.iterator]()),
    "%Math%": Math,
    "%Number%": Number,
    "%Object%": $Object,
    "%Object.getOwnPropertyDescriptor%": $gOPD,
    "%parseFloat%": parseFloat,
    "%parseInt%": parseInt,
    "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
    "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
    "%RangeError%": $RangeError,
    "%ReferenceError%": $ReferenceError,
    "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
    "%RegExp%": RegExp,
    "%Set%": typeof Set === "undefined" ? undefined2 : Set,
    "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto(new Set()[Symbol.iterator]()),
    "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
    "%String%": String,
    "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
    "%Symbol%": hasSymbols ? Symbol : undefined2,
    "%SyntaxError%": $SyntaxError,
    "%ThrowTypeError%": ThrowTypeError,
    "%TypedArray%": TypedArray,
    "%TypeError%": $TypeError,
    "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
    "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
    "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
    "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
    "%URIError%": $URIError,
    "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
    "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
    "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
    "%Function.prototype.call%": $call,
    "%Function.prototype.apply%": $apply,
    "%Object.defineProperty%": $defineProperty,
    "%Object.getPrototypeOf%": $ObjectGPO,
    "%Math.abs%": abs,
    "%Math.floor%": floor,
    "%Math.max%": max,
    "%Math.min%": min,
    "%Math.pow%": pow,
    "%Math.round%": round,
    "%Math.sign%": sign,
    "%Reflect.getPrototypeOf%": $ReflectGPO
  };
  if (getProto) {
    try {
      null.error;
    } catch (e) {
      errorProto = getProto(getProto(e));
      INTRINSICS["%Error.prototype%"] = errorProto;
    }
  }
  var errorProto;
  var doEval = function doEval2(name) {
    var value;
    if (name === "%AsyncFunction%") {
      value = getEvalledConstructor("async function () {}");
    } else if (name === "%GeneratorFunction%") {
      value = getEvalledConstructor("function* () {}");
    } else if (name === "%AsyncGeneratorFunction%") {
      value = getEvalledConstructor("async function* () {}");
    } else if (name === "%AsyncGenerator%") {
      var fn = doEval2("%AsyncGeneratorFunction%");
      if (fn) {
        value = fn.prototype;
      }
    } else if (name === "%AsyncIteratorPrototype%") {
      var gen = doEval2("%AsyncGenerator%");
      if (gen && getProto) {
        value = getProto(gen.prototype);
      }
    }
    INTRINSICS[name] = value;
    return value;
  };
  var LEGACY_ALIASES = {
    __proto__: null,
    "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
    "%ArrayPrototype%": ["Array", "prototype"],
    "%ArrayProto_entries%": ["Array", "prototype", "entries"],
    "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
    "%ArrayProto_keys%": ["Array", "prototype", "keys"],
    "%ArrayProto_values%": ["Array", "prototype", "values"],
    "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
    "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
    "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
    "%BooleanPrototype%": ["Boolean", "prototype"],
    "%DataViewPrototype%": ["DataView", "prototype"],
    "%DatePrototype%": ["Date", "prototype"],
    "%ErrorPrototype%": ["Error", "prototype"],
    "%EvalErrorPrototype%": ["EvalError", "prototype"],
    "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
    "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
    "%FunctionPrototype%": ["Function", "prototype"],
    "%Generator%": ["GeneratorFunction", "prototype"],
    "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
    "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
    "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
    "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
    "%JSONParse%": ["JSON", "parse"],
    "%JSONStringify%": ["JSON", "stringify"],
    "%MapPrototype%": ["Map", "prototype"],
    "%NumberPrototype%": ["Number", "prototype"],
    "%ObjectPrototype%": ["Object", "prototype"],
    "%ObjProto_toString%": ["Object", "prototype", "toString"],
    "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
    "%PromisePrototype%": ["Promise", "prototype"],
    "%PromiseProto_then%": ["Promise", "prototype", "then"],
    "%Promise_all%": ["Promise", "all"],
    "%Promise_reject%": ["Promise", "reject"],
    "%Promise_resolve%": ["Promise", "resolve"],
    "%RangeErrorPrototype%": ["RangeError", "prototype"],
    "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
    "%RegExpPrototype%": ["RegExp", "prototype"],
    "%SetPrototype%": ["Set", "prototype"],
    "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
    "%StringPrototype%": ["String", "prototype"],
    "%SymbolPrototype%": ["Symbol", "prototype"],
    "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
    "%TypedArrayPrototype%": ["TypedArray", "prototype"],
    "%TypeErrorPrototype%": ["TypeError", "prototype"],
    "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
    "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
    "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
    "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
    "%URIErrorPrototype%": ["URIError", "prototype"],
    "%WeakMapPrototype%": ["WeakMap", "prototype"],
    "%WeakSetPrototype%": ["WeakSet", "prototype"]
  };
  var bind2 = require_function_bind();
  var hasOwn = require_hasown();
  var $concat = bind2.call($call, Array.prototype.concat);
  var $spliceApply = bind2.call($apply, Array.prototype.splice);
  var $replace = bind2.call($call, String.prototype.replace);
  var $strSlice = bind2.call($call, String.prototype.slice);
  var $exec = bind2.call($call, RegExp.prototype.exec);
  var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = function stringToPath2(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === "%" && last !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
    } else if (last === "%" && first !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
    }
    var result = [];
    $replace(string, rePropName, function(match, number, quote, subString) {
      result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
    });
    return result;
  };
  var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
      alias = LEGACY_ALIASES[intrinsicName];
      intrinsicName = "%" + alias[0] + "%";
    }
    if (hasOwn(INTRINSICS, intrinsicName)) {
      var value = INTRINSICS[intrinsicName];
      if (value === needsEval) {
        value = doEval(intrinsicName);
      }
      if (typeof value === "undefined" && !allowMissing) {
        throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
      }
      return {
        alias,
        name: intrinsicName,
        value
      };
    }
    throw new $SyntaxError("intrinsic " + name + " does not exist!");
  };
  module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== "string" || name.length === 0) {
      throw new $TypeError("intrinsic name must be a non-empty string");
    }
    if (arguments.length > 1 && typeof allowMissing !== "boolean") {
      throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
      throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
    var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
    var intrinsicRealName = intrinsic.name;
    var value = intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic.alias;
    if (alias) {
      intrinsicBaseName = alias[0];
      $spliceApply(parts, $concat([0, 1], alias));
    }
    for (var i = 1, isOwn = true;i < parts.length; i += 1) {
      var part = parts[i];
      var first = $strSlice(part, 0, 1);
      var last = $strSlice(part, -1);
      if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
        throw new $SyntaxError("property names with quotes must have matching quotes");
      }
      if (part === "constructor" || !isOwn) {
        skipFurtherCaching = true;
      }
      intrinsicBaseName += "." + part;
      intrinsicRealName = "%" + intrinsicBaseName + "%";
      if (hasOwn(INTRINSICS, intrinsicRealName)) {
        value = INTRINSICS[intrinsicRealName];
      } else if (value != null) {
        if (!(part in value)) {
          if (!allowMissing) {
            throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
          }
          return;
        }
        if ($gOPD && i + 1 >= parts.length) {
          var desc = $gOPD(value, part);
          isOwn = !!desc;
          if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
            value = desc.get;
          } else {
            value = value[part];
          }
        } else {
          isOwn = hasOwn(value, part);
          value = value[part];
        }
        if (isOwn && !skipFurtherCaching) {
          INTRINSICS[intrinsicRealName] = value;
        }
      }
    }
    return value;
  };
});

// node_modules/has-tostringtag/shams.js
var require_shams2 = __commonJS((exports, module) => {
  var hasSymbols = require_shams();
  module.exports = function hasToStringTagShams() {
    return hasSymbols() && !!Symbol.toStringTag;
  };
});

// node_modules/es-set-tostringtag/index.js
var require_es_set_tostringtag = __commonJS((exports, module) => {
  var GetIntrinsic = require_get_intrinsic();
  var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
  var hasToStringTag = require_shams2()();
  var hasOwn = require_hasown();
  var $TypeError = require_type();
  var toStringTag2 = hasToStringTag ? Symbol.toStringTag : null;
  module.exports = function setToStringTag(object, value) {
    var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
    var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
    if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") {
      throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
    }
    if (toStringTag2 && (overrideIfSet || !hasOwn(object, toStringTag2))) {
      if ($defineProperty) {
        $defineProperty(object, toStringTag2, {
          configurable: !nonConfigurable,
          enumerable: false,
          value,
          writable: false
        });
      } else {
        object[toStringTag2] = value;
      }
    }
  };
});

// node_modules/form-data/lib/populate.js
var require_populate = __commonJS((exports, module) => {
  module.exports = function(dst, src) {
    Object.keys(src).forEach(function(prop) {
      dst[prop] = dst[prop] || src[prop];
    });
    return dst;
  };
});

// node_modules/form-data/lib/form_data.js
var require_form_data = __commonJS((exports, module) => {
  var CombinedStream = require_combined_stream();
  var util = __require("util");
  var path4 = __require("path");
  var http = __require("http");
  var https = __require("https");
  var parseUrl = __require("url").parse;
  var fs4 = __require("fs");
  var Stream = __require("stream").Stream;
  var crypto2 = __require("crypto");
  var mime = require_mime_types();
  var asynckit = require_asynckit();
  var setToStringTag = require_es_set_tostringtag();
  var hasOwn = require_hasown();
  var populate = require_populate();
  function FormData2(options) {
    if (!(this instanceof FormData2)) {
      return new FormData2(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {};
    for (var option in options) {
      this[option] = options[option];
    }
  }
  util.inherits(FormData2, CombinedStream);
  FormData2.LINE_BREAK = `\r
`;
  FormData2.DEFAULT_CONTENT_TYPE = "application/octet-stream";
  FormData2.prototype.append = function(field, value, options) {
    options = options || {};
    if (typeof options === "string") {
      options = { filename: options };
    }
    var append = CombinedStream.prototype.append.bind(this);
    if (typeof value === "number" || value == null) {
      value = String(value);
    }
    if (Array.isArray(value)) {
      this._error(new Error("Arrays are not supported."));
      return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append(header);
    append(value);
    append(footer);
    this._trackLength(header, value, options);
  };
  FormData2.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    if (options.knownLength != null) {
      valueLength += Number(options.knownLength);
    } else if (Buffer.isBuffer(value)) {
      valueLength = value.length;
    } else if (typeof value === "string") {
      valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    this._overheadLength += Buffer.byteLength(header) + FormData2.LINE_BREAK.length;
    if (!value || !value.path && !(value.readable && hasOwn(value, "httpVersion")) && !(value instanceof Stream)) {
      return;
    }
    if (!options.knownLength) {
      this._valuesToMeasure.push(value);
    }
  };
  FormData2.prototype._lengthRetriever = function(value, callback) {
    if (hasOwn(value, "fd")) {
      if (value.end != null && value.end != Infinity && value.start != null) {
        callback(null, value.end + 1 - (value.start ? value.start : 0));
      } else {
        fs4.stat(value.path, function(err, stat2) {
          if (err) {
            callback(err);
            return;
          }
          var fileSize = stat2.size - (value.start ? value.start : 0);
          callback(null, fileSize);
        });
      }
    } else if (hasOwn(value, "httpVersion")) {
      callback(null, Number(value.headers["content-length"]));
    } else if (hasOwn(value, "httpModule")) {
      value.on("response", function(response) {
        value.pause();
        callback(null, Number(response.headers["content-length"]));
      });
      value.resume();
    } else {
      callback("Unknown stream");
    }
  };
  FormData2.prototype._multiPartHeader = function(field, value, options) {
    if (typeof options.header === "string") {
      return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = "";
    var headers = {
      "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
      "Content-Type": [].concat(contentType || [])
    };
    if (typeof options.header === "object") {
      populate(headers, options.header);
    }
    var header;
    for (var prop in headers) {
      if (hasOwn(headers, prop)) {
        header = headers[prop];
        if (header == null) {
          continue;
        }
        if (!Array.isArray(header)) {
          header = [header];
        }
        if (header.length) {
          contents += prop + ": " + header.join("; ") + FormData2.LINE_BREAK;
        }
      }
    }
    return "--" + this.getBoundary() + FormData2.LINE_BREAK + contents + FormData2.LINE_BREAK;
  };
  FormData2.prototype._getContentDisposition = function(value, options) {
    var filename;
    if (typeof options.filepath === "string") {
      filename = path4.normalize(options.filepath).replace(/\\/g, "/");
    } else if (options.filename || value && (value.name || value.path)) {
      filename = path4.basename(options.filename || value && (value.name || value.path));
    } else if (value && value.readable && hasOwn(value, "httpVersion")) {
      filename = path4.basename(value.client._httpMessage.path || "");
    }
    if (filename) {
      return 'filename="' + filename + '"';
    }
  };
  FormData2.prototype._getContentType = function(value, options) {
    var contentType = options.contentType;
    if (!contentType && value && value.name) {
      contentType = mime.lookup(value.name);
    }
    if (!contentType && value && value.path) {
      contentType = mime.lookup(value.path);
    }
    if (!contentType && value && value.readable && hasOwn(value, "httpVersion")) {
      contentType = value.headers["content-type"];
    }
    if (!contentType && (options.filepath || options.filename)) {
      contentType = mime.lookup(options.filepath || options.filename);
    }
    if (!contentType && value && typeof value === "object") {
      contentType = FormData2.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
  };
  FormData2.prototype._multiPartFooter = function() {
    return function(next) {
      var footer = FormData2.LINE_BREAK;
      var lastPart = this._streams.length === 0;
      if (lastPart) {
        footer += this._lastBoundary();
      }
      next(footer);
    }.bind(this);
  };
  FormData2.prototype._lastBoundary = function() {
    return "--" + this.getBoundary() + "--" + FormData2.LINE_BREAK;
  };
  FormData2.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
      "content-type": "multipart/form-data; boundary=" + this.getBoundary()
    };
    for (header in userHeaders) {
      if (hasOwn(userHeaders, header)) {
        formHeaders[header.toLowerCase()] = userHeaders[header];
      }
    }
    return formHeaders;
  };
  FormData2.prototype.setBoundary = function(boundary) {
    if (typeof boundary !== "string") {
      throw new TypeError("FormData boundary must be a string");
    }
    this._boundary = boundary;
  };
  FormData2.prototype.getBoundary = function() {
    if (!this._boundary) {
      this._generateBoundary();
    }
    return this._boundary;
  };
  FormData2.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0);
    var boundary = this.getBoundary();
    for (var i = 0, len = this._streams.length;i < len; i++) {
      if (typeof this._streams[i] !== "function") {
        if (Buffer.isBuffer(this._streams[i])) {
          dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
        } else {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
        }
        if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData2.LINE_BREAK)]);
        }
      }
    }
    return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
  };
  FormData2.prototype._generateBoundary = function() {
    this._boundary = "--------------------------" + crypto2.randomBytes(12).toString("hex");
  };
  FormData2.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this.hasKnownLength()) {
      this._error(new Error("Cannot calculate proper length in synchronous way."));
    }
    return knownLength;
  };
  FormData2.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
      hasKnownLength = false;
    }
    return hasKnownLength;
  };
  FormData2.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
      process.nextTick(cb.bind(this, null, knownLength));
      return;
    }
    asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
      if (err) {
        cb(err);
        return;
      }
      values.forEach(function(length) {
        knownLength += length;
      });
      cb(null, knownLength);
    });
  };
  FormData2.prototype.submit = function(params, cb) {
    var request;
    var options;
    var defaults = { method: "post" };
    if (typeof params === "string") {
      params = parseUrl(params);
      options = populate({
        port: params.port,
        path: params.pathname,
        host: params.hostname,
        protocol: params.protocol
      }, defaults);
    } else {
      options = populate(params, defaults);
      if (!options.port) {
        options.port = options.protocol === "https:" ? 443 : 80;
      }
    }
    options.headers = this.getHeaders(params.headers);
    if (options.protocol === "https:") {
      request = https.request(options);
    } else {
      request = http.request(options);
    }
    this.getLength(function(err, length) {
      if (err && err !== "Unknown stream") {
        this._error(err);
        return;
      }
      if (length) {
        request.setHeader("Content-Length", length);
      }
      this.pipe(request);
      if (cb) {
        var onResponse;
        var callback = function(error, responce) {
          request.removeListener("error", callback);
          request.removeListener("response", onResponse);
          return cb.call(this, error, responce);
        };
        onResponse = callback.bind(this, null);
        request.on("error", callback);
        request.on("response", onResponse);
      }
    }.bind(this));
    return request;
  };
  FormData2.prototype._error = function(err) {
    if (!this.error) {
      this.error = err;
      this.pause();
      this.emit("error", err);
    }
  };
  FormData2.prototype.toString = function() {
    return "[object FormData]";
  };
  setToStringTag(FormData2.prototype, "FormData");
  module.exports = FormData2;
});

// node_modules/axios/lib/platform/node/classes/FormData.js
var import_form_data, FormData_default;
var init_FormData = __esm(() => {
  import_form_data = __toESM(require_form_data(), 1);
  FormData_default = import_form_data.default;
});

// node_modules/axios/lib/helpers/toFormData.js
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path4, key, dots) {
  if (!path4)
    return key;
  return path4.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (FormData_default || FormData);
  options = utils_default.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils_default.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null)
      return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (utils_default.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path4) {
    let arr = value;
    if (utils_default.isReactNative(formData) && utils_default.isReactNativeBlob(value)) {
      formData.append(renderKey(path4, key, dots), convertValue(value));
      return false;
    }
    if (value && !path4 && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]", convertValue(el));
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path4, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path4) {
    if (utils_default.isUndefined(value))
      return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path4.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(formData, el, utils_default.isString(key) ? key.trim() : key, path4, exposedHelpers);
      if (result === true) {
        build(el, path4 ? path4.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var predicates, toFormData_default;
var init_toFormData = __esm(() => {
  init_utils();
  init_AxiosError();
  init_FormData();
  predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });
  toFormData_default = toFormData;
});

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\x00"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype, AxiosURLSearchParams_default;
var init_AxiosURLSearchParams = __esm(() => {
  init_toFormData();
  prototype = AxiosURLSearchParams.prototype;
  prototype.append = function append(name, value) {
    this._pairs.push([name, value]);
  };
  prototype.toString = function toString2(encoder) {
    const _encode = encoder ? function(value) {
      return encoder.call(this, value, encode);
    } : encode;
    return this._pairs.map(function each(pair) {
      return _encode(pair[0]) + "=" + _encode(pair[1]);
    }, "").join("&");
  };
  AxiosURLSearchParams_default = AxiosURLSearchParams;
});

// node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode2;
  const _options = utils_default.isFunction(options) ? {
    serialize: options
  } : options;
  const serializeFn = _options && _options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, _options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, _options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
var init_buildURL = __esm(() => {
  init_utils();
  init_AxiosURLSearchParams();
});

// node_modules/axios/lib/core/InterceptorManager.js
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  forEach(fn) {
    utils_default.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
var InterceptorManager_default;
var init_InterceptorManager = __esm(() => {
  init_utils();
  InterceptorManager_default = InterceptorManager;
});

// node_modules/axios/lib/defaults/transitional.js
var transitional_default;
var init_transitional = __esm(() => {
  transitional_default = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false,
    legacyInterceptorReqResOrdering: true
  };
});

// node_modules/axios/lib/platform/node/classes/URLSearchParams.js
import url from "url";
var URLSearchParams_default;
var init_URLSearchParams = __esm(() => {
  URLSearchParams_default = url.URLSearchParams;
});

// node_modules/axios/lib/platform/node/index.js
import crypto2 from "crypto";
var ALPHA = "abcdefghijklmnopqrstuvwxyz", DIGIT = "0123456789", ALPHABET, generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = "";
  const { length } = alphabet;
  const randomValues = new Uint32Array(size);
  crypto2.randomFillSync(randomValues);
  for (let i = 0;i < size; i++) {
    str += alphabet[randomValues[i] % length];
  }
  return str;
}, node_default;
var init_node = __esm(() => {
  init_URLSearchParams();
  init_FormData();
  ALPHABET = {
    DIGIT,
    ALPHA,
    ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
  };
  node_default = {
    isNode: true,
    classes: {
      URLSearchParams: URLSearchParams_default,
      FormData: FormData_default,
      Blob: typeof Blob !== "undefined" && Blob || null
    },
    ALPHABET,
    generateString,
    protocols: ["http", "https", "file", "data"]
  };
});

// node_modules/axios/lib/platform/common/utils.js
var exports_utils = {};
__export(exports_utils, {
  origin: () => origin,
  navigator: () => _navigator,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasBrowserEnv: () => hasBrowserEnv
});
var hasBrowserEnv, _navigator, hasStandardBrowserEnv, hasStandardBrowserWebWorkerEnv, origin;
var init_utils2 = __esm(() => {
  hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
  _navigator = typeof navigator === "object" && navigator || undefined;
  hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
  hasStandardBrowserWebWorkerEnv = (() => {
    return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
  })();
  origin = hasBrowserEnv && window.location.href || "http://localhost";
});

// node_modules/axios/lib/platform/index.js
var platform_default;
var init_platform = __esm(() => {
  init_node();
  init_utils2();
  platform_default = {
    ...exports_utils,
    ...node_default
  };
});

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams, {
    visitor: function(value, key, path4, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
var init_toURLEncodedForm = __esm(() => {
  init_utils();
  init_toFormData();
  init_platform();
});

// node_modules/axios/lib/helpers/formDataToJSON.js
function parsePropPath(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0;i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path4, value, target, index) {
    let name = path4[index++];
    if (name === "__proto__")
      return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path4.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path4, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default;
var init_formDataToJSON = __esm(() => {
  init_utils();
  formDataToJSON_default = formDataToJSON;
});

// node_modules/axios/lib/defaults/index.js
function stringifySafely(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
var defaults, defaults_default;
var init_defaults = __esm(() => {
  init_utils();
  init_AxiosError();
  init_transitional();
  init_toFormData();
  init_toURLEncodedForm();
  init_platform();
  init_formDataToJSON();
  defaults = {
    transitional: transitional_default,
    adapter: ["xhr", "http", "fetch"],
    transformRequest: [
      function transformRequest(data, headers) {
        const contentType = headers.getContentType() || "";
        const hasJSONContentType = contentType.indexOf("application/json") > -1;
        const isObjectPayload = utils_default.isObject(data);
        if (isObjectPayload && utils_default.isHTMLForm(data)) {
          data = new FormData(data);
        }
        const isFormData2 = utils_default.isFormData(data);
        if (isFormData2) {
          return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
        }
        if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
          return data;
        }
        if (utils_default.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils_default.isURLSearchParams(data)) {
          headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
          return data.toString();
        }
        let isFileList2;
        if (isObjectPayload) {
          if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }
          if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
            const _FormData = this.env && this.env.FormData;
            return toFormData_default(isFileList2 ? { "files[]": data } : data, _FormData && new _FormData, this.formSerializer);
          }
        }
        if (isObjectPayload || hasJSONContentType) {
          headers.setContentType("application/json", false);
          return stringifySafely(data);
        }
        return data;
      }
    ],
    transformResponse: [
      function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === "json";
        if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
          return data;
        }
        if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;
          try {
            return JSON.parse(data, this.parseReviver);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === "SyntaxError") {
                throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }
        return data;
      }
    ],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: platform_default.classes.FormData,
      Blob: platform_default.classes.Blob
    },
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": undefined
      }
    }
  };
  utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
    defaults.headers[method] = {};
  });
  defaults_default = defaults;
});

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf, parseHeaders_default = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split(`
`).forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
var init_parseHeaders = __esm(() => {
  init_utils();
  ignoreDuplicateOf = utils_default.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent"
  ]);
});

// node_modules/axios/lib/core/AxiosHeaders.js
function assertValidHeaderValue(value, header) {
  if (value === false || value == null) {
    return;
  }
  if (utils_default.isArray(value)) {
    value.forEach((v) => assertValidHeaderValue(v, header));
    return;
  }
  if (!isValidHeaderValue(String(value))) {
    throw new Error(`Invalid character in header content ["${header}"]`);
  }
}
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function stripTrailingCRLF(str) {
  let end = str.length;
  while (end > 0) {
    const charCode = str.charCodeAt(end - 1);
    if (charCode !== 10 && charCode !== 13) {
      break;
    }
    end -= 1;
  }
  return end === str.length ? str : str.slice(0, end);
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : stripTrailingCRLF(String(value));
}
function parseTokens(str) {
  const tokens = Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value))
    return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
var $internals, isValidHeaderValue = (value) => !/[\r\n]/.test(value), isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim()), AxiosHeaders, AxiosHeaders_default;
var init_AxiosHeaders = __esm(() => {
  init_utils();
  init_parseHeaders();
  $internals = Symbol("internals");
  AxiosHeaders = class AxiosHeaders {
    constructor(headers) {
      headers && this.set(headers);
    }
    set(header, valueOrRewrite, rewrite) {
      const self2 = this;
      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);
        if (!lHeader) {
          throw new Error("header name must be a non-empty string");
        }
        const key = utils_default.findKey(self2, lHeader);
        if (!key || self2[key] === undefined || _rewrite === true || _rewrite === undefined && self2[key] !== false) {
          assertValidHeaderValue(_value, _header);
          self2[key || _header] = normalizeValue(_value);
        }
      }
      const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
      if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders_default(header), valueOrRewrite);
      } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
        let obj = {}, dest, key;
        for (const entry of header) {
          if (!utils_default.isArray(entry)) {
            throw TypeError("Object iterator must return a key-value pair");
          }
          obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
        }
        setHeaders(obj, valueOrRewrite);
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }
      return this;
    }
    get(header, parser) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        if (key) {
          const value = this[key];
          if (!parser) {
            return value;
          }
          if (parser === true) {
            return parseTokens(value);
          }
          if (utils_default.isFunction(parser)) {
            return parser.call(this, value, key);
          }
          if (utils_default.isRegExp(parser)) {
            return parser.exec(value);
          }
          throw new TypeError("parser must be boolean|regexp|function");
        }
      }
    }
    has(header, matcher) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
      }
      return false;
    }
    delete(header, matcher) {
      const self2 = this;
      let deleted = false;
      function deleteHeader(_header) {
        _header = normalizeHeader(_header);
        if (_header) {
          const key = utils_default.findKey(self2, _header);
          if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
            delete self2[key];
            deleted = true;
          }
        }
      }
      if (utils_default.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }
      return deleted;
    }
    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;
      while (i--) {
        const key = keys[i];
        if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }
      return deleted;
    }
    normalize(format) {
      const self2 = this;
      const headers = {};
      utils_default.forEach(this, (value, header) => {
        const key = utils_default.findKey(headers, header);
        if (key) {
          self2[key] = normalizeValue(value);
          delete self2[header];
          return;
        }
        const normalized = format ? formatHeader(header) : String(header).trim();
        if (normalized !== header) {
          delete self2[header];
        }
        self2[normalized] = normalizeValue(value);
        headers[normalized] = true;
      });
      return this;
    }
    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }
    toJSON(asStrings) {
      const obj = Object.create(null);
      utils_default.forEach(this, (value, header) => {
        value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
      });
      return obj;
    }
    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
      return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join(`
`);
    }
    getSetCookie() {
      return this.get("set-cookie") || [];
    }
    get [Symbol.toStringTag]() {
      return "AxiosHeaders";
    }
    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }
    static concat(first, ...targets) {
      const computed = new this(first);
      targets.forEach((target) => computed.set(target));
      return computed;
    }
    static accessor(header) {
      const internals = this[$internals] = this[$internals] = {
        accessors: {}
      };
      const accessors = internals.accessors;
      const prototype2 = this.prototype;
      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);
        if (!accessors[lHeader]) {
          buildAccessors(prototype2, _header);
          accessors[lHeader] = true;
        }
      }
      utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
      return this;
    }
  };
  AxiosHeaders.accessor([
    "Content-Type",
    "Content-Length",
    "Accept",
    "Accept-Encoding",
    "User-Agent",
    "Authorization"
  ]);
  utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1);
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      }
    };
  });
  utils_default.freezeMethods(AxiosHeaders);
  AxiosHeaders_default = AxiosHeaders;
});

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });
  headers.normalize();
  return data;
}
var init_transformData = __esm(() => {
  init_utils();
  init_defaults();
  init_AxiosHeaders();
});

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

// node_modules/axios/lib/cancel/CanceledError.js
var CanceledError, CanceledError_default;
var init_CanceledError = __esm(() => {
  init_AxiosError();
  CanceledError = class CanceledError extends AxiosError_default {
    constructor(message, config, request) {
      super(message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
      this.name = "CanceledError";
      this.__CANCEL__ = true;
    }
  };
  CanceledError_default = CanceledError;
});

// node_modules/axios/lib/core/settle.js
function settle(resolve2, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve2(response);
  } else {
    reject(new AxiosError_default("Request failed with status code " + response.status, [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4], response.config, response.request, response));
  }
}
var init_settle = __esm(() => {
  init_AxiosError();
});

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url2) {
  if (typeof url2 !== "string") {
    return false;
  }
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
}

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}

// node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
var init_buildFullPath = () => {};

// node_modules/proxy-from-env/index.js
function parseUrl(urlString) {
  try {
    return new URL(urlString);
  } catch {
    return null;
  }
}
function getProxyForUrl(url2) {
  var parsedUrl = (typeof url2 === "string" ? parseUrl(url2) : url2) || {};
  var proto = parsedUrl.protocol;
  var hostname = parsedUrl.host;
  var port = parsedUrl.port;
  if (typeof hostname !== "string" || !hostname || typeof proto !== "string") {
    return "";
  }
  proto = proto.split(":", 1)[0];
  hostname = hostname.replace(/:\d*$/, "");
  port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
  if (!shouldProxy(hostname, port)) {
    return "";
  }
  var proxy = getEnv(proto + "_proxy") || getEnv("all_proxy");
  if (proxy && proxy.indexOf("://") === -1) {
    proxy = proto + "://" + proxy;
  }
  return proxy;
}
function shouldProxy(hostname, port) {
  var NO_PROXY = getEnv("no_proxy").toLowerCase();
  if (!NO_PROXY) {
    return true;
  }
  if (NO_PROXY === "*") {
    return false;
  }
  return NO_PROXY.split(/[,\s]/).every(function(proxy) {
    if (!proxy) {
      return true;
    }
    var parsedProxy = proxy.match(/^(.+):(\d+)$/);
    var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
    var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
    if (parsedProxyPort && parsedProxyPort !== port) {
      return true;
    }
    if (!/^[.*]/.test(parsedProxyHostname)) {
      return hostname !== parsedProxyHostname;
    }
    if (parsedProxyHostname.charAt(0) === "*") {
      parsedProxyHostname = parsedProxyHostname.slice(1);
    }
    return !hostname.endsWith(parsedProxyHostname);
  });
}
function getEnv(key) {
  return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || "";
}
var DEFAULT_PORTS;
var init_proxy_from_env = __esm(() => {
  DEFAULT_PORTS = {
    ftp: 21,
    gopher: 70,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
  };
});

// node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  var s3 = 1000;
  var m = s3 * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s3;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s3) {
      return Math.round(ms / s3) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s3) {
      return plural(ms, msAbs, s3, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS((exports, module) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self2 = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend2;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend2(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module.exports = setup;
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    let m;
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c2 = "color: " + this.color;
    args.splice(1, 0, c2, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c2);
  }
  exports.log = console.debug || console.log || (() => {});
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {}
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
    } catch (error) {}
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {}
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// node_modules/debug/src/node.js
var require_node = __commonJS((exports, module) => {
  var tty = __require("tty");
  var util = __require("util");
  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.destroy = util.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = (()=>{throw new Error("Cannot require module "+"supports-color");})();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {}
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  function formatArgs(args) {
    const { namespace: name, useColors: useColors2 } = this;
    if (useColors2) {
      const c2 = this.color;
      const colorCode = "\x1B[3" + (c2 < 8 ? c2 : "8;5;" + c2);
      const prefix = `  ${colorCode};1m${name} \x1B[0m`;
      args[0] = prefix + args[0].split(`
`).join(`
` + prefix);
      args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  }
  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  }
  function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + `
`);
  }
  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for (let i = 0;i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split(`
`).map((str) => str.trim()).join(" ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// node_modules/debug/src/index.js
var require_src = __commonJS((exports, module) => {
  if (typeof process === "undefined" || process.type === "renderer" || false || process.__nwjs) {
    module.exports = require_browser();
  } else {
    module.exports = require_node();
  }
});

// node_modules/follow-redirects/debug.js
var require_debug = __commonJS((exports, module) => {
  var debug;
  module.exports = function() {
    if (!debug) {
      try {
        debug = require_src()("follow-redirects");
      } catch (error) {}
      if (typeof debug !== "function") {
        debug = function() {};
      }
    }
    debug.apply(null, arguments);
  };
});

// node_modules/follow-redirects/index.js
var require_follow_redirects = __commonJS((exports, module) => {
  var url2 = __require("url");
  var URL2 = url2.URL;
  var http = __require("http");
  var https = __require("https");
  var Writable = __require("stream").Writable;
  var assert = __require("assert");
  var debug = require_debug();
  (function detectUnsupportedEnvironment() {
    var looksLikeNode = typeof process !== "undefined";
    var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    var looksLikeV8 = isFunction2(Error.captureStackTrace);
    if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
      console.warn("The follow-redirects package should be excluded from browser builds.");
    }
  })();
  var useNativeURL = false;
  try {
    assert(new URL2(""));
  } catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
  }
  var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
  ];
  var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
  var eventHandlers = Object.create(null);
  events.forEach(function(event) {
    eventHandlers[event] = function(arg1, arg2, arg3) {
      this._redirectable.emit(event, arg1, arg2, arg3);
    };
  });
  var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
  var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
  var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
  var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
  var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  var destroy = Writable.prototype.destroy || noop2;
  function RedirectableRequest(options, responseCallback) {
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    if (responseCallback) {
      this.on("response", responseCallback);
    }
    var self2 = this;
    this._onNativeResponse = function(response) {
      try {
        self2._processResponse(response);
      } catch (cause) {
        self2.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
      }
    };
    this._performRequest();
  }
  RedirectableRequest.prototype = Object.create(Writable.prototype);
  RedirectableRequest.prototype.abort = function() {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
  };
  RedirectableRequest.prototype.destroy = function(error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
  };
  RedirectableRequest.prototype.write = function(data, encoding, callback) {
    if (this._ending) {
      throw new WriteAfterEndError;
    }
    if (!isString2(data) && !isBuffer2(data)) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (data.length === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data, encoding });
      this._currentRequest.write(data, encoding, callback);
    } else {
      this.emit("error", new MaxBodyLengthExceededError);
      this.abort();
    }
  };
  RedirectableRequest.prototype.end = function(data, encoding, callback) {
    if (isFunction2(data)) {
      callback = data;
      data = encoding = null;
    } else if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (!data) {
      this._ended = this._ending = true;
      this._currentRequest.end(null, null, callback);
    } else {
      var self2 = this;
      var currentRequest = this._currentRequest;
      this.write(data, encoding, function() {
        self2._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  };
  RedirectableRequest.prototype.setHeader = function(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  };
  RedirectableRequest.prototype.removeHeader = function(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  };
  RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
    var self2 = this;
    function destroyOnTimeout(socket) {
      socket.setTimeout(msecs);
      socket.removeListener("timeout", socket.destroy);
      socket.addListener("timeout", socket.destroy);
    }
    function startTimer(socket) {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
      }
      self2._timeout = setTimeout(function() {
        self2.emit("timeout");
        clearTimer();
      }, msecs);
      destroyOnTimeout(socket);
    }
    function clearTimer() {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
        self2._timeout = null;
      }
      self2.removeListener("abort", clearTimer);
      self2.removeListener("error", clearTimer);
      self2.removeListener("response", clearTimer);
      self2.removeListener("close", clearTimer);
      if (callback) {
        self2.removeListener("timeout", callback);
      }
      if (!self2.socket) {
        self2._currentRequest.removeListener("socket", startTimer);
      }
    }
    if (callback) {
      this.on("timeout", callback);
    }
    if (this.socket) {
      startTimer(this.socket);
    } else {
      this._currentRequest.once("socket", startTimer);
    }
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);
    return this;
  };
  [
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
  ].forEach(function(method) {
    RedirectableRequest.prototype[method] = function(a, b) {
      return this._currentRequest[method](a, b);
    };
  });
  ["aborted", "connection", "socket"].forEach(function(property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
      get: function() {
        return this._currentRequest[property];
      }
    });
  });
  RedirectableRequest.prototype._sanitizeOptions = function(options) {
    if (!options.headers) {
      options.headers = {};
    }
    if (options.host) {
      if (!options.hostname) {
        options.hostname = options.host;
      }
      delete options.host;
    }
    if (!options.pathname && options.path) {
      var searchPos = options.path.indexOf("?");
      if (searchPos < 0) {
        options.pathname = options.path;
      } else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  };
  RedirectableRequest.prototype._performRequest = function() {
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      throw new TypeError("Unsupported protocol " + protocol);
    }
    if (this._options.agents) {
      var scheme = protocol.slice(0, -1);
      this._options.agent = this._options.agents[scheme];
    }
    var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events) {
      request.on(event, eventHandlers[event]);
    }
    this._currentUrl = /^\//.test(this._options.path) ? url2.format(this._options) : this._options.path;
    if (this._isRedirect) {
      var i = 0;
      var self2 = this;
      var buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        if (request === self2._currentRequest) {
          if (error) {
            self2.emit("error", error);
          } else if (i < buffers.length) {
            var buffer = buffers[i++];
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          } else if (self2._ended) {
            request.end();
          }
        }
      })();
    }
  };
  RedirectableRequest.prototype._processResponse = function(response) {
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode
      });
    }
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);
      this._requestBodyBuffers = [];
      return;
    }
    destroyRequest(this._currentRequest);
    response.destroy();
    if (++this._redirectCount > this._options.maxRedirects) {
      throw new TooManyRedirectsError;
    }
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
      requestHeaders = Object.assign({
        Host: response.req.getHeader("host")
      }, this._options.headers);
    }
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
    var currentUrlParts = parseUrl2(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url2.format(Object.assign(currentUrlParts, { host: currentHost }));
    var redirectUrl = resolveUrl(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);
    if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
      removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
    }
    if (isFunction2(beforeRedirect)) {
      var responseDetails = {
        headers: response.headers,
        statusCode
      };
      var requestDetails = {
        url: currentUrl,
        method,
        headers: requestHeaders
      };
      beforeRedirect(this._options, responseDetails, requestDetails);
      this._sanitizeOptions(this._options);
    }
    this._performRequest();
  };
  function wrap(protocols) {
    var exports2 = {
      maxRedirects: 21,
      maxBodyLength: 10 * 1024 * 1024
    };
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function(scheme) {
      var protocol = scheme + ":";
      var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
      var wrappedProtocol = exports2[scheme] = Object.create(nativeProtocol);
      function request(input, options, callback) {
        if (isURL(input)) {
          input = spreadUrlObject(input);
        } else if (isString2(input)) {
          input = spreadUrlObject(parseUrl2(input));
        } else {
          callback = options;
          options = validateUrl(input);
          input = { protocol };
        }
        if (isFunction2(options)) {
          callback = options;
          options = null;
        }
        options = Object.assign({
          maxRedirects: exports2.maxRedirects,
          maxBodyLength: exports2.maxBodyLength
        }, input, options);
        options.nativeProtocols = nativeProtocols;
        if (!isString2(options.host) && !isString2(options.hostname)) {
          options.hostname = "::1";
        }
        assert.equal(options.protocol, protocol, "protocol mismatch");
        debug("options", options);
        return new RedirectableRequest(options, callback);
      }
      function get(input, options, callback) {
        var wrappedRequest = wrappedProtocol.request(input, options, callback);
        wrappedRequest.end();
        return wrappedRequest;
      }
      Object.defineProperties(wrappedProtocol, {
        request: { value: request, configurable: true, enumerable: true, writable: true },
        get: { value: get, configurable: true, enumerable: true, writable: true }
      });
    });
    return exports2;
  }
  function noop2() {}
  function parseUrl2(input) {
    var parsed;
    if (useNativeURL) {
      parsed = new URL2(input);
    } else {
      parsed = validateUrl(url2.parse(input));
      if (!isString2(parsed.protocol)) {
        throw new InvalidUrlError({ input });
      }
    }
    return parsed;
  }
  function resolveUrl(relative3, base) {
    return useNativeURL ? new URL2(relative3, base) : parseUrl2(url2.resolve(base, relative3));
  }
  function validateUrl(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    return input;
  }
  function spreadUrlObject(urlObject, target) {
    var spread = target || {};
    for (var key of preservedUrlFields) {
      spread[key] = urlObject[key];
    }
    if (spread.hostname.startsWith("[")) {
      spread.hostname = spread.hostname.slice(1, -1);
    }
    if (spread.port !== "") {
      spread.port = Number(spread.port);
    }
    spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
    return spread;
  }
  function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for (var header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return lastValue === null || typeof lastValue === "undefined" ? undefined : String(lastValue).trim();
  }
  function createErrorType(code, message, baseClass) {
    function CustomError(properties) {
      if (isFunction2(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor);
      }
      Object.assign(this, properties || {});
      this.code = code;
      this.message = this.cause ? message + ": " + this.cause.message : message;
    }
    CustomError.prototype = new (baseClass || Error);
    Object.defineProperties(CustomError.prototype, {
      constructor: {
        value: CustomError,
        enumerable: false
      },
      name: {
        value: "Error [" + code + "]",
        enumerable: false
      }
    });
    return CustomError;
  }
  function destroyRequest(request, error) {
    for (var event of events) {
      request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop2);
    request.destroy(error);
  }
  function isSubdomain(subdomain, domain) {
    assert(isString2(subdomain) && isString2(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
  }
  function isString2(value) {
    return typeof value === "string" || value instanceof String;
  }
  function isFunction2(value) {
    return typeof value === "function";
  }
  function isBuffer2(value) {
    return typeof value === "object" && "length" in value;
  }
  function isURL(value) {
    return URL2 && value instanceof URL2;
  }
  module.exports = wrap({ http, https });
  module.exports.wrap = wrap;
});

// node_modules/axios/lib/env/data.js
var VERSION = "1.15.0";

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url2) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url2);
  return match && match[1] || "";
}

// node_modules/axios/lib/helpers/fromDataURI.js
function fromDataURI(uri, asBlob, options) {
  const _Blob = options && options.Blob || platform_default.classes.Blob;
  const protocol = parseProtocol(uri);
  if (asBlob === undefined && _Blob) {
    asBlob = true;
  }
  if (protocol === "data") {
    uri = protocol.length ? uri.slice(protocol.length + 1) : uri;
    const match = DATA_URL_PATTERN.exec(uri);
    if (!match) {
      throw new AxiosError_default("Invalid URL", AxiosError_default.ERR_INVALID_URL);
    }
    const mime = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? "base64" : "utf8");
    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError_default("Blob is not supported", AxiosError_default.ERR_NOT_SUPPORT);
      }
      return new _Blob([buffer], { type: mime });
    }
    return buffer;
  }
  throw new AxiosError_default("Unsupported protocol " + protocol, AxiosError_default.ERR_NOT_SUPPORT);
}
var DATA_URL_PATTERN;
var init_fromDataURI = __esm(() => {
  init_AxiosError();
  init_platform();
  DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;
});

// node_modules/axios/lib/helpers/AxiosTransformStream.js
import stream from "stream";
var kInternals, AxiosTransformStream, AxiosTransformStream_default;
var init_AxiosTransformStream = __esm(() => {
  init_utils();
  kInternals = Symbol("internals");
  AxiosTransformStream = class AxiosTransformStream extends stream.Transform {
    constructor(options) {
      options = utils_default.toFlatObject(options, {
        maxRate: 0,
        chunkSize: 64 * 1024,
        minChunkSize: 100,
        timeWindow: 500,
        ticksRate: 2,
        samplesCount: 15
      }, null, (prop, source) => {
        return !utils_default.isUndefined(source[prop]);
      });
      super({
        readableHighWaterMark: options.chunkSize
      });
      const internals = this[kInternals] = {
        timeWindow: options.timeWindow,
        chunkSize: options.chunkSize,
        maxRate: options.maxRate,
        minChunkSize: options.minChunkSize,
        bytesSeen: 0,
        isCaptured: false,
        notifiedBytesLoaded: 0,
        ts: Date.now(),
        bytes: 0,
        onReadCallback: null
      };
      this.on("newListener", (event) => {
        if (event === "progress") {
          if (!internals.isCaptured) {
            internals.isCaptured = true;
          }
        }
      });
    }
    _read(size) {
      const internals = this[kInternals];
      if (internals.onReadCallback) {
        internals.onReadCallback();
      }
      return super._read(size);
    }
    _transform(chunk, encoding, callback) {
      const internals = this[kInternals];
      const maxRate = internals.maxRate;
      const readableHighWaterMark = this.readableHighWaterMark;
      const timeWindow = internals.timeWindow;
      const divider = 1000 / timeWindow;
      const bytesThreshold = maxRate / divider;
      const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;
      const pushChunk = (_chunk, _callback) => {
        const bytes = Buffer.byteLength(_chunk);
        internals.bytesSeen += bytes;
        internals.bytes += bytes;
        internals.isCaptured && this.emit("progress", internals.bytesSeen);
        if (this.push(_chunk)) {
          process.nextTick(_callback);
        } else {
          internals.onReadCallback = () => {
            internals.onReadCallback = null;
            process.nextTick(_callback);
          };
        }
      };
      const transformChunk = (_chunk, _callback) => {
        const chunkSize = Buffer.byteLength(_chunk);
        let chunkRemainder = null;
        let maxChunkSize = readableHighWaterMark;
        let bytesLeft;
        let passed = 0;
        if (maxRate) {
          const now = Date.now();
          if (!internals.ts || (passed = now - internals.ts) >= timeWindow) {
            internals.ts = now;
            bytesLeft = bytesThreshold - internals.bytes;
            internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
            passed = 0;
          }
          bytesLeft = bytesThreshold - internals.bytes;
        }
        if (maxRate) {
          if (bytesLeft <= 0) {
            return setTimeout(() => {
              _callback(null, _chunk);
            }, timeWindow - passed);
          }
          if (bytesLeft < maxChunkSize) {
            maxChunkSize = bytesLeft;
          }
        }
        if (maxChunkSize && chunkSize > maxChunkSize && chunkSize - maxChunkSize > minChunkSize) {
          chunkRemainder = _chunk.subarray(maxChunkSize);
          _chunk = _chunk.subarray(0, maxChunkSize);
        }
        pushChunk(_chunk, chunkRemainder ? () => {
          process.nextTick(_callback, null, chunkRemainder);
        } : _callback);
      };
      transformChunk(chunk, function transformNextChunk(err, _chunk) {
        if (err) {
          return callback(err);
        }
        if (_chunk) {
          transformChunk(_chunk, transformNextChunk);
        } else {
          callback(null);
        }
      });
    }
  };
  AxiosTransformStream_default = AxiosTransformStream;
});

// node_modules/axios/lib/helpers/readBlob.js
var asyncIterator, readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
}, readBlob_default;
var init_readBlob = __esm(() => {
  ({ asyncIterator } = Symbol);
  readBlob_default = readBlob;
});

// node_modules/axios/lib/helpers/formDataToStream.js
import util from "util";
import { Readable } from "stream";

class FormDataPart {
  constructor(name, value) {
    const { escapeName } = this.constructor;
    const isStringValue = utils_default.isString(value);
    let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${!isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ""}${CRLF}`;
    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }
    this.headers = textEncoder.encode(headers + CRLF);
    this.contentLength = isStringValue ? value.byteLength : value.size;
    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;
    this.name = name;
    this.value = value;
  }
  async* encode() {
    yield this.headers;
    const { value } = this;
    if (utils_default.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob_default(value);
    }
    yield CRLF_BYTES;
  }
  static escapeName(name) {
    return String(name).replace(/[\r\n"]/g, (match) => ({
      "\r": "%0D",
      "\n": "%0A",
      '"': "%22"
    })[match]);
  }
}
var BOUNDARY_ALPHABET, textEncoder, CRLF = `\r
`, CRLF_BYTES, CRLF_BYTES_COUNT = 2, formDataToStream = (form, headersHandler, options) => {
  const {
    tag = "form-data-boundary",
    size = 25,
    boundary = tag + "-" + platform_default.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};
  if (!utils_default.isFormData(form)) {
    throw TypeError("FormData instance required");
  }
  if (boundary.length < 1 || boundary.length > 70) {
    throw Error("boundary must be 10-70 characters long");
  }
  const boundaryBytes = textEncoder.encode("--" + boundary + CRLF);
  const footerBytes = textEncoder.encode("--" + boundary + "--" + CRLF);
  let contentLength = footerBytes.byteLength;
  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });
  contentLength += boundaryBytes.byteLength * parts.length;
  contentLength = utils_default.toFiniteNumber(contentLength);
  const computedHeaders = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`
  };
  if (Number.isFinite(contentLength)) {
    computedHeaders["Content-Length"] = contentLength;
  }
  headersHandler && headersHandler(computedHeaders);
  return Readable.from(async function* () {
    for (const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }
    yield footerBytes;
  }());
}, formDataToStream_default;
var init_formDataToStream = __esm(() => {
  init_utils();
  init_readBlob();
  init_platform();
  BOUNDARY_ALPHABET = platform_default.ALPHABET.ALPHA_DIGIT + "-_";
  textEncoder = typeof TextEncoder === "function" ? new TextEncoder : new util.TextEncoder;
  CRLF_BYTES = textEncoder.encode(CRLF);
  formDataToStream_default = formDataToStream;
});

// node_modules/axios/lib/helpers/ZlibHeaderTransformStream.js
import stream2 from "stream";
var ZlibHeaderTransformStream, ZlibHeaderTransformStream_default;
var init_ZlibHeaderTransformStream = __esm(() => {
  ZlibHeaderTransformStream = class ZlibHeaderTransformStream extends stream2.Transform {
    __transform(chunk, encoding, callback) {
      this.push(chunk);
      callback();
    }
    _transform(chunk, encoding, callback) {
      if (chunk.length !== 0) {
        this._transform = this.__transform;
        if (chunk[0] !== 120) {
          const header = Buffer.alloc(2);
          header[0] = 120;
          header[1] = 156;
          this.push(header, encoding);
        }
      }
      this.__transform(chunk, encoding, callback);
    }
  };
  ZlibHeaderTransformStream_default = ZlibHeaderTransformStream;
});

// node_modules/axios/lib/helpers/callbackify.js
var callbackify = (fn, reducer) => {
  return utils_default.isAsyncFn(fn) ? function(...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
      }
    }, cb);
  } : fn;
}, callbackify_default;
var init_callbackify = __esm(() => {
  init_utils();
  callbackify_default = callbackify;
});

// node_modules/axios/lib/helpers/shouldBypassProxy.js
function shouldBypassProxy(location) {
  let parsed;
  try {
    parsed = new URL(location);
  } catch (_err) {
    return false;
  }
  const noProxy = (process.env.no_proxy || process.env.NO_PROXY || "").toLowerCase();
  if (!noProxy) {
    return false;
  }
  if (noProxy === "*") {
    return true;
  }
  const port = Number.parseInt(parsed.port, 10) || DEFAULT_PORTS2[parsed.protocol.split(":", 1)[0]] || 0;
  const hostname = normalizeNoProxyHost(parsed.hostname.toLowerCase());
  return noProxy.split(/[\s,]+/).some((entry) => {
    if (!entry) {
      return false;
    }
    let [entryHost, entryPort] = parseNoProxyEntry(entry);
    entryHost = normalizeNoProxyHost(entryHost);
    if (!entryHost) {
      return false;
    }
    if (entryPort && entryPort !== port) {
      return false;
    }
    if (entryHost.charAt(0) === "*") {
      entryHost = entryHost.slice(1);
    }
    if (entryHost.charAt(0) === ".") {
      return hostname.endsWith(entryHost);
    }
    return hostname === entryHost;
  });
}
var DEFAULT_PORTS2, parseNoProxyEntry = (entry) => {
  let entryHost = entry;
  let entryPort = 0;
  if (entryHost.charAt(0) === "[") {
    const bracketIndex = entryHost.indexOf("]");
    if (bracketIndex !== -1) {
      const host = entryHost.slice(1, bracketIndex);
      const rest = entryHost.slice(bracketIndex + 1);
      if (rest.charAt(0) === ":" && /^\d+$/.test(rest.slice(1))) {
        entryPort = Number.parseInt(rest.slice(1), 10);
      }
      return [host, entryPort];
    }
  }
  const firstColon = entryHost.indexOf(":");
  const lastColon = entryHost.lastIndexOf(":");
  if (firstColon !== -1 && firstColon === lastColon && /^\d+$/.test(entryHost.slice(lastColon + 1))) {
    entryPort = Number.parseInt(entryHost.slice(lastColon + 1), 10);
    entryHost = entryHost.slice(0, lastColon);
  }
  return [entryHost, entryPort];
}, normalizeNoProxyHost = (hostname) => {
  if (!hostname) {
    return hostname;
  }
  if (hostname.charAt(0) === "[" && hostname.charAt(hostname.length - 1) === "]") {
    hostname = hostname.slice(1, -1);
  }
  return hostname.replace(/\.+$/, "");
};
var init_shouldBypassProxy = __esm(() => {
  DEFAULT_PORTS2 = {
    http: 80,
    https: 443,
    ws: 80,
    wss: 443,
    ftp: 21
  };
});

// node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== undefined ? min : 1000;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
  };
}
var speedometer_default;
var init_speedometer = __esm(() => {
  speedometer_default = speedometer;
});

// node_modules/axios/lib/helpers/throttle.js
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1000 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
var throttle_default;
var init_throttle = __esm(() => {
  throttle_default = throttle;
});

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer_default(50, 250);
  return throttle_default((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
}, progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [
    (loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }),
    throttled[1]
  ];
}, asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));
var init_progressEventReducer = __esm(() => {
  init_speedometer();
  init_throttle();
  init_utils();
});

// node_modules/axios/lib/helpers/estimateDataURLDecodedBytes.js
function estimateDataURLDecodedBytes(url2) {
  if (!url2 || typeof url2 !== "string")
    return 0;
  if (!url2.startsWith("data:"))
    return 0;
  const comma = url2.indexOf(",");
  if (comma < 0)
    return 0;
  const meta = url2.slice(5, comma);
  const body = url2.slice(comma + 1);
  const isBase64 = /;base64/i.test(meta);
  if (isBase64) {
    let effectiveLen = body.length;
    const len = body.length;
    for (let i = 0;i < len; i++) {
      if (body.charCodeAt(i) === 37 && i + 2 < len) {
        const a = body.charCodeAt(i + 1);
        const b = body.charCodeAt(i + 2);
        const isHex = (a >= 48 && a <= 57 || a >= 65 && a <= 70 || a >= 97 && a <= 102) && (b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102);
        if (isHex) {
          effectiveLen -= 2;
          i += 2;
        }
      }
    }
    let pad = 0;
    let idx = len - 1;
    const tailIsPct3D = (j) => j >= 2 && body.charCodeAt(j - 2) === 37 && body.charCodeAt(j - 1) === 51 && (body.charCodeAt(j) === 68 || body.charCodeAt(j) === 100);
    if (idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
        idx--;
      } else if (tailIsPct3D(idx)) {
        pad++;
        idx -= 3;
      }
    }
    if (pad === 1 && idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
      } else if (tailIsPct3D(idx)) {
        pad++;
      }
    }
    const groups = Math.floor(effectiveLen / 4);
    const bytes = groups * 3 - (pad || 0);
    return bytes > 0 ? bytes : 0;
  }
  return Buffer.byteLength(body, "utf8");
}

// node_modules/axios/lib/adapters/http.js
import http from "http";
import https from "https";
import http2 from "http2";
import util2 from "util";
import zlib from "zlib";
import stream3 from "stream";
import { EventEmitter } from "events";

class Http2Sessions {
  constructor() {
    this.sessions = Object.create(null);
  }
  getSession(authority, options) {
    options = Object.assign({
      sessionTimeout: 1000
    }, options);
    let authoritySessions = this.sessions[authority];
    if (authoritySessions) {
      let len = authoritySessions.length;
      for (let i = 0;i < len; i++) {
        const [sessionHandle, sessionOptions] = authoritySessions[i];
        if (!sessionHandle.destroyed && !sessionHandle.closed && util2.isDeepStrictEqual(sessionOptions, options)) {
          return sessionHandle;
        }
      }
    }
    const session = http2.connect(authority, options);
    let removed;
    const removeSession = () => {
      if (removed) {
        return;
      }
      removed = true;
      let entries = authoritySessions, len = entries.length, i = len;
      while (i--) {
        if (entries[i][0] === session) {
          if (len === 1) {
            delete this.sessions[authority];
          } else {
            entries.splice(i, 1);
          }
          if (!session.closed) {
            session.close();
          }
          return;
        }
      }
    };
    const originalRequestFn = session.request;
    const { sessionTimeout } = options;
    if (sessionTimeout != null) {
      let timer;
      let streamsCount = 0;
      session.request = function() {
        const stream4 = originalRequestFn.apply(this, arguments);
        streamsCount++;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        stream4.once("close", () => {
          if (!--streamsCount) {
            timer = setTimeout(() => {
              timer = null;
              removeSession();
            }, sessionTimeout);
          }
        });
        return stream4;
      };
    }
    session.once("close", removeSession);
    let entry = [session, options];
    authoritySessions ? authoritySessions.push(entry) : authoritySessions = this.sessions[authority] = [entry];
    return session;
  }
}
function dispatchBeforeRedirect(options, responseDetails) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options, responseDetails);
  }
}
function setProxy(options, configProxy, location) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = getProxyForUrl(location);
    if (proxyUrl) {
      if (!shouldBypassProxy(location)) {
        proxy = new URL(proxyUrl);
      }
    }
  }
  if (proxy) {
    if (proxy.username) {
      proxy.auth = (proxy.username || "") + ":" + (proxy.password || "");
    }
    if (proxy.auth) {
      const validProxyAuth = Boolean(proxy.auth.username || proxy.auth.password);
      if (validProxyAuth) {
        proxy.auth = (proxy.auth.username || "") + ":" + (proxy.auth.password || "");
      } else if (typeof proxy.auth === "object") {
        throw new AxiosError_default("Invalid proxy authorization", AxiosError_default.ERR_BAD_OPTION, { proxy });
      }
      const base64 = Buffer.from(proxy.auth, "utf8").toString("base64");
      options.headers["Proxy-Authorization"] = "Basic " + base64;
    }
    options.headers.host = options.hostname + (options.port ? ":" + options.port : "");
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(":") ? proxy.protocol : `${proxy.protocol}:`;
    }
  }
  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
}
var import_follow_redirects, zlibOptions, brotliOptions, isBrotliSupported, httpFollow, httpsFollow, isHttps, supportedProtocols, flushOnFinish = (stream4, [throttled, flush]) => {
  stream4.on("end", flush).on("error", flush);
  return throttled;
}, http2Sessions, isHttpAdapterSupported, wrapAsync = (asyncExecutor) => {
  return new Promise((resolve2, reject) => {
    let onDone;
    let isDone;
    const done = (value, isRejected) => {
      if (isDone)
        return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };
    const _resolve = (value) => {
      done(value);
      resolve2(value);
    };
    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };
    asyncExecutor(_resolve, _reject, (onDoneHandler) => onDone = onDoneHandler).catch(_reject);
  });
}, resolveFamily = ({ address, family }) => {
  if (!utils_default.isString(address)) {
    throw TypeError("address must be a string");
  }
  return {
    address,
    family: family || (address.indexOf(".") < 0 ? 6 : 4)
  };
}, buildAddressEntry = (address, family) => resolveFamily(utils_default.isObject(address) ? address : { address, family }), http2Transport, http_default;
var init_http = __esm(() => {
  init_utils();
  init_settle();
  init_buildFullPath();
  init_buildURL();
  init_proxy_from_env();
  init_transitional();
  init_AxiosError();
  init_CanceledError();
  init_platform();
  init_fromDataURI();
  init_AxiosHeaders();
  init_AxiosTransformStream();
  init_formDataToStream();
  init_readBlob();
  init_ZlibHeaderTransformStream();
  init_callbackify();
  init_shouldBypassProxy();
  init_progressEventReducer();
  import_follow_redirects = __toESM(require_follow_redirects(), 1);
  zlibOptions = {
    flush: zlib.constants.Z_SYNC_FLUSH,
    finishFlush: zlib.constants.Z_SYNC_FLUSH
  };
  brotliOptions = {
    flush: zlib.constants.BROTLI_OPERATION_FLUSH,
    finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
  };
  isBrotliSupported = utils_default.isFunction(zlib.createBrotliDecompress);
  ({ http: httpFollow, https: httpsFollow } = import_follow_redirects.default);
  isHttps = /https:?/;
  supportedProtocols = platform_default.protocols.map((protocol) => {
    return protocol + ":";
  });
  http2Sessions = new Http2Sessions;
  isHttpAdapterSupported = typeof process !== "undefined" && utils_default.kindOf(process) === "process";
  http2Transport = {
    request(options, cb) {
      const authority = options.protocol + "//" + options.hostname + ":" + (options.port || (options.protocol === "https:" ? 443 : 80));
      const { http2Options, headers } = options;
      const session = http2Sessions.getSession(authority, http2Options);
      const { HTTP2_HEADER_SCHEME, HTTP2_HEADER_METHOD, HTTP2_HEADER_PATH, HTTP2_HEADER_STATUS } = http2.constants;
      const http2Headers = {
        [HTTP2_HEADER_SCHEME]: options.protocol.replace(":", ""),
        [HTTP2_HEADER_METHOD]: options.method,
        [HTTP2_HEADER_PATH]: options.path
      };
      utils_default.forEach(headers, (header, name) => {
        name.charAt(0) !== ":" && (http2Headers[name] = header);
      });
      const req = session.request(http2Headers);
      req.once("response", (responseHeaders) => {
        const response = req;
        responseHeaders = Object.assign({}, responseHeaders);
        const status = responseHeaders[HTTP2_HEADER_STATUS];
        delete responseHeaders[HTTP2_HEADER_STATUS];
        response.headers = responseHeaders;
        response.statusCode = +status;
        cb(response);
      });
      return req;
    }
  };
  http_default = isHttpAdapterSupported && function httpAdapter(config) {
    return wrapAsync(async function dispatchHttpRequest(resolve2, reject, onDone) {
      let { data, lookup, family, httpVersion = 1, http2Options } = config;
      const { responseType, responseEncoding } = config;
      const method = config.method.toUpperCase();
      let isDone;
      let rejected = false;
      let req;
      httpVersion = +httpVersion;
      if (Number.isNaN(httpVersion)) {
        throw TypeError(`Invalid protocol version: '${config.httpVersion}' is not a number`);
      }
      if (httpVersion !== 1 && httpVersion !== 2) {
        throw TypeError(`Unsupported protocol version '${httpVersion}'`);
      }
      const isHttp2 = httpVersion === 2;
      if (lookup) {
        const _lookup = callbackify_default(lookup, (value) => utils_default.isArray(value) ? value : [value]);
        lookup = (hostname, opt, cb) => {
          _lookup(hostname, opt, (err, arg0, arg1) => {
            if (err) {
              return cb(err);
            }
            const addresses = utils_default.isArray(arg0) ? arg0.map((addr) => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];
            opt.all ? cb(err, addresses) : cb(err, addresses[0].address, addresses[0].family);
          });
        };
      }
      const abortEmitter = new EventEmitter;
      function abort(reason) {
        try {
          abortEmitter.emit("abort", !reason || reason.type ? new CanceledError_default(null, config, req) : reason);
        } catch (err) {
          console.warn("emit error", err);
        }
      }
      abortEmitter.once("abort", reject);
      const onFinished = () => {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(abort);
        }
        if (config.signal) {
          config.signal.removeEventListener("abort", abort);
        }
        abortEmitter.removeAllListeners();
      };
      if (config.cancelToken || config.signal) {
        config.cancelToken && config.cancelToken.subscribe(abort);
        if (config.signal) {
          config.signal.aborted ? abort() : config.signal.addEventListener("abort", abort);
        }
      }
      onDone((response, isRejected) => {
        isDone = true;
        if (isRejected) {
          rejected = true;
          onFinished();
          return;
        }
        const { data: data2 } = response;
        if (data2 instanceof stream3.Readable || data2 instanceof stream3.Duplex) {
          const offListeners = stream3.finished(data2, () => {
            offListeners();
            onFinished();
          });
        } else {
          onFinished();
        }
      });
      const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
      const parsed = new URL(fullPath, platform_default.hasBrowserEnv ? platform_default.origin : undefined);
      const protocol = parsed.protocol || supportedProtocols[0];
      if (protocol === "data:") {
        if (config.maxContentLength > -1) {
          const dataUrl = String(config.url || fullPath || "");
          const estimated = estimateDataURLDecodedBytes(dataUrl);
          if (estimated > config.maxContentLength) {
            return reject(new AxiosError_default("maxContentLength size of " + config.maxContentLength + " exceeded", AxiosError_default.ERR_BAD_RESPONSE, config));
          }
        }
        let convertedData;
        if (method !== "GET") {
          return settle(resolve2, reject, {
            status: 405,
            statusText: "method not allowed",
            headers: {},
            config
          });
        }
        try {
          convertedData = fromDataURI(config.url, responseType === "blob", {
            Blob: config.env && config.env.Blob
          });
        } catch (err) {
          throw AxiosError_default.from(err, AxiosError_default.ERR_BAD_REQUEST, config);
        }
        if (responseType === "text") {
          convertedData = convertedData.toString(responseEncoding);
          if (!responseEncoding || responseEncoding === "utf8") {
            convertedData = utils_default.stripBOM(convertedData);
          }
        } else if (responseType === "stream") {
          convertedData = stream3.Readable.from(convertedData);
        }
        return settle(resolve2, reject, {
          data: convertedData,
          status: 200,
          statusText: "OK",
          headers: new AxiosHeaders_default,
          config
        });
      }
      if (supportedProtocols.indexOf(protocol) === -1) {
        return reject(new AxiosError_default("Unsupported protocol " + protocol, AxiosError_default.ERR_BAD_REQUEST, config));
      }
      const headers = AxiosHeaders_default.from(config.headers).normalize();
      headers.set("User-Agent", "axios/" + VERSION, false);
      const { onUploadProgress, onDownloadProgress } = config;
      const maxRate = config.maxRate;
      let maxUploadRate = undefined;
      let maxDownloadRate = undefined;
      if (utils_default.isSpecCompliantForm(data)) {
        const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);
        data = formDataToStream_default(data, (formHeaders) => {
          headers.set(formHeaders);
        }, {
          tag: `axios-${VERSION}-boundary`,
          boundary: userBoundary && userBoundary[1] || undefined
        });
      } else if (utils_default.isFormData(data) && utils_default.isFunction(data.getHeaders)) {
        headers.set(data.getHeaders());
        if (!headers.hasContentLength()) {
          try {
            const knownLength = await util2.promisify(data.getLength).call(data);
            Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
          } catch (e) {}
        }
      } else if (utils_default.isBlob(data) || utils_default.isFile(data)) {
        data.size && headers.setContentType(data.type || "application/octet-stream");
        headers.setContentLength(data.size || 0);
        data = stream3.Readable.from(readBlob_default(data));
      } else if (data && !utils_default.isStream(data)) {
        if (Buffer.isBuffer(data)) {} else if (utils_default.isArrayBuffer(data)) {
          data = Buffer.from(new Uint8Array(data));
        } else if (utils_default.isString(data)) {
          data = Buffer.from(data, "utf-8");
        } else {
          return reject(new AxiosError_default("Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream", AxiosError_default.ERR_BAD_REQUEST, config));
        }
        headers.setContentLength(data.length, false);
        if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
          return reject(new AxiosError_default("Request body larger than maxBodyLength limit", AxiosError_default.ERR_BAD_REQUEST, config));
        }
      }
      const contentLength = utils_default.toFiniteNumber(headers.getContentLength());
      if (utils_default.isArray(maxRate)) {
        maxUploadRate = maxRate[0];
        maxDownloadRate = maxRate[1];
      } else {
        maxUploadRate = maxDownloadRate = maxRate;
      }
      if (data && (onUploadProgress || maxUploadRate)) {
        if (!utils_default.isStream(data)) {
          data = stream3.Readable.from(data, { objectMode: false });
        }
        data = stream3.pipeline([
          data,
          new AxiosTransformStream_default({
            maxRate: utils_default.toFiniteNumber(maxUploadRate)
          })
        ], utils_default.noop);
        onUploadProgress && data.on("progress", flushOnFinish(data, progressEventDecorator(contentLength, progressEventReducer(asyncDecorator(onUploadProgress), false, 3))));
      }
      let auth = undefined;
      if (config.auth) {
        const username = config.auth.username || "";
        const password = config.auth.password || "";
        auth = username + ":" + password;
      }
      if (!auth && parsed.username) {
        const urlUsername = parsed.username;
        const urlPassword = parsed.password;
        auth = urlUsername + ":" + urlPassword;
      }
      auth && headers.delete("authorization");
      let path4;
      try {
        path4 = buildURL(parsed.pathname + parsed.search, config.params, config.paramsSerializer).replace(/^\?/, "");
      } catch (err) {
        const customErr = new Error(err.message);
        customErr.config = config;
        customErr.url = config.url;
        customErr.exists = true;
        return reject(customErr);
      }
      headers.set("Accept-Encoding", "gzip, compress, deflate" + (isBrotliSupported ? ", br" : ""), false);
      const options = {
        path: path4,
        method,
        headers: headers.toJSON(),
        agents: { http: config.httpAgent, https: config.httpsAgent },
        auth,
        protocol,
        family,
        beforeRedirect: dispatchBeforeRedirect,
        beforeRedirects: {},
        http2Options
      };
      !utils_default.isUndefined(lookup) && (options.lookup = lookup);
      if (config.socketPath) {
        options.socketPath = config.socketPath;
      } else {
        options.hostname = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;
        options.port = parsed.port;
        setProxy(options, config.proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
      }
      let transport;
      const isHttpsRequest = isHttps.test(options.protocol);
      options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
      if (isHttp2) {
        transport = http2Transport;
      } else {
        if (config.transport) {
          transport = config.transport;
        } else if (config.maxRedirects === 0) {
          transport = isHttpsRequest ? https : http;
        } else {
          if (config.maxRedirects) {
            options.maxRedirects = config.maxRedirects;
          }
          if (config.beforeRedirect) {
            options.beforeRedirects.config = config.beforeRedirect;
          }
          transport = isHttpsRequest ? httpsFollow : httpFollow;
        }
      }
      if (config.maxBodyLength > -1) {
        options.maxBodyLength = config.maxBodyLength;
      } else {
        options.maxBodyLength = Infinity;
      }
      if (config.insecureHTTPParser) {
        options.insecureHTTPParser = config.insecureHTTPParser;
      }
      req = transport.request(options, function handleResponse(res) {
        if (req.destroyed)
          return;
        const streams = [res];
        const responseLength = utils_default.toFiniteNumber(res.headers["content-length"]);
        if (onDownloadProgress || maxDownloadRate) {
          const transformStream = new AxiosTransformStream_default({
            maxRate: utils_default.toFiniteNumber(maxDownloadRate)
          });
          onDownloadProgress && transformStream.on("progress", flushOnFinish(transformStream, progressEventDecorator(responseLength, progressEventReducer(asyncDecorator(onDownloadProgress), true, 3))));
          streams.push(transformStream);
        }
        let responseStream = res;
        const lastRequest = res.req || req;
        if (config.decompress !== false && res.headers["content-encoding"]) {
          if (method === "HEAD" || res.statusCode === 204) {
            delete res.headers["content-encoding"];
          }
          switch ((res.headers["content-encoding"] || "").toLowerCase()) {
            case "gzip":
            case "x-gzip":
            case "compress":
            case "x-compress":
              streams.push(zlib.createUnzip(zlibOptions));
              delete res.headers["content-encoding"];
              break;
            case "deflate":
              streams.push(new ZlibHeaderTransformStream_default);
              streams.push(zlib.createUnzip(zlibOptions));
              delete res.headers["content-encoding"];
              break;
            case "br":
              if (isBrotliSupported) {
                streams.push(zlib.createBrotliDecompress(brotliOptions));
                delete res.headers["content-encoding"];
              }
          }
        }
        responseStream = streams.length > 1 ? stream3.pipeline(streams, utils_default.noop) : streams[0];
        const response = {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: new AxiosHeaders_default(res.headers),
          config,
          request: lastRequest
        };
        if (responseType === "stream") {
          response.data = responseStream;
          settle(resolve2, reject, response);
        } else {
          const responseBuffer = [];
          let totalResponseBytes = 0;
          responseStream.on("data", function handleStreamData(chunk) {
            responseBuffer.push(chunk);
            totalResponseBytes += chunk.length;
            if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
              rejected = true;
              responseStream.destroy();
              abort(new AxiosError_default("maxContentLength size of " + config.maxContentLength + " exceeded", AxiosError_default.ERR_BAD_RESPONSE, config, lastRequest));
            }
          });
          responseStream.on("aborted", function handlerStreamAborted() {
            if (rejected) {
              return;
            }
            const err = new AxiosError_default("stream has been aborted", AxiosError_default.ERR_BAD_RESPONSE, config, lastRequest);
            responseStream.destroy(err);
            reject(err);
          });
          responseStream.on("error", function handleStreamError(err) {
            if (req.destroyed)
              return;
            reject(AxiosError_default.from(err, null, config, lastRequest));
          });
          responseStream.on("end", function handleStreamEnd() {
            try {
              let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
              if (responseType !== "arraybuffer") {
                responseData = responseData.toString(responseEncoding);
                if (!responseEncoding || responseEncoding === "utf8") {
                  responseData = utils_default.stripBOM(responseData);
                }
              }
              response.data = responseData;
            } catch (err) {
              return reject(AxiosError_default.from(err, null, config, response.request, response));
            }
            settle(resolve2, reject, response);
          });
        }
        abortEmitter.once("abort", (err) => {
          if (!responseStream.destroyed) {
            responseStream.emit("error", err);
            responseStream.destroy();
          }
        });
      });
      abortEmitter.once("abort", (err) => {
        if (req.close) {
          req.close();
        } else {
          req.destroy(err);
        }
      });
      req.on("error", function handleRequestError(err) {
        reject(AxiosError_default.from(err, null, config, req));
      });
      req.on("socket", function handleRequestSocket(socket) {
        socket.setKeepAlive(true, 1000 * 60);
      });
      if (config.timeout) {
        const timeout = parseInt(config.timeout, 10);
        if (Number.isNaN(timeout)) {
          abort(new AxiosError_default("error trying to parse `config.timeout` to int", AxiosError_default.ERR_BAD_OPTION_VALUE, config, req));
          return;
        }
        req.setTimeout(timeout, function handleRequestTimeout() {
          if (isDone)
            return;
          let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
          const transitional = config.transitional || transitional_default;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          abort(new AxiosError_default(timeoutErrorMessage, transitional.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED, config, req));
        });
      } else {
        req.setTimeout(0);
      }
      if (utils_default.isStream(data)) {
        let ended = false;
        let errored = false;
        data.on("end", () => {
          ended = true;
        });
        data.once("error", (err) => {
          errored = true;
          req.destroy(err);
        });
        data.on("close", () => {
          if (!ended && !errored) {
            abort(new CanceledError_default("Request stream has been aborted", config, req));
          }
        });
        data.pipe(req);
      } else {
        data && req.write(data);
        req.end();
      }
    });
  };
});

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default;
var init_isURLSameOrigin = __esm(() => {
  init_platform();
  isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? ((origin2, isMSIE) => (url2) => {
    url2 = new URL(url2, platform_default.origin);
    return origin2.protocol === url2.protocol && origin2.host === url2.host && (isMSIE || origin2.port === url2.port);
  })(new URL(platform_default.origin), platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)) : () => true;
});

// node_modules/axios/lib/helpers/cookies.js
var cookies_default;
var init_cookies = __esm(() => {
  init_utils();
  init_platform();
  cookies_default = platform_default.hasStandardBrowserEnv ? {
    write(name, value, expires, path4, domain, secure, sameSite) {
      if (typeof document === "undefined")
        return;
      const cookie = [`${name}=${encodeURIComponent(value)}`];
      if (utils_default.isNumber(expires)) {
        cookie.push(`expires=${new Date(expires).toUTCString()}`);
      }
      if (utils_default.isString(path4)) {
        cookie.push(`path=${path4}`);
      }
      if (utils_default.isString(domain)) {
        cookie.push(`domain=${domain}`);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      if (utils_default.isString(sameSite)) {
        cookie.push(`SameSite=${sameSite}`);
      }
      document.cookie = cookie.join("; ");
    },
    read(name) {
      if (typeof document === "undefined")
        return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 86400000, "/");
    }
  } : {
    write() {},
    read() {
      return null;
    },
    remove() {}
  };
});

// node_modules/axios/lib/core/mergeConfig.js
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(undefined, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    if (prop === "__proto__" || prop === "constructor" || prop === "prototype")
      return;
    const merge2 = utils_default.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
var init_mergeConfig = __esm(() => {
  init_utils();
  init_AxiosHeaders();
});

// node_modules/axios/lib/helpers/resolveConfig.js
var resolveConfig_default = (config) => {
  const newConfig = mergeConfig({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders_default.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set("Authorization", "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : "")));
  }
  if (utils_default.isFormData(data)) {
    if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(undefined);
    } else if (utils_default.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform_default.hasStandardBrowserEnv) {
    withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
var init_resolveConfig = __esm(() => {
  init_platform();
  init_utils();
  init_isURLSameOrigin();
  init_cookies();
  init_buildFullPath();
  init_mergeConfig();
  init_AxiosHeaders();
  init_buildURL();
});

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported, xhr_default;
var init_xhr = __esm(() => {
  init_utils();
  init_settle();
  init_transitional();
  init_AxiosError();
  init_CanceledError();
  init_platform();
  init_AxiosHeaders();
  init_progressEventReducer();
  init_resolveConfig();
  isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
  xhr_default = isXHRAdapterSupported && function(config) {
    return new Promise(function dispatchXhrRequest(resolve2, reject) {
      const _config = resolveConfig_default(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
      let { responseType, onUploadProgress, onDownloadProgress } = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;
      function done() {
        flushUpload && flushUpload();
        flushDownload && flushDownload();
        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
        _config.signal && _config.signal.removeEventListener("abort", onCanceled);
      }
      let request = new XMLHttpRequest;
      request.open(_config.method.toUpperCase(), _config.url, true);
      request.timeout = _config.timeout;
      function onloadend() {
        if (!request) {
          return;
        }
        const responseHeaders = AxiosHeaders_default.from("getAllResponseHeaders" in request && request.getAllResponseHeaders());
        const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };
        settle(function _resolve(value) {
          resolve2(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);
        request = null;
      }
      if ("onloadend" in request) {
        request.onloadend = onloadend;
      } else {
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
            return;
          }
          setTimeout(onloadend);
        };
      }
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }
        reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
        request = null;
      };
      request.onerror = function handleError(event) {
        const msg = event && event.message ? event.message : "Network Error";
        const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
        err.event = event || null;
        reject(err);
        request = null;
      };
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional = _config.transitional || transitional_default;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(new AxiosError_default(timeoutErrorMessage, transitional.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED, config, request));
        request = null;
      };
      requestData === undefined && requestHeaders.setContentType(null);
      if ("setRequestHeader" in request) {
        utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }
      if (!utils_default.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }
      if (responseType && responseType !== "json") {
        request.responseType = _config.responseType;
      }
      if (onDownloadProgress) {
        [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
        request.addEventListener("progress", downloadThrottled);
      }
      if (onUploadProgress && request.upload) {
        [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
        request.upload.addEventListener("progress", uploadThrottled);
        request.upload.addEventListener("loadend", flushUpload);
      }
      if (_config.cancelToken || _config.signal) {
        onCanceled = (cancel) => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
          request.abort();
          request = null;
        };
        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
        }
      }
      const protocol = parseProtocol(_config.url);
      if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
        reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
        return;
      }
      request.send(requestData || null);
    });
  };
});

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController;
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError_default(`timeout of ${timeout}ms exceeded`, AxiosError_default.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils_default.asap(unsubscribe);
    return signal;
  }
}, composeSignals_default;
var init_composeSignals = __esm(() => {
  init_CanceledError();
  init_AxiosError();
  init_utils();
  composeSignals_default = composeSignals;
});

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
}, readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
}, readStream = async function* (stream4) {
  if (stream4[Symbol.asyncIterator]) {
    yield* stream4;
    return;
  }
  const reader = stream4.getReader();
  try {
    for (;; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
}, trackStream = (stream4, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream4, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};

// node_modules/axios/lib/adapters/fetch.js
var DEFAULT_CHUNK_SIZE, isFunction2, globalFetchAPI, ReadableStream2, TextEncoder2, test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
}, factory = (env) => {
  env = utils_default.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction2(Request);
  const isResponseSupported = isFunction2(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
  const encodeText = isFetchSupported && (typeof TextEncoder2 === "function" ? ((encoder) => (str) => encoder.encode(str))(new TextEncoder2) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const body = new ReadableStream2;
    const hasContentType = new Request(platform_default.origin, {
      body,
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    body.cancel();
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils_default.isBlob(body)) {
      return body.size;
    }
    if (utils_default.isSpecCompliantForm(body)) {
      const _request = new Request(platform_default.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils_default.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils_default.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils_default.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config) => {
    let {
      url: url2,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig_default(config);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url2, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(requestContentLength, progressEventReducer(asyncDecorator(onUploadProgress)));
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils_default.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : undefined
      };
      request = isRequestSupported && new Request(url2, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url2, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(responseContentLength, progressEventReducer(asyncDecorator(onDownloadProgress), true)) || [];
        response = new Response(trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
          flush && flush();
          unsubscribe && unsubscribe();
        }), options);
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve2, reject) => {
        settle(resolve2, reject, {
          data: responseData,
          headers: AxiosHeaders_default.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request, err && err.response), {
          cause: err.cause || err
        });
      }
      throw AxiosError_default.from(err, err && err.code, config, request, err && err.response);
    }
  };
}, seedCache, getFetch = (config) => {
  let env = config && config.env || {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [Request, Response, fetch2];
  let len = seeds.length, i = len, seed, target, map = seedCache;
  while (i--) {
    seed = seeds[i];
    target = map.get(seed);
    target === undefined && map.set(seed, target = i ? new Map : factory(env));
    map = target;
  }
  return target;
}, adapter;
var init_fetch = __esm(() => {
  init_platform();
  init_utils();
  init_AxiosError();
  init_composeSignals();
  init_AxiosHeaders();
  init_progressEventReducer();
  init_resolveConfig();
  init_settle();
  DEFAULT_CHUNK_SIZE = 64 * 1024;
  ({ isFunction: isFunction2 } = utils_default);
  globalFetchAPI = (({ Request, Response }) => ({
    Request,
    Response
  }))(utils_default.global);
  ({ ReadableStream: ReadableStream2, TextEncoder: TextEncoder2 } = utils_default.global);
  seedCache = new Map;
  adapter = getFetch();
});

// node_modules/axios/lib/adapters/adapters.js
function getAdapter(adapters, config) {
  adapters = utils_default.isArray(adapters) ? adapters : [adapters];
  const { length } = adapters;
  let nameOrAdapter;
  let adapter2;
  const rejectedReasons = {};
  for (let i = 0;i < length; i++) {
    nameOrAdapter = adapters[i];
    let id;
    adapter2 = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter2 === undefined) {
        throw new AxiosError_default(`Unknown adapter '${id}'`);
      }
    }
    if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
      break;
    }
    rejectedReasons[id || "#" + i] = adapter2;
  }
  if (!adapter2) {
    const reasons = Object.entries(rejectedReasons).map(([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build"));
    let s3 = length ? reasons.length > 1 ? `since :
` + reasons.map(renderReason).join(`
`) : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError_default(`There is no suitable adapter to dispatch the request ` + s3, "ERR_NOT_SUPPORT");
  }
  return adapter2;
}
var knownAdapters, renderReason = (reason) => `- ${reason}`, isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false, adapters_default;
var init_adapters = __esm(() => {
  init_utils();
  init_http();
  init_xhr();
  init_fetch();
  init_AxiosError();
  knownAdapters = {
    http: http_default,
    xhr: xhr_default,
    fetch: {
      get: getFetch
    }
  };
  utils_default.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, "name", { value });
      } catch (e) {}
      Object.defineProperty(fn, "adapterName", { value });
    }
  });
  adapters_default = {
    getAdapter,
    adapters: knownAdapters
  };
});

// node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(config, config.transformRequest);
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
  return adapter2(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(config, config.transformResponse, response);
    response.headers = AxiosHeaders_default.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(config, config.transformResponse, reason.response);
        reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
var init_dispatchRequest = __esm(() => {
  init_transformData();
  init_defaults();
  init_CanceledError();
  init_AxiosHeaders();
  init_adapters();
});

// node_modules/axios/lib/helpers/validator.js
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validators, deprecatedWarnings, validator_default;
var init_validator = __esm(() => {
  init_AxiosError();
  validators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
    validators[type] = function validator(thing) {
      return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
    };
  });
  deprecatedWarnings = {};
  validators.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
    }
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError_default(formatMessage(opt, " has been removed" + (version ? " in " + version : "")), AxiosError_default.ERR_DEPRECATED);
      }
      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
      }
      return validator ? validator(value, opt, opts) : true;
    };
  };
  validators.spelling = function spelling(correctSpelling) {
    return (value, opt) => {
      console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
      return true;
    };
  };
  validator_default = {
    assertOptions,
    validators
  };
});

// node_modules/axios/lib/core/Axios.js
class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager_default,
      response: new InterceptorManager_default
    };
  }
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error;
        const stack = (() => {
          if (!dummy.stack) {
            return "";
          }
          const firstNewlineIndex = dummy.stack.indexOf(`
`);
          return firstNewlineIndex === -1 ? "" : dummy.stack.slice(firstNewlineIndex + 1);
        })();
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack) {
            const firstNewlineIndex = stack.indexOf(`
`);
            const secondNewlineIndex = firstNewlineIndex === -1 ? -1 : stack.indexOf(`
`, firstNewlineIndex + 1);
            const stackWithoutTwoTopLines = secondNewlineIndex === -1 ? "" : stack.slice(secondNewlineIndex + 1);
            if (!String(err.stack).endsWith(stackWithoutTwoTopLines)) {
              err.stack += `
` + stack;
            }
          }
        } catch (e) {}
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== undefined) {
      validator_default.assertOptions(transitional2, {
        silentJSONParsing: validators2.transitional(validators2.boolean),
        forcedJSONParsing: validators2.transitional(validators2.boolean),
        clarifyTimeoutError: validators2.transitional(validators2.boolean),
        legacyInterceptorReqResOrdering: validators2.transitional(validators2.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils_default.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator_default.assertOptions(paramsSerializer, {
          encode: validators2.function,
          serialize: validators2.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== undefined) {} else if (this.defaults.allowAbsoluteUrls !== undefined) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator_default.assertOptions(config, {
      baseUrl: validators2.spelling("baseURL"),
      withXsrfToken: validators2.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils_default.merge(headers.common, headers[config.method]);
    headers && utils_default.forEach(["delete", "get", "head", "post", "put", "patch", "common"], (method) => {
      delete headers[method];
    });
    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      const transitional3 = config.transitional || transitional_default;
      const legacyInterceptorReqResOrdering = transitional3 && transitional3.legacyInterceptorReqResOrdering;
      if (legacyInterceptorReqResOrdering) {
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      } else {
        requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      }
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
}
var validators2, Axios_default;
var init_Axios = __esm(() => {
  init_utils();
  init_buildURL();
  init_InterceptorManager();
  init_dispatchRequest();
  init_mergeConfig();
  init_buildFullPath();
  init_validator();
  init_AxiosHeaders();
  init_transitional();
  validators2 = validator_default.validators;
  utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
    Axios.prototype[method] = function(url2, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        url: url2,
        data: (config || {}).data
      }));
    };
  });
  utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
    function generateHTTPMethod(isForm) {
      return function httpMethod(url2, data, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          headers: isForm ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: url2,
          data
        }));
      };
    }
    Axios.prototype[method] = generateHTTPMethod();
    Axios.prototype[method + "Form"] = generateHTTPMethod(true);
  });
  Axios_default = Axios;
});

// node_modules/axios/lib/cancel/CancelToken.js
class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve2) {
      resolvePromise = resolve2;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners)
        return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve2) => {
        token.subscribe(resolve2);
        _resolve = resolve2;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError_default(message, config, request);
      resolvePromise(token.reason);
    });
  }
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController;
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c2) {
      cancel = c2;
    });
    return {
      token,
      cancel
    };
  }
}
var CancelToken_default;
var init_CancelToken = __esm(() => {
  init_CanceledError();
  CancelToken_default = CancelToken;
});

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}
var init_isAxiosError = __esm(() => {
  init_utils();
});

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode, HttpStatusCode_default;
var init_HttpStatusCode = __esm(() => {
  HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
    WebServerIsDown: 521,
    ConnectionTimedOut: 522,
    OriginIsUnreachable: 523,
    TimeoutOccurred: 524,
    SslHandshakeFailed: 525,
    InvalidSslCertificate: 526
  };
  Object.entries(HttpStatusCode).forEach(([key, value]) => {
    HttpStatusCode[value] = key;
  });
  HttpStatusCode_default = HttpStatusCode;
});

// node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios, axios_default;
var init_axios = __esm(() => {
  init_utils();
  init_Axios();
  init_mergeConfig();
  init_defaults();
  init_formDataToJSON();
  init_CanceledError();
  init_CancelToken();
  init_toFormData();
  init_AxiosError();
  init_isAxiosError();
  init_AxiosHeaders();
  init_adapters();
  init_HttpStatusCode();
  axios = createInstance(defaults_default);
  axios.Axios = Axios_default;
  axios.CanceledError = CanceledError_default;
  axios.CancelToken = CancelToken_default;
  axios.isCancel = isCancel;
  axios.VERSION = VERSION;
  axios.toFormData = toFormData_default;
  axios.AxiosError = AxiosError_default;
  axios.Cancel = axios.CanceledError;
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;
  axios.isAxiosError = isAxiosError;
  axios.mergeConfig = mergeConfig;
  axios.AxiosHeaders = AxiosHeaders_default;
  axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
  axios.getAdapter = adapters_default.getAdapter;
  axios.HttpStatusCode = HttpStatusCode_default;
  axios.default = axios;
  axios_default = axios;
});

// node_modules/axios/index.js
var Axios2, AxiosError2, CanceledError2, isCancel2, CancelToken2, VERSION2, all2, Cancel, isAxiosError2, spread2, toFormData2, AxiosHeaders2, HttpStatusCode2, formToJSON, getAdapter2, mergeConfig2;
var init_axios2 = __esm(() => {
  init_axios();
  ({
    Axios: Axios2,
    AxiosError: AxiosError2,
    CanceledError: CanceledError2,
    isCancel: isCancel2,
    CancelToken: CancelToken2,
    VERSION: VERSION2,
    all: all2,
    Cancel,
    isAxiosError: isAxiosError2,
    spread: spread2,
    toFormData: toFormData2,
    AxiosHeaders: AxiosHeaders2,
    HttpStatusCode: HttpStatusCode2,
    formToJSON,
    getAdapter: getAdapter2,
    mergeConfig: mergeConfig2
  } = axios_default);
});

// node_modules/agent-base/dist/helpers.js
var require_helpers = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.req = exports.json = exports.toBuffer = undefined;
  var http3 = __importStar(__require("http"));
  var https2 = __importStar(__require("https"));
  async function toBuffer(stream4) {
    let length = 0;
    const chunks = [];
    for await (const chunk of stream4) {
      length += chunk.length;
      chunks.push(chunk);
    }
    return Buffer.concat(chunks, length);
  }
  exports.toBuffer = toBuffer;
  async function json(stream4) {
    const buf = await toBuffer(stream4);
    const str = buf.toString("utf8");
    try {
      return JSON.parse(str);
    } catch (_err) {
      const err = _err;
      err.message += ` (input: ${str})`;
      throw err;
    }
  }
  exports.json = json;
  function req(url2, opts = {}) {
    const href = typeof url2 === "string" ? url2 : url2.href;
    const req2 = (href.startsWith("https:") ? https2 : http3).request(url2, opts);
    const promise = new Promise((resolve2, reject) => {
      req2.once("response", resolve2).once("error", reject).end();
    });
    req2.then = promise.then.bind(promise);
    return req2;
  }
  exports.req = req;
});

// node_modules/agent-base/dist/index.js
var require_dist = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Agent = undefined;
  var net = __importStar(__require("net"));
  var http3 = __importStar(__require("http"));
  var https_1 = __require("https");
  __exportStar(require_helpers(), exports);
  var INTERNAL = Symbol("AgentBaseInternalState");

  class Agent extends http3.Agent {
    constructor(opts) {
      super(opts);
      this[INTERNAL] = {};
    }
    isSecureEndpoint(options) {
      if (options) {
        if (typeof options.secureEndpoint === "boolean") {
          return options.secureEndpoint;
        }
        if (typeof options.protocol === "string") {
          return options.protocol === "https:";
        }
      }
      const { stack } = new Error;
      if (typeof stack !== "string")
        return false;
      return stack.split(`
`).some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
    }
    incrementSockets(name) {
      if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
        return null;
      }
      if (!this.sockets[name]) {
        this.sockets[name] = [];
      }
      const fakeSocket = new net.Socket({ writable: false });
      this.sockets[name].push(fakeSocket);
      this.totalSocketCount++;
      return fakeSocket;
    }
    decrementSockets(name, socket) {
      if (!this.sockets[name] || socket === null) {
        return;
      }
      const sockets = this.sockets[name];
      const index = sockets.indexOf(socket);
      if (index !== -1) {
        sockets.splice(index, 1);
        this.totalSocketCount--;
        if (sockets.length === 0) {
          delete this.sockets[name];
        }
      }
    }
    getName(options) {
      const secureEndpoint = this.isSecureEndpoint(options);
      if (secureEndpoint) {
        return https_1.Agent.prototype.getName.call(this, options);
      }
      return super.getName(options);
    }
    createSocket(req, options, cb) {
      const connectOpts = {
        ...options,
        secureEndpoint: this.isSecureEndpoint(options)
      };
      const name = this.getName(connectOpts);
      const fakeSocket = this.incrementSockets(name);
      Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
        this.decrementSockets(name, fakeSocket);
        if (socket instanceof http3.Agent) {
          try {
            return socket.addRequest(req, connectOpts);
          } catch (err) {
            return cb(err);
          }
        }
        this[INTERNAL].currentSocket = socket;
        super.createSocket(req, options, cb);
      }, (err) => {
        this.decrementSockets(name, fakeSocket);
        cb(err);
      });
    }
    createConnection() {
      const socket = this[INTERNAL].currentSocket;
      this[INTERNAL].currentSocket = undefined;
      if (!socket) {
        throw new Error("No socket was returned in the `connect()` function");
      }
      return socket;
    }
    get defaultPort() {
      return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
    }
    set defaultPort(v) {
      if (this[INTERNAL]) {
        this[INTERNAL].defaultPort = v;
      }
    }
    get protocol() {
      return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
    }
    set protocol(v) {
      if (this[INTERNAL]) {
        this[INTERNAL].protocol = v;
      }
    }
  }
  exports.Agent = Agent;
});

// node_modules/https-proxy-agent/dist/parse-proxy-response.js
var require_parse_proxy_response = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.parseProxyResponse = undefined;
  var debug_1 = __importDefault(require_src());
  var debug = (0, debug_1.default)("https-proxy-agent:parse-proxy-response");
  function parseProxyResponse(socket) {
    return new Promise((resolve2, reject) => {
      let buffersLength = 0;
      const buffers = [];
      function read() {
        const b = socket.read();
        if (b)
          ondata(b);
        else
          socket.once("readable", read);
      }
      function cleanup() {
        socket.removeListener("end", onend);
        socket.removeListener("error", onerror);
        socket.removeListener("readable", read);
      }
      function onend() {
        cleanup();
        debug("onend");
        reject(new Error("Proxy connection ended before receiving CONNECT response"));
      }
      function onerror(err) {
        cleanup();
        debug("onerror %o", err);
        reject(err);
      }
      function ondata(b) {
        buffers.push(b);
        buffersLength += b.length;
        const buffered = Buffer.concat(buffers, buffersLength);
        const endOfHeaders = buffered.indexOf(`\r
\r
`);
        if (endOfHeaders === -1) {
          debug("have not received end of HTTP headers yet...");
          read();
          return;
        }
        const headerParts = buffered.slice(0, endOfHeaders).toString("ascii").split(`\r
`);
        const firstLine = headerParts.shift();
        if (!firstLine) {
          socket.destroy();
          return reject(new Error("No header received from proxy CONNECT response"));
        }
        const firstLineParts = firstLine.split(" ");
        const statusCode = +firstLineParts[1];
        const statusText = firstLineParts.slice(2).join(" ");
        const headers = {};
        for (const header of headerParts) {
          if (!header)
            continue;
          const firstColon = header.indexOf(":");
          if (firstColon === -1) {
            socket.destroy();
            return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
          }
          const key = header.slice(0, firstColon).toLowerCase();
          const value = header.slice(firstColon + 1).trimStart();
          const current = headers[key];
          if (typeof current === "string") {
            headers[key] = [current, value];
          } else if (Array.isArray(current)) {
            current.push(value);
          } else {
            headers[key] = value;
          }
        }
        debug("got proxy server response: %o %o", firstLine, headers);
        cleanup();
        resolve2({
          connect: {
            statusCode,
            statusText,
            headers
          },
          buffered
        });
      }
      socket.on("error", onerror);
      socket.on("end", onend);
      read();
    });
  }
  exports.parseProxyResponse = parseProxyResponse;
});

// node_modules/https-proxy-agent/dist/index.js
var require_dist2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.HttpsProxyAgent = undefined;
  var net = __importStar(__require("net"));
  var tls = __importStar(__require("tls"));
  var assert_1 = __importDefault(__require("assert"));
  var debug_1 = __importDefault(require_src());
  var agent_base_1 = require_dist();
  var url_1 = __require("url");
  var parse_proxy_response_1 = require_parse_proxy_response();
  var debug = (0, debug_1.default)("https-proxy-agent");
  var setServernameFromNonIpHost = (options) => {
    if (options.servername === undefined && options.host && !net.isIP(options.host)) {
      return {
        ...options,
        servername: options.host
      };
    }
    return options;
  };

  class HttpsProxyAgent extends agent_base_1.Agent {
    constructor(proxy, opts) {
      super(opts);
      this.options = { path: undefined };
      this.proxy = typeof proxy === "string" ? new url_1.URL(proxy) : proxy;
      this.proxyHeaders = opts?.headers ?? {};
      debug("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
      const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
      const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
      this.connectOpts = {
        ALPNProtocols: ["http/1.1"],
        ...opts ? omit(opts, "headers") : null,
        host,
        port
      };
    }
    async connect(req, opts) {
      const { proxy } = this;
      if (!opts.host) {
        throw new TypeError('No "host" provided');
      }
      let socket;
      if (proxy.protocol === "https:") {
        debug("Creating `tls.Socket`: %o", this.connectOpts);
        socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
      } else {
        debug("Creating `net.Socket`: %o", this.connectOpts);
        socket = net.connect(this.connectOpts);
      }
      const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
      const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
      let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r
`;
      if (proxy.username || proxy.password) {
        const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
        headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
      }
      headers.Host = `${host}:${opts.port}`;
      if (!headers["Proxy-Connection"]) {
        headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
      }
      for (const name of Object.keys(headers)) {
        payload += `${name}: ${headers[name]}\r
`;
      }
      const proxyResponsePromise = (0, parse_proxy_response_1.parseProxyResponse)(socket);
      socket.write(`${payload}\r
`);
      const { connect, buffered } = await proxyResponsePromise;
      req.emit("proxyConnect", connect);
      this.emit("proxyConnect", connect, req);
      if (connect.statusCode === 200) {
        req.once("socket", resume);
        if (opts.secureEndpoint) {
          debug("Upgrading socket connection to TLS");
          return tls.connect({
            ...omit(setServernameFromNonIpHost(opts), "host", "path", "port"),
            socket
          });
        }
        return socket;
      }
      socket.destroy();
      const fakeSocket = new net.Socket({ writable: false });
      fakeSocket.readable = true;
      req.once("socket", (s3) => {
        debug("Replaying proxy buffer for failed request");
        (0, assert_1.default)(s3.listenerCount("data") > 0);
        s3.push(buffered);
        s3.push(null);
      });
      return fakeSocket;
    }
  }
  HttpsProxyAgent.protocols = ["http", "https"];
  exports.HttpsProxyAgent = HttpsProxyAgent;
  function resume(socket) {
    socket.resume();
  }
  function omit(obj, ...keys) {
    const ret = {};
    let key;
    for (key in obj) {
      if (!keys.includes(key)) {
        ret[key] = obj[key];
      }
    }
    return ret;
  }
});

// node_modules/ws/wrapper.mjs
var exports_wrapper = {};
__export(exports_wrapper, {
  subprotocol: () => import_subprotocol.default,
  extension: () => import_extension.default,
  default: () => wrapper_default,
  createWebSocketStream: () => import_stream5.default,
  WebSocketServer: () => import_websocket_server.default,
  WebSocket: () => import_websocket.default,
  Sender: () => import_sender.default,
  Receiver: () => import_receiver.default,
  PerMessageDeflate: () => import_permessage_deflate.default
});
var import_stream5, import_extension, import_permessage_deflate, import_receiver, import_sender, import_subprotocol, import_websocket, import_websocket_server, wrapper_default;
var init_wrapper = __esm(() => {
  import_stream5 = __toESM(require_stream(), 1);
  import_extension = __toESM(require_extension(), 1);
  import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
  import_receiver = __toESM(require_receiver(), 1);
  import_sender = __toESM(require_sender(), 1);
  import_subprotocol = __toESM(require_subprotocol(), 1);
  import_websocket = __toESM(require_websocket(), 1);
  import_websocket_server = __toESM(require_websocket_server(), 1);
  wrapper_default = import_websocket.default;
});

// node_modules/edge-tts-universal/dist/index.js
var exports_dist = {};
__export(exports_dist, {
  listVoicesUniversal: () => listVoices2,
  listVoicesIsomorphic: () => listVoices2,
  listVoices: () => listVoices,
  createVTTUniversal_Isomorphic: () => createVTT2,
  createVTTIsomorphic: () => createVTT2,
  createVTTBrowser: () => createVTT3,
  createVTT: () => createVTT,
  createSRTUniversal_Isomorphic: () => createSRT2,
  createSRTIsomorphic: () => createSRT2,
  createSRTBrowser: () => createSRT3,
  createSRT: () => createSRT,
  WebSocketError: () => WebSocketError,
  VoicesManager: () => VoicesManager,
  ValueError: () => ValueError,
  UnknownResponse: () => UnknownResponse,
  UniversalVoicesManager: () => IsomorphicVoicesManager,
  UniversalFetchError: () => FetchError,
  UniversalEdgeTTS_Isomorphic: () => IsomorphicEdgeTTS,
  UniversalEdgeTTS: () => EdgeTTS,
  UniversalDRM: () => IsomorphicDRM,
  UniversalCommunicate: () => IsomorphicCommunicate,
  UnexpectedResponse: () => UnexpectedResponse,
  SubMaker: () => SubMaker,
  SkewAdjustmentError: () => SkewAdjustmentError,
  NoAudioReceived: () => NoAudioReceived,
  IsomorphicVoicesManager: () => IsomorphicVoicesManager,
  IsomorphicEdgeTTS: () => IsomorphicEdgeTTS,
  IsomorphicDRM: () => IsomorphicDRM,
  IsomorphicCommunicate: () => IsomorphicCommunicate,
  FetchError: () => FetchError,
  EdgeTTSException: () => EdgeTTSException,
  EdgeTTSBrowser: () => EdgeTTSBrowser,
  EdgeTTS: () => EdgeTTS,
  Communicate: () => Communicate
});
import { createHash, randomBytes } from "crypto";
function getHeadersAndDataFromText(message) {
  const headerLength = message.indexOf(`\r
\r
`);
  const headers = {};
  const headerString = message.subarray(0, headerLength).toString("utf-8");
  if (headerString) {
    const headerLines = headerString.split(`\r
`);
    for (const line of headerLines) {
      const [key, value] = line.split(":", 2);
      if (key && value) {
        headers[key] = value.trim();
      }
    }
  }
  return [headers, message.subarray(headerLength + 2)];
}
function getHeadersAndDataFromBinary(message) {
  const headerLength = message.readUInt16BE(0);
  const headers = {};
  const headerString = message.subarray(2, headerLength + 2).toString("utf-8");
  if (headerString) {
    const headerLines = headerString.split(`\r
`);
    for (const line of headerLines) {
      const [key, value] = line.split(":", 2);
      if (key && value) {
        headers[key] = value.trim();
      }
    }
  }
  return [headers, message.subarray(headerLength + 2)];
}
function removeIncompatibleCharacters(text) {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
}
function connectId() {
  return v4_default().replace(/-/g, "");
}
function _findLastNewlineOrSpaceWithinLimit(text, limit) {
  const slice = text.subarray(0, limit);
  let splitAt = slice.lastIndexOf(`
`);
  if (splitAt < 0) {
    splitAt = slice.lastIndexOf(" ");
  }
  return splitAt;
}
function _findSafeUtf8SplitPoint(textSegment) {
  let splitAt = textSegment.length;
  while (splitAt > 0) {
    const slice = textSegment.subarray(0, splitAt);
    if (slice.toString("utf-8").endsWith("�")) {
      splitAt--;
      continue;
    }
    return splitAt;
  }
  return splitAt;
}
function _adjustSplitPointForXmlEntity(text, splitAt) {
  let ampersandIndex = text.lastIndexOf("&", splitAt - 1);
  while (ampersandIndex !== -1) {
    const semicolonIndex = text.indexOf(";", ampersandIndex);
    if (semicolonIndex !== -1 && semicolonIndex < splitAt) {
      break;
    }
    splitAt = ampersandIndex;
    ampersandIndex = text.lastIndexOf("&", splitAt - 1);
  }
  return splitAt;
}
function* splitTextByByteLength(text, byteLength) {
  let buffer = Buffer.isBuffer(text) ? text : Buffer.from(text, "utf-8");
  while (buffer.length > byteLength) {
    let splitAt = _findLastNewlineOrSpaceWithinLimit(buffer, byteLength);
    if (splitAt < 0) {
      splitAt = _findSafeUtf8SplitPoint(buffer.subarray(0, byteLength));
    }
    splitAt = _adjustSplitPointForXmlEntity(buffer, splitAt);
    if (splitAt <= 0) {
      throw new ValueError("Maximum byte length is too small or invalid text structure near '&' or invalid UTF-8");
    }
    const chunk = buffer.subarray(0, splitAt);
    const chunkString = chunk.toString("utf-8").trim();
    if (chunkString) {
      yield Buffer.from(chunkString, "utf-8");
    }
    buffer = buffer.subarray(splitAt);
  }
  const remainingChunk = buffer.toString("utf-8").trim();
  if (remainingChunk) {
    yield Buffer.from(remainingChunk, "utf-8");
  }
}
function mkssml(tc, escapedText) {
  const text = Buffer.isBuffer(escapedText) ? escapedText.toString("utf-8") : escapedText;
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${tc.voice}'><prosody pitch='${tc.pitch}' rate='${tc.rate}' volume='${tc.volume}'>${text}</prosody></voice></speak>`;
}
function dateToString() {
  return (/* @__PURE__ */ new Date()).toUTCString().replace("GMT", "GMT+0000 (Coordinated Universal Time)");
}
function ssmlHeadersPlusData(requestId, timestamp, ssml) {
  return `X-RequestId:${requestId}\r
Content-Type:application/ssml+xml\r
X-Timestamp:${timestamp}Z\r
Path:ssml\r
\r
${ssml}`;
}
function unescape2(text) {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s3 = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  const pad = (num, size = 2) => num.toString().padStart(size, "0");
  return `${pad(h)}:${pad(m)}:${pad(s3)},${pad(ms, 3)}`;
}
function buildProxyConfig(proxy) {
  try {
    const proxyUrl = new URL(proxy);
    return {
      host: proxyUrl.hostname,
      port: parseInt(proxyUrl.port),
      protocol: proxyUrl.protocol
    };
  } catch (e) {
    return false;
  }
}
async function _listVoices(proxy) {
  const url2 = `${VOICE_LIST_URL}&Sec-MS-GEC=${DRM.generateSecMsGec()}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;
  const response = await axios_default.get(url2, {
    headers: VOICE_HEADERS,
    proxy: proxy ? buildProxyConfig(proxy) : false
  });
  const data = response.data;
  for (const voice of data) {
    voice.VoiceTag.ContentCategories = voice.VoiceTag.ContentCategories.map((c2) => c2.trim());
    voice.VoiceTag.VoicePersonalities = voice.VoiceTag.VoicePersonalities.map((p) => p.trim());
  }
  return data;
}
async function listVoices(proxy) {
  try {
    return await _listVoices(proxy);
  } catch (e) {
    if (e instanceof AxiosError2 && e.response?.status === 403) {
      DRM.handleClientResponseError(e);
      return await _listVoices(proxy);
    }
    throw e;
  }
}
function formatTimestamp(timeIn100ns, format) {
  const totalSeconds = Math.floor(timeIn100ns / 1e7);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(timeIn100ns % 1e7 / 1e4);
  const separator = format === "vtt" ? "." : ",";
  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}${separator}${padNumber(milliseconds, 3)}`;
}
function padNumber(num, length = 2) {
  return num.toString().padStart(length, "0");
}
function createVTT(wordBoundaries) {
  let vttContent = `WEBVTT

`;
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp(word.offset, "vtt");
    const endTime = formatTimestamp(word.offset + word.duration, "vtt");
    vttContent += `${index + 1}
`;
    vttContent += `${startTime} --> ${endTime}
`;
    vttContent += `${word.text}

`;
  });
  return vttContent;
}
function createSRT(wordBoundaries) {
  let srtContent = "";
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp(word.offset, "srt");
    const endTime = formatTimestamp(word.offset + word.duration, "srt");
    srtContent += `${index + 1}
`;
    srtContent += `${startTime} --> ${endTime}
`;
    srtContent += `${word.text}

`;
  });
  return srtContent;
}
function connectId2() {
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);
  array[6] = array[6] & 15 | 64;
  array[8] = array[8] & 63 | 128;
  const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  return uuid.replace(/-/g, "");
}
function escape2(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function unescape22(text) {
  return text.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function dateToString2(date) {
  if (!date) {
    date = /* @__PURE__ */ new Date;
  }
  return date.toISOString().replace(/[-:.]/g, "").slice(0, -1);
}
function removeIncompatibleCharacters2(str) {
  const chars_to_remove = '*/()[]{}$%^@#+=|\\~`><"&';
  let clean_str = str;
  for (const char of chars_to_remove) {
    clean_str = clean_str.replace(new RegExp("\\" + char, "g"), "");
  }
  return clean_str;
}
function mkssml2(tc, escapedText) {
  const text = escapedText instanceof Uint8Array ? new TextDecoder().decode(escapedText) : escapedText;
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${tc.voice}'><prosody pitch='${tc.pitch}' rate='${tc.rate}' volume='${tc.volume}'>${text}</prosody></voice></speak>`;
}
function splitTextByByteLength2(text, byteLength) {
  const encoder = new TextEncoder;
  const words = text.split(/(\s+)/);
  const chunks = [];
  let currentChunk = "";
  for (const word of words) {
    const potentialChunk = currentChunk + word;
    if (encoder.encode(potentialChunk).length <= byteLength) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        const wordBytes = encoder.encode(word);
        for (let i = 0;i < wordBytes.length; i += byteLength) {
          const slice = wordBytes.slice(i, i + byteLength);
          chunks.push(new TextDecoder().decode(slice));
        }
        currentChunk = "";
      }
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}
function ssmlHeadersPlusData2(requestId, timestamp, ssml) {
  return `X-RequestId:${requestId}\r
Content-Type:application/ssml+xml\r
X-Timestamp:${timestamp}Z\r
Path:ssml\r
\r
${ssml}`;
}
function isomorphicGetHeadersAndDataFromText(message) {
  const messageString = IsomorphicBuffer.toString(message);
  const headerEndIndex = messageString.indexOf(`\r
\r
`);
  const headers = {};
  if (headerEndIndex !== -1) {
    const headerString = messageString.substring(0, headerEndIndex);
    const headerLines = headerString.split(`\r
`);
    for (const line of headerLines) {
      const [key, value] = line.split(":", 2);
      if (key && value) {
        headers[key] = value.trim();
      }
    }
  }
  const headerByteLength = new TextEncoder().encode(messageString.substring(0, headerEndIndex + 4)).length;
  return [headers, message.slice(headerByteLength)];
}
function isomorphicGetHeadersAndDataFromBinary(message) {
  if (message.length < 2) {
    throw new Error("Message too short to contain header length");
  }
  const headerLength = message[0] << 8 | message[1];
  const headers = {};
  if (headerLength > 0 && headerLength + 2 <= message.length) {
    const headerBytes = message.slice(2, headerLength + 2);
    const headerString = IsomorphicBuffer.toString(headerBytes);
    const headerLines = headerString.split(`\r
`);
    for (const line of headerLines) {
      const [key, value] = line.split(":", 2);
      if (key && value) {
        headers[key] = value.trim();
      }
    }
  }
  return [headers, message.slice(headerLength + 2)];
}
async function _listVoices2(proxy) {
  const url2 = `${VOICE_LIST_URL}&Sec-MS-GEC=${await IsomorphicDRM.generateSecMsGec()}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;
  const fetchOptions = {
    headers: VOICE_HEADERS
  };
  if (proxy) {
    console.warn("Proxy support in isomorphic environment is limited. Consider using a backend proxy.");
  }
  try {
    const response = await fetch(url2, fetchOptions);
    if (!response.ok) {
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      throw new FetchError(`HTTP ${response.status}`, {
        status: response.status,
        headers
      });
    }
    const data = await response.json();
    for (const voice of data) {
      voice.VoiceTag.ContentCategories = voice.VoiceTag.ContentCategories.map((c2) => c2.trim());
      voice.VoiceTag.VoicePersonalities = voice.VoiceTag.VoicePersonalities.map((p) => p.trim());
    }
    return data;
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    throw new FetchError(error instanceof Error ? error.message : "Unknown fetch error");
  }
}
async function listVoices2(proxy) {
  try {
    return await _listVoices2(proxy);
  } catch (e) {
    if (e instanceof FetchError && e.response?.status === 403) {
      IsomorphicDRM.handleClientResponseError(e.response);
      return await _listVoices2(proxy);
    }
    throw e;
  }
}
function concatUint8Arrays(arrays) {
  if (arrays.length === 0)
    return new Uint8Array(0);
  if (arrays.length === 1)
    return arrays[0];
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    if (arr.length > 0) {
      result.set(arr, offset);
      offset += arr.length;
    }
  }
  return result;
}
function formatTimestamp2(timeIn100ns, format) {
  const totalSeconds = Math.floor(timeIn100ns / 1e7);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(timeIn100ns % 1e7 / 1e4);
  const separator = format === "vtt" ? "." : ",";
  return `${padNumber2(hours)}:${padNumber2(minutes)}:${padNumber2(seconds)}${separator}${padNumber2(milliseconds, 3)}`;
}
function padNumber2(num, length = 2) {
  return num.toString().padStart(length, "0");
}
function createVTT2(wordBoundaries) {
  let vttContent = `WEBVTT

`;
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp2(word.offset, "vtt");
    const endTime = formatTimestamp2(word.offset + word.duration, "vtt");
    vttContent += `${index + 1}
`;
    vttContent += `${startTime} --> ${endTime}
`;
    vttContent += `${word.text}

`;
  });
  return vttContent;
}
function createSRT2(wordBoundaries) {
  let srtContent = "";
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp2(word.offset, "srt");
    const endTime = formatTimestamp2(word.offset + word.duration, "srt");
    srtContent += `${index + 1}
`;
    srtContent += `${startTime} --> ${endTime}
`;
    srtContent += `${word.text}

`;
  });
  return srtContent;
}
function formatTimestamp3(timeIn100ns, format) {
  const totalSeconds = Math.floor(timeIn100ns / 1e7);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(timeIn100ns % 1e7 / 1e4);
  const separator = format === "vtt" ? "." : ",";
  return `${padNumber3(hours)}:${padNumber3(minutes)}:${padNumber3(seconds)}${separator}${padNumber3(milliseconds, 3)}`;
}
function padNumber3(num, length = 2) {
  return num.toString().padStart(length, "0");
}
function createVTT3(wordBoundaries) {
  let vttContent = `WEBVTT

`;
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp3(word.offset, "vtt");
    const endTime = formatTimestamp3(word.offset + word.duration, "vtt");
    vttContent += `${index + 1}
`;
    vttContent += `${startTime} --> ${endTime}
`;
    vttContent += `${word.text}

`;
  });
  return vttContent;
}
function createSRT3(wordBoundaries) {
  let srtContent = "";
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp3(word.offset, "srt");
    const endTime = formatTimestamp3(word.offset + word.duration, "srt");
    srtContent += `${index + 1}
`;
    srtContent += `${startTime} --> ${endTime}
`;
    srtContent += `${word.text}

`;
  });
  return srtContent;
}
var import_xml_escape, import_isomorphic_ws, EdgeTTSException, SkewAdjustmentError, UnknownResponse, UnexpectedResponse, NoAudioReceived, WebSocketError, ValueError, TTSConfig = class _TTSConfig {
  constructor({
    voice,
    rate = "+0%",
    volume = "+0%",
    pitch = "+0Hz"
  }) {
    this.voice = voice;
    this.rate = rate;
    this.volume = volume;
    this.pitch = pitch;
    this.validate();
  }
  validate() {
    const match = /^([a-z]{2,})-([A-Z]{2,})-(.+Neural)$/.exec(this.voice);
    if (match) {
      const [, lang] = match;
      let [, , region, name] = match;
      if (name.includes("-")) {
        const parts = name.split("-");
        region += `-${parts[0]}`;
        name = parts[1];
      }
      this.voice = `Microsoft Server Speech Text to Speech Voice (${lang}-${region}, ${name})`;
    }
    _TTSConfig.validateStringParam("voice", this.voice, /^Microsoft Server Speech Text to Speech Voice \(.+,.+\)$/);
    _TTSConfig.validateStringParam("rate", this.rate, /^[+-]\d+%$/);
    _TTSConfig.validateStringParam("volume", this.volume, /^[+-]\d+%$/);
    _TTSConfig.validateStringParam("pitch", this.pitch, /^[+-]\d+Hz$/);
  }
  static validateStringParam(paramName, paramValue, pattern) {
    if (typeof paramValue !== "string") {
      throw new TypeError(`${paramName} must be a string`);
    }
    if (!pattern.test(paramValue)) {
      throw new ValueError(`Invalid ${paramName} '${paramValue}'.`);
    }
  }
}, BASE_URL = "speech.platform.bing.com/consumer/speech/synthesize/readaloud", TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4", WSS_URL, VOICE_LIST_URL, DEFAULT_VOICE = "en-US-EmmaMultilingualNeural", CHROMIUM_FULL_VERSION = "143.0.3650.75", CHROMIUM_MAJOR_VERSION, SEC_MS_GEC_VERSION, BASE_HEADERS, WSS_HEADERS, VOICE_HEADERS, WIN_EPOCH = 11644473600, S_TO_NS = 1e9, _DRM = class _DRM2 {
  static adjClockSkewSeconds(skewSeconds) {
    _DRM2.clockSkewSeconds += skewSeconds;
  }
  static getUnixTimestamp() {
    return Date.now() / 1000 + _DRM2.clockSkewSeconds;
  }
  static parseRfc2616Date(date) {
    try {
      return new Date(date).getTime() / 1000;
    } catch (e) {
      return null;
    }
  }
  static handleClientResponseError(e) {
    if (!e.response || !e.response.headers) {
      throw new SkewAdjustmentError("No server date in headers.");
    }
    const serverDate = e.response.headers["date"];
    if (!serverDate || typeof serverDate !== "string") {
      throw new SkewAdjustmentError("No server date in headers.");
    }
    const serverDateParsed = _DRM2.parseRfc2616Date(serverDate);
    if (serverDateParsed === null) {
      throw new SkewAdjustmentError(`Failed to parse server date: ${serverDate}`);
    }
    const clientDate = _DRM2.getUnixTimestamp();
    _DRM2.adjClockSkewSeconds(serverDateParsed - clientDate);
  }
  static generateSecMsGec() {
    let ticks = _DRM2.getUnixTimestamp();
    ticks += WIN_EPOCH;
    ticks -= ticks % 300;
    ticks *= S_TO_NS / 100;
    const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
    return createHash("sha256").update(strToHash, "ascii").digest("hex").toUpperCase();
  }
  static generateMuid() {
    return randomBytes(16).toString("hex").toUpperCase();
  }
  static headersWithMuid(headers) {
    return {
      ...headers,
      Cookie: `muid=${_DRM2.generateMuid()};`
    };
  }
}, DRM, HttpsProxyAgent, Communicate = class {
  constructor(text, options = {}) {
    this.state = {
      partialText: Buffer.from(""),
      offsetCompensation: 0,
      lastDurationOffset: 0,
      streamWasCalled: false
    };
    this.ttsConfig = new TTSConfig({
      voice: options.voice || DEFAULT_VOICE,
      rate: options.rate,
      volume: options.volume,
      pitch: options.pitch
    });
    if (typeof text !== "string") {
      throw new TypeError("text must be a string");
    }
    this.texts = splitTextByByteLength(import_xml_escape.default(removeIncompatibleCharacters(text)), 4096);
    this.proxy = options.proxy;
    this.connectionTimeout = options.connectionTimeout;
  }
  parseMetadata(data) {
    const metadata = JSON.parse(data.toString("utf-8"));
    for (const metaObj of metadata["Metadata"]) {
      const metaType = metaObj["Type"];
      if (metaType === "WordBoundary" || metaType === "SentenceBoundary") {
        const currentOffset = metaObj["Data"]["Offset"] + this.state.offsetCompensation;
        const currentDuration = metaObj["Data"]["Duration"];
        return {
          type: metaType,
          offset: currentOffset,
          duration: currentDuration,
          text: unescape2(metaObj["Data"]["text"]["Text"])
        };
      }
      if (metaType === "SessionEnd") {
        continue;
      }
      throw new UnknownResponse(`Unknown metadata type: ${metaType}`);
    }
    throw new UnexpectedResponse("No WordBoundary metadata found");
  }
  async* _stream() {
    const url2 = `${WSS_URL}&Sec-MS-GEC=${DRM.generateSecMsGec()}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&ConnectionId=${connectId()}`;
    let agent;
    if (this.proxy) {
      if (!HttpsProxyAgent) {
        try {
          const proxyModule = await Promise.resolve().then(() => __toESM(require_dist2(), 1));
          HttpsProxyAgent = proxyModule.HttpsProxyAgent;
        } catch (e) {
          console.warn("https-proxy-agent not available:", e);
        }
      }
      if (HttpsProxyAgent) {
        agent = new HttpsProxyAgent(this.proxy);
      }
    }
    const websocket = new import_isomorphic_ws.default(url2, {
      headers: DRM.headersWithMuid(WSS_HEADERS),
      timeout: this.connectionTimeout,
      agent
    });
    const messageQueue = [];
    let resolveMessage = null;
    websocket.on("message", (message, isBinary) => {
      if (!isBinary) {
        const [headers, data] = getHeadersAndDataFromText(message);
        const path4 = headers["Path"];
        if (path4 === "audio.metadata") {
          try {
            const parsedMetadata = this.parseMetadata(data);
            this.state.lastDurationOffset = parsedMetadata.offset + parsedMetadata.duration;
            messageQueue.push(parsedMetadata);
          } catch (e) {
            messageQueue.push(e);
          }
        } else if (path4 === "turn.end") {
          this.state.offsetCompensation = this.state.lastDurationOffset;
          this.state.offsetCompensation += 8750000;
          websocket.close();
        } else if (path4 !== "response" && path4 !== "turn.start") {
          messageQueue.push(new UnknownResponse(`Unknown path received: ${path4}`));
        }
      } else {
        if (message.length < 2) {
          messageQueue.push(new UnexpectedResponse("We received a binary message, but it is missing the header length."));
        } else {
          const headerLength = message.readUInt16BE(0);
          if (headerLength > message.length) {
            messageQueue.push(new UnexpectedResponse("The header length is greater than the length of the data."));
          } else {
            const [headers, data] = getHeadersAndDataFromBinary(message);
            if (headers["Path"] !== "audio") {
              messageQueue.push(new UnexpectedResponse("Received binary message, but the path is not audio."));
            } else {
              const contentType = headers["Content-Type"];
              if (contentType !== "audio/mpeg") {
                if (data.length > 0) {
                  messageQueue.push(new UnexpectedResponse("Received binary message, but with an unexpected Content-Type."));
                }
              } else if (data.length === 0) {
                messageQueue.push(new UnexpectedResponse("Received binary message, but it is missing the audio data."));
              } else {
                messageQueue.push({ type: "audio", data });
              }
            }
          }
        }
      }
      if (resolveMessage)
        resolveMessage();
    });
    websocket.on("error", (error) => {
      messageQueue.push(new WebSocketError(error.message));
      if (resolveMessage)
        resolveMessage();
    });
    websocket.on("close", () => {
      messageQueue.push("close");
      if (resolveMessage)
        resolveMessage();
    });
    await new Promise((resolve2) => websocket.on("open", resolve2));
    websocket.send(`X-Timestamp:${dateToString()}\r
Content-Type:application/json; charset=utf-8\r
Path:speech.config\r
\r
{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r
`);
    websocket.send(ssmlHeadersPlusData(connectId(), dateToString(), mkssml(this.ttsConfig, this.state.partialText)));
    let audioWasReceived = false;
    while (true) {
      if (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message === "close") {
          if (!audioWasReceived) {
            throw new NoAudioReceived("No audio was received.");
          }
          break;
        } else if (message instanceof Error) {
          throw message;
        } else {
          if (message.type === "audio")
            audioWasReceived = true;
          yield message;
        }
      } else {
        await new Promise((resolve2) => {
          resolveMessage = resolve2;
          setTimeout(resolve2, 50);
        });
      }
    }
  }
  async* stream() {
    if (this.state.streamWasCalled) {
      throw new Error("stream can only be called once.");
    }
    this.state.streamWasCalled = true;
    for (const partialText of this.texts) {
      this.state.partialText = partialText;
      try {
        for await (const message of this._stream()) {
          yield message;
        }
      } catch (e) {
        if (e instanceof AxiosError2 && e.response?.status === 403) {
          DRM.handleClientResponseError(e);
          for await (const message of this._stream()) {
            yield message;
          }
        } else {
          throw e;
        }
      }
    }
  }
}, SubMaker = class {
  constructor() {
    this.cues = [];
  }
  feed(msg) {
    if (msg.type !== "WordBoundary" || msg.offset === undefined || msg.duration === undefined || msg.text === undefined) {
      throw new ValueError("Invalid message type, expected 'WordBoundary' with offset, duration and text");
    }
    const start = msg.offset / 1e7;
    const end = (msg.offset + msg.duration) / 1e7;
    this.cues.push({
      index: this.cues.length + 1,
      start,
      end,
      content: msg.text
    });
  }
  mergeCues(words) {
    if (words <= 0) {
      throw new ValueError("Invalid number of words to merge, expected > 0");
    }
    if (this.cues.length === 0) {
      return;
    }
    const newCues = [];
    let currentCue = this.cues[0];
    for (const cue of this.cues.slice(1)) {
      if (currentCue.content.split(" ").length < words) {
        currentCue = {
          ...currentCue,
          end: cue.end,
          content: `${currentCue.content} ${cue.content}`
        };
      } else {
        newCues.push(currentCue);
        currentCue = cue;
      }
    }
    newCues.push(currentCue);
    this.cues = newCues.map((cue, i) => ({ ...cue, index: i + 1 }));
  }
  getSrt() {
    return this.cues.map((cue) => {
      return `${cue.index}\r
${formatTime(cue.start)} --> ${formatTime(cue.end)}\r
${cue.content}\r
`;
    }).join(`\r
`);
  }
  toString() {
    return this.getSrt();
  }
}, VoicesManager = class _VoicesManager {
  constructor() {
    this.voices = [];
    this.calledCreate = false;
  }
  static async create(customVoices, proxy) {
    const manager = new _VoicesManager;
    const voices = customVoices ?? await listVoices(proxy);
    manager.voices = voices.map((voice) => ({
      ...voice,
      Language: voice.Locale.split("-")[0]
    }));
    manager.calledCreate = true;
    return manager;
  }
  find(filter2) {
    if (!this.calledCreate) {
      throw new Error("VoicesManager.find() called before VoicesManager.create()");
    }
    return this.voices.filter((voice) => {
      return Object.entries(filter2).every(([key, value]) => {
        return voice[key] === value;
      });
    });
  }
}, EdgeTTS = class {
  constructor(text, voice = "Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)", options = {}) {
    this.text = text;
    this.voice = voice;
    this.rate = options.rate || "+0%";
    this.volume = options.volume || "+0%";
    this.pitch = options.pitch || "+0Hz";
  }
  async synthesize() {
    const communicate = new Communicate(this.text, {
      voice: this.voice,
      rate: this.rate,
      volume: this.volume,
      pitch: this.pitch
    });
    const audioChunks = [];
    const wordBoundaries = [];
    for await (const chunk of communicate.stream()) {
      if (chunk.type === "audio" && chunk.data) {
        audioChunks.push(chunk.data);
      } else if (chunk.type === "WordBoundary" && chunk.offset !== undefined && chunk.duration !== undefined && chunk.text !== undefined) {
        wordBoundaries.push({
          offset: chunk.offset,
          duration: chunk.duration,
          text: chunk.text
        });
      }
    }
    const audioBuffer = Buffer.concat(audioChunks);
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
    return {
      audio: audioBlob,
      subtitle: wordBoundaries
    };
  }
}, WIN_EPOCH2 = 11644473600, S_TO_NS2 = 1e9, _IsomorphicDRM = class _IsomorphicDRM2 {
  static adjClockSkewSeconds(skewSeconds) {
    _IsomorphicDRM2.clockSkewSeconds += skewSeconds;
  }
  static getUnixTimestamp() {
    return Date.now() / 1000 + _IsomorphicDRM2.clockSkewSeconds;
  }
  static parseRfc2616Date(date) {
    try {
      return new Date(date).getTime() / 1000;
    } catch (e) {
      return null;
    }
  }
  static handleClientResponseError(response) {
    let serverDate = null;
    if ("headers" in response && typeof response.headers === "object") {
      if ("get" in response.headers && typeof response.headers.get === "function") {
        serverDate = response.headers.get("date");
      } else {
        const headers = response.headers;
        serverDate = headers["date"] || headers["Date"];
      }
    }
    if (!serverDate) {
      throw new SkewAdjustmentError("No server date in headers.");
    }
    const serverDateParsed = _IsomorphicDRM2.parseRfc2616Date(serverDate);
    if (serverDateParsed === null) {
      throw new SkewAdjustmentError(`Failed to parse server date: ${serverDate}`);
    }
    const clientDate = _IsomorphicDRM2.getUnixTimestamp();
    _IsomorphicDRM2.adjClockSkewSeconds(serverDateParsed - clientDate);
  }
  static async generateSecMsGec() {
    let ticks = _IsomorphicDRM2.getUnixTimestamp();
    ticks += WIN_EPOCH2;
    ticks -= ticks % 300;
    ticks *= S_TO_NS2 / 100;
    const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
    if (!globalThis.crypto || !globalThis.crypto.subtle) {
      throw new Error("Web Crypto API not available");
    }
    const encoder = new TextEncoder;
    const data = encoder.encode(strToHash);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  static generateMuid() {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  static headersWithMuid(headers) {
    return {
      ...headers,
      Cookie: `muid=${_IsomorphicDRM2.generateMuid()};`
    };
  }
}, IsomorphicDRM, IsomorphicBuffer, IsomorphicCommunicate = class {
  constructor(text, options = {}) {
    this.state = {
      partialText: IsomorphicBuffer.from(""),
      offsetCompensation: 0,
      lastDurationOffset: 0,
      streamWasCalled: false
    };
    this.ttsConfig = new TTSConfig({
      voice: options.voice || DEFAULT_VOICE,
      rate: options.rate,
      volume: options.volume,
      pitch: options.pitch
    });
    if (typeof text !== "string") {
      throw new TypeError("text must be a string");
    }
    const processedText = escape2(removeIncompatibleCharacters2(text));
    const maxSize = 4096;
    this.texts = function* () {
      for (const chunk of splitTextByByteLength2(processedText, maxSize)) {
        yield new TextEncoder().encode(chunk);
      }
    }();
  }
  parseMetadata(data) {
    const metadata = JSON.parse(IsomorphicBuffer.toString(data));
    for (const metaObj of metadata["Metadata"]) {
      const metaType = metaObj["Type"];
      if (metaType === "WordBoundary" || metaType === "SentenceBoundary") {
        const currentOffset = metaObj["Data"]["Offset"] + this.state.offsetCompensation;
        const currentDuration = metaObj["Data"]["Duration"];
        return {
          type: metaType,
          offset: currentOffset,
          duration: currentDuration,
          text: unescape22(metaObj["Data"]["text"]["Text"])
        };
      }
      if (metaType === "SessionEnd") {
        continue;
      }
      throw new UnknownResponse(`Unknown metadata type: ${metaType}`);
    }
    throw new UnexpectedResponse("No WordBoundary metadata found");
  }
  async createWebSocket(url2) {
    const isNode = typeof globalThis !== "undefined" ? globalThis.process?.versions?.node !== undefined : typeof process !== "undefined" && process.versions?.node !== undefined;
    if (isNode) {
      try {
        const { default: WS } = await Promise.resolve().then(() => (init_wrapper(), exports_wrapper));
        return new WS(url2, {
          headers: IsomorphicDRM.headersWithMuid(WSS_HEADERS)
        });
      } catch (error) {
        console.warn("ws library not available, using native WebSocket without headers");
        return new WebSocket(url2);
      }
    } else {
      return new WebSocket(url2);
    }
  }
  async* _stream() {
    const url2 = `${WSS_URL}&Sec-MS-GEC=${await IsomorphicDRM.generateSecMsGec()}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&ConnectionId=${connectId2()}`;
    const websocket = await this.createWebSocket(url2);
    const messageQueue = [];
    let resolveMessage = null;
    const handleMessage = (message, isBinary) => {
      const data = message.data || message;
      const binary = isBinary ?? (data instanceof ArrayBuffer || data instanceof Uint8Array);
      if (!binary && typeof data === "string") {
        const [headers, parsedData] = isomorphicGetHeadersAndDataFromText(IsomorphicBuffer.from(data));
        const path4 = headers["Path"];
        if (path4 === "audio.metadata") {
          try {
            const parsedMetadata = this.parseMetadata(parsedData);
            this.state.lastDurationOffset = parsedMetadata.offset + parsedMetadata.duration;
            messageQueue.push(parsedMetadata);
          } catch (e) {
            messageQueue.push(e);
          }
        } else if (path4 === "turn.end") {
          this.state.offsetCompensation = this.state.lastDurationOffset;
          this.state.offsetCompensation += 8750000;
          websocket.close();
        } else if (path4 !== "response" && path4 !== "turn.start") {
          messageQueue.push(new UnknownResponse(`Unknown path received: ${path4}`));
        }
      } else {
        let bufferData;
        if (data instanceof ArrayBuffer) {
          bufferData = IsomorphicBuffer.from(data);
        } else if (data instanceof Uint8Array) {
          bufferData = data;
        } else if (typeof Buffer !== "undefined" && data instanceof Buffer) {
          bufferData = new Uint8Array(data);
        } else if (typeof Blob !== "undefined" && data instanceof Blob) {
          data.arrayBuffer().then((arrayBuffer) => {
            const blobBufferData = new Uint8Array(arrayBuffer);
            processBinaryData(blobBufferData);
          }).catch((error) => {
            messageQueue.push(new UnexpectedResponse(`Failed to process Blob data: ${error.message}`));
            if (resolveMessage)
              resolveMessage();
          });
          return;
        } else {
          messageQueue.push(new UnexpectedResponse(`Unknown binary data type: ${typeof data} ${data.constructor?.name}`));
          return;
        }
        processBinaryData(bufferData);
      }
      if (resolveMessage)
        resolveMessage();
    };
    const processBinaryData = (bufferData) => {
      if (bufferData.length < 2) {
        messageQueue.push(new UnexpectedResponse("We received a binary message, but it is missing the header length."));
      } else {
        const [headers, audioData] = isomorphicGetHeadersAndDataFromBinary(bufferData);
        if (headers["Path"] !== "audio") {
          messageQueue.push(new UnexpectedResponse("Received binary message, but the path is not audio."));
        } else {
          const contentType = headers["Content-Type"];
          if (contentType !== "audio/mpeg") {
            if (audioData.length > 0) {
              messageQueue.push(new UnexpectedResponse("Received binary message, but with an unexpected Content-Type."));
            }
          } else if (audioData.length === 0) {
            messageQueue.push(new UnexpectedResponse("Received binary message, but it is missing the audio data."));
          } else {
            messageQueue.push({ type: "audio", data: audioData });
          }
        }
      }
    };
    websocket.onmessage = handleMessage;
    websocket.onerror = (error) => {
      messageQueue.push(new WebSocketError(error.message || "WebSocket error"));
      if (resolveMessage)
        resolveMessage();
    };
    websocket.onclose = () => {
      messageQueue.push("close");
      if (resolveMessage)
        resolveMessage();
    };
    await new Promise((resolve2, reject) => {
      const onOpen = () => resolve2();
      const onError = (error) => reject(error);
      websocket.onopen = onOpen;
      websocket.onerror = onError;
    });
    websocket.send(`X-Timestamp:${dateToString2()}\r
Content-Type:application/json; charset=utf-8\r
Path:speech.config\r
\r
{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r
`);
    websocket.send(ssmlHeadersPlusData2(connectId2(), dateToString2(), mkssml2(this.ttsConfig, IsomorphicBuffer.toString(this.state.partialText))));
    let audioWasReceived = false;
    while (true) {
      if (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message === "close") {
          if (!audioWasReceived) {
            throw new NoAudioReceived("No audio was received.");
          }
          break;
        } else if (message instanceof Error) {
          throw message;
        } else {
          if (message.type === "audio")
            audioWasReceived = true;
          yield message;
        }
      } else {
        await new Promise((resolve2) => {
          resolveMessage = resolve2;
          setTimeout(resolve2, 50);
        });
      }
    }
  }
  async* stream() {
    if (this.state.streamWasCalled) {
      throw new Error("stream can only be called once.");
    }
    this.state.streamWasCalled = true;
    for (const partialText of this.texts) {
      this.state.partialText = partialText;
      for await (const message of this._stream()) {
        yield message;
      }
    }
  }
}, FetchError, IsomorphicVoicesManager = class _IsomorphicVoicesManager {
  constructor() {
    this.voices = [];
    this.calledCreate = false;
  }
  static async create(customVoices, proxy) {
    const manager = new _IsomorphicVoicesManager;
    const voices = customVoices ?? await listVoices2(proxy);
    manager.voices = voices.map((voice) => ({
      ...voice,
      Language: voice.Locale.split("-")[0]
    }));
    manager.calledCreate = true;
    return manager;
  }
  find(filter2) {
    if (!this.calledCreate) {
      throw new Error("IsomorphicVoicesManager.find() called before IsomorphicVoicesManager.create()");
    }
    return this.voices.filter((voice) => {
      return Object.entries(filter2).every(([key, value]) => {
        return voice[key] === value;
      });
    });
  }
}, IsomorphicEdgeTTS = class {
  constructor(text, voice = "Microsoft Server Speech Text to Speech Voice (en-US, EmmaMultilingualNeural)", options = {}) {
    this.text = text;
    this.voice = voice;
    this.rate = options.rate || "+0%";
    this.volume = options.volume || "+0%";
    this.pitch = options.pitch || "+0Hz";
  }
  async synthesize() {
    const communicate = new IsomorphicCommunicate(this.text, {
      voice: this.voice,
      rate: this.rate,
      volume: this.volume,
      pitch: this.pitch
    });
    const audioChunks = [];
    const wordBoundaries = [];
    for await (const chunk of communicate.stream()) {
      if (chunk.type === "audio" && chunk.data) {
        audioChunks.push(chunk.data);
      } else if (chunk.type === "WordBoundary" && chunk.offset !== undefined && chunk.duration !== undefined && chunk.text !== undefined) {
        wordBoundaries.push({
          offset: chunk.offset,
          duration: chunk.duration,
          text: chunk.text
        });
      }
    }
    const audioBuffer = concatUint8Arrays(audioChunks);
    const audioBlob = new Blob([
      audioBuffer
    ], { type: "audio/mpeg" });
    return {
      audio: audioBlob,
      subtitle: wordBoundaries
    };
  }
}, WIN_EPOCH3 = 11644473600, S_TO_NS3 = 1e9, _BrowserDRM = class _BrowserDRM2 {
  static adjClockSkewSeconds(skewSeconds) {
    _BrowserDRM2.clockSkewSeconds += skewSeconds;
  }
  static getUnixTimestamp() {
    return Date.now() / 1000 + _BrowserDRM2.clockSkewSeconds;
  }
  static parseRfc2616Date(date) {
    try {
      return new Date(date).getTime() / 1000;
    } catch (e) {
      return null;
    }
  }
  static handleClientResponseError(response) {
    if (!response.headers) {
      throw new SkewAdjustmentError("No headers in response.");
    }
    const serverDate = response.headers["date"] || response.headers["Date"];
    if (!serverDate) {
      throw new SkewAdjustmentError("No server date in headers.");
    }
    const serverDateParsed = _BrowserDRM2.parseRfc2616Date(serverDate);
    if (serverDateParsed === null) {
      throw new SkewAdjustmentError(`Failed to parse server date: ${serverDate}`);
    }
    const clientDate = _BrowserDRM2.getUnixTimestamp();
    _BrowserDRM2.adjClockSkewSeconds(serverDateParsed - clientDate);
  }
  static async generateSecMsGec() {
    let ticks = _BrowserDRM2.getUnixTimestamp();
    ticks += WIN_EPOCH3;
    ticks -= ticks % 300;
    ticks *= S_TO_NS3 / 100;
    const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
    const encoder = new TextEncoder;
    const data = encoder.encode(strToHash);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  static generateMuid() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  static headersWithMuid(headers) {
    return {
      ...headers,
      Cookie: `muid=${_BrowserDRM2.generateMuid()};`
    };
  }
}, BrowserDRM, EdgeTTSBrowser = class {
  constructor(text, voice = "Microsoft Server Speech Text to Speech Voice (en-US, EmmaMultilingualNeural)", options = {}) {
    this.ws = null;
    this.text = text;
    this.voice = voice;
    this.rate = options.rate || "+0%";
    this.volume = options.volume || "+0%";
    this.pitch = options.pitch || "+0Hz";
  }
  async synthesize() {
    await this.connect();
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected.");
    }
    this.ws.send(this.createSpeechConfig());
    this.ws.send(this.createSSML());
    return new Promise((resolve2, reject) => {
      const audioChunks = [];
      let wordBoundaries = [];
      if (this.ws) {
        this.ws.onmessage = (event) => {
          if (typeof event.data === "string") {
            const { headers, body } = this.parseMessage(event.data);
            if (headers.Path === "audio.metadata") {
              try {
                const metadata = JSON.parse(body);
                if (metadata.Metadata && Array.isArray(metadata.Metadata)) {
                  const boundaries = metadata.Metadata.filter((item) => item.Type === "WordBoundary" && item.Data).map((item) => ({
                    offset: item.Data.Offset,
                    duration: item.Data.Duration,
                    text: item.Data.text.Text
                  }));
                  wordBoundaries = wordBoundaries.concat(boundaries);
                }
              } catch (e) {}
            } else if (headers.Path === "turn.end") {
              if (this.ws)
                this.ws.close();
            }
          } else if (event.data instanceof Blob) {
            event.data.arrayBuffer().then((arrayBuffer) => {
              const dataView = new DataView(arrayBuffer);
              const headerLength = dataView.getUint16(0);
              if (arrayBuffer.byteLength > headerLength + 2) {
                const audioData = new Uint8Array(arrayBuffer, headerLength + 2);
                audioChunks.push(audioData);
              }
            });
          }
        };
        this.ws.onclose = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
          resolve2({ audio: audioBlob, subtitle: wordBoundaries });
        };
        this.ws.onerror = (error) => {
          reject(error);
        };
      }
    });
  }
  async connect() {
    const connectionId = this.generateConnectionId();
    const secMsGec = await BrowserDRM.generateSecMsGec();
    const url2 = `${WSS_URL}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&ConnectionId=${connectionId}`;
    this.ws = new WebSocket(url2);
    return new Promise((resolve2, reject) => {
      if (!this.ws) {
        return reject(new Error("WebSocket not initialized"));
      }
      this.ws.onopen = () => {
        resolve2();
      };
      this.ws.onerror = (error) => {
        reject(error);
      };
    });
  }
  parseMessage(message) {
    const parts = message.split(`\r
\r
`);
    const headerLines = parts[0].split(`\r
`);
    const headers = {};
    headerLines.forEach((line) => {
      const [key, value] = line.split(":", 2);
      if (key && value) {
        headers[key.trim()] = value.trim();
      }
    });
    return { headers, body: parts[1] || "" };
  }
  createSpeechConfig() {
    const config = {
      context: {
        synthesis: {
          audio: {
            metadataoptions: {
              sentenceBoundaryEnabled: false,
              wordBoundaryEnabled: true
            },
            outputFormat: "audio-24khz-48kbitrate-mono-mp3"
          }
        }
      }
    };
    return `X-Timestamp:${this.getTimestamp()}\r
Content-Type:application/json; charset=utf-8\r
Path:speech.config\r
\r
${JSON.stringify(config)}`;
  }
  createSSML() {
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
      <voice name='${this.voice}'>
        <prosody pitch='${this.pitch}' rate='${this.rate}' volume='${this.volume}'>
          ${this.escapeXml(this.text)}
        </prosody>
      </voice>
    </speak>`;
    return `X-RequestId:${this.generateConnectionId()}\r
Content-Type:application/ssml+xml\r
X-Timestamp:${this.getTimestamp()}Z\r
Path:ssml\r
\r
${ssml}`;
  }
  generateConnectionId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c2) => {
      const r = Math.random() * 16 | 0;
      const v = c2 === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  getTimestamp() {
    return (/* @__PURE__ */ new Date()).toISOString().replace(/[:-]|\.\d{3}/g, "");
  }
  escapeXml(text) {
    return text.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return char;
      }
    });
  }
};
var init_dist = __esm(() => {
  init_esm();
  init_axios2();
  import_xml_escape = __toESM(require_xml_escape(), 1);
  import_isomorphic_ws = __toESM(require_ws(), 1);
  EdgeTTSException = class extends Error {
    constructor(message) {
      super(message);
      this.name = "EdgeTTSException";
    }
  };
  SkewAdjustmentError = class extends EdgeTTSException {
    constructor(message) {
      super(message);
      this.name = "SkewAdjustmentError";
    }
  };
  UnknownResponse = class extends EdgeTTSException {
    constructor(message) {
      super(message);
      this.name = "UnknownResponse";
    }
  };
  UnexpectedResponse = class extends EdgeTTSException {
    constructor(message) {
      super(message);
      this.name = "UnexpectedResponse";
    }
  };
  NoAudioReceived = class extends EdgeTTSException {
    constructor(message) {
      super(message);
      this.name = "NoAudioReceived";
    }
  };
  WebSocketError = class extends EdgeTTSException {
    constructor(message) {
      super(message);
      this.name = "WebSocketError";
    }
  };
  ValueError = class extends EdgeTTSException {
    constructor(message) {
      super(message);
      this.name = "ValueError";
    }
  };
  WSS_URL = `wss://${BASE_URL}/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;
  VOICE_LIST_URL = `https://${BASE_URL}/voices/list?trustedclienttoken=${TRUSTED_CLIENT_TOKEN}`;
  CHROMIUM_MAJOR_VERSION = CHROMIUM_FULL_VERSION.split(".")[0];
  SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;
  BASE_HEADERS = {
    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`,
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9"
  };
  WSS_HEADERS = {
    ...BASE_HEADERS,
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    "Sec-WebSocket-Version": "13"
  };
  VOICE_HEADERS = {
    ...BASE_HEADERS,
    Authority: "speech.platform.bing.com",
    "Sec-CH-UA": `" Not;A Brand";v="99", "Microsoft Edge";v="${CHROMIUM_MAJOR_VERSION}", "Chromium";v="${CHROMIUM_MAJOR_VERSION}"`,
    "Sec-CH-UA-Mobile": "?0",
    Accept: "*/*",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty"
  };
  _DRM.clockSkewSeconds = 0;
  DRM = _DRM;
  _IsomorphicDRM.clockSkewSeconds = 0;
  IsomorphicDRM = _IsomorphicDRM;
  IsomorphicBuffer = {
    from: (input, encoding) => {
      if (typeof input === "string") {
        return new TextEncoder().encode(input);
      } else if (input instanceof ArrayBuffer) {
        return new Uint8Array(input);
      } else if (input instanceof Uint8Array) {
        return input;
      }
      throw new Error("Unsupported input type for IsomorphicBuffer.from");
    },
    concat: (arrays) => {
      const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    },
    isBuffer: (obj) => {
      return obj instanceof Uint8Array;
    },
    toString: (buffer, encoding) => {
      return new TextDecoder(encoding || "utf-8").decode(buffer);
    }
  };
  FetchError = class extends Error {
    constructor(message, response) {
      super(message);
      this.name = "FetchError";
      this.response = response;
    }
  };
  _BrowserDRM.clockSkewSeconds = 0;
  BrowserDRM = _BrowserDRM;
});

// src/utils/platform.ts
import { homedir } from "node:os";
function getHomeDir() {
  if (process.platform === "win32") {
    return process.env.USERPROFILE || homedir();
  }
  return process.env.HOME || homedir();
}
var isWindows3, isMac, isLinux;
var init_platform2 = __esm(() => {
  isWindows3 = process.platform === "win32";
  isMac = process.platform === "darwin";
  isLinux = process.platform === "linux";
});

// src/tts/index.ts
var exports_tts = {};
__export(exports_tts, {
  speak: () => speak,
  saveTTSConfig: () => saveTTSConfig,
  playAudioFile: () => playAudioFile,
  loadTTSConfig: () => loadTTSConfig,
  listVoices: () => listVoices3,
  generateAudio: () => generateAudio,
  DEFAULT_VOICE: () => DEFAULT_VOICE2,
  DEFAULT_SPEED: () => DEFAULT_SPEED,
  DEFAULT_PITCH: () => DEFAULT_PITCH,
  DEFAULT_FORMAT: () => DEFAULT_FORMAT
});
import { spawn as spawn2 } from "node:child_process";
import { writeFileSync as writeFileSync5, unlinkSync as unlinkSync2 } from "node:fs";
import { tmpdir as tmpdir2 } from "node:os";
import { join as join6 } from "node:path";
async function listVoices3() {
  const { listVoicesUniversal } = await Promise.resolve().then(() => (init_dist(), exports_dist));
  const voices = await listVoicesUniversal();
  return voices.filter((v) => v.Locale.startsWith("en-"));
}
async function generateAudio(text, options = {}) {
  const voice = options.voice || DEFAULT_VOICE2;
  const speed = options.speed || DEFAULT_SPEED;
  const pitch = options.pitch || DEFAULT_PITCH;
  const outputFormat = options.outputFormat || DEFAULT_FORMAT;
  const communicate = new Communicate(text, { voice, speed, pitch }, { outputFormat });
  const chunks = [];
  for await (const chunk of communicate.stream()) {
    if (chunk.type === "audio")
      chunks.push(chunk.data);
  }
  return Buffer.concat(chunks);
}
async function speak(text, options = {}) {
  const audioBuffer = await generateAudio(text, options);
  const tempFile = join6(tmpdir2(), `beast-tts-${Date.now()}.mp3`);
  try {
    writeFileSync5(tempFile, audioBuffer);
    await playAudioFile(tempFile);
  } finally {
    try {
      unlinkSync2(tempFile);
    } catch {}
  }
}
async function playAudioFile(filePath) {
  return new Promise((resolve3) => {
    let player;
    if (isWindows3) {
      const absPath = resolve3(filePath).replace(/\\/g, "\\\\").replace(/'/g, "''");
      player = spawn2("powershell", [
        "-NoProfile",
        "-Command",
        `try { (New-Object System.Media.SoundPlayer '${absPath}').PlaySync() } catch { }`
      ], { stdio: "ignore", windowsHide: true });
    } else {
      player = spawn2("ffplay", [
        "-nodisp",
        "-autoexit",
        "-loglevel",
        "quiet",
        filePath
      ], { stdio: "ignore" });
    }
    player.on("close", () => resolve3());
    player.on("error", () => resolve3());
  });
}
function loadTTSConfig() {
  try {
    const { existsSync: existsSync6, readFileSync: readFileSync4 } = __require("node:fs");
    const path4 = join6(getHomeDir(), ".beast-cli", "tts.json");
    if (existsSync6(path4))
      return JSON.parse(readFileSync4(path4, "utf-8"));
  } catch {}
  return { enabled: false, defaultVoice: DEFAULT_VOICE2, autoPlay: true };
}
function saveTTSConfig(config) {
  try {
    const { existsSync: existsSync6, mkdirSync: mkdirSync3, writeFileSync: writeFileSync6 } = __require("node:fs");
    const dir = join6(getHomeDir(), ".beast-cli");
    if (!existsSync6(dir))
      mkdirSync3(dir, { recursive: true });
    writeFileSync6(join6(dir, "tts.json"), JSON.stringify(config, null, 2));
  } catch {}
}
var DEFAULT_VOICE2 = "en-US-AriaNeural", DEFAULT_SPEED = "+0%", DEFAULT_PITCH = "+0Hz", DEFAULT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
var init_tts = __esm(() => {
  init_dist();
  init_platform2();
});

// src/agents/index.ts
var exports_agents = {};
__export(exports_agents, {
  updateMemory: () => updateMemory,
  updateAgent: () => updateAgent,
  setActiveAgent: () => setActiveAgent,
  saveMemory: () => saveMemory,
  registerDefaultAgents: () => registerDefaultAgents,
  registerAgentType: () => registerAgentType,
  parseAgentContext: () => parseAgentContext,
  loadMemory: () => loadMemory,
  listAgents: () => listAgents,
  getAgent: () => getAgent,
  getActiveAgent: () => getActiveAgent,
  deleteAgent: () => deleteAgent,
  createWorkerAgent: () => createWorkerAgent,
  createAgent: () => createAgent,
  buildAgentSystemMessage: () => buildAgentSystemMessage,
  WorkerAgent: () => WorkerAgent,
  Coordinator: () => Coordinator,
  AgentSession: () => AgentSession
});
import { existsSync as existsSync8, readFileSync as readFileSync6, writeFileSync as writeFileSync7, mkdirSync as mkdirSync3 } from "node:fs";
import { resolve as resolve4, join as join7 } from "node:path";
function getAgentsDir() {
  return join7(getHomeDir(), ".beast-cli", "agents");
}
function getAgentsPath() {
  return resolve4(getAgentsDir(), "agents.json");
}
function getMemoryPath() {
  return resolve4(getAgentsDir(), "memory.json");
}
function ensureDir() {
  const dir = getAgentsDir();
  if (!existsSync8(dir))
    mkdirSync3(dir, { recursive: true });
}
function loadStore() {
  ensureDir();
  try {
    if (existsSync8(getAgentsPath())) {
      return JSON.parse(readFileSync6(getAgentsPath(), "utf-8"));
    }
  } catch {}
  return { agents: [] };
}
function saveStore(store) {
  ensureDir();
  writeFileSync7(getAgentsPath(), JSON.stringify(store, null, 2), "utf-8");
}
function listAgents() {
  return loadStore().agents;
}
function getAgent(name) {
  const store = loadStore();
  return store.agents.find((a) => a.name.toLowerCase() === name.toLowerCase() || a.name.toLowerCase().replace(/\s+/g, "-") === name.toLowerCase());
}
function createAgent(data) {
  const store = loadStore();
  const agent = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  store.agents.push(agent);
  saveStore(store);
  return agent;
}
function updateAgent(id, updates) {
  const store = loadStore();
  const idx = store.agents.findIndex((a) => a.id === id);
  if (idx === -1)
    return null;
  store.agents[idx] = { ...store.agents[idx], ...updates, updatedAt: Date.now() };
  saveStore(store);
  return store.agents[idx];
}
function deleteAgent(id) {
  const store = loadStore();
  const before = store.agents.length;
  store.agents = store.agents.filter((a) => a.id !== id);
  if (store.agents.length < before) {
    if (store.activeAgent) {
      const stillExists = store.agents.some((a) => a.name === store.activeAgent);
      if (!stillExists)
        store.activeAgent = undefined;
    }
    saveStore(store);
    return true;
  }
  return false;
}
function getActiveAgent() {
  const store = loadStore();
  if (!store.activeAgent)
    return;
  return getAgent(store.activeAgent);
}
function setActiveAgent(name) {
  const store = loadStore();
  store.activeAgent = name;
  saveStore(store);
}
function loadMemory() {
  try {
    if (existsSync8(getMemoryPath())) {
      return JSON.parse(readFileSync6(getMemoryPath(), "utf-8"));
    }
  } catch {}
  return { facts: [], preferences: {}, context: "", updatedAt: Date.now() };
}
function saveMemory(memory) {
  ensureDir();
  writeFileSync7(getMemoryPath(), JSON.stringify(memory, null, 2), "utf-8");
}
function updateMemory(updates) {
  const memory = loadMemory();
  const updated = { ...memory, ...updates, updatedAt: Date.now() };
  saveMemory(updated);
  return updated;
}
function parseAgentContext(prompt) {
  const store = loadStore();
  const instructions = [];
  const usedAgents = [];
  let activeAgent;
  if (store.activeAgent) {
    activeAgent = getAgent(store.activeAgent);
    if (activeAgent) {
      instructions.push(`[AGENT: ${activeAgent.name}]
${activeAgent.instructions}`);
      usedAgents.push(activeAgent);
    }
  }
  const matches = [...prompt.matchAll(AGENT_REF_REGEX)];
  for (const match of matches) {
    const name = match[1];
    const agent = getAgent(name);
    if (agent && !usedAgents.some((a) => a.id === agent.id)) {
      instructions.push(`[AGENT: ${agent.name}]
${agent.instructions}`);
      usedAgents.push(agent);
    }
  }
  const cleanedPrompt = prompt.replace(AGENT_REF_REGEX, "").replace(/\s+/g, " ").trim();
  return { cleanedPrompt, agentInstructions: instructions, usedAgents, activeAgent };
}
function buildAgentSystemMessage(context) {
  const parts = [];
  if (context.agentInstructions.length > 0) {
    parts.push(`You have access to the following custom agents:
` + context.agentInstructions.join(`

`));
  }
  const memory = loadMemory();
  if (memory.context || memory.facts.length > 0) {
    const memParts = [];
    if (memory.context)
      memParts.push(`Project Context: ${memory.context}`);
    if (memory.facts.length > 0)
      memParts.push(`Known Facts: ${memory.facts.map((f) => `• ${f}`).join(`
`)}`);
    if (Object.keys(memory.preferences).length > 0) {
      memParts.push(`Preferences: ${Object.entries(memory.preferences).map(([k, v]) => `${k}=${v}`).join(", ")}`);
    }
    parts.push(`[MEMORY]
` + memParts.join(`
`));
  }
  return parts.join(`

`);
}

class Coordinator {
  agents = new Map;
  messageQueue = [];
  onMessage;
  constructor(onMessage) {
    this.onMessage = onMessage;
  }
  registerAgent(config) {
    const instance = {
      config,
      status: "idle"
    };
    this.agents.set(config.id, instance);
    console.log(`[Coordinator] Registered agent: ${config.name} (${config.role})`);
    return config.id;
  }
  spawnWorker(config) {
    const id = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return this.registerAgent({
      ...config,
      id,
      role: "worker"
    });
  }
  sendMessage(to, type, payload) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: "coordinator",
      to,
      type,
      payload,
      timestamp: Date.now()
    };
    this.messageQueue.push(msg);
    if (this.onMessage) {
      this.onMessage(msg);
    }
    this.handleMessage(msg);
  }
  handleMessage(msg) {
    const agent = this.agents.get(msg.to);
    if (!agent)
      return;
    switch (msg.type) {
      case "task":
        agent.status = "running";
        agent.startedAt = new Date;
        console.log(`[Coordinator] Task assigned to ${agent.config.name}`);
        break;
      case "stop":
        agent.status = "completed";
        agent.completedAt = new Date;
        console.log(`[Coordinator] ${agent.config.name} stopped`);
        break;
      case "result":
        agent.result = msg.payload;
        agent.status = "completed";
        agent.completedAt = new Date;
        console.log(`[Coordinator] Result received from ${agent.config.name}`);
        break;
      case "error":
        agent.status = "failed";
        agent.result = msg.payload;
        console.log(`[Coordinator] Error from ${agent.config.name}: ${msg.payload}`);
        break;
    }
  }
  getAgent(id) {
    return this.agents.get(id);
  }
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  getAgentsByRole(role) {
    return Array.from(this.agents.values()).filter((a) => a.config.role === role);
  }
  stopAgent(id) {
    this.sendMessage(id, "stop", { reason: "coordinator-stop" });
  }
  stopAllWorkers() {
    const workers = this.getAgentsByRole("worker");
    for (const worker of workers) {
      this.stopAgent(worker.config.id);
    }
  }
  broadcast(type, payload) {
    const workers = this.getAgentsByRole("worker");
    for (const worker of workers) {
      this.sendMessage(worker.config.id, type, payload);
    }
  }
  synthesizeResults() {
    const workers = this.getAgentsByRole("worker");
    const succeeded = [];
    const failed = [];
    let totalDuration = 0;
    for (const worker of workers) {
      if (worker.status === "completed" && worker.result) {
        succeeded.push(worker.result);
      } else if (worker.status === "failed") {
        failed.push(worker.result);
      }
      if (worker.startedAt && worker.completedAt) {
        totalDuration += worker.completedAt.getTime() - worker.startedAt.getTime();
      }
    }
    return { succeeded, failed, totalDuration };
  }
}

class WorkerAgent {
  id;
  name;
  tools;
  disallowedTools;
  messageHandler;
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.tools = config.tools ?? ["*"];
    this.disallowedTools = config.disallowedTools ?? [];
    this.messageHandler = config.onMessage;
  }
  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  isToolAllowed(toolName) {
    if (this.tools.includes("*"))
      return true;
    if (this.disallowedTools.includes(toolName))
      return false;
    return this.tools.includes(toolName);
  }
  getAllowedTools() {
    if (this.tools.includes("*")) {
      return ["*"];
    }
    return this.tools.filter((t) => !this.disallowedTools.includes(t));
  }
  async handleTask(task) {
    console.log(`[Worker:${this.name}] Processing task`);
    return {
      agentId: this.id,
      agentName: this.name,
      task,
      result: "Task completed",
      completedAt: new Date().toISOString()
    };
  }
  sendResult(coordinatorId, result) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: this.id,
      to: coordinatorId,
      type: "result",
      payload: result,
      timestamp: Date.now()
    };
    if (this.messageHandler) {
      this.messageHandler(msg);
    }
  }
}
function registerAgentType(type, factory2) {
  agentRegistry.set(type, factory2);
}
function createWorkerAgent(type, config) {
  const factory2 = agentRegistry.get(type);
  if (!factory2)
    return null;
  return factory2(config);
}

class AgentSession {
  coordinator;
  workers = new Map;
  sessionId;
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.coordinator = new Coordinator((msg) => this.onCoordinatorMessage(msg));
  }
  async initialize(config) {
    this.coordinator.registerAgent({
      id: `coord-${this.sessionId}`,
      name: "main-coordinator",
      role: "coordinator",
      tools: config.coordinatorTools
    });
    for (let i = 0;i < config.workerCount; i++) {
      const workerId = this.coordinator.spawnWorker({
        name: `worker-${i + 1}`,
        tools: config.workerTools,
        prompt: `You are worker ${i + 1} in a multi-agent session.`
      });
      const worker = new WorkerAgent({
        id: workerId,
        name: `worker-${i + 1}`,
        tools: config.workerTools,
        onMessage: (msg) => this.coordinator.sendMessage(msg.to, msg.type, msg.payload)
      });
      this.workers.set(workerId, worker);
    }
    console.log(`[AgentSession] Initialized with ${config.workerCount} workers`);
  }
  onCoordinatorMessage(msg) {
    if (msg.to === `coord-${this.sessionId}`) {
      console.log(`[Session] Message received: ${msg.type} from ${msg.from}`);
    }
  }
  assignTask(workerId, task) {
    this.coordinator.sendMessage(workerId, "task", task);
  }
  assignToAll(task) {
    this.coordinator.broadcast("task", task);
  }
  async waitForCompletion(timeout = 60000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const workers = this.coordinator.getAgentsByRole("worker");
      const allDone = workers.every((w) => w.status === "completed" || w.status === "failed");
      if (allDone)
        return true;
      await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
  }
  getResults() {
    return {
      coordinator: this.coordinator,
      results: this.coordinator.synthesizeResults(),
      sessionId: this.sessionId
    };
  }
  destroy() {
    this.coordinator.stopAllWorkers();
    this.workers.clear();
    console.log(`[AgentSession] Session ${this.sessionId} destroyed`);
  }
}
function registerDefaultAgents() {
  registerAgentType("research", (config) => new WorkerAgent({
    id: config.id,
    name: config.name,
    tools: ["Read", "Grep", "Glob", "WebFetch"]
  }));
  registerAgentType("builder", (config) => new WorkerAgent({
    id: config.id,
    name: config.name,
    tools: ["Read", "Edit", "Write", "Bash", "Glob"]
  }));
  registerAgentType("tester", (config) => new WorkerAgent({
    id: config.id,
    name: config.name,
    tools: ["Read", "Bash", "Glob"]
  }));
}
var AGENT_REF_REGEX, agentRegistry;
var init_agents = __esm(() => {
  init_platform2();
  AGENT_REF_REGEX = /@([\w-]+)/g;
  agentRegistry = new Map;
});

// src/ui/banner.ts
function termWidth2() {
  try {
    return process.stdout.columns || 80;
  } catch {
    return 80;
  }
}
function renderCleanBanner2() {
  if (!isColorEnabled2())
    return "BEAST CLI - AI Coding Agent";
  const width = termWidth2();
  let logo;
  if (width >= 60) {
    logo = FULL_LOGO2;
  } else if (width >= 40) {
    logo = COMPACT_LOGO2;
  } else {
    logo = TINY_LOGO2;
  }
  if (width < 50) {
    return logo;
  }
  const tagline = REVEAL_TAGLINE2 + `
`;
  const cardSep = "  ";
  const cardLines = FEATURE_CARDS2.map((card) => {
    return s2(card.label, card.color);
  }).join(s2(cardSep, fg2.overlay));
  return logo + tagline + `
` + cardLines + `
`;
}
var googlePurple3 = "\x1B[38;2;142;54;255m", googleBlue3 = "\x1B[38;2;70;130;255m", FULL_LOGO2, COMPACT_LOGO2, TINY_LOGO2, googlePurple22 = "\x1B[38;2;142;54;255m", googleBlue22 = "\x1B[38;2;70;130;255m", TEXT_LOGO2, FEATURE_CARDS2, REVEAL_TAGLINE2;
var init_banner = __esm(() => {
  init_colors();
  FULL_LOGO2 = `
 ${googlePurple3}+==================================================================+${reset2}` + `
 ${googlePurple3}|${reset2}  \uD83D\uDC09  ${s2("BEAST", googlePurple3, bold2)}   ${s2("CLI", googleBlue3, bold2)}    ${dim2}AI Coding Agent · 45+ Providers · 51+ Tools     ${googlePurple3}|${reset2}` + `
 ${googlePurple3}+==================================================================+${reset2}
`;
  COMPACT_LOGO2 = `
 ${googlePurple3}+----------------------------------------------+${reset2}` + `
 ${googlePurple3}|${reset2}  \uD83D\uDC09  ${s2("BEAST", googlePurple3, bold2)}  ${s2("CLI", googleBlue3, bold2)}  ${dim2}AI Coding Agent                  ${googlePurple3}|${reset2}` + `
 ${googlePurple3}+----------------------------------------------+${reset2}
`;
  TINY_LOGO2 = ` \uD83D\uDC09 ${s2("BEAST CLI", googlePurple3, bold2)} ${dim2}~ 
`;
  TEXT_LOGO2 = ` ${s2("BEAST", googlePurple22, bold2)} ${s2("CLI", googleBlue22, bold2)} `;
  FEATURE_CARDS2 = [
    { label: "Blazing Fast", color: fg2.warning },
    { label: "Private & Local", color: fg2.success },
    { label: "45+ Providers", color: fg2.sapphire },
    { label: "51+ Tools", color: fg2.tool }
  ];
  REVEAL_TAGLINE2 = `${s2("·", fg2.overlay)} ${s2("45+ Providers", fg2.muted)} ` + `${s2("·", fg2.overlay)} ${s2("51+ Tools", fg2.muted)} ` + `${s2("·", fg2.overlay)} ${s2("Local AI Ready", fg2.muted)}`;
});

// src/ui/router.ts
var exports_router = {};
__export(exports_router, {
  launchUI: () => launchUI,
  launchTerminal: () => launchTerminal,
  launchRepl: () => launchRepl,
  launchInk: () => launchInk
});
import { resolve as resolve6, dirname as dirname3 } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn as spawn4 } from "node:child_process";
function isInteractive() {
  return process.stdin.isTTY === true;
}
function getInkSourcePath() {
  const selfDir = dirname3(fileURLToPath(import.meta.url));
  return resolve6(selfDir, "..", "src", "ui", "ink", "index.tsx");
}
function getTerminalSourcePath() {
  const selfDir = dirname3(fileURLToPath(import.meta.url));
  return resolve6(selfDir, "..", "src", "ui", "terminal", "index.ts");
}
async function launchRepl() {
  try {
    const { dirname: dirname4 } = await import("node:path");
    const { fileURLToPath: fileURLToPath2 } = await import("node:url");
    const { spawn: spawn5 } = await import("node:child_process");
    const selfDir = dirname4(fileURLToPath2(import.meta.url));
    const srcEntry = selfDir + "/../index.ts";
    const bunPath = process.env.BUN_INSTALL ? process.env.BUN_INSTALL + "/bin/bun" : "bun";
    const child = spawn5(bunPath, ["--bun", "run", srcEntry, "--defaults"], {
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "1" }
    });
    child.on("exit", (code) => process.exit(code ?? 0));
  } catch (err) {
    console.error(s2(`
Failed to launch REPL: ` + String(err), fg2.error));
    process.exit(1);
  }
}
async function launchInk() {
  try {
    const inkSource = getInkSourcePath();
    const bunPath = process.env.BUN_INSTALL ? process.env.BUN_INSTALL + "/bin/bun" : "bun";
    const child = spawn4(bunPath, ["--bun", "run", inkSource], {
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "1" }
    });
    child.on("exit", (code) => process.exit(code ?? 0));
  } catch (err) {
    console.error(s2(`
Failed to launch Ink TUI: ` + String(err), fg2.error));
    console.error(s2(`Falling back to REPL mode...
`, fg2.warning));
    await launchRepl();
  }
}
async function launchTerminal() {
  try {
    const termSource = getTerminalSourcePath();
    const bunPath = process.env.BUN_INSTALL ? process.env.BUN_INSTALL + "/bin/bun" : "bun";
    const child = spawn4(bunPath, ["--bun", "run", termSource], {
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "1" }
    });
    child.on("exit", (code) => process.exit(code ?? 0));
  } catch (err) {
    console.error(s2(`
Failed to launch Terminal TUI: ` + String(err), fg2.error));
    console.error(s2(`Falling back to REPL mode...
`, fg2.warning));
    await launchRepl();
  }
}
async function promptMode() {
  const readline2 = await import("readline");
  const rl = readline2.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve7) => {
    console.log(renderCleanBanner2());
    console.log();
    console.log(`  ${s2("[1]", fg2.accent)} ${s2("Minimal REPL", fg2.primary)}   ${dim2}— fast, ASCII-safe, tab complete`);
    console.log(`  ${s2("[2]", fg2.accent)} ${s2("Rich TUI", fg2.primary)}       ${dim2}— spinners, colors, mouse support`);
    if (isWindows4) {
      console.log(`  ${s2("[3]", fg2.accent)} ${s2("Terminal TUI", fg2.primary)} ${dim2}— cross-platform (Windows optimized)`);
    }
    console.log();
    console.log(`  ${s2("Tip:", fg2.warning)} ${s2("Use", fg2.muted)} ${s2("--tui", fg2.accent)} ${s2("flag to skip this prompt", fg2.muted)}`);
    console.log();
    const prompt = isWindows4 ? "  Choose [1]" : "  Choose [1]";
    rl.question(s2(prompt, fg2.muted) + " ", (answer) => {
      rl.close();
      const choice = answer.trim();
      if (isWindows4 && choice === "3") {
        resolve7("terminal");
      } else if (choice === "2") {
        resolve7("ink");
      } else {
        resolve7("repl");
      }
    });
  });
}
async function launchUI(mode = "auto") {
  if (process.argv.includes("--tui")) {
    if (isWindows4) {
      await launchTerminal();
    } else {
      await launchInk();
    }
    return;
  }
  if (!isInteractive()) {
    await launchRepl();
    return;
  }
  if (mode === "auto") {
    if (isWindows4) {
      const readline2 = await import("readline");
      const rl = readline2.createInterface({ input: process.stdin, output: process.stdout });
      console.log(renderCleanBanner2());
      console.log();
      console.log(s2("  ⚠️  Windows detected - using Terminal TUI for best experience", fg2.warning));
      console.log();
      console.log(`  ${s2("[1]", fg2.accent)} ${s2("Terminal TUI", fg2.primary)} ${dim2}— Windows optimized, colors & mouse`);
      console.log(`  ${s2("[2]", fg2.accent)} ${s2("Minimal REPL", fg2.primary)} ${dim2}— fast, ASCII-safe`);
      console.log();
      return new Promise((resolve7) => {
        rl.question(s2("  Choose [1]", fg2.muted) + " ", (answer) => {
          rl.close();
          if (answer.trim() === "2") {
            launchRepl().then(resolve7);
          } else {
            launchTerminal().then(resolve7);
          }
        });
      });
    }
    const chosen = await promptMode();
    if (chosen === "ink") {
      await launchInk();
    } else if (chosen === "terminal") {
      await launchTerminal();
    } else {
      await launchRepl();
    }
    return;
  }
  if (mode === "terminal") {
    await launchTerminal();
  } else if (mode === "ink") {
    await launchInk();
  } else {
    await launchRepl();
  }
}
var isWindows4;
var init_router = __esm(() => {
  init_colors();
  init_banner();
  isWindows4 = process.platform === "win32";
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
var icon = {
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

// src/ui/layout.ts
init_colors();
function renderHeader(config) {
  if (!isColorEnabled2()) {
    return `BEAST CLI v${config.version} | ${config.provider} | ${config.model}`;
  }
  const { version, provider, model, toolsCount } = config;
  const b = getBoxChars().round;
  const h = b?.h || "-";
  const tl = b?.tl || "+";
  const tr = b?.tr || "+";
  const gpPurple = "\x1B[38;2;142;54;255m";
  const gpBlue = "\x1B[38;2;70;130;255m";
  const line = [
    s2(`${tl} `, gpPurple),
    s2("\uD83D\uDC09", gpPurple),
    s2(" Beast ", gpPurple, bold2),
    s2("CLI", gpBlue, bold2),
    s2(` v${version}`, fg2.muted),
    s2(` ${h} `, gpPurple),
    s2(icon2.check + " ", fg2.success),
    s2(provider, fg2.success),
    s2(` ${h} `, gpPurple),
    s2(icon2.code + " ", gpBlue),
    s2(model, gpBlue),
    s2(` ${h} `, gpPurple),
    s2(icon2.tool + " ", fg2.peach),
    s2(`${toolsCount} tools`, fg2.peach),
    s2(` ${h}${tr}`, gpPurple)
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
    barColor = fg2.sapphire;
  if (pct > 0.9)
    barColor = fg2.warning;
  const bar = s2("█".repeat(filled), barColor) + s2("░".repeat(empty), fg2.overlay);
  const pctStr = s2(`${Math.round(pct * 100)}%`, barColor);
  const usedStr = s2(formatTokens(used), fg2.muted);
  const maxStr = s2(formatTokens(max), fg2.muted);
  return [
    s2(`  ${icon2.context} `, fg2.muted),
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
init_colors();
function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}
function panel(content, options = {}) {
  const { title, titleColor = fg2.accent, width = 70, useBox = true, style = "single" } = options;
  const rawLines = content.split(`
`);
  const maxLen = rawLines.reduce((m, l) => Math.max(m, stripAnsi(l).length), 0);
  const w = Math.max(width, maxLen + 4);
  if (useBox) {
    const boxSet = getBoxChars();
    const b = boxSet[style] || boxSet.single || boxSet;
    const h = b?.h || "-";
    const v = b?.v || "|";
    const tl = b?.tl || "+";
    const tr = b?.tr || "+";
    const bl = b?.bl || "+";
    const br = b?.br || "+";
    let result2 = `${tl}${h.repeat(w)}${tr}
`;
    if (title) {
      const titleLen = stripAnsi(title).length;
      const pad1 = Math.floor((w - titleLen) / 2);
      const pad2 = w - titleLen - pad1;
      result2 += `${v}${" ".repeat(pad1)}${title}${" ".repeat(pad2)}${v}
`;
      result2 += `${v}${h.repeat(w)}${v}
`;
    }
    for (const ln of rawLines) {
      const len = stripAnsi(ln).length;
      const pad = w - len;
      result2 += `${v} ${ln}${" ".repeat(Math.max(0, pad - 1))} ${v}
`;
    }
    result2 += `${bl}${h.repeat(w)}${br}`;
    return s2(result2, titleColor);
  }
  let result = `+${"-".repeat(w)}+
`;
  if (title) {
    const titleLen = stripAnsi(title).length;
    const pad1 = Math.floor((w - titleLen) / 2);
    const pad2 = w - titleLen - pad1;
    result += `|${" ".repeat(pad1)}${title}${" ".repeat(pad2)}|
`;
    result += `|${"-".repeat(w)}|
`;
  }
  for (const ln of rawLines) {
    const len = stripAnsi(ln).length;
    const pad = w - len - 2;
    result += `| ${ln}${" ".repeat(Math.max(0, pad))} |
`;
  }
  result += `+${"-".repeat(w)}+`;
  return s2(result, titleColor);
}
function inlineList(items, options = {}) {
  const { iconColor = fg2.accent, labelColor = fg2.muted, valueColor = fg2.primary, separator = "  " } = options;
  return items.map((item) => {
    const icon3 = item.icon ? s2(item.icon + " ", iconColor) : "";
    return icon3 + s2(item.label, labelColor) + ": " + s2(item.value, valueColor);
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
    return `  ${s2(cmd.padEnd(maxCmd + 2), fg2.accent)}${s2(desc, fg2.primary)}${shortcutStr}`;
  }).join(`
`);
}

// src/ui/tool-renderer.ts
init_colors();

// src/ui/format.ts
init_colors();
function stripAnsi2(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

// src/ui/tool-renderer.ts
var MAX_RESULT_LINES = 8;
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
  const text = visible.join(`
`);
  if (remaining > 0) {
    return text + `
` + s2(`  ... ${remaining} more lines`, fg2.muted) + "  " + s2("[e] expand", fg2.accent) + "  " + s2("[c] copy", fg2.sapphire) + `
`;
  }
  return text;
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
  return s2(`${icon2.error} ${toolName}: ${error}`, fg2.error);
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
init_colors();
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
 ${googlePurple}+==================================================================+${reset2}` + `
 ${googlePurple}|${reset2}  \uD83D\uDC09  ${s2("BEAST", googlePurple, bold2)}   ${s2("CLI", googleBlue, bold2)}    ${dim2}AI Coding Agent · 45+ Providers · 51+ Tools     ${googlePurple}|${reset2}` + `
 ${googlePurple}+==================================================================+${reset2}
`;
var COMPACT_LOGO = `
 ${googlePurple}+----------------------------------------------+${reset2}` + `
 ${googlePurple}|${reset2}  \uD83D\uDC09  ${s2("BEAST", googlePurple, bold2)}  ${s2("CLI", googleBlue, bold2)}  ${dim2}AI Coding Agent                  ${googlePurple}|${reset2}` + `
 ${googlePurple}+----------------------------------------------+${reset2}
`;
var TINY_LOGO = ` \uD83D\uDC09 ${s2("BEAST CLI", googlePurple, bold2)} ${dim2}~ 
`;
var googlePurple2 = "\x1B[38;2;142;54;255m";
var googleBlue2 = "\x1B[38;2;70;130;255m";
var TEXT_LOGO = ` ${s2("BEAST", googlePurple2, bold2)} ${s2("CLI", googleBlue2, bold2)} `;
var FEATURE_CARDS = [
  { label: "Blazing Fast", color: fg2.warning },
  { label: "Private & Local", color: fg2.success },
  { label: "45+ Providers", color: fg2.sapphire },
  { label: "51+ Tools", color: fg2.tool }
];
var REVEAL_TAGLINE = `${s2("·", fg2.overlay)} ${s2("45+ Providers", fg2.muted)} ` + `${s2("·", fg2.overlay)} ${s2("51+ Tools", fg2.muted)} ` + `${s2("·", fg2.overlay)} ${s2("Local AI Ready", fg2.muted)}`;
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
  const tagline = REVEAL_TAGLINE + `
`;
  const cardSep = "  ";
  const cardLines = FEATURE_CARDS.map((card) => {
    return s2(card.label, card.color);
  }).join(s2(cardSep, fg2.overlay));
  return logo + tagline + `
` + cardLines + `
`;
}

// src/ui/tips.ts
init_colors();
var ALL_TIPS = [
  { cmd: "/model <name>", tip: "Switch models mid-session without restarting", category: "command" },
  { cmd: "/provider <name>", tip: "Jump between Ollama, OpenRouter, Claude instantly", category: "command" },
  { cmd: "/tools", tip: "See all available MCP tools and their descriptions", category: "command" },
  { cmd: "/clear", tip: "Wipe conversation history to reset context window", category: "command" },
  { cmd: "/clean", tip: "Nuke everything — history, memory, and agents for a fresh start", category: "command" },
  { cmd: "/init", tip: "Set up project context, known facts, and custom agents", category: "command" },
  { cmd: "/agents", tip: "Manage custom agents — create, use, delete, or info", category: "command" },
  { cmd: "/models", tip: "List all available models for your current provider", category: "command" },
  { cmd: "/switch", tip: "Reconfigure provider, model, and context size interactively", category: "command" },
  { cmd: "/login", tip: "Authenticate with ChatGPT Plus OAuth for API access", category: "command" },
  { cmd: "/logout", tip: "Clear OAuth authentication tokens", category: "command" },
  { cmd: "/provider", tip: "Switch to a different LLM provider interactively", category: "command" },
  { cmd: "Tab", tip: "Auto-complete slash commands and agent names", category: "command" },
  { cmd: "Up / Down", tip: "Navigate through your command history", category: "command" },
  { cmd: "/agents create", tip: "Create a reusable agent with custom instructions", category: "command" },
  { cmd: "/agents use <name>", tip: "Set an agent as always-on — prepended to every prompt", category: "command" },
  { cmd: "@agentname", tip: "Activate a custom agent for a single prompt", category: "command" },
  { cmd: "searxng_search", tip: "Web search without leaving the CLI — multiple engines", category: "tool" },
  { cmd: "fetch_web", tip: "Fetch full web page content from any URL", category: "tool" },
  { cmd: "run_code", tip: "Execute shell commands — git, npm, docker, anything", category: "tool" },
  { cmd: "run_python", tip: "Run Python code with a sandboxed interpreter", category: "tool" },
  { cmd: "github_search_repos", tip: "Search GitHub by keyword with stars and language", category: "tool" },
  { cmd: "github_issues", tip: "View, create, and manage GitHub issues", category: "tool" },
  { cmd: "github_commits", tip: "Browse commit history for any repository", category: "tool" },
  { cmd: "hacker_news", tip: "Get top Hacker News stories and comments", category: "tool" },
  { cmd: "youtube_transcript", tip: "Extract transcripts from YouTube videos", category: "tool" },
  { cmd: "youtube_search", tip: "Search YouTube videos and get metadata", category: "tool" },
  { cmd: "webclaw_crawl", tip: "Crawl an entire website for structured data", category: "tool" },
  { cmd: "scrapling_extract", tip: "Extract structured data from web pages using CSS selectors", category: "tool" },
  { cmd: "file_read", tip: "Read any file in the current directory", category: "tool" },
  { cmd: "file_write", tip: "Write or overwrite files with content", category: "tool" },
  { cmd: "file_list", tip: "Show directories and files with sizes and times", category: "tool" },
  { cmd: "file_search", tip: "Full-text search across all files in a directory", category: "tool" },
  { cmd: "file_grep", tip: "Search for patterns in files with context", category: "tool" },
  { cmd: "file_glob", tip: "Find files by pattern — great for project exploration", category: "tool" },
  { cmd: "pandas_create", tip: "Create pandas DataFrames for data analysis", category: "tool" },
  { cmd: "pandas_filter", tip: "Filter DataFrames by column conditions", category: "tool" },
  { cmd: "pandas_aggregate", tip: "Group and aggregate data — sum, mean, count", category: "tool" },
  { cmd: "/provider codex", tip: "Use ChatGPT Plus OAuth — free with your subscription", category: "provider" },
  { cmd: "/provider ollama", tip: "Ollama runs AI models locally — no internet needed", category: "provider" },
  { cmd: "beast --defaults", tip: "Auto-selects the best available provider", category: "provider" },
  { cmd: "/model gpt-4o", tip: "Use GPT-4o for the latest capabilities", category: "provider" },
  { cmd: "/model claude-3-5-sonnet", tip: "Anthropic Claude — best reasoning and analysis", category: "provider" },
  { cmd: "/model qwen3.5:35b", tip: "Qwen 35B — strong coding abilities, runs locally", category: "provider" },
  { cmd: "/provider groq", tip: "Groq — ultra-fast inference with a free tier", category: "provider" },
  { cmd: "/provider deepseek", tip: "DeepSeek — cost-effective reasoning models", category: "provider" },
  { cmd: "/provider gemini", tip: "Google Gemini — huge context window and multimodal", category: "provider" },
  { cmd: "/provider anthropic", tip: "Direct Anthropic API — full Claude access", category: "provider" },
  { cmd: "/provider openai", tip: "Direct OpenAI API — GPT models with your key", category: "provider" },
  { cmd: "/provider lmstudio", tip: "LM Studio — run any GGUF model locally", category: "provider" },
  { cmd: "/init", tip: "Store project context and facts — remember across sessions", category: "context" },
  { cmd: "Memory", tip: "Context and facts are stored in ~/.beast-cli/agents/", category: "context" },
  { cmd: "auto-compact", tip: "Context auto-compacts at 95% — never lose your place", category: "context" },
  { cmd: "Context", tip: "History counts toward your context — /clear to free it", category: "context" },
  { cmd: "@agentname", tip: "Custom agents get injected as system context in prompts", category: "context" },
  { cmd: "--theme claude", tip: "Warm editorial styling like claude.ai", category: "fun" },
  { cmd: "--theme dracula", tip: "Classic dark theme with vibrant colors", category: "fun" },
  { cmd: "--theme catppuccin-mocha", tip: "Subtle dark theme with pastel accents", category: "fun" },
  { cmd: "--theme nord", tip: "Arctic color palette — clean and calming", category: "fun" },
  { cmd: "--theme tokyonight", tip: "Japanese-inspired night theme", category: "fun" },
  { cmd: "--theme gruvbox", tip: "Retro warmth — perfect for long sessions", category: "fun" },
  { cmd: "beast --help", tip: "Full command reference and examples", category: "fun" },
  { cmd: "beast --setup", tip: "Auto-start MCP server with sensible defaults", category: "fun" },
  { cmd: "51+ tools", tip: "Web search, file ops, GitHub, YouTube, code exec, and more", category: "fun" }
];
var tipShuffle = [];
var tipIndex = 0;
function shuffleTips() {
  tipShuffle = [...ALL_TIPS];
  for (let i = tipShuffle.length - 1;i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tipShuffle[i], tipShuffle[j]] = [tipShuffle[j], tipShuffle[i]];
  }
  tipIndex = 0;
}
function randomTip() {
  if (tipShuffle.length === 0)
    shuffleTips();
  if (tipIndex >= tipShuffle.length)
    shuffleTips();
  const tip = tipShuffle[tipIndex++];
  return `${s2("*", fg2.warning)} ${s2(tip.tip, fg2.secondary)} ${s2(`(${tip.cmd})`, fg2.muted)}`;
}
function tipBanner() {
  return `
` + s2("─".repeat(50), fg2.muted) + `
` + randomTip() + `
`;
}

// src/native-tools/web.ts
import { execSync as execSync2 } from "node:child_process";
var DEFAULT_TIMEOUT = 15000;
var isWindows = process.platform === "win32";
async function fetchWithCurl(url, timeout) {
  try {
    const html = execSync2(`curl -sL --max-time ${timeout} -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url.replace(/"/g, "\\\"")}"`, { encoding: "utf-8", timeout: (timeout + 5) * 1000, shell: "cmd.exe" });
    const text = stripHtml(html);
    const title = extractTitle(html);
    return {
      success: true,
      content: text.slice(0, 16000),
      title,
      url
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function fetchWebContent(url, maxTokens = 4000) {
  if (isWindows) {
    const result = await fetchWithCurl(url, 15);
    if (result.success && result.content.length > 0) {
      return { ...result, content: result.content.slice(0, maxTokens * 4) };
    }
  }
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
  if (url.includes("freedium.cfd")) {
    const result2 = await fetchWebContent(url, maxTokens);
    if (result2.success) {
      return { ...result2, url };
    }
  }
  let mediumUrl = url;
  if (!url.includes("medium.com") && !url.includes("freedium.cfd")) {
    mediumUrl = url.startsWith("http") ? url : `https://medium.com/${url}`;
  }
  const ampUrl = mediumUrl.includes("?") ? `${mediumUrl}&outputType=amp` : `${mediumUrl}?outputType=amp`;
  let result = await fetchWebContent(ampUrl, maxTokens);
  if (result.success && result.content.length > 100) {
    return { ...result, url: ampUrl };
  }
  result = await fetchWebContent(mediumUrl, maxTokens);
  if (result.success && result.content.length > 100) {
    return { ...result, url: mediumUrl };
  }
  const freediumUrl = `https://freedium-mirror.cfd/${mediumUrl.replace("https://medium.com/", "")}`;
  result = await fetchWebContent(freediumUrl, maxTokens);
  if (result.success) {
    return { ...result, url: freediumUrl };
  }
  const oldFreediumUrl = `https://freedium.cfd/${mediumUrl.replace("https://medium.com/", "")}`;
  result = await fetchWebContent(oldFreediumUrl, maxTokens);
  if (result.success) {
    return { ...result, url: oldFreediumUrl };
  }
  return {
    success: false,
    content: "",
    error: `Could not fetch article. Tried: Medium AMP, Medium direct, Freedium. Original URL: ${url}`
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
  if (!selectors || Object.keys(selectors).length === 0) {
    return fetchWebContent(url, 4000);
  }
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
import { execSync as execSync3 } from "node:child_process";
import { glob } from "glob";
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
    const searchPattern = `**/*${pattern}*`;
    const files = await glob(searchPattern, {
      cwd: resolved,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
      maxDepth: 20,
      absolute: false
    });
    return {
      success: true,
      files: files.slice(0, maxResults).map((f) => ({ path: join(resolved, f) }))
    };
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
    const output = execSync3(cmd, { encoding: "utf-8", timeout: 1e4 });
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
      const globFiles = await glob(pattern, {
        cwd: resolved,
        ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
        maxDepth: 20,
        absolute: false
      });
      for (const f of globFiles) {
        if (!files.some((existing) => existing.path === f)) {
          files.push({ path: join(resolved, f) });
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
import { tmpdir } from "node:os";
var isWindows2 = process.platform === "win32";
var SANDBOX_DIR = isWindows2 ? join2(tmpdir(), "beast-sandbox") : "/tmp/beast-sandbox";
function getShell() {
  if (isWindows2) {
    return { command: "cmd.exe", args: ["//c"] };
  }
  return { command: "/bin/bash", args: ["-c"] };
}
function getSandboxEnv() {
  const baseEnv = { ...process.env };
  if (isWindows2) {
    return baseEnv;
  }
  return {
    ...baseEnv,
    HOME: SANDBOX_DIR,
    PATH: "/usr/bin:/bin:/usr/local/bin"
  };
}
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
async function ensurePythonInstalled() {
  if (!isWindows2)
    return null;
  try {
    console.log("[Python] Not found, attempting auto-install...");
    try {
      execSync("winget --version", { stdio: "ignore" });
    } catch {
      return "winget not available. Install Python manually: https://python.org";
    }
    try {
      console.log("[Python] Installing via winget...");
      execSync("winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements --silent", {
        stdio: "pipe",
        timeout: 180000
      });
      console.log("[Python] Installation complete, refreshing PATH...");
      return "python";
    } catch (installErr) {
      try {
        execSync("choco install python -y", { stdio: "pipe", timeout: 180000 });
        return "python";
      } catch {
        return `Python installation failed. Download from: https://python.org/downloads`;
      }
    }
  } catch (e) {
    return `Failed to auto-install Python: ${e.message}`;
  }
}
async function runPython(code, timeout, start) {
  const id = randomUUID();
  const filePath = join2(SANDBOX_DIR, `${id}.py`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    if (isWindows2) {
      const result2 = await execProcess("python", ["-u", filePath], timeout * 1000);
      const executionTime2 = Date.now() - start;
      if (!result2.error && result2.stdout) {
        return {
          success: true,
          output: result2.stdout || result2.stderr,
          error: undefined,
          executionTime: executionTime2,
          language: "python"
        };
      }
      const alternatives = ["py", "-3"];
      for (const alt of alternatives) {
        const altResult = await execProcess(alt, ["-u", filePath], timeout * 1000);
        if (!altResult.error && altResult.stdout) {
          return {
            success: true,
            output: altResult.stdout || altResult.stderr,
            error: undefined,
            executionTime: executionTime2,
            language: "python"
          };
        }
      }
      if (result2.error?.includes("not recognized") || result2.error?.includes("not found")) {
        const installResult = await ensurePythonInstalled();
        if (installResult && !installResult.includes("failed")) {
          const retryResult = await execProcess("python", ["-u", filePath], timeout * 1000);
          if (retryResult.success || retryResult.stdout) {
            return {
              success: true,
              output: retryResult.stdout || retryResult.stderr,
              error: undefined,
              executionTime: executionTime2,
              language: "python"
            };
          }
        }
      }
      return {
        success: false,
        output: "",
        error: result2.error || "Python execution failed",
        executionTime: executionTime2,
        language: "python"
      };
    }
    const result = await execProcess("python3", ["-u", "-c", code], timeout * 1000);
    const executionTime = Date.now() - start;
    if (!result.error) {
      return {
        success: true,
        output: result.stdout || result.stderr,
        error: undefined,
        executionTime,
        language: "python"
      };
    }
    return {
      success: false,
      output: "",
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
  const filePath = join2(SANDBOX_DIR, `${id}${isWindows2 ? ".bat" : ".sh"}`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    const shell = getShell();
    const args = isWindows2 ? ["/c", code] : ["-c", code];
    const result = await execProcess(shell.command, args, timeout * 1000);
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
      env: getSandboxEnv(),
      shell: isWindows2
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
async function tryRapidApiFallback(videoId) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey)
    return { success: false, output: "", error: "No API key" };
  try {
    const response = await fetch(`https://youtube-transcript-api1.p.rapidapi.com/api/transcript?video_id=${videoId}`, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "youtube-transcript-api1.p.rapidapi.com"
      },
      signal: AbortSignal.timeout(1e4)
    });
    if (response.ok) {
      const data = await response.json();
      if (data.transcript) {
        return { success: true, output: data.transcript };
      }
    }
    return { success: false, output: "", error: "RapidAPI failed" };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function tryPythonTranscriptApi(videoId) {
  try {
    const { execSync: execSync4 } = await import("child_process");
    const { writeFileSync: writeFileSync3, unlinkSync: unlinkSync2 } = await import("fs");
    const { tmpdir: tmpdir2 } = await import("os");
    const { join: join3 } = await import("path");
    try {
      execSync4('python3 -c "from youtube_transcript_api import YouTubeTranscriptApi" 2>/dev/null', { stdio: "ignore" });
    } catch {
      try {
        execSync4("pip3 install youtube-transcript-api --quiet 2>/dev/null", { stdio: "ignore" });
      } catch {
        return { success: false, output: "", error: "youtube-transcript-api not installed" };
      }
    }
    const scriptPath = join3(tmpdir2(), `yt_transcript_${Date.now()}.py`);
    const script = `
from youtube_transcript_api import YouTubeTranscriptApi
import sys

try:
    ytt = YouTubeTranscriptApi()
    transcript = ytt.fetch('${videoId}', languages=['en', 'en-US'])
    text = ' '.join([s.text for s in transcript])
    print(text[:15000])  # Limit to 15k chars
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
`;
    writeFileSync3(scriptPath, script);
    const output = execSync4(`python3 "${scriptPath}"`, {
      encoding: "utf-8",
      timeout: 30000,
      maxBuffer: 10485760
    });
    try {
      unlinkSync2(scriptPath);
    } catch {}
    if (output && !output.includes("ERROR:") && output.length > 50) {
      return { success: true, output: output.trim() };
    }
    return { success: false, output: "", error: "Python API returned empty transcript" };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function tryTranscriptionDotCom(videoId) {
  try {
    const response = await fetch(`https://youtubetranscript.com/?video=${videoId}`, {
      signal: AbortSignal.timeout(1e4)
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      if (text.includes("<html") || text.includes("<!DOCTYPE") || text.length < 100) {
        return { success: false, output: "", error: "Service returned HTML, not transcript" };
      }
      if (text && text.length > 50 && !text.includes("<body")) {
        return { success: true, output: text.slice(0, 5000) };
      }
    }
    return { success: false, output: "", error: "No transcript available" };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function tryInvidiousFallback(videoId) {
  const invidiousInstances = [
    { url: "https://inv.nadeko.net/api/v1", name: "Nadeko" },
    { url: "https://yewtu.be", name: "Yewtu" },
    { url: "https://invidious.privacyredirect.com", name: "PrivacyRedirect" },
    { url: "https://iv.nboeck.de", name: "Nboeck" },
    { url: "https://invidious.lunar.icu", name: "Lunar" }
  ];
  for (const instance of invidiousInstances) {
    try {
      const response = await fetch(`${instance.url}/api/v1/captions/${videoId}`, {
        signal: AbortSignal.timeout(8000)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.captions && data.captions.length > 0) {
          const enCaption = data.captions.find((c2) => c2.label?.toLowerCase().includes("english") || c2.label?.toLowerCase().includes("en") || c2.label?.toLowerCase().includes("auto"));
          const caption = enCaption || data.captions[0];
          if (caption.url) {
            const captionRes = await fetch(caption.url, {
              signal: AbortSignal.timeout(1e4)
            });
            if (captionRes.ok) {
              const xml = await captionRes.text();
              const textMatches = xml.match(/<text[^>]*>([^<]+)<\/text>/g);
              if (textMatches) {
                const transcript = textMatches.map((m) => {
                  const match = m.match(/<text[^>]*>([^<]+)<\/text>/);
                  return match ? match[1] : "";
                }).filter((t) => t.trim()).join(" ");
                if (transcript.length > 50) {
                  return { success: true, output: transcript };
                }
              }
            }
          }
        }
      }
    } catch {
      continue;
    }
  }
  return { success: false, output: "", error: "All Invidious instances failed" };
}
async function tryYtdlpFallback(url) {
  try {
    const { execSync: execSync4 } = await import("child_process");
    try {
      execSync4("which yt-dlp", { stdio: "ignore" });
    } catch {
      return { success: false, output: "", error: "yt-dlp not installed" };
    }
    const output = execSync4(`yt-dlp --skip-download --write-subs --write-auto-subs --sub-lang en --convert-subs=srt --print "%(autogen_subtitle)s" "${url}" 2>/dev/null || echo ""`, { encoding: "utf-8", timeout: 20000 });
    if (output && output.trim()) {
      return { success: true, output };
    }
    const videoInfo = execSync4(`yt-dlp --skip-download --write-subs --write-auto-subs --dump-json "${url}" 2>/dev/null | head -1`, { encoding: "utf-8", timeout: 20000 });
    if (videoInfo) {
      try {
        const info = JSON.parse(videoInfo);
        if (info.subtitles || info.automatic_chapters) {
          return {
            success: true,
            output: "Video has subtitles available. Install yt-dlp GUI or use --write-subs flag manually to extract."
          };
        }
      } catch {}
    }
    return { success: false, output: "", error: "yt-dlp could not extract subtitles" };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function youtubeTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    return { success: false, output: "", error: "Invalid YouTube URL" };
  }
  const fallbacks = [
    () => tryPythonTranscriptApi(videoId),
    () => tryRapidApiFallback(videoId),
    () => tryInvidiousFallback(videoId),
    () => tryTranscriptionDotCom(videoId),
    () => tryYtdlpFallback(url)
  ];
  const fallbackNames = [
    "Python API",
    "RapidAPI",
    "Invidious",
    "Transcription.com",
    "yt-dlp CLI"
  ];
  let lastError = "";
  for (let i = 0;i < fallbacks.length; i++) {
    const result = await fallbacks[i]();
    if (result.success && result.output.length > 50) {
      return result;
    }
    lastError = result.error || "Unknown error";
    console.log(`   [Fallback ${i + 1}/${fallbacks.length}] ${fallbackNames[i]} failed: ${lastError}`);
  }
  return {
    success: false,
    output: "",
    error: `All ${fallbacks.length} transcript methods failed. Last error: ${lastError}. This video may not have captions available.`
  };
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

// src/native-tools/browser.ts
import { execSync as execSync4 } from "node:child_process";
import { mkdirSync as mkdirSync2, writeFileSync as writeFileSync3 } from "node:fs";
import { join as join3 } from "node:path";
async function runPlaywright(script) {
  const projectRoot = process.cwd();
  const scriptsDir = join3(projectRoot, ".playwright-scripts");
  mkdirSync2(scriptsDir, { recursive: true });
  const scriptPath = join3(scriptsDir, `playwright-script-${Date.now()}.mjs`);
  writeFileSync3(scriptPath, script);
  try {
    const result = execSync4(`node ${scriptPath}`, { encoding: "utf-8", timeout: 30000, maxBuffer: 5 * 1024 * 1024, cwd: projectRoot });
    return result;
  } finally {
    try {
      const { unlinkSync: unlinkSync2 } = __require("node:fs");
      unlinkSync2(scriptPath);
    } catch {}
  }
}
async function browser_navigate(url, waitForSelector, timeout = 15000) {
  try {
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});
const page = await context.newPage();
page.setDefaultTimeout(${timeout});

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
${waitForSelector ? `await page.waitForSelector('${waitForSelector}', { timeout: ${timeout} });` : ""}

const title = await page.title();
const content = await page.content();

console.log(JSON.stringify({
  url: page.url(),
  title,
  content: content.slice(0, 80000)
}));

await browser.close();
`;
    const result = await runPlaywright(script);
    const data = JSON.parse(result.trim());
    return {
      success: true,
      url: data.url,
      title: data.title,
      content: data.content || ""
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function browser_screenshot(url, selector, fullPage = false) {
  try {
    const selectorPart = selector ? `await page.waitForSelector('${selector}', { timeout: 10000 }); const element = await page.locator('${selector}'); const screenshot = await element.screenshot({ path: imgPath });` : `const screenshot = await page.screenshot({ path: imgPath, fullPage: ${fullPage} });`;
    const script = `
import { chromium } from 'playwright';

const imgPath = '/tmp/beast-browser/screenshot-${Date.now()}.png';
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
${selectorPart}

const base64 = require('fs').readFileSync(imgPath).toString('base64');
console.log(JSON.stringify({ success: true, screenshot: base64, path: imgPath }));
await browser.close();
`;
    const result = await runPlaywright(script);
    const data = JSON.parse(result.trim());
    return {
      success: true,
      content: `Screenshot saved: ${data.path}`,
      url,
      screenshot: data.screenshot
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function browser_click(url, selector, waitForNavigation = true) {
  try {
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('${selector}', { timeout: 15000 });

if (${waitForNavigation}) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('${selector}')
  ]);
} else {
  await page.click('${selector}');
  await page.waitForTimeout(2000);
}

console.log(JSON.stringify({
  url: page.url(),
  title: await page.title(),
  content: (await page.content()).slice(0, 80000)
}));

await browser.close();
`;
    const result = await runPlaywright(script);
    const data = JSON.parse(result.trim());
    return {
      success: true,
      url: data.url,
      title: data.title,
      content: data.content || ""
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function browser_type(url, selector, text, submit = false) {
  try {
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('${selector}', { timeout: 15000 });
await page.fill('${selector}', '${text.replace(/'/g, "\\'")}');

if (${submit}) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('${selector}'),
  ]);
} else {
  await page.waitForTimeout(1000);
}

console.log(JSON.stringify({
  url: page.url(),
  title: await page.title(),
  content: (await page.content()).slice(0, 80000)
}));

await browser.close();
`;
    const result = await runPlaywright(script);
    const data = JSON.parse(result.trim());
    return {
      success: true,
      url: data.url,
      title: data.title,
      content: data.content || ""
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function browser_evaluate(url, jsCode) {
  try {
    const escapedCode = jsCode.replace(/'/g, "\\'").replace(/\n/g, "\\n");
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
const result = await page.evaluate(function() {
  ${jsCode}
});

console.log(JSON.stringify({
  success: true,
  result: typeof result === 'object' ? JSON.stringify(result) : String(result)
}));

await browser.close();
`;
    const result = await runPlaywright(script);
    const data = JSON.parse(result.trim());
    return {
      success: true,
      content: `JS Result: ${data.result}`
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function browser_extract(url, selectors) {
  try {
    const selectorsJson = JSON.stringify(selectors).replace(/'/g, "\\'");
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });

const selectors = ${selectorsJson};
const extracted = {};

for (const [key, selector] of Object.entries(selectors)) {
  try {
    const elements = await page.locator(selector).all();
    if (elements.length === 1) {
      extracted[key] = await elements[0].textContent() || '';
    } else if (elements.length > 1) {
      extracted[key] = await Promise.all(elements.map(e => e.textContent()));
    }
  } catch (e) {
    extracted[key] = 'NOT FOUND';
  }
}

console.log(JSON.stringify({ success: true, extracted, url: page.url() }));
await browser.close();
`;
    const result = await runPlaywright(script);
    const data = JSON.parse(result.trim());
    return {
      success: true,
      content: JSON.stringify(data.extracted, null, 2),
      url: data.url
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function browser_health() {
  try {
    const script = `
import { chromium } from 'playwright';
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
await browser.close();
console.log(JSON.stringify({ success: true }));
`;
    await runPlaywright(script);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
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
        let url2 = args.url;
        if (!url2 && args.search) {
          url2 = `https://www.google.com/search?q=${encodeURIComponent(args.search)}`;
        }
        if (!url2) {
          return { success: false, content: "", error: "Provide url or search parameter" };
        }
        const { execSync: execSync5 } = await import("node:child_process");
        const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
        execSync5(`${opener} "${url2}"`, { stdio: "ignore" });
        return { success: true, content: `Opened in browser: ${url2}` };
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
      const { execSync: execSync5, spawn: spawn3 } = await import("node:child_process");
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
        const isWin = process.platform === "win32";
        if (runBackground || /\s+&$/.test(cmd)) {
          const cleanCmd = cmd.replace(/\s*&\s*$/, "").trim();
          spawn3(cleanCmd, [], {
            shell: true,
            cwd: workingDir,
            detached: true,
            stdio: "ignore"
          }).unref();
          return { success: true, content: `Started in background: ${cleanCmd}` };
        }
        let output;
        if (isWin) {
          output = execSync5(`cmd.exe /c ${cmd}`, {
            encoding: "utf-8",
            timeout: timeout * 1000,
            cwd: workingDir,
            maxBuffer: 10485760
          });
        } else {
          output = execSync5(`/bin/bash -c ${JSON.stringify(cmd)}`, {
            encoding: "utf-8",
            timeout: timeout * 1000,
            cwd: workingDir,
            maxBuffer: 10485760
          });
        }
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
  {
    name: "tts_speak",
    description: "Read text aloud using Microsoft Edge TTS (free, high quality). Use when user asks to speak, read aloud, or play audio of content.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to speak aloud" },
        voice: { type: "string", description: "Voice name (e.g., en-US-AriaNeural, en-GB-SoniaNeural). Default: en-US-AriaNeural" },
        speed: { type: "string", description: "Speed adjustment (e.g., +0%, -10%, +20%). Default: +0%" }
      },
      required: ["text"]
    },
    async execute(args) {
      try {
        const { speak: speak2, loadTTSConfig: loadTTSConfig2 } = await Promise.resolve().then(() => (init_tts(), exports_tts));
        const config = loadTTSConfig2();
        if (!config.enabled) {
          return { success: false, content: "", error: "TTS is disabled. Run /tts on to enable." };
        }
        await speak2(args.text, { voice: args.voice });
        return { success: true, content: `Speaking: ${args.text.slice(0, 100)}...` };
      } catch (e) {
        return { success: false, content: "", error: e.message };
      }
    }
  },
  {
    name: "tts_list_voices",
    description: "List all available English voices for TTS.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      try {
        const { listVoices: listVoices4 } = await Promise.resolve().then(() => (init_tts(), exports_tts));
        const voices = await listVoices4();
        const lines = voices.map((v) => `  ${v.ShortName} - ${v.FriendlyName}`);
        return { success: true, content: `${voices.length} English voices:
${lines.join(`
`)}` };
      } catch (e) {
        return { success: false, content: "", error: e.message };
      }
    }
  },
  {
    name: "tts_config",
    description: "Configure TTS settings. Enable/disable, set default voice.",
    inputSchema: {
      type: "object",
      properties: {
        enabled: { type: "boolean", description: "Enable or disable TTS" },
        voice: { type: "string", description: "Default voice name" },
        autoPlay: { type: "boolean", description: "Auto-play TTS when summary is generated" }
      }
    },
    async execute(args) {
      try {
        const { loadTTSConfig: loadTTSConfig2, saveTTSConfig: saveTTSConfig2 } = await Promise.resolve().then(() => (init_tts(), exports_tts));
        const current = loadTTSConfig2();
        const updated = { ...current, ...args };
        saveTTSConfig2(updated);
        return { success: true, content: `TTS ${updated.enabled ? "enabled" : "disabled"}. Voice: ${updated.defaultVoice || "en-US-AriaNeural"}` };
      } catch (e) {
        return { success: false, content: "", error: e.message };
      }
    }
  },
  {
    name: "browser_navigate",
    description: "Navigate to URL with headless browser. Returns full page HTML after DOM ready. Supports waitForSelector for dynamic content.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to navigate to" },
        waitForSelector: { type: "string", description: "CSS selector to wait for before returning" },
        timeout: { type: "integer", description: "Timeout in ms (default: 15000)" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await browser_navigate(args.url, args.waitForSelector, args.timeout || 15000);
      return { success: result.success, content: result.content, error: result.error, url: result.url, title: result.title };
    }
  },
  {
    name: "browser_screenshot",
    description: "Take screenshot of page or element. Returns base64 PNG if screenshot captured.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to screenshot" },
        selector: { type: "string", description: "CSS selector for element screenshot (optional)" },
        fullPage: { type: "boolean", description: "Screenshot entire page (default: false)" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await browser_screenshot(args.url, args.selector, args.fullPage || false);
      return {
        success: result.success,
        content: result.content || "",
        screenshot: result.screenshot,
        error: result.error
      };
    }
  },
  {
    name: "browser_click",
    description: "Click element and optionally wait for navigation.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to navigate to first" },
        selector: { type: "string", description: "CSS selector of element to click" },
        waitForNavigation: { type: "boolean", description: "Wait for page navigation after click (default: true)" }
      },
      required: ["url", "selector"]
    },
    async execute(args) {
      const result = await browser_click(args.url, args.selector, args.waitForNavigation !== false);
      return { success: result.success, content: result.content, error: result.error, url: result.url };
    }
  },
  {
    name: "browser_type",
    description: "Type text into input field and optionally submit.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to navigate to first" },
        selector: { type: "string", description: "CSS selector of input field" },
        text: { type: "string", description: "Text to type" },
        submit: { type: "boolean", description: "Click after typing (default: false)" }
      },
      required: ["url", "selector", "text"]
    },
    async execute(args) {
      const result = await browser_type(args.url, args.selector, args.text, args.submit || false);
      return { success: result.success, content: result.content, error: result.error, url: result.url };
    }
  },
  {
    name: "browser_evaluate",
    description: "Run JavaScript in browser context. Useful for extracting dynamic data.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to navigate to" },
        code: { type: "string", description: "JavaScript code to execute (function body, no function keyword needed)" }
      },
      required: ["url", "code"]
    },
    async execute(args) {
      const result = await browser_evaluate(args.url, args.code);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "browser_extract",
    description: "Extract multiple elements by CSS selectors in one go. Returns JSON with all extracted values.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to navigate to" },
        selectors: { type: "object", description: "Key-value pairs: field name -> CSS selector", additionalProperties: { type: "string" } }
      },
      required: ["url", "selectors"]
    },
    async execute(args) {
      const result = await browser_extract(args.url, args.selectors);
      return { success: result.success, content: result.content, error: result.error, url: result.url };
    }
  },
  {
    name: "browser_health",
    description: "Check if Playwright/headless browser is available.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const result = await browser_health();
      return { success: result.success, content: result.success ? "Playwright browser: OK" : "Playwright browser: unavailable", error: result.error };
    }
  },
  ...engiTools
];
var TOOL_ALIASES = {
  "fs.ls": "file_list",
  "fs.read": "file_read",
  "fs.write": "file_write",
  "fs.search": "file_search",
  "fs.grep": "file_grep",
  "fs.glob": "file_glob",
  read_file: "file_read",
  readFile: "file_read",
  write_file: "file_write",
  writeFile: "file_write",
  list_files: "file_list",
  listFiles: "file_list",
  list_directory: "file_list",
  read_directory: "file_list",
  ls_dir: "file_list",
  search_files: "file_search",
  grep_files: "file_grep",
  glob_files: "file_glob",
  cat: "file_read",
  "google:search": "searxng_search",
  google_search: "searxng_search",
  search_google: "searxng_search",
  googleWebSearch: "searxng_search",
  web_search: "searxng_search",
  search_web: "searxng_search",
  websearch: "searxng_search",
  search: "searxng_search",
  search_the_web: "searxng_search",
  bing_search: "searxng_search",
  duckduckgo: "searxng_search",
  ddg: "searxng_search",
  fetch_url: "fetch_web_content",
  fetchWeb: "fetch_web_content",
  scrape: "fetch_web_content",
  web_fetch: "fetch_web_content",
  fetch_url_content: "fetch_web_content",
  "github:search": "github_search_repos",
  github_search: "github_search_repos",
  search_repos: "github_search_repos",
  list_issues: "github_issues",
  list_commits: "github_commits",
  "youtube:transcript": "youtube_transcript",
  "youtube:search": "youtube_search",
  yt_transcript: "youtube_transcript",
  yt_search: "youtube_search",
  "hackernews:top": "hackernews_top",
  "hackernews:new": "hackernews_new",
  "hackernews:best": "hackernews_best",
  hn_top: "hackernews_top",
  hn_new: "hackernews_new",
  hn_best: "hackernews_best",
  bash: "run_command",
  shell: "run_command",
  exec: "run_command",
  run_bash: "run_command",
  run_shell: "run_command",
  python: "run_python_snippet",
  run_py: "run_python_snippet",
  "browser:navigate": "browser_navigate",
  "browser:screenshot": "browser_screenshot",
  "browser:click": "browser_click",
  open_url: "open_in_browser",
  visit: "browser_navigate",
  goto: "browser_navigate"
};
var ARG_TRANSFORMS = {
  searxng_search: [
    { from: "queries", to: "query", transform: (v) => Array.isArray(v) ? v[0] : v },
    { from: "searchQuery", to: "query", transform: (v) => v },
    { from: "queryString", to: "query", transform: (v) => v },
    { from: "q", to: "query", transform: (v) => v }
  ],
  fetch_web_content: [
    { from: "url", to: "url", transform: (v) => v },
    { from: "link", to: "url", transform: (v) => v },
    { from: "href", to: "url", transform: (v) => v },
    { from: "pageUrl", to: "url", transform: (v) => v }
  ]
};
function transformArgs(originalName, targetTool, args) {
  const transforms = ARG_TRANSFORMS[targetTool];
  if (!transforms)
    return args;
  const result = { ...args };
  for (const t of transforms) {
    if (result[t.from] !== undefined) {
      const value = result[t.from];
      delete result[t.from];
      result[t.to] = t.transform(value);
    }
  }
  return result;
}
function getOriginalAlias(name) {
  if (TOOL_ALIASES[name])
    return name;
  const lowerName = name.toLowerCase();
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (alias.toLowerCase() === lowerName) {
      return alias;
    }
  }
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (lowerName.includes(alias.toLowerCase())) {
      return alias;
    }
  }
  return;
}
function normalizeToolName(name) {
  if (TOOL_ALIASES[name]) {
    return TOOL_ALIASES[name];
  }
  const lowerName = name.toLowerCase();
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (alias.toLowerCase() === lowerName) {
      return canonical;
    }
  }
  for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
    if (lowerName.includes(alias.toLowerCase())) {
      return canonical;
    }
  }
  const parts = name.split(/[:_\-.]/);
  for (const part of parts) {
    if (part && TOOL_ALIASES[part]) {
      return TOOL_ALIASES[part];
    }
    for (const [alias, canonical] of Object.entries(TOOL_ALIASES)) {
      if (alias.toLowerCase() === part.toLowerCase()) {
        return canonical;
      }
    }
  }
  return name;
}
function getTool(name) {
  const normalized = normalizeToolName(name);
  return tools.find((t) => t.name === normalized);
}
async function executeTool(name, args) {
  const normalizedName = normalizeToolName(name);
  const tool = getTool(name);
  if (!tool) {
    return { success: false, content: "", error: `Unknown tool: ${name}` };
  }
  const originalAlias = getOriginalAlias(name);
  const transformedArgs = originalAlias ? transformArgs(originalAlias, normalizedName, args) : args;
  try {
    return await tool.execute(transformedArgs);
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

// src/approval/index.ts
init_colors();

// src/diff/index.ts
function generateDiff(oldContent, newContent, filePath, contextLines = 3) {
  const oldLines = oldContent.split(`
`);
  const newLines = newContent.split(`
`);
  const lcs = computeLCS(oldLines, newLines);
  const changes = buildChangeList(oldLines, newLines, lcs);
  if (changes.length === 0) {
    return { diff: "", additions: 0, removals: 0 };
  }
  const hunks = buildHunks(oldLines, newLines, changes, contextLines);
  let additions = 0;
  let removals = 0;
  const diffLines = [];
  diffLines.push(`--- a/${filePath}`);
  diffLines.push(`+++ b/${filePath}`);
  for (const hunk of hunks) {
    diffLines.push(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`);
    for (const line of hunk.lines) {
      switch (line.type) {
        case "add":
          diffLines.push(`+${line.content}`);
          additions++;
          break;
        case "remove":
          diffLines.push(`-${line.content}`);
          removals++;
          break;
        case "context":
          diffLines.push(` ${line.content}`);
          break;
      }
    }
  }
  return {
    diff: diffLines.join(`
`),
    additions,
    removals
  };
}
function formatDiffStats(additions, removals) {
  const parts = [];
  if (additions > 0)
    parts.push(`+${additions}`);
  if (removals > 0)
    parts.push(`-${removals}`);
  return parts.join(" ") || "no changes";
}
function computeLCS(oldLines, newLines) {
  const m = oldLines.length;
  const n = newLines.length;
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  for (let i = 1;i <= m; i++) {
    for (let j = 1;j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}
function buildChangeList(oldLines, newLines, lcs) {
  const changes = [];
  let i = oldLines.length;
  let j = newLines.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      changes.unshift({ type: "equal", oldIdx: i - 1, newIdx: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      changes.unshift({ type: "add", oldIdx: -1, newIdx: j - 1 });
      j--;
    } else if (i > 0) {
      changes.unshift({ type: "remove", oldIdx: i - 1, newIdx: -1 });
      i--;
    }
  }
  return changes;
}
function buildHunks(oldLines, newLines, changes, contextLines) {
  if (changes.length === 0)
    return [];
  const hunks = [];
  let i = 0;
  while (i < changes.length) {
    while (i < changes.length && changes[i].type === "equal") {
      i++;
    }
    if (i >= changes.length)
      break;
    const hunkStart = i;
    let oldCount = 0;
    let newCount = 0;
    let contextStart = hunkStart;
    while (contextStart > 0 && changes[contextStart - 1].type === "equal") {
      contextStart--;
    }
    const extStart = Math.max(0, contextStart - contextLines);
    const hunkChanges = [];
    for (let k = extStart;k < changes.length; k++) {
      const c2 = changes[k];
      if (c2.type === "equal") {
        let contextAfter = 0;
        let checkK = k + 1;
        while (checkK < changes.length && changes[checkK].type === "equal") {
          contextAfter++;
          checkK++;
        }
        if (contextAfter >= contextLines) {
          break;
        }
      }
      hunkChanges.push(c2);
      if (c2.type !== "add")
        oldCount++;
      if (c2.type !== "remove")
        newCount++;
    }
    const hunkLines = [];
    let lastOldIdx = -1;
    let lastNewIdx = -1;
    for (const c2 of hunkChanges) {
      if (c2.type === "equal") {
        hunkLines.push({ type: "context", content: oldLines[c2.oldIdx] });
        lastOldIdx = c2.oldIdx;
        lastNewIdx = c2.newIdx;
      } else if (c2.type === "remove") {
        hunkLines.push({ type: "remove", content: oldLines[c2.oldIdx] });
        lastOldIdx = c2.oldIdx;
      } else {
        hunkLines.push({ type: "add", content: newLines[c2.newIdx] });
        lastNewIdx = c2.newIdx;
      }
    }
    const firstChange = hunkChanges.find((c2) => c2.type !== "equal") || hunkChanges[0];
    const firstEqual = hunkChanges.find((c2) => c2.type === "equal");
    const oldStart = firstEqual ? firstEqual.oldIdx + 1 : firstChange.oldIdx >= 0 ? firstChange.oldIdx + 1 : 1;
    const newStart = firstEqual ? firstEqual.newIdx + 1 : firstChange.newIdx >= 0 ? firstChange.newIdx + 1 : 1;
    hunks.push({
      oldStart,
      oldLines: Math.max(1, oldCount),
      newStart,
      newLines: Math.max(1, newCount),
      lines: hunkLines
    });
    i = hunkStart + hunkChanges.length;
  }
  return hunks;
}

// src/editor/index.ts
import { spawn as spawn3 } from "node:child_process";
import { tmpdir as tmpdir3 } from "node:os";
import { resolve as resolve3 } from "node:path";
import { existsSync as existsSync6, readFileSync as readFileSync4, writeFileSync as writeFileSync6, unlinkSync as unlinkSync3, mkdtempSync } from "node:fs";
function getEditor() {
  return process.env.BEAST_EDITOR || process.env.VISUAL || process.env.EDITOR || "vim";
}
function parseEditorCommand(command) {
  const parts = command.split(/\s+/);
  const program = parts[0];
  const args = parts.slice(1);
  return { program, args };
}
async function reviewPatch(patch, originalFile) {
  const patchFile = resolve3(tmpdir3(), `patch-${Date.now()}.diff`);
  const content = `# Review changes for: ${originalFile}
# If the changes look correct, save and exit.
# To reject changes, delete the content and save.
#
# --- Original
# +++ Modified
${patch}
`;
  writeFileSync6(patchFile, content, "utf-8");
  return new Promise((resolve4) => {
    const editor = getEditor();
    const { program, args } = parseEditorCommand(editor);
    const proc = spawn3(program, [...args, patchFile], {
      stdio: "inherit"
    });
    proc.on("close", (code) => {
      try {
        unlinkSync3(patchFile);
      } catch {}
      resolve4(code === 0);
    });
  });
}

// src/approval/index.ts
import { readFileSync as readFileSync5, existsSync as existsSync7 } from "node:fs";
import readline from "node:readline";
function getOldContent(path4) {
  try {
    if (!existsSync7(path4))
      return null;
    return readFileSync5(path4, "utf-8");
  } catch {
    return null;
  }
}
function formatDiffDisplay(diff, path4) {
  const stats = s2(formatDiffStats(diff.additions, diff.removals), fg2.muted);
  const lines = [];
  lines.push(`
${s2("─".repeat(60), fg2.muted)}`);
  lines.push(`${s2("\uD83D\uDCC4", fg2.accent)} ${s2(path4, fg2.primary)} ${s2(`(${stats})`, fg2.muted)}`);
  const diffLines = diff.diff.split(`
`).slice(2);
  const hunks = diffLines.filter((l) => l.startsWith("@@")).length;
  if (hunks > 1) {
    lines.push(`${s2("⚠", fg2.warning)} ${hunks} changes across ${diff.additions + diff.removals} lines`);
  }
  const MAX_SHOW = 20;
  const shown = diffLines.slice(0, MAX_SHOW);
  for (const line of shown) {
    if (line.startsWith("@@")) {
      lines.push(s2(line, fg2.accent));
    } else if (line.startsWith("+")) {
      lines.push(s2(line, fg2.success));
    } else if (line.startsWith("-")) {
      lines.push(s2(line, fg2.error));
    } else if (line.startsWith(" ")) {
      lines.push(dim2 + line + reset2);
    }
  }
  if (diffLines.length > MAX_SHOW) {
    lines.push(s2(`... (${diffLines.length - MAX_SHOW} more lines, review in editor for full diff)`, fg2.muted));
  }
  lines.push(s2("─".repeat(60), fg2.muted));
  return lines.join(`
`);
}
async function quickApproval(ctx) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let diff = null;
  if (ctx.oldContent && ctx.newContent) {
    diff = generateDiff(ctx.oldContent, ctx.newContent, ctx.path);
    if (diff.additions === 0 && diff.removals === 0) {
      return { approved: true, reason: "approved" };
    }
  }
  return new Promise((resolve4) => {
    const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (diff) {
      process.stdout.write(formatDiffDisplay(diff, ctx.path) + `
`);
    }
    process.stdout.write(`
${s2("⚠", fg2.warning)} ${s2(ctx.description, fg2.primary)}
`);
    process.stdout.write(`${s2("[y]", fg2.success)} ${s2("Approve", fg2.primary)}  `);
    process.stdout.write(`${s2("[e]", fg2.accent)} ${s2("Review in editor", fg2.primary)}  `);
    process.stdout.write(`${s2("[n]", fg2.error)} ${s2("Reject", fg2.primary)}
`);
    process.stdout.write(`${s2("[Enter]", fg2.muted)} to approve, ${s2("q", fg2.warning)} to cancel > `);
    rl2.question("", async (answer) => {
      rl2.close();
      const trimmed = answer.trim().toLowerCase();
      if (trimmed === "q" || trimmed === "n") {
        resolve4({ approved: false, reason: "rejected" });
        return;
      }
      if (trimmed === "e") {
        if (diff) {
          const approved = await reviewPatch(diff.diff, ctx.path);
          resolve4({ approved, reason: approved ? "external_edit" : "rejected", diff: diff ?? undefined });
        } else {
          resolve4({ approved: false, reason: "rejected", error: "No diff to review" });
        }
        return;
      }
      resolve4({ approved: true, reason: "approved", diff: diff ?? undefined });
    });
  });
}

// src/diff/index.ts
function generateDiff2(oldContent, newContent, filePath, contextLines = 3) {
  const oldLines = oldContent.split(`
`);
  const newLines = newContent.split(`
`);
  const lcs = computeLCS2(oldLines, newLines);
  const changes = buildChangeList2(oldLines, newLines, lcs);
  if (changes.length === 0) {
    return { diff: "", additions: 0, removals: 0 };
  }
  const hunks = buildHunks2(oldLines, newLines, changes, contextLines);
  let additions = 0;
  let removals = 0;
  const diffLines = [];
  diffLines.push(`--- a/${filePath}`);
  diffLines.push(`+++ b/${filePath}`);
  for (const hunk of hunks) {
    diffLines.push(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`);
    for (const line of hunk.lines) {
      switch (line.type) {
        case "add":
          diffLines.push(`+${line.content}`);
          additions++;
          break;
        case "remove":
          diffLines.push(`-${line.content}`);
          removals++;
          break;
        case "context":
          diffLines.push(` ${line.content}`);
          break;
      }
    }
  }
  return {
    diff: diffLines.join(`
`),
    additions,
    removals
  };
}
function formatDiffStats2(additions, removals) {
  const parts = [];
  if (additions > 0)
    parts.push(`+${additions}`);
  if (removals > 0)
    parts.push(`-${removals}`);
  return parts.join(" ") || "no changes";
}
function computeLCS2(oldLines, newLines) {
  const m = oldLines.length;
  const n = newLines.length;
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  for (let i = 1;i <= m; i++) {
    for (let j = 1;j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}
function buildChangeList2(oldLines, newLines, lcs) {
  const changes = [];
  let i = oldLines.length;
  let j = newLines.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      changes.unshift({ type: "equal", oldIdx: i - 1, newIdx: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      changes.unshift({ type: "add", oldIdx: -1, newIdx: j - 1 });
      j--;
    } else if (i > 0) {
      changes.unshift({ type: "remove", oldIdx: i - 1, newIdx: -1 });
      i--;
    }
  }
  return changes;
}
function buildHunks2(oldLines, newLines, changes, contextLines) {
  if (changes.length === 0)
    return [];
  const hunks = [];
  let i = 0;
  while (i < changes.length) {
    while (i < changes.length && changes[i].type === "equal") {
      i++;
    }
    if (i >= changes.length)
      break;
    const hunkStart = i;
    let oldCount = 0;
    let newCount = 0;
    let contextStart = hunkStart;
    while (contextStart > 0 && changes[contextStart - 1].type === "equal") {
      contextStart--;
    }
    const extStart = Math.max(0, contextStart - contextLines);
    const hunkChanges = [];
    for (let k = extStart;k < changes.length; k++) {
      const c2 = changes[k];
      if (c2.type === "equal") {
        let contextAfter = 0;
        let checkK = k + 1;
        while (checkK < changes.length && changes[checkK].type === "equal") {
          contextAfter++;
          checkK++;
        }
        if (contextAfter >= contextLines) {
          break;
        }
      }
      hunkChanges.push(c2);
      if (c2.type !== "add")
        oldCount++;
      if (c2.type !== "remove")
        newCount++;
    }
    const hunkLines = [];
    let lastOldIdx = -1;
    let lastNewIdx = -1;
    for (const c2 of hunkChanges) {
      if (c2.type === "equal") {
        hunkLines.push({ type: "context", content: oldLines[c2.oldIdx] });
        lastOldIdx = c2.oldIdx;
        lastNewIdx = c2.newIdx;
      } else if (c2.type === "remove") {
        hunkLines.push({ type: "remove", content: oldLines[c2.oldIdx] });
        lastOldIdx = c2.oldIdx;
      } else {
        hunkLines.push({ type: "add", content: newLines[c2.newIdx] });
        lastNewIdx = c2.newIdx;
      }
    }
    const firstChange = hunkChanges.find((c2) => c2.type !== "equal") || hunkChanges[0];
    const firstEqual = hunkChanges.find((c2) => c2.type === "equal");
    const oldStart = firstEqual ? firstEqual.oldIdx + 1 : firstChange.oldIdx >= 0 ? firstChange.oldIdx + 1 : 1;
    const newStart = firstEqual ? firstEqual.newIdx + 1 : firstChange.newIdx >= 0 ? firstChange.newIdx + 1 : 1;
    hunks.push({
      oldStart,
      oldLines: Math.max(1, oldCount),
      newStart,
      newLines: Math.max(1, newCount),
      lines: hunkLines
    });
    i = hunkStart + hunkChanges.length;
  }
  return hunks;
}

// src/utils/notifications.ts
var NOTIFY_ENABLED = process.env.BEAST_NOTIFY !== "false";
var NOTIFY_SOUND = process.env.BEAST_NOTIFY_SOUND !== "false";
function playBell() {
  if (NOTIFY_ENABLED && NOTIFY_SOUND) {
    process.stdout.write("\x07");
  }
}
function onResponseReady() {
  playBell();
}

// src/index.ts
init_agents();

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
  openrouter: "qwen/qwen3.6-plus",
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
    "qwen/qwen3.6-plus",
    "qwen/qwen3-32b",
    "qwen/qwen3-14b",
    "qwen/qwen3-8b",
    "qwen/qwq-32b",
    "openrouter/auto",
    "meta-llama/llama-3.1-8b-instruct",
    "anthropic/claude-3-haiku",
    "google/gemini-2.0-flash-exp",
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
init_platform2();
import { readFileSync as readFileSync7, existsSync as existsSync9, writeFileSync as writeFileSync8, mkdirSync as mkdirSync4 } from "node:fs";
import { resolve as resolve5, dirname as dirname2, join as join8 } from "node:path";
function getConfigDir() {
  return join8(getHomeDir(), ".beast-cli");
}
function getConfigPath() {
  return resolve5(getConfigDir(), "session.json");
}
function saveSession(config) {
  try {
    const dir = getConfigDir();
    if (!existsSync9(dir))
      mkdirSync4(dir, { recursive: true });
    writeFileSync8(getConfigPath(), JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.warn("Failed to save session config:", error);
  }
}
function loadSession() {
  try {
    const path4 = getConfigPath();
    if (!existsSync9(path4))
      return null;
    const data = JSON.parse(readFileSync7(path4, "utf-8"));
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
import readline2 from "readline";
var VERSION3 = "1.2.18";
function question(prompt) {
  const rl = readline2.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve7) => rl.question(prompt, (answer) => {
    rl.close();
    resolve7(answer);
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
var spinnerColor = "";
var spinnerStartTime = 0;
var spinnerSpeed = 80;
var spinnerPhase = 0;
var spinnerTask = "";
var PULSE_FRAMES = ["\u25D0", "\u25D3", "\u25D1", "\u25D2"];
var PHASE_STATES = [
  { state: "thinking", label: "Thinking", color: fg.accent },
  { state: "searching", label: "Searching", color: fg.sapphire },
  { state: "tool", label: "Running", color: fg.peach },
  { state: "formatting", label: "Formatting", color: fg.success }
];
function formatElapsed(ms) {
  if (ms < 1000)
    return `${ms}ms`;
  const s3 = Math.floor(ms / 1000);
  if (s3 < 60)
    return `${s3}s`;
  const m = Math.floor(s3 / 60);
  return `${m}m ${s3 % 60}s`;
}
function formatProgressBar(filled, width = 12) {
  const total = width * 4;
  const f = Math.round(filled / 100 * total);
  if (!isColorEnabled()) {
    const barLen = Math.round(filled / 100 * width);
    return "[" + "\u2593".repeat(barLen) + "\u2591".repeat(width - barLen) + "]";
  }
  const bar = fg.success + "\u2588".repeat(Math.floor(f / 4)) + (f % 4 > 0 ? ["\u2591", "\u2592", "\u2593", "\u2588"][f % 4] : "") + fg.muted + "\u2591".repeat(width - Math.ceil(f / 4));
  return bar + reset;
}
function writeSpinnerFrame(phase, task) {
  const pulse = PULSE_FRAMES[phase % 4];
  const elapsed = formatElapsed(Date.now() - spinnerStartTime);
  const bar = formatProgressBar((phase % 20 + 1) * 5);
  const line = `\r${s(spinnerLabel, spinnerColor)} ${s(pulse, fg.secondary)} ${s(spinnerTask, fg.muted)} ${bar} ${s(elapsed, fg.muted)}   `;
  process.stderr.write(line);
}
function startFunSpinner(state = "thinking", task = "") {
  if (currentSpinner)
    clearInterval(currentSpinner);
  spinnerStarted = true;
  spinnerFrame = 0;
  spinnerPhase = 0;
  spinnerStartTime = Date.now();
  spinnerSpeed = 80;
  const cfg = PHASE_STATES.find((p) => p.state === state) ?? PHASE_STATES[0];
  spinnerLabel = cfg.label;
  spinnerColor = cfg.color;
  spinnerTask = task ? task : "";
  writeSpinnerFrame(0, spinnerTask);
  currentSpinner = setInterval(() => {
    if (!spinnerStarted)
      return;
    spinnerPhase = (spinnerPhase + 1) % 20;
    writeSpinnerFrame(spinnerPhase, spinnerTask);
  }, spinnerSpeed);
}
function stopFunSpinner(status = "done") {
  if (currentSpinner) {
    clearInterval(currentSpinner);
    currentSpinner = null;
  }
  spinnerStarted = false;
  const elapsed = formatElapsed(Date.now() - spinnerStartTime);
  process.stderr.write("\r" + " ".repeat(90) + "\r");
  if (status === "done") {
    process.stderr.write(s("\u2713 ", fg.success) + (spinnerLabel || "Done") + (spinnerTask ? " " + s(spinnerTask, fg.muted) : "") + s(" \xB7 " + elapsed, fg.muted) + `
`);
  } else if (status === "error") {
    process.stderr.write(s("\u2717 ", fg.error) + "Error" + s(" \xB7 " + elapsed, fg.muted) + `
`);
  }
}
function streamText(text) {
  process.stdout.write(panel(text, { title: "\uD83E\uDD16 Response", titleColor: fg.mauve, width: 70, style: "round" }));
  process.stdout.write(`
`);
}
function printUsage(usage) {
  if (!usage)
    return;
  const { promptTokens, completionTokens, totalTokens } = usage;
  process.stdout.write(`${s("\u26A1 ", fg.muted)}${s(totalTokens.toLocaleString(), fg.mauve)} tokens `);
  process.stdout.write(`(${s("p:" + promptTokens, fg.sapphire)} ${s("c:" + completionTokens, fg.mauve)})
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
\uD83D\uDC09 ${s("BEAST", fg.accent, bold)} ${s("CLI", fg.mauve, bold)} ${s(`v${VERSION3}`, fg.muted)} ${s("\xB7", fg.muted)} ${s("45+ Providers", fg.secondary)} ${s("\xB7", fg.muted)} ${s("51+ Tools", fg.secondary)}`);
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
    version: VERSION3,
    provider: session.provider,
    model: session.model,
    toolsCount: toolCount
  }));
  console.log(`
` + inlineList([
    { icon: icon.prompt, label: "Type", value: "your request" },
    { icon: icon.tool, label: toolCount + " tools", value: "available" }
  ]));
  console.log(`
` + s("Commands:", fg.muted));
  console.log(helpPanel([
    { cmd: "/help", desc: "Show all commands" },
    { cmd: "/clean", desc: "Clear all \u2014 history, memory, agents" },
    { cmd: "/init", desc: "Create / update memory & agents" },
    { cmd: "/agents", desc: "Manage custom agents" },
    { cmd: "/switch", desc: "Change provider/model/context" },
    { cmd: "/tools", desc: "List available tools" },
    { cmd: "/clear", desc: "Clear chat history" },
    { cmd: "/exit", desc: "Quit Beast CLI" }
  ]));
  console.log("");
}
async function repl(session) {
  const SLASH_COMMANDS = [
    "/help",
    "/switch",
    "/models",
    "/model",
    "/provider",
    "/tools",
    "/clear",
    "/clean",
    "/init",
    "/agents",
    "/login",
    "/logout",
    "/exit",
    "/agents list",
    "/agents create",
    "/agents use",
    "/agents delete",
    "/agents info"
  ];
  const rl = readline2.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: (line) => {
      const hits = SLASH_COMMANDS.filter((c2) => c2.startsWith(line));
      if (line.startsWith("@")) {
        try {
          const agents = listAgents();
          const agentHits = agents.map((a) => "@" + a.name).filter((n) => n.startsWith(line));
          return [agentHits.length ? agentHits : hits, line];
        } catch {}
      }
      return [hits.length ? hits : [], line];
    }
  });
  const safePrompt = () => {
    if (!rl.closed && process.stdin.isTTY) {
      promptUser();
    }
  };
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
  /clean          Clear everything (history, memory, agents)
  /init           Setup memory & create agents
  /agents         Manage custom agents
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
      safePrompt();
      return;
    }
    if (trimmed === "/logout") {
      clearCodexToken();
      console.log(`
\u2705 ChatGPT Plus logout complete.`);
      safePrompt();
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
      safePrompt();
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
      safePrompt();
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
    if (trimmed === "/clean") {
      session.messages = [];
      try {
        const { AgentStore, AgentMemory } = await Promise.resolve().then(() => (init_agents(), exports_agents));
        updateAgent && updateAgent("", { instructions: "" });
      } catch {}
      const fs4 = await import("fs");
      const path4 = await import("path");
      const dir = path4.resolve(process.env.HOME ?? "~", ".beast-cli", "agents");
      try {
        fs4.rmSync(dir, { recursive: true, force: true });
      } catch {}
      console.log(`
\u2705 Everything cleared \u2014 history, memory, and agents.`);
      promptUser();
      return;
    }
    if (trimmed === "/init") {
      console.log(`
` + s("\u2500\u2500\u2500 Memory & Agent Setup \u2500\u2500\u2500", fg.accent));
      const memory2 = loadMemory();
      console.log(`
` + s("Project Context", fg.sapphire));
      console.log("  Current: " + (memory2.context ? s(memory2.context, fg.muted) : s("(empty)", fg.overlay)));
      const ctx = await question('  Enter project context (e.g. "Next.js app with PostgreSQL") > ');
      if (ctx.trim()) {
        memory2.context = ctx.trim();
        memory2.updatedAt = Date.now();
        saveMemory(memory2);
        console.log("  " + s("\u2713", fg.success) + " Context saved.");
      }
      console.log(`
` + s("Known Facts", fg.sapphire) + s(" (one per line, empty to finish)", fg.muted));
      memory2.facts.forEach((f, i) => console.log(`  ${i + 1}. ${s(f, fg.muted)}`));
      let moreFacts = true;
      while (moreFacts) {
        const fact = await question("  Fact (Enter to finish) > ");
        if (!fact.trim()) {
          moreFacts = false;
        } else {
          memory2.facts.push(fact.trim());
        }
      }
      saveMemory(memory2);
      console.log(`
` + s("Quick-create an agent?", fg.sapphire));
      const mkAgent = await question("  Name (or Enter to skip) > ");
      if (mkAgent.trim()) {
        const agName = mkAgent.trim();
        const agDesc = await question("  Description > ");
        const agInstr = await question("  Instructions (what this agent does) > ");
        const ag = createAgent({ name: agName, description: agDesc.trim(), instructions: agInstr.trim() });
        console.log("  " + s("\u2713", fg.success) + ` Agent "${agName}" created.`);
      }
      saveMemory(memory2);
      console.log(`
\u2705 Memory & agents initialized.`);
      promptUser();
      return;
    }
    if (trimmed === "/agents" || trimmed.startsWith("/agents ")) {
      const args = trimmed.split(" ").slice(1);
      const action = args[0] || "list";
      if (action === "list" || action === "") {
        const agents = listAgents();
        const active = getActiveAgent();
        console.log(`
` + s("\u2500\u2500\u2500 Agents \u2500\u2500\u2500", fg.accent));
        if (agents.length === 0) {
          console.log("  " + s("No agents yet. Run", fg.muted) + " /agents create " + s("to make one.", fg.muted));
        } else {
          agents.forEach((a) => {
            const isActive = active?.id === a.id;
            const marker = isActive ? s(" \u25CF active", fg.success) : "";
            console.log(`  ${s("\u25C6", fg.accent)} ${s(a.name, fg.sapphire)}${marker}`);
            if (a.description)
              console.log(`    ${s(a.description, fg.muted)}`);
          });
        }
        console.log(`
` + s("Commands:", fg.muted));
        console.log("  /agents list              List all agents");
        console.log("  /agents create            Create a new agent");
        console.log("  /agents use <name>        Set agent as always-on");
        console.log("  /agents delete <name>    Remove an agent");
        console.log("  @<name>                   Use agent in a prompt");
        promptUser();
        return;
      }
      if (action === "create") {
        const name = await question("  Agent name > ");
        if (!name.trim()) {
          console.log(`
Cancelled.`);
          promptUser();
          return;
        }
        const desc = await question("  Description > ");
        const instr = await question("  Instructions (what this agent does) > ");
        if (!instr.trim()) {
          console.log(`
` + s("! Instructions required.", fg.warning));
          promptUser();
          return;
        }
        const ag = createAgent({ name: name.trim(), description: desc.trim(), instructions: instr.trim() });
        console.log(`
\u2705 Agent "` + ag.name + '" created. Use it with @' + ag.name);
        promptUser();
        return;
      }
      if (action === "use") {
        const name = args.slice(1).join(" ");
        if (!name) {
          console.log(`
` + s("Usage:", fg.muted) + " /agents use <name>");
          promptUser();
          return;
        }
        const ag = getAgent(name);
        if (!ag) {
          console.log(`
` + s("! Agent not found:", fg.error) + " " + name);
          promptUser();
          return;
        }
        setActiveAgent(ag.name);
        console.log(`
\u2705 Active agent set to ` + s(ag.name, fg.sapphire) + s(" (always prepended to prompts)", fg.muted));
        promptUser();
        return;
      }
      if (action === "delete") {
        const name = args.slice(1).join(" ");
        if (!name) {
          console.log(`
` + s("Usage:", fg.muted) + " /agents delete <name>");
          promptUser();
          return;
        }
        const ag = getAgent(name);
        if (!ag) {
          console.log(`
` + s("! Agent not found:", fg.error) + " " + name);
          promptUser();
          return;
        }
        deleteAgent(ag.id);
        console.log(`
\u2705 Agent "` + name + '" deleted.');
        promptUser();
        return;
      }
      if (action === "info") {
        const name = args.slice(1).join(" ");
        if (!name) {
          console.log(`
` + s("Usage:", fg.muted) + " /agents info <name>");
          promptUser();
          return;
        }
        const ag = getAgent(name);
        if (!ag) {
          console.log(`
` + s("! Agent not found:", fg.error) + " " + name);
          promptUser();
          return;
        }
        console.log(`
` + s("\u2500\u2500\u2500 " + ag.name + " \u2500\u2500\u2500", fg.accent));
        if (ag.description)
          console.log("  " + s("Description:", fg.sapphire) + " " + ag.description);
        console.log("  " + s("Instructions:", fg.sapphire));
        ag.instructions.split(`
`).forEach((l) => console.log("    " + l));
        if (ag.model)
          console.log("  " + s("Model:", fg.sapphire) + " " + ag.model);
        const d = new Date(ag.createdAt);
        console.log("  " + s("Created:", fg.muted) + " " + d.toLocaleDateString());
        promptUser();
        return;
      }
      console.log(`
` + s("Usage:", fg.muted));
      console.log("  /agents list              List all agents");
      console.log("  /agents create            Create a new agent");
      console.log("  /agents use <name>       Set always-on agent");
      console.log("  /agents delete <name>    Remove agent");
      console.log("  /agents info <name>      Show agent details");
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
      "policy",
      "commodity",
      "bitcoin",
      "crypto",
      "forex",
      "sensex",
      "nifty",
      "bse",
      "nse",
      "share",
      "trading",
      "minister",
      "minister of",
      "cabinet",
      "cm",
      "chief minister",
      "governor",
      "mla",
      "mp",
      "parliament",
      "legislative",
      "election result",
      "election results",
      "vote",
      "voting",
      "who is",
      "who was",
      "who are",
      "current",
      "latest",
      "appointed",
      "resigned",
      "elected",
      "incumbent"
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
        "not have real-time",
        "no real-time",
        "not have real-time",
        "don't have real-time",
        "do not have real-time",
        "do not have current",
        "cannot provide",
        "cannot give",
        "cannot tell",
        "can't provide",
        "can't give",
        "can't tell",
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
        "my knowledge",
        "i don't have",
        "i cannot",
        "i can't",
        "not have access to",
        "do not have",
        "don't have the",
        "do not have the",
        "don't have any",
        "do not have any",
        "do not have information",
        "don't have information",
        "don't have up-to-date"
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
        content: `You have access to ${nativeTools.length} native tools. IMPORTANT: Always use web search tools (searxng_search) for real-time queries like prices, weather, news, current events, sports scores, stock rates, gold rates, etc. Available tools: ${nativeTools.map((t) => `${t.name}: ${t.description ?? "no description"}`).join(", ")}`
      });
    }
    const agentCtx = parseAgentContext(trimmed);
    const systemParts = [];
    if (agentCtx.agentInstructions.length > 0) {
      systemParts.push(`You have access to the following custom agents:
` + agentCtx.agentInstructions.join(`

`));
    }
    const memory = loadMemory();
    if (memory.context || memory.facts.length > 0) {
      const memParts = [];
      if (memory.context)
        memParts.push(`Project Context: ${memory.context}`);
      if (memory.facts.length > 0)
        memParts.push(`Known Facts: ${memory.facts.map((f) => `\u2022 ${f}`).join(`
`)}`);
      if (Object.keys(memory.preferences).length > 0) {
        memParts.push(`Preferences: ${Object.entries(memory.preferences).map(([k, v]) => `${k}=${v}`).join(", ")}`);
      }
      systemParts.push(`[MEMORY]
` + memParts.join(`
`));
    }
    if (systemParts.length > 0) {
      const existingSystem = agentMessages.find((m) => m.role === "system");
      if (existingSystem) {
        existingSystem.content += `

` + systemParts.join(`

`);
      } else {
        agentMessages.unshift({ role: "system", content: systemParts.join(`

`) });
      }
    }
    const finalPrompt = agentCtx.cleanedPrompt || trimmed;
    agentMessages.push({ role: "user", content: finalPrompt });
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
          onResponseReady();
        }
        if (toolCallCount > 0 && response.content) {
          onResponseReady();
        }
        if (!response.toolCalls || response.toolCalls.length === 0) {
          const noNativeTools = !providerSupportsNativeTools(session.provider);
          const needsRealTime = looksLikeRealTimeQuery(trimmed);
          const looksLikeApology = response.content ? isApologyOrNoAccess(response.content) : false;
          if (noNativeTools && needsRealTime && looksLikeApology) {
            console.log(s(`
\uD83D\uDD0D Auto-detected real-time query`, fg.sapphire) + s(" \u2014 fetching live data...", fg.muted));
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
          if (toolName === "file_write") {
            const filePath = toolArgs.path;
            const newContent = toolArgs.content;
            const oldContent = getOldContent(filePath);
            if (oldContent && oldContent !== newContent) {
              const diff = generateDiff2(oldContent, newContent, filePath);
              if (diff.additions > 0 || diff.removals > 0) {
                const stats = formatDiffStats2(diff.additions, diff.removals);
                process.stdout.write(`
${s("\uD83D\uDCC4", fg.accent)} ${s(filePath, fg.primary)} ${s("(" + stats + ")", fg.muted)}
`);
                const diffLines = diff.diff.split(`
`).slice(2);
                const MAX_DIFF = 20;
                for (const line of diffLines.slice(0, MAX_DIFF)) {
                  if (line.startsWith("@@")) {
                    process.stdout.write(s(line, fg.accent) + `
`);
                  } else if (line.startsWith("+")) {
                    process.stdout.write(s(line, fg.success) + `
`);
                  } else if (line.startsWith("-")) {
                    process.stdout.write(s(line, fg.error) + `
`);
                  } else if (line.startsWith(" ")) {
                    process.stdout.write(dim + line + reset + `
`);
                  }
                }
                if (diffLines.length > MAX_DIFF) {
                  process.stdout.write(s(`  ... (${diffLines.length - MAX_DIFF} more lines)`, fg.muted) + `
`);
                }
                const approval = await quickApproval({
                  tool: "file_write",
                  path: filePath,
                  oldContent,
                  newContent,
                  description: `Write ${diff.additions + diff.removals} line change to ${filePath}?`
                });
                if (!approval.approved) {
                  process.stdout.write(s(`
\u2717 Rejected`, fg.error) + ` \u2014 file not written
`);
                  agentMessages.push({ role: "assistant", content: response.content, toolCalls: [tc] });
                  agentMessages.push({ role: "user", content: "Tool call rejected by user." });
                  continue;
                }
                process.stdout.write(s(`
\u2713 Approved`, fg.success) + ` \u2014 proceeding with write
`);
              }
            }
          }
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
\uD83D\uDC09 BEAST CLI v${VERSION3} - AI Coding Agent

USAGE:
  beast [options]

OPTIONS:
  --provider <name>  LLM provider (ollama, codex, anthropic, openai, etc.)
  --model <name>     Model name
  --defaults         Use saved config or auto-select best option
  --switch           Reconfigure provider/model/context
  --setup            Auto-start MCP server
  --tui              Launch modern React/Ink TUI (interactive picker by default)
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
      case "--tui":
        options.tui = true;
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
  if (options.tui) {
    const { launchUI: launchUI2 } = await Promise.resolve().then(() => (init_router(), exports_router));
    await launchUI2("auto");
    return;
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
      session = { provider: "codex", model: "gpt-5.2-codex", apiKey: undefined, baseUrl: "https://chatgpt.com/backend-api", messages: [], contextMax: 131072 };
      console.log(`\u2705 ChatGPT Plus (logged in)`);
    } else {
      const ollamaModels = await fetchOllamaModels();
      if (ollamaModels.length > 0) {
        session = { provider: "ollama", model: ollamaModels[0], apiKey: undefined, baseUrl: "http://localhost:11434", messages: [], contextMax: 131072 };
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
export {
  repl
};
