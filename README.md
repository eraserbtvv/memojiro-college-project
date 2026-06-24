# memojiro-college-project

Простое приложение-напоминалка вдохновленная memojiro — 
- GitHub репозиторий: https://github.com/eraserbtvv/memojiro-college-project
- Stack: React + Vite + TypeScript, Backend — Express + JSON 
- Демо видео проекта: https://drive.google.com/file/d/1G5jTMKW36BlA49HgxWPPBmPLFg9e4mUY/view?usp=drive_link
- Local run:

  1. Установить зависимости

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
  (в разных терминалах)
  ```

- Backend: `backend/src/index.ts` + локальный парсер текста в `backend/src/ai.ts`
- Хранилище: JSON-файл `backend/data/reminders.json`
- Оригинальный проект: https://www.codetriage.com/aawgit/memojiro
- AI-парсер работает локально, AI не используется.
- Deploy:
  - Frontend (Vercel)
  - Backend (Railway)
- Deploy URL: https://memojiro-college-project-kmq5pa28x-maxim-smirnov.vercel.app/ (Если не работает пробуйте с VPN)
- Code Climate: [![Maintainability](https://qlty.sh/gh/eraserbtvv/projects/memojiro-college-project/maintainability.svg)](https://qlty.sh/gh/eraserbtvv/projects/memojiro-college-project)