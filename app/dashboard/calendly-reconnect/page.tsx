"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function CalendlyReconnectPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?error=Authentication required to access this page")
    }
  }, [user, loading, router])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      // Get the redirect URL from the server
      const response = await fetch("/api/calendly/oauth", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get Calendly authorization URL")
      }

      const data = await response.json()

      // Redirect to Calendly for authorization
      window.location.href = data.url
    } catch (err) {
      console.error("Error connecting to Calendly:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setIsConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>You need to be logged in to reconnect your Calendly account.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reconnect Calendly
          </CardTitle>
          <CardDescription>
            Your Calendly connection has expired. Reconnect to continue using Calendly features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            When you reconnect, you'll be redirected to Calendly to authorize access to your account. After
            authorization, you'll be redirected back to this application.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
            {isConnecting ? "Connecting..." : "Reconnect Calendly"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
