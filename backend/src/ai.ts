export type ParsedReminder = {
  title: string
  body?: string
  time: string
}

const MOSCOW_OFFSET_MINUTES = 180

function nowInMoscow(): Date {
  const local = new Date()
  const utcMs = local.getTime() + local.getTimezoneOffset() * 60_000
  const moscowMs = utcMs + MOSCOW_OFFSET_MINUTES * 60_000
  return new Date(moscowMs)
}

function moscowDateToUtc(year: number, month: number, day: number, hours: number, minutes: number, seconds = 0): Date {
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes, seconds) - MOSCOW_OFFSET_MINUTES * 60_000
  return new Date(utcMs)
}

function parseDateFromText(text: string): string {
  const moscowNow = nowInMoscow()
  const tomorrow = /\btomorrow\b|\bзавтра\b/i.test(text)
  const today = /\btoday\b|\bсегодня\b/i.test(text)
  const inHours = text.match(/\b(in|через)\s+(\d+)\s*hours?|\bчерез\s+(\d+)\s*ч(?:ас(?:ов?)?)?/i)
  const atTime = text.match(/\b(\d{1,2}):(\d{2})\b/)
  const dateMatch = text.match(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/)

  const year = moscowNow.getFullYear()
  const month = moscowNow.getMonth() + 1
  const day = moscowNow.getDate()

  if (inHours) {
    const hours = Number(inHours[2] ?? inHours[3])
    if (!Number.isNaN(hours)) {
      const utcTs = moscowNow.getTime() + hours * 60_000 * 60
      return new Date(utcTs).toISOString()
    }
  }

  if (tomorrow) {
    const tomorrowDate = new Date(Date.UTC(year, month - 1, day, 0, 0) - MOSCOW_OFFSET_MINUTES * 60_000 + 24 * 60_60_000)
    if (atTime) {
      const hours = Number(atTime[1])
      const minutes = Number(atTime[2])
      return moscowDateToUtc(tomorrowDate.getUTCFullYear(), tomorrowDate.getUTCMonth() + 1, tomorrowDate.getUTCDate(), hours, minutes).toISOString()
    }
    const utcTs = tomorrowDate.getTime()
    return new Date(utcTs).toISOString()
  }

  if (today && atTime) {
    const hours = Number(atTime[1])
    const minutes = Number(atTime[2])
    return moscowDateToUtc(year, month, day, hours, minutes).toISOString()
  }

  if (dateMatch) {
    const parsedDay = Number(dateMatch[1])
    const parsedMonth = Number(dateMatch[2])
    const parsedYear = Number(dateMatch[3] ?? year)
    if (atTime) {
      const hours = Number(atTime[1])
      const minutes = Number(atTime[2])
      return moscowDateToUtc(parsedYear, parsedMonth, parsedDay, hours, minutes).toISOString()
    }
    return moscowDateToUtc(parsedYear, parsedMonth, parsedDay, moscowNow.getHours(), moscowNow.getMinutes()).toISOString()
  }

  if (atTime) {
    const hours = Number(atTime[1])
    const minutes = Number(atTime[2])
    let candidate = moscowDateToUtc(year, month, day, hours, minutes)
    const candidateLocal = new Date(candidate.getTime() + MOSCOW_OFFSET_MINUTES * 60_000)
    if (candidateLocal.getTime() < moscowNow.getTime()) {
      const tomorrowDate = new Date(Date.UTC(year, month - 1, day, 0, 0) - MOSCOW_OFFSET_MINUTES * 60_000 + 24 * 60 * 60_000)
      return moscowDateToUtc(tomorrowDate.getUTCFullYear(), tomorrowDate.getUTCMonth() + 1, tomorrowDate.getUTCDate(), hours, minutes).toISOString()
    }
    return candidate.toISOString()
  }

  const utcTs = moscowNow.getTime() + 60 * 60_000
  return new Date(utcTs).toISOString()
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
