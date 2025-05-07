"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function SetupReviewsTablePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupReviewsTable = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup/reviews-table", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Reviews table set up successfully!",
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to set up reviews table.",
        })
      }
    } catch (error) {
      console.error("Error setting up reviews table:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Set Up Reviews Table</CardTitle>
          <CardDescription>
            This will create the reviews table and set up the necessary relationships and policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">This operation will:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 mb-4">
            <li>Create the reviews table if it doesn't exist</li>
            <li>Set up row-level security policies</li>
            <li>Add review count and rating columns to the mentors table</li>
            <li>Create triggers to automatically update mentor ratings</li>
          </ul>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={setupReviewsTable} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              "Set Up Reviews Table"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
