'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
        setIsLoading(true);
        
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
          // After universities are loaded, fetch mentors
          fetchMentors();
        } else {
          setUniversities([]);
          setError('No universities found. Please try again later.');
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Exception in fetchUniversities:', error?.message || 'Unknown error');
        setError(`Error fetching universities: ${error?.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    const fetchMentors = async () => {
      try {
        // Simple query to get consultants with their profiles
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
            accepted_university_ids,
            profiles!user_id(
              id,
              first_name,
              last_name,
              is_verified
            )
          `);
        
        if (error) {
          console.error('Error fetching consultants:', error.message);
          setError(`Error fetching mentors: ${error.message}`);
          setIsLoading(false);
          return;
        }
        
        if (!data || data.length === 0) {
          setMentors([]);
          setFilteredMentors([]);
          setIsLoading(false);
          return;
        }
        
        // Process the consultants data
        const processedMentors: Mentor[] = [];
        const uniqueMajors: string[] = [];
        
        for (const consultant of data) {
          try {
            // Get profile data
            const profile = Array.isArray(consultant.profiles) 
              ? consultant.profiles[0] 
              : consultant.profiles;
            
            // Get university name
            const universityName = consultant.university || 'Unknown University';
            
            // Process majors
            let majors: string[] = [];
            if (consultant.major) {
              if (typeof consultant.major === 'string') {
                try {
                  majors = JSON.parse(consultant.major);
                } catch {
                  majors = [consultant.major];
                }
              } else if (Array.isArray(consultant.major)) {
                majors = consultant.major;
              }
              
              // Add unique majors to the filter list
              majors.forEach(major => {
                if (!uniqueMajors.includes(major)) {
                  uniqueMajors.push(major);
                }
              });
            }
            
            // Process accepted schools
            let acceptedSchools: string[] = [];
            if (consultant.accepted_university_ids) {
              if (typeof consultant.accepted_university_ids === 'string') {
                try {
                  acceptedSchools = JSON.parse(consultant.accepted_university_ids);
                } catch {
                  acceptedSchools = [consultant.accepted_university_ids];
                }
              } else if (Array.isArray(consultant.accepted_university_ids)) {
                acceptedSchools = consultant.accepted_university_ids;
              }
            }
            
            // Create mentor object
            const mentorItem: Mentor = {
              id: consultant.id,
              slug: consultant.slug || `mentor-${consultant.id.substring(0, 8)}`,
              first_name: profile?.first_name || 'Anonymous',
              last_name: profile?.last_name || 'Mentor',
              university: universityName,
              headline: consultant.headline || 'College Mentor',
              image_url: consultant.image_url || '/placeholder-profile.png',
              top_award: null,
              major: majors,
              accepted_schools: acceptedSchools,
              is_verified: profile?.is_verified || false
            };
            
            processedMentors.push(mentorItem);
          } catch (error) {
            console.error('Error processing consultant:', error);
          }
        }
        
        setAllMajors(uniqueMajors);
        setMentors(processedMentors);
        setFilteredMentors(processedMentors);
      } catch (error: any) {
        console.error('Exception in fetchMentors:', error?.message || 'Unknown error');
        setError(`Error processing mentor data: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniversities();
  }, [retryCount]);

  // Apply filters when filter selections change
  useEffect(() => {
    if (mentors.length === 0) return;

    let filtered = [...mentors];

    // Filter by university
    if (selectedUniversities.length > 0) {
      filtered = filtered.filter(mentor => 
        selectedUniversities.includes(mentor.university)
      );
    }

    // Filter by major
    if (selectedMajors.length > 0) {
      filtered = filtered.filter(mentor => 
        mentor.major.some(major => selectedMajors.includes(major))
      );
    }

    setFilteredMentors(filtered);
  }, [mentors, selectedUniversities, selectedMajors]);

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
    setRetryCount(prev => prev + 1);
  };

  // Compute if there are any active filters
  const hasActiveFilters = selectedUniversities.length > 0 || selectedMajors.length > 0;

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find Your Mentor</h1>
        <p className="text-foreground/80 mb-8 max-w-2xl">
          Connect with elite college consultants who are current students at top universities.
          Get personalized guidance on applications, essays, and more.
        </p>

        {/* Filter Section - Desktop */}
        <div className="hidden md:block mb-8">
          {universities.length > 0 && (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filter Mentors</h2>
                <Button 
                  variant="neutral" 
                  size="icon"
                  onClick={toggleFilterCard}
                  aria-label={isFilterCardCollapsed ? "Expand filters" : "Collapse filters"}
                >
                  {isFilterCardCollapsed ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {!isFilterCardCollapsed && (
                <>
                  <FilterBar
                    variant="pill"
                    onUniversityChange={handleUniversityFilter}
                    onMajorChange={handleMajorFilter}
                    selectedUniversities={selectedUniversities}
                    selectedMajors={selectedMajors}
                    universities={universities}
                    majors={allMajors}
                  />
                  
                  {hasActiveFilters && (
                    <div className="mt-4">
                      <Button 
                        variant="reverse" 
                        onClick={clearFilters}
                        className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Filter Button - Mobile */}
        <div className="md:hidden mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="reverse" 
                className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filter Mentors
                {hasActiveFilters && (
                  <span className="ml-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {selectedUniversities.length + selectedMajors.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <SheetTitle className="text-xl font-bold">Filter Mentors</SheetTitle>
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
