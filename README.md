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

- Backend: `backend/src/index.ts` + AI parsing in `backend/src/ai.ts`
- Хранилище: JSON-файл `backend/data/reminders.json`
- Любой запрос `/api/*` во время разработки проксируется на backend.
- Для AI-парсинга задавайте `OPENAI_API_KEY` в окружении backend.
- Deploy:
  - Фронтенд можно развернуть на Vercel.
  - Бэкенд можно развернуть на Render, Railway или Fly.
  - Для рабочего деплоя используйте `npm run build:backend && npm run start:backend`.
- Deploy URL: добавьте сюда вашу рабочую ссылку.
- Code Climate: добавьте бейдж сюда, когда настроите.

See `docs/` for report templates and architecture notes.

