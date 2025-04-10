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
import { Menu, X, User, Settings, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [profileData, setProfileData] = useState<{ first_name: string; last_name: string; role: string; slug: string | null } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, slug')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          // If user is a consultant, fetch their slug from consultants table
          if (data.role === 'consultant') {
            const { data: consultantData, error: consultantError } = await supabase
              .from('consultants')
              .select('slug')
              .eq('user_id', user.id)
              .single();
            
            if (!consultantError && consultantData) {
              setProfileData({
                ...data,
                slug: consultantData.slug
              });
            } else {
              setProfileData(data);
            }
          } else {
            setProfileData(data);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
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
                  <span>{profileData.first_name}</span>
                )}
              </Button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md z-50">
                  <div className="p-3 border-b-2 border-black">
                    <p className="font-bold">{profileData?.first_name} {profileData?.last_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{profileData?.role}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      href={profileData?.role === 'consultant' ? `/mentors/${profileData?.slug || ''}` : "/profile"} 
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                      tabIndex={0}
                      aria-label="View profile"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setShowProfileMenu(false);
                        }
                      }}
                    >
                      <User className="h-4 w-4" />
                      <span>View Profile</span>
                    </Link>
                    
                    <Link 
                      href={profileData?.role === 'consultant' ? "/profile/consultant/edit" : "/profile/edit"} 
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                      tabIndex={0}
                      aria-label="Edit profile"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setShowProfileMenu(false);
                        }
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                    
                    {profileData?.role === 'consultant' && (
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                        tabIndex={0}
                        aria-label="Mentor dashboard"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setShowProfileMenu(false);
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Mentor Dashboard</span>
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-red-600 w-full text-left border-t border-gray-200 mt-1 pt-1"
                      tabIndex={0}
                      aria-label="Sign out"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSignOut();
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="reverse" asChild className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
              <Button variant="default" asChild className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Link href="/auth/signup">
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="neutral" size="icon" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-2 border-black p-0">
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
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
              <div className="mt-auto flex flex-col space-y-4 pt-6">
                {user ? (
                  <>
                    <div className="p-3 border-2 border-black rounded-md mb-2">
                      <p className="font-bold">{profileData?.first_name} {profileData?.last_name}</p>
                      <p className="text-sm text-gray-600 capitalize">{profileData?.role}</p>
                    </div>
                    
                    <Link 
                      href={profileData?.role === 'consultant' ? `/mentors/${profileData?.slug || ''}` : "/profile"} 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>View Profile</span>
                    </Link>
                    
                    <Link 
                      href={profileData?.role === 'consultant' ? "/profile/consultant/edit" : "/profile/edit"} 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </Link>
                    
                    {profileData?.role === 'consultant' && (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                        <span>Mentor Dashboard</span>
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors text-red-600 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Button variant="reverse" asChild className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button variant="default" asChild className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
