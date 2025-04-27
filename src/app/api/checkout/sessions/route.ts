import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const headersList = headers();
    const origin = headersList.get('origin');

    // Get session to identify user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { packageId, consultantId } = body;

    if (!packageId || !consultantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Get consultant details
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('stripe_account_id')
      .eq('id', consultantId)
      .single();

    if (consultantError || !consultant?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Consultant not found or not set up for payments' },
        { status: 400 }
      );
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: session.user.id,
        package_id: packageId,
        consultant_id: consultantId,
        status: 'pending',
      })
      .select('id')
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      );
    }

    // Calculate fees (platform takes 10%)
    const amount = pkg.price * 100; // Convert to cents
    const platformFee = Math.round(amount * 0.1);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pkg.title,
              description: pkg.description || undefined,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/purchases/success?purchase_id=${purchase.id}`,
      cancel_url: `${origin}/packages/${packageId}`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: consultant.stripe_account_id,
        },
      },
      metadata: {
        purchase_id: purchase.id,
        package_id: packageId,
        consultant_id: consultantId,
        user_id: session.user.id,
      },
    });

    // Update purchase with session ID
    await supabase
      .from('purchases')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', purchase.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
