import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/config';
import { calculateConsultantAmount, calculatePlatformFee } from '@/lib/stripe/config';

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { packageId } = await request.json();

    // Get package details from Supabase
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*, consultants(stripe_account_id)')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    if (!packageData.consultants?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Consultant not properly set up for payments' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: packageData.title,
              description: packageData.features.join(', '),
            },
            unit_amount: packageData.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/payment/cancel`,
      payment_intent_data: {
        application_fee_amount: calculatePlatformFee(packageData.price * 100),
        transfer_data: {
          destination: packageData.consultants.stripe_account_id,
        },
      },
      metadata: {
        package_id: packageId,
        user_id: session.user.id,
        consultant_id: packageData.consultant_id,
      },
    });

    // Create booking record in Supabase
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: session.user.id,
        package_id: packageId,
        consultant_id: packageData.consultant_id,
        amount_total: packageData.price,
        amount_consultant: calculateConsultantAmount(packageData.price),
        amount_platform: calculatePlatformFee(packageData.price),
        stripe_session_id: session.id,
        status: 'pending',
        payment_status: 'pending',
      });

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 