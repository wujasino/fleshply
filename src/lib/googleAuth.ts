import { supabase } from './supabase';

export async function signInWithGoogle(): Promise<void> {
  const siteUrl = import.meta.env.VITE_SITE_URL ?? window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
}

export default signInWithGoogle;