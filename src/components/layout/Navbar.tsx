'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from "@/components/ui/sheet";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isConsultant } = useAuth();
  const [profileData, setProfileData] = useState<{ first_name: string; last_name: string; role: string; id: string } | null>(null);
  const [consultantData, setConsultantData] = useState<{ slug: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getProfileData = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, id')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setProfileData(data);
        
        // If user is a consultant, get their slug
        if (data.role === 'consultant') {
          const { data: consultantData, error: consultantError } = await supabase
            .from('consultants')
            .select('slug')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (!consultantError && consultantData) {
            setConsultantData(consultantData);
          }
        }
      }
    };
    
    getProfileData();
  }, [user]);

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
    { name: "Home", href: "/" },
    { name: "Mentors", href: "/mentors" },
    { name: "About", href: "/about" },
  ];

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    setShowProfileMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-black">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold">Veridie</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-base font-medium transition-colors hover:text-main ${
                isActive(item.href) ? "font-bold" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <Button 
                variant="neutral" 
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Profile menu"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowProfileMenu(!showProfileMenu);
                  }
                }}
              >
                <User className="h-5 w-5" />
                {profileData && (
                  <span>{profileData.first_name || 'Profile'}</span>
                )}
              </Button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md z-50">
                  <div className="p-3 border-b-2 border-black">
                    <p className="font-bold">{profileData?.first_name || ''} {profileData?.last_name || ''}</p>
                    <p className="text-sm text-gray-600 capitalize">{profileData?.role || 'User'}</p>
                  </div>
                  
                  <div className="p-2">
                    {user && (
                      <div className="flex flex-col space-y-2 py-2">
                        {isConsultant && (
                          <>
                            <Link
                              href={`/mentors/${consultantData?.slug || ''}`}
                              onClick={handleLinkClick}
                              className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                            >
                              <User className="mr-2 h-4 w-4" />
                              View Your Profile
                            </Link>
                            <Link
                              href="/profile/consultant/edit-direct"
                              onClick={handleLinkClick}
                              className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Edit Your Profile
                            </Link>
                          </>
                        )}
                        {!isConsultant && (
                          <Link
                            href="/profile"
                            onClick={handleLinkClick}
                            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Your Profile
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 rounded-md text-left"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="reverse" asChild className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button variant="default" asChild className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="neutral" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs p-0 border-r-2 border-black">
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <SheetTitle className="text-2xl font-bold">Veridie</SheetTitle>
                <Button
                  variant="neutral"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex flex-col space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xl font-medium transition-colors hover:text-main ${
                      isActive(item.href) ? "font-bold" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto flex flex-col p-6 space-y-5 border-t-2 border-black">
                {user && isConsultant ? (
                  <div className="flex flex-col space-y-2 py-2">
                    <>
                      <Link
                        href={`/mentors/${consultantData?.slug || ''}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span>View Your Profile</span>
                      </Link>
                      <Link
                        href="/profile/consultant/edit-direct"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Edit Your Profile</span>
                      </Link>
                    </>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors text-red-600 w-full mt-4"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : user ? (
                  <div className="flex flex-col space-y-2 py-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Your Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors text-red-600 w-full mt-4"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
