export * from "./client.js"
export * from "./server.js"

import { createBeastcliClient } from "./client.js"
import { createBeastcliServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export * as data from "./data.js"

export async function createBeastcli(options?: ServerOptions) {
  const server = await createBeastcliServer({
    ...options,
  })

  const client = createBeastcliClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
