'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';

type Award = {
  id: string;
  title: string;
  description: string;
  year: string;
};

type AwardsSectionProps = {
  awards: Award[];
};

const AwardsSection = ({ awards }: AwardsSectionProps) => {
  const [expandedAwards, setExpandedAwards] = useState<Record<string, boolean>>({});

  const toggleAward = (awardId: string) => {
    setExpandedAwards(prev => ({
      ...prev,
      [awardId]: !prev[awardId]
    }));
  };

  if (awards.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-bold mb-2">No Awards Available</h3>
        <p className="text-foreground/80">
          This consultant hasn&apos;t added any awards or achievements yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Awards & Achievements</h2>
      
      <div className="space-y-4">
        {awards.map((award) => (
          <motion.div
            key={award.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleAward(award.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-main" />
                    </div>
                    <div>
                      <h3 className="font-bold">{award.title}</h3>
                      <p className="text-sm text-foreground/60">{award.year}</p>
                    </div>
                  </div>
                  <div>
                    {expandedAwards[award.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
                
                {expandedAwards[award.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm">{award.description}</p>
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

export default AwardsSection;
