export type ParsedReminder = {
  title: string
  body?: string
  time: string
}

const MOSCOW_OFFSET_MINUTES = 180

const MONTHS: Record<string, number> = {
  'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4,
  'мая': 5, 'июня': 6, 'июля': 7, 'августа': 8,
  'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12
}

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
  const exactTime = text.match(/(?:^|\s)(\d{1,2}):(\d{2})(?=\s|$|[.,!?])/);
  if (exactTime) {
    return { hours: Number(exactTime[1]), minutes: Number(exactTime[2]) };
  }

  const wordTime = text.match(/(?:^|\s)(?:(в|к|at)\s+)?(\d{1,2})(?::(\d{2}))?(?:\s+(утра|вечера|дня|ночи|am|pm|ч|час(?:ов|а)?))?(?=\s|$|[.,!?])/i);
  
  if (wordTime) {
    const prefix = wordTime[1]; 
    let hours = Number(wordTime[2]);
    const minutesMatch = wordTime[3]; 
    const modifier = wordTime[4]?.toLowerCase(); 

    if (prefix || modifier || minutesMatch) {
      const minutes = Number(minutesMatch || 0);

      if (modifier) {
        if (['вечера', 'pm'].includes(modifier) && hours < 12) hours += 12;
        if (['дня'].includes(modifier) && hours < 12 && hours >= 1) hours += 12;
        if (['утра', 'ночи', 'am'].includes(modifier) && hours === 12) hours = 0;
      }
      return { hours, minutes };
    }
  }

  return null;
}

function parseDateFromText(text: string): string {
  const moscowNow = nowInMoscow()
  
  const dayAfterTomorrow = /(?:^|\s)(day after tomorrow|послезавтра)(?=\s|$|[.,!?])/i.test(text)
  const tomorrow = /(?:^|\s)(tomorrow|завтра)(?=\s|$|[.,!?])/i.test(text)
  const inHours = text.match(/(?:^|\s)(?:in|через)\s+(\d+)\s*(?:hours?|ч(?:ас(?:ов|а)?)?)(?=\s|$|[.,!?])/i)
  const dateMatch = text.match(/(?:^|\s)(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?(?=\s|$|[.,!?])/)
  const textDateMatch = text.match(/(?:^|\s)(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?=\s|$|[.,!?])/i)

  const parsedTime = extractTime(text)

  const year = moscowNow.getFullYear()
  const month = moscowNow.getMonth() + 1
  const day = moscowNow.getDate()

  const moscowTomorrow = new Date(moscowNow.getTime())
  moscowTomorrow.setDate(moscowTomorrow.getDate() + 1)
  const tomYear = moscowTomorrow.getFullYear()
  const tomMonth = moscowTomorrow.getMonth() + 1
  const tomDay = moscowTomorrow.getDate()

  const moscowDayAfterTomorrow = new Date(moscowNow.getTime())
  moscowDayAfterTomorrow.setDate(moscowDayAfterTomorrow.getDate() + 2)
  const datYear = moscowDayAfterTomorrow.getFullYear()
  const datMonth = moscowDayAfterTomorrow.getMonth() + 1
  const datDay = moscowDayAfterTomorrow.getDate()
 
  if (textDateMatch) {
    const parsedDay = Number(textDateMatch[1])
    const monthName = textDateMatch[2].toLowerCase()
    const parsedMonth = MONTHS[monthName]
    let parsedYear = year

    if (parsedMonth < month || (parsedMonth === month && parsedDay < day)) {
      parsedYear += 1
    }

    if (parsedTime) {
      return moscowDateToUtc(parsedYear, parsedMonth, parsedDay, parsedTime.hours, parsedTime.minutes).toISOString()
    }
    return moscowDateToUtc(parsedYear, parsedMonth, parsedDay, moscowNow.getHours(), moscowNow.getMinutes()).toISOString()
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

  if (inHours) {
    const hours = Number(inHours[1])
    if (!Number.isNaN(hours)) {
      const realUtcNow = new Date()
      return new Date(realUtcNow.getTime() + hours * 3600_000).toISOString()
    }
  }

  if (dayAfterTomorrow) {
    if (parsedTime) {
      return moscowDateToUtc(datYear, datMonth, datDay, parsedTime.hours, parsedTime.minutes).toISOString()
    }
    return moscowDateToUtc(datYear, datMonth, datDay, 0, 0).toISOString()
  }

  if (tomorrow) {
    if (parsedTime) {
      return moscowDateToUtc(tomYear, tomMonth, tomDay, parsedTime.hours, parsedTime.minutes).toISOString()
    }
    return moscowDateToUtc(tomYear, tomMonth, tomDay, 0, 0).toISOString()
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
  const trimmedText = text.trim();
  
  return {
    title: trimmedText.length > 0 ? trimmedText : 'Новое напоминание',
    time: parseDateFromText(text)
  }
}