import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import organizationRoutes from "./routes/organization.js";
import agentRoutes from "./routes/agent.js";
import conversationRoutes from "./routes/conversations.js";
import billingRoutes from "./routes/billing.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true }); // dev: allow the Vite origin

app.get("/health", async () => ({ status: "ok", service: "voice-agent-backend" }));

await app.register(organizationRoutes);
await app.register(agentRoutes);
await app.register(conversationRoutes);
await app.register(billingRoutes);

const port = Number(process.env.PORT ?? 3000);
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`backend listening on :${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
