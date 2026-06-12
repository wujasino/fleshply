import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CORS = {
  'Access-Control-Allow-Origin': 'https://bitbrew.pl',
  'Content-Type': 'application/json',
};

function json(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

// Cryptographically random 6-digit code
function generateOtp() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1_000_000).padStart(6, '0');
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildEmail(otp) {
  // Load template at runtime — works in Netlify Functions bundled output
  try {
    const __dir = dirname(fileURLToPath(import.meta.url));
    const tpl = readFileSync(join(__dir, '../../src/email-templates/reset-password-otp.html'), 'utf8');
    return tpl.replace('{{OTP_CODE}}', otp);
  } catch {
    // Fallback plain HTML if template not found
    return `<p style="font-family:sans-serif;text-align:center;">
      <strong>Twój kod resetowania hasła BitBrew:</strong><br/>
      <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#D4A017;">${otp}</span><br/>
      <small>Wygasa za 10 minut.</small>
    </p>`;
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // Payload size guard
  if ((event.body?.length ?? 0) > 512) return json(400, { error: 'Payload too large' });

  let email;
  try {
    ({ email } = JSON.parse(event.body ?? '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json(400, { error: 'Invalid email' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Rate limit: max 3 OTPs per email per 10 minutes
  const { count } = await supabase
    .from('password_reset_otps')
    .select('*', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

  if (count >= 3) {
    return json(429, { error: 'Zbyt wiele prób. Spróbuj za 10 minut.' });
  }

  // Generate and store OTP
  const otp = generateOtp();
  const codeHash = await sha256(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: dbError } = await supabase
    .from('password_reset_otps')
    .insert({ email: normalizedEmail, code_hash: codeHash, expires_at: expiresAt });

  if (dbError) {
    console.error('DB insert error:', dbError.message);
    return json(500, { error: 'Błąd serwera. Spróbuj ponownie.' });
  }

  // Send via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'noreply@bitbrew.pl',
      to: normalizedEmail,
      subject: `${otp} — kod resetowania hasła BitBrew`,
      html: buildEmail(otp),
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error('Resend error:', err);
    return json(500, { error: 'Nie udało się wysłać e-maila. Spróbuj ponownie.' });
  }

  return json(200, { ok: true });
};
