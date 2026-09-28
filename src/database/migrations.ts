import type { SQLocalDrizzle } from "sqlocal/drizzle"

const MIGRATIONS_TABLE = "__narrative_forest_migrations"
export const PERSISTENCE_PROBE_TABLE = "__narrative_forest_persistence_probe"

const migrations = [
  {
    id: "202609280001_browser_sqlite_baseline",
    statements: [
      `CREATE TABLE "${PERSISTENCE_PROBE_TABLE}" ("id" INTEGER PRIMARY KEY CHECK ("id" = 1), "value" TEXT NOT NULL)`,
    ],
  },
] as const

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
