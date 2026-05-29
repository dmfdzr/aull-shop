"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateTimePickerProps = {
  name: string
  defaultValue?: string
  placeholder?: string
  className?: string
}

const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function toInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hour}:${minute}`
}

function parseInputValue(value?: string) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function formatDisplay(value: string, placeholder: string) {
  const date = parseInputValue(value)

  if (!date) {
    return placeholder
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function DateTimePicker({
  name,
  defaultValue = "",
  placeholder = "Pilih tanggal dan jam",
  className,
}: DateTimePickerProps) {
  const initialDate = parseInputValue(defaultValue) ?? new Date()
  const [value, setValue] = React.useState(defaultValue)
  const [viewDate, setViewDate] = React.useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  )
  const [time, setTime] = React.useState(() => {
    const selected = parseInputValue(defaultValue)
    return selected
      ? `${String(selected.getHours()).padStart(2, "0")}:${String(
          selected.getMinutes()
        ).padStart(2, "0")}`
      : "12:00"
  })

  const selectedDate = parseInputValue(value)
  const calendarDays = React.useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return Array.from({ length: startOffset + daysInMonth }, (_, index) => {
      if (index < startOffset) {
        return null
      }

      return new Date(year, month, index - startOffset + 1)
    })
  }, [viewDate])

  function selectDate(date: Date) {
    const [hour = "12", minute = "00"] = time.split(":")
    const nextDate = new Date(date)
    nextDate.setHours(Number(hour), Number(minute), 0, 0)
    setValue(toInputValue(nextDate))
  }

  function updateTime(nextTime: string) {
    setTime(nextTime)

    if (!selectedDate) {
      return
    }

    const [hour = "12", minute = "00"] = nextTime.split(":")
    const nextDate = new Date(selectedDate)
    nextDate.setHours(Number(hour), Number(minute), 0, 0)
    setValue(toInputValue(nextDate))
  }

  function moveMonth(direction: -1 | 1) {
    setViewDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1)
    )
  }

  return (
    <div className={className}>
      <input type="hidden" name={name} value={value} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "min-h-11 w-full justify-between rounded-xl px-3.5 text-left font-medium",
              !value && "text-muted-foreground"
            )}
          >
            <span>{formatDisplay(value, placeholder)}</span>
            <span aria-hidden="true" className="text-muted-foreground">
              Cal
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => moveMonth(-1)}
              aria-label="Bulan sebelumnya"
            >
              <span aria-hidden="true">‹</span>
            </Button>
            <p className="text-sm font-semibold">
              {new Intl.DateTimeFormat("id-ID", {
                month: "long",
                year: "numeric",
              }).format(viewDate)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => moveMonth(1)}
              aria-label="Bulan berikutnya"
            >
              <span aria-hidden="true">›</span>
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {dayLabels.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) =>
              date ? (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={cn(
                    "grid size-9 place-items-center rounded-xl text-sm font-medium transition-colors duration-150 hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none",
                    selectedDate &&
                      date.toDateString() === selectedDate.toDateString() &&
                      "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={`empty-${index}`} className="size-9" />
              )
            )}
          </div>

          <label className="mt-4 grid gap-2 text-sm font-medium">
            Jam
            <input
              type="time"
              value={time}
              onChange={(event) => updateTime(event.target.value)}
              className="app-field"
            />
          </label>
        </PopoverContent>
      </Popover>
    </div>
  )
}
