import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/lib/locale';
import { LogIn } from 'lucide-react';
import { getAuthUser, loginUser, loginWithGoogle } from '@/lib/auth';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      const user = await getAuthUser();
      if (!user) return;
      navigate(from, { replace: true });
    };

    checkExistingSession();
  }, [from, navigate]);

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
      setError(err.message || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // OAuth will redirect — fall-through stays mounted until then
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('google_signin_failed'));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="glass-card p-8 mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display leading-tight">{t('login')}</h2>
              <p className="text-xs text-muted-foreground">{t('login_subtitle')}</p>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-4 mb-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full mt-6 mb-4"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.52 1 10.21 1 12s.43 3.48 1.18 4.96l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" />
            </svg>
            {googleLoading ? '...' : t('sign_in_with_google')}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--glass-border))]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">
                {t('or')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <Label>{t('email')}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('password')}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
              <Label className="!mb-0 cursor-pointer">{t('remember')}</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? 'Logowanie...' : t('submit')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t('noAccount_action')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
