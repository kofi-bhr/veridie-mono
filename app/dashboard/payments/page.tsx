"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, AlertCircle, ExternalLink, CreditCard } from "lucide-react"
import Link from "next/link"

interface StripeAccount {
  id: string
  details_submitted: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchStripeAccount = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch Stripe account details
        const accountRes = await fetch("/api/stripe/account")
        if (!accountRes.ok) {
          throw new Error("Failed to fetch Stripe account")
        }
        const accountData = await accountRes.json()

        if (accountData.account) {
          setStripeAccount(accountData.account)

          // If account exists, fetch dashboard link
          const dashboardRes = await fetch("/api/stripe/dashboard-link")
          if (dashboardRes.ok) {
            const dashboardData = await dashboardRes.json()
            if (dashboardData.url) {
              setDashboardUrl(dashboardData.url)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Stripe data:", err)
        setError("Failed to load payment information. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchStripeAccount()
  }, [user])

  const isFullySetup =
    stripeAccount?.details_submitted && stripeAccount?.charges_enabled && stripeAccount?.payouts_enabled

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !stripeAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect with Stripe</CardTitle>
            <CardDescription>You need to connect your Stripe account to receive payments from clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Stripe allows you to securely receive payments from clients. Setting up is quick and easy.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/services">
              <Button>
                Set up Stripe
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stripe Connection Status</CardTitle>
                {isFullySetup && (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>
              <CardDescription>Your Stripe account is used to process payments from clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatusCard
                    title="Account Setup"
                    status={stripeAccount.details_submitted}
                    description={
                      stripeAccount.details_submitted
                        ? "Your account details have been submitted"
                        : "Please complete your account setup"
                    }
                  />
                  <StatusCard
                    title="Payment Processing"
                    status={stripeAccount.charges_enabled}
                    description={
                      stripeAccount.charges_enabled ? "You can accept payments" : "Payment processing not enabled yet"
                    }
                  />
                  <StatusCard
                    title="Payouts"
                    status={stripeAccount.payouts_enabled}
                    description={stripeAccount.payouts_enabled ? "You can receive payouts" : "Payouts not enabled yet"}
                  />
                </div>

                {!isFullySetup && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                      Your Stripe account setup is incomplete. Please complete the setup to start receiving payments.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {dashboardUrl && (
                <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    Go to Stripe Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}

              {!isFullySetup && (
                <Link href="/dashboard/services">
                  <Button>Complete Setup</Button>
                </Link>
              )}
            </CardFooter>
          </Card>

          {isFullySetup && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>You can accept the following payment methods.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-8 bg-blue-50 rounded">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Credit & Debit Cards</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function StatusCard({ title, status, description }: { title: string; status: boolean; description: string }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center mb-2">
        {status ? (
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
        )}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
