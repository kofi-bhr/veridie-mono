"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"

export function StripeConnectSection() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null)

  useEffect(() => {
    async function checkStripeConnection() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/stripe/account")

        if (!res.ok) {
          throw new Error("Failed to check Stripe connection")
        }

        const data = await res.json()
        setIsConnected(data.isConnected)
        setAccountId(data.accountId || null)

        if (data.isConnected) {
          // Get dashboard link
          const dashRes = await fetch("/api/stripe/dashboard-link")
          if (dashRes.ok) {
            const dashData = await dashRes.json()
            setDashboardUrl(dashData.url)
          }
        }
      } catch (err) {
        console.error("Error checking Stripe connection:", err)
        setError("Failed to check Stripe connection status")
      } finally {
        setIsLoading(false)
      }
    }

    checkStripeConnection()
  }, [])

  const handleConnectStripe = async () => {
    try {
      const res = await fetch("/api/stripe/connect-account")

      if (!res.ok) {
        throw new Error("Failed to create Stripe Connect account")
      }

      const data = await res.json()
      window.location.href = data.url
    } catch (err) {
      console.error("Error connecting Stripe:", err)
      setError("Failed to connect Stripe account")
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isConnected ? (
          <div className="space-y-4">
            <Alert variant="success" className="bg-green-50 border-green-200">
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
