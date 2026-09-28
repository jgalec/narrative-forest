import { describe, expect, it } from "vitest"

import { app } from "./app.js"

describe("app", () => {
  it("responds to the health route without a network listener", async () => {
    const response = await app.request("http://localhost/health")

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: "ok" })
  })
})
