'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import MentorCard from './MentorCard';
import FilterBar from './FilterBar';
import { createClient } from '@/lib/supabase/client';

// Types
type University = {
  id: string;
  name: string;
  logo_url: string;
  color_hex: string;
};

type Mentor = {
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
  is_verified: boolean;
};

const MentorsPage = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterCardCollapsed, setIsFilterCardCollapsed] = useState(false);
  const [allMajors, setAllMajors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch universities from Supabase
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('universities')
          .select('id, name, logo_url, color_hex');

        if (error) {
          console.error('Error fetching universities:', error.message);
          setError(`Error fetching universities: ${error.message}`);
          return;
        }

        if (data && data.length > 0) {
          setUniversities(data);
        } else {
          console.warn('No universities found in Supabase');
          setUniversities([]);
        }
      } catch (error: any) {
        console.error('Error in fetchUniversities:', error?.message || 'Unknown error');
        setError(`Error fetching universities: ${error?.message || 'Unknown error'}`);
        setUniversities([]);
      }
    };

    fetchUniversities();
  }, []);

  // Fetch mentors from Supabase
  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // First, check the structure of the consultants table to see what columns exist
        const { data: tableInfo, error: tableError } = await supabase
          .from('consultants')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error('Error checking consultants table:', tableError.message);
          setError(`Error accessing consultants table: ${tableError.message}`);
          setIsLoading(false);
          return;
        }
        
        // Determine if is_verified or verified column exists
        const sampleConsultant = tableInfo && tableInfo[0] ? tableInfo[0] : {};
        const hasIsVerified = 'is_verified' in sampleConsultant;
        const hasVerified = 'verified' in sampleConsultant;
        const verificationColumn = hasIsVerified ? 'is_verified' : hasVerified ? 'verified' : null;
        
        // Build the query dynamically based on available columns
        let query = `
          id, 
          slug,
          university,
          headline,
          image_url,
          major,
          accepted_schools,
          profiles:user_id (
            first_name,
            last_name
          ),
          awards (
            title
          )
        `;
        
        // Add verification column if it exists
        if (verificationColumn) {
          query = `${verificationColumn}, ${query}`;
        }
        
        // Execute the query with the appropriate columns
        const { data, error } = await supabase
          .from('consultants')
          .select(query);

        if (error) {
          console.error('Error fetching mentors:', error.message);
          setError(`Error fetching mentors: ${error.message}`);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Transform the data to match our Mentor type
          const transformedData = data.map((item: any) => {
            // Extract profile data - in Supabase, this might be an object or null
            const profile = item.profiles || {};
            
            // Handle verification status based on available columns
            let isVerified = false;
            if (hasIsVerified) {
              isVerified = !!item.is_verified;
            } else if (hasVerified) {
              isVerified = !!item.verified;
            }
            
            return {
              id: item.id || '',
              slug: item.slug || item.id || '',
              first_name: profile.first_name || 'Anonymous',
              last_name: profile.last_name || 'Mentor',
              university: item.university || '',
              headline: item.headline || '',
              image_url: item.image_url || '/placeholder.svg',
              top_award: item.awards && item.awards.length > 0 ? item.awards[0].title : null,
              major: Array.isArray(item.major) ? item.major : [],
              accepted_schools: Array.isArray(item.accepted_schools) ? item.accepted_schools : [],
              is_verified: isVerified,
            };
          });
          
          // Extract all unique majors from the mentors
          const uniqueMajors = Array.from(
            new Set(
              transformedData.flatMap(mentor => 
                Array.isArray(mentor.major) ? mentor.major : []
              )
            )
          ).sort();
          
          setAllMajors(uniqueMajors);
          setMentors(transformedData);
          setFilteredMentors(transformedData);
        } else {
          console.warn('No mentors found in Supabase');
          setMentors([]);
          setFilteredMentors([]);
          setAllMajors([]);
        }
      } catch (error: any) {
        console.error('Error in fetchMentors:', error?.message || 'Unknown error');
        setError(`Error fetching mentors: ${error?.message || 'Unknown error'}`);
        setMentors([]);
        setFilteredMentors([]);
        setAllMajors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Filter mentors based on selected universities and majors
  useEffect(() => {
    try {
      let result = [...mentors];

      // Apply university filter if any are selected
      if (selectedUniversities.length > 0) {
        result = result.filter((mentor) => {
          // Check if mentor's university or any accepted school matches selected universities
          return selectedUniversities.some(uniId => 
            Array.isArray(mentor.accepted_schools) && mentor.accepted_schools.includes(uniId)
          );
        });
      }

      // Apply major filter if any are selected
      if (selectedMajors.length > 0) {
        result = result.filter((mentor) => {
          // Check if any of the mentor's majors match the selected majors
          return Array.isArray(mentor.major) && mentor.major.some(major => selectedMajors.includes(major));
        });
      }

      setFilteredMentors(result);
    } catch (error: any) {
      console.error('Error filtering mentors:', error?.message || 'Unknown error');
      // If filtering fails, just show all mentors
      setFilteredMentors(mentors);
    }
  }, [selectedUniversities, selectedMajors, mentors]);

  const handleUniversityFilter = (universities: string[]) => {
    setSelectedUniversities(universities);
  };

  const handleMajorFilter = (majors: string[]) => {
    setSelectedMajors(majors);
  };

  const clearFilters = () => {
    setSelectedUniversities([]);
    setSelectedMajors([]);
  };

  const toggleFilterCard = () => {
    setIsFilterCardCollapsed(!isFilterCardCollapsed);
  };

  const hasActiveFilters = selectedUniversities.length > 0 || selectedMajors.length > 0;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Mentor</h1>
          <p className="text-foreground/80">
            Connect with elite college consultants who can guide you through the admissions process.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 border-2 border-red-500 bg-red-50 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-red-500 mt-1">Please try refreshing the page or contact support if the issue persists.</p>
          </div>
        )}

        {/* Desktop Filters - Full Width Card */}
        <div className="hidden md:block mb-8">
          <div className="bg-background border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden">
            {/* Filter Header with Toggle */}
            <div 
              className="p-4 flex justify-between items-center cursor-pointer border-b-2 border-black"
              onClick={toggleFilterCard}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Filters</h3>
                {hasActiveFilters && (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-main text-xs text-white">
                    {selectedUniversities.length + selectedMajors.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {hasActiveFilters && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
                {isFilterCardCollapsed ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </div>
            </div>

            {/* Filter Content */}
            {!isFilterCardCollapsed && (
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Filter Options */}
                  {universities.length > 0 && (
                    <FilterBar
                      variant="pill"
                      onUniversityChange={handleUniversityFilter}
                      onMajorChange={handleMajorFilter}
                      selectedUniversities={selectedUniversities}
                      selectedMajors={selectedMajors}
                      universities={universities}
                      majors={allMajors}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter - Mobile */}
        <div className="flex flex-col gap-4 mb-6 md:hidden">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="reverse" className="w-full gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-main text-xs text-white">
                    {selectedUniversities.length + selectedMajors.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] border-t-2 border-black rounded-t-2xl">
              <SheetTitle className="sr-only">Filter Options</SheetTitle>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                <Button
                  variant="neutral"
                  size="icon"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {universities.length > 0 && (
                <FilterBar
                  variant="grid"
                  onUniversityChange={handleUniversityFilter}
                  onMajorChange={handleMajorFilter}
                  selectedUniversities={selectedUniversities}
                  selectedMajors={selectedMajors}
                  universities={universities}
                  majors={allMajors}
                  isMobile={true}
                />
              )}
              <div className="flex gap-4 mt-6">
                {hasActiveFilters && (
                  <Button
                    variant="reverse"
                    className="flex-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse bg-gray-200 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            ))
          ) : filteredMentors.length > 0 ? (
            // Mentor cards
            filteredMentors.map((mentor) => (
              <MentorCard 
                key={mentor.id} 
                mentor={mentor} 
                universities={universities}
              />
            ))
          ) : (
            // No results message
            <div className="col-span-full text-center py-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">No mentors found</h3>
              <p className="text-foreground/80 mb-6">
                Try adjusting your filters or check back later for more mentors.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorsPage;
