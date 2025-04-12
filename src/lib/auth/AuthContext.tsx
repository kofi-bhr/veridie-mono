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
  const { 
    loading: isLoading, 
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
    const initAuth = async () => {
      try {
        console.log('Initializing auth state');
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          console.log('Found existing session, setting user:', session.user.id);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };
    
    initAuth();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed, event:', event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          console.log('New session, fetching profile for user:', newSession.user.id);
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
        } else {
          console.log('No user in new session, clearing profile');
          setProfile(null);
        }
      }
    );

    // Clean up the subscription
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
    try {
      const result = await handleSignUp(email, password, role);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
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
