import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/lib/locale';
import { Eye, EyeOff, ArrowRight, Zap, BarChart3, Shield } from 'lucide-react';
import { getAuthUser, loginUser, loginWithGoogle } from '@/lib/auth';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.52 1 10.21 1 12s.43 3.48 1.18 4.96l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z"/>
  </svg>
);

const FEATURES = [
  { icon: Zap,      text: 'Audyt widoczności w GPT-4, Claude, Gemini' },
  { icon: BarChart3,text: 'Śledzenie trendu sentymentu w czasie'       },
  { icon: Shield,   text: 'Wiarygodność źródeł z wynikiem pewności'   },
];

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [remember, setRemember]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    getAuthUser().then(user => { if (user) navigate(from, { replace: true }); }).catch(() => {});
  }, [from, navigate]);

  useEffect(() => {
    try {
      if (localStorage.getItem('rememberMe') === 'true') {
        setRemember(true);
        setEmail(localStorage.getItem('rememberEmail') || '');
      }
    } catch { /* ignore */ }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      if (remember) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberEmail');
      }
      navigate(from, { replace: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError(t('invalid_credentials') || 'Nieprawidłowe dane logowania');
      } else {
        setError(err.message || 'Błąd logowania');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('google_signin_failed'));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ── */}
      <FloatingPathsBackground
        position={0.8}
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-10 border-r border-[hsl(var(--glass-border))] bg-card/30"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group w-fit">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="hsl(45,100%,50%)" strokeWidth="1.6" fill="none"/>
            <line x1="16" y1="2" x2="16" y2="0" stroke="hsl(45,100%,50%)" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <span className="text-lg font-display tracking-tight">
            Bit<span className="text-primary">Brew</span>
          </span>
        </Link>

        {/* Centre copy */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-display leading-snug text-foreground">
              Poznaj jak AI<br />
              <span className="text-primary">widzi Twoją markę</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Setki marek używa BitBrew, żeby monitorować i poprawiać swoją widoczność w modelach AI.
            </p>
          </div>

          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground/80 leading-snug">{text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {['A', 'K', 'M', 'P'].map((l) => (
                <div key={l} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-semibold text-primary">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">200+</span> marek już monitoruje AI
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/50">© 2024 BitBrew</p>
      </FloatingPathsBackground>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[400px] space-y-6"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="hsl(45,100%,50%)" strokeWidth="1.6" fill="none"/>
              <line x1="16" y1="2" x2="16" y2="0" stroke="hsl(45,100%,50%)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span className="text-base font-display">Bit<span className="text-primary">Brew</span></span>
          </Link>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-display text-foreground">{t('login')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('login_subtitle')}</p>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.p>
          )}

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2.5 h-10"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            <GoogleIcon />
            {googleLoading ? '...' : t('sign_in_with_google')}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--glass-border))]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-[11px] text-muted-foreground uppercase tracking-widest">
                {t('or')}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('email')}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@firma.pl"
                required
                autoComplete="email"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('password')}</Label>
                <button type="button" className="text-[11px] text-primary hover:underline">
                  Zapomniałeś hasła?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPwd ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
              <Label htmlFor="remember" className="!mb-0 text-sm text-muted-foreground cursor-pointer">{t('remember')}</Label>
            </div>

            <Button
              type="submit"
              className="w-full h-10 gap-2"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Logowanie...
                </span>
              ) : (
                <>
                  {t('submit')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t('noAccount_action')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
