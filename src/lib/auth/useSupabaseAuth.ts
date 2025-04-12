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
      
      const toastId = toast.loading('Signing in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.dismiss(toastId);
        toast.error('Sign in failed: ' + error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Sign in successful:', data);
      toast.dismiss(toastId);
      toast.success('Signed in successfully!');
      
      // Instead of redirecting immediately, let the auth state update first
      // and then use Next.js router for a smoother transition
      setTimeout(() => {
        router.push('/');
        router.refresh(); // Force a refresh of the Next.js router
      }, 500);
      
      return { success: true, data };
    } catch (err) {
      const authError = err as AuthError;
      console.error('Authentication error:', authError.message);
      setError(authError.message);
      toast.dismiss();
      toast.error(authError.message);
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
      const signupToastId = toast.loading('Creating your account...');

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
        toast.dismiss(signupToastId);
        toast.error('Failed to create account: ' + error.message);
        throw error;
      }
      
      if (!data.user) {
        console.error('No user data returned after signup');
        toast.dismiss(signupToastId);
        toast.error('Failed to create account: No user data returned');
        throw new Error('No user data returned after signup');
      }
      
      console.log('User created successfully with ID:', data.user.id);
      toast.dismiss(signupToastId);
      toast.success('Account created successfully!');
      
      const profileToastId = toast.loading('Setting up your profile...');
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        role: role,
        is_verified: false,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        console.error("Error details:", JSON.stringify(profileError));
        toast.dismiss(profileToastId);
        toast.error('Account created, but profile setup failed. Please contact support.');
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
      
      console.log('Profile created successfully');
      toast.dismiss(profileToastId);
      
      if (role === 'consultant') {
        console.log('Creating consultant profile for new user');
        const consultantToastId = toast.loading('Setting up your mentor profile...');
        
        const slug = `mentor-${data.user.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`;
        
        const defaultProfile = {
          user_id: data.user.id,
          headline: 'Coming Soon',
          image_url: 'https://placehold.co/300x300',
          slug: slug,
          university: 'Not specified',
          major: ['Undecided'],
          sat_score: 0,
          num_aps: 0,
        };
        
        const { data: consultantData, error: consultantError } = await supabase
          .from('consultants')
          .insert(defaultProfile)
          .select()
          .single();
        
        if (consultantError) {
          console.error('Error creating consultant profile:', consultantError);
          console.error('Error details:', JSON.stringify(consultantError));
          toast.dismiss(consultantToastId);
          toast.error('Your account was created, but we had trouble setting up your mentor profile. You can set it up later from your profile page.');
        } else {
          console.log('Consultant profile created successfully with slug:', consultantData.slug);
          toast.dismiss(consultantToastId);
          toast.success('Your mentor profile has been created!');
          
          const redirectToastId = toast.loading('Redirecting to your profile...');
          
          setTimeout(() => {
            toast.dismiss(redirectToastId);
            
            if (typeof window !== 'undefined') {
              window.location.href = `/mentors/${consultantData.slug}`;
            } else {
              router.push(`/mentors/${consultantData.slug}`);
            }
          }, 1500);
          
          return { success: true, data };
        }
      }
      
      console.log('Sign up successful, redirecting to sign in page');
      const redirectToastId = toast.loading('Redirecting to sign in...');
      
      setTimeout(() => {
        toast.dismiss(redirectToastId);
        toast.success('Please sign in with your new account');
        router.push('/auth/signin');
      }, 1000);
      
      return { success: true, data };
    } catch (err) {
      console.error('Signup Error:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during sign up.';
      setError(message);
      toast.dismiss();
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
      const toastId = toast.loading('Signing out...');
      
      // Start the sign-out process but don't await it
      const signOutPromise = supabase.auth.signOut();
      
      // Dismiss the loading toast immediately
      toast.dismiss(toastId);
      toast.success('Signed out successfully');
      
      // Clear local auth state immediately
      if (typeof window !== 'undefined') {
        // Clear any local storage items related to auth
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      }
      
      // Redirect immediately without waiting for the sign-out to complete
      console.log('Redirecting to home page');
      window.location.href = '/';
      
      // Handle any errors in the background
      signOutPromise.then(({ error }) => {
        if (error) {
          console.error('Background sign-out error:', error);
        }
      });
      
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
