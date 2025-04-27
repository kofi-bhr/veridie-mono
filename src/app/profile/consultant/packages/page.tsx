'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from '@/types/packages';
import { supabase } from '@/lib/supabase/client';
import { PackageList } from '@/components/packages/PackageList';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ConsultantPackagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [consultantId, setConsultantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchConsultantData();
  }, [user, router]);

  const fetchConsultantData = async () => {
    try {
      // Get consultant ID
      const { data: consultant, error: consultantError } = await supabase
        .from('consultants')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (consultantError) throw consultantError;
      if (!consultant) {
        router.push('/profile/consultant/onboarding');
        return;
      }

      setConsultantId(consultant.id);

      // Get packages
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('consultant_id', consultant.id)
        .order('created_at', { ascending: false });

      if (packagesError) throw packagesError;
      setPackages(packages);
    } catch (error) {
      console.error('Error fetching consultant data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-200 rounded border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {consultantId ? (
          <PackageList
            packages={packages}
            consultantId={consultantId}
            onPackageUpdate={fetchConsultantData}
          />
        ) : null}
      </div>
    </div>
  );
}
