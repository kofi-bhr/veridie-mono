'use client';

import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Utility for managing consultant profiles
 * This provides a centralized way to create, check, and manage consultant profiles
 */

/**
 * Check if a consultant profile exists for a user
 * @param userId The user ID to check
 * @returns The consultant profile data if it exists, null otherwise
 */
export const checkConsultantProfile = async (userId: string) => {
  try {
    console.log('Checking if consultant profile exists for user:', userId);
    
    if (!userId) {
      console.error('Cannot check consultant profile: User ID is undefined');
      toast.error('User information is missing');
      return null;
    }
    
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking consultant profile:', error);
      console.error('Error details:', JSON.stringify(error));
      toast.error('Error checking your profile status');
      return null;
    }
    
    if (data) {
      console.log('Found existing consultant profile:', data);
      return data;
    }
    
    console.log('No consultant profile found for user:', userId);
    return null;
  } catch (error) {
    console.error('Exception in checkConsultantProfile:', error);
    toast.error('An unexpected error occurred while checking your profile');
    return null;
  }
};

/**
 * Create a consultant profile for a user
 * @param userId The user ID to create a profile for
 * @returns The created consultant profile data if successful, null otherwise
 */
export const createConsultantProfile = async (userId: string) => {
  try {
    console.log('Creating consultant profile for user:', userId);
    
    if (!userId) {
      console.error('Cannot create consultant profile: User ID is undefined');
      toast.error('User information is missing');
      return null;
    }
    
    // First check if a profile already exists
    const existingProfile = await checkConsultantProfile(userId);
    if (existingProfile) {
      console.log('Consultant profile already exists, returning existing profile');
      return existingProfile;
    }
    
    // Generate a unique slug
    let slug = `mentor-${userId.substring(0, 8)}`;
    
    // Check if the slug already exists
    const { data: existingSlug, error: slugError } = await supabase
      .from('consultants')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();
    
    if (slugError) {
      console.error('Error checking slug existence:', slugError);
      console.error('Error details:', JSON.stringify(slugError));
      toast.error('Error creating your profile');
      return null;
    }
    
    if (existingSlug) {
      // Make the slug unique by adding a random suffix
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
      console.log('Slug already exists, using new slug:', slug);
    }
    
    // Create a default consultant profile - NO description field
    const defaultProfile = {
      user_id: userId,
      headline: 'Coming Soon',
      image_url: 'https://via.placeholder.com/300',
      slug: slug,
      university: 'Not specified', // Default value that satisfies the not-null constraint
      major: ['Undecided'], // Default value as an array
      sat_score: 0, // Default value for required field
      num_aps: 0, // Default value for required field
    };
    
    console.log('Creating new consultant profile with data:', defaultProfile);
    
    // Insert the new profile
    const { data, error } = await supabase
      .from('consultants')
      .insert(defaultProfile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating consultant profile:', error);
      console.error('Error details:', JSON.stringify(error));
      toast.error('Failed to create your profile');
      return null;
    }
    
    console.log('Successfully created consultant profile:', data);
    toast.success('Mentor profile created successfully');
    return data;
  } catch (error) {
    console.error('Exception in createConsultantProfile:', error);
    toast.error('An unexpected error occurred while creating your profile');
    return null;
  }
};

/**
 * Get the consultant profile URL for a user
 * This will create a profile if one doesn't exist
 * @param userId The user ID to get or create a profile for
 * @returns The URL to the consultant profile if successful, null otherwise
 */
export const getConsultantProfileUrl = async (userId: string): Promise<string | null> => {
  try {
    if (!userId) {
      console.error('Cannot get consultant profile URL: User ID is undefined');
      toast.error('User information is missing');
      return null;
    }
    
    // First check if a profile exists
    let profile = await checkConsultantProfile(userId);
    
    // If no profile exists, create one
    if (!profile) {
      console.log('No profile found, creating one...');
      profile = await createConsultantProfile(userId);
    }
    
    // If we have a profile, return the URL
    if (profile && profile.slug) {
      return `/mentors/${profile.slug}`;
    }
    
    console.error('Failed to get consultant profile URL');
    toast.error('Could not access your profile');
    return null;
  } catch (error) {
    console.error('Exception in getConsultantProfileUrl:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

/**
 * Navigate to a consultant's profile
 * This will create a profile if one doesn't exist
 * @param userId The user ID to navigate to
 * @param router The Next.js router instance
 * @returns true if navigation was successful, false otherwise
 */
export const navigateToConsultantProfile = async (userId: string, router: any): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('Cannot navigate to consultant profile: User ID is undefined');
      toast.error('User information is missing');
      return false;
    }
    
    // First check if a profile exists
    let profile = await checkConsultantProfile(userId);
    
    // If no profile exists, create one
    if (!profile) {
      console.log('No profile found, creating one...');
      profile = await createConsultantProfile(userId);
    }
    
    // If we have a profile, navigate to it
    if (profile && profile.slug) {
      const profileUrl = `/mentors/${profile.slug}`;
      console.log('Navigating to consultant profile:', profileUrl);
      
      // Use window.location for a full page navigation to ensure it works
      if (typeof window !== 'undefined') {
        window.location.href = profileUrl;
        return true;
      } else {
        // Fallback to router if window is not available (SSR)
        router.push(profileUrl);
        return true;
      }
    }
    
    console.error('Failed to get consultant profile URL');
    toast.error('Could not access your profile');
    return false;
  } catch (error) {
    console.error('Exception in navigateToConsultantProfile:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};
