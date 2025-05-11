"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react"

export default function DebugCalendlyCredentialsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<any>(null)

  const checkCredentials = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/debug/calendly-credentials")

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Unknown error")
      }

      setCredentials(data)
    } catch (err: any) {
      setError(err.message || "Failed to check credentials")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkCredentials()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Debug Calendly Credentials</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Calendly Credentials Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Checking credentials...</p>
            </div>
          ) : credentials ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Client ID:</span>
                  {credentials.hasClientId ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Set ({credentials.clientIdPreview})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      Not set
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">Client Secret:</span>
                  {credentials.hasClientSecret ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Set ({credentials.clientSecretPreview})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      Not set
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <h3 className="font-semibold mb-2">Environment Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Node Environment:</span> {credentials.nodeEnv}
                  </div>
                  <div>
                    <span className="font-medium">Base URL:</span> {credentials.baseUrl || "Not set"}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={checkCredentials}>Refresh</Button>
              </div>
            </div>
          ) : (
            <p>No credential information available.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Verify that both CALENDLY_CLIENT_ID and CALENDLY_CLIENT_SECRET are set in your environment variables.</li>
          <li>Check that NEXT_PUBLIC_BASE_URL is set correctly to your deployed URL.</li>
          <li>Make sure the redirect URI in your Calendly app settings matches exactly what's used in the code.</li>
          <li>Try the direct debug connection to see the raw callback data.</li>
        </ul>

        <div className="mt-4">
          <Button asChild variant="outline">
            <a href="/debug-calendly-direct">Try Direct Debug Connection</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
