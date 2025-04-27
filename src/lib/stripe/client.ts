import Stripe from 'stripe';
import { toast } from 'sonner';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function disconnectStripeAccount() {
  try {
    const response = await fetch('/api/stripe/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to disconnect Stripe account');
    }

    toast.success('Successfully disconnected Stripe account');
    return true;
  } catch (error) {
    console.error('Error disconnecting Stripe:', error);
    toast.error('Failed to disconnect Stripe account');
    return false;
  }
}

export async function reconnectStripeAccount() {
  try {
    // Get OAuth link from server
    const response = await fetch('/api/stripe/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get Stripe connect URL');
    }

    // Redirect to Stripe
    window.location.href = data.url;
    return true;
  } catch (error) {
    console.error('Error reconnecting Stripe:', error);
    toast.error('Failed to reconnect Stripe account');
    return false;
  }
}
