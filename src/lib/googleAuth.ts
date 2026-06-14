import { supabase } from './supabase';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (res: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (cb?: (n: { isNotDisplayed(): boolean; isSkippedMoment(): boolean }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[src*="accounts.google.com/gsi"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function signInWithGis(clientId: string): Promise<void> {
  await loadGsi();
  return new Promise((resolve, reject) => {
    window.google!.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
      callback: async ({ credential }) => {
        try {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: credential,
          });
          if (error) throw error;
          resolve();
        } catch (err) {
          reject(err);
        }
      },
    });

    window.google!.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        reject(new Error('__ONETAP_UNAVAILABLE__'));
      }
    });
  });
}

async function signInWithRedirect(): Promise<void> {
  const siteUrl = import.meta.env.VITE_SITE_URL ?? window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/dashboard`,
    },
  });
  if (error) throw error;
}

export async function signInWithGoogle(): Promise<void> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  if (clientId) {
    try {
      await signInWithGis(clientId);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      // One Tap unavailable — fall back to redirect flow
      if (msg === '__ONETAP_UNAVAILABLE__') {
        await signInWithRedirect();
        return;
      }
      throw err;
    }
  }

  // No Client ID configured — use redirect flow as fallback
  await signInWithRedirect();
}

export default signInWithGoogle;
