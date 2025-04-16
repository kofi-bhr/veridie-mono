import { stripe } from './config';
import { supabaseTestClient } from './test-utils';

interface CreateCheckoutSessionParams {
  packageId: string;
  consultantId: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  packageId,
  consultantId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  // Validate inputs
  if (!packageId || !consultantId) {
    throw new Error('Package ID and consultant ID are required');
  }

  if (!successUrl || !cancelUrl) {
    throw new Error('Success and cancel URLs are required');
  }

  // Get the package details from the database
  const { data: pkg, error: packageError } = await supabaseTestClient
    .from('packages')
    .select()
    .eq('id', packageId)
    .single();

  if (packageError || !pkg) {
    throw new Error('Package not found');
  }

  // Verify consultant exists
  const { data: consultant, error: consultantError } = await supabaseTestClient
    .from('consultants')
    .select()
    .eq('id', consultantId)
    .single();

  if (consultantError || !consultant) {
    throw new Error('Consultant not found');
  }

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: pkg.stripe_price_id,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: packageId,
    metadata: {
      consultant_id: consultantId,
    },
  });

  return session;
} 