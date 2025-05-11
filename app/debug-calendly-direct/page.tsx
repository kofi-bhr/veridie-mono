"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function DebugCalendlyDirectPage() {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDirectConnect = () => {
    window.location.href = "/api/calendly/direct-auth"
  }

  const checkDebugEndpoint = async () => {
    try {
      setError(null)
      const response = await fetch("/api/debug/calendly-callback")
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setError(err.message || "Failed to check debug endpoint")
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Debug Calendly Direct Integration</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Test Direct Calendly Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page tests a direct Calendly connection using a debug callback endpoint. After connecting, you'll see
            the raw callback data.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleDirectConnect}>Connect with Debug Endpoint</Button>
            <Button variant="outline" onClick={checkDebugEndpoint}>
              Check Debug Endpoint
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea className="font-mono h-96" readOnly value={result} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
