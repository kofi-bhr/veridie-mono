'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type University = {
  id: string;
  name: string;
  logo_url: string;
  color_hex: string;
};

type FilterBarProps = {
  variant: 'grid' | 'pill';
  onUniversityChange: (universities: string[]) => void;
  onMajorChange: (majors: string[]) => void;
  selectedUniversities: string[];
  selectedMajors: string[];
  universities: University[];
  majors: string[];
  isMobile?: boolean;
};

// Helper function to determine if text should be white or black based on background color
const getTextColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? 'text-black' : 'text-white';
};

const FilterBar = ({
  variant,
  onUniversityChange,
  onMajorChange,
  selectedUniversities,
  selectedMajors,
  universities,
  majors,
  isMobile = false
}: FilterBarProps) => {
  const [activeTab, setActiveTab] = useState<'universities' | 'majors'>(isMobile ? 'universities' : 'universities');

  const handleUniversityToggle = (universityId: string) => {
    if (selectedUniversities.includes(universityId)) {
      onUniversityChange(selectedUniversities.filter(id => id !== universityId));
    } else {
      onUniversityChange([...selectedUniversities, universityId]);
    }
  };

  const handleMajorToggle = (major: string) => {
    if (selectedMajors.includes(major)) {
      onMajorChange(selectedMajors.filter(m => m !== major));
    } else {
      onMajorChange([...selectedMajors, major]);
    }
  };

  if (variant === 'grid') {
    return (
      <div className="flex flex-col h-full">
        {/* Tabs for mobile */}
        <div className="flex border-b border-black mb-4">
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'universities' ? 'border-b-2 border-black' : 'text-foreground/60'
            }`}
            onClick={() => setActiveTab('universities')}
          >
            Universities
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'majors' ? 'border-b-2 border-black' : 'text-foreground/60'
            }`}
            onClick={() => setActiveTab('majors')}
          >
            Majors
          </button>
        </div>

        {/* Universities Grid */}
        {activeTab === 'universities' && (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
            {universities.map((university) => (
              <button
                key={university.id}
                onClick={() => handleUniversityToggle(university.id)}
                className={`flex items-center p-3 rounded-lg border-2 border-black transition-colors ${
                  selectedUniversities.includes(university.id)
                    ? `${getTextColor(university.color_hex)}`
                    : 'bg-white'
                }`}
                style={{
                  backgroundColor: selectedUniversities.includes(university.id)
                    ? university.color_hex
                    : ''
                }}
              >
                <div className="w-8 h-8 mr-2 relative flex-shrink-0">
                  <Image
                    src={university.logo_url}
                    alt={university.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium truncate">{university.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Majors Grid */}
        {activeTab === 'majors' && (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
            {majors.map((major) => (
              <button
                key={major}
                onClick={() => handleMajorToggle(major)}
                className={`p-3 rounded-lg border-2 border-black transition-colors ${
                  selectedMajors.includes(major)
                    ? 'bg-main text-white'
                    : 'bg-white'
                }`}
              >
                <span className="text-sm font-medium truncate">{major}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pill variant (desktop)
  return (
    <div className="space-y-6">
      {/* Universities Section */}
      <div>
        <h4 className="text-sm font-medium mb-3">Universities</h4>
        <div className="flex flex-wrap gap-2">
          {universities.map((university) => (
            <motion.button
              key={university.id}
              onClick={() => handleUniversityToggle(university.id)}
              className={`flex items-center px-3 py-2 rounded-full border-2 border-black transition-colors ${
                selectedUniversities.includes(university.id)
                  ? `${getTextColor(university.color_hex)}`
                  : 'bg-white'
              }`}
              style={{
                backgroundColor: selectedUniversities.includes(university.id)
                  ? university.color_hex
                  : ''
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                <Image
                  src={university.logo_url}
                  alt={university.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium">{university.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Majors Section */}
      <div>
        <h4 className="text-sm font-medium mb-3">Majors</h4>
        <div className="flex flex-wrap gap-2">
          {majors.map((major) => (
            <motion.button
              key={major}
              onClick={() => handleMajorToggle(major)}
              className={`px-3 py-2 rounded-full border-2 border-black transition-colors ${
                selectedMajors.includes(major)
                  ? 'bg-main text-white'
                  : 'bg-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm font-medium">{major}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
