import type { FastifyInstance } from "fastify";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { prisma } from "../db.js";
import { ORG_ID } from "./organization.js";
import { openai, CHAT_MODEL, buildSystemPrompt } from "../lib/openai.js";

const MAX_MESSAGE_LENGTH = 2000;
const HISTORY_LIMIT = 40; // keep the prompt (and the bill) bounded on long chats

export default async function chatRoutes(app: FastifyInstance) {
  /**
   * The chat channel of the AI core.
   * First call (no conversationId) opens a CHAT conversation; every later call
   * continues it. The visitor's message and the AI reply are both persisted, so the
   * dashboard inbox shows the same transcript the visitor sees.
   */
  app.post<{ Body: { conversationId?: string; message?: string } }>(
    "/api/chat",
    async (req, reply) => {
      const message = req.body?.message?.trim();
      if (!message) return reply.code(400).send({ error: "message is verplicht" });
      if (message.length > MAX_MESSAGE_LENGTH) {
        return reply.code(400).send({ error: "Bericht is te lang" });
      }

      const org = await prisma.organization.findUnique({
        where: { id: ORG_ID },
        include: { agent: true },
      });
      if (!org) {
        return reply.code(404).send({ error: "Organisatie niet gevonden — is de seed gedraaid?" });
      }

      // Continue an existing chat, or start one. Scoped to the org so a guessed id
      // from another tenant can never be continued (multi-tenant from day one).
      let conversation = req.body?.conversationId
        ? await prisma.conversation.findFirst({
            where: { id: req.body.conversationId, organizationId: ORG_ID, channel: "CHAT" },
          })
        : null;

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { organizationId: ORG_ID, channel: "CHAT", contact: "Bezoeker website" },
        });
        await countChatTowardsUsage();
      }

      // Persist the visitor's message before calling OpenAI: if the API call fails we
      // still have what the visitor asked, instead of a silently lost lead.
      await prisma.message.create({
        data: { conversationId: conversation.id, role: "CALLER", text: message },
      });

      const history = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: HISTORY_LIMIT,
      });

      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: buildSystemPrompt({
            organizationName: org.name,
            prompt: org.agent?.prompt ?? "",
            knowledge: org.agent?.knowledge ?? "",
          }),
        },
        // `any` here for the same reason as the other routes: the generated Prisma
        // client types are not in the repo, so the row type is not inferable at build time.
        ...history.map((m: any): ChatCompletionMessageParam => ({
          role: m.role === "AI" ? "assistant" : "user",
          content: m.text,
        })),
      ];

      let answer: string;
      try {
        const completion = await openai().chat.completions.create({
          model: CHAT_MODEL,
          messages,
          temperature: 0.3, // receptionist, not a poet — keep facts stable
          max_tokens: 300,
        });
        answer = completion.choices[0]?.message?.content?.trim() ?? "";
      } catch (err) {
        req.log.error({ err }, "openai chat completion failed");
        return reply.code(502).send({
          error: "De AI is even niet bereikbaar. Probeer het zo nog eens.",
          conversationId: conversation.id,
        });
      }

      if (!answer) answer = "Sorry, daar kan ik nu geen antwoord op geven. Zal ik iemand laten terugbellen?";

      await prisma.message.create({
        data: { conversationId: conversation.id, role: "AI", text: answer },
      });

      // Refresh the inbox summary after every exchange so a visitor who closes the tab
      // mid-chat still leaves a readable conversation behind.
      await updateSummary(conversation.id, [...history, { role: "AI", text: answer }]);

      return { conversationId: conversation.id, reply: answer };
    }
  );
}

/** Counts one chat conversation against this month's CHAT bundle (shown in Billing). */
async function countChatTowardsUsage() {
  const month = new Date().toISOString().slice(0, 7);
  await prisma.usage.upsert({
    where: {
      organizationId_channel_month: { organizationId: ORG_ID, channel: "CHAT", month },
    },
    update: { used: { increment: 1 } },
    create: { organizationId: ORG_ID, channel: "CHAT", month, quota: 500, used: 1 },
  });
}

/**
 * One Dutch sentence describing the conversation, written by the same model.
 * Failures are swallowed: a missing summary must never break the visitor's chat.
 */
async function updateSummary(
  conversationId: string,
  transcript: { role: string; text: string }[]
) {
  const lines = transcript
    .map((m) => `${m.role === "AI" ? "Assistent" : "Bezoeker"}: ${m.text}`)
    .join("\n");

  try {
    const completion = await openai().chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Vat het gesprek samen in één zakelijke Nederlandse zin voor de inbox van de ondernemer. " +
            "Noem wat de bezoeker wilde en wat de assistent deed. Geen aanhalingstekens.",
        },
        { role: "user", content: lines },
      ],
      temperature: 0.2,
      max_tokens: 100,
    });
    const summary = completion.choices[0]?.message?.content?.trim();
    if (summary) {
      await prisma.conversation.update({ where: { id: conversationId }, data: { summary } });
    }
  } catch {
    // non-fatal by design
  }
}
