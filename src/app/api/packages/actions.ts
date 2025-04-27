'use server';

import { createServerClient } from '@/lib/supabase/server';
import { PackageInsert, PackageUpdate } from '@/types/packages';
import { revalidatePath } from 'next/cache';

export async function validateCalendlyLink(link: string): Promise<{ 
  valid: boolean; 
  error?: string;
}> {
  try {
    // Basic validation
    if (!link) {
      return { valid: false, error: 'Calendly link is required' };
    }

    // Check if it's a valid Calendly URL
    const validUrl = /^https:\/\/calendly\.com\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?$/;
    if (!validUrl.test(link)) {
      return { 
        valid: false, 
        error: 'Invalid Calendly link format. Should be like: https://calendly.com/username/event' 
      };
    }

    // TODO: Could add actual Calendly API validation here if needed

    return { valid: true };
  } catch (error) {
    console.error('Error validating Calendly link:', error);
    return { 
      valid: false, 
      error: 'Failed to validate Calendly link' 
    };
  }
}

export async function createPackage(data: PackageInsert): Promise<{ 
  success: boolean; 
  error?: string;
  package?: { id: string };
}> {
  try {
    const supabase = createServerClient();

    // Validate Calendly link if provided
    if (data.calendly_link) {
      const { valid, error } = await validateCalendlyLink(data.calendly_link);
      if (!valid) {
        return { success: false, error };
      }
    }

    // Create package
    const { data: pkg, error } = await supabase
      .from('packages')
      .insert(data)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating package:', error);
      return { 
        success: false, 
        error: 'Failed to create package' 
      };
    }

    // Revalidate relevant pages
    revalidatePath('/profile/consultant/packages');
    revalidatePath('/packages');

    return { 
      success: true, 
      package: pkg 
    };
  } catch (error) {
    console.error('Error in createPackage:', error);
    return { 
      success: false, 
      error: 'Failed to create package' 
    };
  }
}

export async function updatePackage(id: string, data: PackageUpdate): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const supabase = createServerClient();

    // Validate Calendly link if provided
    if (data.calendly_link) {
      const { valid, error } = await validateCalendlyLink(data.calendly_link);
      if (!valid) {
        return { success: false, error };
      }
    }

    // Update package
    const { error } = await supabase
      .from('packages')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating package:', error);
      return { 
        success: false, 
        error: 'Failed to update package' 
      };
    }

    // Revalidate relevant pages
    revalidatePath('/profile/consultant/packages');
    revalidatePath('/packages');
    revalidatePath(`/packages/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error in updatePackage:', error);
    return { 
      success: false, 
      error: 'Failed to update package' 
    };
  }
}
