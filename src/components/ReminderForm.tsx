import React, {useState} from 'react'
import { NewReminder } from '../App'

type Props = {
  onAdd: (r: NewReminder)=>void
}

export default function ReminderForm({onAdd}: Props){
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [time, setTime] = useState('')

  function submit(e: React.FormEvent){
    e.preventDefault()
    if(!title || !time) return
    onAdd({ title, body, time })
    setTitle(''); setBody(''); setTime('')
  }

  return (
    <form className="form" onSubmit={submit}>
      <input placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} />
      <input placeholder="Описание (опционально)" value={body} onChange={e=>setBody(e.target.value)} />
      <input type="datetime-local" value={time} onChange={e=>setTime(e.target.value)} />
      <button type="submit">Добавить напоминание</button>
    </form>
  )
}
