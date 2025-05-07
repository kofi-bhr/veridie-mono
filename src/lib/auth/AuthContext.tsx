'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthResult } from '@/lib/auth';
import supabase from '@/lib/supabase/browser';
import logger from '@/lib/utils/logger';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/lib/auth';

// Define the user profile type
type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'student' | 'consultant';
  created_at: string | null;
  updated_at: string | null;
  consultant?: {
    slug: string;
  } | null;
  is_verified: boolean;
  email?: string | null;
};

// Define the auth context type
type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConsultant: boolean;
  isStudent: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  signUp: (email: string, password: string, role: 'student' | 'consultant') => Promise<{ success: boolean; error?: string; data?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

// Define status type for loading states
type Status = 'idle'|'loading'|'ready'|'error';

// Constants for retries
const RETRIES = 3;
const BACKOFF_MS = 1000;

// Create throw function for default context
const throwFn = () => { throw new Error('AuthContext not provided'); };

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isConsultant: false,
  isStudent: false,
  signIn: throwFn,
  signUp: throwFn,
  signOut: throwFn,
  refreshProfile: throwFn
});

// Create the auth provider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { 
    signIn: authSignIn,
    signUp: authSignUp,
    signOut: authSignOut,
  } = useSupabaseAuth();

  // Function to fetch user profile with retries
  const fetchUserProfile = async (userId: string | undefined | null, retryCount = 0): Promise<UserProfile | null> => {
    if (!userId) {
      logger.info('No userId provided to fetchUserProfile');
      return null;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          consultant:consultants(slug)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user profile:', error);
        if (retryCount < RETRIES) {
          logger.info(`Retrying profile fetch (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, BACKOFF_MS));
          return fetchUserProfile(userId, retryCount + 1);
        }
        throw error;
      }

      if (!profile) {
        logger.error('Profile not found');
        if (retryCount < RETRIES) {
          logger.info(`Retrying profile fetch for missing profile (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, BACKOFF_MS));
          return fetchUserProfile(userId, retryCount + 1);
        }
        throw new Error('Profile not found after retries');
      }

      return profile;
    } catch (err) {
      logger.error('Error in fetchUserProfile:', err);
      if (retryCount < RETRIES) {
        logger.info(`Retrying profile fetch after error (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, BACKOFF_MS));
        return fetchUserProfile(userId, retryCount + 1);
      }
      // After all retries failed, sign out the user and show error
      toast.error('Error loading your profile. Please sign in again.');
      await authSignOut();
      return null;
    }
  };

  // Function to refresh user profile with error handling
  const refreshUserProfile = async () => {
    try {
      setStatus('loading');
      if (!user?.id) return;
      
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        setStatus('ready');
      } else {
        setStatus('error');
      }
    } catch (err) {
      logger.error('Error refreshing profile:', err);
      setStatus('error');
    }
  };

  // Handle auth state changes
  const handleAuthChange = async (event: string, currentSession: Session | null) => {
    logger.info('Auth state changed:', event, currentSession?.user?.id);
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession?.user) {
      const profile = await fetchUserProfile(currentSession.user.id);
      setUserProfile(profile);
      setStatus('ready');
    } else {
      setUserProfile(null);
      setStatus('idle');
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }: { data: { session: Session | null } }) => {
      if (!mounted) return;

      logger.info('Initial session check:', initialSession?.user?.id);
      handleAuthChange('INITIAL', initialSession);
    }).catch((err: Error) => {
      logger.error('Error during initial session check:', err);
      if (mounted) {
        setStatus('error');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Wrap the hook methods to maintain the same interface
  const signIn = async (email: string, password: string) => {
    try {
      setStatus('loading');
      const result = await authSignIn(email, password);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logger.error('Error signing in:', error);
      setStatus('error');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: 'student' | 'consultant') => {
    try {
      setStatus('loading');
      logger.info('AuthContext: Starting signup process for:', email);
      
      const result = await authSignUp({ email, password, role });
      if (!result.success) {
        logger.error('AuthContext: Signup failed with error:', result.error);
        throw new Error(result.error || 'Unknown error during signup');
      }
      
      logger.info('AuthContext: Signup completed successfully');
      return result;
    } catch (error) {
      logger.error('Error in AuthContext signUp:', error);
      setStatus('error');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setStatus('loading');
      
      // Perform the actual sign-out first
      await Promise.race([
        authSignOut(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sign out timeout')), 5000)
        )
      ]);

      // Then clear local state
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setStatus('idle');
      
      // Force clear any cached data
      router.refresh();
    } catch (error) {
      logger.error('Error signing out:', error);
      setStatus('error');
      // Still consider it a success if we can clear state
      setUser(null);
      setUserProfile(null);
      setSession(null);
    }
  };

  // Compute derived authentication states
  const isAuthenticated = !!user && !!session;
  const isConsultant = isAuthenticated && userProfile?.role === 'consultant';
  const isStudent = isAuthenticated && userProfile?.role === 'student';
  
  // Map status to isLoading
  const isLoading = status === 'loading';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: userProfile,
        session,
        isLoading,
        isAuthenticated,
        isConsultant,
        isStudent,
        signIn,
        signUp,
        signOut,
        refreshProfile: refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
