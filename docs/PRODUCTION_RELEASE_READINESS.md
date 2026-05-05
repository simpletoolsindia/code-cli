# BeastCLI Production Release Readiness

Date: 2026-05-02
Branch: `dev`
Current package: `packages/beastcli`
Binary: `beast`

## Release Decision

Status: **Not ready for production release yet**

BeastCLI is ready for continued release-candidate testing. Core CLI boot, package typecheck, Ollama model discovery, and Ollama prompt execution have passed. The remaining blockers are mostly release hygiene and confidence work: full test stabilization, packaging verification, clean git inventory, and cross-platform install smoke tests.

## Current Verified State

| Area                     | Status                         | Evidence                                                                                   |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------ |
| Package typecheck        | Pass                           | `cd packages/beastcli && bun typecheck`                                                    |
| Retry logic tests        | Pass                           | `cd packages/beastcli && bun test test/session/retry.test.ts`                              |
| CLI boot/help            | Pass                           | `cd packages/beastcli && bun run --conditions=browser ./src/index.ts --help`               |
| Branding logo            | Pass                           | CLI help renders BeastCLI ASCII logo                                                       |
| Ollama API               | Pass                           | `http://localhost:11434/v1/models` responds                                                |
| Ollama model listing     | Pass                           | `beast models ollama --pure` returns `ollama/gemma4:latest`                                |
| Ollama prompt smoke      | Pass                           | `beast run --pure --model ollama/gemma4:latest --format json ...` returned expected marker |
| UX improvements          | Pass typecheck                 | Command palette recents/previews, session previews, expanded help                          |
| Performance improvements | Pass typecheck and retry tests | Bounded instance cache, jittered retry schedule, parallelized tool registry work           |

## Implemented Migration Scope

Branding and CLI identity:

- `beast` binary command is active.
- BeastCLI package name is active in `packages/beastcli/package.json`.
- Welcome/help logo was replaced with the requested BeastCLI ASCII logo.
- TUI logo renderer supports plain ASCII and preserves encoded GO-logo rendering.

Provider and local model support:

- Ollama local provider is configured through `.beastcli/beastcli.jsonc`.
- `ollama/gemma4:latest` has been discovered and used successfully.

Tooling:

- Code CLI compatibility tool is registered.
- Hacker News tools are registered.
- YouTube tools are registered.
- Data/Pandas/plot tools are registered.
- Tool registry startup work now resolves tool info and repo-local tools concurrently.

UX:

- Shared select dialog supports detail rows and selected-item previews.
- Command palette includes recent commands and richer previews.
- Session list includes status/workspace/change/path/share preview information.
- Help dialog includes practical shortcut sections.

Performance:

- Instance state cache is bounded.
- Retry policy now uses jitter for exponential backoff while respecting provider retry headers exactly.
- Tool definition output is cached briefly per provider/model/agent permission profile.

## Production Blockers

1. **Full test suite is not green**

   Earlier full package test run had broad failures. Before release, run the full suite from package directories and fix or classify failures:

   ```bash
   cd packages/beastcli
   bun test --timeout 30000
   ```

2. **Git worktree is very dirty**

   The migration has many modified/deleted/untracked files across the repo. Before release, produce a clean release diff:

   ```bash
   git status --short
   git diff --stat
   ```

   Required outcome: every changed file is either intentionally part of BeastCLI migration or removed before release.

3. **Packaging has not been verified**

   Run the BeastCLI package build and verify the generated executable/package:

   ```bash
   cd packages/beastcli
   bun run build
   ./bin/beast --help
   ```

4. **Install/upgrade/uninstall flows need smoke tests**

   Validate from a clean machine or disposable user profile:

   ```bash
   beast --version
   beast --help
   beast models ollama --pure
   beast run --pure --model ollama/gemma4:latest "Reply with exactly: INSTALL_OK"
   beast upgrade --help
   beast uninstall --help
   ```

5. **Database startup race observed during parallel CLI smoke**

   Running two CLI commands in parallel once triggered:

   ```text
   Failed to run the query 'PRAGMA journal_mode = WAL'
   ```

   Single-command reruns passed. Before release, investigate whether SQLite migration/WAL setup needs a process lock.

6. **Optional plugin compatibility needs release policy**

    Poe auth plugin loading is optional and guarded. Decide whether to keep it optional or remove it from production package metadata.

7. **UI parity needs final manual sign-off**

    Current parity decisions:
    - Filepicker dialog: BeastCLI currently has prompt `@` file attachment and editor context.
    - Custom commands UI: BeastCLI has command/plugin infrastructure.
    - Multi-arguments dialog: not yet matched.

## Release Validation Checklist

Run these from the repo root unless noted.

### 1. Environment

```bash
bun --version
ollama --version
ollama list
curl -s http://localhost:11434/v1/models
```

Expected:

- Bun is installed.
- Ollama is running.
- `gemma4:latest` or the configured release test model is available.

### 2. Static Checks

```bash
cd packages/beastcli
bun typecheck
bun test test/session/retry.test.ts
```

Expected:

