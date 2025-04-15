'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';

// Define the user profile type
type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'student' | 'consultant' | null;
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

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isConsultant: false,
  isStudent: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

// Create the auth provider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    handleSignIn, 
    handleSignUp, 
    handleSignOut,
  } = useSupabaseAuth();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string | undefined | null) => {
    if (!userId) {
      // No user, so no profile to fetch
      return null;
    }
    if (!supabase) {
      // Supabase client is not available (e.g., SSR)
      return null;
    }
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Log the error object for better debugging
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Type guard: ensure the profile matches UserProfile
      if (
        profile &&
        typeof profile.id === 'string' &&
        ('first_name' in profile) &&
        ('last_name' in profile) &&
        ('role' in profile) &&
        ('is_verified' in profile)
      ) {
        return profile as UserProfile;
      } else {
        // Profile is not valid
        return null;
      }
    } catch (err) {
      // Log the error object for better debugging
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  // Function to refresh user profile
  const refreshUserProfile = async () => {
    if (!user?.id) return;
    const profile = await fetchUserProfile(user.id);
    if (profile) {
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    if (!supabase) return; // SSR/Null guard
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        const profile = await fetchUserProfile(currentSession.user.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setInitialLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession?.user?.id);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        const profile = await fetchUserProfile(initialSession.user.id);
        setUserProfile(profile);
      }
      setInitialLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Wrap the hook methods to maintain the same interface
  const signIn = async (email: string, password: string) => {
    try {
      const result = await handleSignIn(email, password);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: 'student' | 'consultant') => {
    let timeoutId: NodeJS.Timeout | undefined;
    try {
      console.log('AuthContext: Starting signup process for:', email);
      const resetState = () => {
        console.log('AuthContext: Resetting loading state');
        setInitialLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      };
      timeoutId = setTimeout(() => {
        console.error('AuthContext: Signup timeout reached, forcing state reset');
        resetState();
      }, 20000);
      const result = await handleSignUp(email, password, role);
      if (!result.success) {
        console.error('AuthContext: Signup failed with error:', result.error);
        throw new Error(result.error);
      }
      console.log('AuthContext: Signup completed successfully');
      return result;
    } catch (error) {
      console.error('Error in AuthContext signUp:', error);
      setInitialLoading(false);
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setInitialLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (!supabase) return; // SSR/Null guard
      await handleSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Compute derived authentication states
  const isAuthenticated = !!user && !!session;
  const isConsultant = isAuthenticated && userProfile?.role === 'consultant';
  const isStudent = isAuthenticated && userProfile?.role === 'student';
  
  // Combine loading states
  const isLoading = initialLoading || loading;

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
