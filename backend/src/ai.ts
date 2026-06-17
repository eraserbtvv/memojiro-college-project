import OpenAI from 'openai'

export type ParsedReminder = {
  title: string
  body?: string
  time: string
}

const apiKey = process.env.OPENAI_API_KEY
const client = apiKey ? new OpenAI({ apiKey }) : undefined

function parseDateFromText(text: string): string {
  const now = new Date()
  const tomorrow = /\btomorrow\b/i.test(text)
  const today = /\btoday\b/i.test(text)
  const inHours = text.match(/in\s+(\d+)\s*hours?/i)
  const atTime = text.match(/\b(\d{1,2}:\d{2})\b/)
  const dateMatch = text.match(/\b(\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?)\b/)

  let result = new Date(now)

  if (inHours) {
    result.setHours(result.getHours() + Number(inHours[1]))
  } else if (tomorrow) {
    result.setDate(result.getDate() + 1)
    if (atTime) {
      const [hours, minutes] = atTime[1].split(':').map(Number)
      result.setHours(hours, minutes, 0, 0)
    }
  } else if (today) {
    if (atTime) {
      const [hours, minutes] = atTime[1].split(':').map(Number)
      result.setHours(hours, minutes, 0, 0)
    }
  } else if (dateMatch) {
    const normalized = dateMatch[1].replace(/\./g, '/').replace(/-/g, '/')
    const parsed = new Date(normalized + (normalized.length <= 5 ? `/${now.getFullYear()}` : ''))
    if (!Number.isNaN(parsed.getTime())) {
      result = parsed
      if (atTime) {
        const [hours, minutes] = atTime[1].split(':').map(Number)
        result.setHours(hours, minutes, 0, 0)
      }
    }
  } else if (atTime) {
    const [hours, minutes] = atTime[1].split(':').map(Number)
    result.setHours(hours, minutes, 0, 0)
    if (result.getTime() < now.getTime()) {
      result.setDate(result.getDate() + 1)
    }
  } else {
    result.setHours(result.getHours() + 1)
  }

  return result.toISOString()
}

function createFallbackReminder(text: string): ParsedReminder {
  const cleaned = text.replace(/\b(today|tomorrow|in\s+\d+\s*hours?|at\s+\d{1,2}:\d{2})\b/gi, '').trim()
  const title = cleaned.length > 0 ? cleaned : 'Новое напоминание'
  return {
    title: title.slice(0, 80),
    body: text,
    time: parseDateFromText(text)
  }
}

export async function parseReminderText(text: string): Promise<ParsedReminder> {
  if (client) {
    const prompt = `Extract a reminder from the user text. Return valid JSON only with keys title, body, and time in ISO 8601 format. Example:\n{\n  "title": "Buy groceries",\n  "body": "Milk, bread and eggs",\n  "time": "2026-06-16T14:00:00.000Z"\n}`
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant that extracts structured reminders from free-form text.' },
          { role: 'user', content: `${prompt}\n\nText: ${text}` }
        ],
        temperature: 0.2,
        max_tokens: 150
      })

      const content = response.choices?.[0]?.message?.content ?? ''
      const jsonStart = content.indexOf('{')
      const jsonText = jsonStart >= 0 ? content.slice(jsonStart) : content
      const parsed = JSON.parse(jsonText)
      if (parsed.title && parsed.time) {
        return {
          title: String(parsed.title),
          body: parsed.body ? String(parsed.body) : text,
          time: String(parsed.time)
        }
      }
    } catch (error) {
      console.warn('OpenAI parse failed, fallback to heuristic parser', error)
    }
  }

  return createFallbackReminder(text)
}
