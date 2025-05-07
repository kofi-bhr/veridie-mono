"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StripeConnectButton } from "./stripe-connect-button"
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StripeAccount {
  id: string
  details_submitted: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
}

export function StripeConnectSection() {
  const [account, setAccount] = useState<StripeAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [skipStripe, setSkipStripe] = useState(false)
  const { toast } = useToast()

  // Check for Stripe onboarding success/failure
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeStatus = params.get("stripe")

    if (stripeStatus === "success") {
      toast({
        title: "Stripe Connected",
        description: "Your Stripe account has been successfully connected.",
      })
      // Remove the query parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    } else if (stripeStatus === "refresh") {
      toast({
        title: "Stripe Setup Incomplete",
        description: "Please complete your Stripe account setup.",
        variant: "destructive",
      })
      // Remove the query parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [toast])

  useEffect(() => {
    // If we're skipping Stripe, don't fetch the account
    if (skipStripe) {
      setLoading(false)
      return
    }

    async function fetchAccount() {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching Stripe account...")
        const response = await fetch("/api/stripe/account", {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        })

        console.log("Stripe account response status:", response.status)

        if (!response.ok) {
          if (response.status >= 500) {
            console.warn(`Stripe API returned ${response.status}, assuming no account is connected yet`)
            setAccount(null)
            setLoading(false)
            return
          }

          let errorText
          try {
            const errorData = await response.json()
            errorText = errorData.error || "Unknown error"
          } catch (e) {
            errorText = await response.text().catch(() => "Unknown error")
          }

          console.error("Error response:", errorText)

          if (response.status === 401) {
            throw new Error("Please log in to access your Stripe account")
          } else {
            throw new Error(`Failed to fetch account: ${errorText}`)
          }
        }

        try {
          const data = await response.json()
          console.log("Stripe account data:", data)
          setAccount(data.account)
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError)
          setAccount(null)
        }
      } catch (err) {
        console.error("Error fetching Stripe account:", err)
        if (
          err instanceof Error &&
          (err.message.includes("500") ||
            err.message.includes("Internal server error") ||
            err.message.includes("Failed to fetch"))
        ) {
          setAccount(null)
        } else {
          setError(err instanceof Error ? err.message : "Failed to load account information")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [retryCount, skipStripe])

  const retryFetch = () => {
    setRetryCount((prev) => prev + 1)
  }

  const handleSkipStripe = () => {
    setSkipStripe(true)
    setAccount({
      id: "dev-mode",
      details_submitted: true,
      charges_enabled: true,
      payouts_enabled: true,
    })
  }

  const openDashboard = async () => {
    try {
      const response = await fetch("/api/stripe/dashboard-link", {
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error("Error response:", errorText)
        throw new Error(`Failed to create dashboard link: ${response.status}`)
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError)
        throw new Error("Invalid response format from server")
      }

      if (!data || !data.url) {
        throw new Error("Invalid dashboard link response")
      }

      window.open(data.url, "_blank")
    } catch (err) {
      console.error("Error opening dashboard:", err)
      setError(err instanceof Error ? err.message : "Failed to open Stripe dashboard")
    }
  }

  // For development/preview environments, allow bypassing Stripe
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("localhost")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Connect</CardTitle>
        <CardDescription>Connect your Stripe account to receive payments from clients</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md flex flex-col items-start gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={retryFetch}>
                Retry
              </Button>
              {isDevelopment && (
                <Button variant="outline" size="sm" onClick={handleSkipStripe}>
                  Skip Stripe Setup
                </Button>
              )}
            </div>
          </div>
        ) : !account ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <StripeConnectButton />

              {isDevelopment && (
                <Button variant="outline" onClick={handleSkipStripe}>
                  Skip Stripe Setup (Development Mode)
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800">Stripe Connected</h3>
                <p className="text-sm text-green-700">Your Stripe account is connected.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border rounded-md p-3">
                <div className="text-sm font-medium">Account Setup</div>
                <div className="mt-1 flex items-center">
                  {account.details_submitted ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  )}
                  <span className="text-sm">{account.details_submitted ? "Complete" : "Incomplete"}</span>
                </div>
              </div>

              <div className="border rounded-md p-3">
                <div className="text-sm font-medium">Payment Status</div>
                <div className="mt-1 flex items-center">
                  {account.charges_enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  )}
                  <span className="text-sm">
                    {account.charges_enabled ? "Ready to receive payments" : "Not ready for payments"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {account && !skipStripe && (
        <CardFooter>
          <Button onClick={openDashboard} variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Stripe Dashboard
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
