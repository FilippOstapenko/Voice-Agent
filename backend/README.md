# backend — the AI core

One Fastify service. Every channel (chat now; web voice, phone, WhatsApp later) enters
here, gets answered by OpenAI using the organisation's own prompt + company knowledge from
Postgres, and leaves a transcript the dashboard can show.

## Run it

From the repo root, everything at once:

```bash
docker compose up          # db :5432, backend :3000, frontend :5173
```

Backend alone, against the compose database:

```bash
cp .env.example .env       # then paste a real OPENAI_API_KEY
npm install
npx prisma db push         # creates tables from schema.prisma
npm run seed               # demo org "Van Dijk Installaties" + example conversations
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | `tsx watch src/index.ts` — reloads on save, no build step |
| `npm run seed` | Idempotent: upserts the org, skips conversations if any exist |
| `npm run db:push` | Pushes `schema.prisma` straight to the DB. No migration files yet — switch to `prisma migrate` before production |
| `npm run build` / `start` | `tsc` to `dist/`, then plain node |

Smoke-test the chat channel without a browser:

```bash
curl -s localhost:3000/health
curl -s -X POST localhost:3000/api/chat -H 'Content-Type: application/json' \
  -d '{"message":"Wat kost een onderhoudsbeurt voor een cv-ketel?"}'
