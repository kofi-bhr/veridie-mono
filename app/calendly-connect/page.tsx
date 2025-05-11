"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ExternalLink } from "lucide-react"

export default function CalendlyConnectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiateCalendlyAuth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the base URL
      const baseUrl = window.location.origin
      const redirectUri = `${baseUrl}/api/calendly/simple-callback`

      // Fetch client ID from the server
      const response = await fetch("/api/calendly/test-credentials")

      if (!response.ok) {
        throw new Error(`Failed to get credentials: ${response.status}`)
      }

      const data = await response.json()

      if (!data.hasClientId) {
        throw new Error("Calendly Client ID is not configured")
      }

      // Construct the authorization URL
      const authUrl = new URL("https://calendly.com/oauth/authorize")
      authUrl.searchParams.append("client_id", data.clientId || "")
      authUrl.searchParams.append("response_type", "code")
      authUrl.searchParams.append("redirect_uri", redirectUri)
      authUrl.searchParams.append("scope", "user:read event_types:read")

      // Redirect to Calendly
      window.location.href = authUrl.toString()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Connect Calendly</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connect Your Calendly Account</CardTitle>
          <CardDescription>
            Connect your Calendly account to enable scheduling features on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will redirect you to Calendly where you'll be asked to authorize access to your account.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            We only request read access to your user information and event types.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={initiateCalendlyAuth} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect Calendly"}
          </Button>
          <Button variant="outline" asChild>
            <a href="https://calendly.com/app/oauth/applications" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Calendly Developer Portal
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
