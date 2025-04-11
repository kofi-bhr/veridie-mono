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
  const [activeTab, setActiveTab] = useState(initialTab || "basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format initial data for the form
  const defaultValues = {
    headline: initialData?.headline || '',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    slug: initialData?.slug || '',
    university: initialData?.university || '',
    major: initialData?.major || [],
    gpa_score: initialData?.gpa_score || null,
    gpa_scale: initialData?.gpa_scale || 4.0,
    is_weighted: initialData?.is_weighted || false,
    sat_reading: initialData?.sat_reading || null,
    sat_math: initialData?.sat_math || null,
    act_composite: initialData?.act_composite || null,
    accepted_university_ids: initialData?.accepted_university_ids || [],
    essays: initialData?.essays || [],
    extracurriculars: initialData?.extracurriculars || [],
    awards: initialData?.awards || [],
    ap_scores: initialData?.ap_scores || [],
    packages: initialData?.packages || []
  };
  
  const form = useForm<ConsultantProfileFormValues>({
    resolver: zodResolver(consultantProfileSchema) as any, // Use type assertion to fix resolver type mismatch
    defaultValues
  });
  
  const handleSubmit = async (values: ConsultantProfileFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('ConsultantProfileForm: Submitting form data');
      
      // Update consultant profile
      const { error } = await supabase
        .from('consultants')
        .upsert({
          id: initialData.id,
          user_id: userId,
          headline: values.headline,
          description: values.description,
          image_url: values.image_url,
          slug: values.slug,
          university: values.university,
          major: values.major,
          gpa_score: values.gpa_score,
          gpa_scale: values.gpa_scale,
          is_weighted: values.is_weighted,
          sat_reading: values.sat_reading,
          sat_math: values.sat_math,
          act_composite: values.act_composite,
          accepted_university_ids: values.accepted_university_ids,
        });
      
      if (error) {
        console.error('Error updating consultant profile:', error);
        setError(`Error updating profile: ${error.message}`);
        return;
      }
      
      // Handle essays
      if (values.essays && values.essays.length > 0) {
        const essayIds = values.essays.map(essay => essay.id).filter(Boolean);
        if (essayIds.length > 0) {
          await supabase
            .from('essays')
            .delete()
            .eq('consultant_id', initialData.id)
            .not('id', 'in', essayIds);
        } else {
          await supabase
            .from('essays')
            .delete()
            .eq('consultant_id', initialData.id);
        }
        
        for (const essay of values.essays) {
          if (essay.id) {
            await supabase
              .from('essays')
              .update({
                prompt: essay.prompt,
                content: essay.content,
                is_visible: essay.is_visible
              })
              .eq('id', essay.id);
          } else {
            await supabase
              .from('essays')
              .insert({
                consultant_id: initialData.id,
                prompt: essay.prompt,
                content: essay.content,
                is_visible: essay.is_visible
              });
          }
        }
      } else {
        await supabase
          .from('essays')
          .delete()
          .eq('consultant_id', initialData.id);
      }
      
      // Handle extracurriculars
      if (values.extracurriculars && values.extracurriculars.length > 0) {
        const ecIds = values.extracurriculars.map(ec => ec.id).filter(Boolean);
        if (ecIds.length > 0) {
          await supabase
            .from('extracurriculars')
            .delete()
            .eq('consultant_id', initialData.id)
            .not('id', 'in', ecIds);
        } else {
          await supabase
            .from('extracurriculars')
            .delete()
            .eq('consultant_id', initialData.id);
        }
        
        for (const ec of values.extracurriculars) {
          if (ec.id) {
            await supabase
              .from('extracurriculars')
              .update({
                name: ec.name,
                position: ec.position,
                description: ec.description,
                start_year: ec.start_year,
                end_year: ec.end_year,
                is_current: ec.is_current
              })
              .eq('id', ec.id);
          } else {
            await supabase
              .from('extracurriculars')
              .insert({
                consultant_id: initialData.id,
                name: ec.name,
                position: ec.position,
                description: ec.description,
                start_year: ec.start_year,
                end_year: ec.end_year,
                is_current: ec.is_current
              });
          }
        }
      } else {
        await supabase
          .from('extracurriculars')
          .delete()
          .eq('consultant_id', initialData.id);
      }
      
      // Handle awards
      if (values.awards && values.awards.length > 0) {
        const awardIds = values.awards.map(award => award.id).filter(Boolean);
        if (awardIds.length > 0) {
          await supabase
            .from('awards')
            .delete()
            .eq('consultant_id', initialData.id)
            .not('id', 'in', awardIds);
        } else {
          await supabase
            .from('awards')
            .delete()
            .eq('consultant_id', initialData.id);
        }
        
        for (const award of values.awards) {
          if (award.id) {
            await supabase
              .from('awards')
              .update({
                name: award.name,
                year: award.year,
                description: award.description
              })
              .eq('id', award.id);
          } else {
            await supabase
              .from('awards')
              .insert({
                consultant_id: initialData.id,
                name: award.name,
                year: award.year,
                description: award.description
              });
          }
        }
      } else {
        await supabase
          .from('awards')
          .delete()
          .eq('consultant_id', initialData.id);
      }
      
      // Handle AP scores
      if (values.ap_scores && values.ap_scores.length > 0) {
        const apIds = values.ap_scores.map(ap => ap.id).filter(Boolean);
        if (apIds.length > 0) {
          await supabase
            .from('ap_scores')
            .delete()
            .eq('consultant_id', initialData.id)
            .not('id', 'in', apIds);
        } else {
          await supabase
            .from('ap_scores')
            .delete()
            .eq('consultant_id', initialData.id);
        }
        
        for (const ap of values.ap_scores) {
          if (ap.id) {
            await supabase
              .from('ap_scores')
              .update({
                subject: ap.subject,
                score: ap.score
              })
              .eq('id', ap.id);
          } else {
            await supabase
              .from('ap_scores')
              .insert({
                consultant_id: initialData.id,
                subject: ap.subject,
                score: ap.score
              });
          }
        }
      } else {
        await supabase
          .from('ap_scores')
          .delete()
          .eq('consultant_id', initialData.id);
      }
      
      // Handle packages
      if (values.packages && values.packages.length > 0) {
        const packageIds = values.packages.map(pkg => pkg.id).filter(Boolean);
        if (packageIds.length > 0) {
          await supabase
            .from('packages')
            .delete()
            .eq('consultant_id', initialData.id)
            .not('id', 'in', packageIds);
        } else {
          await supabase
            .from('packages')
            .delete()
            .eq('consultant_id', initialData.id);
        }
        
        for (const [i, pkg] of values.packages.entries()) {
          if (pkg.id) {
            await supabase
              .from('packages')
              .update({
                name: pkg.name,
                description: pkg.description,
                price: pkg.price,
                duration: pkg.duration,
                is_featured: pkg.is_featured,
                position: i
              })
              .eq('id', pkg.id);
          } else {
            await supabase
              .from('packages')
              .insert({
                consultant_id: initialData.id,
                name: pkg.name,
                description: pkg.description,
                price: pkg.price,
                duration: pkg.duration,
                is_featured: pkg.is_featured,
                position: i
              });
          }
        }
      } else {
        await supabase
          .from('packages')
          .delete()
          .eq('consultant_id', initialData.id);
      }
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(values);
      } else {
        // Default behavior: redirect to the consultant profile page
        router.push('/profile/consultant');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      setError(`Error submitting form: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <form onSubmit={form.handleSubmit(handleSubmit as any)}>
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
            <EducationSection form={form} universities={universities} />
          </TabsContent>
          
          <TabsContent value="achievements">
            <AchievementsSection form={form} />
          </TabsContent>
          
          <TabsContent value="services">
            <ServicesSection form={form} />
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
