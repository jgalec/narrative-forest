import { drizzle } from "drizzle-orm/sqlite-proxy"
import { SQLocalDrizzle } from "sqlocal/drizzle"

import * as schema from "@/database/schema"

export const DATABASE_FILE = "narrative-forest.sqlite3"

export async function createDatabaseClient(databasePath = DATABASE_FILE) {
  let markConnected: () => void
  const connected = new Promise<void>((resolve) => {
    markConnected = resolve
  })
  const client = new SQLocalDrizzle({
    databasePath,
    onInit: (sql) => [sql`PRAGMA foreign_keys = ON`],
    onConnect: () => markConnected(),
  })

  await connected

  return {
    client,
    db: drizzle(client.driver, client.batchDriver, { schema }),
  }
}
