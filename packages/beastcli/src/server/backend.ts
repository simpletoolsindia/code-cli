import { Flag } from "@simpletoolsindia/core/flag/flag"
import { InstallationChannel, InstallationVersion } from "@simpletoolsindia/core/installation/version"

export type Backend = "effect-httpapi" | "hono"

export type Selection = {
  backend: Backend
  reason: "env" | "stable" | "explicit"
}

export type Attributes = ReturnType<typeof attributes>

export function select(): Selection {
  if (Flag.BEAST_EXPERIMENTAL_HTTPAPI) return { backend: "effect-httpapi", reason: "env" }
  return { backend: "hono", reason: "stable" }
}

export function attributes(selection: Selection): Record<string, string> {
  return {
    "beastcli.server.backend": selection.backend,
    "beastcli.server.backend.reason": selection.reason,
    "beastcli.installation.channel": InstallationChannel,
    "beastcli.installation.version": InstallationVersion,
  }
}

export function force(selection: Selection, backend: Backend): Selection {
  return {
    backend,
    reason: selection.backend === backend ? selection.reason : "explicit",
  }
}
