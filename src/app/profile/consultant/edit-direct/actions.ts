'use server';

import { stripe } from '@/lib/stripe/config';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createOnboardingLink(consultantId: string): Promise<{ success: boolean; url?: string }> {
  try {
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    const supabase = createServerClient();

    // First create a Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });

    // Update consultant with Stripe account ID
    const { error: updateError } = await supabase
      .from('consultants')
      .update({
        stripe_account_id: account.id,
        stripe_charges_enabled: false,
        stripe_onboarding_complete: false
      })
      .eq('id', consultantId);

    if (updateError) {
      console.error('Error updating consultant:', updateError);
      return { success: false };
    }

    // Always use HTTPS for Stripe redirects since we're using live mode
    const baseUrl = `https://${process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}`;

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/profile/consultant/edit-direct?stripe=refresh`,
      return_url: `${baseUrl}/profile/consultant/edit-direct?stripe=success`,
      type: 'account_onboarding'
    });

    // Revalidate the page to show updated status
    revalidatePath('/profile/consultant/edit-direct');

    return {
      success: true,
      url: accountLink.url
    };
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    return { success: false };
  }
}

export async function verifyOnboardingStatus(consultantId: string): Promise<{ 
  success: boolean; 
  charges_enabled?: boolean; 
  payouts_enabled?: boolean; 
  details_submitted?: boolean; 
}> {
  try {
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    const supabase = createServerClient();

    // Get consultant's Stripe account ID
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('stripe_account_id')
      .eq('id', consultantId)
      .single();

    if (consultantError || !consultant || !consultant.stripe_account_id) {
      console.error('Error fetching consultant:', consultantError);
      return { success: false };
    }

    // Verify Stripe account status
    const account = await stripe.accounts.retrieve(consultant.stripe_account_id);
    
    // Update consultant's Stripe status
    const { error: updateError } = await supabase
      .from('consultants')
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_onboarding_complete: account.charges_enabled && account.payouts_enabled && account.details_submitted
      })
      .eq('id', consultantId);

    if (updateError) {
      console.error('Error updating consultant status:', updateError);
    }

    // Revalidate the page to show updated status
    revalidatePath('/profile/consultant/edit-direct');

    return {
      success: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted
    };
  } catch (error) {
    console.error('Error verifying onboarding:', error);
    return { success: false };
  }
}
