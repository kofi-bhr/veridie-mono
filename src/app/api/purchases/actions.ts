'use server';

import { createServerClient } from '@/lib/supabase/server';
import { PurchaseInsert, PurchaseStatus } from '@/types/packages';
import { revalidatePath } from 'next/cache';

export async function createPurchase(data: PurchaseInsert): Promise<{
  success: boolean;
  error?: string;
  purchase?: { id: string };
}> {
  try {
    const supabase = createServerClient();

    // Create purchase record
    const { data: purchase, error } = await supabase
      .from('purchases')
      .insert(data)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating purchase:', error);
      return {
        success: false,
        error: 'Failed to create purchase record'
      };
    }

    // Revalidate relevant pages
    revalidatePath('/profile/purchases');
    revalidatePath(`/packages/${data.package_id}`);

    return {
      success: true,
      purchase
    };
  } catch (error) {
    console.error('Error in createPurchase:', error);
    return {
      success: false,
      error: 'Failed to create purchase'
    };
  }
}

export async function updatePurchaseStatus(
  id: string,
  status: PurchaseStatus
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from('purchases')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating purchase status:', error);
      return {
        success: false,
        error: 'Failed to update purchase status'
      };
    }

    // Revalidate relevant pages
    revalidatePath('/profile/purchases');

    return { success: true };
  } catch (error) {
    console.error('Error in updatePurchaseStatus:', error);
    return {
      success: false,
      error: 'Failed to update purchase status'
    };
  }
}

export async function trackContactInitiated(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from('purchases')
      .update({
        contact_initiated: true,
        contact_initiated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error tracking contact initiation:', error);
      return {
        success: false,
        error: 'Failed to update contact status'
      };
    }

    // Revalidate relevant pages
    revalidatePath('/profile/purchases');

    return { success: true };
  } catch (error) {
    console.error('Error in trackContactInitiated:', error);
    return {
      success: false,
      error: 'Failed to track contact initiation'
    };
  }
}

export async function trackCalendlyScheduled(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from('purchases')
      .update({
        calendly_scheduled: true,
        calendly_scheduled_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error tracking Calendly scheduling:', error);
      return {
        success: false,
        error: 'Failed to update scheduling status'
      };
    }

    // Revalidate relevant pages
    revalidatePath('/profile/purchases');

    return { success: true };
  } catch (error) {
    console.error('Error in trackCalendlyScheduled:', error);
    return {
      success: false,
      error: 'Failed to track scheduling'
    };
  }
}
