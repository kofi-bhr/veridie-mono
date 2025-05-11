"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SetupCalendlyEventUri() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup/calendly-event-uri", {
        method: "POST",
      })

      const data = await response.json()
      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "Migration completed successfully" : "Migration failed"),
      })
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while running the migration",
      })
      console.error("Error running migration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Calendly Event URI</CardTitle>
          <CardDescription>This will add a calendly_event_uri column to the services table.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            This migration is needed to properly store the Calendly event URI for each service. The event URI is used to
            fetch available times from Calendly.
          </p>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runMigration} disabled={isLoading} className="w-full">
            {isLoading ? "Running Migration..." : "Run Migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
