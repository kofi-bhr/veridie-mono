'use client';

import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoSectionProps {
  form: {
    register: any;
    errors: any;
  };
}

export default function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { register, errors } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            {...register('headline')}
            placeholder="e.g. Harvard Student | SAT 1600 | College Admissions Consultant"
          />
          {errors.headline && (
            <p className="text-red-500 text-sm mt-1">{errors.headline.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">About You</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Tell students about your background and expertise..."
            className="min-h-[150px]"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="image_url">Profile Image URL</Label>
          <Input
            id="image_url"
            {...register('image_url')}
            placeholder="https://example.com/your-image.jpg"
          />
          {errors.image_url && (
            <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="slug">Username</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="your-username"
          />
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
