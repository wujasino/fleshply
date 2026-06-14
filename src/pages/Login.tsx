import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/lib/locale';
import { Eye, EyeOff, ArrowRight, Zap, BarChart3, Shield, Loader2, ArrowLeft, Mail, KeyRound } from 'lucide-react';
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
  { icon: Zap,       text: 'Audyt widoczności w GPT-4, Claude, Gemini' },
  { icon: BarChart3, text: 'Śledzenie trendu sentymentu w czasie'       },
  { icon: Shield,    text: 'Wiarygodność źródeł z wynikiem pewności'   },
];

const pwdRules = [
  { label: 'Min. 8 znaków',  test: (p: string) => p.length >= 8 },
  { label: 'Wielka litera',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Cyfra',          test: (p: string) => /[0-9]/.test(p) },
  { label: 'Znak specjalny', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getPwdStrength(p: string) {
  if (!p) return 0;
  return pwdRules.filter(r => r.test(p)).length;
}

const strengthLabel = ['', 'Słabe', 'Słabe', 'Średnie', 'Silne'];
const strengthColor = ['', 'bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

// 6 individual digit inputs
const OtpInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const focus = (i: number) => inputs.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, idx) => idx === i ? '' : d).join('');
      onChange(next);
      if (i > 0) focus(i - 1);
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, idx) => idx === i ? char : d).join('');
    onChange(next);
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

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/profile';

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [remember, setRemember]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mode, setMode]             = useState<'login' | 'forgot' | 'otp' | 'reset' | 'forgot_sent'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [otpValue, setOtpValue]     = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [newPwd, setNewPwd]         = useState('');
  const [newPwdConfirm, setNewPwdConfirm] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [notice, setNotice]         = useState('');
  const [dir, setDir]               = useState(1);

  const newPwdStrength = useMemo(() => getPwdStrength(newPwd), [newPwd]);

  const switchMode = (next: typeof mode, direction = 1) => {
    setDir(direction);
    setError('');
    setMode(next);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/.netlify/functions/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd wysyłania kodu.');
      setOtpValue('');
      switchMode('otp', 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Step 1: verify the 6-digit code (does not consume it yet)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.replace(/\D/g, '').length < 6) {
      setError('Wpisz pełny 6-cyfrowy kod.');
      return;
    }
    setOtpLoading(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim(), code: otpValue.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nieprawidłowy kod.');
      setNewPwd('');
      setNewPwdConfirm('');
      switchMode('reset', 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: set the new password using the verified code
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 8) {
      setError('Nowe hasło musi mieć co najmniej 8 znaków.');
      return;
    }
    if (newPwd !== newPwdConfirm) {
      setError('Hasła nie są identyczne.');
      return;
    }
    setOtpLoading(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim(), code: otpValue.replace(/\D/g, ''), newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się zmienić hasła.');
      setEmail(resetEmail.trim());
      setNewPwd('');
      setNewPwdConfirm('');
      setOtpValue('');
      setNotice('Hasło zostało zmienione. Zaloguj się nowym hasłem.');
      switchMode('login', -1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

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
      navigate(from, { replace: true });
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
        <Link to="/" className="flex items-center w-fit">
          <img src="/bitbrew-logo-cream.svg" alt="BitBrew" height="28" className="h-7" />
        </Link>

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

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-hidden">
        <div className="w-full max-w-[400px]">
          {/* Top bar: mobile logo + back button */}
          <div className="flex items-center justify-between mb-6 lg:mb-4">
            <Link to="/" className="lg:hidden flex items-center">
              <img src="/bitbrew-logo-cream.svg" alt="BitBrew" className="h-6" />
            </Link>
            <Link
              to="/"
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Strona główna
            </Link>
          </div>

          <AnimatePresence mode="wait" custom={dir}>

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <motion.div key="login" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-display text-foreground">{t('login')}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{t('login_subtitle')}</p>
                </div>

                {notice && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5"
                  >{notice}</motion.p>
                )}

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                  >{error}</motion.p>
                )}

                <Button type="button" variant="outline" className="w-full gap-2.5 h-10" onClick={handleGoogle} disabled={googleLoading || loading}>
                  <GoogleIcon />
                  {googleLoading ? '...' : t('sign_in_with_google')}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[hsl(var(--glass-border))]" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-[11px] text-muted-foreground uppercase tracking-widest">{t('or')}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('email')}</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@firma.pl" required autoComplete="email" className="h-10" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('password')}</Label>
                      <button type="button" onClick={() => switchMode('forgot', 1)} className="text-[11px] text-primary hover:underline">
                        Zapomniałeś hasła?
                      </button>
                    </div>
                    <div className="relative">
                      <Input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="h-10 pr-10" />
                      <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showPwd ? 'Ukryj hasło' : 'Pokaż hasło'}>
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <Checkbox id="remember" checked={remember} onCheckedChange={v => setRemember(Boolean(v))} />
                    <Label htmlFor="remember" className="!mb-0 text-sm text-muted-foreground cursor-pointer">{t('remember')}</Label>
                  </div>

                  <Button type="submit" className="w-full h-10 gap-2" disabled={loading || googleLoading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Logowanie...
                      </span>
                    ) : <>{t('submit')}<ArrowRight className="w-3.5 h-3.5" /></>}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  {t('noAccount')}{' '}
                  <Link to="/register" className="text-primary hover:underline font-medium">{t('noAccount_action')}</Link>
                </p>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {mode === 'forgot' && (
              <motion.div key="forgot" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6">
                <button type="button" onClick={() => switchMode('login', -1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Powrót do logowania
                </button>

                <div>
                  <h1 className="text-2xl font-display text-foreground">Resetuj hasło</h1>
                  <p className="text-sm text-muted-foreground mt-1">Podaj swój e-mail — wyślemy 6-cyfrowy kod weryfikacyjny.</p>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                  >{error}</motion.p>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</Label>
                    <Input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="jan@firma.pl" required autoComplete="email" autoFocus className="h-10" />
                  </div>

                  <Button type="submit" className="w-full h-10 gap-2" disabled={resetLoading}>
                    {resetLoading
                      ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Wysyłanie...</span>
                      : <><Mail className="w-3.5 h-3.5" />Wyślij kod</>}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── OTP VERIFICATION ── */}
            {mode === 'otp' && (
              <motion.div key="otp" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6">
                <button type="button" onClick={() => switchMode('forgot', -1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Zmień e-mail
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-display text-foreground">Wpisz kod</h1>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Wysłaliśmy 6-cyfrowy kod na<br/>
                    <span className="text-foreground font-medium">{resetEmail}</span>
                  </p>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center"
                  >{error}</motion.p>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <OtpInput value={otpValue} onChange={setOtpValue} />

                  <Button type="submit" className="w-full h-10 gap-2" disabled={otpLoading || otpValue.replace(/\D/g, '').length < 6}>
                    {otpLoading
                      ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Weryfikacja...</span>
                      : <><ArrowRight className="w-3.5 h-3.5" />Dalej</>}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center">
                  Kod wygasa za 10 minut ·{' '}
                  <button type="button" onClick={() => handleForgotPassword({ preventDefault: () => {} } as React.FormEvent)} className="text-primary hover:underline">
                    Wyślij ponownie
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── NEW PASSWORD (after code verified) ── */}
            {mode === 'reset' && (
              <motion.div key="reset" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6">
                <button type="button" onClick={() => switchMode('otp', -1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Wróć do kodu
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-display text-foreground">Ustaw nowe hasło</h1>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Kod potwierdzony. Wpisz teraz nowe hasło do konta.
                  </p>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center"
                  >{error}</motion.p>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nowe hasło</Label>
                    <div className="relative">
                      <Input
                        type={showNewPwd ? 'text' : 'password'}
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                        placeholder="Minimum 8 znaków"
                        autoComplete="new-password"
                        autoFocus
                        className="h-10 pr-10"
                      />
                      <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showNewPwd ? 'Ukryj hasło' : 'Pokaż hasło'}>
                        {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPwd.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-1 h-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`flex-1 rounded-full transition-colors ${i <= newPwdStrength ? strengthColor[newPwdStrength] : 'bg-muted/30'}`} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          {pwdRules.map(({ label, test }) => {
                            const ok = test(newPwd);
                            return (
                              <div key={label} className="flex items-center gap-1.5">
                                {ok
                                  ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  : <Circle className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                                <span className={`text-[11px] ${ok ? 'text-foreground/80' : 'text-muted-foreground/60'}`}>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Powtórz hasło</Label>
                    <Input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPwdConfirm}
                      onChange={e => setNewPwdConfirm(e.target.value)}
                      placeholder="Powtórz nowe hasło"
                      autoComplete="new-password"
                      className="h-10"
                    />
                    {newPwdConfirm.length > 0 && newPwd !== newPwdConfirm && (
                      <p className="text-[11px] text-red-400">Hasła się nie zgadzają</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-10 gap-2" disabled={otpLoading || newPwd.length < 8 || newPwd !== newPwdConfirm}>
                    {otpLoading
                      ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Zapisywanie...</span>
                      : <><KeyRound className="w-3.5 h-3.5" />Zmień hasło</>}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── FORGOT SENT (fallback — nie powinien się pojawić przy OTP flow) ── */}
            {mode === 'forgot_sent' && (
              <motion.div key="forgot_sent" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-display text-foreground">Sprawdź skrzynkę</h1>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Wysłaliśmy kod na <span className="text-foreground font-medium">{resetEmail}</span>.
                  </p>
                </div>
                <Button type="button" variant="outline" className="w-full h-10 gap-2" onClick={() => switchMode('login', -1)}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Powrót do logowania
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
