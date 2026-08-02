const { getStore } = require('@netlify/blobs');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

exports.handler = async () => {
  try {
    const store = getStore('analytics');
    const total = parseInt((await store.get('total')) || '0', 10);
    const eventsRaw = await store.get('events');
    const events = eventsRaw ? JSON.parse(eventsRaw) : [];

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * oneDay);
      const key = d.toISOString().slice(0, 10);
      const count = parseInt((await store.get(`day:${key}`)) || '0', 10);
      last7.push({ date: key.slice(5), count });
    }
    const today = last7[last7.length - 1].count;
    const thisWeek = last7.reduce((a, b) => a + b.count, 0);

    const pageCounts = {};
    const refCounts = {};
    for (const e of events) {
      pageCounts[e.path] = (pageCounts[e.path] || 0) + 1;
      let ref = '(direct)';
      if (e.referrer) {
        try { ref = new URL(e.referrer).hostname; } catch { ref = e.referrer; }
      }
      refCounts[ref] = (refCounts[ref] || 0) + 1;
    }
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topRefs = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxDay = Math.max(1, ...last7.map((d) => d.count));

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>AI Docs Lab — Demo Page Analytics</title>
<meta name="robots" content="noindex, nofollow">
<style>
body{background:#0A0A0A;color:#EDEDED;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:32px;}
h1{color:#D4AF37;font-size:20px;margin:0 0 24px;}
.stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:32px;}
.stat{background:#151515;border:1px solid #2a2a2a;border-radius:8px;padding:16px 24px;min-width:100px;text-align:center;}
.stat .num{font-size:28px;font-weight:800;color:#D4AF37;}
.stat .label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;}
.section{margin-bottom:32px;max-width:600px;}
.section h2{font-size:13px;color:#D4AF37;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #2a2a2a;padding-bottom:8px;}
.bar-row{display:flex;align-items:center;gap:12px;margin:6px 0;font-size:13px;}
.bar-label{width:50px;color:#999;}
.bar-track{flex:1;background:#1a1a1a;border-radius:4px;overflow:hidden;height:16px;}
.bar-fill{background:#D4AF37;height:100%;}
.bar-count{width:30px;text-align:right;color:#ccc;}
table{width:100%;border-collapse:collapse;font-size:13px;}
td,th{padding:6px 8px;border-bottom:1px solid #2a2a2a;text-align:left;color:#ccc;}
th{color:#999;text-transform:uppercase;font-size:11px;}
.note{color:#777;font-size:12px;margin-top:24px;max-width:600px;}
</style></head>
<body>
<h1>⚡ AI Docs Lab — Demo Page Analytics</h1>
<div class="stats">
<div class="stat"><div class="num">${today}</div><div class="label">Today</div></div>
<div class="stat"><div class="num">${thisWeek}</div><div class="label">This Week</div></div>
<div class="stat"><div class="num">${total}</div><div class="label">All Time</div></div>
</div>
<div class="section">
<h2>Visitors — Last 7 Days</h2>
${last7.map((d) => `<div class="bar-row"><div class="bar-label">${d.date}</div><div class="bar-track"><div class="bar-fill" style="width:${((d.count / maxDay) * 100).toFixed(0)}%"></div></div><div class="bar-count">${d.count}</div></div>`).join('')}
</div>
<div class="section">
<h2>Top Pages</h2>
<table><tr><th>Path</th><th>Views</th></tr>
${topPages.map(([p, c]) => `<tr><td>${escapeHtml(p)}</td><td>${c}</td></tr>`).join('') || '<tr><td colspan="2">No data yet</td></tr>'}
</table>
</div>
<div class="section">
<h2>Traffic Sources</h2>
<table><tr><th>Source</th><th>Visits</th></tr>
${topRefs.map(([r, c]) => `<tr><td>${escapeHtml(r)}</td><td>${c}</td></tr>`).join('') || '<tr><td colspan="2">No data yet</td></tr>'}
</table>
</div>
<p class="note">This page has no login — anyone with the URL can view it. Don't link to it publicly. Tracks page loads on the demo page only (path + referring domain, no personal data).</p>
</body></html>`;

    return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'text/plain' }, body: 'Stats error: ' + err.message };
  }
};
