import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';

interface PurchaseData {
  package_id: string;
  user_id: string;
  consultant_id: string;
}

interface PurchaseStatus {
  calendly_scheduled?: boolean;
  calendly_scheduled_at?: string;
  contact_initiated?: boolean;
  contact_initiated_at?: string;
}

export async function createPurchase(data: PurchaseData) {
  try {
    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('price, stripe_price_id')
      .eq('id', data.package_id)
      .single();

    if (pkgError || !pkg) {
      throw new Error('Package not found');
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        package_id: data.package_id,
        user_id: data.user_id,
        consultant_id: data.consultant_id,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
      })
      .select()
      .single();

    if (purchaseError) {
      throw purchaseError;
    }

    return {
      success: true,
      client_secret: paymentIntent.client_secret,
      purchase,
    };
  } catch (error) {
    console.error('Error creating purchase:', error);
    return { success: false, error: 'Failed to create purchase' };
  }
}

export async function getPurchaseDetails(purchaseId: string) {
  try {
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`
        *,
        package:packages (
          title,
          description,
          price,
          calendly_link
        ),
        consultant:consultants (
          contact_email,
          contact_phone,
          contact_telegram,
          contact_whatsapp
        )
      `)
      .eq('id', purchaseId)
      .single();

    if (error) {
      throw error;
    }

    return { success: true, purchase };
  } catch (error) {
    console.error('Error getting purchase details:', error);
    return { success: false, error: 'Failed to get purchase details' };
  }
}

export async function updatePurchaseStatus(purchaseId: string, status: PurchaseStatus) {
  try {
    const { error } = await supabase
      .from('purchases')
      .update(status)
      .eq('id', purchaseId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating purchase status:', error);
    return { success: false, error: 'Failed to update purchase status' };
  }
}
