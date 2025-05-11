"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar, CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CalendlyPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [calendlyUsername, setCalendlyUsername] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for success or error parameters in URL
    const successParam = searchParams?.get("success")
    const errorParam = searchParams?.get("error")

    if (successParam === "true") {
      setSuccess(true)
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }

    if (user) {
      fetchCalendlyInfo()
    }
  }, [user, searchParams])

  const fetchCalendlyInfo = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/calendly/user-info?userId=${user.id}`)

      if (!response.ok) {
        if (response.status !== 404) {
          // 404 just means no connection yet, not an error to display
          const errorText = await response.text().catch(() => "Unknown error")
          throw new Error(`API error (${response.status}): ${errorText}`)
        }
      } else {
        const data = await response.json()
        setCalendlyUsername(data.username || null)
      }
    } catch (err: any) {
      console.error("Error fetching Calendly info:", err)
      setError(err.message || "Failed to load Calendly information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = () => {
    window.location.href = "/api/calendly/authorize"
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && !error && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Successfully Connected!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Calendly account has been connected. Clients can now book sessions with you directly.
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
          {calendlyUsername ? (
            <div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-6">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Connected to Calendly</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Username: <span className="font-medium">{calendlyUsername}</span>
                </p>
              </div>

              <p className="mb-4">
                Your Calendly account is connected. You can now assign event types to your services.
              </p>

              <Button asChild>
                <Link href="/dashboard/services">Manage Services</Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-4">Connect your Calendly account to allow clients to schedule appointments with you.</p>
              <Button onClick={handleConnect} className="flex items-center gap-2">
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
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
