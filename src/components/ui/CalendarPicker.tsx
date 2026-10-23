import { useState } from 'react'
import { Button } from './Button'

const times = ['09:00', '10:30', '14:00', '15:30', '18:00']

function nextDates() {
  const options: { date: Date; label: string; weekday: string }[] = []
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  while (options.length < 7) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      options.push({
        date: new Date(date),
        label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date),
        weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
          .format(date)
          .replace('.', ''),
      })
    }
  }
  return options
}

export function CalendarPicker({
  onSelect,
}: {
  onSelect: (dateLabel: string, time: string) => void
}) {
  const dates = nextDates()
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState('')
  return (
    <div className="calendar-picker">
      <h2>Escolha uma data</h2>
      <div className="date-options" role="group" aria-label="Próximos dias úteis">
        {dates.map((item, index) => (
          <button
            className={`date-option ${selectedDate === index ? 'is-selected' : ''}`}
            type="button"
            key={item.label}
            aria-pressed={selectedDate === index}
            onClick={() => setSelectedDate(index)}
          >
            <span>{item.weekday}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
      <h2>Horários disponíveis</h2>
      <div className="time-options" role="group" aria-label="Horários">
        {times.map((time) => (
          <button
            type="button"
            key={time}
            aria-pressed={selectedTime === time}
            className={`time-option ${selectedTime === time ? 'is-selected' : ''}`}
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </button>
        ))}
      </div>
      <Button
        type="button"
        disabled={!selectedTime}
        onClick={() => onSelect(dates[selectedDate]!.label, selectedTime)}
      >
        Continuar com este horário
      </Button>
      <p className="field-hint">
        Horários fictícios para demonstração. Nenhum agendamento será enviado ou salvo.
      </p>
    </div>
  )
}
