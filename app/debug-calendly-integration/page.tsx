"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

export default function DebugCalendlyIntegrationPage() {
  const [mentorId, setMentorId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testCalendlyIntegration = async () => {
    if (!mentorId || !serviceId || !selectedDate) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split("T")[0]

      const response = await fetch("/api/calendly/available-times", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId,
          serviceId,
          date: formattedDate,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch available times")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Calendly Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mentor ID</label>
            <Input placeholder="Enter mentor ID" value={mentorId} onChange={(e) => setMentorId(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Service ID</label>
            <Input placeholder="Enter service ID" value={serviceId} onChange={(e) => setServiceId(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border mx-auto"
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
            />
          </div>

          <Button onClick={testCalendlyIntegration} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Test Calendly Integration
          </Button>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

          {result && (
            <div className="p-4 bg-gray-50 rounded-md overflow-auto">
              <h3 className="font-medium mb-2">Result:</h3>
              <div className="mb-4">
                <p>
                  <strong>Data Source:</strong> {result.source || "Unknown"}
                </p>
                {result.reason && (
                  <p>
                    <strong>Reason:</strong> {result.reason}
                  </p>
                )}
                {result.eventUri && (
                  <p>
                    <strong>Event URI:</strong> {result.eventUri}
                  </p>
                )}
              </div>

              <h4 className="font-medium mb-2">Available Times:</h4>
              {result.times && result.times.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {result.times.map((time: string, index: number) => (
                    <div key={index} className="bg-white p-2 border rounded text-center">
                      {time}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No available times returned</p>
              )}

              <div className="mt-4">
                <h4 className="font-medium mb-2">Full Response:</h4>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
