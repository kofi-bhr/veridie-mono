import { stripe } from './config';
import { supabaseTestClient } from './test-utils';

interface WebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

export async function handleWebhookEvent(event: WebhookEvent) {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Create a booking record
        const { error } = await supabaseTestClient
          .from('bookings')
          .insert({
            package_id: session.client_reference_id,
            consultant_id: session.metadata.consultant_id,
            stripe_session_id: session.id,
            status: 'completed',
            payment_status: session.payment_status,
            customer_id: session.customer,
            amount_total: session.amount_total,
            currency: session.currency,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating booking:', error);
          throw error;
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