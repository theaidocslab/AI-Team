# api.theaidocslab.com — Chat Backend

This is a small server that keeps your Groq API key secret while letting the demo page's chatbot get real AI answers. The browser never sees the key — it just asks this server a question, and this server (which does hold the key) asks Groq and passes the answer back.

## What's here

- `functions/chat.js` — the actual server code (a "Netlify Function" — a small program that only runs when someone calls it, so there's no server to keep running 24/7).
- `netlify.toml` — tells Netlify where the function lives and sets up a shorter URL (`/chat` instead of the longer default path).

## How to deploy this (one-time setup)

1. **Create a new site on Netlify** and point it at this `api/` folder specifically (not the whole repo) — in Netlify's site settings, set the "Base directory" to `api`.
2. **Add a custom domain**: in that site's settings, add `api.theaidocslab.com` as a custom domain, and add the DNS record Netlify gives you wherever `theaidocslab.com`'s DNS is managed.
3. **Add your Groq API key as an environment variable** — this is the secure step, do this instead of ever pasting the key anywhere in chat or in a file:
   - Go to this Netlify site's **Site settings → Environment variables**
   - Add a variable named `GROQ_API_KEY` with your actual key as the value
   - (Optional) Add `GROQ_MODEL` if you want to use a different Groq model than the default (`llama-3.3-70b-versatile`) — check Groq's console for current available model names, since they change over time.
4. **Deploy.** Netlify will build and your function will be live at `https://api.theaidocslab.com/chat`.

## How the demo page uses this

`demo/live-demo-coach.html` is already wired to call `https://api.theaidocslab.com/chat`. If that call fails for any reason (not deployed yet, key missing, network issue), the page automatically falls back to its built-in scripted answers — so the demo never breaks, it just gets smarter once this backend is live.

## Security notes

- The key only ever lives in Netlify's environment variables and this server-side code — never in the browser, never in git, never in chat.
- There's a basic rate limit (20 messages per minute per visitor) to keep a single visitor from running up a large bill. It's a soft protection, not a hard guarantee — see the comment in `chat.js` for how to harden it further if this gets real traffic.
- Only your listed domains (in `chat.js`'s `ALLOWED_ORIGINS`) are allowed to call this — add any new domain there before using it from a new site.
