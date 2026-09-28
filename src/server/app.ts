import { Hono } from "hono"
import { cors } from "hono/cors"

import type { ProxyAdapter, ProxyPayload } from "./proxy.js"

type AppOptions = {
  adapter?: ProxyAdapter
  clientOrigin?: string
}

function isJsonObject(value: unknown): value is ProxyPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function error(code: string, message: string) {
  return { error: { code, message } }
}

export function createApp({ adapter, clientOrigin = "http://localhost:5173" }: AppOptions = {}) {
  const app = new Hono()

  app.use(
    "/api/*",
    cors({
      allowHeaders: ["Content-Type"],
      allowMethods: ["POST"],
      origin: clientOrigin,
    }),
  )

  app.get("/health", (context) => context.json({ status: "ok" }))

  app.post("/api/proxy", async (context) => {
    if (!context.req.header("content-type")?.includes("application/json")) {
      return context.json(error("invalid_request", "Content-Type must be application/json"), 415)
    }

    const payload = await context.req.json().catch(() => undefined)

    if (!isJsonObject(payload)) {
      return context.json(error("invalid_request", "Request body must be a JSON object"), 400)
    }

    if (!adapter) {
      return context.json(error("provider_unavailable", "No provider adapter is configured"), 503)
    }

    try {
      return new Response(JSON.stringify(await adapter.forward(payload)), {
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      return context.json(error("provider_error", "The provider request failed"), 502)
    }
  })

  return app
}

export const app = createApp()
