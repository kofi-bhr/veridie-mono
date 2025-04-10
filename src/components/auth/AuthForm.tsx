'use client';

import { useState } from 'react';
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

type AuthFormProps = {
  onSubmit: (values: any) => Promise<void>;
  formSchema: z.ZodType<any>;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }[];
  submitText: string;
  isLoading: boolean;
  error: string | null;
};

const AuthForm = ({
  onSubmit,
  formSchema,
  fields,
  submitText,
  isLoading,
  error,
}: AuthFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {} as Record<string, string>),
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
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

          {fields.map((field) => (
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

export default AuthForm;
