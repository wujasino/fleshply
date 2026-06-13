/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/locale';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Circle, Mail, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { registerUser, loginWithGoogle } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';
import { cn } from '@/lib/utils';

// 6 individual digit inputs — paste-aware, auto-advancing
const OtpInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const focus = (i: number) => inputs.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      onChange(digits.map((d, idx) => idx === i ? '' : d).join(''));
      if (i > 0) focus(i - 1);
    }
  };
  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    onChange(digits.map((d, idx) => idx === i ? char : d).join(''));
    if (char && i < 5) focus(i + 1);
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, '').slice(0, 6)); focus(Math.min(pasted.length, 5)); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl border border-[hsl(var(--glass-border))] bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      ))}
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.52 1 10.21 1 12s.43 3.48 1.18 4.96l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z"/>
  </svg>
);

type Strength = 'weak' | 'medium' | 'strong';

const getStrength = (pwd: string): Strength | null => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
};

const rules = [
  { label: 'Min. 8 znaków',          test: (p: string) => p.length >= 8 },
  { label: 'Wielka litera',           test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Cyfra',                   test: (p: string) => /[0-9]/.test(p) },
  { label: 'Znak specjalny',          test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const SuccessScreen = ({ email }: { email: string }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\D/g, '');
    if (token.length < 6) { setError('Wpisz pełny 6-cyfrowy kod.'); return; }
    setVerifying(true);
    setError('');
    try {
      // Confirms the account AND signs the user in (session is set)
      const { error: vErr } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
      if (vErr) throw vErr;
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message?.includes('expired') || err.message?.includes('invalid')
        ? 'Nieprawidłowy lub wygasły kod. Wyślij nowy.'
        : (err.message || 'Nie udało się potwierdzić kodu.'));
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setResent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
        >
          <Mail className="w-7 h-7 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-display text-foreground">Sprawdź skrzynkę</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Wysłaliśmy 6-cyfrowy kod aktywacyjny na{' '}
            <span className="text-foreground font-medium">{email}</span>.<br />
            Wpisz go poniżej, żeby aktywować konto.
          </p>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
          >{error}</motion.p>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <OtpInput value={code} onChange={setCode} />
          <Button type="submit" className="w-full h-10 gap-2" disabled={verifying || code.replace(/\D/g, '').length < 6}>
            {verifying
              ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Weryfikacja...</span>
              : <><KeyRound className="w-3.5 h-3.5" />Aktywuj konto</>}
          </Button>
        </form>

        {resent ? (
          <p className="text-xs text-green-400">✓ Nowy kod wysłany.</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            {resending ? 'Wysyłanie…' : 'Nie dostałem kodu — wyślij ponownie'}
          </button>
        )}
      </motion.div>
    </div>
  );
};

const Register = () => {
  const { t } = useTranslation();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess]   = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  const strengthConfig = {
    weak:   { label: t('password_strength_weak'),   color: 'bg-red-500',   width: 'w-1/3' },
    medium: { label: t('password_strength_medium'), color: 'bg-yellow-500',width: 'w-2/3' },
    strong: { label: t('password_strength_strong'), color: 'bg-emerald-500',width: 'w-full' },
  };
  const sc = strength ? strengthConfig[strength] : null;

  const pwdMatch = confirm.length > 0 && password === confirm;
  const pwdMismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError(t('passwords_no_match')); return; }
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

  if (success) return <SuccessScreen email={email} />;

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ── */}
      <FloatingPathsBackground
        position={0.6}
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-10 border-r border-[hsl(var(--glass-border))] bg-card/30"
      >
        <Link to="/" className="flex items-center w-fit">
          <img src="/bitbrew-logo.svg" alt="BitBrew" className="h-7" />
        </Link>

        <div className="space-y-8">
          <div>
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.2em] bg-primary/10 text-primary rounded-lg border border-primary/20 mb-4">
              Bezpłatny start
            </span>
            <h2 className="text-3xl font-display leading-snug text-foreground">
              3 analizy gratis —<br />
              <span className="text-primary">bez karty kredytowej</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Dołącz do setek marek, które już wiedzą jak modele AI je opisują i rekomendują.
            </p>
          </div>

          {/* Steps */}
          <ol className="space-y-5">
            {[
              { n: '01', title: 'Załóż konto',        desc: 'Email lub Google — w 30 sekund' },
              { n: '02', title: 'Podaj nazwę marki',   desc: 'Lub URL strony' },
              { n: '03', title: 'Odbierz raport',      desc: 'Wynik widoczności AI + rekomendacje' },
            ].map(({ n, title, desc }) => (
              <li key={n} className="flex items-start gap-4">
                <span className="text-xs font-data text-primary/60 mt-0.5 w-6 shrink-0">{n}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-[11px] text-muted-foreground/50">© 2024 BitBrew</p>
      </FloatingPathsBackground>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[400px] space-y-5"
        >
          {/* Top bar: mobile logo + back button */}
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="lg:hidden flex items-center">
              <img src="/bitbrew-logo.svg" alt="BitBrew" className="h-6" />
            </Link>
            <Link
              to="/"
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Strona główna
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-display text-foreground">{t('register')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('register_subtitle')}</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

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
            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('password')}</Label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {strength && sc && (
                <div className="space-y-2 pt-1">
                  <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full transition-all', sc.color, sc.width)}
                      layout
                    />
                  </div>
                  {/* Rules checklist */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {rules.map(({ label, test }) => {
                      const ok = test(password);
                      return (
                        <div key={label} className="flex items-center gap-1.5">
                          {ok
                            ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            : <Circle className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                          <span className={cn('text-[11px]', ok ? 'text-foreground/80' : 'text-muted-foreground/60')}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('confirmPassword')}</Label>
              <div className="relative">
                <Input
                  type={showCfm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={cn(
                    'h-10 pr-10 transition-colors',
                    pwdMismatch && 'border-red-500/60 focus-visible:ring-red-500/20',
                    pwdMatch && 'border-emerald-500/60 focus-visible:ring-emerald-500/20',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCfm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {pwdMismatch && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-[11px] text-red-400">
                    Hasła się nie zgadzają
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              className="w-full h-10 gap-2"
              disabled={!email || !password || !confirm || pwdMismatch || loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Rejestracja...
                </span>
              ) : (
                <>
                  {t('register')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Legal */}
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            {t('signup_legal_prefix')}{' '}
            <Link to="/regulamin" target="_blank" className="text-primary hover:underline">{t('terms')}</Link>
            {' '}{t('signup_legal_and')}{' '}
            <Link to="/polityka-prywatnosci" target="_blank" className="text-primary hover:underline">{t('privacy_policy')}</Link>
          </p>

          <p className="text-center text-sm text-muted-foreground">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('haveAccount_action')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
