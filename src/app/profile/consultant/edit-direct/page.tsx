'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { 
  X, 
  Plus, 
  Upload, 
  User, 
  GraduationCap, 
  Award, 
  Briefcase, 
  FileText, 
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';

// Define types
interface University {
  id: string;
  name: string;
  logo_url: string;
  color_hex: string;
}

interface APScore {
  id?: string;
  consultant_id?: string;
  subject: string;
  score: number; // 0-100
}

interface Award {
  id?: string;
  consultant_id?: string;
  title: string;
  description?: string;
  date?: string;
  scope?: string;
  is_visible?: boolean;
}

interface Extracurricular {
  id?: string;
  consultant_id?: string;
  position_name: string;
  role?: string;
  institution?: string;
  years?: string[];
  description?: string;
  is_visible?: boolean;
}

interface ConsultantProfile {
  id?: string;
  user_id?: string;
  headline?: string;
  university?: string;
  major?: string[];
  image_url?: string;
  gpa_score?: number;
  gpa_scale?: number;
  is_weighted?: boolean;
  sat_reading?: number;
  sat_math?: number;
  act_english?: number;
  act_math?: number;
  act_reading?: number;
  act_science?: number;
  act_composite?: number;
  accepted_university_ids?: string[];
  accepted_schools?: string[];
  slug?: string;
  gpa_on_4_scale?: number;
}

// AP Subject options
const AP_SUBJECTS = [
  'Art History', 'Biology', 'Calculus AB', 'Calculus BC', 'Chemistry',
  'Chinese Language', 'Computer Science A', 'Computer Science Principles',
  'English Language', 'English Literature', 'Environmental Science',
  'European History', 'French Language', 'German Language', 'Government & Politics',
  'Human Geography', 'Italian Language', 'Japanese Language', 'Latin',
  'Macroeconomics', 'Microeconomics', 'Music Theory', 'Physics 1',
  'Physics 2', 'Physics C: Electricity & Magnetism', 'Physics C: Mechanics',
  'Psychology', 'Research', 'Seminar', 'Spanish Language', 'Spanish Literature',
  'Statistics', 'Studio Art: 2-D Design', 'Studio Art: 3-D Design', 'Studio Art: Drawing',
  'U.S. History', 'World History'
];

// Major/Interest options
const MAJORS = [
  'Accounting', 'Aerospace Engineering', 'African American Studies', 'Agriculture',
  'American Studies', 'Animal Science', 'Anthropology', 'Applied Mathematics',
  'Architecture', 'Art History', 'Artificial Intelligence', 'Asian Studies',
  'Astronomy', 'Biochemistry', 'Bioengineering', 'Biology', 'Biomedical Engineering',
  'Biotechnology', 'Business Administration', 'Chemical Engineering', 'Chemistry',
  'Civil Engineering', 'Classics', 'Communications', 'Computer Engineering',
  'Computer Science', 'Construction Management', 'Criminal Justice', 'Cybersecurity',
  'Data Science', 'Dentistry', 'Design', 'Earth Science', 'Economics', 'Education',
  'Electrical Engineering', 'English', 'Environmental Science', 'Film Studies',
  'Finance', 'Fine Arts', 'Food Science', 'Forestry', 'Gender Studies', 'Genetics',
  'Geography', 'Geology', 'Graphic Design', 'Health Sciences', 'History',
  'Hospitality Management', 'Human Resources', 'Industrial Engineering',
  'Information Systems', 'International Relations', 'Journalism', 'Kinesiology',
  'Landscape Architecture', 'Law', 'Linguistics', 'Management', 'Marine Biology',
  'Marketing', 'Materials Science', 'Mathematics', 'Mechanical Engineering',
  'Media Studies', 'Medicine', 'Meteorology', 'Microbiology', 'Music', 'Neuroscience',
  'Nursing', 'Nutrition', 'Oceanography', 'Pharmacy', 'Philosophy', 'Photography',
  'Physical Therapy', 'Physics', 'Political Science', 'Psychology', 'Public Health',
  'Public Policy', 'Real Estate', 'Religious Studies', 'Social Work', 'Sociology',
  'Software Engineering', 'Spanish', 'Sports Management', 'Statistics', 'Theater',
  'Urban Planning', 'Veterinary Medicine', 'Web Development', 'Wildlife Biology',
  'Women\'s Studies', 'Zoology'
];

