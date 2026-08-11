# DemoExplainer — Voiceover Script

Timed to the scenes in `src/DemoExplainer.tsx` (70s total, 30fps, 2100 frames).
Generate one audio file per scene locally (Kokoro, ElevenLabs, or otherwise),
name them exactly as listed below, and drop them into `public/voiceover/`.
Each file should land at or under its scene's duration — a little short is
fine (it'll just go quiet before the next scene starts); longer will get
cut off when the next scene's Sequence begins.

| # | File | Scene start | Duration | Line |
|---|---|---|---|---|
| 1 | `01-hook.wav` | 0:00 | 6s | "Your landing page should be selling — while you sleep." |
| 2 | `02-problem.wav` | 0:06 | 8s | "Most coaches and consultants have no landing page — or one that isn't generating leads." |
| 3 | `03-solution.wav` | 0:14 | 8s | "The AI Docs Lab builds you a custom, AI-powered landing page — built and delivered in forty-eight hours." |
| 4 | `04-features.wav` | 0:22 | 18s | "You get a twenty-four seven AI chatbot, trained on your business. A page built to be found by ChatGPT, Claude, and Perplexity — not just Google. And lead capture and booking, built in from day one." |
| 5 | `05-proof.wav` | 0:40 | 10s | "See it live. A real, working page with a real AI chatbot you can talk to right now — at demo dot the-ai-docs-lab dot com." |
| 6 | `06-offer.wav` | 0:50 | 10s | "Four hundred ninety-seven dollars. One time. No monthly software fees. You own it. Every application is reviewed personally within twenty-four hours." |
| 7 | `07-cta.wav` | 1:00 | 10s | "Apply today, and see your page in forty-eight hours — at demo dot the-ai-docs-lab dot com." |

## Notes for recording

- Say "the AI Docs Lab" as three separate words ("A-I Docs Lab"), not "aidocslab" run together.
- "demo.theaidocslab.com" should be read as "demo dot the ai docs lab dot com" — spell it out, don't run it together as one word (this tripped up TTS on the earlier lead-form video, per the fix commits in `claude/local-folder-setup-h66dsx`).
- Voice should be confident, direct, no hype — matches the brand voice (Master Marketing Copywriter tone, no fluff).
- Any format works (wav/mp3) — tell me what you generate and I'll wire it in as-is.

## Once you have the files

Send me the audio files (or drop them somewhere I can fetch), and I'll:
1. Add them to `public/voiceover/`
2. Wire each one into its Sequence in `DemoExplainer.tsx` via `<Audio src={staticFile(...)} />`
3. Re-render and verify the full 70s cut with sound
