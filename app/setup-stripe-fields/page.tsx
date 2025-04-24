"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function SetupStripeFieldsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setup-stripe-fields")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to run migration")
      }

      setIsComplete(true)
    } catch (err) {
      console.error("Error running migration:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Setup Stripe Fields</CardTitle>
          <CardDescription>
            Run this migration to ensure all necessary database fields for Stripe integration are present.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p>Migration completed successfully!</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This will add any missing columns required for Stripe Connect integration.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runMigration} disabled={isLoading || isComplete} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migration...
              </>
            ) : isComplete ? (
              "Migration Complete"
            ) : (
              "Run Migration"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
