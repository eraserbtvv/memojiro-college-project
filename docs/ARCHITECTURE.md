# Архитектура

Приложение реализовано как SPA на React + Vite и backend на Node.js + Express.
Данные сохраняются в SQLite-базе, backend предоставляет CRUD-интерфейс.

Схема: Frontend (React) -> Backend API (Express) -> SQLite

ERD:
- reminders: id PK, title, body, time, done

Use Cases:
1. Создать напоминание — пользователь вводит название, время и опционально описание.
2. Список напоминаний загружается с backend и отображается в UI.
3. Отметить как выполненное / удалить напоминание.
4. В заданное время браузер показывает нативное уведомление.

API:
- GET `/api/reminders` — получить список всех напоминаний
- POST `/api/reminders` — создать напоминание: `{ title, body, time }`
- PUT `/api/reminders/:id` — обновить напоминание
- DELETE `/api/reminders/:id` — удалить напоминание

Миграция:
- `backend/migrations/001-create-reminders.sql` — создание таблицы `reminders`.
