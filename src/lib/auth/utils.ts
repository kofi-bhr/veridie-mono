import { createServerClient } from '../supabase/server';
import { createClient } from '../supabase/client';
import { redirect } from 'next/navigation';

export type UserRole = 'consultant' | 'student';

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole | null;
  is_verified: boolean;
  email?: string | null;
}

// Server-side auth check
export async function getServerSideUser() {
  const supabase = createServerClient();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      ...session.user,
      ...profile,
    };
  } catch (error) {
    console.error('Error getting server side user:', error);
    return null;
  }
}

// Client-side auth check
export async function getClientSideUser() {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      ...session.user,
      ...profile,
    };
  } catch (error) {
    console.error('Error getting client side user:', error);
    return null;
  }
}

// Route protection helper
export async function protectRoute(role?: UserRole) {
  const user = await getServerSideUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  if (role && user.role !== role) {
    redirect('/');
  }

  return user;
}

// Get user's home route based on role
export function getUserHomeRoute(role: UserRole | null) {
  switch (role) {
    case 'consultant':
      return '/profile/consultant/edit-direct';
    case 'student':
      return '/profile';
    default:
      return '/';
  }
}

// Get display name
export function getUserDisplayName(profile: UserProfile | null) {
  if (!profile) return 'User';
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  if (profile.first_name) return profile.first_name;
  if (profile.last_name) return profile.last_name;
  return 'User';
} 