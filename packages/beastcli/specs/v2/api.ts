// @ts-nocheck

import { BeastCLI } from "@beastcli/core"
import { ReadTool } from "@beastcli/core/tools"

const beastcli = BeastCLI.make({})

beastcli.tool.add(ReadTool)

beastcli.tool.add({
  name: "bash",
  schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to run.",
      },
    },
    required: ["command"],
  },
  execute(input, ctx) {},
})

beastcli.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

beastcli.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await beastcli.session.create({
  agent: "build",
})

beastcli.subscribe((event) => {
  console.log(event)
})

await beastcli.session.prompt({
  sessionID,
  text: "hey what is up",
})

await beastcli.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await beastcli.session.wait()

console.log(await beastcli.session.messages(sessionID))
