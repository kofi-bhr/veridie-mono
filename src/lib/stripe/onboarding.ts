import { stripe } from './config';
import { supabaseTestClient } from './test-utils';

export async function verifyOnboarding(consultantId: string): Promise<boolean> {
  try {
    // Get consultant's Stripe account ID
    const { data: consultant, error: consultantError } = await supabaseTestClient
      .from('consultants')
      .select('stripe_account_id')
      .eq('id', consultantId)
      .single();

    if (consultantError || !consultant) {
      console.error('Error fetching consultant:', consultantError);
      return false;
    }

    // Verify Stripe account status
    const account = await stripe.accounts.retrieve(consultant.stripe_account_id);
    
    return account.charges_enabled && 
           account.payouts_enabled && 
           account.details_submitted;
  } catch (error) {
    console.error('Error verifying onboarding:', error);
    return false;
  }
} 