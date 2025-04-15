'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import BasicInfoSection from './form-sections/MentorBasicInfoSection';
import EducationSection from './form-sections/MentorEducationSection';
import APScoresSection from './form-sections/MentorAPScoresSection';
import ExtracurricularsSection from './form-sections/MentorExtracurricularsSection';
import AwardsSection from './form-sections/MentorAwardsSection';
import EssaysSection from './form-sections/MentorEssaysSection';

// Define form schema
const mentorProfileSchema = z.object({
  // Basic Info
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  image_url: z.string().optional(),
  
  // Education
  university: z.string().min(1, "University is required"),
  accepted_university_ids: z.array(z.string()).min(1, "At least one accepted university is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  
  // Test Scores
  sat_score: z.number().nullable().optional(),
  act_composite: z.number().nullable().optional(),
  
  // AP Scores
  ap_scores: z.array(
    z.object({
      subject: z.string(),
      score: z.number().min(1).max(5),
      id: z.string().optional(),
    })
  ).optional(),
  
  // Extracurriculars
  extracurriculars: z.array(
    z.object({
      position_name: z.string(),
      institution: z.string(),
      role: z.string().optional(),
      years: z.array(z.string()),
      description: z.string().optional(),
      is_visible: z.boolean().default(true),
      id: z.string().optional(),
    })
  ).optional(),
  
  // Awards
  awards: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      scope: z.string().optional(),
      description: z.string().optional(),
      is_visible: z.boolean().default(true),
      id: z.string().optional(),
    })
  ).optional(),
  
  // Essays
  essays: z.array(
    z.object({
      prompt: z.string(),
      content: z.string(),
      is_visible: z.boolean().default(true),
      id: z.string().optional(),
    })
  ).optional(),
});

// Define the form values type from the schema
type MentorProfileFormValues = z.infer<typeof mentorProfileSchema>;

type MentorProfileFormProps = {
  initialData: any;
  universities: any[];
  userId: string;
  initialTab?: string;
  onSubmit?: (values: MentorProfileFormValues) => void;
};

