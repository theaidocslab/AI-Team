// Server-side scraping backend: fetches a page's HTML directly, then asks
// Grok (xAI) to pull out whatever the caller asked for. No third-party
// scraping platform, no separate signup — just plain HTTP fetch + the same
// "keep the key on the server" pattern as chat.js.
//
// Trade-off vs. a managed scraper (e.g. ScrapeGraphAI): this only sees the
// HTML the server returns on first load. It won't work on pages that render
// their content with client-side JavaScript (React/Vue apps, infinite
// scroll, etc.) since there's no headless browser here.

const ALLOWED_ORIGINS = [
  'https://theaidocslabdemolandingpage.netlify.app',
  'https://demo.theaidocslab.com',
  'https://www.theaidocslab.com',
  'https://theaidocslab.com',
  'http://localhost:8888', // netlify dev
];

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// Cap how much page text we send to the model - keeps cost/latency bounded
// and avoids blowing the context window on huge pages.
const MAX_PAGE_CHARS = 40_000;
const FETCH_TIMEOUT_MS = 10_000;

const SYSTEM_PROMPT = `You extract information from raw webpage HTML based on the user's request. Respond with only the requested information - no preamble, no meta-commentary about the page or the HTML. If the requested information isn't present in the page, say so plainly instead of guessing.`;

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

// Strips scripts/styles/comments and tags, collapses whitespace, so the
// model sees readable text instead of paying for markup tokens.
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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

  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    console.error('GROK_API_KEY is not set in this environment');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  let pageText;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let pageResponse;
    try {
      pageResponse = await fetch(websiteUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIDocsLabScraper/1.0)' },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!pageResponse.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Could not fetch page (status ${pageResponse.status})` }) };
    }

    const contentType = pageResponse.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return { statusCode: 415, headers, body: JSON.stringify({ error: `Unsupported content type: ${contentType || 'unknown'}` }) };
    }

    const html = await pageResponse.text();
    pageText = htmlToText(html).slice(0, MAX_PAGE_CHARS);

    if (!pageText) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Page returned no readable content (it may require JavaScript to render)' }) };
    }
  } catch (err) {
    console.error('Page fetch error', err);
    const timedOut = err.name === 'AbortError';
    return { statusCode: 502, headers, body: JSON.stringify({ error: timedOut ? 'Fetching the page timed out' : 'Could not fetch the page' }) };
  }

  try {
    const grokResponse = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || 'grok-4-fast',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Page URL: ${websiteUrl}\n\nRequest: ${prompt}\n\nPage content:\n${pageText}` },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!grokResponse.ok) {
      const errText = await grokResponse.text();
      console.error('Grok API error', grokResponse.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream AI service error' }) };
    }

    const data = await grokResponse.json();
    const result = data.choices?.[0]?.message?.content?.trim()
      || 'No result returned.';

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    console.error('Scrape function error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
