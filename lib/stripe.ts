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

// For client-side usage (publishable key)
export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
}

// Mock implementation for when Stripe key isn't available
function createMockStripe() {
  console.warn("Using mock Stripe implementation because STRIPE_SECRET_KEY is not available")

  // This mock object mimics the Stripe API's shape for the methods we use
  return {
    checkout: {
      sessions: {
        create: async () => ({
          id: "mock_session_id",
          url: "#mock-checkout-url",
          payment_intent: "mock_payment_intent_id",
        }),
        retrieve: async () => ({
          amount_total: 10000,
          payment_intent: "mock_payment_intent_id",
        }),
      },
    },
    accounts: {
      create: async () => ({
        id: "mock_account_id",
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      }),
    },
    accountLinks: {
      create: async () => ({ url: "#mock-account-link" }),
    },
    products: {
      create: async (data: any) => ({
        id: `mock_product_${Date.now()}`,
        name: data.name,
        description: data.description,
      }),
      update: async () => ({}),
    },
    prices: {
      create: async (data: any) => ({
        id: `mock_price_${Date.now()}`,
        product: data.product,
        unit_amount: data.unit_amount,
      }),
    },
    webhooks: {
      constructEvent: () => ({
        type: "mock.event",
        data: { object: { metadata: {} } },
      }),
    },
  } as unknown as Stripe
}

// Create a product in Stripe
export async function createProduct(name: string, description: string) {
  try {
    const stripeClient = getStripe()
    const product = await stripeClient.products.create({
      name,
      description,
    })

    return { product, error: null }
  } catch (error) {
    console.error("Error creating product:", error)
    return { product: null, error }
  }
}

// Create a price for a product
export async function createPrice(productId: string, unitAmount: number) {
  try {
    const stripeClient = getStripe()
    const price = await stripeClient.prices.create({
      product: productId,
      unit_amount: unitAmount * 100, // Convert to cents
      currency: "usd",
    })

    return { price, error: null }
  } catch (error) {
    console.error("Error creating price:", error)
    return { price: null, error }
  }
}

// Calculate application fee (platform fee)
// Platform takes 20% fee
function calculateApplicationFee(amount: string): number {
  const parsedAmount = Number.parseInt(amount)
  return Math.round(parsedAmount * 0.2)
}

// Export the getStripe function as the default
export default getStripe()
