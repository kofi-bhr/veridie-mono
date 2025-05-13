"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"

export function StripeConnectSection() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null)

  const checkStripeConnection = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Use the correct API endpoint path without "/route"
      const res = await fetch("/api/stripe/account")

      // Log response details for debugging
      console.log("Stripe account response status:", res.status)
      console.log("Stripe account response content-type:", res.headers.get("content-type"))

      // Check if response is OK before trying to parse JSON
      if (!res.ok) {
        // Try to get the error message from the response
        let errorMessage = `Failed to check Stripe connection: ${res.status} ${res.statusText}`
        try {
          const errorData = await res.text()
          console.log("Error response text:", errorData)
          errorMessage += ` - ${errorData}`
        } catch (e) {
          // Ignore error reading response body
        }
        throw new Error(errorMessage)
      }

      // Parse the response as JSON directly, with a fallback for text
      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError)
        // Try to get the response as text for debugging
        const textResponse = await res.text()
        console.log("Response text:", textResponse)
        throw new Error(`Failed to parse JSON response: ${textResponse.substring(0, 100)}...`)
      }

      setIsConnected(data.isConnected)
      setAccountId(data.accountId || null)

      if (data.isConnected && data.accountId) {
        try {
          // Get dashboard link
          const dashRes = await fetch("/api/stripe/dashboard-link", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accountId: data.accountId }),
          })

          if (dashRes.ok) {
            const dashData = await dashRes.json()
            if (dashData.url) {
              setDashboardUrl(dashData.url)
            }
          }
        } catch (dashErr) {
          console.error("Error getting dashboard link:", dashErr)
          // Don't set main error for dashboard link failure
        }
      }
    } catch (err) {
      console.error("Error checking Stripe connection:", err)
      setError(err instanceof Error ? err.message : "Failed to check Stripe connection status")
      setIsConnected(false)
      setAccountId(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkStripeConnection()
  }, [])

  const handleConnectStripe = async () => {
    try {
      setError(null)
      const res = await fetch("/api/stripe/connect-account")

      if (!res.ok) {
        throw new Error(`Failed to create Stripe Connect account: ${res.status} ${res.statusText}`)
      }

      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError)
        const textResponse = await res.text()
        throw new Error(`Failed to parse JSON response: ${textResponse.substring(0, 100)}...`)
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No redirect URL received from Stripe")
      }
    } catch (err) {
      console.error("Error connecting Stripe:", err)
      setError(err instanceof Error ? err.message : "Failed to connect Stripe account")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Connect Account</CardTitle>
        <CardDescription>Connect your Stripe account to receive payments from clients</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Checking Stripe connection...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
            </Alert>
            <Button onClick={checkStripeConnection} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Connected</AlertTitle>
              <AlertDescription className="text-green-700">
                Your Stripe account is connected and ready to receive payments.
                {accountId && <div className="mt-1 text-sm">Account ID: {accountId}</div>}
              </AlertDescription>
            </Alert>

            {dashboardUrl && (
              <Button variant="outline" asChild className="mt-2">
                <Link href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Stripe Dashboard
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p>Connect your Stripe account to receive payments from clients.</p>
            <Button onClick={handleConnectStripe}>Connect Stripe Account</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
