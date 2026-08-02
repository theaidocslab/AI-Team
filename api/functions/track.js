const { getStore } = require('@netlify/blobs');

// Same domains the chatbot is allowed to call from — keep in sync with chat.js
const ALLOWED_ORIGINS = [
  'https://theaidocslabdemolandingpage.netlify.app',
  'https://demo.theaidocslab.com',
  'https://www.theaidocslab.com',
  'https://theaidocslab.com',
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
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

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const path = typeof payload.path === 'string' ? payload.path.slice(0, 200) : '/';
  const referrer = typeof payload.referrer === 'string' ? payload.referrer.slice(0, 200) : '';

  try {
    const store = getStore('analytics');
    const today = new Date().toISOString().slice(0, 10);

    const total = parseInt((await store.get('total')) || '0', 10) + 1;
    await store.set('total', String(total));

    const dayKey = `day:${today}`;
    const dayCount = parseInt((await store.get(dayKey)) || '0', 10) + 1;
    await store.set(dayKey, String(dayCount));

    const eventsRaw = await store.get('events');
    const events = eventsRaw ? JSON.parse(eventsRaw) : [];
    events.unshift({ path, referrer, t: Date.now() });
    await store.set('events', JSON.stringify(events.slice(0, 300)));

    return { statusCode: 204, headers, body: '' };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Tracking failed' }) };
  }
};
