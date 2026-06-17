import React, { useState } from 'react'
import { NewReminder } from '../App'

type Props = {
  onGenerate: (reminder: NewReminder) => void
}

export default function AiReminder({ onGenerate }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'AI parse failed')
        return
      }

      const result = await response.json()
      onGenerate({ title: result.title, body: result.body, time: result.time })
      setText('')
    } catch (err) {
      setError('Не удалось получить данные от AI')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="ai-module">
      <h2>Создать напоминание из текста</h2>
      <form className="ai-form" onSubmit={handleGenerate}>
        <textarea
          rows={3}
          placeholder="Например: завтра в 14:00 забрать посылку из почты"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Генерирую...' : 'Сгенерировать напоминание'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
    </section>
  )
}
