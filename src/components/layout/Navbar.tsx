import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, User, Settings, Code2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wordmark } from '@/components/Wordmark';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';

const authedLinks = [
  { to: '/dashboard', label: 'Dashboard' },
];

const publicLinks = [
  { to: '/dashboard', label: 'Dashboard' },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const handleLogout = async () => {
    setAvatarOpen(false);
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      setUserEmail(session?.user?.email ?? null);
      setUserName(session?.user?.user_metadata?.full_name ?? null);
      setUserAvatar(session?.user?.user_metadata?.avatar_url ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
      setUserEmail(session?.user?.email ?? null);
      setUserName(session?.user?.user_metadata?.full_name ?? null);
      setUserAvatar(session?.user?.user_metadata?.avatar_url ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = isAuthed ? authedLinks : publicLinks;

  // Initials: from display name if set, otherwise first letter of email
  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-4">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <Popover open={mobileOpen} onOpenChange={setMobileOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="group size-8 md:hidden"
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="pointer-events-none"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M4 12L20 12"
                      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 p-2 md:hidden">
                <nav className="flex flex-col gap-1">
                  {/* Home with sub-links on mobile */}
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      location.pathname === '/'
                        ? 'text-primary bg-primary/10 font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    Home
                  </Link>
                  <a
                    href="/#faq"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 pl-6 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    FAQ
                  </a>
                  <a
                    href="/#contact"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 pl-6 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    Contact
                  </a>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${
                        location.pathname === link.to
                          ? 'text-primary bg-primary/10 font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-1 h-px bg-border" />
                  {!authLoading && (
                    isAuthed ? (
                      <button
                        onClick={() => { setMobileOpen(false); handleLogout(); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setMobileOpen(false)}
                          className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          Sign in
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileOpen(false)}
                          className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 text-center"
                        >
                          Sign up
                        </Link>
                      </>
                    )
                  )}
                </nav>
              </PopoverContent>
            </Popover>

            {/* Wordmark + what-it-does descriptor */}
            <Link to="/" aria-label="Presora — AI brand visibility" className="flex items-center gap-2 shrink-0">
              <Wordmark className="text-lg" />
              <span className="hidden sm:inline-flex items-center leading-none pl-2 border-l border-[hsl(var(--glass-border))] text-[10px] font-data uppercase tracking-[0.18em] text-muted-foreground">
                AI Visibility
              </span>
            </Link>
          </div>

          {/* Center: desktop navigation */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Home with dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      location.pathname === '/'
                        ? 'text-primary bg-primary/10 font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    Home
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-40 p-2 space-y-1">
                      <li>
                        <a
                          href="/#faq"
                          className="block px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          FAQ
                        </a>
                      </li>
                      <li>
                        <a
                          href="/#contact"
                          className="block px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          Contact
                        </a>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Other nav links */}
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.to}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={link.to}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors inline-flex items-center ${
                          location.pathname === link.to
                            ? 'text-primary bg-primary/10 font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
              <NavigationMenuViewport />
            </NavigationMenu>
          </div>

          {/* Right: language + auth */}
          <div className="flex items-center gap-2">
            {authLoading ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-16 h-8 rounded-lg bg-muted animate-pulse" />
                <div className="w-20 h-8 rounded-lg bg-muted animate-pulse" />
              </div>
            ) : isAuthed ? (
                <Button size="sm" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Sign up</Link>
                  </Button>
                </div>
              )}
          </div>

        </div>
      </div>
    </header>
  );
};
