import React, {useEffect, useState} from 'react'
import ReminderList from './components/ReminderList'
import ReminderForm from './components/ReminderForm'
import AiReminder from './components/AiReminder'

export type Reminder = {
  id: string
  title: string
  body?: string
  time: string // ISO string
  done: boolean
}

export type NewReminder = Omit<Reminder, 'id' | 'done'>

export default function App(){
  const API = import.meta.env.VITE_API_URL ?? ''
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    if (!API) {
      setError('VITE_API_URL не настроен. Проверьте переменные окружения в Vercel и redeploy.');
      return
    }

  fetch(`${API}/api/reminders`)
    .then(res => res.json())
    .then((data: Reminder[]) => {
      const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setReminders(sortedData);
    })
    .catch(() => setError('Не удалось загрузить напоминания.'))
  }, [])

  useEffect(()=>{
    const timers: number[] = []
    reminders.forEach(r=>{
      const ms = new Date(r.time).getTime() - Date.now()
      if(ms>0 && !r.done){
        const id = window.setTimeout(()=>{
          new Notification(r.title || 'Напоминание', { body: r.body })
        }, ms)
        timers.push(id)
      }
    })
    return ()=> timers.forEach(t=>clearTimeout(t))
  },[reminders])

  useEffect(()=>{
    if('Notification' in window && Notification.permission !== 'granted'){
      Notification.requestPermission()
    }
  },[])

  async function addReminder(r: NewReminder){
    try {
      const response = await fetch(`${API}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r)
      })
      const created = await response.json()
      setReminders(prev => [created, ...prev])
    } catch {
      setError('Не удалось сохранить напоминание.')
    }
  }

  async function updateReminder(updated: Reminder){
    try {
      const response = await fetch(`${API}/api/reminders/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      const saved = await response.json()
      setReminders(prev => prev.map(p => p.id === saved.id ? saved : p))
    } catch {
      setError('Не удалось обновить напоминание.')
    }
  }

  async function removeReminder(id: string){
    try {
      await fetch(`${API}/api/reminders/${id}`, { method: 'DELETE' })
      setReminders(prev => prev.filter(p => p.id !== id))
    } catch {
      setError('Не удалось удалить напоминание.')
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Memojiro — College Reminder</h1>
        <p>Менеджер напоминаний с backend API и AI-парсером текста.</p>
      </header>
      <main>
        {error && <div className="error">{error}</div>}
        <ReminderForm onAdd={addReminder} />
        <AiReminder onGenerate={addReminder} />
        <ReminderList reminders={reminders} onUpdate={updateReminder} onRemove={removeReminder} />
      </main>
      <footer>
        <small>Maxim Smirnov @ eraserbtvv</small>
        <small>Используется НЕ генеративный AI</small>
      </footer>
    </div>
  )
}
