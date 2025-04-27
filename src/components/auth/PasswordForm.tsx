'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

// Define specific types for form values
export interface PasswordFormValues {
  password: string;
  confirmPassword: string;
}

export type PasswordFormProps = {
  onSubmit: (values: PasswordFormValues) => Promise<void>;
  formSchema: z.ZodType<PasswordFormValues>;
  submitText: string;
  isLoading: boolean;
  error: string | null;
};

const PasswordForm = ({
  onSubmit,
  formSchema,
  submitText,
  isLoading,
  error,
}: PasswordFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
  };

  // Password form fields
  const passwordFields: { name: keyof PasswordFormValues; label: string; type: string; placeholder: string }[] = [
    { name: 'password', label: 'New Password', type: 'password', placeholder: 'Enter your new password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your new password' },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 border-2 border-red-500 bg-red-50 rounded-md flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {passwordFields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-base">{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      {...formField}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                      value={formField.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base font-bold"
          >
            {isLoading ? 'Loading...' : submitText}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PasswordForm;
