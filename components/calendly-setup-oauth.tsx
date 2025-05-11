"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface CalendlyOAuthSetupProps {
  mentorId: string
  calendlyData?: {
    username?: string | null
    expiresAt?: string | null
    lastConnected?: string | null
    userUri?: string | null
  }
}

export function CalendlyOAuthSetup({ mentorId, calendlyData }: CalendlyOAuthSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for success or error parameters in URL
    const successParam = searchParams?.get("success")
    const errorParam = searchParams?.get("error")

    if (successParam === "true") {
      setSuccess(true)
      // Clean up URL
      router.replace("/dashboard/calendly")
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // Clean up URL
      router.replace("/dashboard/calendly")
    }
  }, [searchParams, router])

  const handleConnect = async () => {
    setIsConnecting(true)
    window.location.href = "/api/calendly/oauth"
  }

  const isConnected = !!calendlyData?.username
  const tokenExpiresAt = calendlyData?.expiresAt ? new Date(calendlyData.expiresAt) : null
  const isTokenExpired = tokenExpiresAt ? tokenExpiresAt < new Date() : false
  const hasUserUri = !!calendlyData?.userUri

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to Calendly</CardTitle>
        <CardDescription>Link your Calendly account to allow clients to book sessions automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Successfully Connected!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your Calendly account has been connected. Clients can now book sessions with you directly.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Connection Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {isConnected ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium">Connected to Calendly</h3>
              </div>
              <p className="text-sm text-gray-600">
                Username: <span className="font-medium">{calendlyData?.username}</span>
              </p>

              {!hasUserUri && (
                <div className="mt-4">
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing User URI</AlertTitle>
                    <AlertDescription>
                      Your Calendly connection is missing some required data. Please reconnect your account.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {isTokenExpired && (
                <div className="mt-4">
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Expired</AlertTitle>
                    <AlertDescription>
                      Please reconnect your Calendly account to continue receiving bookings.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="mt-4">
                <Button variant="outline" onClick={handleConnect} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reconnect Account
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="font-medium mb-2">Connect Your Calendly Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connecting your account will allow clients to book sessions with you directly through our platform.
              </p>
              <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center gap-2">
                {isConnecting ? "Connecting..." : "Connect to Calendly"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <h4 className="text-sm font-semibold mb-2">Don't have a Calendly account?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Calendly is a free scheduling tool that lets you set your availability preferences and share a booking link
          with your clients.
        </p>
        <Button variant="outline" asChild>
          <a
            href="https://calendly.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            Sign up for Calendly
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
