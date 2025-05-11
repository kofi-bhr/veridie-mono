"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function TestCalendlyCredentialsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{
    hasClientId: boolean
    hasClientSecret: boolean
    baseUrl: string
    redirectUri: string
  } | null>(null)

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/calendly/test-credentials")

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Unknown error")
      }

      setCredentials({
        hasClientId: data.hasClientId,
        hasClientSecret: data.hasClientSecret,
        baseUrl: data.baseUrl,
        redirectUri: data.redirectUri,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Calendly Credentials Test</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Calendly Credentials Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading credentials status...</p>
          ) : credentials ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={credentials.hasClientId ? "text-green-500" : "text-red-500"}>
                  {credentials.hasClientId ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </span>
                <span>Calendly Client ID: {credentials.hasClientId ? "Available" : "Missing"}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={credentials.hasClientSecret ? "text-green-500" : "text-red-500"}>
                  {credentials.hasClientSecret ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </span>
                <span>Calendly Client Secret: {credentials.hasClientSecret ? "Available" : "Missing"}</span>
              </div>

              <div>
                <p className="font-medium">Base URL:</p>
                <p className="text-sm text-muted-foreground">{credentials.baseUrl || "Not set"}</p>
              </div>

              <div>
                <p className="font-medium">Redirect URI:</p>
                <p className="text-sm text-muted-foreground">{credentials.redirectUri}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm">
                  Make sure this redirect URI is added to your Calendly OAuth application settings.
                </p>
              </div>
            </div>
          ) : (
            <p>No credentials information available</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={fetchCredentials} disabled={isLoading}>
        {isLoading ? "Checking..." : "Refresh Credentials Status"}
      </Button>
    </div>
  )
}
