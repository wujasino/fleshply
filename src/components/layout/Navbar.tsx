import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/locale';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';

const publicLinks = [
  { to: '/', key: 'home' },
  { to: '/pricing', key: 'pricing' },
];

const authedLinks = [
  { to: '/', key: 'home' },
  { to: '/dashboard', key: 'dashboard' },
  { to: '/pricing', key: 'pricing' },
  { to: '/profile', key: 'profile' },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { t } = useTranslation();

  const handleLogout = async () => {
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
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = isAuthed ? authedLinks : publicLinks;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Left: hamburger + logo + desktop nav */}
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
                      {t(link.key)}
                    </Link>
                  ))}
                  <div className="my-1 h-px bg-border" />
                  {!authLoading && (
                    isAuthed ? (
                      <button
                        onClick={() => { setMobileOpen(false); handleLogout(); }}
                        className="px-3 py-2 rounded-md text-sm text-left text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        {t('logout')}
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setMobileOpen(false)}
                          className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          {t('login')}
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileOpen(false)}
                          className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 text-center"
                        >
                          {t('register')}
                        </Link>
                      </>
                    )
                  )}
                </nav>
              </PopoverContent>
            </Popover>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/bitbrew-logo.svg" alt="BitBrew" height="28" />
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
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
                          {t(link.key)}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
                <NavigationMenuViewport />
              </NavigationMenu>
            </div>
          </div>

          {/* Right: language + auth */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {!authLoading && (
              isAuthed ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  {t('logout')}
                </Button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">{t('login')}</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">{t('register')}</Link>
                  </Button>
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
