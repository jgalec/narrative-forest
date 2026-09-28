import { describe, expect, it } from "vitest"

import { loadServerConfig, ServerConfigError } from "./config.js"

describe("loadServerConfig", () => {
  it("loads server-only provider configuration", () => {
    const config = loadServerConfig({
      CLIENT_ORIGIN: "http://localhost:5173",
      PORT: "8788",
      PROVIDER_API_KEY: "server-only-key",
    })

    expect(config).toEqual({
      clientOrigin: "http://localhost:5173",
      port: 8788,
      providerApiKey: "server-only-key",
    })
  })

  it("rejects invalid server configuration", () => {
    expect(() => loadServerConfig({ PORT: "invalid" })).toThrow(ServerConfigError)
    expect(() => loadServerConfig({ CLIENT_ORIGIN: "not-a-url" })).toThrow(ServerConfigError)
    expect(() => loadServerConfig({ CLIENT_ORIGIN: "file:///workspace" })).toThrow(ServerConfigError)
    expect(() => loadServerConfig({ PROVIDER_API_KEY: "  " })).toThrow(ServerConfigError)
  })
})
