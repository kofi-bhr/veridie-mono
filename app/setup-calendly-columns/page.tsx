"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function SetupCalendlyColumnsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/setup/calendly-columns", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to set up Calendly columns")
      }

      setSuccess(true)
    } catch (err: any) {
      console.error("Error setting up Calendly columns:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Setup Calendly Columns</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Calendly Columns to Database</CardTitle>
          <CardDescription>
            This will add the necessary columns to the database tables for Calendly integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This setup will add the following columns:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>calendly_username to mentors table</li>
            <li>calendly_token to mentors table</li>
            <li>calendly_refresh_token to mentors table</li>
            <li>calendly_token_expires_at to mentors table</li>
            <li>calendly_event_uri to bookings table</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetup} disabled={isLoading}>
            {isLoading ? "Setting up..." : "Run Setup"}
          </Button>
        </CardFooter>
      </Card>

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Calendly columns have been added to the database.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
