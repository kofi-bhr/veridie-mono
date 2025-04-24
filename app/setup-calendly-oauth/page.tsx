"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SetupCalendlyOAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/setup-calendly-oauth", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to set up Calendly OAuth")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Set Up Calendly OAuth</h1>

      <div className="mb-8">
        <p className="text-muted-foreground mb-4">
          This setup will add the necessary database fields to support Calendly OAuth integration.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Calendly OAuth fields have been added to the database.
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSetup} disabled={isLoading}>
          {isLoading ? "Setting Up..." : "Set Up Calendly OAuth Fields"}
        </Button>
      </div>

      <div className="p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">What this setup does:</h2>
        <ul className="space-y-2 list-disc pl-6">
          <li>Adds fields for Calendly OAuth tokens to the mentors table</li>
          <li>Adds fields for Calendly user and organization URIs</li>
          <li>Adds a field to store webhook subscriptions</li>
          <li>Creates indexes for better query performance</li>
        </ul>
      </div>
    </div>
  )
}
