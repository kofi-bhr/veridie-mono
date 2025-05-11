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
  const [apiResponse, setApiResponse] = useState<any>(null)

  const checkConnection = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Checking Calendly connection for user:", user.id)
      const res = await fetch(`/api/calendly/simple-info?userId=${user.id}`)

      // Store the raw response text for debugging
      const responseText = await res.text()
      console.log("Raw API response:", responseText)

      // Try to parse the response as JSON
      let data
      try {
        data = JSON.parse(responseText)
        setApiResponse(data)
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error(`Failed to parse API response: ${responseText}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setCalendlyUsername(data.username)
      setIsConnected(data.isConnected)
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
    }

    // Check for success in URL
    if (urlParams.get("success") === "true") {
      // Clear any previous errors
      setError(null)
    }

    // Check user's Calendly connection
    if (user) {
      checkConnection()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const handleConnect = () => {
    // Use the exact URL format that works
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
              <p className="mb-4">
                Your Calendly account <strong>{calendlyUsername}</strong> is connected.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/dashboard/services">Manage Services</Link>
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
                      Refresh Status
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">Connect your Calendly account to allow clients to schedule appointments with you.</p>
              <div className="flex gap-4">
                <Button onClick={handleConnect}>Connect to Calendly</Button>
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
                      Refresh Status
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug section - only visible when there's an error */}
      {error && (
        <div className="mt-8 p-4 border border-gray-200 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
          <p className="text-sm text-gray-600 mb-2">User ID: {user?.id}</p>
          {apiResponse && (
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
