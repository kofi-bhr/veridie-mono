'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch the user profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If the profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          
          // Get user email from session
          const { data: { session } } = await supabase.auth.getSession();
          const userEmail = session?.user?.email;
          
          // Create a default profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail,
              first_name: null,
              last_name: null,
              role: 'student', // Default role
              is_verified: false,
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating default profile:', createError);
            return null;
          }
          
          console.log('Created default profile:', newProfile);
          return newProfile as UserProfile;
        }
        
        return null;
      }

      console.log('Fetched profile:', data);
      
      // If the user is a consultant but doesn't have a consultant profile, create one
      if (data.role === 'consultant') {
        try {
          console.log('Checking if consultant profile exists for user:', userId);
          const { data: consultantData, error: consultantError } = await supabase
            .from('consultants')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (consultantError) {
            console.error('Error checking consultant profile:', consultantError);
            // Continue with the flow, don't try to create a profile if there was an error checking
          } else if (!consultantData) {
            console.log('Consultant profile not found, creating default consultant profile');
            
            try {
              // Create a default consultant profile with retry logic
              const defaultProfile = {
                user_id: userId,
                headline: 'Coming Soon',
                description: 'This mentor profile is currently being set up. Check back soon for more information!',
                image_url: 'https://via.placeholder.com/300',
                slug: `mentor-${userId.substring(0, 8)}`,
                university: 'Not specified', // Default value that satisfies the not-null constraint
                major: ['Undecided'], // Default value as an array
              };
              
              // First attempt
              let { data: newConsultant, error: createError } = await supabase
                .from('consultants')
                .insert(defaultProfile)
                .select()
                .single();
              
              if (createError) {
                console.error('First attempt to create consultant profile failed:', createError);
                
                // Wait a moment and retry once
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Second attempt
                const { data: retryConsultant, error: retryError } = await supabase
                  .from('consultants')
                  .insert(defaultProfile)
                  .select()
                  .single();
                
                if (retryError) {
                  console.error('Second attempt to create consultant profile failed:', retryError);
                  // Log the detailed error but continue with auth flow
                } else {
                  console.log('Created consultant profile on second attempt:', retryConsultant);
                }
              } else {
                console.log('Created consultant profile on first attempt:', newConsultant);
              }
            } catch (createError) {
              console.error('Exception creating consultant profile:', createError);
              // Don't throw to avoid breaking the auth flow
            }
          } else {
            console.log('Consultant profile already exists:', consultantData);
          }
        } catch (error) {
          console.error('Error in consultant profile check/creation:', error);
          // Don't throw here to avoid breaking the auth flow
        }
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  // Create a consultant profile with default values
  const createConsultantProfile = async (userId: string) => {
    console.log('Creating consultant profile for user:', userId);
    
    try {
      // First check if a profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('consultants')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing consultant profile:', checkError);
        return null;
      }
      
      // If profile already exists, return it
      if (existingProfile) {
        console.log('Consultant profile already exists for user:', userId);
        return existingProfile;
      }
      
      // Create a default consultant profile with "coming soon" state
      const { data: newConsultant, error: consultantError } = await supabase
        .from('consultants')
        .insert({
          user_id: userId,
          headline: 'Coming Soon',
          description: 'This mentor profile is currently being set up. Check back soon for more information!',
          image_url: 'https://via.placeholder.com/300',
          slug: `mentor-${userId.substring(0, 8)}`,
          university: 'Not specified', // Default value that satisfies the not-null constraint
          major: ['Undecided'], // Default value as an array
        })
        .select()
        .single();
      
      if (consultantError) {
        console.error('Error creating consultant profile:', consultantError);
        return null;
      }
      
      console.log('Consultant profile created:', newConsultant);
      return newConsultant;
    } catch (error) {
      console.error('Error in createConsultantProfile:', error);
      return null;
    }
  };

  // Refresh the user profile
  const refreshProfile = async () => {
    if (!user) {
      console.log('Cannot refresh profile: No user');
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
  };

  // Initialize the auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth state');
        // Get the initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          console.log('Session found, user:', session.user.id);
          setUser(session.user);
          
          // Fetch the user profile
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            console.log('Setting initial profile:', profile);
            setProfile(profile);
          } else {
            console.error('Failed to fetch initial profile');
          }
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed, event:', event);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          console.log('New session, fetching profile for user:', session.user.id);
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            console.log('Setting updated profile:', profile);
            setProfile(profile);
          } else {
            console.error('Failed to fetch updated profile');
          }
        } else {
          console.log('No user in new session, clearing profile');
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful');
      // Refresh the page to trigger the middleware
      router.refresh();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, role: 'student' | 'consultant') => {
    try {
      console.log('Signing up user:', email, 'with role:', role);
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
        console.error('Sign up error:', error);
        throw error;
      }

      // Create the user profile
      if (data.user) {
        console.log('Creating profile for new user:', data.user.id);
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          role,
          is_verified: false,
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
        
        console.log('Profile created successfully');
        
        // Always create a consultant profile if the role is consultant
        if (role === 'consultant') {
          await createConsultantProfile(data.user.id);
        }
      }

      console.log('Sign up successful');
      // Refresh the page to trigger the middleware
      router.refresh();
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      
      console.log('Sign out successful');
      // Redirect to the home page
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Compute derived authentication states
  const isAuthenticated = !!user && !!session;
  const isConsultant = isAuthenticated && profile?.role === 'consultant';
  const isStudent = isAuthenticated && profile?.role === 'student';

  // Provide the auth context
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
