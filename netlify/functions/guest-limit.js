import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Node < 22 has no native WebSocket — supabase-js inits Realtime eagerly.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

const GUEST_LIMIT = 3;

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Netlify's trusted header — cannot be spoofed by client
const getIp = (event) =>
  event.headers['x-nf-client-connection-ip'] ||
  event.headers['x-forwarded-for']?.split(',').pop()?.trim() ||
  'unknown';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = getIp(event);
  if (ip === 'unknown') {
    // Can't identify — allow but don't consume
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ allowed: true, remaining: 1 }) };
  }

  // Upsert: increment count atomically
  const { data, error } = await supabase.rpc('increment_guest_limit', { p_ip: ip });

  if (error) {
    console.error('guest-limit RPC error:', error.message);
    // Fail open — don't block user if DB is down
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ allowed: true, remaining: 1 }) };
  }

  const count = data ?? 1;
  const allowed = count <= GUEST_LIMIT;
  const remaining = Math.max(0, GUEST_LIMIT - count);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ allowed, remaining, count }),
  };
};
