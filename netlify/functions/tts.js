export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL' } = JSON.parse(event.body || '{}');
  if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'text required' }) };

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { statusCode: 503, body: JSON.stringify({ error: 'TTS not configured' }) };

  let res;
  try {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e) }) };
  }

  if (!res.ok) {
    const err = await res.text();
    return { statusCode: res.status, body: JSON.stringify({ error: err }) };
  }

  const buffer = await res.arrayBuffer();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(buffer.byteLength) },
    body: Buffer.from(buffer).toString('base64'),
    isBase64Encoded: true,
  };
};
