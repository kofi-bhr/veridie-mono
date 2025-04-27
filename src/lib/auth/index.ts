import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface SignUpData {
  email: string;
  password: string;
  role: 'student' | 'consultant';
}

export function useSupabaseAuth() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async ({ email, password, role }: SignUpData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      toast.success('Sign up successful! Please check your email to confirm your account.');
      return { success: true, data };
    } catch (err: any) {
      const message = err.message || 'An error occurred during sign up';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      toast.success('Successfully signed in!');
      return { success: true, data };
    } catch (err: any) {
      const message = err.message || 'An error occurred during sign in';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      toast.success('Successfully signed out!');
      router.push('/');
      return { success: true };
    } catch (err: any) {
      const message = err.message || 'An error occurred during sign out';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  return {
    signUp,
    signIn,
    signOut,
    loading,
    error,
  };
}
