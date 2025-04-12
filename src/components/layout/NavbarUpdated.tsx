'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from "@/components/ui/sheet";
import { Menu, User, Settings, LogOut, ExternalLink, Home, Users, Info, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { navigateToConsultantProfile } from "@/lib/consultants/profileManager";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAuthenticated, isConsultant, isStudent, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [consultantSlug, setConsultantSlug] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  /**
   * Fetch the consultant's slug when the component mounts or when the user changes
   * This is used to link to the consultant's public profile
   */
  useEffect(() => {
    const fetchConsultantSlug = async () => {
      // Only fetch for authenticated users with consultant role
      if (!isAuthenticated || !isConsultant) return;
      
      try {
        console.log('Fetching consultant slug for user:', user?.id);
        const { data, error } = await supabase
          .from('consultants')
          .select('slug')
          .eq('user_id', user?.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching consultant slug:', error);
          return;
        }
        
        if (data) {
          console.log('Found consultant slug:', data.slug);
          setConsultantSlug(data.slug);
        } else {
          console.log('No consultant profile found, will create one on demand');
        }
      } catch (error) {
        console.error('Exception fetching consultant slug:', error);
      }
    };
    
    fetchConsultantSlug();
  }, [user, isAuthenticated, isConsultant]);

  /**
   * Handle clicks outside the profile menu to close it
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Mentors", href: "/mentors", icon: <Users className="h-5 w-5" /> },
    { name: "About", href: "/about", icon: <Info className="h-5 w-5" /> },
  ];

  const isActive = (path: string) => pathname === path;

  /**
   * Handle sign out with proper error handling and user feedback
   */
  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    setIsSigningOut(true);
    toast.loading("Signing out...");
    
    try {
      console.log('Signing out user');
      await signOut();
      setIsOpen(false);
      setShowProfileMenu(false);
      toast.success("Signed out successfully");
      // Navigation is handled in the AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  /**
   * Handle the "View Your Profile" button click
   * Uses direct navigation to ensure it works reliably
   */
  const handleViewProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isConsultant) {
      console.error('Cannot view consultant profile: User is not authenticated or not a consultant');
      toast.error("You must be signed in as a consultant to view your profile");
      return;
    }
    
    if (!user?.id) {
      console.error('Cannot view consultant profile: User ID is undefined');
      toast.error("User information is missing");
      return;
    }
    
    try {
      setIsCreatingProfile(true);
      toast.loading("Preparing your profile...");
      
      // CRITICAL CHECK: First check if a profile exists with a direct database query
      console.log('Checking if consultant profile exists for user:', user.id);
      const { data: existingProfile, error: checkError } = await supabase
        .from('consultants')
        .select('slug')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing consultant profile:', checkError);
        console.error('Error details:', JSON.stringify(checkError));
        toast.error("Error checking your profile status");
        setIsCreatingProfile(false);
        return;
      }
      
      // If profile already exists, navigate directly to it
      if (existingProfile && existingProfile.slug) {
        console.log('Found existing profile, navigating to:', existingProfile.slug);
        toast.success("Navigating to your profile...");
        window.location.href = `/mentors/${existingProfile.slug}`;
        return;
      }
      
      // Double-check to ensure no profile exists before creating one
      console.log('No profile found in initial check, performing secondary verification...');
      const { count, error: countError } = await supabase
        .from('consultants')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) {
        console.error('Error in secondary verification:', countError);
        console.error('Error details:', JSON.stringify(countError));
        toast.error("Error verifying your profile status");
        setIsCreatingProfile(false);
        return;
      }
      
      // If count > 0, a profile exists despite our first check failing to return it
      if (count && count > 0) {
        console.error('Secondary check found existing profile(s) but first check did not return it');
        toast.error("Profile found but could not be accessed. Please try again.");
        setIsCreatingProfile(false);
        return;
      }
      
      // At this point, we're certain no profile exists, so create a new one
      console.log('No profile found in both checks, creating a new one...');
      
      // Create a unique slug
      const slug = `mentor-${user.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Create a default consultant profile
      const defaultProfile = {
        user_id: user.id,
        headline: 'Coming Soon',
        image_url: 'https://placehold.co/300x300',
        slug: slug,
        university: 'Not specified',
        major: ['Undecided'],
        sat_score: 0,
        num_aps: 0,
      };
      
      // Insert the new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('consultants')
        .insert(defaultProfile)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating consultant profile:', insertError);
        console.error('Error details:', JSON.stringify(insertError));
        toast.error("Failed to create your profile");
        setIsCreatingProfile(false);
        return;
      }
      
      console.log('Created new profile, navigating to:', newProfile.slug);
      toast.success("Profile created successfully!");
      
      // Navigate directly to the new profile
      window.location.href = `/mentors/${newProfile.slug}`;
    } catch (error) {
      console.error('Error in handleViewProfile:', error);
      toast.error("Failed to view your profile. Please try again.");
      setIsCreatingProfile(false);
    } finally {
      // Note: We don't set isCreatingProfile to false here because we're navigating away
      // and the component will unmount anyway
    }
  };

  /**
   * Handle the "Edit Your Profile" button click
   * This ensures the consultant profile exists before navigating to edit page
   */
  const handleEditProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isConsultant) {
      console.error('Cannot edit consultant profile: User is not authenticated or not a consultant');
      toast.error("You must be signed in as a consultant to edit your profile");
      return;
    }
    
    if (!user?.id) {
      console.error('Cannot edit consultant profile: User ID is undefined');
      toast.error("User information is missing");
      return;
    }
    
    try {
      setIsCreatingProfile(true);
      toast.loading("Preparing your profile editor...");
      
      // CRITICAL CHECK: First check if a profile exists with a direct database query
      console.log('Checking if consultant profile exists for user:', user.id);
      const { data: existingProfile, error: checkError } = await supabase
        .from('consultants')
        .select('id, slug')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing consultant profile:', checkError);
        console.error('Error details:', JSON.stringify(checkError));
        toast.error("Error checking your profile status");
        setIsCreatingProfile(false);
        return;
      }
      
      // If profile already exists, navigate directly to edit page
      if (existingProfile) {
        console.log('Found existing profile, navigating to edit page');
        toast.success("Opening profile editor...");
        
        // Use router.push instead of direct navigation to maintain auth context
        router.push('/profile/consultant/edit');
        return;
      }
      
      // Double-check to ensure no profile exists before creating one
      console.log('No profile found in initial check, performing secondary verification...');
      const { count, error: countError } = await supabase
        .from('consultants')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) {
        console.error('Error in secondary verification:', countError);
        console.error('Error details:', JSON.stringify(countError));
        toast.error("Error verifying your profile status");
        setIsCreatingProfile(false);
        return;
      }
      
      // If count > 0, a profile exists despite our first check failing to return it
      if (count && count > 0) {
        console.error('Secondary check found existing profile(s) but first check did not return it');
        toast.error("Profile found but could not be accessed. Please try again.");
        setIsCreatingProfile(false);
        return;
      }
      
      // At this point, we're certain no profile exists, so create a new one
      console.log('No profile found in both checks, creating a new one before editing...');
      
      // Create a unique slug
      const slug = `mentor-${user.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Create a default consultant profile
      const defaultProfile = {
        user_id: user.id,
        headline: 'Coming Soon',
        image_url: 'https://placehold.co/300x300',
        slug: slug,
        university: 'Not specified',
        major: ['Undecided'],
        sat_score: 0,
        num_aps: 0,
      };
      
      // Insert the new profile
      const { error: insertError } = await supabase
        .from('consultants')
        .insert(defaultProfile);
      
      if (insertError) {
        console.error('Error creating consultant profile:', insertError);
        console.error('Error details:', JSON.stringify(insertError));
        toast.error("Failed to create your profile");
        setIsCreatingProfile(false);
        return;
      }
      
      console.log('Created new profile, navigating to edit page');
      toast.success("Profile created! Opening editor...");
      
      // Use router.push instead of direct navigation to maintain auth context
      router.push('/profile/consultant/edit');
    } catch (error) {
      console.error('Error in handleEditProfile:', error);
      toast.error("Failed to edit your profile. Please try again.");
      setIsCreatingProfile(false);
    } finally {
      // We'll keep the loading state until navigation completes or fails
      setIsCreatingProfile(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-black">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-2xl mr-8">Veridie</Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-main ${
                  isActive(item.href) ? "font-bold" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <Button
                variant="neutral"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="hidden sm:inline-block">
                  {profile?.first_name || profile?.last_name
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`
                    : 'My Account'}
                </span>
                <User className="h-4 w-4" />
              </Button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium">
                      {profile?.first_name || profile?.last_name
                        ? `${profile.first_name || ''} ${profile.last_name || ''}`
                        : 'My Account'}
                    </p>
                    <p className="text-xs text-muted-foreground">{profile?.role || 'User'}</p>
                  </div>
                  
                  <div className="p-2">
                    {isConsultant && (
                      <>
                        <button
                          onClick={handleViewProfile}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                        >
                          <User className="h-4 w-4" />
                          <span>View Your Profile</span>
                        </button>
                        <button
                          onClick={handleEditProfile}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Edit Your Profile</span>
                        </button>
                      </>
                    )}
                    
                    {isStudent && (
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                      >
                        <User className="h-4 w-4" />
                        <span>Your Profile</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md text-red-600 mt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="neutral" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="neutral" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r-2 border-black w-[300px] sm:w-[350px] p-0">
              <div className="p-6 border-b-2 border-black">
                <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
              </div>
              
              <nav className="flex flex-col p-6 space-y-5">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xl font-medium transition-colors hover:text-main flex items-center gap-3 ${
                      isActive(item.href) ? "font-bold" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto flex flex-col p-6 space-y-5 border-t-2 border-black">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-2 py-2">
                    {isConsultant && (
                      <>
                        <button
                          onClick={handleViewProfile}
                          className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <User className="h-5 w-5" />
                          <span>View Your Profile</span>
                        </button>
                        <button
                          onClick={handleEditProfile}
                          className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <Settings className="h-5 w-5" />
                          <span>Edit Your Profile</span>
                        </button>
                      </>
                    )}
                    {isStudent && (
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span>Your Profile</span>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors text-red-600 w-full mt-4"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <Button variant="reverse" asChild className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 h-auto">
                      <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button variant="default" asChild className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 h-auto">
                      <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
