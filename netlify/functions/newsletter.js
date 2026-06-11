/**
 * POST /.netlify/functions/newsletter
 * Body: { email: string }
 *
 * Saves the subscriber to a Supabase `newsletter_subscribers` table.
 * Optional: set MAILCHIMP_API_KEY + MAILCHIMP_LIST_ID to also add to Mailchimp.
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  // Upsert to Supabase (idempotent — duplicate subscribes are fine)
  const { error: dbError } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: 'email' });

  if (dbError) {
    console.error('DB error:', dbError);
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
        body: JSON.stringify({ email_address: email, status: 'subscribed' }),
      });
    } catch (err) {
      console.warn('Mailchimp sync failed (non-fatal):', err);
    }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};
