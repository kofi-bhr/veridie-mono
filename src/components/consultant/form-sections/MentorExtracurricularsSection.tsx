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
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';

type ExtracurricularsSectionProps = {
  form: UseFormReturn<any>;
};

const ExtracurricularsSection = ({ form }: ExtracurricularsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newExtracurricular, setNewExtracurricular] = useState({
    position_name: '',
    institution: '',
    role: '',
    years: [] as string[],
    description: '',
    is_visible: true
  });
  const [yearInput, setYearInput] = useState('');
  
  const handleAddYear = () => {
    if (!yearInput.trim()) return;
    
    if (!newExtracurricular.years.includes(yearInput)) {
      setNewExtracurricular({
        ...newExtracurricular,
        years: [...newExtracurricular.years, yearInput]
      });
      setYearInput('');
    }
  };
  
  const handleRemoveYear = (year: string) => {
    setNewExtracurricular({
      ...newExtracurricular,
      years: newExtracurricular.years.filter(y => y !== year)
    });
  };
  
  const handleAddExtracurricular = () => {
    if (!newExtracurricular.position_name || !newExtracurricular.institution || newExtracurricular.years.length === 0) {
      return;
    }
    
    const currentExtracurriculars = form.getValues('extracurriculars') || [];
    form.setValue('extracurriculars', [...currentExtracurriculars, newExtracurricular]);
    
    // Reset form
    setNewExtracurricular({
      position_name: '',
      institution: '',
      role: '',
      years: [],
      description: '',
      is_visible: true
    });
  };
  
  const handleRemoveExtracurricular = (index: number) => {
    const currentExtracurriculars = form.getValues('extracurriculars') || [];
    form.setValue('extracurriculars', currentExtracurriculars.filter((_: any, i: number) => i !== index));
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Extracurricular Activities</h3>
        <CollapsibleTrigger asChild>
          <Button variant="reverse" size="sm" className="p-2">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-4 space-y-4">
        <FormDescription>
          Add your extracurricular activities, including clubs, sports, volunteer work, and other activities.
        </FormDescription>
        
        {/* Display current extracurriculars */}
        {(form.getValues('extracurriculars') || []).length > 0 && (
          <div className="space-y-4 mb-6">
            {(form.getValues('extracurriculars') || []).map((extracurricular: any, index: number) => (
              <div key={index} className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{extracurricular.position_name}</h4>
                    <p className="text-sm">{extracurricular.institution}</p>
                    {extracurricular.role && <p className="text-sm text-gray-600">{extracurricular.role}</p>}
                  </div>
                  <Button
                    type="button"
                    variant="reverse"
                    size="sm"
                    className="p-1"
                    onClick={() => handleRemoveExtracurricular(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {extracurricular.years.map((year: string) => (
                    <span key={year} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {year}
                    </span>
                  ))}
                </div>
                {extracurricular.description && (
                  <p className="text-sm mt-2">{extracurricular.description}</p>
                )}
                <div className="flex items-center mt-2">
                  <Checkbox
                    id={`extracurricular-visible-${index}`}
                    checked={extracurricular.is_visible}
                    onCheckedChange={(checked) => {
                      const currentExtracurriculars = [...form.getValues('extracurriculars')];
                      currentExtracurriculars[index].is_visible = !!checked;
                      form.setValue('extracurriculars', currentExtracurriculars);
                    }}
                    className="border-2 border-black data-[state=checked]:bg-main"
                  />
                  <label
                    htmlFor={`extracurricular-visible-${index}`}
                    className="text-xs ml-2"
                  >
                    Visible on profile
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new extracurricular */}
        <div className="space-y-4 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
          <h4 className="font-semibold">Add New Extracurricular</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel className="text-sm">Position/Activity Name</FormLabel>
              <Input
                value={newExtracurricular.position_name}
                onChange={(e) => setNewExtracurricular({...newExtracurricular, position_name: e.target.value})}
                placeholder="e.g., Debate Team Captain"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
              />
            </div>
            
            <div>
              <FormLabel className="text-sm">Institution/Organization</FormLabel>
              <Input
                value={newExtracurricular.institution}
                onChange={(e) => setNewExtracurricular({...newExtracurricular, institution: e.target.value})}
                placeholder="e.g., Lincoln High School"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
              />
            </div>
          </div>
          
          <div>
            <FormLabel className="text-sm">Role (Optional)</FormLabel>
            <Input
              value={newExtracurricular.role}
              onChange={(e) => setNewExtracurricular({...newExtracurricular, role: e.target.value})}
              placeholder="e.g., Team Lead, Volunteer"
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
            />
          </div>
          
          <div>
            <FormLabel className="text-sm">Years</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {newExtracurricular.years.map((year) => (
                <div 
                  key={year}
                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"
                >
                  <span className="text-xs">{year}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveYear(year)}
                    className="text-black/70 hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                placeholder="e.g., 2022-2023"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddYear();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddYear}
                variant="default"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <FormLabel className="text-sm">Description (Optional)</FormLabel>
            <Textarea
              value={newExtracurricular.description}
              onChange={(e) => setNewExtracurricular({...newExtracurricular, description: e.target.value})}
              placeholder="Briefly describe your role and achievements"
              className="min-h-20 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Checkbox
              id="new-extracurricular-visible"
              checked={newExtracurricular.is_visible}
              onCheckedChange={(checked) => setNewExtracurricular({...newExtracurricular, is_visible: !!checked})}
              className="border-2 border-black data-[state=checked]:bg-main"
            />
            <label
              htmlFor="new-extracurricular-visible"
              className="text-sm ml-2"
            >
              Visible on profile
            </label>
          </div>
          
          <Button
            type="button"
            onClick={handleAddExtracurricular}
            variant="default"
            disabled={!newExtracurricular.position_name || !newExtracurricular.institution || newExtracurricular.years.length === 0}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Extracurricular
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="extracurriculars"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ExtracurricularsSection;
