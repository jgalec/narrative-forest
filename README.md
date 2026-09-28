# Narrative Forest

Narrative Forest is a visual canvas for developing long-form narratives through independent LLM conversations. It combines spatially organized nodes, per-node chat and memory, Markdown documents, and relationship summaries without implicit context sharing.

A local application foundation is available. It includes a Vite React client, a Hono server process, shadcn/ui initialization, and Vitest smoke tests. It does not yet include persistence, domain entities, provider integration, or canvas interactions.

## Local Development

Prerequisites: Node.js 22.12 or later and `pnpm`.

```bash
pnpm install
```

Start the processes in separate terminals:

```bash
pnpm dev:client
```

```bash
pnpm dev:server
```

`pnpm dev:client` starts the Vite client at `http://localhost:5173`. `pnpm dev:server` starts the Hono server at `http://localhost:8787`; it currently exposes `GET /health`, which returns `{"status":"ok"}`.

During development, Vite proxies `/api` requests to Hono. `POST /api/proxy` validates a JSON object and returns controlled errors until a provider adapter is configured; this scaffold does not select or call a provider.

## Validation

```bash
pnpm test
pnpm build
```

`pnpm test` runs the frontend render smoke test and the in-memory Hono route test. `pnpm build` type-checks the client and server before building the Vite client.

## Approved Technical Direction

- React, shadcn/ui, and Vite provide the browser interface.
- `pnpm` is the package manager.
- Hono runs locally alongside Vite as a stateless proxy for LLM requests; it does not persist narrative data.
- Drizzle ORM persists application data in a local SQLite database on the user's device.
- The MVP is single-user and local-only, with no authentication.
- The backend calls an OpenAI-compatible API. Provider credentials remain in server environment configuration and are never stored in the database or exposed to the browser.
