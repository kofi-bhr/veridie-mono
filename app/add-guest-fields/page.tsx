"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function AddGuestFieldsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup/add-guest-fields", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run migration")
      }

      setResult(JSON.stringify(data, null, 2))
      toast({
        title: "Migration Successful",
        description: "Guest fields have been added to the bookings table",
      })
    } catch (error) {
      console.error("Migration error:", error)
      setResult(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Guest Fields to Bookings Table</CardTitle>
          <CardDescription>
            This will add guest_name and guest_email columns to the bookings table to support guest bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This migration is required to enable guest bookings without requiring users to create an account.
          </p>

          <Button onClick={runMigration} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migration...
              </>
            ) : (
              "Run Migration"
            )}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Result:</h3>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px]">{result}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Note: This migration is safe to run multiple times. It will only add the columns if they don't already exist.
        </CardFooter>
      </Card>
    </div>
  )
}
