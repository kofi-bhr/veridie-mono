import { stripe } from './config';
import { supabase } from '@/lib/supabase/client';

export async function createOnboardingLink(consultantId: string): Promise<{ success: boolean; url?: string }> {
  try {
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

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/consultant/edit-direct?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/consultant/edit-direct?stripe=success`,
      type: 'account_onboarding'
    });

    return {
      success: true,
      url: accountLink.url
    };
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    return { success: false };
  }
}

export async function reconnectStripeAccount(consultantId: string): Promise<{ success: boolean; url?: string }> {
  try {
    // Get current Stripe account ID
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('stripe_account_id')
      .eq('id', consultantId)
      .single();

    if (consultantError) {
      console.error('Error fetching consultant:', consultantError);
      return { success: false };
    }

    // If there's an existing account, deactivate it
    if (consultant?.stripe_account_id) {
      try {
        await stripe.accounts.del(consultant.stripe_account_id);
      } catch (error) {
        console.warn('Could not delete old Stripe account:', error);
        // Continue anyway as we want to create a new account
      }
    }

    // Create new account and get onboarding link
    return createOnboardingLink(consultantId);
  } catch (error) {
    console.error('Error reconnecting Stripe account:', error);
    return { success: false };
  }
}

export async function verifyOnboarding(consultantId: string): Promise<{ success: boolean; charges_enabled?: boolean; payouts_enabled?: boolean; details_submitted?: boolean }> {
  try {
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

export async function getLoginLink(consultantId: string): Promise<{ success: boolean; url?: string }> {
  try {
    // Get consultant's Stripe account ID
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('stripe_account_id')
      .eq('id', consultantId)
      .single();

    if (consultantError || !consultant?.stripe_account_id) {
      console.error('Error fetching consultant:', consultantError);
      return { success: false };
    }

    // Create login link for the Stripe account
    const loginLink = await stripe.accounts.createLoginLink(consultant.stripe_account_id);

    return {
      success: true,
      url: loginLink.url
    };
  } catch (error) {
    console.error('Error creating login link:', error);
    return { success: false };
  }
}