- Typecheck passes.
- Focused retry tests pass.

### 3. Full Tests

```bash
cd packages/beastcli
bun test --timeout 30000
```

Expected before production:

- Full suite passes, or release notes explicitly document any quarantined tests with owner and fix date.

### 4. CLI Smoke

```bash
cd packages/beastcli
bun run --conditions=browser ./src/index.ts --help
bun run --conditions=browser ./src/index.ts models ollama --pure
bun run --conditions=browser ./src/index.ts run --pure --model ollama/gemma4:latest --format json 'Reply with exactly: BEASTCLI_RELEASE_OK'
```

Expected:

- Help prints BeastCLI logo and commands.
- Ollama model list includes `ollama/gemma4:latest`.
- Run command returns `BEASTCLI_RELEASE_OK`.

### 5. Tool Smoke

Use one prompt that forces a native tool call:

```bash
cd packages/beastcli
bun run --conditions=browser ./src/index.ts run --pure --model ollama/gemma4:latest --format json 'Use pandas_create with rows [{"name":"a","value":1},{"name":"b","value":2}], then reply with the row count only.'
```

Expected:

- Tool call completes.
- Final answer reports `2`.

### 6. TUI Smoke

```bash
cd packages/beastcli
bun run --conditions=browser ./src/index.ts --pure
```

Manual checks:

- Home screen renders the BeastCLI logo.
- Prompt accepts input.
- `ctrl+k` opens command palette.
- `ctrl+s` opens session switcher.
- `ctrl+o` opens model selector.
- `ctrl+t` opens theme selector.
- `ctrl+l` opens status view.
- `ctrl+h` opens help.
- Command palette uses compact rows.
- Session list uses compact rows.
- `/help` opens expanded help.
- `/undo` and `/redo` still register.

### 7. Build and Package

```bash
cd packages/beastcli
bun run build
./bin/beast --help
./bin/beast models ollama --pure
```

Expected:

- Build succeeds.
- Built binary boots and can list Ollama models.

### 8. Release Artifacts

Verify:

- `package.json` name/version/bin are correct.
- `bun.lock` includes BeastCLI alias dependencies intentionally.
- GitHub workflows reference BeastCLI names and package paths.
- Nix files reference BeastCLI names.
- Install script points to BeastCLI artifacts.
- README/install/package metadata match BeastCLI.

## Risk Register

| Risk                             | Severity | Current Mitigation                | Required Before Release                                        |
| -------------------------------- | -------- | --------------------------------- | -------------------------------------------------------------- |
| Full test suite failures         | High     | Typecheck and focused tests pass  | Fix or quarantine failures                                     |
| Dirty migration diff             | High     | Manual review ongoing             | Clean release diff and commit plan                             |
| SQLite WAL parallel startup race | Medium   | Single command rerun passes       | Add startup DB lock or document unsupported parallel migration |
| Optional Poe auth dependency     | Medium   | Lazy optional import with warning | Decide production support stance                               |
| Rebrand leftovers                | Medium   | Many files migrated               | Repo fully uses BeastCLI branding                             |
| Packaging unknowns               | High     | CLI dev path works                | Build/install smoke from clean profile                         |
| Cross-platform behavior          | Medium   | macOS local validation only       | Test macOS, Linux, and Windows/WSL if supported                |

## Rebrand Audit Commands

Run before release:

```bash
rg -n "opencode|OpenCode|OPENCODE|oc-theme|sst-dev.opencode|opencode-ai" .
rg -n "beastcli|BeastCLI|BEASTCLI|beast" packages/beastcli README.md package.json .github install nix
```

Expected: no OpenCode/opencode references remain (except legitimate npm package dependencies). BeastCLI references are consistent.

## Release Candidate Definition of Done

A release candidate can be cut when:

- `packages/beastcli` typecheck passes.
- Full package test suite is green or explicitly triaged.
- Build succeeds.
- Built `beast` binary passes CLI/Ollama/tool/TUI smoke.
- Release diff is reviewed and intentionally scoped.
- Database startup race is fixed or accepted with documented constraints.
- README/install/package metadata match BeastCLI.
- Clean install smoke passes on a disposable environment.

## Final Production Go/No-Go

Production release is approved only when:

- All release candidate criteria are complete.
- Release artifacts are generated and checksummed.
- Rollback plan exists.
- Version tag and changelog are prepared.
- Post-release smoke checklist has an owner.

## Rollback Plan

If production release fails:

1. Stop publishing/install distribution for the bad version.
2. Restore the previous known-good release artifact.
3. Pin install script to previous version.
4. Publish a short incident note with affected version and workaround.
5. Create a patch branch from `dev`, apply fix, rerun this checklist.

## Post-Release Smoke

Run immediately after publishing:

```bash
beast --version
beast --help
beast models ollama --pure
beast run --pure --model ollama/gemma4:latest --format json 'Reply with exactly: POST_RELEASE_OK'
```

Expected:

- Installed production binary boots.
- Logo and command name are BeastCLI.
- Ollama model discovery works.
- Prompt execution returns `POST_RELEASE_OK`.
