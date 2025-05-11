"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, AlertCircle } from "lucide-react"

export default function CalendlyDebugPage() {
  const [baseUrl, setBaseUrl] = useState("")
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [redirectUri, setRedirectUri] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [queryParams, setQueryParams] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get the current URL
    const currentUrl = window.location.origin
    setBaseUrl(currentUrl)

    // Set the redirect URI based on the current URL
    setRedirectUri(`${currentUrl}/api/calendly/debug-callback`)

    // Check for query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    const messageParam = urlParams.get("message")

    // Collect all query parameters
    const params: Record<string, string> = {}
    urlParams.forEach((value, key) => {
      params[key] = value
    })
    setQueryParams(params)

    if (errorParam) {
      setError(errorParam)
    }

    if (messageParam) {
      setMessage(messageParam)
    }

    // Check if we have credentials
    fetch("/api/debug/calendly-credentials")
      .then((res) => res.json())
      .then((data) => {
        if (data.clientId) {
          setClientId(data.clientId)
        }
        if (data.clientSecret) {
          // Just set a placeholder for security
          setClientSecret("••••••••••••••••")
        }
      })
      .catch((err) => {
        console.error("Error fetching credentials:", err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const generateAuthUrl = () => {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "user:read event_types:read",
    })

    return `https://auth.calendly.com/oauth/authorize?${params.toString()}`
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Calendly Integration Debug</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert className="mb-6">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Environment</CardTitle>
          <CardDescription>These are the details of your current environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Base URL:</p>
              <p className="text-sm text-muted-foreground">{baseUrl}</p>
            </div>

            <div>
              <p className="font-medium">Redirect URI for testing:</p>
              <p className="text-sm text-muted-foreground">{redirectUri}</p>
            </div>

            <div>
              <p className="font-medium">Calendly Client ID:</p>
              <p className="text-sm text-muted-foreground">{clientId || "Not set"}</p>
            </div>

            <div>
              <p className="font-medium">Calendly Client Secret:</p>
              <p className="text-sm text-muted-foreground">{clientSecret || "Not set"}</p>
            </div>

            {Object.keys(queryParams).length > 0 && (
              <div>
                <p className="font-medium">Query Parameters:</p>
                <pre className="text-sm bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(queryParams, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Calendly Integration</CardTitle>
          <CardDescription>This will test the Calendly integration using the current environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="mb-2">1. Make sure you have added this redirect URI to your Calendly app:</p>
              <div className="bg-muted p-2 rounded text-sm font-mono overflow-x-auto">{redirectUri}</div>
            </div>

            <div>
              <p className="mb-2">2. Click the button below to test the integration:</p>
              <Button
                onClick={() => (window.location.href = generateAuthUrl())}
                disabled={!clientId}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Test Calendly Integration
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Note: This test uses a special debug callback endpoint that will show you the raw response from
                Calendly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Check Redirect URI:</strong> Make sure <code className="bg-muted px-1 rounded">{redirectUri}</code>{" "}
            is added to your Calendly app's allowed redirect URIs.
          </li>
          <li>
            <strong>Verify Credentials:</strong> Ensure your Calendly Client ID and Client Secret are correctly set in
            your environment variables.
          </li>
          <li>
            <strong>Clear Browser Cache:</strong> Try clearing your browser cache and cookies, then test again.
          </li>
          <li>
            <strong>Check Logs:</strong> Look at your server logs for any errors during the callback process.
          </li>
          <li>
            <strong>Try Incognito Mode:</strong> Test the integration in an incognito/private browsing window.
          </li>
        </ol>
      </div>
    </div>
  )
}
