import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    try {
      stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16", // Use the latest stable API version
      })
      console.log("Stripe initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Stripe:", error)
      return null
    }
  }

  if (!stripeInstance) {
    console.error("Stripe not initialized: Missing STRIPE_SECRET_KEY")
  }

  return stripeInstance
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
