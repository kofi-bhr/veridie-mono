"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  const handleSetupAccount = async () => {
    setIsLoading(true)
    try {
      const url = await onSetupAccount()
      if (url) {
        window.location.href = url
      } else {
        toast({
          title: "Error",
          description
