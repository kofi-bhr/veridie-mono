"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CalendlyPage() {
  const { user } = useAuth()
  const [calendlyUsername, setCalendlyUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error in URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    if (errorParam) {
      if (errorParam === "rate_limited") {
        setError("Calendly API rate limit exceeded. Please try again in a few minutes.")
      } else {
        setError(`Connection error: ${errorParam}`)
      }
    }

    // Check for success in URL
    if (urlParams.get("success") === "true") {
      // Clear any previous errors
      setError(null)
    }

    // Check user's Calendly connection
    if (user) {
      setIsLoading(true)
      fetch(`/api/calendly/simple-info?userId=${user.id}`)
        .then((res) => {
          // Don't throw on non-200 responses, just log and continue
          if (!res.ok) {
            console.warn(`API returned status: ${res.status}`)
          }
          return res.json()
        })
        .then((data) => {
          if (data.error) {
            console.warn("API returned error:", data.error)
            // Don't set error state, just log it
          }

          setCalendlyUsername(data.username)
          setIsConnected(data.isConnected)
        })
        .catch((err) => {
          console.error("Error checking Calendly connection:", err)
          // Don't show error to user, just log it
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [user])

  const handleConnect = () => {
    // Direct redirect to authorize endpoint
    window.location.href = "/api/calendly/simple-auth"
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Calendly Integration</h1>
        <p>Please log in to connect your Calendly account.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/login">Log In</Link>
        </Button>
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Connect Your Calendly Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Checking connection status...</p>
            </div>
          ) : isConnected ? (
            <div>
              <p className="mb-4">
                Your Calendly account <strong>{calendlyUsername}</strong> is connected.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/dashboard/services">Manage Services</Link>
                </Button>
                <Button variant="outline" onClick={handleConnect}>
                  Reconnect Calendly
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">Connect your Calendly account to allow clients to schedule appointments with you.</p>
              <Button onClick={handleConnect}>Connect to Calendly</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
