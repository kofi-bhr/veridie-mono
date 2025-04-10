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

  const handleSignUp = async (
    email: string, 
    password: string, 
    role: 'student' | 'consultant'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (!data.user) throw new Error('No user data returned after signup');

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          role: role,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation/update error:", profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      if (role === 'consultant') {
        router.push('/profile/consultant');
      } else {
        router.push('/');
      }

      return { success: true, data };
    } catch (err) {
      console.error('Signup Error:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during sign up.';
      setError(message);
      return { success: false, error: message };
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
