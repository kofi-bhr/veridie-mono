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
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

type EducationSectionProps = {
  form: UseFormReturn<any>;
  universities: any[];
};

const EducationSection = ({ form, universities }: EducationSectionProps) => {
  const [newInterest, setNewInterest] = useState('');
  const [satEnabled, setSatEnabled] = useState(!!form.getValues('sat_score'));
  const [actEnabled, setActEnabled] = useState(!!form.getValues('act_composite'));
  
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    const currentInterests = form.getValues('interests') || [];
    if (!currentInterests.includes(newInterest)) {
      form.setValue('interests', [...currentInterests, newInterest]);
      setNewInterest('');
    }
  };
  
  const handleRemoveInterest = (index: number) => {
    const currentInterests = form.getValues('interests') || [];
    form.setValue('interests', currentInterests.filter((_: string, i: number) => i !== index));
  };
  
  // Get the current university from form values
  const currentUniversity = form.getValues('university');
  
  // Find the university object in the universities array
  const universityObj = universities.find(uni => uni.name === currentUniversity);
  
  // If found, add it to accepted universities if not already there
  if (universityObj && !form.getValues('accepted_university_ids')?.includes(universityObj.id)) {
    const currentAcceptedIds = form.getValues('accepted_university_ids') || [];
    form.setValue('accepted_university_ids', [...currentAcceptedIds, universityObj.id]);
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Education Details</h2>
      
      {/* University Dropdown */}
      <FormField
        control={form.control}
        name="university"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Attending University</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Find the university object
                const uni = universities.find(u => u.name === value);
                if (uni) {
                  // Add to accepted universities if not already there
                  const currentAcceptedIds = form.getValues('accepted_university_ids') || [];
                  if (!currentAcceptedIds.includes(uni.id)) {
                    form.setValue('accepted_university_ids', [...currentAcceptedIds, uni.id]);
                  }
                }
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base">
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.name}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Your current university
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Accepted Universities */}
      <FormField
        control={form.control}
        name="accepted_university_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Accepted Universities</FormLabel>
            <FormDescription className="mb-2">
              Select all universities that accepted you
            </FormDescription>
            <div className="flex flex-wrap gap-2 mb-4">
              {(field.value || []).map((id: string) => {
                const uni = universities.find(u => u.id === id);
                if (!uni) return null;
                
                return (
                  <div 
                    key={id}
                    className="flex items-center gap-2 bg-main/10 px-3 py-1 rounded-full"
                  >
                    <span>{uni.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        // Don't allow removing the current university
                        if (uni.name === form.getValues('university')) return;
                        
                        const currentIds = field.value || [];
                        field.onChange(currentIds.filter((uniId: string) => uniId !== id));
                      }}
                      className="text-black/70 hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {universities.map((university) => {
                // Skip if already in the list
                if ((field.value || []).includes(university.id)) return null;
                
                return (
                  <div key={university.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={university.id}
                      checked={(field.value || []).includes(university.id)}
                      onCheckedChange={(checked) => {
                        const currentValues = field.value || [];
                        if (checked) {
                          field.onChange([...currentValues, university.id]);
                        } else {
                          field.onChange(currentValues.filter((id: string) => id !== university.id));
                        }
                      }}
                      className="border-2 border-black data-[state=checked]:bg-main"
                    />
                    <label
                      htmlFor={university.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {university.name}
                    </label>
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Interests (Using majors field) */}
      <div className="space-y-4">
        <FormLabel className="text-base">Interests</FormLabel>
        <FormDescription>
          What were you into in high school? Include anything related to your current major or application spike.
        </FormDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {(form.getValues('interests') || []).map((interest: string, index: number) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-main/10 px-3 py-1 rounded-full"
            >
              <span>{interest}</span>
              <button
                type="button"
                onClick={() => handleRemoveInterest(index)}
                className="text-black/70 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            placeholder="Add an interest"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddInterest();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddInterest}
            variant="default"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        {form.formState.errors.interests && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.interests.message as string}
          </p>
        )}
      </div>
      
      {/* SAT Score Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">SAT Score</FormLabel>
          <Checkbox 
            checked={satEnabled}
            onCheckedChange={(checked) => {
              setSatEnabled(!!checked);
              if (!checked) {
                form.setValue('sat_score', null);
              } else {
                form.setValue('sat_score', 1200); // Default value
              }
            }}
            className="border-2 border-black data-[state=checked]:bg-main"
          />
        </div>
        <FormField
          control={form.control}
          name="sat_score"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className={`space-y-4 ${!satEnabled ? 'opacity-50' : ''}`}>
                  <Slider
                    disabled={!satEnabled}
                    min={400}
                    max={1600}
                    step={10}
                    value={[field.value || 1200]}
                    onValueChange={(values) => field.onChange(values[0])}
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6"
                  />
                  <div className="flex justify-between">
                    <span>400</span>
                    <span className="font-bold">{field.value || 1200}</span>
                    <span>1600</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* ACT Score Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">ACT Composite Score</FormLabel>
          <Checkbox 
            checked={actEnabled}
            onCheckedChange={(checked) => {
              setActEnabled(!!checked);
              if (!checked) {
                form.setValue('act_composite', null);
              } else {
                form.setValue('act_composite', 24); // Default value
              }
            }}
            className="border-2 border-black data-[state=checked]:bg-main"
          />
        </div>
        <FormField
          control={form.control}
          name="act_composite"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className={`space-y-4 ${!actEnabled ? 'opacity-50' : ''}`}>
                  <Slider
                    disabled={!actEnabled}
                    min={1}
                    max={36}
                    step={1}
                    value={[field.value || 24]}
                    onValueChange={(values) => field.onChange(values[0])}
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6"
                  />
                  <div className="flex justify-between">
                    <span>1</span>
                    <span className="font-bold">{field.value || 24}</span>
                    <span>36</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EducationSection;
