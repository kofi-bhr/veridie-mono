'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import BasicInfoSection from './form-sections/BasicInfoSection';
import EducationSection from './form-sections/EducationSection';
import AchievementsSection from './form-sections/AchievementsSection';
import ServicesSection from './form-sections/ServicesSection';
import { useUser } from '@/lib/auth/useSupabaseAuth';
import { updateConsultantProfile, getConsultantProfile } from '@/lib/consultants/profileManager';
import { ConsultantProfile } from '@/types/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Define form schema
const consultantProfileSchema = z.object({
  // Basic Info
  headline: z.string().min(1, "Headline is required"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  slug: z.string().min(1, "Profile URL is required"),
  
  // Education
  university: z.string().min(1, "University is required"),
  major: z.array(z.string()).min(1, "At least one major is required"),
  gpa_score: z.number().nullable().optional(),
  gpa_scale: z.number().nullable().optional(),
  is_weighted: z.boolean().optional(),
  sat_reading: z.number().nullable().optional(),
  sat_math: z.number().nullable().optional(),
  act_composite: z.number().nullable().optional(),
  accepted_university_ids: z.array(z.string()).optional(),
  
  // Essays
  essays: z.array(
    z.object({
      prompt: z.string(),
      content: z.string(),
      is_visible: z.boolean().default(true),
      id: z.string().optional(),
    })
  ).optional(),
  
  // Extracurriculars
  extracurriculars: z.array(
    z.object({
      name: z.string(),
      position: z.string(),
      description: z.string(),
      start_year: z.number(),
      end_year: z.number().nullable(),
      is_current: z.boolean(),
      id: z.string().optional(),
    })
  ).optional(),
  
  // Awards
  awards: z.array(
    z.object({
      name: z.string(),
      year: z.number(),
      description: z.string(),
      id: z.string().optional(),
    })
  ).optional(),
  
  // AP Scores
  ap_scores: z.array(
    z.object({
      subject: z.string(),
      score: z.number(),
      id: z.string().optional(),
    })
  ).optional(),
  
  // Packages
  packages: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      duration: z.string(),
      is_featured: z.boolean().default(false),
      id: z.string().optional(),
    })
  ).optional(),
});

// Define the form values type from the schema
type ConsultantProfileFormValues = z.infer<typeof consultantProfileSchema>;

type ConsultantProfileFormProps = {
  initialData: any;
  universities: any[];
  userId: string;
  initialTab?: string;
  onSubmit?: (values: ConsultantProfileFormValues) => void;
};

const ConsultantProfileForm = ({ initialData, universities, userId, initialTab, onSubmit }: ConsultantProfileFormProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(initialTab || "basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataState, setInitialDataState] = useState<ConsultantProfile | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultantProfileFormValues>({
    resolver: zodResolver(consultantProfileSchema) as any, // Use type assertion to fix resolver type mismatch
  });
  
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      
      setIsLoading(true);
      const profile = await getConsultantProfile(user.id);
      setInitialDataState(profile);
      
      if (profile) {
        reset({
          headline: profile.headline || '',
          description: profile.description || '',
          image_url: profile.image_url || '',
          slug: profile.slug || '',
          university: profile.university || '',
          major: profile.major || [],
          gpa_score: profile.gpa_score || null,
          gpa_scale: profile.gpa_scale || 4.0,
          is_weighted: profile.is_weighted || false,
          sat_reading: profile.sat_reading || null,
          sat_math: profile.sat_math || null,
          act_composite: profile.act_composite || null,
          accepted_university_ids: profile.accepted_university_ids || [],
          essays: profile.essays || [],
          extracurriculars: profile.extracurriculars || [],
          awards: profile.awards || [],
          ap_scores: profile.ap_scores || [],
          packages: profile.packages || []
        });
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [user?.id, reset]);
  
  const handleSubmitForm = async (values: ConsultantProfileFormValues) => {
    if (!user?.id) {
      toast.error('Please sign in to update your profile');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    console.log('ConsultantProfileForm: Submitting form data');
    
    try {
      const updatedProfile = await updateConsultantProfile(user.id, values);
      if (updatedProfile) {
        setInitialDataState(updatedProfile);
      }
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(values);
      } else {
        // Default behavior: redirect to the consultant profile page
        router.push('/profile/consultant/edit-direct');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      setError(`Error submitting form: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return <div>Please sign in to access your profile</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(handleSubmitForm as any)}>
        {error && (
          <div className="p-4 mb-6 border-2 border-red-500 bg-red-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="basic-info" className="data-[state=active]:bg-main">Basic Info</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-main">Education</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-main">Achievements</TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-main">Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info">
            <BasicInfoSection form={{ register, errors }} />
          </TabsContent>
          
          <TabsContent value="education">
            <EducationSection form={{ register, errors }} universities={universities} />
          </TabsContent>
          
          <TabsContent value="achievements">
            <AchievementsSection form={{ register, errors }} />
          </TabsContent>
          
          <TabsContent value="services">
            <ServicesSection form={{ register, errors }} />
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t-2 border-gray-200">
          <Button 
            type="button" 
            variant="reverse" 
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => router.push('/profile/consultant/edit-direct')}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConsultantProfileForm;