const ConsultantProfileEditPage = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Add error boundary state
  const [error, setError] = useState<string | null>(null);
  
  // Add a reference to track if we've already attempted to redirect
  const hasAttemptedRedirect = useRef(false);
  // Add a reference to track if we've initialized
  const isInitialized = useRef(false);
  // Add file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State variables
  const [profile, setProfile] = useState<ConsultantProfile>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<University[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State for AP scores, awards, and extracurricular activities
  const [apScores, setApScores] = useState<APScore[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic-info');

  // Store original profile data for dirty checking
  const [originalProfile, setOriginalProfile] = useState<ConsultantProfile | null>(null);
  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');

  // Add error handling for auth
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasAttemptedRedirect.current) {
      hasAttemptedRedirect.current = true;
      router.push('/auth/signin?redirect=/profile/consultant/edit-direct');
    }
  }, [isLoading, isAuthenticated, router]);

  // Add this useEffect to call fetchData when authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchData();
    }
  }, [isLoading, isAuthenticated]);

  // Add this useEffect to reset isInitialized if the user changes
  useEffect(() => {
    isInitialized.current = false;
  }, [user?.id]);

  // Helper to clean AP score payloads
  function cleanApScoreInsert(score: APScore, consultantId: string): { subject: string; score: number; consultant_id: string } | undefined {
    if (!score.subject || !consultantId || typeof score.score !== 'number' || score.score < 1 || score.score > 5) return undefined;
    return {
      subject: score.subject,
      score: score.score,
      consultant_id: consultantId,
    };
  }

  // Update saveApScores function
  const saveApScores = async (consultantId: string) => {
    if (!consultantId) return;
    if (!supabase) throw new Error('Supabase client not initialized');
    try {
      // First, delete existing AP scores
      const { error: deleteError } = await supabase
        .from('ap_scores')
        .delete()
        .eq('consultant_id', consultantId);
      if (deleteError) throw deleteError;
      // Then insert new AP scores
      if (apScores.length > 0) {
        const apScoresWithConsultantId = apScores
          .map(score => cleanApScoreInsert(score, consultantId))
          .filter((s): s is { subject: string; score: number; consultant_id: string } => Boolean(s));
        if (apScoresWithConsultantId.length > 0) {
          const { error: insertError } = await supabase
            .from('ap_scores')
            .insert(apScoresWithConsultantId);
          if (insertError) throw insertError;
        }
      }
      console.log('Saving AP scores:', apScores);
    } catch (err) {
      console.error('Error saving AP scores:', err);
      throw new Error('Failed to save AP scores');
    }
  };

  // Update the GPA handling
  const handleGpaScoreChange = (value: string) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setProfile({...profile, gpa_score: undefined, gpa_scale: undefined});
      return;
    }
    
    // Calculate GPA on 4.0 scale
    const gpaScale = profile.gpa_scale || 4.0;
    const gpaOn4Scale = (parsed / gpaScale) * 4.0;
    
    setProfile({
      ...profile,
      gpa_score: parsed,
      gpa_scale: gpaScale,
      gpa_on_4_scale: gpaOn4Scale
    });
  };

  // Add saveAwards function to save awards to database
  const saveAwards = async (consultantId: string) => {
    if (!consultantId) return;
    
    try {
      // First, delete existing awards
      const { error: deleteError } = await supabase
        .from('awards')
        .delete()
        .eq('consultant_id', consultantId);
        
      if (deleteError) throw deleteError;
      
      // Then insert new awards
      if (awards.length > 0) {
        const awardsWithConsultantId = awards.map(award => ({
          ...award,
          consultant_id: consultantId,
          id: award.id || undefined // Remove temporary IDs
        }));
        
        const { error: insertError } = await supabase
          .from('awards')
          .insert(awardsWithConsultantId);
          
        if (insertError) throw insertError;
      }
      
      console.log('Saving Awards:', awards);
      return true;
    } catch (err) {
      console.error("Error saving awards:", err);
      return false;
    }
  };

  // Add saveExtracurriculars function to save extracurriculars to database
  const saveExtracurriculars = async (consultantId: string) => {
    if (!consultantId) return;
    
    try {
      // First, delete existing extracurriculars
      const { error: deleteError } = await supabase
        .from('extracurriculars')
        .delete()
        .eq('consultant_id', consultantId);
        
      if (deleteError) throw deleteError;
      
      // Then insert new extracurriculars
      if (extracurriculars.length > 0) {
        const extracurricularsWithConsultantId = extracurriculars.map(ec => ({
          ...ec,
          consultant_id: consultantId,
          id: ec.id || undefined // Remove temporary IDs
        }));
        
        const { error: insertError } = await supabase
          .from('extracurriculars')
          .insert(extracurricularsWithConsultantId);
          
        if (insertError) throw insertError;
      }
      
      console.log('Saving Extracurriculars:', extracurriculars);
      return true;
    } catch (err) {
      console.error("Error saving extracurriculars:", err);
      return false;
    }
  };

  // Update saveProfile function to save related data
  const saveProfile = async () => {
    if (!user) {
      toast.error("You must be logged in to save your profile");
      return;
    }

    setSaving(true);
    const userId = user.id;

    try {
      // Dirty check for profile fields
      const profileUpdates: any = {};
      if (firstName !== originalFirstName) profileUpdates.first_name = firstName;
      if (lastName !== originalLastName) profileUpdates.last_name = lastName;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);
        if (profileError) {
          throw new Error(`Error updating profile: ${profileError.message}`);
        }
      }

      // Handle image upload if a new image was selected
      let imageUrl = profile.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${userId}/profile.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: true
          });
        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
        profileUpdates.image_url = imageUrl;
      }

      // Generate a slug from the user's name if it doesn't exist
      const slug = profile.slug || `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;

      // First, check if a consultant profile already exists
      const { data: existingConsultant } = await supabase
        .from('consultants')
        .select('id')
        .eq('user_id', userId)
        .single();

      let consultantId;
      if (existingConsultant) {
        consultantId = existingConsultant.id;
      } else {
        // Create new consultant with required fields
        const { data, error: createError } = await supabase
          .from('consultants')
          .insert({
            user_id: userId,
            slug: slug,
            university: profile.university || 'Not specified',
            image_url: imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/640px-Default_pfp.svg.png',
            major: selectedMajors || ['Undecided'],
            accepted_schools: selectedUniversities.map(u => u.name) || [],
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        if (createError) {
          throw new Error(`Error creating consultant profile: ${createError.message}`);
        }
        consultantId = data.id;
      }

      // Dirty check for consultant fields
      const consultantUpdates: any = {};
      if (originalProfile) {
        if (profile.university !== originalProfile.university) consultantUpdates.university = profile.university;
        if (profile.headline !== originalProfile.headline) consultantUpdates.headline = profile.headline;
        if (imageUrl !== originalProfile.image_url) consultantUpdates.image_url = imageUrl;
        if (JSON.stringify(selectedMajors) !== JSON.stringify(originalProfile.major)) consultantUpdates.major = selectedMajors;
        if (JSON.stringify(selectedUniversities.map(u => u.name)) !== JSON.stringify(originalProfile.accepted_schools)) consultantUpdates.accepted_schools = selectedUniversities.map(u => u.name);
        if (profile.gpa_score !== originalProfile.gpa_score) consultantUpdates.gpa_score = profile.gpa_score;
        if (profile.gpa_scale !== originalProfile.gpa_scale) consultantUpdates.gpa_scale = profile.gpa_scale;
        if (profile.is_weighted !== originalProfile.is_weighted) consultantUpdates.is_weighted = profile.is_weighted;
        if (profile.sat_reading !== originalProfile.sat_reading) consultantUpdates.sat_reading = profile.sat_reading;
        if (profile.sat_math !== originalProfile.sat_math) consultantUpdates.sat_math = profile.sat_math;
        if (profile.act_english !== originalProfile.act_english) consultantUpdates.act_english = profile.act_english;
        if (profile.act_math !== originalProfile.act_math) consultantUpdates.act_math = profile.act_math;
        if (profile.act_reading !== originalProfile.act_reading) consultantUpdates.act_reading = profile.act_reading;
        if (profile.act_science !== originalProfile.act_science) consultantUpdates.act_science = profile.act_science;
        if (profile.act_composite !== originalProfile.act_composite) consultantUpdates.act_composite = profile.act_composite;
        if (JSON.stringify(selectedUniversities.map(u => u.id)) !== JSON.stringify(originalProfile.accepted_university_ids)) consultantUpdates.accepted_university_ids = selectedUniversities.map(u => u.id);
      } else {
        // If no original, update all
        consultantUpdates.university = profile.university;
        consultantUpdates.headline = profile.headline;
        consultantUpdates.image_url = imageUrl;
        consultantUpdates.major = selectedMajors;
        consultantUpdates.accepted_schools = selectedUniversities.map(u => u.name);
        consultantUpdates.gpa_score = profile.gpa_score;
        consultantUpdates.gpa_scale = profile.gpa_scale;
        consultantUpdates.is_weighted = profile.is_weighted;
        consultantUpdates.sat_reading = profile.sat_reading;
        consultantUpdates.sat_math = profile.sat_math;
        consultantUpdates.act_english = profile.act_english;
        consultantUpdates.act_math = profile.act_math;
        consultantUpdates.act_reading = profile.act_reading;
        consultantUpdates.act_science = profile.act_science;
        consultantUpdates.act_composite = profile.act_composite;
        consultantUpdates.accepted_university_ids = selectedUniversities.map(u => u.id);
      }

      if (Object.keys(consultantUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from('consultants')
          .update(consultantUpdates)
          .eq('id', consultantId);
        if (updateError) {
          throw new Error(`Error updating consultant profile: ${updateError.message}`);
        }
      }

      // Save related data
      if (consultantId) {
        await Promise.all([
          saveApScores(consultantId),
          saveAwards(consultantId),
          saveExtracurriculars(consultantId)
        ]);
      }

      toast.success("Profile saved successfully!");
      router.refresh();
      const toastId = toast.loading('Redirecting to your profile...');
      setTimeout(() => {
        toast.dismiss(toastId);
        router.push(`/mentors/${slug}`);
      }, 1000);

      console.log('Profile update payload:', profileUpdates);
      console.log('Consultant update payload:', consultantUpdates);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };
  
  // Update the fetchData function to properly populate all fields
  const fetchData = async () => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!hasAttemptedRedirect.current) {
          hasAttemptedRedirect.current = true;
          router.push('/auth/signin?redirect=/profile/consultant/edit-direct');
        }
        return;
      }

      const userId = session.user.id;

      // Fetch all data in parallel
      const [
        { data: profileData },
        { data: universitiesData },
        { data: consultantData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('universities').select('*'),
        supabase.from('consultants').select('*').eq('user_id', userId).single()
      ]);

      if (profileData) {
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
        setOriginalFirstName(profileData.first_name || '');
        setOriginalLastName(profileData.last_name || '');
      }

      if (universitiesData) {
        setUniversities(universitiesData);
      }

      if (consultantData) {
        setProfile(consultantData);
        setOriginalProfile(consultantData);
        setSelectedMajors(consultantData.major || []);
        setImagePreview(consultantData.image_url || null);
        
        // If we have a consultant profile, fetch related data
        if (consultantData.id) {
          const [
            { data: apScoresData },
            { data: awardsData },
            { data: extracurricularsData }
          ] = await Promise.all([
            supabase.from('ap_scores').select('*').eq('consultant_id', consultantData.id),
            supabase.from('awards').select('*').eq('consultant_id', consultantData.id),
            supabase.from('extracurriculars').select('*').eq('consultant_id', consultantData.id)
          ]);

          if (apScoresData) setApScores(apScoresData);
          if (awardsData) setAwards(awardsData);
          if (extracurricularsData) setExtracurriculars(extracurricularsData);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };
  
  // Add handleImageChange function
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle university selection
  const handleUniversityChange = (universityId: string) => {
    // Set as primary university
    setProfile(prev => ({
      ...prev,
      university: universities.find(u => u.id === universityId)?.name || ''
    }));
    
    // Also add to accepted universities
    const university = universities.find(u => u.id === universityId);
    if (university && !selectedUniversities.some(u => u.id === universityId)) {
      setSelectedUniversities(prev => [...prev, university]);
    }
  };
  
  // Add university to accepted list
  const addAcceptedUniversity = (universityId: string) => {
    const university = universities.find(u => u.id === universityId);
    if (university && !selectedUniversities.some(u => u.id === universityId)) {
      setSelectedUniversities(prev => [...prev, university]);
    }
  };
  
  // Remove university from accepted list
  const removeAcceptedUniversity = (universityId: string) => {
    setSelectedUniversities(prev => prev.filter(u => u.id !== universityId));
  };
  
  // Handle major/interest selection
  const handleMajorToggle = (major: string) => {
    setSelectedMajors(prev => {
      if (prev.includes(major)) {
        return prev.filter(m => m !== major);
      } else {
        return [...prev, major];
      }
    });
  };
  
  // Add error display component
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-6 border-2 border-red-500 rounded-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Add loading display
  if (loading || isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Add auth check
  if (!isAuthenticated) {
    return null; // Let the useEffect handle redirect
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Edit Your Mentor Profile</h1>
        <p className="text-gray-600">
          Complete your profile to connect with students and showcase your experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col items-center">
                <div 
                  className="w-32 h-32 relative rounded-full overflow-hidden border-2 border-black mb-4 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <Image 
                      src={imagePreview} 
                      alt="Profile" 
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <button 
                  className="text-sm text-blue-600 hover:underline mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Profile Photo
                </button>
                
                <div className="w-full">
                  <Button 
                    onClick={saveProfile} 
                    className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold mb-2">Navigation</h3>
              <div className="space-y-2">
                <button 
                  className={`w-full text-left p-2 rounded ${activeTab === 'basic-info' ? 'bg-main text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('basic-info')}
                >
                  Basic Information
                </button>
                <button 
                  className={`w-full text-left p-2 rounded ${activeTab === 'education' ? 'bg-main text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('education')}
                >
                  Education & Test Scores
                </button>
                <button 
                  className={`w-full text-left p-2 rounded ${activeTab === 'activities' ? 'bg-main text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('activities')}
                >
                  Activities & Awards
                </button>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Basic Information */}
            {activeTab === 'basic-info' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={profile.headline || ''}
                    onChange={(e) => setProfile({...profile, headline: e.target.value})}
                    placeholder="e.g., Computer Science Student at Stanford University"
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    A brief description that appears under your name
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="university">University</Label>
                  <Select
                    value={profile.university ? universities.find(u => u.name === profile.university)?.id : ''}
                    onValueChange={handleUniversityChange}
                  >
                    <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          {university.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Accepted Universities</Label>
                  <Select onValueChange={addAcceptedUniversity}>
                    <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <SelectValue placeholder="Add universities you were accepted to" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          {university.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUniversities.map((university) => (
                      <Badge 
                        key={university.id}
                        className="flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-white"
                      >
                        {university.name}
                        <button 
                          onClick={() => removeAcceptedUniversity(university.id)}
                          className="ml-1 rounded-full hover:bg-gray-200 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Interests/Major</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Select interests related to your high school activities or college major
                  </p>
                  
                  <div className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {MAJORS.map((major) => (
                        <div key={major} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`major-${major}`} 
                            checked={selectedMajors.includes(major)}
                            onCheckedChange={() => handleMajorToggle(major)}
                          />
                          <label
                            htmlFor={`major-${major}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {major}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMajors.map((major) => (
                      <Badge 
                        key={major}
                        className="flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-white"
                      >
                        {major}
                        <button 
                          onClick={() => handleMajorToggle(major)}
                          className="ml-1 rounded-full hover:bg-gray-200 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Education & Test Scores */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Education & Test Scores</h2>
                
                {/* GPA */}
                <div className="space-y-4">
                  <h3 className="font-bold">GPA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="gpa_score">Unweighted GPA (0-4.0)</Label>
                      <Slider
                        id="gpa_score"
                        value={[profile.gpa_score || 0]}
                        min={0}
                        max={4}
                        step={0.01}
                        onValueChange={value => setProfile({ ...profile, gpa_score: value[0] })}
                        className="py-4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gpa_scale">Scale (e.g., 4.0, 5.0, 100)</Label>
                      <Input
                        id="gpa_scale"
                        type="number"
                        step="0.1"
                        min="0"
                        value={profile.gpa_scale || ''}
                        onChange={(e) => {
                          const scale = parseFloat(e.target.value);
                          if (!isNaN(scale)) {
                            const gpaOn4Scale = (profile.gpa_score || 0) / scale * 4.0;
                            setProfile({
                              ...profile,
                              gpa_scale: scale,
                              gpa_on_4_scale: gpaOn4Scale
                            });
                          }
                        }}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                    <div>
                      <Label>4.0 Scale GPA</Label>
                      <div className="p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md">
                        {profile.gpa_on_4_scale ? profile.gpa_on_4_scale.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="is_weighted" 
                      checked={profile.is_weighted || false}
                      onCheckedChange={(checked) => setProfile({...profile, is_weighted: checked === true})}
                    />
                    <label
                      htmlFor="is_weighted"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Weighted GPA
                    </label>
                  </div>
                </div>
                
                {/* SAT Scores */}
                <div className="space-y-4">
                  <h3 className="font-bold">SAT Scores</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="sat_reading">Reading & Writing</Label>
                        <span className="font-bold">{profile.sat_reading || 0}</span>
                      </div>
                      <Slider
                        id="sat_reading"
                        value={[profile.sat_reading || 0]}
                        min={0}
                        max={800}
                        step={10}
                        onValueChange={(value) => setProfile({...profile, sat_reading: value[0]})}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>400</span>
                        <span>800</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="sat_math">Math</Label>
                        <span className="font-bold">{profile.sat_math || 0}</span>
                      </div>
                      <Slider
                        id="sat_math"
                        value={[profile.sat_math || 0]}
                        min={0}
                        max={800}
                        step={10}
                        onValueChange={(value) => setProfile({...profile, sat_math: value[0]})}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>400</span>
                        <span>800</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total SAT Score</span>
                        <span className="text-xl font-bold">
                          {((profile.sat_reading || 0) + (profile.sat_math || 0)) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ACT Scores */}
                <div className="space-y-4">
                  <h3 className="font-bold">ACT Scores</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="act_english">English</Label>
                        <span className="font-bold">{profile.act_english || 0}</span>
                      </div>
                      <Slider
                        id="act_english"
                        value={[profile.act_english || 0]}
                        min={0}
                        max={36}
                        step={1}
                        onValueChange={(value) => setProfile({...profile, act_english: value[0]})}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>18</span>
                        <span>36</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="act_math">Math</Label>
                        <span className="font-bold">{profile.act_math || 0}</span>
                      </div>
                      <Slider
                        id="act_math"
                        value={[profile.act_math || 0]}
                        min={0}
                        max={36}
                        step={1}
                        onValueChange={(value) => setProfile({...profile, act_math: value[0]})}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>18</span>
                        <span>36</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="act_reading">Reading</Label>
                        <span className="font-bold">{profile.act_reading || 0}</span>
                      </div>
                      <Slider
                        id="act_reading"
                        value={[profile.act_reading || 0]}
                        min={0}
                        max={36}
                        step={1}
                        onValueChange={(value) => setProfile({...profile, act_reading: value[0]})}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>18</span>
                        <span>36</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="act_science">Science</Label>
                        <span className="font-bold">{profile.act_science || 0}</span>
                      </div>
                      <Slider
                        id="act_science"
                        value={[profile.act_science || 0]}
                        min={0}
                        max={36}
                        step={1}
                        onValueChange={(value) => setProfile({...profile, act_science: value[0]})}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>18</span>
                        <span>36</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="act_composite">Composite Score</Label>
                        <span className="font-bold">{profile.act_composite || 0}</span>
                      </div>
                      <Slider
                        id="act_composite"
                        value={[profile.act_composite || 0]}
                        min={0}
                        max={36}
                        step={1}
                        onValueChange={(value) => setProfile({...profile, act_composite: value[0]})}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>18</span>
                        <span>36</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AP Scores */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">AP Scores</h3>
                    <Button
                      onClick={() => {
                        setApScores([...apScores, { subject: '', score: 3 }]);
                      }}
                      variant="default"
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add AP Score
                    </Button>
                  </div>
                  
                  {apScores.length > 0 ? (
                    <div className="space-y-4">
                      {apScores.map((ap, index) => (
                        <div key={ap.id || index} className="p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`ap-subject-${index}`}>AP Subject</Label>
                              <Select
                                value={ap.subject}
                                onValueChange={(value) => {
                                  const newScores = [...apScores];
                                  newScores[index].subject = value;
                                  setApScores(newScores);
                                }}
                              >
                                <SelectTrigger id={`ap-subject-${index}`} className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  <SelectValue placeholder="Select AP Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {AP_SUBJECTS.map((subject) => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="w-24">
                              <Label htmlFor={`ap-score-${index}`}>Score (1-5)</Label>
                              <Select
                                id={`ap-score-${index}`}
                                value={ap.score ? ap.score.toString() : ''}
                                onValueChange={value => {
                                  const newScores = [...apScores];
                                  newScores[index].score = parseInt(value, 10);
                                  setApScores(newScores);
                                }}
                              >
                                <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  <SelectValue placeholder="Select Score" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1,2,3,4,5].map(val => (
                                    <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <Button
                              variant="default"
                              size="icon"
                              className="self-end mb-1"
                              onClick={() => {
                                const newScores = [...apScores];
                                newScores.splice(index, 1);
                                setApScores(newScores);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-md text-center">
                      <p className="text-gray-500">No AP scores added yet</p>
                      <Button
                        onClick={() => {
                          setApScores([...apScores, { subject: '', score: 3 }]);
                        }}
                        variant="default"
                        className="mt-2"
                      >
                        Add Your First AP Score
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activities & Awards */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Activities & Awards</h2>
                
                {/* Extracurricular Activities */}
                <Accordion type="single" collapsible defaultValue="extracurriculars" className="w-full">
                  <AccordionItem value="extracurriculars" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        <h3 className="font-bold">Extracurricular Activities</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-4">
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              setExtracurriculars([
                                ...extracurriculars,
                                {
                                  position_name: '',
                                  role: '',
                                  institution: '',
                                  years: [],
                                  description: '',
                                  is_visible: true
                                }
                              ]);
                            }}
                            variant="default"
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add Activity
                          </Button>
                        </div>
                        
                        {extracurriculars.length > 0 ? (
                          <div className="space-y-4">
                            {extracurriculars.map((activity, index) => (
                              <div key={activity.id || index} className="p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <Label htmlFor={`activity-name-${index}`}>Activity Name</Label>
                                    <Input
                                      id={`activity-name-${index}`}
                                      value={activity.position_name}
                                      onChange={(e) => {
                                        const newActivities = [...extracurriculars];
                                        newActivities[index].position_name = e.target.value;
                                        setExtracurriculars(newActivities);
                                      }}
                                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`activity-role-${index}`}>Your Role</Label>
                                    <Input
                                      id={`activity-role-${index}`}
                                      value={activity.role || ''}
                                      onChange={(e) => {
                                        const newActivities = [...extracurriculars];
                                        newActivities[index].role = e.target.value;
                                        setExtracurriculars(newActivities);
                                      }}
                                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    />
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <Label htmlFor={`activity-institution-${index}`}>Organization/Institution</Label>
                                  <Input
                                    id={`activity-institution-${index}`}
                                    value={activity.institution || ''}
                                    onChange={(e) => {
                                      const newActivities = [...extracurriculars];
                                      newActivities[index].institution = e.target.value;
                                      setExtracurriculars(newActivities);
                                    }}
                                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                  />
                                </div>
                                
                                <div className="mb-4">
                                  <Label>Years Involved</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {['Freshman', 'Sophomore', 'Junior', 'Senior'].map((year) => (
                                      <div key={year} className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={`activity-${index}-year-${year}`} 
                                          checked={(activity.years || []).includes(year)}
                                          onCheckedChange={(checked) => {
                                            const newActivities = [...extracurriculars];
                                            if (checked) {
                                              newActivities[index].years = [...(newActivities[index].years || []), year];
                                            } else {
                                              newActivities[index].years = (newActivities[index].years || []).filter(y => y !== year);
                                            }
                                            setExtracurriculars(newActivities);
                                          }}
                                        />
                                        <label
                                          htmlFor={`activity-${index}-year-${year}`}
                                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {year}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <Label htmlFor={`activity-description-${index}`}>Description</Label>
                                  <Textarea
                                    id={`activity-description-${index}`}
                                    value={activity.description || ''}
                                    onChange={(e) => {
                                      const newActivities = [...extracurriculars];
                                      newActivities[index].description = e.target.value;
                                      setExtracurriculars(newActivities);
                                    }}
                                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`activity-visible-${index}`} 
                                      checked={activity.is_visible !== false}
                                      onCheckedChange={(checked) => {
                                        const newActivities = [...extracurriculars];
                                        newActivities[index].is_visible = checked === true;
                                        setExtracurriculars(newActivities);
                                      }}
                                    />
                                    <label
                                      htmlFor={`activity-visible-${index}`}
                                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Show on profile
                                    </label>
                                  </div>
                                  
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      const newActivities = [...extracurriculars];
                                      newActivities.splice(index, 1);
                                      setExtracurriculars(newActivities);
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-gray-300 rounded-md text-center">
                            <p className="text-gray-500">No activities added yet</p>
                            <Button
                              onClick={() => {
                                setExtracurriculars([
                                  {
                                    position_name: '',
                                    role: '',
                                    institution: '',
                                    years: [],
                                    description: '',
                                    is_visible: true
                                  }
                                ]);
                              }}
                              variant="default"
                              className="mt-2"
                            >
                              Add Your First Activity
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Awards */}
                <Accordion type="single" collapsible defaultValue="awards" className="w-full">
                  <AccordionItem value="awards" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <h3 className="font-bold">Awards & Honors</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-4">
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              setAwards([
                                ...awards,
                                {
                                  title: '',
                                  description: '',
                                  date: '',
                                  scope: 'School',
                                  is_visible: true
                                }
                              ]);
                            }}
                            variant="default"
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add Award
                          </Button>
                        </div>
                        
                        {awards.length > 0 ? (
                          <div className="space-y-4">
                            {awards.map((award, index) => (
                              <div key={award.id || index} className="p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <Label htmlFor={`award-title-${index}`}>Award Title</Label>
                                    <Input
                                      id={`award-title-${index}`}
                                      value={award.title}
                                      onChange={(e) => {
                                        const newAwards = [...awards];
                                        newAwards[index].title = e.target.value;
                                        setAwards(newAwards);
                                      }}
                                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`award-date-${index}`}>Date/Year</Label>
                                    <Input
                                      id={`award-date-${index}`}
                                      value={award.date || ''}
                                      onChange={(e) => {
                                        const newAwards = [...awards];
                                        newAwards[index].date = e.target.value;
                                        setAwards(newAwards);
                                      }}
                                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                      placeholder="e.g., 2023 or May 2023"
                                    />
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <Label htmlFor={`award-scope-${index}`}>Scope</Label>
                                  <Select
                                    value={award.scope || 'School'}
                                    onValueChange={(value) => {
                                      const newAwards = [...awards];
                                      newAwards[index].scope = value;
                                      setAwards(newAwards);
                                    }}
                                  >
                                    <SelectTrigger id={`award-scope-${index}`} className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="School">School</SelectItem>
                                      <SelectItem value="District">District</SelectItem>
                                      <SelectItem value="Regional">Regional</SelectItem>
                                      <SelectItem value="State">State</SelectItem>
                                      <SelectItem value="National">National</SelectItem>
                                      <SelectItem value="International">International</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="mb-4">
                                  <Label htmlFor={`award-description-${index}`}>Description</Label>
                                  <Textarea
                                    id={`award-description-${index}`}
                                    value={award.description || ''}
                                    onChange={(e) => {
                                      const newAwards = [...awards];
                                      newAwards[index].description = e.target.value;
                                      setAwards(newAwards);
                                    }}
                                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`award-visible-${index}`} 
                                      checked={award.is_visible !== false}
                                      onCheckedChange={(checked) => {
                                        const newAwards = [...awards];
                                        newAwards[index].is_visible = checked === true;
                                        setAwards(newAwards);
                                      }}
                                    />
                                    <label
                                      htmlFor={`award-visible-${index}`}
                                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Show on profile
                                    </label>
                                  </div>
                                  
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      const newAwards = [...awards];
                                      newAwards.splice(index, 1);
                                      setAwards(newAwards);
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-gray-300 rounded-md text-center">
                            <p className="text-gray-500">No awards added yet</p>
                            <Button
                              onClick={() => {
                                setAwards([
                                  {
                                    title: '',
                                    description: '',
                                    date: '',
                                    scope: 'School',
                                    is_visible: true
                                  }
                                ]);
                              }}
                              variant="default"
                              className="mt-2"
                            >
                              Add Your First Award
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsultantProfileEditPage;
