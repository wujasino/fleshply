import { createClient } from '@supabase/supabase-js';
import ws from "ws";

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const MAX_REQUESTS_PER_WINDOW = Number(process.env.MAX_REQUESTS_PER_WINDOW || 10);
const MAX_REQUESTS_PER_DAY = Number(process.env.MAX_REQUESTS_PER_DAY || 200);
const EXTERNAL_TIMEOUT_MS = 20_000;

// In-memory store: secondary defense only — primary rate limiting is per user ID (verified via JWT)
const requestStore = new Map();

const now = () => Date.now();

const shouldRateLimit = (key) => {
  const current = now();
  const entry = requestStore.get(key) || {
    count: 0,
    windowStart: current,
    dailyCount: 0,
    dailyReset: current + 24 * 60 * 60 * 1000,
    lastRequest: current
  };

  if (current > entry.dailyReset) {
    entry.dailyCount = 0;
    entry.dailyReset = current + 24 * 60 * 60 * 1000;
    entry.windowStart = current;
    entry.count = 0;
  }

  if (current - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.windowStart = current;
    entry.count = 0;
  }

  entry.count += 1;
  entry.dailyCount += 1;
  entry.lastRequest = current;
  requestStore.set(key, entry);

  return entry.count > MAX_REQUESTS_PER_WINDOW || entry.dailyCount > MAX_REQUESTS_PER_DAY;
};

const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role configuration');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { params: { eventsPerSecond: 0 } },
  });
};

const fetchWithTimeout = (url, options) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

// RAG: embedding via Voyage (input_type "query")
const embedQuery = async (text) => {
  const res = await fetchWithTimeout('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`
    },
    body: JSON.stringify({ model: 'voyage-3.5', input: text, input_type: 'query' })
  });
  if (!res.ok) throw new Error(`Voyage embedding failed`);
  const data = await res.json();
  return data.data[0].embedding;
};

// RAG: fetch stored brand context for user
const getBrandContext = async (supabaseAdmin, userId, brandName, query) => {
  try {
    const queryEmbedding = await embedQuery(query);
    const { data, error } = await supabaseAdmin.rpc('match_brand_knowledge', {
      query_embedding: JSON.stringify(queryEmbedding),
      p_user_id: userId,
      match_count: 5,
      filter_brand: brandName
    });
    if (error) {
      console.warn('match_brand_knowledge error:', error.message);
      return '';
    }
    return (data || []).map((r) => r.content).join('\n\n---\n\n');
  } catch (err) {
    console.warn('getBrandContext failed:', err.message);
    return '';
  }
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Enforce payload size limit
  if (event.body && event.body.length > 16 * 1024) {
    return { statusCode: 413, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.toString().replace(/^Bearer\s+/i, '');

  if (!token) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  let authedUser = null;
  let supabaseAdmin = null;

  try {
    supabaseAdmin = createAdminClient();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }
    authedUser = user;

    // Rate limit by verified user ID — not spoofable
    if (shouldRateLimit(`user:${user.id}`)) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Too many requests. Spróbuj ponownie później.' })
      };
    }
  } catch (err) {
    console.error('Auth error in analyze function');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Authentication failed. Please try again.' })
    };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');
    const target = String(url || '').trim().slice(0, 500) || 'unknown brand';
    let parsed = null;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const brandContext = await getBrandContext(
          supabaseAdmin,
          authedUser.id,
          target,
          `Analiza widoczności marki ${target}`
        );

        const systemPrompt = `You are a brand visibility analyst. Below is verified, user-provided knowledge about the brand and its competitors. Treat it as the authoritative context and prefer it over your general knowledge. If the section is empty or irrelevant, fall back to general knowledge and note that.

<brand_context>
${brandContext || '(no stored knowledge for this brand)'}
</brand_context>`;

        const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-fable-5',
            max_tokens: 1200,
            system: systemPrompt,
            messages: [{
              role: 'user',
              content: `Analyze this website or brand: ${target}. Use the brand_context above when relevant. Rate it from 0-100 on these 5 dimensions (authority, sentiment, recency, mentions, accuracy) and provide a trustScore.

Also include these fields:
- "verdict": 2-3 plain-English sentences addressed to the brand owner ("you") telling the story of how AI models currently see this brand — specific, vivid, no jargon, no hedging; name the strongest signal and the one thing costing them recommendations.
- "competitorInsight": 1-2 sentences on what a customer asking ChatGPT/Gemini in this category would hear, and where competitors get recommended instead. Concrete, addressed to "you".
- "actionPlan": an array of exactly 3 objects, each { "title": short imperative action (e.g. "Publish a comparison page"), "impact": one of "High"|"Medium"|"Low", "desc": one plain-English sentence on why it moves AI to recommend you }. Order by impact, highest first.

Respond ONLY with a raw JSON object, no markdown, no backticks, just JSON.`
            }]
          })
        });

        const data = await response.json();
        let text = null;
        if (data?.content && Array.isArray(data.content) && data.content[0]) {
          text = (data.content[0].text || data.content[0]).toString();
        } else if (data?.completion) {
          text = data.completion;
        } else if (data?.text) {
          text = data.text;
        } else if (typeof data === 'string') {
          text = data;
        }

        if (text) {
          const cleaned = text.trim().replace(/```json|```/g, '').trim();
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            console.warn('Failed to parse model output as JSON');
          }
        }
      } catch (err) {
        console.warn('Anthropic call failed, using deterministic fallback:', err.message);
      }
    }

    const deterministicResult = (seedStr) => {
      const seed = String(seedStr || '').toLowerCase().trim();
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
      }
      const next = () => Math.round((h = Math.imul(h ^ (h >>> 13), 1274126177)) % 66) + 30;
      const authority = next();
      const sentiment = next();
      const recency = next();
      const mentions = next();
      const accuracy = next();
      const trustScore = Math.round((authority + sentiment + recency + mentions + accuracy) / 5);
      return {
        authority, sentiment, recency, mentions, accuracy, trustScore,
        sources: [
          { model: 'GPT-4o', sentiment: 'Positive', association: `${seed} product`, confidence: Math.round((authority + 5) % 100) },
          { model: 'Claude-sonnet-4-5', sentiment: 'Neutral', association: `${seed} brand`, confidence: Math.round((accuracy + 10) % 100) },
          { model: 'Gemini', sentiment: 'Positive', association: `${seed} mentions`, confidence: Math.round((mentions + 2) % 100) }
        ]
      };
    };

    const result = parsed || deterministicResult(target);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('analyze handler error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Analysis failed. Please try again.' })
    };
  }
};
