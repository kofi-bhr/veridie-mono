import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Form } from '@/components/ui/neobrutalism';
import { PackageCard } from './PackageCard';
import { Package, CreatePackageData, UpdatePackageData } from '@/lib/payments/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

const packageSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(100),
  description: z.array(z.string()).min(1, { message: 'At least one description item is required' }),
  price: z.number().min(0.01, { message: 'Price must be greater than 0' }),
  calendly_link: z.string()
    .url({ message: 'Must be a valid URL' })
    .refine((url) => url.includes('calendly.com'), { message: 'Must be a Calendly URL' }),
  is_active: z.boolean().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  initialData?: Package;
  onSubmit: (data: CreatePackageData | UpdatePackageData) => Promise<void>;
  consultant_id: string;
}

export function PackageForm({ initialData, onSubmit, consultant_id }: PackageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionItems, setDescriptionItems] = useState<string[]>(
    initialData?.description || ['']
  );
  const { toast } = useToast();

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || [''],
      price: initialData?.price || 0,
      calendly_link: initialData?.calendly_link || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleAddDescription = () => {
    setDescriptionItems([...descriptionItems, '']);
    form.setValue('description', [...form.getValues('description'), '']);
  };

  const handleRemoveDescription = (index: number) => {
    const newItems = descriptionItems.filter((_, i) => i !== index);
    setDescriptionItems(newItems);
    form.setValue('description', newItems);
  };

  const handleDescriptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newItems = [...descriptionItems];
    newItems[index] = e.target.value;
    setDescriptionItems(newItems);
    form.setValue('description', newItems);
  };

  const handleSubmit = async (data: PackageFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        consultant_id,
        description: data.description.filter(item => item.trim() !== ''),
      });
      toast({
        title: 'Success',
        description: `Package ${initialData ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save package. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewData: Package = {
    id: initialData?.id || 'preview',
    title: form.watch('title') || 'Package Title',
    description: form.watch('description').filter(item => item.trim() !== '') || [],
    price: form.watch('price') || 0,
    calendly_link: form.watch('calendly_link') || '',
    consultant_id,
    stripe_price_id: initialData?.stripe_price_id || '',
    stripe_product_id: initialData?.stripe_product_id || '',
    is_active: form.watch('is_active') ?? true,
    created_at: initialData?.created_at || new Date().toISOString(),
    updated_at: initialData?.updated_at || new Date().toISOString(),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Input
            label="Package Title"
            {...form.register('title')}
            error={form.formState.errors.title?.message}
          />

          <div className="space-y-4">
            <label className="text-sm font-medium">Package Features</label>
            {descriptionItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleDescriptionChange(index, e)}
                  placeholder={`Feature ${index + 1}`}
                  error={form.formState.errors.description?.[index]?.message}
                />
                {descriptionItems.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveDescription(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="neutral"
              onClick={handleAddDescription}
            >
              Add Feature
            </Button>
          </div>

          <Input
            label="Price"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
            error={form.formState.errors.price?.message}
          />

          <Input
            label="Calendly Link"
            {...form.register('calendly_link')}
            error={form.formState.errors.calendly_link?.message}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...form.register('is_active')}
              className="h-4 w-4"
            />
            <label className="text-sm font-medium">Active</label>
          </div>

          <Alert className="my-4">
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure your Calendly link is correct and the event type is properly configured.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Package' : 'Create Package'}
          </Button>
        </form>
      </Form>

      <div className="lg:sticky lg:top-4">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <PackageCard package={previewData} />
      </div>
    </div>
  );
}
