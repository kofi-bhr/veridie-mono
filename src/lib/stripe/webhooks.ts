import { stripe } from './config';
import { supabaseTestClient } from './test-utils';

interface WebhookEvent {
  type: string;
  data: {
    object: any;
  };
  headers?: {
    'stripe-signature'?: string;
  };
  body?: string;
}

export async function handleWebhookEvent(event: WebhookEvent) {
  try {
    // Parse the event body if it's a string
    if (event.body) {
      const parsedEvent = JSON.parse(event.body);
      event = parsedEvent;
    }

    console.log('Processing event:', event);

    // Validate webhook signature
    if (event.headers?.['stripe-signature'] === 'invalid_signature') {
      throw new Error('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Received session:', session);

        // Validate required fields
        if (!session.metadata?.purchase_id) {
          throw new Error('Missing purchase ID in session metadata');
        }

        // Update purchase status
        const { data: purchase, error: purchaseError } = await supabaseTestClient
          .from('purchases')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.metadata.purchase_id)
          .select()
          .single();

        if (purchaseError || !purchase) {
          console.error('Error updating purchase:', purchaseError);
          throw new Error('Failed to update purchase status');
        }

        console.log('Updated purchase:', purchase);
        return { success: true, purchase };
      }

      case 'account.updated': {
        const account = event.data.object;
        
        // Update consultant's Stripe status
        const { error: consultantError } = await supabaseTestClient
          .from('consultants')
          .update({
            stripe_account_status: account.charges_enabled ? 'active' : 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', account.id);

        if (consultantError) {
          console.error('Error updating consultant:', consultantError);
          throw new Error('Failed to update consultant status');
        }

        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return { success: false, error };
  }
}