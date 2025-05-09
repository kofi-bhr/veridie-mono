"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"

export default function DebugCalendlyApiTest() {
  const [endpoint, setEndpoint] = useState("/event_types")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const testApi = async () => {
    if (!user) {
      setError("You must be logged in to test the API")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        `/api/debug/calendly-api?endpoint=${encodeURIComponent(endpoint)}&mentorId=${user.id}`,
      )
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || `Error: ${response.status}`)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Calendly API</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">API Endpoint</label>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/event_types"
              className="mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Enter a Calendly API endpoint (e.g., /event_types, /scheduled_events)
            </p>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">API Response:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testApi} disabled={loading || !user}>
            {loading ? "Testing..." : "Test API"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
