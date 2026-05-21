/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/locale';
import { UserPlus } from 'lucide-react';
import { registerUser, loginWithGoogle } from '@/lib/auth';

type Strength = 'weak' | 'medium' | 'strong';

const getStrength = (pwd: string): Strength | null => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return 'weak';
  if (score === 2 || score === 3) return 'medium';
  return 'strong';
};

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('passwords_no_match'));
      return;
    }
    setLoading(true);
    try {
      await registerUser(email, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || t('google_signin_failed'));
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
          <div className="glass-card p-8 mt-8 text-center">
            <h2 className="text-2xl font-display mb-4">Sprawdź email</h2>
            <p className="text-muted-foreground">
              Wysłaliśmy link potwierdzający na <strong>{email}</strong>. Kliknij w link, żeby aktywować konto.
            </p>
            <Button className="mt-6" onClick={() => navigate('/login')}>
              {t('login')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const strengthColor =
    strength === 'strong' ? 'bg-green-500'
    : strength === 'medium' ? 'bg-yellow-500'
    : strength === 'weak' ? 'bg-red-500'
    : 'bg-transparent';
  const strengthWidth =
    strength === 'strong' ? 'w-full'
    : strength === 'medium' ? 'w-2/3'
    : strength === 'weak' ? 'w-1/3'
    : 'w-0';
  const strengthLabel =
    strength === 'strong' ? t('password_strength_strong')
    : strength === 'medium' ? t('password_strength_medium')
    : strength === 'weak' ? t('password_strength_weak')
    : '';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="glass-card p-8 mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display leading-tight">{t('register')}</h2>
              <p className="text-xs text-muted-foreground">{t('register_subtitle')}</p>
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
              {strength && (
                <div className="mt-1">
                  <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} ${strengthWidth} transition-all`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t('password_strength')}: <span className="text-foreground font-medium">{strengthLabel}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('confirmPassword')}</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!email || !password || !confirm || loading || googleLoading}
            >
              {loading ? 'Rejestracja...' : t('register')}
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center mt-5">
            {t('signup_legal_prefix')}{' '}
            <Link to="/regulamin" target="_blank" className="text-primary hover:underline">
              {t('terms')}
            </Link>{' '}
            {t('signup_legal_and')}{' '}
            <Link to="/polityka-prywatnosci" target="_blank" className="text-primary hover:underline">
              {t('privacy_policy')}
            </Link>
          </p>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('haveAccount_action')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
