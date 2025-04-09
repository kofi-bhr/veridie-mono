'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

type APScore = {
  id: string;
  subject: string;
  score: number;
};

type APScoresSectionProps = {
  apScores: APScore[];
};

const APScoresSection = ({ apScores }: APScoresSectionProps) => {
  if (apScores.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-bold mb-2">No AP Scores Available</h3>
        <p className="text-foreground/80">
          This consultant hasn't added any AP scores yet.
        </p>
      </div>
    );
  }

  // Sort scores by subject name
  const sortedScores = [...apScores].sort((a, b) => 
    a.subject.localeCompare(b.subject)
  );

  // Get score color based on AP score (1-5)
  const getScoreColor = (score: number) => {
    switch (score) {
      case 5: return 'bg-green-100 text-green-800';
      case 4: return 'bg-green-100 text-green-700';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 1: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">AP Exam Scores</h2>
      
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedScores.map((score) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-main" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{score.subject}</h3>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getScoreColor(score.score)}`}>
                  {score.score}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default APScoresSection;
