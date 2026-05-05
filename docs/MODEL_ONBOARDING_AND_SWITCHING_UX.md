# BeastCLI Model Onboarding and Switching UX

Date: 2026-05-02
Status: Phase 1 implemented
Goal: make first-run setup and model switching feel obvious, fast, and low-risk.

## Implementation Status

Phase 1 is implemented in the TUI model picker:

- BeastCLI probes Ollama and LM Studio through their OpenAI-compatible `/v1/models` endpoints.
- Detected local models appear as compact `Detected local` rows in the existing model dialog.
- Selecting a detected model writes the provider config, reloads providers, and switches to the model.
- OpenRouter is promoted into the popular provider setup list.

## Research Summary

Modern model setup has converged around one simple pattern:

- Local providers expose OpenAI-compatible `/v1` endpoints.
- Hosted router providers expose the same shape plus an API key.
- Users expect apps to detect local servers automatically and only ask for secrets when needed.

Provider facts to build around:

| Provider                  | Setup shape                    | Default endpoint               | Auth           | Detection                      |
| ------------------------- | ------------------------------ | ------------------------------ | -------------- | ------------------------------ |
| Ollama                    | OpenAI-compatible local API    | `http://localhost:11434/v1`    | none for local | `GET /v1/models`               |
| LM Studio                 | OpenAI-compatible local server | `http://localhost:1234/v1`     | none for local | `GET /v1/models`               |
| OpenRouter                | OpenAI-compatible hosted API   | `https://openrouter.ai/api/v1` | Bearer API key | authenticated `GET /models`    |
| Generic OpenAI-compatible | User-supplied endpoint         | user input                     | optional key   | `GET /models`, then probe chat |

## Product Principles

1. **Detect first, ask later**

   On first run, BeastCLI should probe local providers before showing forms. If Ollama or LM Studio is running, the user should see usable models immediately.

2. **One provider picker, not separate setup pages**

   Model switching and provider setup should live in the same model dialog. Users came to switch models; setup should be an inline branch of that flow.

3. **Safe defaults**

   Pre-fill provider defaults:
   - Ollama: `http://localhost:11434/v1`
   - LM Studio: `http://localhost:1234/v1`
   - OpenRouter: `https://openrouter.ai/api/v1`

4. **Test before saving**

   Every setup path should end with a connection test and model list refresh before the config is written.

5. **Keep compact density**

   Use compact `DialogSelect` rows and simple footer key hints. Avoid card-heavy onboarding screens.

## First-Run Flow

When BeastCLI starts and no usable non-Beast provider/model is configured:

```text
Select model

Detected local models
  llama3.2                         Ollama
  qwen2.5-coder                    LM Studio

Quick setup
  Ollama local                     Not running
  LM Studio local                  Not running
  OpenRouter                       API key required
  OpenAI-compatible                Custom endpoint
```

Selection behavior:

- Choosing a detected model immediately sets it as current and closes the dialog.
- Choosing `Ollama local` when not running opens a compact help dialog:
  - "Start Ollama, then press refresh."
  - Key actions: `refresh`, `edit URL`, `open docs`.
- Choosing `LM Studio local` when not running opens a compact help dialog:
  - "Open LM Studio > Developer > Start server."
  - Key actions: `refresh`, `edit URL`, `open docs`.
- Choosing `OpenRouter` opens an API key prompt, validates the key by fetching models, then shows the model list.
- Choosing `OpenAI-compatible` asks for provider name, base URL, optional API key, then validates.

## Normal Model Switching

`ctrl+o` opens `DialogModel`.

Preferred order:

1. Favorites
2. Recent
3. Detected local providers
4. Configured hosted providers
5. Quick setup actions

Compact row examples:

```text
Favorites
  qwen2.5-coder:latest             Ollama
  anthropic/claude-sonnet-4.5      OpenRouter

Detected local
  gemma4:latest                    Ollama
  llama-3.2-1b                     LM Studio

Setup
  Connect OpenRouter               API key
  Add OpenAI-compatible provider   Custom endpoint
```

## Provider Setup Dialogs

### Ollama Setup

Fields:

- Base URL, default `http://localhost:11434/v1`

Actions:

- `test`: calls `/v1/models`
- `refresh`: retries detection
- `save`: writes provider config only after test passes

Success state:

```text
Ollama connected
  7 models found
  Selected: gemma4:latest
```

Config patch:

```jsonc
{
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://localhost:11434/v1",
      },
      "models": {
        "gemma4:latest": {
          "name": "gemma4:latest",
        },
      },
    },
  },
  "model": "ollama/gemma4:latest",
}
```

### LM Studio Setup

Fields:

- Base URL, default `http://localhost:1234/v1`

Actions:

- `test`: calls `/v1/models`
- `refresh`: retries detection
- `save`: writes provider config only after test passes

User guidance:

```text
Start LM Studio server
  Developer tab -> Start server
  Or run: lms server start
```

Config patch:

