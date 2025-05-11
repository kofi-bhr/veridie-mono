"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar, CheckCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function CalendlyPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calendlyUsername, setCalendlyUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionValid, setConnectionValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchCalendlyInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Add a timeout to the fetch request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(`/api/calendly/info?userId=${user.id}`, {
          signal: controller.signal,
        }).catch((err) => {
          console.error("Fetch error:", err)
          throw new Error("Network error when connecting to API. Please try again later.")
        })

        clearTimeout(timeoutId)

        if (!response) {
          throw new Error("Failed to connect to API")
        }

        if (!response.ok) {
          if (response.status === 404) {
            // Not found is okay, just means no connection yet
            setIsConnected(false)
            setConnectionValid(false)
            setIsLoading(false)
            return
          }

          const errorText = await response.text().catch(() => "Unknown error")
          throw new Error(`API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        setCalendlyUsername(data.calendlyUsername || null)
        setIsConnected(!!data.calendlyUsername)

        // If connected, test the connection
        if (data.calendlyUsername) {
          await testConnection()
        } else {
          setConnectionValid(false)
        }
      } catch (err: any) {
        console.error("Error fetching Calendly info:", err)
        setError(err.message || "Failed to load Calendly information")

        // Even if there's an error, we'll assume not connected
        setIsConnected(false)
        setConnectionValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendlyInfo()
  }, [user])

  const testConnection = async () => {
    if (!user) return

    try {
      setIsTestingConnection(true)

      const response = await fetch(`/api/calendly/test-connection?userId=${user.id}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Connection test failed:", errorData)
        setConnectionValid(false)
        return
      }

      const data = await response.json()
      setConnectionValid(data.valid)
    } catch (err) {
      console.error("Error testing connection:", err)
      setConnectionValid(false)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleConnect = () => {
    window.location.href = "/api/calendly/oauth"
  }

  // For development/preview environments, provide a way to bypass the API
  const handleDevelopmentConnect = () => {
    // This is just for development/preview to bypass the API
    setCalendlyUsername("development_user")
    setIsConnected(true)
    setConnectionValid(true)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Calendly Integration</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Calendly Integration</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>

              {/* Development/Preview mode button */}
              {process.env.NODE_ENV !== "production" && (
                <Button variant="outline" className="ml-2" onClick={handleDevelopmentConnect}>
                  Development Mode: Simulate Connected
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Connect Your Calendly Account
          </CardTitle>
          <CardDescription>Link your Calendly account to enable scheduling for your services.</CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div>
              {connectionValid === false && (
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Connection Issue</AlertTitle>
                  <AlertDescription>
                    Your Calendly connection has expired or is invalid. Please reconnect your account.
                  </AlertDescription>
                </Alert>
              )}

              {connectionValid === true && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Connected</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your Calendly account is connected and working properly.
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-4 border rounded-md mb-4">
                <p className="mb-2">
                  Your Calendly account <strong>{calendlyUsername}</strong> is connected.
                </p>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="flex items-center gap-2"
                  >
                    {isTestingConnection ? (
                      <>Testing...</>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  {connectionValid === false && (
                    <Button onClick={handleConnect} className="flex items-center gap-2">
                      Reconnect Calendly
                    </Button>
                  )}
                </div>
              </div>

              <Button asChild>
                <Link href="/dashboard/services">Manage Services</Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-4">Connect your Calendly account to allow clients to schedule appointments with you.</p>
              <Button
                onClick={() => {
                  // In development/preview, we can simulate the connection
                  if (process.env.NODE_ENV !== "production") {
                    handleDevelopmentConnect()
                  } else {
                    handleConnect()
                  }
                }}
              >
                Connect to Calendly
              </Button>
            </div>
          )}
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
              <Calendar className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
