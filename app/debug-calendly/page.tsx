"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function DebugCalendlyPage() {
  const [mentorId, setMentorId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/calendly/available-times", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId,
          serviceId,
          date,
        }),
      })

      const responseText = await response.text()
      console.log(`API response (${response.status}):`, responseText)

      try {
        const data = JSON.parse(responseText)
        setResult(data)
      } catch (e) {
        setError(`Invalid JSON response: ${responseText.substring(0, 100)}...`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Calendly Integration</CardTitle>
          <CardDescription>Test the Calendly API integration and diagnose issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mentorId">Mentor ID</Label>
            <Input
              id="mentorId"
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              placeholder="Enter mentor ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceId">Service ID</Label>
            <Input
              id="serviceId"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              placeholder="Enter service ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Calendly API"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <p className="font-semibold mb-1">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="w-full">
              <p className="font-semibold mb-2">Result:</p>
              <Textarea readOnly className="font-mono text-xs h-60" value={JSON.stringify(result, null, 2)} />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
