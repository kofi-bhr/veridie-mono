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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // Add separate state for initial loading
  const { 
    loading: authLoading, 
    handleSignIn, 
    handleSignUp, 
    handleSignOut,
    error 
  } = useSupabaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Fetch the user profile from Supabase
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }

      console.log('Profile found:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Exception in fetchProfile:', error);
      return null;
    }
  };

  // Refresh the user profile
  const refreshProfile = async () => {
    try {
      if (!user) {
        console.log('Cannot refresh profile: No user is logged in');
        return;
      }

      console.log('Refreshing profile for user:', user.id);
      const profile = await fetchProfile(user.id);
      
      if (profile) {
        console.log('Setting refreshed profile:', profile);
        setProfile(profile);
      } else {
        console.error('Failed to refresh profile');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        console.log('Initializing auth state');
        setInitialLoading(true); // Start loading
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        
        // Set session and user state
        if (isMounted) {
          setSession(session);
          setUser(session?.user || null);
        }
        
        if (session?.user) {
          console.log('Found existing session, setting user:', session.user.id);
          const userProfile = await fetchProfile(session.user.id);
          console.log('Fetched user profile:', userProfile);
          if (isMounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        console.log('Auth initialization complete, setting loading to false');
        if (isMounted) {
          setInitialLoading(false); // End loading regardless of outcome
        }
      }
    };
    
    // Initialize auth state immediately
    initAuth();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed, event:', event);
        
        // Always update session and user state on auth changes
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            console.log('User signed in or token refreshed:', newSession.user.id);
            const userProfile = await fetchProfile(newSession.user.id);
            console.log('Fetched user profile after auth change:', userProfile);
            setProfile(userProfile);
            setInitialLoading(false); // Ensure loading is set to false
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing profile');
          setProfile(null);
          setInitialLoading(false); // Ensure loading is set to false
        }
      }
    );

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
      isMounted = false;
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
  const isConsultant = isAuthenticated && profile?.role === 'consultant';
  const isStudent = isAuthenticated && profile?.role === 'student';
  
  // Combine loading states
  const isLoading = initialLoading || authLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated,
        isConsultant,
        isStudent,
        signIn,
        signUp,
        signOut,
        refreshProfile,
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
