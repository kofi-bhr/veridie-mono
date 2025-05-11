"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function TestStripeConnectionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/stripe/test-connection")
      const data = await response.json()

      setResult(data)
    } catch (error) {
      console.error("Error testing Stripe connection:", error)
      setError(error instanceof Error ? error.message : "Failed to test connection")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test Stripe Connection</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Stripe API Connection Test</CardTitle>
          <CardDescription>Test if your application can connect to the Stripe API</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <div className="mb-4 p-4 rounded-md border">
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">Status:</span>
                {result.success ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-5 w-5 mr-1" />
                    Failed
                  </span>
                )}
              </div>
              <div>
                <span className="font-medium">Message:</span>
                <p className="mt-1">{result.message || result.error}</p>
                {result.details && <p className="mt-1 text-sm text-muted-foreground">{result.details}</p>}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test Stripe Connection"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
