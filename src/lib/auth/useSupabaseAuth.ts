'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/');
      router.refresh();
      return { success: true, data };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      // If sign up is successful and email confirmation is not required
      // (depends on Supabase settings), redirect to onboarding
      if (data.user && !data.user.identities?.[0].identity_data?.email_confirmed_at) {
        // Email confirmation required - show confirmation message
        return { success: true, data, requiresEmailConfirmation: true };
      } else {
        // No email confirmation required - redirect to onboarding
        router.push('/onboarding');
        return { success: true, data, requiresEmailConfirmation: false };
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      return { success: false, error: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
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
