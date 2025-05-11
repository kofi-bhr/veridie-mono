"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ExternalLink, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StripeConnectOnboardingProps {
  stripeConnectAccountId: string | null
  isDetailsSubmitted: boolean
  isChargesEnabled: boolean
  isPayoutsEnabled: boolean
  onSetupAccount: () => Promise<string | null>
}

export function StripeConnectOnboarding({
  stripeConnectAccountId,
  isDetailsSubmitted,
  isChargesEnabled,
  isPayoutsEnabled,
  onSetupAccount,
}: StripeConnectOnboardingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSetupAccount = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await onSetupAccount()

      if (response) {
        // Success - redirect to Stripe
        window.location.href = response
      } else {
        setError("Failed to create Stripe Connect account. Please try again.")
        toast({
          title: "Error",
          description: "Failed to create Stripe Connect account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting up Stripe Connect account:", error)

      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again."

      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Connect Account</CardTitle>
        <CardDescription>Set up your Stripe Connect account to receive payments from clients.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stripeConnectAccountId ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Account ID:</span>
              <span className="text-sm text-muted-foreground font-mono">{stripeConnectAccountId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Details Submitted:</span>
              {getStatusBadge(isDetailsSubmitted)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Charges Enabled:</span>
              {getStatusBadge(isChargesEnabled)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payouts Enabled:</span>
              {getStatusBadge(isPayoutsEnabled)}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t set up your Stripe Connect account yet. Set up your account to start receiving payments.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSetupAccount} disabled={isLoading} className="w-full">
          {isLoading ? "Setting up..." : stripeConnectAccountId ? "Complete Account Setup" : "Set Up Stripe Connect"}
          {!isLoading && <ExternalLink className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
