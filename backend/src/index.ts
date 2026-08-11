import "dotenv/config";
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok", service: "voice-agent-backend" }));

const port = Number(process.env.PORT ?? 3000);
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`backend listening on :${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
