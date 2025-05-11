"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface StripeConnectButtonProps {
  className?: string
  children?: React.ReactNode
}

export function StripeConnectButton({ className, children }: StripeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect your Stripe account",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/connect-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create Stripe Connect account")
      }

      const data = await response.json()

      if (data.url) {
        // Store a flag in localStorage to indicate we're in the Stripe Connect flow
        localStorage.setItem("stripeConnectInProgress", "true")

        // Redirect to Stripe Connect onboarding
        window.location.href = data.url
      } else {
        throw new Error("No redirect URL returned from server")
      }
    } catch (error) {
      console.error("Error connecting to Stripe:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to Stripe",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={isLoading} className={className}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? "Connecting..." : children || "Connect Stripe Account"}
    </Button>
  )
}
