'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { DEFAULT_WELCOME_TEMPLATE } from '@/types/packages';
import { supabase } from '@/lib/supabase/client';

const contactSchema = z.object({
  contact_email: z.string().email('Invalid email address').nullable(),
  contact_phone: z
    .string()
    .regex(/^\+?1?\d{10,14}$/, 'Invalid phone number format')
    .nullable(),
  welcome_template: z.string().min(1, 'Welcome template is required'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSettingsTabProps {
  consultantId: string;
  initialData: {
    contact_email: string | null;
    contact_phone: string | null;
    welcome_template: string | null;
  };
}

export function ContactSettingsTab({
  consultantId,
  initialData,
}: ContactSettingsTabProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contact_email: initialData.contact_email || '',
      contact_phone: initialData.contact_phone || '',
      welcome_template: initialData.welcome_template || DEFAULT_WELCOME_TEMPLATE,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('consultants')
        .update({
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          welcome_template: data.welcome_template,
        })
        .eq('id', consultantId);

      if (error) throw error;

      toast.success('Contact settings updated successfully');
    } catch (error) {
      console.error('Error updating contact settings:', error);
      toast.error('Failed to update contact settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    reset({
      contact_email: initialData.contact_email || '',
      contact_phone: initialData.contact_phone || '',
      welcome_template: initialData.welcome_template || DEFAULT_WELCOME_TEMPLATE,
    });
    toast.info('Form reset to initial values');
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="contact@example.com"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              {...register('contact_email')}
            />
            {errors.contact_email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contact_email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              placeholder="+1234567890"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              {...register('contact_phone')}
            />
            {errors.contact_phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contact_phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="welcome_template">Welcome Email Template</Label>
            <Textarea
              id="welcome_template"
              placeholder="Enter your welcome email template..."
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[200px]"
              {...register('welcome_template')}
            />
            {errors.welcome_template && (
              <p className="text-red-500 text-sm mt-1">
                {errors.welcome_template.message}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Use {`{{consultant_name}}`} as a placeholder for your name in the template
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="neutral"
            onClick={handleReset}
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
