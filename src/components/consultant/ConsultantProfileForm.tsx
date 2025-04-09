'use client';

import { useState } from 'react';
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

// Define form schema
const consultantProfileSchema = z.object({
  // Basic Info
  headline: z.string().min(1, "Headline is required"),
  bio: z.string().min(1, "Bio is required"),
  image_url: z.string().optional(),
  
  // Education
  university: z.string().min(1, "University is required"),
  major: z.array(z.string()).min(1, "At least one major is required"),
  gpa_score: z.coerce.number().min(0).max(5).optional().nullable(),
  gpa_scale: z.coerce.number().min(1).max(5).optional().nullable(),
  is_weighted: z.boolean().optional(),
  sat_reading: z.coerce.number().min(200).max(800).optional().nullable(),
  sat_math: z.coerce.number().min(200).max(800).optional().nullable(),
  act_composite: z.coerce.number().min(1).max(36).optional().nullable(),
  accepted_university_ids: z.array(z.string()).optional(),
  
  // Achievements
  awards: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Award title is required"),
      description: z.string().optional(),
      year: z.string().optional()
    })
  ).optional(),
  
  extracurriculars: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Activity title is required"),
      role: z.string().optional(),
      institution: z.string().optional(),
      description: z.string().optional(),
      years: z.array(z.string()).optional()
    })
  ).optional(),
  
  ap_scores: z.array(
    z.object({
      id: z.string().optional(),
      subject: z.string().min(1, "Subject is required"),
      score: z.coerce.number().min(1).max(5)
    })
  ).optional(),
  
  // Services
  packages: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Package title is required"),
      description: z.string().min(1, "Package description is required"),
      price: z.coerce.number().min(0, "Price must be a positive number"),
      features: z.array(z.string())
    })
  ).optional()
});

type ConsultantProfileFormValues = z.infer<typeof consultantProfileSchema>;

type ConsultantProfileFormProps = {
  initialData: any;
  universities: any[];
  userId: string;
};

const ConsultantProfileForm = ({ initialData, universities, userId }: ConsultantProfileFormProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format initial data for the form
  const defaultValues = {
    headline: initialData?.headline || '',
    bio: initialData?.bio || '',
    image_url: initialData?.image_url || '',
    university: initialData?.university || '',
    major: initialData?.major || [],
    gpa_score: initialData?.gpa_score || null,
    gpa_scale: initialData?.gpa_scale || 4.0,
    is_weighted: initialData?.is_weighted || false,
    sat_reading: initialData?.sat_reading || null,
    sat_math: initialData?.sat_math || null,
    act_composite: initialData?.act_composite || null,
    accepted_university_ids: initialData?.accepted_university_ids || [],
    awards: initialData?.awards || [],
    extracurriculars: initialData?.extracurriculars || [],
    ap_scores: initialData?.ap_scores || [],
    packages: initialData?.packages || []
  };
  
  const form = useForm<ConsultantProfileFormValues>({
    resolver: zodResolver(consultantProfileSchema),
    defaultValues
  });
  
  const onSubmit = async (values: ConsultantProfileFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Update consultant profile
      const { error } = await supabase
        .from('consultants')
        .update({
          headline: values.headline,
          bio: values.bio,
          image_url: values.image_url,
          university: values.university,
          major: values.major,
          gpa_score: values.gpa_score,
          gpa_scale: values.gpa_scale,
          is_weighted: values.is_weighted,
          sat_reading: values.sat_reading,
          sat_math: values.sat_math,
          act_composite: values.act_composite,
          accepted_university_ids: values.accepted_university_ids
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Handle awards
      if (values.awards && values.awards.length > 0) {
        // First delete any removed awards
        const awardIds = values.awards.map(award => award.id).filter(Boolean);
        if (awardIds.length > 0) {
          await supabase
            .from('awards')
            .delete()
            .eq('consultant_id', initialData.id)
            .not('id', 'in', awardIds);
        }
        
        // Then upsert all current awards
        for (const award of values.awards) {
          if (award.id) {
            // Update existing award
            await supabase
              .from('awards')
              .update({
                title: award.title,
                description: award.description,
                year: award.year
              })
              .eq('id', award.id);
          } else {
            // Insert new award
            await supabase
              .from('awards')
              .insert({
                consultant_id: initialData.id,
                title: award.title,
                description: award.description,
                year: award.year
              });
          }
        }
      }
      
      // Similar logic would be applied for extracurriculars, ap_scores, and packages
      
      router.push('/profile/consultant');
      router.refresh();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
            <BasicInfoSection form={form} />
          </TabsContent>
          
          <TabsContent value="education">
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Education Details</h2>
              
              {/* Placeholder for EducationSection component */}
              <p className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-md">
                EducationSection will be implemented in the next step
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements">
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Achievements & Activities</h2>
              
              {/* Placeholder for AchievementsSection component */}
              <p className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-md">
                AchievementsSection will be implemented in the next step
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="services">
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Services & Packages</h2>
              
              {/* Placeholder for ServicesSection component */}
              <p className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-md">
                ServicesSection will be implemented in the next step
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t-2 border-gray-200">
          <Button 
            type="button" 
            variant="reverse" 
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => router.push('/profile/consultant')}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConsultantProfileForm;
