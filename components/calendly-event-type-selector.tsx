"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CalendlyEventType {
  uri: string
  name: string
  duration: number
  schedulingUrl: string
}

interface CalendlyEventTypeSelectorProps {
  value?: string
  onChange: (value: string) => void
  onDurationChange?: (duration: number) => void
}

export function CalendlyEventTypeSelector({ value, onChange, onDurationChange }: CalendlyEventTypeSelectorProps) {
  const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEventTypes() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/calendly/event-types")

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to fetch event types")
        }

        const data = await response.json()
        setEventTypes(data.eventTypes || [])
      } catch (err: any) {
        console.error("Error fetching Calendly event types:", err)
        setError(err.message || "Failed to load Calendly event types")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventTypes()
  }, [])

  // When an event type is selected, also update the duration if provided
  const handleChange = (uri: string) => {
    onChange(uri)

    if (onDurationChange) {
      const selectedType = eventTypes.find((et) => et.uri === uri)
      if (selectedType) {
        // Convert duration from minutes to whatever unit your app uses
        onDurationChange(selectedType.duration)
      }
    }
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (eventTypes.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No Calendly event types found. Please create event types in your Calendly account first.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a Calendly event type" />
      </SelectTrigger>
      <SelectContent>
        {eventTypes.map((eventType) => (
          <SelectItem key={eventType.uri} value={eventType.uri}>
            {eventType.name} ({eventType.duration} min)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
