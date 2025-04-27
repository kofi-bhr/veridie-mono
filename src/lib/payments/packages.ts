import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';

interface PackageData {
  title: string;
  description: string[];
  price: number;
  calendly_link: string;
  consultant_id: string;
  stripe_price_id?: string;
  stripe_product_id?: string;
  is_active?: boolean;
}

export async function createPackage(data: PackageData) {
  try {
    // Validate required fields
    if (!data.calendly_link) {
      return { success: false, error: 'Calendly link is required' };
    }
    if (data.price <= 0) {
      return { success: false, error: 'Price must be positive' };
    }

    // Create Stripe product
    const product = await stripe.products.create({
      name: data.title,
      description: data.description.join('\n'),
    });

    // Create Stripe price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: data.price,
      currency: 'usd',
    });

    // Create package in database
    const { data: pkg, error } = await supabase
      .from('packages')
      .insert({
        title: data.title,
        description: data.description,
        price: data.price,
        calendly_link: data.calendly_link,
        consultant_id: data.consultant_id,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, package: pkg };
  } catch (error) {
    console.error('Error creating package:', error);
    return { success: false, error: 'Failed to create package' };
  }
}

export async function updatePackage(id: string, data: Partial<PackageData>) {
  try {
    // Get current package
    const { data: pkg, error: fetchError } = await supabase
      .from('packages')
      .select('stripe_product_id, stripe_price_id')
      .eq('id', id)
      .single();

    if (fetchError || !pkg) {
      throw new Error('Package not found');
    }

    // Update Stripe product if title or description changed
    if (data.title || data.description) {
      await stripe.products.update(pkg.stripe_product_id, {
        name: data.title,
        description: data.description?.join('\n'),
      });
    }

    // Create new price if price changed
    if (data.price) {
      const price = await stripe.prices.create({
        product: pkg.stripe_product_id,
        unit_amount: data.price,
        currency: 'usd',
      });

      // Update package with new price ID
      data.stripe_price_id = price.id;
    }

    // Update package in database
    const { data: updatedPkg, error: updateError } = await supabase
      .from('packages')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return { success: true, package: updatedPkg };
  } catch (error) {
    console.error('Error updating package:', error);
    return { success: false, error: 'Failed to update package' };
  }
}

export async function deletePackage(id: string) {
  try {
    // Get package
    const { data: pkg, error: fetchError } = await supabase
      .from('packages')
      .select('stripe_product_id')
      .eq('id', id)
      .single();

    if (fetchError || !pkg) {
      throw new Error('Package not found');
    }

    // Archive Stripe product
    await stripe.products.del(pkg.stripe_product_id);

    // Delete package from database
    const { error: deleteError } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting package:', error);
    return { success: false, error: 'Failed to delete package' };
  }
}
