# frontend — marketing site + customer dashboard

One Vite app serving both: `/` is the public website (where a visitor chats with the AI),
`/app` is the dashboard where the owner reads those conversations back. Same bundle on
purpose — one deploy, one design system, and the demo chat sits on the page that sells it.

## Run it

From the repo root: `docker compose up` (this app on :5173, backend on :3000).

Alone:

```bash
npm install
npm run dev            # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR. In Docker it runs `-- --host` so the container is reachable from your Mac |
| `npm run build` | `tsc -b` then `vite build` — the typecheck is part of the build, so a type error fails the build |
| `npx shadcn@latest add <name>` | Adds a component into `src/components/ui/` (config in `components.json`) |

The backend URL comes from `VITE_API_URL` and falls back to `http://localhost:3000`.
No `.env` is needed for local development.

## What each file does

**`src/App.tsx`** — two routes only: `/` → `Home`, `/app` → `Dashboard`. Deliberately flat;
sub-navigation inside the dashboard is component state, not routes (see below).

**`src/pages/Home.tsx`** — the marketing page. `chatOpen` state mounts `ChatPanel` on
demand rather than rendering it hidden, so no conversation can start until the visitor
clicks "Chat met de agent". The "Laat de AI mij bellen" button is still inert — telephony
is Phase 5.

**`src/components/ChatPanel.tsx`** — the live chat, and the only place in the app that
writes data the AI responds to.
- The `conversationId` lives in a **ref, not state**: `send()` needs the id from the
  previous reply immediately, and a state update would not be visible until the next
  render. State here would start a new conversation on every message.
- The opening greeting is local-only. The backend conversation begins at the visitor's
  first real message, so the owner's inbox does not fill with empty "hello" rows.
- The visitor's message is appended optimistically and the input clears at once; only the
  AI reply waits on the network.
- Errors render the backend's Dutch `error` string, not an HTTP code — see `api.ts`.
- Layout: full-screen on phones, docked 380×560 card from `sm:` up. Mobile-first, matching
  the dashboard shell.

**`src/lib/api.ts`** — every backend call, typed, in one file. `request()` parses the error
body on a non-2xx response so callers can show the backend's human message ("De AI is even
niet bereikbaar") instead of "API 502". `formatTime` and `channelLabel` are here rather
than in components because the inbox and the chat both need the same Dutch formatting —
UI copy stays centralised for the i18n pass later.

**`src/pages/Dashboard.tsx`** — the shell. The active view is `useState`, not a route, so
switching tabs cannot lose in-progress edits in the agent form. Sidebar on `md:` and up,
bottom tab bar below it; `pb-24` on `<main>` keeps content clear of that bar, and
`pb-[env(safe-area-inset-bottom)]` clears the iPhone home indicator.

**`src/pages/views/InboxView.tsx`** — list + detail. On mobile it is one column and
selecting a conversation swaps the list out (`hidden lg:block`); from `lg:` up both show
side by side. This is where the Phase 2c proof appears: a chat conversation with its
transcript and the AI-written summary.

**`src/pages/views/AgentView.tsx`, `ChannelsView.tsx`, `BillingView.tsx`** — the other
dashboard tabs, built in Phase 2a/2b and untouched by this phase.

**`src/index.css`** — Tailwind v4. There is no `tailwind.config.js` by design: v4 configures
theme tokens in CSS, and the shadcn colour variables live here.

## Why it is this small

Phase 2c adds exactly one capability to the frontend: a working chat. Deliberately absent:

- **No state library, no data-fetching library.** Two routes and a handful of `useEffect`
  calls do not justify one yet.
- **No chat persistence across reloads** — refreshing the page starts a new conversation.
  The transcript survives in the database either way.
- **No `widget/` build.** The embeddable script customers paste on their own site is a
  separate deliverable that will reuse this component's logic.
- **No i18n framework.** Copy is Dutch and inline; centralising it is the prerequisite step,
  not the solution.

## Verified

13 August 2026, macOS (darwin 25.6.0), Node 22 in Docker.

- Vite dev server up on :5173 via `docker compose up` (container running, port published).
- `src/lib/api.ts` verified against the live backend indirectly: the same `/api/chat`
  contract was exercised with `curl` and returned the documented JSON shape.

- The `/api/chat` contract this file depends on is confirmed working: a `curl` against the
  live backend returned a €119 answer drawn from the seeded company knowledge, a follow-up
  on the same `conversationId` kept the history, and the conversation appeared in
  `/api/conversations` with an AI-written summary. See `backend/README.md`.

Driven in Chrome against the live stack:

- `/` renders; "Chat met de agent" opens the panel with the greeting and a focused input.
- Typing *"Wat kost een onderhoudsbeurt voor een cv-ketel?"* + Enter returned
  *"Een onderhoudsbeurt voor een cv-ketel kost €119 incl. btw en duurt ongeveer 45 minuten."*
- `/app` → Inbox: the conversation appears top of the list with a `Chat` badge, its
  two-line transcript and the AI-written summary.
- Browser console: no errors or warnings.

**Not verified.** `tsc` was never run against this app — `node_modules` lives only inside
the container and `docker compose exec` is blocked here, so type errors would only surface
as a Vite overlay. Untested: the mobile full-screen layout (only a desktop viewport was
used), the error branch when the backend is down, and multi-turn chat *through the UI*
(the follow-up turn was verified over the API, not the panel).

**A wedged Vite blocks all of this.** The dev server accepted TCP but never answered HTTP,
and had stopped logging HMR updates for changed files. `docker compose restart frontend`
fixed it. If the page hangs and `curl -m 5 localhost:5173` times out, restart before
debugging anything in the code.

## Next in this directory

1. Open http://localhost:5173, click "Chat met de agent", ask
   "Wat kost een onderhoudsbeurt voor een cv-ketel?" — the reply should mention €119.
2. Check `/app` → Inbox: the conversation should be listed with transcript and summary.
3. Extract the chat logic into a shared module the `widget/` build can also import.
4. Persist `conversationId` in `sessionStorage` so a page reload continues the same chat.
