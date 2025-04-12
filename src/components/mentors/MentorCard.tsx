'use client';

import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type University = {
  id: string;
  name: string;
  logo_url: string;
  color_hex: string;
};

type MentorProps = {
  mentor: {
    id: string;
    slug: string;
    first_name: string;
    last_name: string;
    university: string;
    headline: string;
    image_url: string;
    top_award: string | null;
    major: string[];
    accepted_schools: string[];
    is_verified?: boolean;
    verified?: boolean;
  };
  universities: University[];
};

const MentorCard = ({ mentor, universities }: MentorProps) => {
  const {
    id,
    slug,
    first_name,
    last_name,
    university,
    headline,
    image_url,
    top_award,
    major = [],
    accepted_schools = [],
    is_verified,
    verified
  } = mentor;

  // Use either is_verified or verified property, whichever is available
  const isVerified = is_verified !== undefined ? is_verified : verified !== undefined ? verified : false;

  const majorScrollRef = useRef<HTMLDivElement>(null);
  const schoolsScrollRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = `/mentors/${slug}`;
    }
  };

  // Remove any remaining auto-scroll logic for majors
  useEffect(() => {
    // Ensure manual scroll only
  }, [major]);

  // Infinite scrolling effect for schools
  useEffect(() => {
    if (schoolsScrollRef.current && accepted_schools && accepted_schools.length > 1) {
      const scrollContainer = schoolsScrollRef.current;
      let scrollAmount = 0;
      const distance = 0.8; // slightly slower than majors
      
      const scroll = () => {
        if (scrollContainer) {
          scrollContainer.scrollLeft = scrollAmount;
          scrollAmount += distance;
          
          // Reset scroll position when reaching the end
          if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollAmount = 0;
          }
        }
      };
      
      const interval = setInterval(scroll, 50);
      return () => clearInterval(interval);
    }
  }, [accepted_schools]);

  // Find accepted schools
  const acceptedSchools = universities.filter(uni => 
    Array.isArray(accepted_schools) && accepted_schools.includes(uni.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        className="h-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none"
        tabIndex={0}
        aria-label={`View profile of ${first_name} ${last_name}, ${headline}`}
        onClick={() => {}}
        onKeyDown={handleKeyDown}
      >
        <div className="pt-0 px-4 pb-0 flex flex-col h-full">
          <div className="flex flex-row gap-4">
            {/* Mentor Image with Verification Badge */}
            <div className="relative w-24 h-24 shrink-0 overflow-hidden border-2 border-black">
              {isVerified && (
                <div className="absolute top-0 right-0 z-10">
                  <Image 
                    src="/images/verified-check.png" 
                    alt="Verified" 
                    width={24} 
                    height={24}
                  />
                </div>
              )}
              <Image
                src={image_url && image_url.startsWith('http') ? image_url : '/placeholder.svg'}
                alt={`${first_name} ${last_name}`}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>

            {/* Mentor Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold">{first_name} {last_name}</h3>
              <p className="text-foreground/80 text-sm">{headline}</p>
              
              {/* Top Award */}
              {top_award && (
                <div className="mt-1 bg-[#ff8188] inline-block px-2 py-1 text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold">
                  {top_award}
                </div>
              )}
            </div>
          </div>

          {/* Majors - Scrolling List */}
          {major && major.length > 0 && (
            <div className="mt-3 mb-2">
              <span className="text-xs text-foreground/60 block mb-1">Interest{major.length > 1 ? "s" : ""}:</span>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide relative">
                {major.length === 1 ? (
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs whitespace-nowrap">
                    {major[0]}
                  </div>
                ) : (
                  major.map((item, index) => (
                    <div 
                      key={`${item}-${index}`} 
                      className="bg-white px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold whitespace-nowrap flex-shrink-0"
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Accepted Schools */}
          {acceptedSchools.length > 0 && (
            <div className="mt-2 mb-3">
              <span className="text-xs text-foreground/60 block mb-1">Accepted at:</span>
              <div className="flex gap-3 relative">
                {acceptedSchools.length === 1 ? (
                  <div 
                    key={acceptedSchools[0].id} 
                    className="h-8 flex-shrink-0"
                    title={acceptedSchools[0].name}
                  >
                    <Image
                      src={acceptedSchools[0].logo_url}
                      alt={acceptedSchools[0].name}
                      width={32}
                      height={32}
                      className="object-contain h-full"
                    />
                  </div>
                ) : (
                  acceptedSchools.map((school, index) => (
                    <div 
                      key={`${school.id}-${index}`} 
                      className="h-8 flex-shrink-0"
                      title={school.name}
                    >
                      <Image
                        src={school.logo_url}
                        alt={school.name}
                        width={32}
                        height={32}
                        className="object-contain h-full"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto">
            <Button asChild className="w-full rounded-none">
              <Link href={`/mentors/${slug}`} className="font-bold">View Profile</Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MentorCard;
