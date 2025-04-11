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
import { Menu, User, Settings, LogOut, ExternalLink, Home, Users, Info } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAuthenticated, isConsultant, isStudent, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [consultantSlug, setConsultantSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultantSlug = async () => {
      if (!user || user.role !== 'consultant') return;
      
      try {
        const { data, error } = await supabase
          .from('consultants')
          .select('slug')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          setConsultantSlug(data.slug);
        }
      } catch (error) {
        console.error('Error fetching consultant slug:', error);
      }
    };
    
    fetchConsultantSlug();
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
    { name: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Mentors", href: "/mentors", icon: <Users className="h-5 w-5" /> },
    { name: "About", href: "/about", icon: <Info className="h-5 w-5" /> },
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
          {isAuthenticated ? (
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
                <span>{profile?.first_name || user?.email?.split('@')[0] || 'Profile'}</span>
              </Button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-md overflow-hidden z-50">
                  <div className="p-4 border-b-2 border-black">
                    <p className="font-bold">{profile?.first_name || ''} {profile?.last_name || ''}</p>
                    <p className="text-sm text-gray-600 capitalize">{profile?.role || 'User'}</p>
                  </div>
                  
                  <div className="p-2">
                    {user && (
                      <div className="flex flex-col space-y-2 py-2">
                        {user.role === 'consultant' && (
                          <>
                            <Link
                              href={consultantSlug ? `/mentors/${consultantSlug}` : '#'}
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                            >
                              <User className="h-5 w-5" />
                              <span>View Your Profile</span>
                            </Link>
                            <Link
                              href="/profile/consultant/edit"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                            >
                              <Settings className="h-5 w-5" />
                              <span>Edit Your Profile</span>
                            </Link>
                          </>
                        )}
                        {user.role === 'student' && (
                          <Link
                            href="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                          >
                            <User className="h-5 w-5" />
                            <span>Your Profile</span>
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md transition-colors w-full text-left text-red-600 mt-2"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
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
              {isAuthenticated && user ? (
                <div className="flex flex-col space-y-2 py-2">
                  {user.role === 'consultant' && (
                    <>
                      <Link
                        href={consultantSlug ? `/mentors/${consultantSlug}` : '#'}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span>View Your Profile</span>
                      </Link>
                      <Link
                        href="/profile/consultant/edit"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Edit Your Profile</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'student' && (
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
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
