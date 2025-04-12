'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Filter, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import MentorCard from './MentorCard';
import FilterBar from './FilterBar';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

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

// Define the structure of the consultant data from Supabase
type ConsultantData = {
  id: string;
  slug: string | null;
  user_id: string;
  university: string | null;
  headline: string | null;
  image_url: string | null;
  major: string[] | string | null;
  accepted_schools: string[] | string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | {
    first_name: string | null;
    last_name: string | null;
  }[] | null;
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
  const [retryCount, setRetryCount] = useState(0);

  // Fetch universities from Supabase
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        console.log('Fetching universities...');
        const { data, error } = await supabase
          .from('universities')
          .select('id, name, logo_url, color_hex');

        if (error) {
          console.error('Error fetching universities:', error.message);
          setError(`Error fetching universities: ${error.message}`);
          return;
        }

        if (data && data.length > 0) {
          console.log(`Fetched ${data.length} universities`);
          setUniversities(data);
        } else {
          console.warn('No universities found in Supabase');
          setUniversities([]);
        }
      } catch (error: any) {
        console.error('Exception in fetchUniversities:', error?.message || 'Unknown error');
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
        console.log('Fetching consultants...');
        // Fetch all consultants with their profiles
        const { data, error } = await supabase
          .from('consultants')
          .select(`
            id, 
            slug,
            user_id,
            university,
            headline,
            image_url,
            major,
            accepted_schools,
            profiles(
              first_name,
              last_name
            )
          `);
        
        if (error) {
          console.error('Error fetching consultants:', error.message);
          setError(`Error fetching mentors: ${error.message}`);
          setIsLoading(false);
          return;
        }
        
        if (!data || data.length === 0) {
          console.warn('No consultants found');
          setMentors([]);
          setFilteredMentors([]);
          setIsLoading(false);
          return;
        }
        
        console.log(`Fetched ${data.length} consultants`);
        
        // Transform the data to match the Mentor type
        const transformedData: Mentor[] = data
          .filter((consultant: ConsultantData) => {
            // Filter out consultants without required data
            return (
              consultant.slug && 
              consultant.profiles && 
              (Array.isArray(consultant.profiles) 
                ? consultant.profiles.length > 0 
                : true)
            );
          })
          .map((consultant: ConsultantData) => {
            // Extract profile data
            const profile = Array.isArray(consultant.profiles)
              ? consultant.profiles[0]
              : consultant.profiles;
            
            // Handle arrays or strings for major and accepted_schools
            const majorArray = Array.isArray(consultant.major)
              ? consultant.major
              : consultant.major
              ? [consultant.major as string]
              : ['Undecided'];
            
            const acceptedSchools = Array.isArray(consultant.accepted_schools)
              ? consultant.accepted_schools
              : consultant.accepted_schools
              ? [consultant.accepted_schools as string]
              : [];
            
            // Extract first award if available
            const awards: any[] = []; // We would fetch awards here in a more complete implementation
            const topAward = awards && awards.length > 0 ? awards[0].title : null;
            
            return {
              id: consultant.id,
              slug: consultant.slug || '',
              first_name: profile?.first_name || 'Anonymous',
              last_name: profile?.last_name || 'Mentor',
              university: consultant.university || 'Not specified',
              headline: consultant.headline || 'Mentor Profile',
              image_url: consultant.image_url || 'https://via.placeholder.com/300',
              top_award: topAward,
              major: majorArray,
              accepted_schools: acceptedSchools,
              is_verified: true // Default to true for now
            };
          });
        
        console.log(`Transformed ${transformedData.length} consultants`);
        
        // Extract all unique majors for filtering
        const allMajorsSet = new Set<string>();
        transformedData.forEach((mentor) => {
          mentor.major.forEach((major) => {
            allMajorsSet.add(major);
          });
        });
        
        setAllMajors(Array.from(allMajorsSet));
        setMentors(transformedData);
        setFilteredMentors(transformedData);
      } catch (error: any) {
        console.error('Exception in fetchMentors:', error?.message || 'Unknown error');
        setError(`Error loading mentors: ${error?.message || 'Unknown error'}`);
        
        // If we have a retry count left, try again
        if (retryCount < 2) {
          console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, [retryCount]);

  // Filter mentors based on selected filters
  useEffect(() => {
    if (mentors.length === 0) return;

    try {
      const filtered = mentors.filter((mentor) => {
        // Filter by university
        const universityMatch =
          selectedUniversities.length === 0 ||
          selectedUniversities.includes(mentor.university);

        // Filter by major
        const majorMatch =
          selectedMajors.length === 0 ||
          mentor.major.some((major) => selectedMajors.includes(major));

        return universityMatch && majorMatch;
      });

      setFilteredMentors(filtered);
    } catch (error) {
      console.error('Error filtering mentors:', error);
      // Fallback to showing all mentors if filtering fails
      setFilteredMentors(mentors);
    }
  }, [mentors, selectedUniversities, selectedMajors]);

  // Compute whether any filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedUniversities.length > 0 || selectedMajors.length > 0;
  }, [selectedUniversities, selectedMajors]);

  // Handle university filter change
  const handleUniversityFilter = (universities: string[]) => {
    setSelectedUniversities(universities);
  };

  // Handle major filter change
  const handleMajorFilter = (majors: string[]) => {
    setSelectedMajors(majors);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedUniversities([]);
    setSelectedMajors([]);
  };

  // Toggle filter card collapse state
  const toggleFilterCard = () => {
    setIsFilterCardCollapsed(!isFilterCardCollapsed);
  };

  // Handle retry when there's an error
  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Find Your Mentor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with mentors who have successfully navigated the college admissions process at top universities.
          </p>
        </div>

        {/* Desktop Filter */}
        <div className="hidden md:block mb-8">
          <motion.div
            initial={false}
            animate={isFilterCardCollapsed ? { height: 'auto' } : { height: 'auto' }}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h3 className="font-semibold">Filter Mentors</h3>
              </div>
              <Button
                variant="neutral"
                size="sm"
                onClick={toggleFilterCard}
                className="p-1 h-auto"
              >
                {isFilterCardCollapsed ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </Button>
            </div>

            {!isFilterCardCollapsed && (
              <div className="p-4">
                {universities.length > 0 ? (
                  <FilterBar
                    variant="pill"
                    onUniversityChange={handleUniversityFilter}
                    onMajorChange={handleMajorFilter}
                    selectedUniversities={selectedUniversities}
                    selectedMajors={selectedMajors}
                    universities={universities}
                    majors={allMajors}
                    isMobile={false}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading filters...</p>
                  </div>
                )}

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="neutral"
                      onClick={clearFilters}
                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="reverse" className="w-full gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Filter className="h-5 w-5" />
                <span>Filter</span>
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
                <div className="p-4">
                  <FilterBar
                    variant="pill"
                    onUniversityChange={handleUniversityFilter}
                    onMajorChange={handleMajorFilter}
                    selectedUniversities={selectedUniversities}
                    selectedMajors={selectedMajors}
                    universities={universities}
                    majors={allMajors}
                    isMobile={true}
                  />
                </div>
              )}
              <div className="flex gap-4 mt-6 p-4">
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
                  variant="default"
                  className="flex-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[300px] animate-pulse bg-gray-200 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 bg-white">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Error Loading Mentors</h3>
                <p className="text-foreground/80 mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <Button 
                  onClick={handleRetry}
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Try Again
                </Button>
              </div>
            </div>
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
            <div className="col-span-full text-center py-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 bg-white">
              <h3 className="text-xl font-bold mb-2">No mentors found</h3>
              <p className="text-foreground/80 mb-6">
                {mentors.length > 0 
                  ? "No mentors match your current filters. Try adjusting your search criteria."
                  : "No mentors are available at this time. Please check back later."}
              </p>
              {hasActiveFilters && (
                <Button 
                  onClick={clearFilters}
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorsPage;
