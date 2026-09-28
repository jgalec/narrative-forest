import { serve } from "@hono/node-server"

import { createApp } from "./app.js"
import { loadServerConfig } from "./config.js"

const config = loadServerConfig(process.env)
const app = createApp({ clientOrigin: config.clientOrigin })

serve({ fetch: app.fetch, port: config.port })
