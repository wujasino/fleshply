import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';

type Status = 'loading' | 'success' | 'error';

export default function AuthConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Supabase appends token_hash + type to the URL for email confirmation
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type = params.get('type') as 'signup' | 'email' | null;

    const verifyToken = async () => {
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) {
          setErrorMsg(error.message);
          setStatus('error');
        } else {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        }
      } else {
        // Might be the old hash-based flow — check for an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          setErrorMsg('Brak tokenu potwierdzającego w URL. Link mógł wygasnąć.');
          setStatus('error');
        }
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <FloatingPathsBackground position={1} className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl p-8 space-y-5">

          {/* Logo */}
          <Link to="/" className="inline-block">
            <img src="/landing-page-logo.png" alt="BitBrew" className="h-7 mx-auto" />
          </Link>

          {status === 'loading' && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-display text-foreground">Weryfikacja konta…</h1>
                <p className="text-sm text-muted-foreground mt-1">Chwileczkę, sprawdzamy Twój link.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </motion.div>
              <div>
                <h1 className="text-xl font-display text-foreground">Konto aktywowane!</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Za chwilę zostaniesz przekierowany do panelu…
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/dashboard">Przejdź do panelu →</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-display text-foreground">Link nieważny</h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {errorMsg || 'Ten link wygasł lub był już użyty. Zarejestruj się ponownie lub skontaktuj z pomocą.'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link to="/register">Zarejestruj się ponownie</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Wróć do logowania</Link>
                </Button>
              </div>
            </>
          )}

        </div>
      </motion.div>
    </FloatingPathsBackground>
  );
}
