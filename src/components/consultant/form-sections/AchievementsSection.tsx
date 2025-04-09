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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Trash, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

type AchievementsSectionProps = {
  form: UseFormReturn<any>;
};

const AchievementsSection = ({ form }: AchievementsSectionProps) => {
  // Generate years for dropdowns (last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
  
  // Awards
  const handleAddAward = () => {
    const currentAwards = form.getValues('awards') || [];
    form.setValue('awards', [
      ...currentAwards, 
      { id: uuidv4(), title: '', description: '', year: currentYear.toString() }
    ]);
  };
  
  const handleRemoveAward = (index: number) => {
    const currentAwards = form.getValues('awards') || [];
    form.setValue('awards', currentAwards.filter((award: any, i: number) => i !== index));
  };
  
  // Extracurriculars
  const handleAddExtracurricular = () => {
    const currentExtracurriculars = form.getValues('extracurriculars') || [];
    form.setValue('extracurriculars', [
      ...currentExtracurriculars, 
      { 
        id: uuidv4(), 
        title: '', 
        role: '', 
        institution: '', 
        description: '', 
        years: [] 
      }
    ]);
  };
  
  const handleRemoveExtracurricular = (index: number) => {
    const currentExtracurriculars = form.getValues('extracurriculars') || [];
    form.setValue('extracurriculars', currentExtracurriculars.filter((extracurricular: any, i: number) => i !== index));
  };
  
  // AP Scores
  const handleAddAPScore = () => {
    const currentAPScores = form.getValues('ap_scores') || [];
    form.setValue('ap_scores', [
      ...currentAPScores, 
      { id: uuidv4(), subject: '', score: 5 }
    ]);
  };
  
  const handleRemoveAPScore = (index: number) => {
    const currentAPScores = form.getValues('ap_scores') || [];
    form.setValue('ap_scores', currentAPScores.filter((apScore: any, i: number) => i !== index));
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-4">Achievements & Activities</h2>
      
      {/* Awards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Awards & Honors</h3>
          <Button
            type="button"
            onClick={handleAddAward}
            variant="default"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Award
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="awards"
          render={() => (
            <FormItem>
              <div className="space-y-4">
                {(form.getValues('awards') || []).map((award: any, index: number) => (
                  <Card key={award.id || index} className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Award #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="neutral"
                        onClick={() => handleRemoveAward(index)}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`awards.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Award Title</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., National Merit Scholar" 
                                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`awards.${index}.year`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Year</FormLabel>
                            <Select
                              value={field.value || ''}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name={`awards.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Briefly describe this award" 
                                className="min-h-20 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {(!form.getValues('awards') || form.getValues('awards').length === 0) && (
                  <p className="text-muted-foreground italic">No awards added yet. Click "Add Award" to get started.</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Extracurriculars Section */}
      <div className="space-y-4 pt-6 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Extracurricular Activities</h3>
          <Button
            type="button"
            onClick={handleAddExtracurricular}
            variant="default"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="extracurriculars"
          render={() => (
            <FormItem>
              <div className="space-y-4">
                {(form.getValues('extracurriculars') || []).map((activity: any, index: number) => (
                  <Card key={activity.id || index} className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Activity #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="neutral"
                        onClick={() => handleRemoveExtracurricular(index)}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`extracurriculars.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Activity Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Debate Team" 
                                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`extracurriculars.${index}.role`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Your Role</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Team Captain" 
                                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name={`extracurriculars.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Organization/Institution</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Harvard University" 
                                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name={`extracurriculars.${index}.years`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Years Involved</FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {years.map((year) => (
                                <div key={year} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`${activity.id}-${year}`}
                                    checked={(field.value || []).includes(year)}
                                    onChange={(e) => {
                                      const currentYears = field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([...currentYears, year]);
                                      } else {
                                        field.onChange(currentYears.filter((y: string) => y !== year));
                                      }
                                    }}
                                    className="border-2 border-black data-[state=checked]:bg-main"
                                  />
                                  <label
                                    htmlFor={`${activity.id}-${year}`}
                                    className="text-sm"
                                  >
                                    {year}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name={`extracurriculars.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Describe your involvement and achievements" 
                                className="min-h-20 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {(!form.getValues('extracurriculars') || form.getValues('extracurriculars').length === 0) && (
                  <p className="text-muted-foreground italic">No activities added yet. Click "Add Activity" to get started.</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* AP Scores Section */}
      <div className="space-y-4 pt-6 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AP Exam Scores</h3>
          <Button
            type="button"
            onClick={handleAddAPScore}
            variant="default"
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add AP Score
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="ap_scores"
          render={() => (
            <FormItem>
              <div className="space-y-4">
                {(form.getValues('ap_scores') || []).map((ap: any, index: number) => (
                  <Card key={ap.id || index} className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">AP Exam #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="neutral"
                        onClick={() => handleRemoveAPScore(index)}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`ap_scores.${index}.subject`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">AP Subject</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Calculus BC" 
                                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`ap_scores.${index}.score`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Score (1-5)</FormLabel>
                            <Select
                              value={field.value?.toString() || '5'}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm">
                                  <SelectValue placeholder="Select score" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <SelectItem key={score} value={score.toString()}>{score}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {(!form.getValues('ap_scores') || form.getValues('ap_scores').length === 0) && (
                  <p className="text-muted-foreground italic">No AP scores added yet. Click "Add AP Score" to get started.</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AchievementsSection;
