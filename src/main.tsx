import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "@/App"
import "@/index.css"

if (import.meta.env.DEV && window.location.pathname === "/database-proof") {
  const { verifyPersistenceAfterReopen } = await import("@/database/proof")
  const passed = await verifyPersistenceAfterReopen("narrative-forest-browser-persistence-proof.sqlite3")

  document.body.innerHTML = `<main><h1>Browser SQLite persistence proof</h1><p>${passed ? "passed" : "failed"}</p></main>`
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
