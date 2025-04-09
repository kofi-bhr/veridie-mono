'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

type University = {
  id: string;
  name: string;
  logo_url: string;
  color_hex: string;
};

type Consultant = {
  id: string;
  slug: string;
  university: string;
  headline: string;
  image_url: string;
  bio: string;
  major: string[];
  sat_score?: number;
  act_score?: number;
  gpa?: number;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

type ProfileHeaderProps = {
  consultant: Consultant;
  acceptedSchools: University[];
  isVerified: boolean;
};

const ProfileHeader = ({ consultant, acceptedSchools, isVerified }: ProfileHeaderProps) => {
  const { profiles, headline, image_url, bio, major, sat_score, act_score, gpa } = consultant;
  const fullName = `${profiles?.first_name || ''} ${profiles?.last_name || ''}`.trim();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-6">
          {/* Profile Image with Verification Badge */}
          <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-black">
            {isVerified && (
              <div className="absolute top-0 right-0 z-10">
                <Image 
                  src="/images/verified-check.png" 
                  alt="Verified" 
                  width={28} 
                  height={28}
                />
              </div>
            )}
            <Image
              src={image_url && image_url.startsWith('http') ? image_url : '/placeholder.svg'}
              alt={fullName}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Name and Headline */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="text-foreground/80">{headline}</p>
          </div>
          
          {/* Universities */}
          {acceptedSchools.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium mb-2 text-foreground/60">Accepted to:</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {acceptedSchools.map((school) => (
                  <div 
                    key={school.id}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-full border-2 border-black"
                    style={{
                      backgroundColor: school.color_hex || 'white',
                      color: getContrastColor(school.color_hex || '#ffffff')
                    }}
                  >
                    <div className="w-5 h-5 relative flex-shrink-0 bg-white rounded-full">
                      <Image
                        src={school.logo_url}
                        alt={school.name}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <span className="text-xs font-medium">{school.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {sat_score && (
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xl font-bold">{sat_score}</div>
                <div className="text-xs text-foreground/60">SAT Score</div>
              </div>
            )}
            {act_score && (
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xl font-bold">{act_score}</div>
                <div className="text-xs text-foreground/60">ACT Score</div>
              </div>
            )}
            {gpa && (
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xl font-bold">{gpa.toFixed(1)}</div>
                <div className="text-xs text-foreground/60">GPA</div>
              </div>
            )}
          </div>
          
          {/* Bio */}
          {bio && (
            <div className="mb-4">
              <h2 className="text-sm font-medium mb-2 text-foreground/60">About me:</h2>
              <p className="text-sm">{bio}</p>
            </div>
          )}
          
          {/* Majors */}
          {major && major.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-2 text-foreground/60">Major{major.length > 1 ? 's' : ''}:</h2>
              <div className="flex flex-wrap gap-2">
                {major.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded text-xs"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Remove the hash if it exists
  hexColor = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? 'black' : 'white';
}

export default ProfileHeader;
