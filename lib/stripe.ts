import Stripe from "stripe"

// Initialize Stripe
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    console.error("Missing STRIPE_SECRET_KEY environment variable")
    return null
  }

  try {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
    return stripeInstance
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
    return null
  }
}

// Check if we're using live mode
export function isStripeLiveMode(): boolean {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  return stripeSecretKey?.startsWith("sk_live_") || false
}

// For client-side usage (publishable key)
export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
}

// Export the getStripe function as the default
export default getStripe()
