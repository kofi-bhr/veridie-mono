import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe/client';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get consultant profile
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (consultantError || !consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 });
    }

    if (!consultant.stripe_account_id) {
      return NextResponse.json({ error: 'No Stripe account connected' }, { status: 400 });
    }

    // Deauthorize the account with Stripe
    await stripe.oauth.deauthorize({
      client_id: process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID!,
      stripe_user_id: consultant.stripe_account_id,
    });

    // Update consultant record
    const { error: updateError } = await supabase
      .from('consultants')
      .update({
        stripe_account_id: null,
        stripe_charges_enabled: false,
        stripe_details_submitted: false,
      })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update consultant record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Stripe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
