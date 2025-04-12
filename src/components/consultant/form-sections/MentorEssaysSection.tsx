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

type EssaysSectionProps = {
  form: UseFormReturn<any>;
};

const EssaysSection = ({ form }: EssaysSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newEssay, setNewEssay] = useState({
    prompt: '',
    content: '',
    is_visible: true
  });
  
  const handleAddEssay = () => {
    if (!newEssay.prompt || !newEssay.content) {
      return;
    }
    
    const currentEssays = form.getValues('essays') || [];
    form.setValue('essays', [...currentEssays, newEssay]);
    
    // Reset form
    setNewEssay({
      prompt: '',
      content: '',
      is_visible: true
    });
  };
  
  const handleRemoveEssay = (index: number) => {
    const currentEssays = form.getValues('essays') || [];
    form.setValue('essays', currentEssays.filter((_: any, i: number) => i !== index));
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">College Essays</h3>
        <CollapsibleTrigger asChild>
          <Button variant="reverse" size="sm" className="p-2">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-4 space-y-4">
        <FormDescription>
          Share your college application essays to help students see examples of successful applications.
        </FormDescription>
        
        {/* Display current essays */}
        {(form.getValues('essays') || []).length > 0 && (
          <div className="space-y-4 mb-6">
            {(form.getValues('essays') || []).map((essay: any, index: number) => (
              <div key={index} className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{essay.prompt}</h4>
                  <Button
                    type="button"
                    variant="reverse"
                    size="sm"
                    className="p-1"
                    onClick={() => handleRemoveEssay(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm mt-2 whitespace-pre-line">{essay.content}</p>
                <div className="flex items-center mt-2">
                  <Checkbox
                    id={`essay-visible-${index}`}
                    checked={essay.is_visible}
                    onCheckedChange={(checked) => {
                      const currentEssays = [...form.getValues('essays')];
                      currentEssays[index].is_visible = !!checked;
                      form.setValue('essays', currentEssays);
                    }}
                    className="border-2 border-black data-[state=checked]:bg-main"
                  />
                  <label
                    htmlFor={`essay-visible-${index}`}
                    className="text-xs ml-2"
                  >
                    Visible on profile
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new essay */}
        <div className="space-y-4 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
          <h4 className="font-semibold">Add New Essay</h4>
          
          <div>
            <FormLabel className="text-sm">Essay Prompt</FormLabel>
            <Input
              value={newEssay.prompt}
              onChange={(e) => setNewEssay({...newEssay, prompt: e.target.value})}
              placeholder="e.g., Common App Personal Statement"
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
            />
          </div>
          
          <div>
            <FormLabel className="text-sm">Essay Content</FormLabel>
            <Textarea
              value={newEssay.content}
              onChange={(e) => setNewEssay({...newEssay, content: e.target.value})}
              placeholder="Paste your essay here"
              className="min-h-40 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Checkbox
              id="new-essay-visible"
              checked={newEssay.is_visible}
              onCheckedChange={(checked) => setNewEssay({...newEssay, is_visible: !!checked})}
              className="border-2 border-black data-[state=checked]:bg-main"
            />
            <label
              htmlFor="new-essay-visible"
              className="text-sm ml-2"
            >
              Visible on profile
            </label>
          </div>
          
          <Button
            type="button"
            onClick={handleAddEssay}
            variant="default"
            disabled={!newEssay.prompt || !newEssay.content}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Essay
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="essays"
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

export default EssaysSection;
