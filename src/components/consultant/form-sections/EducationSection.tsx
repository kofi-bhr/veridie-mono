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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';

type EducationSectionProps = {
  form: UseFormReturn<any>;
  universities: any[];
};

const EducationSection = ({ form, universities }: EducationSectionProps) => {
  const {
    formState: { errors },
    getValues,
    setValue,
    control,
    register
  } = form;
  const [newMajor, setNewMajor] = useState('');
  
  const handleAddMajor = () => {
    if (!newMajor.trim()) return;
    
    const currentMajors = getValues('major') || [];
    if (!currentMajors.includes(newMajor)) {
      setValue('major', [...currentMajors, newMajor]);
      setNewMajor('');
    }
  };
  
  const handleRemoveMajor = (index: number) => {
    const currentMajors = getValues('major') || [];
    setValue('major', currentMajors.filter((_: string, i: number) => i !== index));
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Education Details</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            {...register('university')}
            placeholder="e.g. Harvard University"
          />
          {errors.university?.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.university.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            {...register('major')}
            placeholder="e.g. Computer Science"
          />
          {errors.major?.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.major.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="sat_score">SAT Score</Label>
          <Input
            id="sat_score"
            type="number"
            {...register('sat_score')}
            placeholder="e.g. 1600"
          />
          {errors.sat_score?.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sat_score.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="num_aps">Number of AP Classes</Label>
          <Input
            id="num_aps"
            type="number"
            {...register('num_aps')}
            placeholder="e.g. 10"
          />
          {errors.num_aps?.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.num_aps.message as string}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <FormLabel className="text-base">Major(s)</FormLabel>
        <div className="flex flex-wrap gap-2 mb-4">
          {(getValues('major') || []).map((major: string, index: number) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-main/10 px-3 py-1 rounded-full"
            >
              <span>{major}</span>
              <button
                type="button"
                onClick={() => handleRemoveMajor(index)}
                className="text-black/70 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newMajor}
            onChange={(e) => setNewMajor(e.target.value)}
            placeholder="Add a major"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMajor();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddMajor}
            variant="default"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <FormDescription>
          Enter all majors or concentrations you're studying
        </FormDescription>
        {errors.major?.message && (
          <p className="text-red-500 text-sm mt-1">
            {errors.major.message as string}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="gpa_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">GPA Score</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  step="0.01"
                  placeholder="e.g., 3.8" 
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="gpa_scale"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">GPA Scale</FormLabel>
              <Select
                value={field.value?.toString() || '4.0'}
                onValueChange={(value) => field.onChange(parseFloat(value))}
              >
                <FormControl>
                  <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base">
                    <SelectValue placeholder="Select GPA scale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="4.0">4.0</SelectItem>
                  <SelectItem value="5.0">5.0</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="is_weighted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 border-black p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-2 border-black data-[state=checked]:bg-main"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-base">Weighted GPA</FormLabel>
              <FormDescription>
                Check if your GPA is weighted (includes extra points for honors/AP courses)
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="sat_reading"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">SAT Reading & Writing</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  placeholder="200-800" 
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="sat_math"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">SAT Math</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  placeholder="200-800" 
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="act_composite"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">ACT Composite Score</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="number"
                placeholder="1-36" 
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                value={field.value === null ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="accepted_schools"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Accepted Universities</FormLabel>
            <FormControl>
              <MultiSelect
                options={universities}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select universities..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EducationSection;
