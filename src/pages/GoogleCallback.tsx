import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { GradientMeshBg } from '@/components/ui/gradient-mesh-bg';

type Status = 'loading' | 'success' | 'error';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setErrorMsg(error === 'access_denied' ? 'Anulowano logowanie przez Google.' : error);
      setStatus('error');
      return;
    }

    if (!code) {
      setErrorMsg('Brak kodu autoryzacji. Spróbuj ponownie.');
      setStatus('error');
      return;
    }

    const exchangeCode = async () => {
      try {
        const codeVerifier = sessionStorage.getItem('google_pkce_verifier');
        const redirectUri = `${window.location.origin}/auth/google/callback`;

        const res = await fetch('/.netlify/functions/google-token-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirect_uri: redirectUri, code_verifier: codeVerifier }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const { id_token } = await res.json();

        const { error: supaErr } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: id_token,
        });

        if (supaErr) throw supaErr;

        sessionStorage.removeItem('google_pkce_verifier');
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        console.error('Google callback error:', err);
        setErrorMsg(err instanceof Error ? err.message : 'Błąd logowania. Spróbuj ponownie.');
        setStatus('error');
      }
    };

    exchangeCode();
  }, [navigate]);

  return (
    <GradientMeshBg className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl p-8 space-y-5">
          <Link to="/" className="inline-block">
            <img src="/landing-page-logo.png" alt="BitBrew" className="h-7 mx-auto" />
          </Link>

          {status === 'loading' && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-display text-foreground">Logowanie przez Google…</h1>
                <p className="text-sm text-muted-foreground mt-1">Chwileczkę, weryfikujemy Twoje konto.</p>
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
                <h1 className="text-xl font-display text-foreground">Zalogowano!</h1>
                <p className="text-sm text-muted-foreground mt-1">Przekierowanie do panelu…</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-display text-foreground">Błąd logowania</h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{errorMsg}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => navigate('/login')}>
                  Wróć do logowania
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </GradientMeshBg>
  );
}
