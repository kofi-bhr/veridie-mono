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
  slug: z.string().min(1, "Profile URL is required"),
  
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
  
  essays: z.array(
    z.object({
      id: z.string().optional(),
      prompt: z.string().min(1, "Essay prompt is required"),
      content: z.string().min(1, "Essay content is required"),
      is_visible: z.boolean().default(true)
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
      features: z.array(z.string()),
      billing_frequency: z.string().default("one-time"),
      is_visible: z.boolean().default(true)
    })
  ).optional()
});

type ConsultantProfileFormValues = z.infer<typeof consultantProfileSchema>;

type ConsultantProfileFormProps = {
  initialData: any;
  universities: any[];
  userId: string;
  initialTab?: string;
};

const ConsultantProfileForm = ({ initialData, universities, userId, initialTab }: ConsultantProfileFormProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab || "basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format initial data for the form
  const defaultValues = {
    headline: initialData?.headline || '',
    bio: initialData?.bio || '',
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
    awards: initialData?.awards || [],
    extracurriculars: initialData?.extracurriculars || [],
    essays: initialData?.essays || [],
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
      
      console.log('ConsultantProfileForm: Submitting form data');
      
      // Update consultant profile
      const { error } = await supabase
        .from('consultants')
        .update({
          headline: values.headline,
          bio: values.bio,
          slug: values.slug,
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
        } else {
          // If no awards with IDs, delete all existing awards
          await supabase
            .from('awards')
            .delete()
            .eq('consultant_id', initialData.id);
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
      } else {
        // If no awards in form, delete all existing awards
        await supabase
          .from('awards')
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
                title: ec.title,
                role: ec.role,
                institution: ec.institution,
                description: ec.description,
                years: ec.years
              })
              .eq('id', ec.id);
          } else {
            await supabase
              .from('extracurriculars')
              .insert({
                consultant_id: initialData.id,
                title: ec.title,
                role: ec.role,
                institution: ec.institution,
                description: ec.description,
                years: ec.years
              });
          }
        }
      } else {
        await supabase
          .from('extracurriculars')
          .delete()
          .eq('consultant_id', initialData.id);
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
      
      // Handle packages (placeholder for Stripe integration)
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
        
        for (let i = 0; i < values.packages.length; i++) {
          const pkg = values.packages[i];
          if (pkg.id) {
            await supabase
              .from('packages')
              .update({
                title: pkg.title,
                description: pkg.description,
                price: pkg.price,
                features: pkg.features,
                position: i,
                billing_frequency: pkg.billing_frequency || 'one-time',
                is_visible: pkg.is_visible
              })
              .eq('id', pkg.id);
          } else {
            await supabase
              .from('packages')
              .insert({
                consultant_id: initialData.id,
                title: pkg.title,
                description: pkg.description,
                price: pkg.price,
                features: pkg.features,
                position: i,
                billing_frequency: pkg.billing_frequency || 'one-time',
                is_visible: pkg.is_visible
              });
          }
        }
      } else {
        await supabase
          .from('packages')
          .delete()
          .eq('consultant_id', initialData.id);
      }
      
      // Redirect to the consultant's profile page
      router.push('/profile/consultant');
      router.refresh();
    } catch (err: any) {
      console.error('ConsultantProfileForm: Error updating profile:', err);
      setError(err.message || 'Failed to save profile data');
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
