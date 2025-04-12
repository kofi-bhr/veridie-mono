'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type AuthError = {
  message: string;
};

const useSupabaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to sign in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful, redirecting to home page');
      router.push('/');
      return { success: true, data };
    } catch (err) {
      const authError = err as AuthError;
      console.error('Authentication error:', authError.message);
      setError(authError.message);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    email: string, 
    password: string, 
    role: 'student' | 'consultant'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting signup process for:', email, 'with role:', role);
      toast.loading('Creating your account...');

      // Step 1: Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) {
        console.error('Supabase Auth signup error:', error);
        console.error('Error details:', JSON.stringify(error));
        toast.error('Failed to create account: ' + error.message);
        throw error;
      }
      
      if (!data.user) {
        console.error('No user data returned after signup');
        toast.error('Failed to create account: No user data returned');
        throw new Error('No user data returned after signup');
      }
      
      console.log('User created successfully with ID:', data.user.id);
      toast.success('Account created successfully!');
      
      // Step 2: Create the profile record
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        role: role,
        is_verified: false,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        console.error("Error details:", JSON.stringify(profileError));
        toast.error('Account created, but profile setup failed. Please contact support.');
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
      
      console.log('Profile created successfully');
      
      // Step 3: If the user is a consultant, create a consultant profile immediately
      if (role === 'consultant') {
        console.log('Creating consultant profile for new user');
        toast.loading('Setting up your mentor profile...');
        
        // Create a unique slug
        const slug = `mentor-${data.user.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`;
        
        // Create a default consultant profile - NO description field
        const defaultProfile = {
          user_id: data.user.id,
          headline: 'Coming Soon',
          image_url: 'https://via.placeholder.com/300',
          slug: slug,
          university: 'Not specified',
          major: ['Undecided'],
          sat_score: 0,
          num_aps: 0,
        };
        
        // Insert the new profile
        const { data: consultantData, error: consultantError } = await supabase
          .from('consultants')
          .insert(defaultProfile)
          .select()
          .single();
        
        if (consultantError) {
          console.error('Error creating consultant profile:', consultantError);
          console.error('Error details:', JSON.stringify(consultantError));
          toast.error('Your account was created, but we had trouble setting up your mentor profile. You can set it up later from your profile page.');
        } else {
          console.log('Consultant profile created successfully with slug:', consultantData.slug);
          toast.success('Your mentor profile has been created!');
          
          // Redirect directly to the consultant profile after signup
          console.log('Sign up successful, redirecting to consultant profile');
          toast.success('Redirecting to your profile...');
          
          // Use a slight delay to ensure toasts are seen
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = `/mentors/${consultantData.slug}`;
            } else {
              router.push(`/mentors/${consultantData.slug}`);
            }
          }, 1500);
          
          return { success: true, data };
        }
      }
      
      // For students or if consultant profile creation failed, redirect to signin
      console.log('Sign up successful, redirecting to sign in page');
      toast.success('Please sign in with your new account');
      router.push('/auth/signin');
      return { success: true, data };
    } catch (err) {
      console.error('Signup Error:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during sign up.';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      console.log('Attempting to sign out user');
      toast.loading('Signing out...');
      
      // Clear local state first
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out: ' + error.message);
        throw error;
      }
      
      console.log('Sign out successful, redirecting to home page');
      toast.success('Signed out successfully');
      
      // Use window.location for a full page refresh to clear all state
      window.location.href = '/';
      return { success: true };
    } catch (err) {
      const authError = err as AuthError;
      console.error('Sign out error:', authError.message);
      setError(authError.message);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      
      router.push('/');
      return { success: true };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    handlePasswordReset,
    handleUpdatePassword,
  };
};

export default useSupabaseAuth;
