import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createServerClient } from '@/lib/supabase/server';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing stripe signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    const supabase = createServerClient();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Update booking status
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            status: 'completed',
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('stripe_session_id', session.id);

        if (bookingError) {
          console.error('Error updating booking:', bookingError);
          return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
          );
        }

        // Create transfer record
        const { error: transferError } = await supabase
          .from('transfers')
          .insert({
            booking_id: session.metadata.package_id,
            consultant_id: session.metadata.consultant_id,
            amount: session.amount_total,
            status: 'pending',
            stripe_transfer_id: session.payment_intent,
          });

        if (transferError) {
          console.error('Error creating transfer:', transferError);
          return NextResponse.json(
            { error: 'Failed to create transfer' },
            { status: 500 }
          );
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        // Update booking status
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            status: 'failed',
            payment_status: 'failed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (bookingError) {
          console.error('Error updating booking:', bookingError);
          return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
          );
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 