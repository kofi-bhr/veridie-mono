'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText, Lock } from 'lucide-react';

type Essay = {
  id: string;
  title: string;
  preview: string;
  content: string;
  is_locked: boolean;
};

type EssaysSectionProps = {
  essays: Essay[];
};

const EssaysSection = ({ essays }: EssaysSectionProps) => {
  const [expandedEssays, setExpandedEssays] = useState<Record<string, boolean>>({});

  const toggleEssay = (essayId: string) => {
    setExpandedEssays(prev => ({
      ...prev,
      [essayId]: !prev[essayId]
    }));
  };

  if (essays.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-bold mb-2">No Essays Available</h3>
        <p className="text-foreground/80">
          This consultant hasn&apos;t added any essays yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">College Essays</h2>
      
      <div className="space-y-4">
        {essays.map((essay) => (
          <motion.div
            key={essay.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="p-4">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleEssay(essay.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-main" />
                    </div>
                    <div>
                      <h3 className="font-bold">{essay.title}</h3>
                      {essay.is_locked && (
                        <div className="flex items-center gap-1 text-xs text-foreground/60">
                          <Lock className="h-3 w-3" />
                          <span>Premium Content</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {expandedEssays[essay.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
                
                {expandedEssays[essay.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Preview content available to all */}
                    {essay.preview && (
                      <div className="mb-4">
                        <p className="text-sm">{essay.preview}</p>
                      </div>
                    )}
                    
                    {/* Full content - blurred if locked */}
                    {essay.is_locked ? (
                      <div className="relative">
                        <div className="blur-sm select-none">
                          <p className="text-sm whitespace-pre-line">
                            {essay.content.substring(0, 50)}...
                            
                            Nice try! If you&apos;re interested in becoming a dev, email kofibhairralston@gmail.com or sebby@stanford.edu — we might have a job for you.
                            
                            {essay.content.substring(essay.content.length - 100)}
                          </p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col bg-black/5 rounded-lg">
                          <Lock className="h-6 w-6 mb-2" />
                          <p className="text-sm font-medium mb-2">Premium Content</p>
                          <Button size="sm">Unlock Essay</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-line">{essay.content}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EssaysSection;
