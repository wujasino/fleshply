import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ALLOWED_ORIGINS = ['https://bitbrew.pl', 'https://www.bitbrew.pl'];

function corsHeaders(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://bitbrew.pl';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function json(statusCode, body, event) {
  return { statusCode, headers: corsHeaders(event), body: JSON.stringify(body) };
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

// Inlined branded email — keeps the function self-contained (no filesystem reads)
function buildEmail(otp) {
  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f0f;"><tr><td align="center" style="padding:48px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;">
      <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #2a2a2a;text-align:center;">
        <div style="font-size:20px;font-weight:700;color:#F7F1DD;letter-spacing:-0.3px;">BitBrew</div>
        <div style="font-size:11px;color:#666;margin-top:2px;text-transform:uppercase;letter-spacing:1px;">AI Brand Intelligence</div>
      </td></tr>
      <tr><td style="padding:36px 40px 28px;">
        <div style="text-align:center;margin-bottom:28px;"><div style="display:inline-block;width:56px;height:56px;border-radius:14px;background-color:#1f1a0e;border:1px solid #D4A01740;text-align:center;line-height:56px;"><span style="font-size:26px;">🔑</span></div></div>
        <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#F7F1DD;text-align:center;letter-spacing:-0.3px;">Twój kod resetowania hasła</h1>
        <p style="margin:0 0 32px;font-size:14px;line-height:1.65;color:#888;text-align:center;">Wpisz poniższy kod na stronie BitBrew,<br/>aby ustawić nowe hasło.</p>
        <div style="text-align:center;margin-bottom:32px;"><div style="display:inline-block;background-color:#111;border:2px solid #D4A017;border-radius:14px;padding:20px 40px;">
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Kod jednorazowy</div>
          <div style="font-size:40px;font-weight:800;color:#D4A017;letter-spacing:10px;line-height:1;">${otp}</div>
        </div></div>
        <div style="text-align:center;margin-bottom:28px;"><span style="display:inline-block;background-color:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:8px 16px;font-size:12px;color:#555;">⏱ Kod wygasa za <strong style="color:#888;">10 minut</strong></span></div>
        <div style="border-top:1px solid #2a2a2a;margin:24px 0;"></div>
        <div style="background-color:#1a0e0e;border:1px solid #ef444430;border-radius:10px;padding:14px 16px;"><p style="margin:0;font-size:12px;color:#888;line-height:1.6;">🔒 <strong style="color:#f87171;">Nie prosiłeś o reset hasła?</strong> Zignoruj tę wiadomość — Twoje konto jest bezpieczne.</p></div>
      </td></tr>
      <tr><td style="padding:20px 40px 28px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0 0 10px;font-size:11px;color:#444;">Wiadomość wysłana automatycznie przez <a href="https://bitbrew.pl" style="color:#D4A017;text-decoration:none;">BitBrew</a></p>
        <div style="display:inline-flex;align-items:center;gap:6px;background-color:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:6px 12px;"><span style="font-size:13px;">🔒</span><span style="font-size:11px;color:#555;">Płatności zabezpieczone przez <strong style="color:#888;">Stripe</strong> · SSL 256-bit</span></div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(event) };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, event);

  if ((event.body?.length ?? 0) > 512) return json(400, { error: 'Payload too large' }, event);

  let email;
  try {
    ({ email } = JSON.parse(event.body ?? '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON' }, event);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json(400, { error: 'Invalid email' }, event);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Rate limit: max 3 OTPs per email per 10 minutes
  const { count } = await supabase
    .from('password_reset_otps')
    .select('*', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

  if (count >= 3) {
    return json(429, { error: 'Zbyt wiele prób. Spróbuj za 10 minut.' }, event);
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
    return json(500, { error: 'Błąd serwera. Spróbuj ponownie.' }, event);
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
    return json(500, { error: 'Nie udało się wysłać e-maila. Spróbuj ponownie.' }, event);
  }

  return json(200, { ok: true }, event);
};
