"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function StripeConnectButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleConnectStripe = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect Stripe",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      toast({
        title: "Connecting to Stripe",
        description: "Please wait while we prepare your Stripe Connect account...",
      })

      console.log("Initiating Stripe Connect for user:", user.id)
      const response = await fetch("/api/stripe/connect-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        let errorMessage = `Server error: ${response.status} ${response.statusText}`

        if (contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (parseError) {
            console.error("Error parsing JSON error response:", parseError)
          }
        } else {
          const errorText = await response.text()
          console.error("Non-JSON error response:", errorText.substring(0, 200) + "...")
          errorMessage = "Server returned an unexpected response format. Please try again later."
        }

        throw new Error(errorMessage)
      }

      let data
      try {
        data = await response.json()
        console.log("Stripe Connect response:", data)
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Invalid response from server. Please try again later.")
      }

      if (data.url) {
        console.log("Redirecting to Stripe Connect:", data.url)
        window.location.href = data.url
      } else {
        throw new Error("No redirect URL returned from server")
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error)
      toast({
        title: "Error connecting Stripe",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleConnectStripe} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Stripe Account"
      )}
    </Button>
  )
}
