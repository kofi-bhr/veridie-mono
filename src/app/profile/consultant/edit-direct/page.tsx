'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Award, Briefcase, GraduationCap, User, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// Define types for consultant data
interface ConsultantProfile {
  id?: string;
  user_id?: string;
  image_url?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  }[];
  headline?: string;
  university?: string;
  major?: string[];
  awards?: Award[];
  extracurriculars?: Extracurricular[];
  ap_scores?: APScore[];
  packages?: Package[];
  gpa_score?: number;
  gpa_scale?: number;
  is_weighted?: boolean;
  sat_reading?: number;
  sat_math?: number;
  act_composite?: number;
  act_english?: number;
  act_math?: number;
  act_reading?: number;
  act_science?: number;
  slug?: string;
  accepted_university_ids?: string[];
  accepted_schools?: string[];
  stripe_account_id?: string;
  stripe_charges_enabled?: boolean;
  stripe_onboarding_complete?: boolean;
}

// Define types for awards, activities, and other objects
interface Award {
  id: string;
  title: string;
  year?: string;
  description?: string;
}

interface Extracurricular {
  id: string;
  title: string;
  role?: string;
  institution?: string;
  years?: string[];
  description?: string;
}

interface APScore {
  id: string;
  subject: string;
  score: number;
}

interface Package {
  id: string;
  title: string;
  price: number;
  billing_frequency?: string;
  description?: string;
  features?: string[];
  is_visible?: boolean;
  position?: number;
}

