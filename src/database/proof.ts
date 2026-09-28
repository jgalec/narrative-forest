import { createDatabaseClient, DATABASE_FILE } from "@/database/client"
import { applyMigrations, PERSISTENCE_PROBE_TABLE } from "@/database/migrations"

export async function verifyPersistenceAfterReopen(databasePath = DATABASE_FILE) {
  const initial = await createDatabaseClient(databasePath)
  const marker = "persistence-proof"

  try {
    await applyMigrations(initial.client)
    await initial.client.sql(
      `INSERT INTO "${PERSISTENCE_PROBE_TABLE}" ("id", "value") VALUES (1, ?) ON CONFLICT("id") DO UPDATE SET "value" = excluded."value"`,
      marker,
    )
  } finally {
    await initial.client.destroy()
  }

  const reopened = await createDatabaseClient(databasePath)

  try {
    await applyMigrations(reopened.client)
    const rows = await reopened.client.sql<{ value: string }>(
      `SELECT "value" FROM "${PERSISTENCE_PROBE_TABLE}" WHERE "id" = 1`,
    )

    return rows[0]?.value === marker
  } finally {
    await reopened.client.destroy()
  }
}
