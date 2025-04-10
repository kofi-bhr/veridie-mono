'use client';

import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import Image from 'next/image';

type BasicInfoSectionProps = {
  form: UseFormReturn<any>;
};

const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.getValues('image_url') || null);
  
  const handleImageUrlChange = (url: string) => {
    setPreviewUrl(url);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Basic Information</h2>
      
      <FormField
        control={form.control}
        name="headline"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Headline</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="e.g., Harvard Student helping with college applications" 
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
              />
            </FormControl>
            <FormDescription>
              A short headline that appears at the top of your profile
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Profile URL</FormLabel>
            <FormControl>
              <div className="flex items-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50">
                <span className="px-3 py-2 text-gray-500 bg-gray-100 border-r-2 border-black">
                  veridie.com/mentors/
                </span>
                <Input 
                  {...field} 
                  placeholder="your-unique-url" 
                  className="border-0 shadow-none p-6 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </FormControl>
            <FormDescription>
              This will be the URL for your public profile. Use only letters, numbers, and hyphens.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Bio</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Tell students about yourself, your background, and how you can help them" 
                className="min-h-32 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
              />
            </FormControl>
            <FormDescription>
              A detailed description of your background, expertise, and how you can help students
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Profile Image URL</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="https://example.com/your-image.jpg" 
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                    onChange={(e) => {
                      field.onChange(e);
                      handleImageUrlChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter a URL for your profile image. We recommend a professional headshot.
                </FormDescription>
                <FormMessage />
              </div>
              
              <div className="flex justify-center items-center">
                {previewUrl ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-black">
                    <Image
                      src={previewUrl}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoSection;
