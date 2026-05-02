const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://beastcli.ai" : `https://${stage}.beastcli.ai`,
  console: stage === "production" ? "https://beastcli.ai/auth" : `https://${stage}.beastcli.ai/auth`,
  email: "contact@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/simpletoolsindia/code-cli",
  discord: "https://beastcli.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}
