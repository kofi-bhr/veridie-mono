'use client';

import { useState, useEffect } from 'react';
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
    let toastId;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to sign in user:', email);
      
      toastId = toast.loading('Signing in...');
      
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
      
      // Fetch the user's profile to get their role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }
      
      toast.dismiss(toastId);
      toast.success('Signed in successfully!');
      
      // Redirect based on role
      setTimeout(() => {
        if (profileData?.role === 'consultant') {
          console.log('Redirecting consultant to profile page');
          router.push('/profile/consultant');
        } else {
          console.log('Redirecting to home page');
          router.push('/');
        }
        router.refresh();
      }, 500);
      
      return { success: true, data };
    } catch (err) {
      const authError = err as AuthError;
      console.error('Authentication error:', authError.message);
      setError(authError.message);
      if (toastId) {
        toast.dismiss(toastId);
        toast.error(authError.message);
      }
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
    let toastId;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting signup process for:', email, 'with role:', role);
      toastId = toast.loading('Creating your account...');

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
        toast.dismiss(toastId);
        toast.error('Failed to create account: ' + error.message);
        throw error;
      }
      
      if (!data.user) {
        console.error('No user data returned after signup');
        toast.dismiss(toastId);
        toast.error('Failed to create account: No user data returned');
        throw new Error('No user data returned after signup');
      }
      
      console.log('User created successfully with ID:', data.user.id);
      toast.dismiss(toastId);
      toast.success('Account created successfully!');
      
      // Create profile
      toastId = toast.loading('Setting up your profile...');
      
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        role: role,
        is_verified: false,
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast.dismiss(toastId);
        toast.error('Error setting up profile: ' + profileError.message);
        throw profileError;
      }

      toast.dismiss(toastId);
      toast.success('Profile setup complete!');

      // Redirect to complete profile
      router.push(`/auth/complete-profile?role=${role}`);
      
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Signup Error:', err);
      setError(message);
      if (toastId) {
        toast.dismiss(toastId);
        toast.error(message);
      }
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

      const { error } = await supabase.auth.signOut();

      toast.dismiss(toastId);

      if (error) {
        toast.error('Sign out failed: ' + error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Signed out successfully');

      // Clear local auth state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      }

      // Redirect after sign-out completes
      console.log('Redirecting to home page');
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

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

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
