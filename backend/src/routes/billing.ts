import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { ORG_ID } from "./organization.js";

const usageLabel: Record<string, string> = {
  PHONE: "Belminuten",
  WHATSAPP: "WhatsApp-gesprekken",
  CHAT: "Chatgesprekken",
  VOICE: "Voice-demo's",
};

export default async function billingRoutes(app: FastifyInstance) {
  app.get("/api/billing", async (_req, reply) => {
    const month = new Date().toISOString().slice(0, 7);
    const [subscription, usages] = await Promise.all([
      prisma.subscription.findUnique({ where: { organizationId: ORG_ID } }),
      prisma.usage.findMany({ where: { organizationId: ORG_ID, month } }),
    ]);
    if (!subscription) return reply.code(404).send({ error: "Geen abonnement gevonden" });
    return {
      plan: subscription.plan,
      status: subscription.status,
      pricePerMonth: subscription.pricePerMonth,
      usage: usages.map((u: any) => ({
        label: usageLabel[u.channel] ?? u.channel,
        used: u.used,
        quota: u.quota,
      })),
    };
  });
}
