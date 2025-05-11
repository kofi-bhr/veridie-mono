"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function CalendlyPage() {
  const { user } = useAuth()
  const [calendlyUsername, setCalendlyUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const checkConnection = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/calendly/simple-info?userId=${user.id}`)

      if (!res.ok) {
        throw new Error(`API returned status: ${res.status}`)
      }

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setCalendlyUsername(data.username)
      setIsConnected(data.isConnected)
      setLastUpdated(data.lastUpdated)
    } catch (err: any) {
      console.error("Error checking Calendly connection:", err)
      setError(err.message || "Failed to check connection")
    } finally {
      setIsLoading(false)
    }
  }

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

      // Clean up URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("error")
      window.history.replaceState({}, "", newUrl.toString())
    }

    // Check for success in URL
    if (urlParams.get("success") === "true") {
      // Clear any previous errors
      setError(null)

      // Clean up URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("success")
      window.history.replaceState({}, "", newUrl.toString())
    }

    // Check user's Calendly connection
    if (user) {
      checkConnection()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const handleConnect = () => {
    // Direct redirect to authorize endpoint
    window.location.href = "/api/calendly/simple-auth"
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await checkConnection()
    setIsRefreshing(false)
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
              <p className="mb-2">
                Your Calendly account <strong>{calendlyUsername}</strong> is connected.
              </p>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mb-4">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/dashboard/services">Manage Services</Link>
                </Button>
                <Button variant="outline" onClick={handleConnect}>
                  Reconnect Calendly
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh Session
                    </>
                  )}
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure you have a Calendly account and are logged in before connecting.</li>
          <li>If you encounter errors, try reconnecting or refreshing your session.</li>
          <li>
            For persistent issues, check your Calendly account status at{" "}
            <a
              href="https://calendly.com/app/profile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              calendly.com
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  )
}
