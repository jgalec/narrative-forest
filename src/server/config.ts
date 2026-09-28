export type ServerConfig = {
  clientOrigin: string
  port: number
  providerApiKey?: string
}

export class ServerConfigError extends Error {}

export function loadServerConfig(environment: NodeJS.ProcessEnv): ServerConfig {
  const port = Number(environment.PORT ?? 8787)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ServerConfigError("PORT must be an integer between 1 and 65535")
  }

  const configuredOrigin = environment.CLIENT_ORIGIN ?? "http://localhost:5173"
  let clientOrigin: string

  try {
    const url = new URL(configuredOrigin)

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new ServerConfigError("CLIENT_ORIGIN must use http or https")
    }

    clientOrigin = url.origin
  } catch {
    throw new ServerConfigError("CLIENT_ORIGIN must be a valid URL")
  }

  const providerApiKey = environment.PROVIDER_API_KEY?.trim()

  if (environment.PROVIDER_API_KEY !== undefined && !providerApiKey) {
    throw new ServerConfigError("PROVIDER_API_KEY must not be empty")
  }

  return { clientOrigin, port, providerApiKey }
}
