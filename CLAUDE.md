# AI Voice Agent Platform

AI receptionist platform: one AI core answering phone calls, WhatsApp, website chat and
website voice for small companies, with a customer dashboard, CRM write-back and Stripe
billing. Deadline: sellable product on 28 August 2026 (go/no-go with Max).
Design reference for the public website: https://www.voicelabs.nl/ — clean, minimal.

## Stack (final, do not deviate)
- Frontend: React + Vite + TypeScript + Tailwind v4 + shadcn/ui — `frontend/`
  Serves BOTH the marketing website and the customer dashboard (routes: `/` site, `/app` dashboard).
- Backend: Node.js + Fastify + TypeScript, Prisma ORM on PostgreSQL — `backend/`
  This is the single AI core; every channel (phone, WhatsApp, chat, web voice) connects here.
- Widget: `widget/` — embeddable chat script (one JS file + install snippet). Built in Phase 2c.
- Voice AI: OpenAI Realtime API. Browser demo = direct WebRTC (backend only issues session
  tokens). Phone = Twilio Media Streams bridged via OpenAI Agents SDK (TypeScript) Twilio transport.
- Phone + WhatsApp: Twilio. Billing: Stripe Checkout + Customer Portal + webhooks.
- CRM: our own connector interface (createNote, createTask, createMeetingAction, saveSummary);
  first adapter = Optivaize CRM.

## Commands
- Everything: `docker compose up` (frontend :5173, backend :3000, postgres :5432)
- Backend alone: `cd backend && npm run dev` · Frontend alone: `cd frontend && npm run dev`
- Prisma: `cd backend && npx prisma migrate dev` (after models exist)

## Conventions
- TypeScript everywhere, strict mode. No JavaScript files.
- shadcn/ui components go in `frontend/src/components/ui/`; add via `npx shadcn@latest add <name>`.
- Small commits, one per completed subtask; commit messages reference the CRM task name.
- Multi-tenant from day one: every domain model hangs off Organization.
- Secrets only in `.env` (never committed); `.env.example` documents required vars.
- Dutch and English must both be supported in AI prompts and UI copy (i18n later, keep copy centralized).

## Status
Done: foundation, UI shells (2a), real backend + Prisma + API + seeded demo data (2b).
Chat channel (2c) works end to end: `POST /api/chat` answers from the org's own knowledge
(verified via curl — €119 tariff), keeps conversation history, writes an AI summary and
counts usage. Verified in the browser too: homepage chat panel → €119 answer → conversation
in the dashboard inbox with transcript and summary. Next: web voice (4).
Editing backend/.env needs `docker compose restart backend` — dotenv reads it only at boot.
DB uses `prisma db push` for now; switch to real migrations before production.
Single-tenant stub: all API routes use org "org_demo" until auth lands.

## Build order (do not reorder — each step reuses the previous)
1. UI shells with mock data (validate design against Voicelabs before logic) — DONE
2. Real backend + Prisma models replace mocks — DONE
3. Chat first (simplest AI pipeline: message → OpenAI → inbox)
4. Web voice (adds audio, no telephony)
5. Phone last (Twilio bridge — hardest part, everything around it already works)
6. WhatsApp, CRM connector, Stripe attach to the proven pipeline
