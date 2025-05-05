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

// Define the auth schema
export const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Define the auth form values type
export type AuthFormValues = z.infer<typeof authSchema>;

// Define the auth form props
type AuthFormProps = {
  onSubmit: (values: AuthFormValues) => Promise<void>;
  submitText: string;
  isLoading: boolean;
  error: string | null;
  showPassword?: boolean;
};

const AuthForm = ({
  onSubmit,
  submitText,
  isLoading,
  error,
  showPassword = true,
}: AuthFormProps) => {
  // Initialize the form
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const handleSubmit = async (values: AuthFormValues) => {
    await onSubmit(values);
  };

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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showPassword && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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

export default AuthForm;
