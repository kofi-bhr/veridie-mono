'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash, Plus, DollarSign, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ServicesSectionProps = {
  form: UseFormReturn<any>;
};

const ServicesSection = ({ form }: ServicesSectionProps) => {
  const [newFeature, setNewFeature] = useState<string>('');
  const [activePackageIndex, setActivePackageIndex] = useState<number | null>(null);
  
  const handleAddPackage = () => {
    const currentPackages = form.getValues('packages') || [];
    form.setValue('packages', [
      ...currentPackages, 
      { 
        id: uuidv4(), 
        title: '', 
        description: '', 
        price: 0,
        features: []
      }
    ]);
    
    // Set the newly added package as active
    setActivePackageIndex(currentPackages.length);
  };
  
  const handleRemovePackage = (index: number) => {
    const currentPackages = form.getValues('packages') || [];
    form.setValue('packages', currentPackages.filter((pkg: any, i: number) => i !== index));
    
    // Reset active package if the active one was removed
    if (activePackageIndex === index) {
      setActivePackageIndex(null);
    } else if (activePackageIndex !== null && activePackageIndex > index) {
      // Adjust the index if we removed a package before the active one
      setActivePackageIndex(activePackageIndex - 1);
    }
  };
  
  const handleAddFeature = (packageIndex: number) => {
    if (!newFeature.trim()) return;
    
    const currentPackages = form.getValues('packages') || [];
    const currentFeatures = currentPackages[packageIndex]?.features || [];
    
    if (!currentFeatures.includes(newFeature)) {
      const updatedPackages = [...currentPackages];
      updatedPackages[packageIndex].features = [...currentFeatures, newFeature];
      form.setValue('packages', updatedPackages);
      setNewFeature('');
    }
  };
  
  const handleRemoveFeature = (packageIndex: number, featureIndex: number) => {
    const currentPackages = form.getValues('packages') || [];
    const currentFeatures = currentPackages[packageIndex]?.features || [];
    
    const updatedPackages = [...currentPackages];
    updatedPackages[packageIndex].features = currentFeatures.filter((feature: string, i: number) => i !== featureIndex);
    form.setValue('packages', updatedPackages);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Services & Packages</h2>
      
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          onClick={handleAddPackage}
          variant="primary"
          className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Package
        </Button>
      </div>
      
      <FormField
        control={form.control}
        name="packages"
        render={() => (
          <FormItem>
            <div className="space-y-6">
              {(form.getValues('packages') || []).length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                  <p className="text-muted-foreground mb-4">You haven't created any service packages yet.</p>
                  <Button
                    type="button"
                    onClick={handleAddPackage}
                    variant="outline"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Package
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Package List (Left Side) */}
                  <div className="md:col-span-1 space-y-4">
                    <h3 className="font-medium text-gray-500 uppercase text-sm">Your Packages</h3>
                    {(form.getValues('packages') || []).map((pkg: any, index: number) => (
                      <Card 
                        key={pkg.id || index} 
                        className={`p-4 border-2 cursor-pointer transition-all ${
                          activePackageIndex === index 
                            ? 'border-main bg-main/5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                            : 'border-gray-200 hover:border-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
                        }`}
                        onClick={() => setActivePackageIndex(index)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{pkg.title || 'Untitled Package'}</h4>
                            <p className="text-sm text-gray-500">
                              {pkg.price ? `$${pkg.price}` : 'No price set'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="neutral"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePackage(index);
                            }}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Package Editor (Right Side) */}
                  <div className="md:col-span-2">
                    {activePackageIndex !== null && (form.getValues('packages') || [])[activePackageIndex] ? (
                      <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-bold text-lg mb-4">Edit Package</h3>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`packages.${activePackageIndex}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Package Title</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g., Essay Review Basic" 
                                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`packages.${activePackageIndex}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Describe what students will get with this package" 
                                    className="min-h-32 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`packages.${activePackageIndex}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Price (USD)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-0 top-0 h-full flex items-center pl-6">
                                      <DollarSign className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00" 
                                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 pl-12 text-base"
                                      value={field.value === 0 ? '' : field.value}
                                      onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Set the price for this package. Use whole numbers for clean pricing.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-2 pt-4">
                            <FormLabel className="text-base">Package Features</FormLabel>
                            <FormDescription>
                              Add bullet points highlighting what's included in this package
                            </FormDescription>
                            
                            <div className="space-y-2 mb-4">
                              {((form.getValues('packages') || [])[activePackageIndex]?.features || []).map((feature: string, featureIndex: number) => (
                                <div key={featureIndex} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                                  <Check className="h-4 w-4 text-main flex-shrink-0" />
                                  <span className="flex-grow">{feature}</span>
                                  <Button
                                    type="button"
                                    variant="neutral"
                                    onClick={() => handleRemoveFeature(activePackageIndex, featureIndex)}
                                    className="h-6 w-6 p-0 text-red-500"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-2">
                              <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="e.g., 2 rounds of essay review"
                                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddFeature(activePackageIndex);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={() => handleAddFeature(activePackageIndex)}
                                variant="primary"
                                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-md p-8">
                        <p className="text-muted-foreground text-center">
                          Select a package from the left to edit its details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ServicesSection;
