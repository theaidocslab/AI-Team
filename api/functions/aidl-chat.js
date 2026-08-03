// Server-side chat backend for the Sovereign Standard landing page.
// The Groq API key and the system prompt (full pricing/offer detail) live
// only here — never sent to or readable by the browser.

const ALLOWED_ORIGINS = [
  'https://theaidocslabdemolandingpage.netlify.app',
  'https://demo.theaidocslab.com',
  'https://theaidocslab.com',
  'https://www.theaidocslab.com',
  'http://localhost:8888', // netlify dev
];

const SYSTEM_PROMPT = `You are the AI assistant for The AI Docs Lab™, on a demo landing page showing coaches, attorneys, and contractors what their AI-powered site could look like.

Answer questions directly and helpfully using this knowledge:

SERVICES & PRICING (all one-time, no subscriptions):
- Quick Win (Simple Tool): $297 — single-function browser-based AI tool, delivered in 24 hours
- Coaching Landing Page: $497 — custom AI landing page, conversion copy, 24/7 trained chatbot, lead capture, delivered in 48 hours
- Full System (Medium Tool): $497 — multi-feature AI tool or funnel system, delivered in 48 hours
- Enterprise Grade: starting at $997 — full WordPress site + chatbot + lead capture + SEO, delivered in 72 hours
- Full website builds range $497–$2,997 depending on scope (Starter/Signature/Premium tiers)
- AI Chatbot Retainer: $49–97/month — the one recurring offer, since ongoing chatbot management requires active upkeep

PHILOSOPHY — The Sovereign Standard™:
- Buy once, own it forever. No subscriptions, no monthly platform fees, no vendor lock-in.
- Everything is browser-based with zero cloud dependency where possible.
- Founded by Dr. Eric Townsend, PhD — 20+ years of operational leadership before building AI systems. He builds every system personally.

PROCESS: Free 30-minute discovery call → Build → Delivered fully documented, ready to run, fully owned by the client.

TONE: Confident, direct, no jargon, no fake urgency or fake scarcity. If someone asks something genuinely custom (specific technical architecture for their exact business, contract terms, or anything requiring Dr. Eric's personal judgment), tell them honestly and offer to book a Strategy Call — but only for those cases, not as a default deflection. Keep answers to 2-3 sentences.`;

// Best-effort in-memory rate limit. Resets on cold start and isn't shared
// across concurrent function instances - it's a speed bump against casual
// abuse, not a hard guarantee.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitLog.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitLog.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const clientIp = event.headers['x-nf-client-connection-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
  if (isRateLimited(clientIp)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests - slow down and try again shortly.' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing "message" field' }) };
  }
  if (message.length > 500) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message too long (max 500 characters)' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set in this environment');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        max_tokens: 300,
        temperature: 0.6,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error', groqResponse.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream AI service error' }) };
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim()
      || "Sorry, I didn't catch that - could you try asking again?";

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error('Chat function error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
