import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/locale';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Button } from '@/components/ui/button';
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/bitbrew-logo.svg" alt="BitBrew" height="28" />
          </Link>

          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${location.pathname === link.to
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-2">
              {!authLoading && (
                isAuthed ? (
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="px-3 py-1.5 rounded-md text-sm">
                    {t('logout')}
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login" className="px-3 py-1.5 rounded-md text-sm">
                        {t('login')}
                      </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild>
                      <Link to="/register" className="px-3 py-1.5 rounded-md text-sm">
                        {t('register')}
                      </Link>
                    </Button>
                  </>
                  )
              )}
            </div>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-muted-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[hsl(var(--glass-border))] bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm ${
                    location.pathname === link.to
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground'
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}
              <div className="mt-2 border-t border-[hsl(var(--glass-border))] pt-2 space-y-1">
                {isAuthed ? (
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t('logout')}
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground">
                      {t('login')}
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground">
                      {t('register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
