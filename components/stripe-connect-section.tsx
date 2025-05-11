"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, ExternalLink, RefreshCcw } from "lucide-react"
import { StripeConnectButton } from "./stripe-connect-button"

interface StripeConnectSectionProps {
  userId: string
  initialAccountId?: string | null
  initialDetailsSubmitted?: boolean
  initialChargesEnabled?: boolean
  initialPayoutsEnabled?: boolean
}

export function StripeConnectSection({
  userId,
  initialAccountId = null,
  initialDetailsSubmitted = false,
  initialChargesEnabled = false,
  initialPayoutsEnabled = false,
}: StripeConnectSectionProps) {
  const [accountId, setAccountId] = useState<string | null>(initialAccountId)
  const [detailsSubmitted, setDetailsSubmitted] = useState(initialDetailsSubmitted)
  const [chargesEnabled, setChargesEnabled] = useState(initialChargesEnabled)
  const [payoutsEnabled, setPayoutsEnabled] = useState(initialPayoutsEnabled)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchAccountStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch account status")
      }

      const data = await response.json()

      setAccountId(data.accountId)
      setDetailsSubmitted(data.detailsSubmitted)
      setChargesEnabled(data.chargesEnabled)
      setPayoutsEnabled(data.payoutsEnabled)
    } catch (error) {
      console.error("Error fetching account status:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Stripe account status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check URL parameters for Stripe setup completion
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("setup") === "complete" || urlParams.get("stripe") === "success") {
      fetchAccountStatus()
      toast({
        title: "Stripe Setup",
        description: "Your Stripe Connect account setup is in progress. It may take some time to be fully activated.",
      })
    }
  }, [])

  const getStatusBadge = (isEnabled: boolean) => {
    if (isEnabled) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Enabled
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Not Enabled
      </Badge>
    )
  }

  const handleViewDashboard = async () => {
    try {
      const response = await fetch("/api/stripe/dashboard-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create dashboard link")
      }

      const data = await response.json()

      if (data.url) {
        window.open(data.url, "_blank")
      }
    } catch (error) {
      console.error("Error creating dashboard link:", error)
      toast({
        title: "Error",
        description: "Failed to open Stripe dashboard",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountId ? "Stripe Connect Account Connected" : "Stripe Connect Account"}</CardTitle>
        <CardDescription>
          {accountId
            ? "Your Stripe Connect account is set up to receive payments from clients."
            : "Set up your Stripe Connect account to receive payments from clients."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accountId ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Account ID:</span>
              <span className="text-sm text-muted-foreground font-mono">{accountId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Details Submitted:</span>
              {getStatusBadge(detailsSubmitted)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Charges Enabled:</span>
              {getStatusBadge(chargesEnabled)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payouts Enabled:</span>
              {getStatusBadge(payoutsEnabled)}
            </div>
          </>
        ) : (
          <div className="text-center py-4">{/* Empty div to maintain spacing */}</div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {accountId ? (
          <>
            <Button onClick={fetchAccountStatus} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isLoading ? "Refreshing..." : "Refresh Status"}
            </Button>
            <Button onClick={handleViewDashboard} className="w-full sm:w-auto">
              View Stripe Dashboard
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <StripeConnectButton className="w-full">Set Up Stripe Connect</StripeConnectButton>
        )}
      </CardFooter>
    </Card>
  )
}
