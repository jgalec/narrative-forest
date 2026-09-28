import type { SQLocalDrizzle } from "sqlocal/drizzle"

const MIGRATIONS_TABLE = "__narrative_forest_migrations"

type Migration = {
  id: string
  statements: readonly string[]
}

const migrations: readonly Migration[] = [
  {
    id: "202609280001_initial_domain_schema",
    statements: [
      `CREATE TABLE "workspaces" ("id" TEXT PRIMARY KEY NOT NULL, "title" TEXT NOT NULL, "metadata_json" TEXT NOT NULL, "created_at" INTEGER NOT NULL, "updated_at" INTEGER NOT NULL)`,
      `CREATE TABLE "nodes" ("id" TEXT PRIMARY KEY NOT NULL, "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE, "kind" TEXT NOT NULL CHECK ("kind" IN ('chat', 'content')), "user_identifier" TEXT, "markdown" TEXT NOT NULL, "metadata_json" TEXT NOT NULL, "created_at" INTEGER NOT NULL, "updated_at" INTEGER NOT NULL, UNIQUE ("id", "workspace_id"))`,
      `CREATE INDEX "nodes_workspace_id_idx" ON "nodes" ("workspace_id")`,
      `CREATE TABLE "branches" ("id" TEXT PRIMARY KEY NOT NULL, "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE, "source_node_id" TEXT NOT NULL, "target_node_id" TEXT NOT NULL, "user_identifier" TEXT, "label" TEXT, "metadata_json" TEXT NOT NULL, "created_at" INTEGER NOT NULL, "updated_at" INTEGER NOT NULL, FOREIGN KEY ("source_node_id", "workspace_id") REFERENCES "nodes"("id", "workspace_id") ON DELETE CASCADE, FOREIGN KEY ("target_node_id", "workspace_id") REFERENCES "nodes"("id", "workspace_id") ON DELETE CASCADE)`,
      `CREATE INDEX "branches_workspace_id_idx" ON "branches" ("workspace_id")`,
      `CREATE INDEX "branches_source_node_id_idx" ON "branches" ("source_node_id")`,
      `CREATE INDEX "branches_target_node_id_idx" ON "branches" ("target_node_id")`,
      `CREATE TABLE "messages" ("id" TEXT PRIMARY KEY NOT NULL, "node_id" TEXT NOT NULL REFERENCES "nodes"("id") ON DELETE CASCADE, "role" TEXT NOT NULL CHECK ("role" IN ('user', 'assistant', 'system')), "content" TEXT NOT NULL, "created_at" INTEGER NOT NULL, UNIQUE ("id", "node_id"))`,
      `CREATE INDEX "messages_node_id_created_at_idx" ON "messages" ("node_id", "created_at")`,
      `CREATE TABLE "node_summaries" ("id" TEXT PRIMARY KEY NOT NULL, "node_id" TEXT NOT NULL REFERENCES "nodes"("id") ON DELETE CASCADE, "category" TEXT NOT NULL, "content" TEXT NOT NULL, "is_stale" INTEGER NOT NULL CHECK ("is_stale" IN (0, 1)), "generated_at" INTEGER, "created_at" INTEGER NOT NULL, "updated_at" INTEGER NOT NULL)`,
      `CREATE INDEX "node_summaries_node_id_idx" ON "node_summaries" ("node_id")`,
      `CREATE TABLE "branch_summaries" ("id" TEXT PRIMARY KEY NOT NULL, "branch_id" TEXT NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE, "content" TEXT NOT NULL, "is_stale" INTEGER NOT NULL CHECK ("is_stale" IN (0, 1)), "generated_at" INTEGER, "created_at" INTEGER NOT NULL, "updated_at" INTEGER NOT NULL)`,
      `CREATE INDEX "branch_summaries_branch_id_idx" ON "branch_summaries" ("branch_id")`,
      `CREATE TABLE "node_references" ("id" TEXT PRIMARY KEY NOT NULL, "node_id" TEXT NOT NULL REFERENCES "nodes"("id") ON DELETE CASCADE, "target_kind" TEXT NOT NULL CHECK ("target_kind" IN ('node', 'branch')), "target_id" TEXT NOT NULL, "summary_scope" TEXT NOT NULL, "created_at" INTEGER NOT NULL)`,
      `CREATE INDEX "node_references_node_id_idx" ON "node_references" ("node_id")`,
      `CREATE TABLE "branch_references" ("id" TEXT PRIMARY KEY NOT NULL, "branch_id" TEXT NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE, "target_kind" TEXT NOT NULL CHECK ("target_kind" IN ('node', 'branch')), "target_id" TEXT NOT NULL, "summary_scope" TEXT NOT NULL, "created_at" INTEGER NOT NULL)`,
      `CREATE INDEX "branch_references_branch_id_idx" ON "branch_references" ("branch_id")`,
      `CREATE TABLE "message_references" ("id" TEXT PRIMARY KEY NOT NULL, "node_id" TEXT NOT NULL REFERENCES "nodes"("id") ON DELETE CASCADE, "message_id" TEXT NOT NULL, "created_at" INTEGER NOT NULL, FOREIGN KEY ("message_id", "node_id") REFERENCES "messages"("id", "node_id") ON DELETE CASCADE)`,
      `CREATE INDEX "message_references_node_id_idx" ON "message_references" ("node_id")`,
    ],
  },
]

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
