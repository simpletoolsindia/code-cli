#!/usr/bin/env bun
import { $ } from "bun"

import { Script } from "@beastcli/script"
import { copyBinaryToSidecarFolder, getCurrentSidecar, windowsify } from "./utils"

const pkg = await Bun.file("./package.json").json()
pkg.version = Script.version
await Bun.write("./package.json", JSON.stringify(pkg, null, 2) + "\n")
console.log(`Updated package.json version to ${Script.version}`)

const sidecarConfig = getCurrentSidecar()
const artifact = process.env.BEAST_CLI_ARTIFACT ?? "beastcli-cli"

const dir = "src-tauri/target/beastcli-binaries"

await $`mkdir -p ${dir}`
await $`gh run download ${process.env.GITHUB_RUN_ID} -n ${artifact}`.cwd(dir)

await copyBinaryToSidecarFolder(windowsify(`${dir}/${sidecarConfig.ocBinary}/bin/beastcli`))
