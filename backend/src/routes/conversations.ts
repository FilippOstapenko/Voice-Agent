import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { ORG_ID } from "./organization.js";

const toApiChannel = (c: string) => c.toLowerCase();

export default async function conversationRoutes(app: FastifyInstance) {
  app.get("/api/conversations", async () => {
    const items = await prisma.conversation.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 1, where: { role: "CALLER" } } },
    });
    return items.map((c: any) => ({
      id: c.id,
      channel: toApiChannel(c.channel),
      contact: c.contact,
      preview: c.messages[0]?.text ?? c.summary,
      createdAt: c.createdAt,
    }));
  });

  app.get<{ Params: { id: string } }>("/api/conversations/:id", async (req, reply) => {
    const c = await prisma.conversation.findFirst({
      where: { id: req.params.id, organizationId: ORG_ID },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        actions: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!c) return reply.code(404).send({ error: "Gesprek niet gevonden" });
    return {
      id: c.id,
      channel: toApiChannel(c.channel),
      contact: c.contact,
      summary: c.summary,
      createdAt: c.createdAt,
      transcript: c.messages.map((m: any) => ({
        from: m.role === "AI" ? "ai" : "caller",
        text: m.text,
      })),
      actions: c.actions.map((a: any) => ({ type: a.type, detail: a.detail })),
    };
  });
}
