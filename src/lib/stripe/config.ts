import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee

// Stripe webhook secret for verifying webhook signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to calculate platform fee
export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100));
};

// Helper function to calculate consultant amount
export const calculateConsultantAmount = (amount: number): number => {
  return amount - calculatePlatformFee(amount);
}; 