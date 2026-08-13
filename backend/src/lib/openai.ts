import OpenAI from "openai";

// One shared client for the whole backend. The SDK reads OPENAI_API_KEY itself,
// but we construct it lazily so the server still boots (and /health still answers)
// when the key is missing — only the AI routes should fail in that case.
let client: OpenAI | null = null;

export function openai(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY ontbreekt in backend/.env");
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

// Overridable per environment so we can move to a newer/cheaper model without a code change.
export const CHAT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/**
 * Turns the organisation's own agent configuration into the system prompt.
 * `prompt` is the personality/rules the customer edits in the dashboard;
 * `knowledge` is their company facts (prices, opening hours). Everything the AI
 * is allowed to claim about the business must come from `knowledge` — that is what
 * makes this "their" receptionist instead of a generic chatbot.
 */
export function buildSystemPrompt(opts: {
  organizationName: string;
  prompt: string;
  knowledge: string;
}): string {
  return [
    opts.prompt.trim() ||
      `Je bent de AI-receptionist van ${opts.organizationName}. Beantwoord vragen kort, vriendelijk en duidelijk.`,
    "",
    `Bedrijf: ${opts.organizationName}`,
    "",
    "BEDRIJFSKENNIS (de enige bron voor feiten over dit bedrijf):",
    opts.knowledge.trim() || "(nog geen bedrijfskennis ingevuld)",
    "",
    "Regels:",
    "- Gebruik uitsluitend de bedrijfskennis hierboven voor prijzen, openingstijden en diensten. Verzin niets.",
    "- Staat het antwoord er niet bij? Zeg dat eerlijk en bied aan een medewerker te laten terugbellen.",
    "- Antwoord in de taal van de bezoeker (Nederlands of Engels).",
    "- Houd antwoorden kort: maximaal 3 zinnen, geen opsommingen tenzij erom gevraagd wordt.",
  ].join("\n");
}
