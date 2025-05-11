"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function StripeConnectSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [accountId, setAccountId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    // Clear the localStorage flag
    localStorage.removeItem("stripeConnectInProgress")

    const fetchStripeAccount = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/stripe/account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch account status")
        }

        const data = await response.json()
        setAccountId(data.accountId)

        toast({
          title: "Stripe Connected",
          description: "Your Stripe account has been connected successfully!",
        })
      } catch (error) {
        console.error("Error fetching Stripe account:", error)
        toast({
          title: "Warning",
          description: "We couldn't verify your Stripe account status. You may need to reconnect.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStripeAccount()
  }, [user?.id, toast])

  const goToServices = () => {
    router.push("/dashboard/services")
  }

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto py-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Verifying Stripe Connection</CardTitle>
            <CardDescription>Please wait while we verify your Stripe account...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-20">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle>Stripe Account Connected</CardTitle>
          <CardDescription>
            {accountId
              ? "Your Stripe account has been successfully connected to Veridie."
              : "We couldn't verify your Stripe account. You may need to reconnect."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {accountId && (
            <p className="text-sm text-muted-foreground mb-6 text-center">
              You can now add services and receive payments from students. It may take a few minutes for all Stripe
              features to be fully activated.
            </p>
          )}
          <Button onClick={goToServices} className="w-full">
            Go to Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
