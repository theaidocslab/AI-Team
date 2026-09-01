// Server-side scraping backend using ScrapeGraphAI's hosted SmartScraper API.
// The SGAI API key lives only here, in Netlify's environment variables —
// it is never sent to or readable by the browser.
//
// ScrapeGraphAI (https://github.com/ScrapeGraphAI/Scrapegraph-ai) is an
// LLM-powered scraper. Rather than running their Python library (which needs
// Playwright + its own LLM key) inside a Netlify function, this calls their
// managed Cloud API over plain HTTP, the same way chat.js calls Groq.
// Docs: https://docs.scrapegraphai.com — verify the endpoint path and auth
// header there if ScrapeGraphAI changes their API surface.

const ALLOWED_ORIGINS = [
  'https://theaidocslabdemolandingpage.netlify.app',
  'https://demo.theaidocslab.com',
  'https://www.theaidocslab.com',
  'https://theaidocslab.com',
  'http://localhost:8888', // netlify dev
];

const SCRAPEGRAPH_API_URL = 'https://api.scrapegraphai.com/v1/smartscraper';

// Best-effort in-memory rate limit. Resets on cold start and isn't shared
// across concurrent function instances - it's a speed bump against casual
// abuse, not a hard guarantee.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
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

  const websiteUrl = typeof payload.url === 'string' ? payload.url.trim() : '';
  const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';

  if (!websiteUrl || !/^https?:\/\//i.test(websiteUrl)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing or invalid "url" field (must start with http:// or https://)' }) };
  }
  if (!prompt) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing "prompt" field (describe what to extract from the page)' }) };
  }
  if (prompt.length > 500) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Prompt too long (max 500 characters)' }) };
  }

  const apiKey = process.env.SGAI_API_KEY;
  if (!apiKey) {
    console.error('SGAI_API_KEY is not set in this environment');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  try {
    const sgaiResponse = await fetch(SCRAPEGRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'SGAI-APIKEY': apiKey,
      },
      body: JSON.stringify({
        website_url: websiteUrl,
        user_prompt: prompt,
      }),
    });

    if (!sgaiResponse.ok) {
      const errText = await sgaiResponse.text();
      console.error('ScrapeGraphAI API error', sgaiResponse.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream scraping service error' }) };
    }

    const data = await sgaiResponse.json();

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: data.result ?? data }),
    };
  } catch (err) {
    console.error('Scrape function error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
