/**
 * POST /.netlify/functions/newsletter
 * Body: { email: string }
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Node < 22 has no native WebSocket — supabase-js inits Realtime eagerly.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALLOWED_ORIGINS = new Set(['https://presora.app', 'https://www.presora.app']);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestStore = new Map();
const getIp = (event) =>
  event.headers['x-nf-client-connection-ip'] ||
  event.headers['x-forwarded-for']?.split(',').pop()?.trim() ||
  'unknown';
const shouldRateLimit = (key) => {
  const current = Date.now();
  const entry = requestStore.get(key) || { count: 0, windowStart: current };
  if (current - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.windowStart = current;
    entry.count = 0;
  }
  entry.count += 1;
  requestStore.set(key, entry);
  return entry.count > MAX_REQUESTS_PER_WINDOW;
};

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://presora.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

// Stricter email regex: requires TLD of at least 2 chars
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-zA-Z]{2,}$/;

exports.handler = async (event) => {
  const origin = event.headers.origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (event.body && event.body.length > 4 * 1024) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  if (shouldRateLimit(getIp(event))) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { error: dbError } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: normalizedEmail, subscribed_at: new Date().toISOString() }, { onConflict: 'email' });

  if (dbError) {
    console.error('Newsletter DB error');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database error' }) };
  }

  // Optional: Mailchimp integration
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
    try {
      const dc = process.env.MAILCHIMP_API_KEY.split('-').pop();
      await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: normalizedEmail, status: 'subscribed' }),
      });
    } catch {
      // Non-fatal — subscriber is already saved in Supabase
    }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};
