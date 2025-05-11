"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
  const [error, setError] = useState<{ message: string; details?: string } | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchEventTypes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching Calendly event types...")
      const response = await fetch("/api/calendly/event-types")

      // First check if the response is OK
      if (!response.ok) {
        let errorMessage = "Failed to fetch event types"
        let errorDetails = ""

        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          errorDetails = errorData.details || ""
        } catch (e) {
          // If we can't parse the JSON, use the status text
          errorMessage = `Failed to fetch event types: ${response.status} ${response.statusText}`
        }

        throw new Error(errorMessage, { cause: errorDetails })
      }

      // Try to parse the JSON with error handling
      let data
      try {
        const responseText = await response.text()
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Invalid response format from server")
      }

      if (!data.eventTypes || !Array.isArray(data.eventTypes)) {
        console.error("Unexpected response format:", data)
        throw new Error("Unexpected response format from server")
      }

      setEventTypes(data.eventTypes)
    } catch (err: any) {
      console.error("Error fetching Calendly event types:", err)
      setError({
        message: err.message || "Failed to load Calendly event types",
        details: err.cause,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEventTypes()
  }, [retryCount])

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

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error) {
    // Check for specific error messages to provide better guidance
    const isNotConnected = error.message.includes("Calendly not connected")
    const isMissingUri = error.message.includes("user URI is missing")

    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error.message}</p>
            {error.details && <p className="text-sm opacity-80">{error.details}</p>}

            {isNotConnected && <p className="text-sm mt-2">You need to connect your Calendly account first.</p>}

            {isMissingUri && (
              <p className="text-sm mt-2">Your Calendly connection is incomplete. Please reconnect your account.</p>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Retry</span>
          </Button>

          <Button asChild size="sm">
            <Link href="/dashboard/calendly">
              {isNotConnected || isMissingUri ? "Connect Calendly" : "Manage Calendly"}
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/debug-calendly-connection">Debug Connection</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (eventTypes.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No Calendly event types found. Please create event types in your Calendly account first.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Refresh</span>
          </Button>

          <Button asChild size="sm" variant="outline">
            <a href="https://calendly.com/event_types" target="_blank" rel="noopener noreferrer">
              Create Event Types
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
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
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          className="flex items-center text-xs text-muted-foreground"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          <span>Refresh List</span>
        </Button>
      </div>
    </div>
  )
}
