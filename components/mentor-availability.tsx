"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface MentorAvailabilityProps {
  mentor: {
    id: string
    availability?: Array<{
      day: string
      slots: string[]
    }>
  }
  selectedService: string | null
  onDateTimeSelect?: (date: Date | null, time: string | null) => void
}

export function MentorAvailability({ mentor, selectedService, onDateTimeSelect }: MentorAvailabilityProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Get day of week from date
  const getDayOfWeek = (date: Date): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[date.getDay()]
  }

  // Get available times for selected date
  const getAvailableTimes = (date: Date | undefined): string[] => {
    if (!date || !mentor.availability) return []

    const dayOfWeek = getDayOfWeek(date)
    const dayAvailability = mentor.availability.find((a) => a.day === dayOfWeek)

    return dayAvailability?.slots || []
  }

  const availableTimes = date ? getAvailableTimes(date) : []

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    setSelectedTime(null)
    if (onDateTimeSelect) {
      onDateTimeSelect(newDate || null, null)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (onDateTimeSelect && date) {
      onDateTimeSelect(date, time)
    }
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateChange}
        className="rounded-md border"
        disabled={(date) => {
          // Disable past dates and days with no availability
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const dayOfWeek = getDayOfWeek(date)
          const hasAvailability = mentor.availability?.some((a) => a.day === dayOfWeek) ?? false
          return date < today || !hasAvailability
        }}
      />

      {date && availableTimes.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Available Times</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant="outline"
                size="sm"
                className={cn(
                  "text-sm",
                  selectedTime === time && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      {date && availableTimes.length === 0 && (
        <div className="text-center py-2 text-muted-foreground">No available times on this day</div>
      )}
    </div>
  )
}
