import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface SignUpData {
  email: string;
  password: string;
  role: 'student' | 'consultant';
}

export type AuthResult = {
  success: boolean;
  error?: string;
  data?: {
    user: any | null;
    session: any | null;
  };
};

export function useSupabaseAuth() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async ({ email, password, role }: SignUpData): Promise<AuthResult> => {
    let toastId;
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting signup process for:', email, 'with role:', role);
      toastId = toast.loading('Creating your account...');

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('Supabase Auth signup error:', signUpError);
        toast.dismiss(toastId);
        toast.error('Failed to create account: ' + signUpError.message);
        throw signUpError;
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

      // Create profile with retries
      toastId = toast.loading('Setting up your profile...');

      let profileError;
      for (let i = 0; i < 3; i++) {
        const { error: err } = await supabase.from('profiles').upsert({
          id: data.user.id,
          role: role,
          is_verified: false,
        });

        if (!err) {
          profileError = null;
          break;
        }

        console.error(`Profile creation attempt ${i + 1} failed:`, err);
        profileError = err;
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }

      if (profileError) {
        console.error('All profile creation attempts failed:', profileError);
        toast.dismiss(toastId);
        toast.error('Error setting up profile: ' + profileError.message);
        throw profileError;
      }

      toast.dismiss(toastId);
      toast.success('Profile setup complete!');

      // Redirect to complete profile
      router.push(`/auth/complete-profile?role=${role}`);
      router.refresh();

      return { success: true, data };
    } catch (err: any) {
      const message = err.message || 'An error occurred during sign up';
      setError(message);
      if (toastId) toast.dismiss(toastId);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    let toastId;
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting to sign in user:', email);
      toastId = toast.loading('Signing in...');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        toast.dismiss(toastId);
        toast.error('Sign in failed: ' + signInError.message);
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      // Fetch the user's profile with retries
      let profileData;
      let profileError;

      for (let i = 0; i < 3; i++) {
        const { data: profile, error: err } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (!err) {
          profileData = profile;
          break;
        }

        console.error(`Profile fetch attempt ${i + 1} failed:`, err);
        profileError = err;
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }

      if (profileError) {
        console.error('All profile fetch attempts failed:', profileError);
        toast.dismiss(toastId);
        toast.error('Error fetching profile: ' + profileError.message);
        return { success: false, error: profileError.message };
      }

      toast.dismiss(toastId);
      toast.success('Signed in successfully!');

      // Redirect based on role
      if (profileData?.role === 'consultant') {
        console.log('Redirecting consultant to profile page');
        router.push('/profile/consultant');
      } else {
        console.log('Redirecting to home page');
        router.push('/');
      }
      router.refresh();

      return { success: true, data };
    } catch (err: any) {
      const message = err.message || 'An error occurred during sign in';
      setError(message);
      if (toastId) toast.dismiss(toastId);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    let toastId;
    try {
      setLoading(true);
      setError(null);

      toastId = toast.loading('Signing out...');

      // First, check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, just redirect to home
        console.log('No session found during sign out, redirecting to home');
        toast.dismiss(toastId);
        router.push('/');
        router.refresh();
        return { success: true };
      }

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('Sign out error:', signOutError);
        toast.dismiss(toastId);
        toast.error('Sign out failed: ' + signOutError.message);
        throw signOutError;
      }

      toast.dismiss(toastId);
      toast.success('Successfully signed out!');
      
      // Clear any cached data
      router.push('/');
      router.refresh();
      
      return { success: true };
    } catch (err: any) {
      const message = err.message || 'An error occurred during sign out';
      setError(message);
      if (toastId) toast.dismiss(toastId);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    let toastId;
    try {
      setLoading(true);
      setError(null);

      toastId = toast.loading('Updating password...');
      
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        toast.dismiss(toastId);
        toast.error('Failed to update password: ' + updateError.message);
        throw updateError;
      }

      toast.dismiss(toastId);
      toast.success('Password updated successfully!');
      router.push('/');
      router.refresh();
      
      return { success: true };
    } catch (err: any) {
      const message = err.message || 'An error occurred while updating password';
      setError(message);
      if (toastId) toast.dismiss(toastId);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    let toastId;
    try {
      setLoading(true);
      setError(null);

      toastId = toast.loading('Sending password reset email...');
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        toast.dismiss(toastId);
        toast.error('Failed to send reset email: ' + resetError.message);
        throw resetError;
      }

      toast.dismiss(toastId);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (err: any) {
      const message = err.message || 'An error occurred while sending reset email';
      setError(message);
      if (toastId) toast.dismiss(toastId);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    signUp,
    signIn,
    signOut,
    updatePassword,
    resetPassword,
    loading,
    error,
  };
}
