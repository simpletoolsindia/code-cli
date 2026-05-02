# Installation Issues RCA: pnpm catalog: References

**Date:** 2026-05-02
**Issue:** Unable to install dependencies - 63 `catalog:` URL protocol references across workspace packages

---

## Error Summary

```
ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC
No catalog entry '@typescript/native-preview' was found for catalog 'default'.
```

---

## Root Cause Analysis

### The Problem

The entire repository uses **pnpm's `catalog:` URL protocol** for centralized dependency versioning. There are **63 references** across workspace packages that need to be resolved.

### Catalog Entries in Root package.json

The root `package.json` defines the catalog versions:

```json
"catalog": {
  "@effect/opentelemetry": "4.0.0-beta.57",
  "@effect/platform-node": "4.0.0-beta.57",
  "@npmcli/arborist": "9.4.0",
  "@types/bun": "1.3.12",
  "@types/cross-spawn": "6.0.6",
  "@octokit/rest": "22.0.0",
  "@hono/zod-validator": "0.4.2",
  "@opentui/core": "0.2.0",
  "@opentui/solid": "0.2.0",
  "ulid": "3.0.1",
  "@kobalte/core": "0.13.11",
  "@types/luxon": "3.7.1",
  "@types/node": "22.13.9",
  "@types/semver": "7.7.1",
  "@tsconfig/node22": "22.0.2",
  "@tsconfig/bun": "1.0.9",
  "@cloudflare/workers-types": "4.20251008.0",
  "@openauthjs/openauth": "0.0.0-20250322224806",
  "@pierre/diffs": "1.1.0-beta.18",
  "opentui-spinner": "0.0.6",
  "@solid-primitives/storage": "4.3.3",
  "@tailwindcss/vite": "4.1.11",
  "diff": "8.0.2",
  "dompurify": "3.3.1",
  "drizzle-kit": "1.0.0-beta.19-d95b7a4",
  "drizzle-orm": "1.0.0-beta.19-d95b7a4",
  "effect": "4.0.0-beta.57",
  "ai": "6.0.168",
  "cross-spawn": "7.0.6",
  "hono": "4.10.7",
  "hono-openapi": "1.1.2",
  "fuzzysort": "3.1.0",
  "luxon": "3.6.1",
  "marked": "17.0.1",
  "marked-shiki": "1.2.1",
  "remend": "1.3.0",
  "@playwright/test": "1.59.1",
  "semver": "7.7.4",
  "typescript": "5.8.2",
  "@typescript/native-preview": "7.0.0-dev.20251207.1",
  "zod": "4.1.8",
  "remeda": "2.26.0",
  "shiki": "3.20.0",
  "solid-list": "0.3.0",
  "tailwindcss": "4.1.11",
  "virtua": "0.42.3",
  "vite": "7.1.4",
  "@solidjs/meta": "0.29.4",
  "@solidjs/router": "0.15.4",
  "@solidjs/start": "https://pkg.pr.new/@solidjs/start@dfb2020",
  "@sentry/solid": "10.36.0",
  "@sentry/vite-plugin": "4.6.0",
  "solid-js": "1.9.10",
  "vite-plugin-solid": "2.11.10",
  "@lydell/node-pty": "1.2.0-beta.10"
}
```

---

## Affected Files (63 total catalog: references)

### packages/core/package.json
| Line | Reference |
|------|-----------|
| 47 | `drizzle-orm: "catalog:"` |

### packages/desktop-electron/package.json
| Line | Reference |
|------|-----------|
| 27 | `effect: "catalog:"` |
| 33 | `drizzle-orm: "catalog:"` |
| 38 | `@lydell/node-pty: "catalog:"` |
| 39 | `@sentry/solid: "catalog:"` |
| 40 | `@sentry/vite-plugin: "catalog:"` |
| 42 | `@solid-primitives/storage: "catalog:"` |
| 43 | `@solidjs/meta: "catalog:"` |
| 45 | `@types/bun: "catalog:"` |
| 46 | `@types/node: "catalog:"` |
| 47 | `@typescript/native-preview: "catalog:"` |
| 52 | `solid-js: "catalog:"` |
| 55 | `vite: "catalog:"` |

