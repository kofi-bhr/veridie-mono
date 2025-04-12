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
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

type APScoresSectionProps = {
  form: UseFormReturn<any>;
};

// List of AP courses
const AP_COURSES = [
  "Art History",
  "Biology",
  "Calculus AB",
  "Calculus BC",
  "Chemistry",
  "Chinese Language and Culture",
  "Computer Science A",
  "Computer Science Principles",
  "English Language",
  "English Literature",
  "Environmental Science",
  "European History",
  "French Language and Culture",
  "German Language and Culture",
  "Government and Politics (Comparative)",
  "Government and Politics (US)",
  "Human Geography",
  "Italian Language and Culture",
  "Japanese Language and Culture",
  "Latin",
  "Macroeconomics",
  "Microeconomics",
  "Music Theory",
  "Physics 1",
  "Physics 2",
  "Physics C: Electricity and Magnetism",
  "Physics C: Mechanics",
  "Psychology",
  "Research",
  "Seminar",
  "Spanish Language and Culture",
  "Spanish Literature and Culture",
  "Statistics",
  "Studio Art: 2-D Design",
  "Studio Art: 3-D Design",
  "Studio Art: Drawing",
  "US History",
  "World History"
];

const APScoresSection = ({ form }: APScoresSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  
  const handleAddAPScore = () => {
    if (!selectedCourse || selectedScore === null) return;
    
    const currentScores = form.getValues('ap_scores') || [];
    
    // Check if this course already exists
    const courseExists = currentScores.some((score: any) => score.subject === selectedCourse);
    
    if (!courseExists) {
      form.setValue('ap_scores', [
        ...currentScores, 
        { subject: selectedCourse, score: selectedScore }
      ]);
      
      // Update num_aps in the form
      const newNumAPs = (form.getValues('ap_scores') || []).length;
      form.setValue('num_aps', newNumAPs);
      
      // Reset selections
      setSelectedCourse('');
      setSelectedScore(null);
    }
  };
  
  const handleRemoveAPScore = (index: number) => {
    const currentScores = form.getValues('ap_scores') || [];
    form.setValue('ap_scores', currentScores.filter((_: any, i: number) => i !== index));
    
    // Update num_aps in the form
    const newNumAPs = (form.getValues('ap_scores') || []).length;
    form.setValue('num_aps', newNumAPs);
  };
  
  // Filter out courses that have already been selected
  const availableCourses = AP_COURSES.filter(course => {
    const currentScores = form.getValues('ap_scores') || [];
    return !currentScores.some((score: any) => score.subject === course);
  });
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AP Scores</h3>
        <CollapsibleTrigger asChild>
          <Button variant="reverse" size="sm" className="p-2">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-4 space-y-4">
        <FormDescription>
          Add your AP courses and scores. These will be displayed on your profile.
        </FormDescription>
        
        {/* Display current AP scores */}
        {(form.getValues('ap_scores') || []).length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-3 gap-2 font-semibold text-sm">
              <div>AP Course</div>
              <div>Score</div>
              <div></div>
            </div>
            {(form.getValues('ap_scores') || []).map((score: any, index: number) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center">
                <div>{score.subject}</div>
                <div>{score.score}</div>
                <div>
                  <Button
                    type="button"
                    variant="reverse"
                    size="sm"
                    className="p-1"
                    onClick={() => handleRemoveAPScore(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new AP score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FormLabel className="text-sm">AP Course</FormLabel>
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <FormLabel className="text-sm">Score</FormLabel>
            <Select
              value={selectedScore?.toString() || ''}
              onValueChange={(value) => setSelectedScore(parseInt(value))}
            >
              <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm">
                <SelectValue placeholder="Select score" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((score) => (
                  <SelectItem key={score} value={score.toString()}>
                    {score}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAddAPScore}
              variant="default"
              disabled={!selectedCourse || selectedScore === null}
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add AP Score
            </Button>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="ap_scores"
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

export default APScoresSection;
