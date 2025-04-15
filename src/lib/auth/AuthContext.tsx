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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'student' | 'consultant') => Promise<void>;
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
  signIn: async () => {},
  signUp: async () => {},
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
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('Fetched user profile:', profile);
      return profile;
    } catch (err) {
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
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: 'student' | 'consultant') => {
    let timeoutId;
    
    try {
      console.log('AuthContext: Starting signup process for:', email);
      
      // Add a cleanup function to ensure loading state gets reset
      const resetState = () => {
        console.log('AuthContext: Resetting loading state');
        setInitialLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      };
      
      // Set a timeout to force reset loading state
      timeoutId = setTimeout(() => {
        console.error('AuthContext: Signup timeout reached, forcing state reset');
        resetState();
      }, 20000);
      
      // Execute the signup
      const result = await handleSignUp(email, password, role);
      
      // Check result
      if (!result.success) {
        console.error('AuthContext: Signup failed with error:', result.error);
        throw new Error(result.error);
      }
      
      console.log('AuthContext: Signup completed successfully');
      return result;
    } catch (error) {
      console.error('Error in AuthContext signUp:', error);
      // Ensure we're not leaving the app in a loading state
      setInitialLoading(false);
      throw error;
    } finally {
      // Always clean up
      if (timeoutId) clearTimeout(timeoutId);
      setInitialLoading(false);
    }
  };

  const signOut = async () => {
    try {
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
