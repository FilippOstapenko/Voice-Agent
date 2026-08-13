# AI Voice Agent Platform

AI receptionist for phone, WhatsApp, website chat and website voice. See CLAUDE.md for stack and conventions.

## Run everything
    docker compose up
Frontend: http://localhost:5173 · Backend health: http://localhost:3000/health

## Run without Docker
    cd backend && npm install && npm run dev
    cd frontend && npm install && npm run dev

## Where the detail lives
Each directory documents itself — read the one you are editing:
- `backend/README.md` — the AI core: routes, prompt building, Prisma, what is unrun
- `frontend/README.md` — marketing site + dashboard, and the chat panel
Copy `backend/.env.example` to `backend/.env` and fill in `OPENAI_API_KEY` before the
chat channel will answer.
