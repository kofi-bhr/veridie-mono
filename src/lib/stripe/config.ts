import Stripe from 'stripe';

// Only check for STRIPE_SECRET_KEY on the server side
if (typeof window === 'undefined' && !process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

// Initialize Stripe on the server side
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
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