```

The reply should mention €119 — that number exists only in the seeded `Agent.knowledge`
row, so seeing it proves DB → prompt → OpenAI → response end to end.

## What each file does

**`src/index.ts`** — boots Fastify and registers every route module. `import "dotenv/config"`
is the *first* line: `src/lib/openai.ts` reads `process.env.OPENAI_API_KEY`, so the env must
be loaded before any module that touches it is imported. `host: "0.0.0.0"` binds all
interfaces — a container binding `127.0.0.1` is unreachable from your Mac. CORS is
`origin: true` (reflect any origin) because Vite serves on :5173 and the API on :3000;
this must be narrowed to the real domain before production.

**`src/db.ts`** — the single `PrismaClient`. Instantiating one per request exhausts the
connection pool under `tsx watch`, which re-imports modules on every save.

**`src/lib/openai.ts`** — the OpenAI client and the system-prompt builder. The client is
built **lazily** so a missing/invalid key does not stop the process from booting: `/health`
and the dashboard API keep working, and only the AI routes fail. `buildSystemPrompt()`
concatenates the customer's editable `prompt` (personality, rules) with their `knowledge`
(prices, hours) and pins a "use only the knowledge above, invent nothing" instruction —
that constraint is what separates this from a generic chatbot and is the main lever when
answers drift. `CHAT_MODEL` reads `OPENAI_MODEL` so the model can change without a deploy.

**`src/routes/chat.ts`** — the chat channel. Order of operations matters:
- The visitor's message is written to the DB **before** the OpenAI call. If OpenAI is down
  you still have the lead in the inbox instead of a silently lost question.
- Continuing a conversation is scoped `organizationId + channel: CHAT`, so a guessed id
  cannot resume another tenant's conversation. Multi-tenant from day one, per CLAUDE.md.
- History is ordered by `[createdAt, id]` — cuids are timestamp-prefixed, so the id breaks
  ties when two rows land in the same millisecond and would otherwise sort arbitrarily.
- `HISTORY_LIMIT = 40` bounds the prompt (and the bill) on a long chat.
- `temperature: 0.3` — a receptionist quoting prices should be boring and repeatable.
- `updateSummary()` runs after every exchange and swallows its own errors: a visitor who
  closes the tab mid-chat still leaves a readable inbox entry, and a failed summary must
  never break the reply the visitor is waiting for.
- Failures return `502` with a Dutch message plus the `conversationId`, so the widget can
  retry into the same conversation.

**`src/routes/organization.ts`** — owns `ORG_ID = "org_demo"`, the single-tenant stub every
other route imports. This is the one place to change when auth lands.

**`src/routes/agent.ts`** — reads/writes the prompt + knowledge the dashboard edits.
`generate-knowledge` is still a placeholder: it stores the website and writes a stub string.
Real crawling lands in a later phase.

**`src/routes/conversations.ts` / `billing.ts`** — read models for the dashboard. The `(c: any)`
casts are there because the generated Prisma client is not committed, so row types are not
inferable at build time on a clean checkout.

**`prisma/schema.prisma`** — everything hangs off `Organization`. `Usage` is uniquely keyed
`[organizationId, channel, month]` so the chat route can `upsert` a counter without a race.

**`prisma/seed.ts`** — creates Van Dijk Installaties, whose knowledge string contains the
€119 tariff used as the end-to-end proof. Re-running is safe: the org is upserted and
conversation creation is skipped if any already exist.

## Why it is this small

This is Phase 2c of the build order in `CLAUDE.md`: chat only, because it is the simplest
AI pipeline that exercises the whole path. Deliberately absent:

- **No auth / no real tenancy** — `ORG_ID` is hardcoded.
- **No streaming** — the reply arrives in one response. Fine for chat; web voice (Phase 4)
  will need the Realtime API instead.
- **No rate limiting or spam protection** on `/api/chat`. It is a public, unauthenticated,
  paid-per-call endpoint — this must land before the widget goes on a customer's site.
- **No migrations** — `db push` only.
- **No CRM write-back, no Stripe** — Phase 6, on top of this proven pipeline.

## Verified

Run 13 August 2026, macOS (darwin 25.6.0), Node 22 in Docker, against the live compose stack.

- `npx tsc --noEmit` → clean. Proves syntax and types only, not behaviour.
- `curl localhost:3000/health` → `{"status":"ok","service":"voice-agent-backend"}`
- `curl -X POST localhost:3000/api/chat -d '{"message":"Wat kost een onderhoudsbeurt voor een cv-ketel?"}'`
  → `HTTP 200 {"conversationId":"cmsrh5j5h...","reply":"Een onderhoudsbeurt voor een cv-ketel kost €119 incl. btw en duurt ongeveer 45 minuten."}`

  €119 exists only in the seeded `Agent.knowledge` row, so this proves the whole chain:
  Postgres → system prompt → OpenAI → response.
- Follow-up on the same `conversationId` (`"En zijn jullie in het weekend bereikbaar?"`)
  → correctly answered "zaterdag tot 13:00, storingsdienst 24/7" from the same knowledge
  string. Conversation history is being replayed into the prompt.
- `GET /api/conversations/:id` → transcript of all four turns in order, plus an AI-written
  summary: *"De bezoeker vroeg naar de kosten van een onderhoudsbeurt … en de assistent gaf
  de prijs van €119 incl. btw en informatie over de bereikbaarheid in het weekend."*
- `GET /api/billing` → `Chatgesprekken used: 1` — the usage counter incremented once for the
  conversation, not once per message.

**An earlier run of the same curl returned `HTTP 502` from an invalid `OPENAI_API_KEY`
(OpenAI answered `401 Incorrect API key provided`).** Worth knowing: `dotenv` reads the file
once at boot and `tsx watch` does not reload env vars, so after editing `.env` the container
must be restarted — `docker compose restart backend`. A plain `docker compose up` does not
do it, because the key is not part of the compose config.

**Not verified:** the error paths. No 502/400 branch has been exercised since the key was
fixed, and the `HISTORY_LIMIT` truncation at 40 messages has never been hit.

## Next in this directory

1. Add rate limiting (`@fastify/rate-limit`) to `/api/chat` before the widget ships.
2. Switch `db push` to real `prisma migrate` migrations and commit the migration files.
3. Web voice (Phase 4): a `/api/realtime/session` route issuing ephemeral OpenAI tokens,
   reusing `buildSystemPrompt()` unchanged.
