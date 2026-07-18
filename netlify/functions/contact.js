/**
 * POST /.netlify/functions/contact
 * Body: { name, email, subject, message }
 * Saves to Supabase + sends email notification via Resend (optional)
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALLOWED_ORIGINS = new Set(['https://bitbrew.pl', 'https://www.bitbrew.pl']);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-zA-Z]{2,}$/;

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://bitbrew.pl',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
});

exports.handler = async (event) => {
  const origin = event.headers.origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (event.body && event.body.length > 8 * 1024) return { statusCode: 413, headers, body: JSON.stringify({ error: 'Payload too large' }) };

  let name, email, subject, message;
  try {
    ({ name, email, subject, message } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid name' }) };
  }
  if (!email || !EMAIL_RE.test(email.trim())) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message too short' }) };
  }

  const payload = {
    name: name.trim().slice(0, 120),
    email: email.trim().toLowerCase(),
    subject: (subject || '').trim().slice(0, 200) || 'Contact form',
    message: message.trim().slice(0, 4000),
    created_at: new Date().toISOString(),
  };

  // Save to Supabase
  const { error: dbError } = await supabase.from('contact_messages').insert(payload);
  if (dbError) {
    console.error('Contact DB error:', dbError.message);
    // Don't fail — still try email notification
  }

  // Optional: Resend email notification
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Perceply <noreply@perceply.pl>',
          to: ['kontakt@perceply.pl'],
          subject: `[Contact] ${payload.subject}`,
          text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
        }),
      });
    } catch {
      // Non-fatal
    }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};
