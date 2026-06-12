import { createClient } from '@supabase/supabase-js';

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

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  if ((event.body?.length ?? 0) > 512) return json(400, { error: 'Payload too large' });

  let email, code;
  try {
    ({ email, code } = JSON.parse(event.body ?? '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  if (!email || !code || !/^\d{6}$/.test(code)) {
    return json(400, { error: 'Nieprawidłowe dane' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const codeHash = await sha256(code);

  // Find a valid, unused OTP for this email
  const { data: rows, error: dbError } = await supabase
    .from('password_reset_otps')
    .select('id, expires_at, used_at')
    .eq('email', normalizedEmail)
    .eq('code_hash', codeHash)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (dbError) {
    console.error('DB query error:', dbError.message);
    return json(500, { error: 'Błąd serwera.' });
  }

  if (!rows || rows.length === 0) {
    return json(400, { error: 'Nieprawidłowy lub wygasły kod.' });
  }

  const record = rows[0];

  // Check expiry
  if (new Date(record.expires_at) < new Date()) {
    return json(400, { error: 'Kod wygasł. Wyślij nowy.' });
  }

  // Mark as used (one-time use)
  await supabase
    .from('password_reset_otps')
    .update({ used_at: new Date().toISOString() })
    .eq('id', record.id);

  // Generate a Supabase password reset link so the frontend can complete the flow
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: normalizedEmail,
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error('Generate link error:', linkError?.message);
    return json(500, { error: 'Błąd generowania linku. Spróbuj ponownie.' });
  }

  return json(200, {
    ok: true,
    resetUrl: linkData.properties.action_link,
  });
};
