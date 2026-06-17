import React from 'react'
import { Reminder } from '../App'

type Props = {
  reminders: Reminder[]
  onUpdate: (r: Reminder)=>void
  onRemove: (id: string)=>void
}

export default function ReminderList({reminders, onUpdate, onRemove}: Props){
  return (
    <section className="list">
      {reminders.length===0 && <div className="empty">Нет напоминаний</div>}
      {reminders.map(r=> (
        <div className="card" key={r.id}>
          <div className="card-main">
            <h3>{r.title}</h3>
            <p className="time">{new Date(r.time).toLocaleString()}</p>
            {r.body && <p className="body">{r.body}</p>}
          </div>
          <div className="card-actions">
            <button onClick={()=> onUpdate({...r, done: !r.done})}>{r.done? 'Undo' : 'Done'}</button>
            <button onClick={()=> onRemove(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </section>
  )
}
