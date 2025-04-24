"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function FixStripeColumnsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/fix-stripe-columns")
      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || "Migration completed successfully" })
      } else {
        setResult({ success: false, error: data.error || "Failed to run migration" })
      }
    } catch (error) {
      console.error("Error running migration:", error)
      setResult({ success: false, error: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Fix Stripe Database Columns</CardTitle>
          <CardDescription>Run this migration to fix Stripe-related columns in the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create the necessary columns for Stripe Connect integration if they don't exist and migrate any
            existing data.
          </p>

          {result && (
            <div
              className={`p-4 rounded-md mb-4 flex items-start gap-3 ${result.success ? "bg-green-50" : "bg-red-50"}`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <h3 className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                  {result.success ? "Success" : "Error"}
                </h3>
                <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                  {result.message || result.error}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runMigration} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Migration...
              </>
            ) : (
              "Run Migration"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
