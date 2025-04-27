'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['student', 'consultant'], { required_error: 'Please select a role' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const { signUp, loading } = useSupabaseAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      setError(null);
      
      if (!values.email || !values.password || !values.role) {
        toast.error('All fields are required');
        return;
      }

      if (values.password !== values.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      await signUp({
        email: values.email,
        password: values.password,
        role: values.role,
      });
    } catch (err: any) {
      const message = err.message || 'An error occurred during sign up';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <div className="space-y-4 border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Create a password (min. 8 chars)" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="Confirm your password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>I am signing up as a...</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-black px-3 py-2 rounded hover:bg-gray-50">
                      <FormControl>
                        <RadioGroupItem value="student" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Student
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-black px-3 py-2 rounded hover:bg-gray-50">
                      <FormControl>
                        <RadioGroupItem value="consultant" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Consultant / Mentor
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded border border-red-300">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </div>
      </Form>

      <div className="text-center mt-4">
        <p className="text-sm">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="text-main hover:underline font-medium"
            tabIndex={0}
            aria-label="Sign in to your account"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
