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

function extractTime(text: string): { hours: number, minutes: number } | null {
  // 1. Ищем строгий формат "14:30"
  const exactTime = text.match(/\b(\d{1,2}):(\d{2})\b/);
  if (exactTime) {
    return { hours: Number(exactTime[1]), minutes: Number(exactTime[2]) };
  }

  const wordTime = text.match(/\b(?:в|at)\s+(\d{1,2})(?::(\d{2}))?\s*(утра|вечера|дня|ночи|am|pm)?\b/i);
  if (wordTime) {
    let hours = Number(wordTime[1]);
    const minutes = Number(wordTime[2] || 0);
    const modifier = wordTime[3]?.toLowerCase();

    if (modifier) {
      if (['вечера', 'pm'].includes(modifier) && hours < 12) hours += 12;
      if (['дня'].includes(modifier) && hours < 12 && hours >= 1) hours += 12; 
      if (['утра', 'ночи', 'am'].includes(modifier) && hours === 12) hours = 0;
    }
    return { hours, minutes };
  }

  return null;
}

function parseDateFromText(text: string): string {
  const moscowNow = nowInMoscow()
  const tomorrow = /\btomorrow\b|\bзавтра\b/i.test(text)
  const today = /\btoday\b|\bсегодня\b/i.test(text)
  const inHours = text.match(/\b(?:in|через)\s+(\d+)\s*(?:hours?|ч(?:ас(?:ов|а)?)?)\b/i)
  const dateMatch = text.match(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/)

  const parsedTime = extractTime(text)

  const year = moscowNow.getFullYear()
  const month = moscowNow.getMonth() + 1
  const day = moscowNow.getDate()

  const moscowTomorrow = new Date(moscowNow.getTime())
  moscowTomorrow.setDate(moscowTomorrow.getDate() + 1) 
  const tomYear = moscowTomorrow.getFullYear()
  const tomMonth = moscowTomorrow.getMonth() + 1
  const tomDay = moscowTomorrow.getDate()

  if (inHours) {
    const hours = Number(inHours[1])
    if (!Number.isNaN(hours)) {
      const realUtcNow = new Date()
      return new Date(realUtcNow.getTime() + hours * 3600_000).toISOString()
    }
  }

  if (tomorrow) {
    if (parsedTime) {
      return moscowDateToUtc(tomYear, tomMonth, tomDay, parsedTime.hours, parsedTime.minutes).toISOString()
    }
    return moscowDateToUtc(tomYear, tomMonth, tomDay, 0, 0).toISOString()
  }

  if (today && parsedTime) {
    return moscowDateToUtc(year, month, day, parsedTime.hours, parsedTime.minutes).toISOString()
  }

  if (dateMatch) {
    const parsedDay = Number(dateMatch[1])
    const parsedMonth = Number(dateMatch[2])
    const parsedYear = Number(dateMatch[3] ?? year)
    if (parsedTime) {
      return moscowDateToUtc(parsedYear, parsedMonth, parsedDay, parsedTime.hours, parsedTime.minutes).toISOString()
    }
    return moscowDateToUtc(parsedYear, parsedMonth, parsedDay, moscowNow.getHours(), moscowNow.getMinutes()).toISOString()
  }

  if (parsedTime) {
    let candidate = moscowDateToUtc(year, month, day, parsedTime.hours, parsedTime.minutes)
    const candidateLocal = new Date(candidate.getTime() + MOSCOW_OFFSET_MINUTES * 60_000)
    
    if (candidateLocal.getTime() < moscowNow.getTime()) {
      return moscowDateToUtc(tomYear, tomMonth, tomDay, parsedTime.hours, parsedTime.minutes).toISOString()
    }
    return candidate.toISOString()
  }

  const realUtcNow = new Date()
  return new Date(realUtcNow.getTime() + 3600_000).toISOString()
}

export async function parseReminderText(text: string): Promise<ParsedReminder> {
  const regexForCleanup = /\b(today|tomorrow|сегодня|завтра|in\s+\d+\s*hours?|через\s+\d+\s*ч(?:ас(?:ов|а)?)?|at\s+\d{1,2}(:\d{2})?|в\s+\d{1,2}(:\d{2})?\s*(утра|вечера|дня|ночи)?)\b/gi
  
  const cleaned = text.replace(regexForCleanup, '').replace(/\s{2,}/g, ' ').trim()
  const title = cleaned.length > 0 ? cleaned : 'Новое напоминание'
  
  return {
    title: title.slice(0, 80),
    body: text,
    time: parseDateFromText(text)
  }
}