const MentorProfileForm = ({ initialData, universities, userId, initialTab, onSubmit }: MentorProfileFormProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || "basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format initial data for the form
  const defaultValues = {
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    image_url: initialData?.image_url || '',
    university: initialData?.university || '',
    accepted_university_ids: initialData?.accepted_university_ids || [],
    interests: initialData?.major || [], // Using major field as interests
    sat_score: initialData?.sat_score || null,
    act_composite: initialData?.act_composite || null,
    ap_scores: initialData?.ap_scores || [],
    extracurriculars: initialData?.extracurriculars || [],
    awards: initialData?.awards || [],
    essays: initialData?.essays || [],
  };
  
  const form = useForm<MentorProfileFormValues>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues,
  });
  
  const handleFileUpload = async (file: File) => {
    if (!file || !user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };
  
  const handleSubmit = async (values: MentorProfileFormValues) => {
    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if consultant record exists
      const { data: existingConsultant } = await supabase
        .from('consultants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Update profile with first and last name
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: values.first_name,
          last_name: values.last_name,
        });
      
      // Create or update consultant record
      const consultantData = {
        user_id: user.id,
        university: values.university,
        sat_score: values.sat_score || 0,
        act_composite: values.act_composite || null,
        image_url: values.image_url || '',
        accepted_university_ids: values.accepted_university_ids,
        major: values.interests,
        num_aps: values.ap_scores?.length || 0,
      };
      
      let consultantId;
      
      if (existingConsultant) {
        // Update existing consultant
        const { error: updateError } = await supabase
          .from('consultants')
          .update(consultantData)
          .eq('id', existingConsultant.id);
          
        if (updateError) throw updateError;
        consultantId = existingConsultant.id;
      } else {
        // Create new consultant
        const { data: newConsultant, error: insertError } = await supabase
          .from('consultants')
          .insert(consultantData)
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        consultantId = newConsultant.id;
      }
      
      // Handle AP Scores
      if (values.ap_scores && values.ap_scores.length > 0) {
        // Get existing AP scores to determine which to update/delete
        const { data: existingScores } = await supabase
          .from('ap_scores')
          .select('id, subject')
          .eq('consultant_id', consultantId);
          
        const existingScoreIds = existingScores?.map(score => score.id) || [];
        const newScoreIds = values.ap_scores.filter(score => score.id).map(score => score.id as string);
        
        // Delete scores that are no longer present
        if (existingScoreIds.length > 0) {
          const scoreIdsToDelete = existingScoreIds.filter(id => !newScoreIds.includes(id));
          if (scoreIdsToDelete.length > 0) {
            await supabase
              .from('ap_scores')
              .delete()
              .in('id', scoreIdsToDelete);
          }
        }
        
        // Update or insert scores
        for (const score of values.ap_scores) {
          if (score.id) {
            // Update existing score
            await supabase
              .from('ap_scores')
              .update({
                subject: score.subject,
                score: score.score
              })
              .eq('id', score.id);
          } else {
            // Insert new score
            await supabase
              .from('ap_scores')
              .insert({
                consultant_id: consultantId,
                subject: score.subject,
                score: score.score
              });
          }
        }
      }
      
      // Handle Extracurriculars
      if (values.extracurriculars && values.extracurriculars.length > 0) {
        // Similar pattern for extracurriculars
        const { data: existingExtras } = await supabase
          .from('extracurriculars')
          .select('id')
          .eq('consultant_id', consultantId);
          
        const existingExtraIds = existingExtras?.map(extra => extra.id) || [];
        const newExtraIds = values.extracurriculars.filter(extra => extra.id).map(extra => extra.id as string);
        
        // Delete extracurriculars that are no longer present
        if (existingExtraIds.length > 0) {
          const extraIdsToDelete = existingExtraIds.filter(id => !newExtraIds.includes(id));
          if (extraIdsToDelete.length > 0) {
            await supabase
              .from('extracurriculars')
              .delete()
              .in('id', extraIdsToDelete);
          }
        }
        
        // Update or insert extracurriculars
        for (const extra of values.extracurriculars) {
          if (extra.id) {
            // Update existing
            await supabase
              .from('extracurriculars')
              .update({
                position_name: extra.position_name,
                institution: extra.institution,
                role: extra.role,
                years: extra.years,
                description: extra.description,
                is_visible: extra.is_visible
              })
              .eq('id', extra.id);
          } else {
            // Insert new
            await supabase
              .from('extracurriculars')
              .insert({
                consultant_id: consultantId,
                position_name: extra.position_name,
                institution: extra.institution,
                role: extra.role,
                years: extra.years,
                description: extra.description,
                is_visible: extra.is_visible
              });
          }
        }
      }
      
      // Handle Awards
      if (values.awards && values.awards.length > 0) {
        // Similar pattern for awards
        const { data: existingAwards } = await supabase
          .from('awards')
          .select('id')
          .eq('consultant_id', consultantId);
          
        const existingAwardIds = existingAwards?.map(award => award.id) || [];
        const newAwardIds = values.awards.filter(award => award.id).map(award => award.id as string);
        
        // Delete awards that are no longer present
        if (existingAwardIds.length > 0) {
          const awardIdsToDelete = existingAwardIds.filter(id => !newAwardIds.includes(id));
          if (awardIdsToDelete.length > 0) {
            await supabase
              .from('awards')
              .delete()
              .in('id', awardIdsToDelete);
          }
        }
        
        // Update or insert awards
        for (const award of values.awards) {
          if (award.id) {
            // Update existing
            await supabase
              .from('awards')
              .update({
                title: award.title,
                date: award.date,
                scope: award.scope,
                description: award.description,
                is_visible: award.is_visible
              })
              .eq('id', award.id);
          } else {
            // Insert new
            await supabase
              .from('awards')
              .insert({
                consultant_id: consultantId,
                title: award.title,
                date: award.date,
                scope: award.scope,
                description: award.description,
                is_visible: award.is_visible
              });
          }
        }
      }
      
      // Handle Essays
      if (values.essays && values.essays.length > 0) {
        // Similar pattern for essays
        const { data: existingEssays } = await supabase
          .from('essays')
          .select('id')
          .eq('consultant_id', consultantId);
          
        const existingEssayIds = existingEssays?.map(essay => essay.id) || [];
        const newEssayIds = values.essays.filter(essay => essay.id).map(essay => essay.id as string);
        
        // Delete essays that are no longer present
        if (existingEssayIds.length > 0) {
          const essayIdsToDelete = existingEssayIds.filter(id => !newEssayIds.includes(id));
          if (essayIdsToDelete.length > 0) {
            await supabase
              .from('essays')
              .delete()
              .in('id', essayIdsToDelete);
          }
        }
        
        // Update or insert essays
        for (const essay of values.essays) {
          if (essay.id) {
            // Update existing
            await supabase
              .from('essays')
              .update({
                prompt: essay.prompt,
                content: essay.content,
                is_visible: essay.is_visible
              })
              .eq('id', essay.id);
          } else {
            // Insert new
            await supabase
              .from('essays')
              .insert({
                consultant_id: consultantId,
                prompt: essay.prompt,
                content: essay.content,
                is_visible: essay.is_visible
              });
          }
        }
      }
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(values);
      } else {
        // Default behavior: redirect to the consultant profile page
        toast.success('Profile updated successfully');
        router.push('/profile/consultant/edit-direct');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      setError(`Error submitting form: ${error.message || 'Unknown error'}`);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-20 md:mt-24"> {/* Added top margin to account for navbar */}
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {error && (
          <div className="p-4 mb-6 border-2 border-red-500 bg-red-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="basic-info" className="data-[state=active]:bg-main">Basic Info</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-main">Education</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-main">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info">
            <BasicInfoSection form={form} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} />
          </TabsContent>
          
          <TabsContent value="education">
            <EducationSection form={form} universities={universities} />
          </TabsContent>
          
          <TabsContent value="achievements">
            <div className="space-y-8">
              <APScoresSection form={form} />
              
              <div className="border-t-2 border-gray-200 pt-6">
                <ExtracurricularsSection form={form} />
              </div>
              
              <div className="border-t-2 border-gray-200 pt-6">
                <AwardsSection form={form} />
              </div>
              
              <div className="border-t-2 border-gray-200 pt-6">
                <EssaysSection form={form} />
              </div>
            </div>
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
            disabled={isSubmitting}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
      
      {/* Hidden file input for profile image upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const imageUrl = await handleFileUpload(file);
            if (imageUrl) {
              form.setValue('image_url', imageUrl);
            }
          }
        }}
      />
    </div>
  );
};

export default MentorProfileForm;
