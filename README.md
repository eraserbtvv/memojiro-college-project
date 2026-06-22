# memojiro-college-project

Simple reminder app inspired by memojiro — frontend-only reference implementation for practice report.

- Stack: React + Vite + TypeScript, Backend — Express + JSON persistence
- Local run:

  1. Install dependencies

  ```bash
  npm install
  ```

  2. Запустить backend

  ```bash
  npm run dev:backend
  ```

  3. Запустить frontend

  ```bash
  npm run dev:frontend
  ```

- Backend: `backend/src/index.ts` + локальный парсер текста в `backend/src/ai.ts`
- Хранилище: JSON-файл `backend/data/reminders.json`
- Любой запрос `/api/*` во время разработки проксируется на backend.
- AI-парсер работает локально, OpenAI не используется.
- Deploy (quick guide):
  - Frontend (Vercel):
    1. Push your repo to GitHub.
    2. Create a new Vercel project and import the repo.
    3. In Project Settings → Environment Variables add `VITE_API_URL` with your backend URL (e.g. `https://your-backend.onrender.com`).
    4. Deploy — Vercel will run `npm run build` (Vite) automatically.

  - Backend (Render / Railway):
    - Render (recommended for simplicity):
      1. Create a new Web Service on Render and connect your GitHub repo.
      2. Set the build command: `npm ci && npm run build:backend`
      3. Set the start command: `npm run start:backend`
      4. Add Environment Variables: `PORT` if needed.
      5. Deploy — after build Render will run the start command.

    - Railway:
      1. Push your repo to GitHub.
      2. Create a new Project on Railway and connect your GitHub repository.
      3. In Service settings, set Build Command: `npm ci && npm run build:backend`
      4. Set Start Command: `npm run start:backend`
      5. Add Environment Variables:
         - `PORT` = `4000` (Railway usually provides it automatically, but setting it is safe)
      6. Deploy the service.
      7. Copy the public Railway URL and use it as `VITE_API_URL` in Vercel.

  - Important notes:
    - Frontend must have `VITE_API_URL` set in Vercel BEFORE deploying so the built bundle includes the correct API base URL.
    - The current backend uses a JSON file for persistence (`backend/data/reminders.json`). This file is not suitable for highly-available serverless platforms — for production use migrate to a managed DB (Postgres/Supabase) or SQLite with persistent disk.

  - To run on a single VPS/VM or simple host (portable):
    - Install Node 18+, then on the server run:

```bash
# in project root
npm ci
npm run build
npm run build:backend
npm run start:backend
```

  - Deploy URL: add your working links here after deployment.
- Code Climate: добавьте бейдж сюда, когда настроите.

See `docs/` for report templates and architecture notes.

