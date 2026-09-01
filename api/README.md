# api.theaidocslab.com — Chat Backend

This is a small server that keeps your Groq API key secret while letting the demo page's chatbot get real AI answers. The browser never sees the key — it just asks this server a question, and this server (which does hold the key) asks Groq and passes the answer back.

## What's here

- `functions/chat.js` — the actual server code (a "Netlify Function" — a small program that only runs when someone calls it, so there's no server to keep running 24/7).
- `functions/track.js` — records a page visit every time someone loads the demo page (just the URL path and the referring site, nothing personal).
- `functions/stats.js` — a simple dashboard showing that traffic: today / this week / all-time, a 7-day chart, top pages, and top traffic sources. View it at `https://api.theaidocslab.com/stats`. It has no login — don't link to it publicly, just bookmark the URL.
- `functions/scrape.js` — lets a page ask a website's content to be scraped and summarized by an AI, using [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai)'s hosted Cloud API. Same secret-key-stays-on-the-server pattern as `chat.js`. Live at `https://api.theaidocslab.com/scrape`.
- `netlify.toml` — tells Netlify where the functions live and sets up short URLs (`/chat`, `/track`, `/stats`).
- `package.json` — lists `@netlify/blobs`, the storage Netlify gives every site for free, used here to remember visit counts between page loads.

## How to deploy this (one-time setup)

1. **Create a new site on Netlify** and point it at this `api/` folder specifically (not the whole repo) — in Netlify's site settings, set the "Base directory" to `api`.
2. **Add a custom domain**: in that site's settings, add `api.theaidocslab.com` as a custom domain, and add the DNS record Netlify gives you wherever `theaidocslab.com`'s DNS is managed.
3. **Add your API keys as environment variables** — this is the secure step, do this instead of ever pasting a key anywhere in chat or in a file:
   - Go to this Netlify site's **Site settings → Environment variables**
   - Add a variable named `GROQ_API_KEY` with your actual key as the value
   - (Optional) Add `GROQ_MODEL` if you want to use a different Groq model than the default (`llama-3.3-70b-versatile`) — check Groq's console for current available model names, since they change over time.
   - To enable `scrape.js`, also add `SGAI_API_KEY` — get one from [scrapegraphai.com](https://scrapegraphai.com) (their dashboard shows the key once you sign up for their Cloud API). Without this variable set, `/scrape` will respond with a 500 "Server not configured" error instead of breaking the deploy.
4. **Deploy.** Netlify will build and your function will be live at `https://api.theaidocslab.com/chat`.

Since `track.js`, `stats.js`, and `scrape.js` were added after the first deploy, this site needs to **redeploy** to pick them up — if it's connected to this GitHub repo, pushing to the branch should trigger that automatically. If not, trigger a manual deploy from the Netlify dashboard (Deploys → Trigger deploy). This deploy also needs to run `npm install` to pick up the new `@netlify/blobs` dependency — Netlify does this automatically when it sees `package.json`, no action needed on your part beyond redeploying.

## How the demo page uses this

`demo/live-demo-coach.html` is already wired to call `https://api.theaidocslab.com/chat`. If that call fails for any reason (not deployed yet, key missing, network issue), the page automatically falls back to its built-in scripted answers — so the demo never breaks, it just gets smarter once this backend is live.

`scrape.js` isn't wired into any page yet — it's a standalone endpoint ready for a future feature. To use it from any allowed page:

```js
const res = await fetch('https://api.theaidocslab.com/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    prompt: 'List the main products and their prices',
  }),
});
const { result } = await res.json();
```

Note: ScrapeGraphAI's public API surface (endpoint path, auth header name) can change — if `/scrape` starts returning 502s, check their current docs at https://docs.scrapegraphai.com and update the constants at the top of `functions/scrape.js`.

## Security notes

- API keys only ever live in Netlify's environment variables and this server-side code — never in the browser, never in git, never in chat.
- There's a basic rate limit on each function (20 messages/minute for chat, 10 requests/minute for scrape) to keep a single visitor from running up a large bill. It's a soft protection, not a hard guarantee — see the comment in each function for how to harden it further if this gets real traffic.
- Only your listed domains (in each function's `ALLOWED_ORIGINS`) are allowed to call it — add any new domain there before using it from a new site.
