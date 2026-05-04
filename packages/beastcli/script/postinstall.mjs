#!/usr/bin/env node
import fs from "fs"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"
import { createRequire } from "module"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

function detectPlatformAndArch() {
  const platformMap = { darwin: "darwin", linux: "linux", win32: "windows" }
  const archMap = { x64: "x64", arm64: "arm64", arm: "arm" }
  return {
    platform: platformMap[os.platform()] || os.platform(),
    arch: archMap[os.arch()] || os.arch(),
  }
}

function findBinary() {
  const { platform, arch } = detectPlatformAndArch()
  const packageName = `@simpletoolsindia/beast-cli-${platform}-${arch}`
  const binaryName = "beastcli"

  // Try multiple resolution strategies for npm hoisting
  const searchPaths = [
    // npm global: binary installed directly
    path.join(__dirname, "node_modules", packageName),
    // npm global hoisted
    path.join(__dirname, "..", packageName),
    // pnpm / nested
    path.join(__dirname, "..", "..", packageName),
    // Global npm root
    path.join(require.resolve.paths(".")[0] || "", packageName),
  ]

  for (const packageDir of searchPaths) {
    const binaryPath = path.join(packageDir, "bin", binaryName)
    if (fs.existsSync(binaryPath)) {
      return { binaryPath, binaryName, packageDir }
    }
  }

  throw new Error(`Could not find package ${packageName}. Searched: ${searchPaths.join(", ")}`)
}

async function main() {
  try {
    if (os.platform() === "win32") {
      console.log("Windows detected: binary setup not needed (using packaged .exe)")
      return
    }

    const { binaryPath } = findBinary()
    const target = path.join(__dirname, "bin", ".beastcli")
    if (fs.existsSync(target)) fs.unlinkSync(target)
    try {
      fs.linkSync(binaryPath, target)
    } catch {
      fs.copyFileSync(binaryPath, target)
    }
    fs.chmodSync(target, 0o755)
    console.log("BeastCLI binary set up successfully")
  } catch (error) {
    console.error("Failed to setup beastcli binary:", error.message)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error("Postinstall error:", e.message)
  process.exit(0)
})
