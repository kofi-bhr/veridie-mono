"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CalendlyPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calendlyUsername, setCalendlyUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchCalendlyInfo = async () => {
      try {
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
            setIsLoading(false)
            return
          }

          const errorText = await response.text().catch(() => "Unknown error")
          throw new Error(`API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        setCalendlyUsername(data.calendlyUsername || null)
        setIsConnected(!!data.calendlyUsername)
      } catch (err: any) {
        console.error("Error fetching Calendly info:", err)
        setError(err.message || "Failed to load Calendly information")

        // Even if there's an error, we'll assume not connected
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendlyInfo()
  }, [user])

  // For development/preview environments, provide a way to bypass the API
  const handleDevelopmentConnect = () => {
    // This is just for development/preview to bypass the API
    setCalendlyUsername("development_user")
    setIsConnected(true)
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
          <CardTitle>Connect Your Calendly Account</CardTitle>
          <CardDescription>Link your Calendly account to enable scheduling for your services.</CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div>
              <p className="mb-4">
                Your Calendly account <strong>{calendlyUsername}</strong> is connected.
              </p>
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
                    window.location.href = "/api/calendly/oauth"
                  }
                }}
              >
                Connect to Calendly
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
