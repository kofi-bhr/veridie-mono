'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

type Extracurricular = {
  id: string;
  title: string;
  description: string;
  role: string;
  years: string[];
};

type ExtracurricularsSectionProps = {
  extracurriculars: Extracurricular[];
};

const ExtracurricularsSection = ({ extracurriculars }: ExtracurricularsSectionProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (extracurriculars.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-bold mb-2">No Extracurriculars Available</h3>
        <p className="text-foreground/80">
          This consultant hasn't added any extracurricular activities yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Extracurricular Activities</h2>
      
      <div className="space-y-4">
        {extracurriculars.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-main" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-foreground/60">
                        <span>{item.role}</span>
                        {item.years && item.years.length > 0 && (
                          <span>• {Array.isArray(item.years) ? item.years.join(', ') : item.years}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {expandedItems[item.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
                
                {expandedItems[item.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm">{item.description}</p>
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

export default ExtracurricularsSection;
