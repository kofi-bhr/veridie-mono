import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface Consultant {
  id: string;
  user_id: string;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_onboarding_complete: boolean;
}

interface UseUserReturn {
  user: User | null;
  consultant: Consultant | null;
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchConsultant(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchConsultant(session.user.id);
      } else {
        setConsultant(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchConsultant = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('consultants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setConsultant(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching consultant:', err);
    } finally {
      setLoading(false);
    }
  };

  return { user, consultant, loading, error };
}
