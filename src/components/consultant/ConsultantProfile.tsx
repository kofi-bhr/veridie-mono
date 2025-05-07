'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Trophy, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';

type University = {
  id: string;
  name: string;
  logo_url: string;
  color_hex: string;
};

type Award = {
  id: string;
  title: string;
  description: string;
  year: string;
};

type Essay = {
  id: string;
  title: string;
  preview: string;
  content: string;
  is_locked: boolean;
};

interface Extracurricular {
  id: string;
  title: string;
  description?: string;
  role?: string;
  institution?: string;
  years?: string[];
}

type APScore = {
  id: string;
  subject: string;
  score: number;
};

type Package = {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
};

interface Consultant {
  id: string;
  slug: string;
  university: string;
  headline: string;
  image_url: string;
  bio?: string;
  major: string[];
  accepted_schools: string[];
  is_verified: boolean;
  sat_score?: number;
  act_score?: number;
  gpa?: number;
  is_weighted?: boolean;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
  awards: Award[];
  essays: Essay[];
  extracurriculars: Extracurricular[];
  ap_scores: APScore[];
  packages: Package[];
};

type ConsultantProfileProps = {
  consultant: Consultant;
  universities: University[];
};

export default function ConsultantProfile({ consultant, universities }: ConsultantProfileProps) {
  const packagesScrollRef = useRef<HTMLDivElement>(null);
  
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    extracurriculars: true,
    awards: true,
    essays: true,
    apScores: false
  });
  
  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Determine if the consultant is verified
  const isVerified = Boolean(consultant.is_verified);

  // Find universities that the consultant was accepted to
  const acceptedSchools = universities.filter(uni => 
    Array.isArray(consultant.accepted_schools) && 
    consultant.accepted_schools.includes(uni.id)
  );

  // Get full name
  const fullName = `${consultant.profiles?.first_name || ''} ${consultant.profiles?.last_name || ''}`.trim();
  
  // Scroll packages horizontally
  const scrollPackages = (direction: 'left' | 'right') => {
    if (!packagesScrollRef.current) return;
    
    const scrollAmount = 300; // Adjust as needed
    const currentScroll = packagesScrollRef.current.scrollLeft;
    
    packagesScrollRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Header */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[80vh] overflow-y-auto scrollbar-hide rounded-none">
                <div className="p-6">
                  {/* Profile Image with Verification Badge */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
                      <Image
                        src={consultant.image_url && consultant.image_url.startsWith('http') ? consultant.image_url : '/placeholder.svg'}
                        alt={fullName}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    {isVerified && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full border-2 border-black p-0.5">
                        <Image 
                          src="/images/verified-check.png" 
                          alt="Verified" 
                          width={24} 
                          height={24}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Name and Headline */}
                  <div className="text-center mb-3">
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <p className="text-foreground/80">{consultant.headline}</p>
                  </div>
                  
                  {/* Accepted Schools - Moved up */}
                  {acceptedSchools.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-medium mb-2 text-center text-foreground/60">Accepted at</h2>
                      <div className="flex flex-wrap justify-center gap-3">
                        {acceptedSchools.map((school) => (
                          <div 
                            key={school.id}
                            className="flex flex-col items-center"
                            title={school.name}
                          >
                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full border border-gray-200 p-1">
                              <Image
                                src={school.logo_url}
                                alt={school.name}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            </div>
                            <span className="text-xs mt-1 text-center">{school.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Interests - More Centered with less padding */}
                  {consultant.major && consultant.major.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-medium mb-2 text-center text-foreground/60">Interests</h2>
                      <div className="flex flex-wrap justify-center gap-2">
                        {consultant.major.map((item, index) => (
                          <div 
                            key={index}
                            className="bg-main/10 px-3 py-1 text-sm font-medium border-2 border-black"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Top Award */}
                  {consultant.awards && consultant.awards.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-medium mb-2 text-center text-foreground/60">Top Award</h2>
                      <div className="flex justify-center">
                        <div className="bg-[#ff8188] px-3 py-1 text-sm font-bold border-2 border-black">
                          {consultant.awards[0].title}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Stats - Simplified */}
                  <div className="space-y-4 mb-5">
                    {/* Test Scores */}
                    {(() => {
                      const hasSAT = consultant.sat_score && consultant.sat_score >= 1400;
                      const hasACT = consultant.act_score && consultant.act_score >= 30;
                      
                      if (!hasSAT && !hasACT) {
                        return null;
                      }
                      
                      return (
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-foreground/60 mb-2">Test Scores</h3>
                          <div className="flex justify-center gap-4">
                            {hasSAT && (
                              <div className="text-center">
                                <div className="text-lg font-bold">{consultant.sat_score}</div>
                                <div className="text-xs text-foreground/60">SAT</div>
                              </div>
                            )}
                            {hasACT && (
                              <div className="text-center">
                                <div className="text-lg font-bold">{consultant.act_score}</div>
                                <div className="text-xs text-foreground/60">ACT</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* GPA */}
                    {consultant.gpa && (
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-foreground/60 mb-2">GPA</h3>
                        <div className="text-lg font-bold">{consultant.gpa.toFixed(1)}{consultant.is_weighted && ' (Weighted)'}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* AP Scores - Collapsible */}
                  {consultant.ap_scores && consultant.ap_scores.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-foreground/60">AP Scores</h3>
                        <button 
                          onClick={() => toggleSection('apScores')}
                          className="text-foreground/60 hover:text-foreground"
                        >
                          {expandedSections.apScores ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {expandedSections.apScores && (
                        <div className="grid grid-cols-2 gap-2">
                          {consultant.ap_scores.map((score) => (
                            <div 
                              key={score.id}
                              className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                            >
                              <span className="text-sm truncate mr-2">{score.subject}</span>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${getScoreColor(score.score)}`}>
                                {score.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Bio */}
                  {consultant.bio && (
                    <div className="mb-5">
                      <h2 className="text-sm font-medium mb-2 text-center text-foreground/60">About</h2>
                      <p className="text-sm">{consultant.bio}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
          
          {/* Main Content - All sections visible at once */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Packages Section with Horizontal Scroll on Mobile */}
              <section className="mb-12 pt-4 md:pt-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold md:hidden">Services & Packages</h2>
                  <div className="flex gap-2">
                    <div className="md:hidden flex gap-2">
                      <Button 
                        variant="reverse" 
                        size="icon" 
                        onClick={() => scrollPackages('left')}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="reverse" 
                        size="icon" 
                        onClick={() => scrollPackages('right')}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {consultant.packages && consultant.packages.length > 0 ? (
                  <div 
                    ref={packagesScrollRef}
                    className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-4 scrollbar-hide"
                  >
                    {consultant.packages.map((pkg) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-[280px] md:w-auto flex-shrink-0"
                      >
                        <Card className="h-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                          <div className="p-6 flex flex-col h-full">
                            <div className="mb-4">
                              <h3 className="text-xl font-bold mb-1">{pkg.title}</h3>
                              <div className="text-2xl font-bold text-main">
                                ${pkg.price}
                                <span className="text-sm font-normal text-foreground/60 ml-1">
                                  {pkg.description}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-grow">
                              <ul className="space-y-2">
                                {pkg.features && pkg.features.map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-main shrink-0 mt-0.5" />
                                    <span className="text-sm">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mt-6">
                              <Button className="w-full">Book Session</Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <LockedContent 
                    title="No Packages Available" 
                    message="This consultant hasn't added any service packages yet."
                  />
                )}
              </section>

              {/* Extracurriculars Section */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Extracurricular Activities</h2>
                  <Button 
                    variant="reverse" 
                    size="icon" 
                    onClick={() => toggleSection('extracurriculars')}
                    className="h-8 w-8 rounded-full"
                  >
                    {expandedSections.extracurriculars ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {expandedSections.extracurriculars && (
                  <>
                    {Array.isArray(consultant.extracurriculars) && consultant.extracurriculars.length > 0 ? (
                      <div className="space-y-4">
                        {consultant.extracurriculars.map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                              <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div>
                                    <h3 className="text-xl font-bold mb-1">{activity.title}</h3>
                                    {activity.institution && (
                                      <p className="text-sm text-foreground/70 mb-1">{activity.institution}</p>
                                    )}
                                    {activity.role && (
                                      <p className="text-sm text-foreground/70 mb-2">{activity.role}</p>
                                    )}
                                    {activity.description && (
                                      <p className="text-sm mt-2">{activity.description}</p>
                                    )}
                                  </div>
                                  {Array.isArray(activity.years) && activity.years.length > 0 && (
                                    <div className="shrink-0">
                                      <div className="flex flex-wrap gap-2">
                                        {activity.years.map((year, index) => (
                                          <span 
                                            key={index}
                                            className="inline-block px-3 py-1 bg-background border-2 border-black rounded-full text-xs font-medium"
                                          >
                                            {year}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <LockedContent 
                        title="Extracurricular Activities" 
                        message="Unlock premium content with a package"
                      />
                    )}
                  </>
                )}
              </section>
              
              {/* Awards Section */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Awards & Honors</h2>
                  <Button 
                    variant="reverse" 
                    size="icon" 
                    onClick={() => toggleSection('awards')}
                    className="h-8 w-8 rounded-full"
                  >
                    {expandedSections.awards ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {expandedSections.awards && (
                  <>
                    {consultant.awards && consultant.awards.length > 0 ? (
                      <div className="space-y-4">
                        {consultant.awards.map((award) => (
                          <motion.div
                            key={award.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                              <div className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-main" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold">{award.title}</h3>
                                    {award.year && (
                                      <p className="text-sm text-foreground/60">{award.year}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm">{award.description}</p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <LockedContent 
                        title="Awards & Honors" 
                        message="Unlock premium content with a package"
                      />
                    )}
                  </>
                )}
              </section>
              
              {/* Essays Section */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">College Essays</h2>
                  <Button 
                    variant="reverse" 
                    size="icon" 
                    onClick={() => toggleSection('essays')}
                    className="h-8 w-8 rounded-full"
                  >
                    {expandedSections.essays ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {expandedSections.essays && (
                  <>
                    {consultant.essays && consultant.essays.length > 0 ? (
                      <div className="space-y-4">
                        {consultant.essays.map((essay) => (
                          <motion.div
                            key={essay.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none">
                              <div className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-main" />
                                  </div>
                                  <div className="flex-grow">
                                    <h3 className="font-bold">{essay.title}</h3>
                                  </div>
                                  {essay.is_locked && (
                                    <div className="shrink-0 bg-gray-100 px-2 py-1 rounded text-xs">
                                      Premium
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm">{essay.preview}</p>
                                </div>
                                <div className="mt-4">
                                  <Button variant={essay.is_locked ? "reverse" : "default"}>
                                    {essay.is_locked ? "Unlock Essay" : "Read Full Essay"}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <LockedContent 
                        title="College Essays" 
                        message="Unlock premium content with a package"
                      />
                    )}
                  </>
                )}
              </section>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Get score color based on AP score (1-5)
function getScoreColor(score: number) {
  switch (score) {
    case 5: return 'bg-green-100 text-green-800';
    case 4: return 'bg-green-100 text-green-700';
    case 3: return 'bg-yellow-100 text-yellow-800';
    case 2: return 'bg-orange-100 text-orange-800';
    case 1: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Locked content component
function LockedContent({ title, message }: { title: string, message: string }) {
  // Function to scroll to the top where packages are
  const scrollToPackages = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-lg flex flex-col items-center justify-center z-10">
        <div className="w-16 h-16 bg-main/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-main" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-foreground/80 mb-6 max-w-md px-4 text-center">{message}</p>
        <Button onClick={scrollToPackages}>View Packages</Button>
      </div>
      
      {/* Blurred dummy extracurricular content */}
      <div className="blur-sm opacity-40 p-6">
        <div className="space-y-4">
          {/* First dummy card */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Student Government</h3>
                  <p className="text-sm text-foreground/70 mb-1">Central High School</p>
                  <p className="text-sm text-foreground/70 mb-2">Class President</p>
                  <p className="text-sm mt-2">Led initiatives to improve student facilities and organized school-wide events. Represented student body in meetings with administration.</p>
                </div>
                <div className="shrink-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 bg-background border-2 border-black rounded-full text-xs font-medium">2022</span>
                    <span className="inline-block px-3 py-1 bg-background border-2 border-black rounded-full text-xs font-medium">2023</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Second dummy card */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Debate Team</h3>
                  <p className="text-sm text-foreground/70 mb-1">Central High School</p>
                  <p className="text-sm text-foreground/70 mb-2">Team Captain</p>
                  <p className="text-sm mt-2">Competed in regional and national debate tournaments. Developed research, public speaking, and critical thinking skills.</p>
                </div>
                <div className="shrink-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 bg-background border-2 border-black rounded-full text-xs font-medium">2021</span>
                    <span className="inline-block px-3 py-1 bg-background border-2 border-black rounded-full text-xs font-medium">2022</span>
                    <span className="inline-block px-3 py-1 bg-background border-2 border-black rounded-full text-xs font-medium">2023</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
