const VOICE_ID = 'gUABw7pXQjhjt0kNFBTF';
const MODEL_ID  = 'eleven_turbo_v2_5';

export default async function handler(req, res) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const text = req.query.text;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim();
  if (!apiKey) return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.0, use_speaker_boost: true },
        }),
      }
    );

    if (!upstream.ok) {
      const msg = await upstream.text();
      return res.status(upstream.status).json({ error: msg });
    }

    const buf = await upstream.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.end(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
