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
        if (!session.id || !session.client_reference_id || !session.metadata?.consultant_id) {
          throw new Error('Missing required fields in session');
        }

        // Validate package exists
        const { data: pkg } = await supabaseTestClient
          .from('packages')
          .select()
          .eq('id', session.client_reference_id)
          .single();

        if (!pkg) {
          throw new Error('Package not found');
        }

        // Validate consultant exists
        const { data: consultant } = await supabaseTestClient
          .from('consultants')
          .select()
          .eq('id', session.metadata.consultant_id)
          .single();

        if (!consultant) {
          throw new Error('Consultant not found');
        }

        // Validate payment status
        if (session.payment_status !== 'paid') {
          throw new Error('Invalid payment status');
        }

        // Validate currency
        if (session.currency !== 'usd') {
          throw new Error('Invalid currency');
        }

        // Validate amount
        if (session.amount_total <= 0) {
          throw new Error('Invalid amount');
        }

        // Check for duplicate session
        const { data: existingBooking } = await supabaseTestClient
          .from('bookings')
          .select()
          .eq('stripe_session_id', session.id)
          .single();

        if (existingBooking) {
          throw new Error('Duplicate session ID');
        }
        
        // Create a booking record
        const { data: booking, error } = await supabaseTestClient
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

        console.log('Created booking:', booking);
        return { success: true, booking };
      }

      default:
        return { success: true };
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return { success: false, error };
  }
} 