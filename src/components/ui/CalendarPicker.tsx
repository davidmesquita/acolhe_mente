import { useState } from 'react'
import { Button } from './Button'
import type { AvailableSlot } from '../../types/database'
import { localDateInTimezone } from '../../features/appointments/schedulingService'

function formatDate(date: Date, timezone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: timezone, ...options }).format(date)
}

export function CalendarPicker({
  slots,
  timezone,
  onSelect,
}: {
  slots: AvailableSlot[]
  timezone: string
  onSelect: (slot: AvailableSlot | null) => void
}) {
  const availableDates = [...new Set(slots.map((slot) => localDateInTimezone(new Date(slot.starts_at), timezone)))]
  const [selectedDate, setSelectedDate] = useState(availableDates[0] ?? '')
  const activeDate = availableDates.includes(selectedDate) ? selectedDate : (availableDates[0] ?? '')
  const daySlots = slots.filter(
    (slot) => localDateInTimezone(new Date(slot.starts_at), timezone) === activeDate,
  )
  const [selectedSlot, setSelectedSlot] = useState('')
  const chosenSlot = daySlots.find((slot) => slot.starts_at === selectedSlot)

  return (
    <div className="calendar-picker">
      <h2>Escolha uma data</h2>
      {availableDates.length ? (
        <div className="date-options" role="group" aria-label="Datas disponíveis">
          {availableDates.map((day) => {
            const date = new Date(`${day}T12:00:00Z`)
            return (
              <button
                className={`date-option ${day === activeDate ? 'is-selected' : ''}`}
                type="button"
                key={day}
                aria-pressed={day === activeDate}
                onClick={() => {
                  setSelectedDate(day)
                  setSelectedSlot('')
                  onSelect(null)
                }}
              >
                <span>{formatDate(date, timezone, { weekday: 'short' }).replace('.', '')}</span>
                <strong>{formatDate(date, timezone, { day: '2-digit', month: 'short' })}</strong>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="field-hint">Ainda não há horários disponíveis para os próximos dias.</p>
      )}
      <h2>Horários disponíveis</h2>
      <div className="time-options" role="group" aria-label="Horários disponíveis">
        {daySlots.map((slot) => {
          const time = formatDate(new Date(slot.starts_at), timezone, {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <button
              type="button"
              key={slot.starts_at}
              aria-pressed={selectedSlot === slot.starts_at}
              className={`time-option ${selectedSlot === slot.starts_at ? 'is-selected' : ''}`}
              onClick={() => setSelectedSlot(slot.starts_at)}
            >
              {time}
            </button>
          )
        })}
      </div>
      <Button type="button" disabled={!chosenSlot} onClick={() => chosenSlot && onSelect(chosenSlot)}>
        Continuar com este horário
      </Button>
      <p className="field-hint">Horários apresentados no fuso {timezone}.</p>
    </div>
  )
}