const ConsultantProfilePage = () => {
  const { user, profile, isLoading, isConsultant } = useAuth();
  const router = useRouter();
  const [consultantData, setConsultantData] = useState<ConsultantProfile | null>(null);
  const [universities, setUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic-info');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('ConsultantProfilePage: No user, skipping data fetch');
        setLoading(false); // Make sure to set loading to false when there's no user
        return;
      }

      if (!isConsultant) {
        console.log('ConsultantProfilePage: User is not a consultant, skipping data fetch');
        setLoading(false); // Set loading to false for non-consultants
        return;
      }

      try {
        console.log('ConsultantProfilePage: Fetching consultant data for user:', user.id);
        
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
            act_english,
            act_math,
            act_reading,
            act_science,
            accepted_university_ids,
            accepted_schools,
            profiles!consultants_user_id_fkey(
              first_name,
              last_name,
              email
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (consultantError) {
          console.error('ConsultantProfilePage: Error fetching consultant data:', consultantError.message);
          setError(`Error fetching consultant data: ${consultantError.message}`);
          setLoading(false); // Ensure loading is set to false on error
          // Don't throw if it's just a "not found" error (PGRST116)
          if (consultantError.code === 'PGRST116') {
            console.log('ConsultantProfilePage: No consultant profile found, will show creation prompt');
            setConsultantData(null);
          } else {
            // Don't throw, just set the error state
            setError(`Error fetching consultant data: ${consultantError.message}`);
            setLoading(false);
            return;
          }
        } else {
          console.log('ConsultantProfilePage: Successfully fetched consultant data');
          
          // Now fetch related data separately
          if (consultantData) {
            try {
              // Fetch awards
              const { data: awardsData, error: awardsError } = await supabase
                .from('awards')
                .select('*')
                .eq('consultant_id', consultantData.id);
                
              if (awardsError) {
                console.error('Error fetching awards:', awardsError.message);
              }
                
              // Fetch extracurriculars
              const { data: extracurricularsData, error: extracurricularsError } = await supabase
                .from('extracurriculars')
                .select('*')
                .eq('consultant_id', consultantData.id);
                
              if (extracurricularsError) {
                console.error('Error fetching extracurriculars:', extracurricularsError.message);
              }
                
              // Fetch AP scores
              const { data: apScoresData, error: apScoresError } = await supabase
                .from('ap_scores')
                .select('*')
                .eq('consultant_id', consultantData.id);
                
              if (apScoresError) {
                console.error('Error fetching AP scores:', apScoresError.message);
              }
                
              // Fetch packages
              const { data: packagesData, error: packagesError } = await supabase
                .from('packages')
                .select('*')
                .eq('consultant_id', consultantData.id);
                
              if (packagesError) {
                console.error('Error fetching packages:', packagesError.message);
              }
                
              // Combine all data
              const formattedData: ConsultantProfile = {
                ...consultantData,
                awards: awardsData || [],
                extracurriculars: extracurricularsData || [],
                ap_scores: apScoresData || [],
                packages: packagesData || []
              };
              
              setConsultantData(formattedData);
            } catch (fetchRelatedError) {
              console.error('ConsultantProfilePage: Error fetching related data:', fetchRelatedError);
              setError('Error fetching related data. Please try again.');
              setLoading(false);
              return;
            }
          } else {
            setConsultantData(null);
          }
        }
        
        // Fetch universities for accepted schools
        const { data: universitiesData, error: universitiesError } = await supabase
          .from('universities')
          .select('*')
          .order('name');

        if (universitiesError) {
          console.error('ConsultantProfilePage: Error fetching universities:', universitiesError.message);
          setError('Error fetching universities. Please try again.');
          setLoading(false);
          return;
        }

        setUniversities(universitiesData?.map((university: any) => university.name) || []);
      } catch (err: unknown) {
        console.error('ConsultantProfilePage: Error fetching data:', err instanceof Error ? err.message : 'Unknown error');
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
        setLoading(false); // Ensure loading is set to false on error
      } finally {
        setLoading(false); // Always set loading to false when done
        console.log('ConsultantProfilePage: Data fetch complete, loading set to false');
      }
    };

    // Only fetch data if authentication check is complete
    if (!isLoading) {
      console.log('ConsultantProfilePage: Auth check complete, starting data fetch');
      fetchData();
    } else {
      console.log('ConsultantProfilePage: Auth still loading, waiting to fetch data');
    }
  }, [user, isLoading, isConsultant]);

  useEffect(() => {
    console.log('ConsultantProfilePage: Loading state changed to:', loading);
  }, [loading]);

  // Redirect if not authenticated or not a consultant
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('ConsultantProfilePage: Not authenticated, redirecting to signin');
        router.push('/auth/signin');
      } else if (!isConsultant) {
        console.log('ConsultantProfilePage: User is not a consultant, redirecting to profile');
        router.push('/profile');
      }
    }
  }, [user, isLoading, router, isConsultant]);

  const handleRetry = () => {
    console.log('ConsultantProfilePage: Retrying data fetch');
    setError(null);
    setLoading(true);
    // Force re-fetch by changing the state
    setConsultantData(null);
    setUniversities([]);
  };

  const handleCreateProfile = () => {
    router.push('/profile/consultant/create');
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 rounded-full border-4 border-t-main border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold">Loading profile data...</h2>
          <p className="text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto">
          <div className="bg-white p-6 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>
                {isLoading ? 'Checking authentication...' : 
                 !user ? 'You need to sign in to view this page.' : 
                 !isConsultant ? 'This page is only available to consultants.' : 
                 'An error occurred while loading your profile.'}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {!user && (
                <Link href="/signin">
                  <Button className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Sign In
                  </Button>
                </Link>
              )}
              {user && !isConsultant && (
                <Link href="/profile">
                  <Button className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Go to Profile
                  </Button>
                </Link>
              )}
              {user && isConsultant && error && (
                <Button 
                  onClick={handleRetry} 
                  className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!consultantData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto">
          <div className="bg-white p-6 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
            <h2 className="text-xl font-bold mb-4">Create Your Mentor Profile</h2>
            <p className="mb-6">You don't have a mentor profile yet. Create one to start mentoring students!</p>
            <Button 
              onClick={handleCreateProfile}
              className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Create Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if profile is in "coming soon" state (default state)
  const isComingSoon = consultantData.headline === 'Mentor Profile (Coming Soon)';

  if (isComingSoon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto">
          <div className="bg-white p-6 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
            <h2 className="text-xl font-bold mb-4">Your Mentor Profile</h2>
            <div className="p-6 mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-md inline-block">
              <p className="text-lg font-medium">Your profile is currently in "Coming Soon" mode</p>
              <p className="text-gray-600 mt-2">Complete your profile to make it visible to students</p>
            </div>
            <Link href="/profile/consultant/edit">
              <Button className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Complete Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-full overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {consultantData.image_url ? (
              <Image 
                src={consultantData.image_url} 
                alt={`${consultantData.profiles?.[0].first_name || 'Mentor'} profile`}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <User className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">
              {consultantData.profiles?.[0].first_name} {consultantData.profiles?.[0].last_name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mt-1">{consultantData.headline}</p>
            <p className="mt-2">{consultantData.university} {consultantData.major?.length > 0 ? `• ${consultantData.major?.join(', ')}` : ''}</p>
            
            <div className="mt-4">
              <Link href="/profile/consultant/edit">
                <Button className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="basic-info" className="data-[state=active]:bg-main">
              <User className="h-4 w-4 mr-2 hidden md:inline" />
              About
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-main">
              <GraduationCap className="h-4 w-4 mr-2 hidden md:inline" />
              Education
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-main">
              <Briefcase className="h-4 w-4 mr-2 hidden md:inline" />
              Services
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info">
            <Card className="p-4 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <h2 className="text-xl font-bold mb-4">About Me</h2>
              <div className="whitespace-pre-wrap">
                {isComingSoon ? 
                  "This mentor profile is currently being set up. Check back soon for more information!" : 
                  "No information available yet. Edit your profile to add more details about yourself."}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="education">
            <Card className="p-4 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <div className="space-y-8">
                {/* Education */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Education</h2>
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-bold text-lg">{consultantData.university || 'University not specified'}</h3>
                    <p className="text-gray-600">{consultantData.major?.join(', ') || 'Major not specified'}</p>
                    
                    {consultantData.gpa_score && (
                      <p className="mt-2">
                        <span className="font-medium">GPA:</span> {consultantData.gpa_score}/{consultantData.gpa_scale || 4.0} 
                        {consultantData.is_weighted && ' (weighted)'}
                      </p>
                    )}
                    
                    {(consultantData.sat_reading || consultantData.sat_math) && (
                      <p className="mt-1">
                        <span className="font-medium">SAT:</span> {consultantData.sat_reading || '—'} Reading, {consultantData.sat_math || '—'} Math
                      </p>
                    )}
                    
                    {consultantData.act_composite && (
                      <p className="mt-1">
                        <span className="font-medium">ACT:</span> {consultantData.act_composite}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Awards */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Awards & Honors</h3>
                  
                  {consultantData.awards && consultantData.awards.length > 0 ? (
                    <div className="space-y-4">
                      {consultantData.awards.map((award: Award) => (
                        <div key={award.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{award.title}</h4>
                            {award.year && <span className="text-gray-500">{award.year}</span>}
                          </div>
                          {award.description && <p className="mt-2 text-gray-600">{award.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-gray-200 rounded-md text-gray-500 italic">
                      No awards listed
                    </div>
                  )}
                </div>
                
                {/* Extracurriculars */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Extracurricular Activities</h3>
                  
                  {consultantData.extracurriculars && consultantData.extracurriculars.length > 0 ? (
                    <div className="space-y-4">
                      {consultantData.extracurriculars.map((activity: Extracurricular) => (
                        <div key={activity.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              {activity.role && <p className="text-gray-600">{activity.role}</p>}
                              {activity.institution && <p className="text-gray-500">{activity.institution}</p>}
                            </div>
                            {activity.years && activity.years.length > 0 && (
                              <div className="mt-2 md:mt-0 text-gray-500">
                                {activity.years.sort().join(', ')}
                              </div>
                            )}
                          </div>
                          {activity.description && <p className="mt-2 text-gray-600">{activity.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-gray-200 rounded-md text-gray-500 italic">
                      No activities listed
                    </div>
                  )}
                </div>
                
                {/* AP Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AP Exam Scores</h3>
                  
                  {consultantData.ap_scores && consultantData.ap_scores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {consultantData.ap_scores.map((ap: APScore) => (
                        <div key={ap.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-center">
                            <span>{ap.subject}</span>
                            <span className="font-bold">{ap.score}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-gray-200 rounded-md text-gray-500 italic">
                      No AP scores listed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <Card className="p-4 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <h2 className="text-xl font-bold mb-4">Services & Packages</h2>
              
              {consultantData.packages && consultantData.packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {consultantData.packages
                    .filter((pkg: Package) => pkg.is_visible !== false)
                    .sort((a: Package, b: Package) => (a.position || 0) - (b.position || 0))
                    .map((pkg: Package) => (
                      <Card 
                        key={pkg.id} 
                        className="p-4 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md flex flex-col h-full"
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-bold">{pkg.title}</h3>
                          <p className="text-2xl font-bold mt-2">${pkg.price}</p>
                          {pkg.billing_frequency && pkg.billing_frequency !== 'one-time' && (
                            <p className="text-sm text-gray-500">
                              {pkg.billing_frequency === 'hourly' ? 'per hour' : 
                               pkg.billing_frequency === 'monthly' ? 'per month' :
                               pkg.billing_frequency === 'yearly' ? 'per year' : ''}
                            </p>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4 flex-grow">{pkg.description}</p>
                        
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="mt-auto">
                            <h4 className="font-medium mb-2">What's included:</h4>
                            <ul className="space-y-2">
                              {pkg.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-main">✓</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500 italic mb-4">No services or packages listed yet</p>
                  <Link href="/profile/consultant/edit?tab=services">
                    <Button className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      Add Services
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsultantProfilePage;
