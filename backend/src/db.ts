import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'

const dataDir = path.resolve(__dirname, '../data')
const dbFile = path.join(dataDir, 'reminders.json')

export type ReminderRow = {
  id: string
  title: string
  body?: string
  time: string
  done: boolean
}

type DbSchema = {
  reminders: ReminderRow[]
}

function readDb(): DbSchema {
  if (!fs.existsSync(dbFile)) {
    return { reminders: [] }
  }
  const raw = fs.readFileSync(dbFile, 'utf-8')
  try {
    return JSON.parse(raw) as DbSchema
  } catch {
    return { reminders: [] }
  }
}

function writeDb(data: DbSchema) {
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8')
}

export function initDb() {
  fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(dbFile)) {
    writeDb({ reminders: [] })
  }
}

export function getAllReminders() {
  const db = readDb()
  return [...db.reminders].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

export function createReminder(data: { title: string; body?: string; time: string }) {
  const db = readDb()
  const reminder: ReminderRow = {
    id: uuid(),
    title: data.title,
    body: data.body,
    time: data.time,
    done: false,
  }
  db.reminders.unshift(reminder)
  writeDb(db)
  return reminder
}

export function getReminderById(id: string) {
  const db = readDb()
  return db.reminders.find(reminder => reminder.id === id)
}

export function updateReminder(id: string, data: { title?: string; body?: string; time?: string; done?: boolean }) {
  const db = readDb()
  const reminder = db.reminders.find(item => item.id === id)
  if (!reminder) return null
  reminder.title = data.title ?? reminder.title
  reminder.body = data.body !== undefined ? data.body : reminder.body
  reminder.time = data.time ?? reminder.time
  reminder.done = data.done !== undefined ? data.done : reminder.done
  writeDb(db)
  return reminder
}

export function deleteReminder(id: string) {
  const db = readDb()
  const before = db.reminders.length
  db.reminders = db.reminders.filter(item => item.id !== id)
  if (db.reminders.length === before) {
    return false
  }
  writeDb(db)
  return true
}