```jsonc
{
  "provider": {
    "lmstudio": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LM Studio",
      "options": {
        "baseURL": "http://localhost:1234/v1",
      },
      "models": {
        "llama-3.2-1b": {
          "name": "llama-3.2-1b",
        },
      },
    },
  },
  "model": "lmstudio/llama-3.2-1b",
}
```

### OpenRouter Setup

Fields:

- API key
- Optional default model search

Hidden defaults:

- Base URL: `https://openrouter.ai/api/v1`
- Provider package: `@ai-sdk/openai-compatible`

Actions:

- `test`: authenticated model list request
- `save`: stores credential securely through the auth service, not plain config
- `select`: opens filtered OpenRouter model list

Config patch:

```jsonc
{
  "provider": {
    "openrouter": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenRouter",
      "options": {
        "baseURL": "https://openrouter.ai/api/v1",
      },
      "models": {
        "openai/gpt-4o-mini": {
          "name": "GPT-4o Mini",
        },
      },
    },
  },
  "model": "openrouter/openai/gpt-4o-mini",
}
```

API key storage:

- Prefer existing `Auth.Service` credential storage.
- Do not write `apiKey` into project-local config by default.
- Allow env fallback: `OPENROUTER_API_KEY`.

### Generic OpenAI-Compatible Setup

Fields:

- Provider ID
- Display name
- Base URL
- Optional API key

Validation:

1. Normalize base URL.
2. Request `/models` or `/v1/models`.
3. If models are empty, allow manual model ID entry.
4. Run a tiny non-streaming chat completion if the endpoint supports it.
5. Save config.

## Detection Algorithm

Run on first model dialog open and on explicit refresh:

```text
probe Ollama -> http://localhost:11434/v1/models
probe LM Studio -> http://localhost:1234/v1/models
probe configured OpenAI-compatible providers -> configured baseURL + /models
merge with config provider list
mark source: detected | configured | auth-required | unavailable
```

Rules:

- Timeout local probes at 500-800 ms each.
- Probe Ollama and LM Studio concurrently.
- Cache detection result for 10 seconds.
- Never block TUI boot on detection.
- Show stale configured models immediately while refreshing in background.

## UI Components to Add

### `provider-detect.ts`

Responsibilities:

- Probe local OpenAI-compatible endpoints.
- Normalize returned model IDs.
- Return provider status objects.

Shape:

```ts
type ProviderProbe = {
  id: "ollama" | "lmstudio" | string
  name: string
  baseURL: string
  status: "ready" | "not_running" | "auth_required" | "error"
  models: Array<{ id: string; name: string }>
  message?: string
}
```

### `dialog-provider-setup.tsx`

Responsibilities:

- Compact setup form for one provider.
- Test connection.
- Save provider and selected model.

### `dialog-model.tsx`

Enhancements:

- Add detected local provider options above setup actions.
- Add quick setup rows when providers are unavailable.
- Keep rows compact and grouped by category.

### `config provider writer`

Responsibilities:

- Apply a JSONC patch to global config.
- Preserve user formatting where possible.
- Store hosted API keys with auth service.

## Error Copy

Ollama not running:

```text
Ollama is not reachable at http://localhost:11434/v1
Start Ollama, then refresh.
```

LM Studio not running:

```text
LM Studio server is not reachable at http://localhost:1234/v1
Open LM Studio -> Developer -> Start server, then refresh.
```

OpenRouter invalid key:

```text
OpenRouter rejected this API key.
Check the key or create a new one, then try again.
```

No models:

```text
Connection worked, but no models were returned.
Download or load a model, then refresh.
```

## Implementation Phases

### Phase 1: Easy Local Providers

- Add provider probe helper.
- Detect Ollama and LM Studio.
- Show detected local models in `DialogModel`.
- Let user select and save a detected local model.

### Phase 2: Hosted API Setup

- Add OpenRouter setup dialog.
- Store API key through auth service.
- Fetch OpenRouter models and allow search.
- Save selected OpenRouter model.

### Phase 3: Generic Endpoint

- Add custom OpenAI-compatible setup flow.
- Allow manual model entry when `/models` is unavailable.
- Add connection test result states.

### Phase 4: Polish

- Add refresh keybinding in model dialog.
- Add provider health labels.
- Add "Set as default" and "Favorite" actions.
- Add onboarding test coverage and CLI smoke fixture.

## Acceptance Criteria

First-run:

- A user with Ollama running can select an Ollama model without editing JSON.
- A user with LM Studio running can select an LM Studio model without editing JSON.
- A user with OpenRouter key can paste it, search models, select one, and run a prompt.
- A user can switch between Ollama, LM Studio, OpenRouter, and BeastCLI-hosted models from `ctrl+o`.

Safety:

- Failed provider setup does not corrupt config.
- API keys are not written to project config unless explicitly requested.
- Local detection never blocks app startup.

Look and feel:

- Uses compact `DialogSelect` rows.
- No card-heavy onboarding page.
- Setup is reachable from the model dialog and command palette.
