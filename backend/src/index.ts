import express from 'express'
import cors from 'cors'
import { initDb, getAllReminders, createReminder, updateReminder, deleteReminder, getReminderById } from './db'
import { parseReminderText } from './ai'

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(cors())
app.use(express.json())

initDb()

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'memojiro backend' })
})

app.get('/api/reminders', (_req, res) => {
  const reminders = getAllReminders()
  res.json(reminders)
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/ai/parse', async (req, res) => {
  const { text } = req.body
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Text is required' })
  }

  try {
    const reminder = await parseReminderText(text)
    res.json(reminder)
  } catch (error) {
    console.error('AI parse error:', error)
    res.status(500).json({ message: 'Не удалось распознать напоминание через AI' })
  }
})

app.get('/api/reminders/:id', (req, res) => {
  const reminder = getReminderById(req.params.id)
  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' })
  }
  res.json(reminder)
})

app.post('/api/reminders', (req, res) => {
  const { title, body, time } = req.body
  if (!title || !time) {
    return res.status(400).json({ message: 'title and time are required' })
  }
  const reminder = createReminder({ title, body, time })
  res.status(201).json(reminder)
})

app.put('/api/reminders/:id', (req, res) => {
  const existing = getReminderById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: 'Reminder not found' })
  }
  const updated = updateReminder(req.params.id, req.body)
  res.json(updated)
})

app.delete('/api/reminders/:id', (req, res) => {
  const ok = deleteReminder(req.params.id)
  if (!ok) {
    return res.status(404).json({ message: 'Reminder not found' })
  }
  res.status(204).send()
})

app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`)
})
