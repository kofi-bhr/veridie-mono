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

      // Show a loading toast to indicate the process has started
      toast({
        title: "Connecting to Stripe",
        description: "Please wait while we prepare your Stripe Connect account...",
      })

      const response = await fetch("/api/stripe/connect-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        let errorMessage = `Server error: ${response.status} ${response.statusText}`

        // Handle different response types
        if (contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (parseError) {
            console.error("Error parsing JSON error response:", parseError)
          }
        } else {
          // For HTML or other non-JSON responses
          const errorText = await response.text()
          console.error("Non-JSON error response:", errorText.substring(0, 200) + "...")
          errorMessage = "Server returned an unexpected response format. Please try again later."
        }

        throw new Error(errorMessage)
      }

      // Parse JSON response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Invalid response from server. Please try again later.")
      }

      // Redirect to Stripe Connect onboarding immediately
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
      setIsLoading(false) // Only reset loading state on error
    }
    // Note: We don't set isLoading to false on success because we're redirecting
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
