'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import ConsultantProfileForm from '@/components/consultant/ConsultantProfileForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';

const ConsultantProfileEditPage = () => {
  const { user, isConsultant } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [consultantData, setConsultantData] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('ConsultantProfileEditPage: No user, skipping data fetch');
        return;
      }

      try {
        console.log('ConsultantProfileEditPage: Fetching profile data for user:', user.id);
        
        // First check if user has a consultant profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('ConsultantProfileEditPage: Error fetching profile:', profileError);
          throw profileError;
        }
        
        if (profileData.role !== 'consultant') {
          console.log('ConsultantProfileEditPage: User is not a consultant, redirecting to profile');
          router.push('/profile');
          return;
        }
        
        // Fetch consultant profile
        const { data: consultantData, error: consultantError } = await supabase
          .from('consultants')
          .select(`
            id,
            user_id,
            headline,
            image_url,
            slug,
            university,
            major,
            gpa_score,
            gpa_scale,
            is_weighted,
            sat_reading,
            sat_math,
            act_composite,
            accepted_university_ids
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        // If consultant data doesn't exist, it's okay - we'll create a new one
        if (consultantError && consultantError.code !== 'PGRST116') {
          console.error('ConsultantProfileEditPage: Error fetching consultant data:', consultantError.message || JSON.stringify(consultantError));
          throw consultantError;
        }
        
        console.log('ConsultantProfileEditPage: Consultant data fetched successfully');
        
        // Now fetch related data separately if consultant data exists
        let fullConsultantData = consultantData || { user_id: user.id };
        
        if (consultantData) {
          try {
            // Fetch awards
            const { data: awardsData } = await supabase
              .from('awards')
              .select('id, title, description, date, year')
              .eq('consultant_id', consultantData.id);
              
            // Fetch extracurriculars
            const { data: extracurricularsData } = await supabase
              .from('extracurriculars')
              .select('id, title, description, role, institution, years')
              .eq('consultant_id', consultantData.id);
              
            // Fetch AP scores
            const { data: apScoresData } = await supabase
              .from('ap_scores')
              .select('id, subject, score')
              .eq('consultant_id', consultantData.id);
              
            // Fetch packages
            const { data: packagesData } = await supabase
              .from('packages')
              .select('id, title, description, price, features, billing_frequency, position, is_visible')
              .eq('consultant_id', consultantData.id);
              
            // Combine all data
            fullConsultantData = {
              ...consultantData,
              awards: awardsData || [],
              extracurriculars: extracurricularsData || [],
              ap_scores: apScoresData || [],
              packages: packagesData || []
            };
          } catch (err) {
            console.error('ConsultantProfileEditPage: Error fetching related data:', err);
            // Continue with the main consultant data even if related data fails
          }
        }
        
        // Fetch universities for dropdown
        const { data: universitiesData, error: universitiesError } = await supabase
          .from('universities')
          .select('*')
          .order('name');

        if (universitiesError) {
          console.error('ConsultantProfileEditPage: Error fetching universities:', universitiesError);
          throw universitiesError;
        }

        // Set the active tab from URL if provided
        const tabParam = searchParams.get('tab');
        if (tabParam) {
          console.log('ConsultantProfileEditPage: Setting active tab from URL:', tabParam);
          // We'll pass this to the form component
        }

        setConsultantData(fullConsultantData);
        setUniversities(universitiesData || []);
      } catch (err: any) {
        console.error('ConsultantProfileEditPage: Error fetching data:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, searchParams, retryCount]);

  const handleRetry = () => {
    console.log('ConsultantProfileEditPage: Retrying data fetch');
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  return (
    <ProtectedRoute requiredRole="consultant">
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="w-full max-w-4xl mx-auto border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-6 md:p-8 rounded-md">
          <h1 className="text-3xl font-bold mb-2">Edit Mentor Profile</h1>
          <p className="text-gray-600 mb-8">Update your mentor profile information to attract more students.</p>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-lg">Loading profile data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleRetry}
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => router.push('/profile')}
                  variant="reverse"
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Return to Profile
                </Button>
              </div>
            </div>
          ) : (
            <ConsultantProfileForm 
              initialData={{
                id: consultantData.id,
                user_id: consultantData.user_id,
                headline: consultantData.headline,
                description: consultantData.description,
                image_url: consultantData.image_url,
                slug: consultantData.slug,
                university: consultantData.university,
                major: consultantData.major,
                gpa_score: consultantData.gpa_score,
                gpa_scale: consultantData.gpa_scale,
                is_weighted: consultantData.is_weighted,
                sat_reading: consultantData.sat_reading,
                sat_math: consultantData.sat_math,
                act_composite: consultantData.act_composite,
                accepted_university_ids: consultantData.accepted_university_ids,
                essays: consultantData.essays || [],
                extracurriculars: consultantData.extracurriculars || [],
                awards: consultantData.awards || [],
                ap_scores: consultantData.ap_scores || [],
                packages: consultantData.packages || []
              }} 
              universities={universities}
              userId={user?.id || ""}
              initialTab={searchParams.get('tab') || undefined}
              onSubmit={(values) => {
                // Redirect to the consultant's public profile page
                router.push(`/mentors/${values.slug}`);
                router.refresh();
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ConsultantProfileEditPage;
