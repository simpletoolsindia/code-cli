import { $ } from "bun"

await $`bun ./scripts/copy-icons.ts ${process.env.BEAST_CHANNEL ?? "dev"}`

await $`cd ../beastcli && bun script/build-node.ts`
