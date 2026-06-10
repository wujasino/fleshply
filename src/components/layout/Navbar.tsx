import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, User, Settings, Code2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const { t } = useTranslation();

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
      setUserAvatar(session?.user?.user_metadata?.avatar_url ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
      setUserEmail(session?.user?.email ?? null);
      setUserAvatar(session?.user?.user_metadata?.avatar_url ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = isAuthed ? authedLinks : publicLinks;

  // Initials fallback: first letter of email or "?"
  const initials = userEmail ? userEmail[0].toUpperCase() : '?';

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
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <LogOut className="w-4 h-4" />
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
                /* Avatar dropdown */
                <Popover open={avatarOpen} onOpenChange={setAvatarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 transition-opacity hover:opacity-80"
                      aria-label="User menu"
                    >
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={userAvatar ?? undefined} alt={userEmail ?? ''} />
                        <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-52 p-2">
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-xs font-medium text-foreground truncate">{userEmail}</p>
                    </div>
                    <div className="h-px bg-border mb-1" />
                    <Link
                      to="/profile"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {t('profile')}
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {t('settings')}
                    </Link>
                    <Link
                      to="/developers"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Code2 className="w-4 h-4" />
                      Developers
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </PopoverContent>
                </Popover>
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
