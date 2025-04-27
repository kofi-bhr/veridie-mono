import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { updatePurchaseStatus } from '@/lib/payments/purchases';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new NextResponse('Webhook signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update purchase status
        await updatePurchaseStatus(paymentIntent.id, 'completed' as const);

        // Get purchase details
        const { data: purchase } = await supabase
          .from('purchases')
          .select(`
            *,
            packages:package_id (
              title,
              calendly_link,
              consultants:consultant_id (
                user_id,
                users:user_id (
                  email
                )
              )
            )
          `)
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (purchase) {
          // Send email to customer
          await sendEmail({
            to: purchase.customer_email,
            subject: 'Payment Confirmation - Veridie',
            template: 'payment-success',
            data: {
              customerName: purchase.customer_name,
              packageTitle: purchase.packages.title,
              amount: purchase.amount,
              calendlyLink: purchase.packages.calendly_link,
            },
          });

          // Send email to consultant
          await sendEmail({
            to: purchase.packages.consultants.users.email,
            subject: 'New Purchase - Veridie',
            template: 'new-purchase',
            data: {
              customerName: purchase.customer_name,
              customerEmail: purchase.customer_email,
              packageTitle: purchase.packages.title,
              amount: purchase.amount,
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await updatePurchaseStatus(failedPayment.id, 'failed' as const);
        break;
      }

      case 'charge.refunded': {
        const refund = event.data.object as Stripe.Charge;
        if (refund.payment_intent) {
          await updatePurchaseStatus(refund.payment_intent as string, 'refunded' as const);
        }
        break;
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}