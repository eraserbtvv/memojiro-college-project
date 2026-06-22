export type ParsedReminder = {
  title: string
  body?: string
  time: string
}

function parseDateFromText(text: string): string {
  const now = new Date()
  const tomorrow = /\btomorrow\b|\bзавтра\b/i.test(text)
  const today = /\btoday\b|\bсегодня\b/i.test(text)
  const inHours = text.match(/\b(in|через)\s+(\d+)\s*hours?|\bчерез\s+(\d+)\s*ч(?:ас(?:ов?)?)?/i)
  const atTime = text.match(/\b(\d{1,2}):(\d{2})\b/)
  const dateMatch = text.match(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/)

  const result = new Date(now)

  if (inHours) {
    const hours = Number(inHours[2] ?? inHours[3])
    if (!Number.isNaN(hours)) {
      result.setHours(result.getHours() + hours)
      return result.toISOString()
    }
  }

  if (tomorrow) {
    result.setDate(result.getDate() + 1)
    if (atTime) {
      const hours = Number(atTime[1])
      const minutes = Number(atTime[2])
      result.setHours(hours, minutes, 0, 0)
      return result.toISOString()
    }
    return result.toISOString()
  }

  if (today && atTime) {
    const hours = Number(atTime[1])
    const minutes = Number(atTime[2])
    result.setHours(hours, minutes, 0, 0)
    return result.toISOString()
  }

  if (dateMatch) {
    const day = Number(dateMatch[1])
    const month = Number(dateMatch[2])
    const year = Number(dateMatch[3] ?? now.getFullYear())
    result.setFullYear(year, month - 1, day)
    if (atTime) {
      const hours = Number(atTime[1])
      const minutes = Number(atTime[2])
      result.setHours(hours, minutes, 0, 0)
    }
    return result.toISOString()
  }

  if (atTime) {
    const hours = Number(atTime[1])
    const minutes = Number(atTime[2])
    result.setHours(hours, minutes, 0, 0)
    if (result.getTime() < now.getTime()) {
      result.setDate(result.getDate() + 1)
    }
    return result.toISOString()
  }

  result.setHours(result.getHours() + 1)
  return result.toISOString()
}

export async function parseReminderText(text: string): Promise<ParsedReminder> {
  const cleaned = text.replace(/\b(today|tomorrow|сегодня|завтра|in\s+\d+\s*hours?|через\s+\d+\s*ч(?:ас(?:ов?)?)?|at\s+\d{1,2}:\d{2})\b/gi, '').trim()
  const title = cleaned.length > 0 ? cleaned : 'Новое напоминание'
  return {
    title: title.slice(0, 80),
    body: text,
    time: parseDateFromText(text)
  }
}
