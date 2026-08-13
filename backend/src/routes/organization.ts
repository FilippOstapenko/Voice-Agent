import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

const ORG_ID = "org_demo"; // single-tenant stub until auth lands (later phase)

export default async function organizationRoutes(app: FastifyInstance) {
  app.get("/api/organization", async (_req, reply) => {
    const org = await prisma.organization.findUnique({
      where: { id: ORG_ID },
      include: { agent: true },
    });
    if (!org) return reply.code(404).send({ error: "Organisatie niet gevonden — is de seed gedraaid?" });
    return org;
  });

  app.patch<{ Body: { name?: string; website?: string } }>(
    "/api/organization",
    async (req) => {
      const { name, website } = req.body ?? {};
      return prisma.organization.update({
        where: { id: ORG_ID },
        data: { ...(name !== undefined && { name }), ...(website !== undefined && { website }) },
      });
    }
  );
}

export { ORG_ID };
