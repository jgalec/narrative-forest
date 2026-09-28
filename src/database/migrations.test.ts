import { afterEach, describe, expect, it, vi } from "vitest"

import { createDatabaseClient } from "@/database/client"
import { applyMigrations, PERSISTENCE_PROBE_TABLE } from "@/database/migrations"

describe("applyMigrations", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("creates the baseline and records it only once", async () => {
    vi.stubGlobal("Worker", class Worker {})

    const { client } = await createDatabaseClient(":memory:")

    try {
      await applyMigrations(client)
      await applyMigrations(client)

      const tables = await client.sql<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        PERSISTENCE_PROBE_TABLE,
      )
      const migrations = await client.sql<{ count: number }>(
        'SELECT COUNT(*) AS "count" FROM "__narrative_forest_migrations"',
      )

      expect(tables).toHaveLength(1)
      expect(migrations[0]?.count).toBe(1)
    } finally {
      await client.destroy()
    }
  })
})
