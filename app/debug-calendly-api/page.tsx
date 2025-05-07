"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function DebugCalendlyApiPage() {
  const [accessToken, setAccessToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testCalendlyApi = async () => {
    if (!accessToken) {
      setError("Please enter a Calendly access token")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Test the /users/me endpoint
      const userResponse = await fetch("https://api.calendly.com/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const userData = await userResponse.text()

      let parsedUserData
      try {
        parsedUserData = JSON.parse(userData)
      } catch (e) {
        parsedUserData = { error: "Failed to parse response" }
      }

      if (!userResponse.ok) {
        throw new Error(`Calendly API error (${userResponse.status}): ${userData}`)
      }

      // If user endpoint works, try to get event types
      const userUri = parsedUserData.resource.uri

      const eventTypesResponse = await fetch(`https://api.calendly.com/event_types?user=${userUri}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const eventTypesData = await eventTypesResponse.text()

      let parsedEventTypesData
      try {
        parsedEventTypesData = JSON.parse(eventTypesData)
      } catch (e) {
        parsedEventTypesData = { error: "Failed to parse response" }
      }

      setResult({
        user: parsedUserData,
        eventTypes: parsedEventTypesData,
        userStatus: userResponse.status,
        eventTypesStatus: eventTypesResponse.status,
      })
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
          <CardTitle>Debug Calendly API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Calendly Access Token</label>
            <Input
              placeholder="Enter Calendly access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              type="password"
            />
          </div>

          <Button onClick={testCalendlyApi} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Test Calendly API
          </Button>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

          {result && (
            <div className="p-4 bg-gray-50 rounded-md overflow-auto">
              <h3 className="font-medium mb-2">User Endpoint (/users/me):</h3>
              <p>Status: {result.userStatus}</p>
              <pre className="text-xs whitespace-pre-wrap mt-2 bg-white p-2 rounded border">
                {JSON.stringify(result.user, null, 2)}
              </pre>

              <h3 className="font-medium mb-2 mt-4">Event Types Endpoint:</h3>
              <p>Status: {result.eventTypesStatus}</p>
              <pre className="text-xs whitespace-pre-wrap mt-2 bg-white p-2 rounded border">
                {JSON.stringify(result.eventTypes, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
