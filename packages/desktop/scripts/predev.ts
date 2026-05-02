import { $ } from "bun"

import { copyBinaryToSidecarFolder, getCurrentSidecar, windowsify } from "./utils"

const RUST_TARGET = Bun.env.TAURI_ENV_TARGET_TRIPLE

const sidecarConfig = getCurrentSidecar(RUST_TARGET)

const binaryPath = windowsify(`../beastcli/dist/${sidecarConfig.ocBinary}/bin/beastcli`)

await (sidecarConfig.ocBinary.includes("-baseline")
  ? $`cd ../beastcli && bun run build --single --baseline`
  : $`cd ../beastcli && bun run build --single`)

await copyBinaryToSidecarFolder(binaryPath, RUST_TARGET)
