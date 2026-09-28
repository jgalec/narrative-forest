import type { SQLocalDrizzle } from "sqlocal/drizzle"

const MIGRATIONS_TABLE = "__narrative_forest_migrations"

type Migration = {
  id: string
  statements: readonly string[]
}

// Phase 1.4 adds the first immutable domain migration.
const migrations: readonly Migration[] = []

export async function applyMigrations(client: Pick<SQLocalDrizzle, "sql" | "transaction">) {
  await client.sql(`CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" ("id" TEXT PRIMARY KEY NOT NULL)`)

  await client.transaction(async ({ sql }) => {
    for (const migration of migrations) {
      const applied = await sql<{ id: string }>(
        `SELECT "id" FROM "${MIGRATIONS_TABLE}" WHERE "id" = ?`,
        migration.id,
      )

      if (applied.length > 0) continue

      for (const statement of migration.statements) {
        await sql(statement)
      }

      await sql(`INSERT INTO "${MIGRATIONS_TABLE}" ("id") VALUES (?)`, migration.id)
    }
  })
}
