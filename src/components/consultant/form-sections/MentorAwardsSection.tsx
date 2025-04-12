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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type AwardsSectionProps = {
  form: UseFormReturn<any>;
};

const AwardsSection = ({ form }: AwardsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newAward, setNewAward] = useState({
    title: '',
    date: '',
    scope: '',
    description: '',
    is_visible: true
  });
  
  const handleAddAward = () => {
    if (!newAward.title || !newAward.date) {
      return;
    }
    
    const currentAwards = form.getValues('awards') || [];
    form.setValue('awards', [...currentAwards, newAward]);
    
    // Reset form
    setNewAward({
      title: '',
      date: '',
      scope: '',
      description: '',
      is_visible: true
    });
  };
  
  const handleRemoveAward = (index: number) => {
    const currentAwards = form.getValues('awards') || [];
    form.setValue('awards', currentAwards.filter((_: any, i: number) => i !== index));
  };
  
  const awardScopes = [
    "School",
    "District",
    "Regional",
    "State",
    "National",
    "International"
  ];
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Awards & Honors</h3>
        <CollapsibleTrigger asChild>
          <Button variant="reverse" size="sm" className="p-2">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-4 space-y-4">
        <FormDescription>
          Add your academic awards, honors, and recognitions.
        </FormDescription>
        
        {/* Display current awards */}
        {(form.getValues('awards') || []).length > 0 && (
          <div className="space-y-4 mb-6">
            {(form.getValues('awards') || []).map((award: any, index: number) => (
              <div key={index} className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{award.title}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{award.date}</span>
                      {award.scope && (
                        <>
                          <span>•</span>
                          <span>{award.scope}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="reverse"
                    size="sm"
                    className="p-1"
                    onClick={() => handleRemoveAward(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {award.description && (
                  <p className="text-sm mt-2">{award.description}</p>
                )}
                <div className="flex items-center mt-2">
                  <Checkbox
                    id={`award-visible-${index}`}
                    checked={award.is_visible}
                    onCheckedChange={(checked) => {
                      const currentAwards = [...form.getValues('awards')];
                      currentAwards[index].is_visible = !!checked;
                      form.setValue('awards', currentAwards);
                    }}
                    className="border-2 border-black data-[state=checked]:bg-main"
                  />
                  <label
                    htmlFor={`award-visible-${index}`}
                    className="text-xs ml-2"
                  >
                    Visible on profile
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new award */}
        <div className="space-y-4 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
          <h4 className="font-semibold">Add New Award</h4>
          
          <div>
            <FormLabel className="text-sm">Award Title</FormLabel>
            <Input
              value={newAward.title}
              onChange={(e) => setNewAward({...newAward, title: e.target.value})}
              placeholder="e.g., National Merit Scholar"
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel className="text-sm">Date</FormLabel>
              <Input
                value={newAward.date}
                onChange={(e) => setNewAward({...newAward, date: e.target.value})}
                placeholder="e.g., May 2023"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
              />
            </div>
            
            <div>
              <FormLabel className="text-sm">Scope (Optional)</FormLabel>
              <Select
                value={newAward.scope}
                onValueChange={(value) => setNewAward({...newAward, scope: value})}
              >
                <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {awardScopes.map((scope) => (
                    <SelectItem key={scope} value={scope}>
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <FormLabel className="text-sm">Description (Optional)</FormLabel>
            <Textarea
              value={newAward.description}
              onChange={(e) => setNewAward({...newAward, description: e.target.value})}
              placeholder="Briefly describe this award and its significance"
              className="min-h-20 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Checkbox
              id="new-award-visible"
              checked={newAward.is_visible}
              onCheckedChange={(checked) => setNewAward({...newAward, is_visible: !!checked})}
              className="border-2 border-black data-[state=checked]:bg-main"
            />
            <label
              htmlFor="new-award-visible"
              className="text-sm ml-2"
            >
              Visible on profile
            </label>
          </div>
          
          <Button
            type="button"
            onClick={handleAddAward}
            variant="default"
            disabled={!newAward.title || !newAward.date}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Award
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="awards"
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

export default AwardsSection;
