"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

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
        const response = await fetch(`/api/calendly/info?userId=${user.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            // Not found is okay, just means no connection yet
            setIsConnected(false)
            return
          }
          throw new Error("Failed to fetch Calendly information")
        }

        const data = await response.json()
        setCalendlyUsername(data.calendlyUsername || null)
        setIsConnected(!!data.calendlyUsername)
      } catch (err: any) {
        console.error("Error fetching Calendly info:", err)
        setError(err.message || "Failed to load Calendly information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendlyInfo()
  }, [user])

  const handleSetupClick = () => {
    window.location.href = "/setup-calendly-oauth"
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
              <Button variant="outline" onClick={handleSetupClick}>
                Run Database Setup
              </Button>
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
              <Button>Manage Calendly Settings</Button>
            </div>
          ) : (
            <div>
              <p className="mb-4">Connect your Calendly account to allow clients to schedule appointments with you.</p>
              <Button onClick={() => (window.location.href = "/api/calendly/oauth")}>Connect to Calendly</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