### packages/desktop/package.json
| Line | Reference |
|------|-----------|
| 16 | `@sentry/solid: "catalog:"` |
| 18 | `@solid-primitives/storage: "catalog:"` |
| 32 | `solid-js: "catalog:"` |
| 33 | `@solidjs/meta: "catalog:"` |
| 39 | `@sentry/vite-plugin: "catalog:"` |
| 41 | `@types/bun: "catalog:"` |
| 42 | `@typescript/native-preview: "catalog:"` |

(And more in other packages...)

---

## Solutions

### Option A: Install pnpm and use catalog (Recommended)

Since the project uses pnpm catalog feature, use pnpm:

```bash
npm install -g pnpm@9
cd /Users/sridhar/beastcli
pnpm install
```

### Option B: Replace all catalog: with actual versions

Use this script to replace all catalog: references:

```bash
#!/bin/bash
# Fix catalog: references in all package.json files

declare -A CATALOG=(
  ["effect"]="4.0.0-beta.57"
  ["drizzle-orm"]="1.0.0-beta.19-d95b7a4"
  ["@lydell/node-pty"]="1.2.0-beta.10"
  ["@sentry/solid"]="10.36.0"
  ["@sentry/vite-plugin"]="4.6.0"
  ["@solid-primitives/storage"]="4.3.3"
  ["@solidjs/meta"]="0.29.4"
  ["@types/bun"]="1.3.12"
  ["@types/node"]="22.13.9"
  ["@typescript/native-preview"]="7.0.0-dev.20251207.1"
  ["solid-js"]="1.9.10"
  ["vite"]="7.1.4"
  ["zod"]="4.1.8"
  # ... add more as needed
)

for pkg in packages/*/package.json; do
  for dep in "${!CATALOG[@]}"; do
    sed -i '' "s/\"$dep\": \"catalog:\"/\"$dep\": \"${CATALOG[$dep]}\"/g" "$pkg"
  done
done
```

### Option C: Use Bun with fixed package.json (Already Started)

Changes already made to root `package.json`:
- Removed `"packageManager": "bun@1.3.13"`
- Replaced `catalog:` with actual versions in devDependencies
- Replaced `catalog:` with actual versions in dependencies
- Replaced `catalog:` with actual versions in overrides
- Created `pnpm-workspace.yaml`

**Still needed:** Replace all 63 catalog: references in workspace packages.

---

## Additional Issues Found

### 1. Invalid package.json files
Some packages have invalid/incomplete package.json:
- `packages/console/*/` (multiple packages)
- `packages/containers/*/`
- `packages/docs/*/`
- `packages/extensions/*/`
- `packages/identity/*/`
- `packages/sdk/*/`

### 2. Workspace configuration mismatch
- Root package.json has `"packageManager": "bun@1.3.13"`
- But uses pnpm-specific `catalog:` syntax
- pnpm detects bun configuration and refuses to install

### 3. SDK workspace reference
- `@simpletoolsindia/sdk` referenced as `workspace:*`
- But actual package is in `packages/sdk/js/`
- Should be `workspace:js` or `workspace:packages/sdk/js`

---

## Verification Commands

```bash
# Check all catalog: references
grep -rn "catalog:" packages/*/package.json 2>/dev/null | wc -l

# Check for invalid package.json files
for pkg in packages/*/; do
  python3 -c "import json; json.load(open('$pkg/package.json'))" 2>/dev/null || echo "INVALID: $pkg"
done

# Check workspace packages
ls packages/*/package.json | wc -l
```

---

## Summary

| Issue | Count | Severity |
|-------|-------|----------|
| catalog: references in workspace | 63 | HIGH |
| Invalid package.json files | 6+ | MEDIUM |
| Workspace reference mismatch | 3 | MEDIUM |
| packageManager mismatch | 1 | HIGH |

**Recommended action:** Use pnpm as intended, or systematically replace all catalog: references with actual version numbers.
