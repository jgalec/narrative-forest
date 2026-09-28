import { describe, expect, it } from "vitest"

import { createApp } from "./app.js"

const jsonRequest = (body: unknown) => ({
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json" },
  method: "POST",
})

describe("app", () => {
  it("responds to the health route without a network listener", async () => {
    const app = createApp()
    const response = await app.request("http://localhost/health")

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: "ok" })
  })

  it("allows the local client origin for API preflight requests", async () => {
    const app = createApp()
    const response = await app.request("http://localhost/api/proxy", {
      headers: {
        "Access-Control-Request-Method": "POST",
        Origin: "http://localhost:5173",
      },
      method: "OPTIONS",
    })

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5173")
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST")
  })

  it("rejects invalid requests before reaching the adapter", async () => {
    const adapter = { forward: async () => ({ accepted: true }) }
    const app = createApp({ adapter })
    const response = await app.request("http://localhost/api/proxy", {
      body: "not-json",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: { code: "invalid_request", message: "Request body must be a JSON object" },
    })
  })

  it("returns a controlled error when no adapter is configured", async () => {
    const app = createApp()
    const response = await app.request("http://localhost/api/proxy", jsonRequest({ prompt: "test" }))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: { code: "provider_unavailable", message: "No provider adapter is configured" },
    })
  })

  it("forwards each request only to the injected adapter", async () => {
    const forwarded: unknown[] = []
    const app = createApp({
      adapter: {
        forward: async (payload) => {
          forwarded.push(payload)
          return { accepted: true }
        },
      },
    })

    const response = await app.request("http://localhost/api/proxy", jsonRequest({ prompt: "test" }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ accepted: true })
    expect(forwarded).toEqual([{ prompt: "test" }])
  })

  it("maps adapter failures without returning provider details", async () => {
    const app = createApp({
      adapter: {
        forward: async () => {
          throw new Error("provider-secret")
        },
      },
    })
    const response = await app.request("http://localhost/api/proxy", jsonRequest({ prompt: "test" }))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: { code: "provider_error", message: "The provider request failed" },
    })
  })
})
