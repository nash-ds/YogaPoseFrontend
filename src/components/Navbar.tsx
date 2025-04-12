
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, SunMoon, Home, BookOpen, History, Brain, BarChart2, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

// Create the ThemeToggle component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { theme } = useTheme();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const getNavLinkClass = (path: string) => {
    return `flex items-center gap-2 p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors ${
      location.pathname === path ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70'
    }`;
  };

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <SunMoon className={`h-6 w-6 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
            <span className="text-xl font-bold tracking-tight">YogAura</span>
          </Link>
        </div>

        {isMobile ? (
          <>
            <button 
              className="text-foreground p-2 rounded-md hover:bg-secondary" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {isOpen && (
              <div className="fixed inset-0 top-16 z-50 bg-background p-4">
                <div className="flex flex-col gap-2">
                  <Link to="/" className={getNavLinkClass('/')} onClick={closeMenu}>
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link to="/library" className={getNavLinkClass('/library')} onClick={closeMenu}>
                    <BookOpen className="h-5 w-5" />
                    Pose Library
                  </Link>
                  <Link to="/history" className={getNavLinkClass('/history')} onClick={closeMenu}>
                    <History className="h-5 w-5" />
                    Practice History
                  </Link>
                  <Link to="/meditation" className={getNavLinkClass('/meditation')} onClick={closeMenu}>
                    <Brain className="h-5 w-5" />
                    Meditation
                  </Link>
                  <Link to="/progress" className={getNavLinkClass('/progress')} onClick={closeMenu}>
                    <BarChart2 className="h-5 w-5" />
                    Progress
                  </Link>
                  <Link to="/profile" className={getNavLinkClass('/profile')} onClick={closeMenu}>
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <div className="mt-4">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <Link to="/" className={getNavLinkClass('/')}>
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link to="/library" className={getNavLinkClass('/library')}>
                <BookOpen className="h-5 w-5" />
                Pose Library
              </Link>
              <Link to="/history" className={getNavLinkClass('/history')}>
                <History className="h-5 w-5" />
                Practice History
              </Link>
              <Link to="/meditation" className={getNavLinkClass('/meditation')}>
                <Brain className="h-5 w-5" />
                Meditation
              </Link>
              <Link to="/progress" className={getNavLinkClass('/progress')}>
                <BarChart2 className="h-5 w-5" />
                Progress
              </Link>
              <Link to="/profile" className={getNavLinkClass('/profile')}>
                <User className="h-5 w-5" />
                Profile
              </Link>
            </div>
            <ThemeToggle />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
