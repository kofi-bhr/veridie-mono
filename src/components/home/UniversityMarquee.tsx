'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface University {
  id: string;
  name: string;
  logo_url: string;
  color_hex: string;
}

const UniversityMarquee = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setUniversities(data);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Duplicate the universities array to create a seamless loop
  const duplicatedUniversities = [...universities, ...universities];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden relative py-6">
      {/* Gradient overlay for fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10"></div>
      
      <div className="flex animate-marquee">
        {duplicatedUniversities.map((university, index) => (
          <div 
            key={`${university.id}-${index}`} 
            className="flex flex-col items-center mx-6"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 relative">
              {university.logo_url && (
                <Image
                  src={university.logo_url}
                  alt={university.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniversityMarquee;
