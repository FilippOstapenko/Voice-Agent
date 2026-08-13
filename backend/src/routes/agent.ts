import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { ORG_ID } from "./organization.js";

export default async function agentRoutes(app: FastifyInstance) {
  app.get("/api/agent", async (_req, reply) => {
    const agent = await prisma.agent.findUnique({ where: { organizationId: ORG_ID } });
    if (!agent) return reply.code(404).send({ error: "Agent niet gevonden" });
    return agent;
  });

  app.patch<{ Body: { prompt?: string; knowledge?: string } }>("/api/agent", async (req) => {
    const { prompt, knowledge } = req.body ?? {};
    return prisma.agent.update({
      where: { organizationId: ORG_ID },
      data: {
        ...(prompt !== undefined && { prompt }),
        ...(knowledge !== undefined && { knowledge }),
      },
    });
  });

  // Stores the website and creates a knowledge stub.
  // Real website-crawling + AI knowledge generation lands in a later phase.
  app.post<{ Body: { website: string } }>("/api/agent/generate-knowledge", async (req, reply) => {
    const { website } = req.body ?? {};
    if (!website) return reply.code(400).send({ error: "website is verplicht" });

    await prisma.organization.update({ where: { id: ORG_ID }, data: { website } });
    return prisma.agent.update({
      where: { organizationId: ORG_ID },
      data: {
        knowledge: `Kennisbasis gegenereerd op basis van ${website} (placeholder — echte generatie volgt in een latere fase).`,
      },
    });
  });
}
