// Type declarations for mentor components

declare module './MentorCard' {
  import { FC } from 'react';
  
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
  
  type MentorCardProps = {
    mentor: Mentor;
    universities: University[];
  };
  
  const MentorCard: FC<MentorCardProps>;
  export default MentorCard;
}

declare module './FilterBar' {
  import { FC } from 'react';
  
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
  
  const FilterBar: FC<FilterBarProps>;
  export default FilterBar;
}
