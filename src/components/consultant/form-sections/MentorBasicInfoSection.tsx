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
import { useState, RefObject } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

type BasicInfoSectionProps = {
  form: UseFormReturn<any>;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileUpload: (file: File) => Promise<string | null>;
};

const BasicInfoSection = ({ form, fileInputRef, handleFileUpload }: BasicInfoSectionProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.getValues('image_url') || null);
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Basic Information</h2>
      
      {/* Profile Image Upload */}
      <div className="flex flex-col items-center mb-8">
        <div 
          className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer mb-4"
          onClick={handleImageClick}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile preview"
              fill
              className="object-cover"
              onError={() => setPreviewUrl(null)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>
        <Button 
          type="button" 
          variant="default" 
          size="sm"
          className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          onClick={handleImageClick}
        >
          Upload Profile Image
        </Button>
        <FormDescription className="text-center mt-2">
          Upload a professional profile photo
        </FormDescription>
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* First Name and Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">First Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter your first name" 
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Last Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter your last name" 
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
