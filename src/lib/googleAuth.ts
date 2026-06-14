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
          renderButton: (el: HTMLElement, cfg: object) => void;
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

export async function signInWithGoogle(): Promise<void> {
  await loadGsi();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Brak VITE_GOOGLE_CLIENT_ID w zmiennych środowiskowych');

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
        reject(new Error('Google One Tap nie jest dostępny w tej przeglądarce. Spróbuj wyczyścić ciasteczka lub użyj innej przeglądarki.'));
      }
    });
  });
}

export default signInWithGoogle;
