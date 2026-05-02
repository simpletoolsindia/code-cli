declare global {
  const BEAST_VERSION: string
  const BEAST_CHANNEL: string
}

export const InstallationVersion = typeof BEAST_VERSION === "string" ? BEAST_VERSION : "local"
export const InstallationChannel = typeof BEAST_CHANNEL === "string" ? BEAST_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
