---
format: 1080x1920
duration: 43s
message: "Never miss a lead again — your AI lead capture form works 24/7, auto-qualifies, and books faster."
arc: Feature-Benefit Cascade — Hook → Pain → Product Intro → Benefit ×4 → CTA
audience: coaches, consultants, and service professionals
music: upbeat, attention-grabbing modern electronic underscore, driving but not overpowering the voiceover
mode: autonomous
---

## Video direction

- **Palette system** (from `frame.md`): `bg-primary` #FFFFFF is the ground for every frame except Frame 1/2 (pain half), which sit on `text-primary` #0A0A0A per Cartesian's cover/pain-canvas convention; `text-primary` #0A0A0A ink for headlines and the one `horizontal-accent` line; `text-secondary` #5A5A5A (Raleway) for body/VO-support copy; `accent`/`line` #E8C97A / #C9A84C (gold) for labels, hairlines, the form's active-state glow, and the logo mark; `bg-secondary` #EEE3C5 only for placeholder/backdrop fills. No populist accent beyond the brand gold — never introduce a second hue.
- **Motion grammar + reveal model**: long-tail `power3` eases everywhere (no bounce). Every frame reveals paced to its VO cue — nothing appears before the voiceover names it. Held beats stay still (subtle jitter at most); no lazy breathing, no forced drift.
- **Cartesian restraint constrains every blueprint beat**: even mid-motion, keep zero drop-shadow, zero rounded rectangles (circles only), 1px hairlines as the only structural device, and generous negative space (55–60% empty on declarative frames). A blueprint's own busier reference (dense card grids, heavy glows) gets thinned to this palette — restraint wins over the blueprint's stock density.
- **Rhythm / held-frame allocation**: Frame 1 and Frame 8 (final ~40%) are the deliberate held/breather beats. Frames 3–7 stay in continuous, VO-paced motion — busier at the center, calm at the open and close.
- **Negative list**: no bokeh/purple-blue "AI" gradients, no stock-photo aesthetics, no browser chrome/real cursors beyond the one custom brand-colored cursor in Frame 5, no nav bars/footers/scrollbars. Avoid both failure modes: slideshow (front-load-then-freeze) and screensaver (independent floating elements with no hierarchy).
- **Caption band**: bottom ~17% reserved on every frame regardless of caption state.

## Frame 1 — The ones you never saw

- scene: Bare black canvas. A quiet visitor-count number ticks, then most of it fades to gray — the ones who left.
- voiceover: "Somebody visited your site last night. Did you know?"
- duration: 3.2s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Pain validation
- beat: tension
- blueprint: dataviz-countup
- focal: (typography/data only — no captured asset; render the counter itself as the hero)
- roles: counter = cutout (foreground subject) · backdrop = background (flat `text-primary` #0A0A0A, no bleed)

Adapt: keep the single-stat count-up signature, but instead of an impressive scale claim, the stat quietly UNDERCUTS itself — the count climbs then most of its own digits dim, dramatizing "most of them just leave" rather than "look how big this number is."

Scene 1 (0.0–1.6s): flat `text-primary` ground, centered. A bold `display`-scale numeral (bg-primary white ink, Raleway tabular figures) counts up from 0, quick and clean (power3), as if counting site visitors — Centered, ~35% of frame, ~60% negative space.
Scene 2 (1.6–2.8s): on "Did you know?", the counted numeral SPLITS visually — most of its digits dim to `text-secondary` gray (representing visitors who left unseen) while one digit-group stays gold-lit at `accent` #E8C97A — a single thin gold hairline underlines only the lit group. No camera move.
Scene 3 (2.8–4.0s): hold. The dimmed majority stays static; the one gold-lit fragment holds a barely-perceptible glow pulse (subtle jitter only) — the held read that closes the hook.

## Frame 2 — A form that barely tries

- scene: A generic, bare "Name / Email" field pair sits alone, unremarkable, easy to ignore.
- voiceover: "A plain contact form barely gets a name and an email. No context. No qualifying. Just noise."
- duration: 7.488s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-pain.html
- type: pain_point
- persuasion: Pain agitation
- beat: frustration
- blueprint: kinetic-type-beats
- focal: (typography + one plain form artifact, no captured asset)
- roles: bare-form = cutout · pain-labels = supporting

Adapt: keep the "pain lands alone on a bare canvas" signature, but anchor it to one visual artifact (a bare two-field form) instead of pure text, so the pain reads concretely rather than abstractly.

Scene 1 (0.0–1.4s): flat `text-primary` ground. A plain, unstyled two-field card (`card` component, 1px `line` hairline border, no fill beyond faint white-overlay) fades in dead-center: "Name" / "Email" labels only, no other chrome — Centered, ~30% of frame, deliberately unimpressive.
Scene 2 (1.4–2.6s): as the VO says "No context," a small taupe `label` reading "NO CONTEXT" hard-cuts in just below the card, left-aligned to the card's edge; at "No qualifying," a second label "NO QUALIFYING" replaces it with an instant cut (no fade/slide, per the blueprint's token-swap discipline).
Scene 3 (2.6–4.0s): at "Just noise," the labels clear and the bare form card itself fades to 50% opacity — a visual shrug — and holds still to the cut.

## Frame 3 — Introducing the AI lead capture form

- scene: The AI Docs Lab gold lightning-bolt mark assembles on black, then the form title locks in.
- voiceover: "Meet the AI lead capture form — built into every AI Docs Lab page."
- duration: 5.141s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-product-intro.html
- type: product_intro
- persuasion: Negative contrast
- beat: relief
- blueprint: logo-assemble-lockup
- asset_candidates: assets/logo-icon.svg — the brand's gold lightning-bolt mark on black
- focal: assets/logo-icon.svg
- roles: logo-icon.svg = cutout (foreground hero mark) · tagline = supporting

Reproduce: companion tagline types to set context, the mark pops in beside it, tagline exits as the camera pushes in to a held close-up on the mark — the section-boundary turn from Frame 2's pain.

Scene 1 (0.0–1.2s): flat `bg-primary` white ground (the contrast turn from Frame 2's black). "Meet the AI lead capture form" TYPES in centered, Raleway body-scale, `text-primary` ink, one `label` eyebrow above it reading "INTRODUCING" in `accent` gold — Stacked top: headline occupies the top third, clear space below (per Cartesian's 9:16 cover behavior: headline top, mark below).
Scene 2 (1.2–2.4s): as "built into every" plays, `assets/logo-icon.svg` (the gold bolt-on-black mark) pops in centered in the lower two-thirds, small, with a light spring-scale (power3, minimal overshoot per Cartesian's no-bounce rule — read as a clean settle, not a bounce).
Scene 3 (2.4–4.0s): on "AI Docs Lab page," the tagline text exits (fade + slight upward slide), the layout recenters, and the camera pushes IN on the mark to a held close-up, centered — one `geo-ring` (dashed, ~30cqw, 20% opacity) drifts in behind it for atmosphere. Holds static to the zoom-through transition out.

## Frame 4 — Working while you sleep

- scene: A live form mockup sits on screen with a subtle "always on" pulse; a clock quietly advances through night hours behind it.
- voiceover: "It's live 24/7 — qualifying leads while you sleep."
- duration: 4.373s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-benefit-247.html
- type: benefit_highlight
- persuasion: Feature-to-benefit translation
- beat: control
- blueprint: device-surface-showcase
- focal: (reconstructed form surface — real fields from `capture/extracted/visible-text.txt`, no captured screenshot exists)
- roles: form-surface = cutout · time-indicator = supporting · backdrop = background

Adapt: keep the static-tour signature (surface slides in and settles, camera stays static, all motion is element-level) but the "screen advance" this beat performs is a background day→night sweep rather than a UI screen change — dramatizing "24/7" through time passing, not through a feature click.

Scene 1 (0.0–1.5s): the real lead-capture-form card (Cartesian `card`: 1px `line` border, white-overlay fill, the form's own field labels visible but empty/idle) slides up from below and settles center — Centered, ~45% of frame, ~3 depth layers (backdrop, card, label chrome).
Scene 2 (1.5–3.0s): as "24/7" lands, a thin horizontal `label` strip along the top edge sweeps left→right through a simple light→dark gradient (day into night), while a small dot indicator on the card's corner pulses steadily (`accent` gold, slow sine-wave breathing — the "always on" signal). No camera move.
Scene 3 (3.0–4.5s): on "qualifying leads while you sleep," the backdrop settles into its darkest state and holds; the corner pulse continues its steady breathing (the only motion allowed in the hold) as the frame reads still.

## Frame 5 — It asks the right questions

- scene: The form's real fields fill in one after another — niche, ideal client, offer, then the "biggest lead generation problem" dropdown opens and selects an option.
- voiceover: "Niche. Ideal client. Their offer. Their biggest problem — it asks before you ever have to."
- duration: 5.909s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-benefit-qualify.html
- type: benefit_highlight
- persuasion: Show-don't-tell proof
- beat: clarity
- blueprint: cursor-ui-demo
- focal: (reconstructed form surface, real field copy from `capture/extracted/visible-text.txt`)
- roles: form-surface = cutout · cursor = supporting (the protagonist) · backdrop = background

Reproduce: one specific multi-step workflow (typing through the form's real qualifying fields) shown end-to-end across 4 discrete beats, each a real edit the surface answers live, camera chasing the custom cursor, landing locked on the final selected dropdown option. Vertical note: the form card's natural stacked-field layout fits the 9:16 canvas directly — no asymmetric split needed.

Scene 1 (0.0–1.1s): the lead-capture-form card is already on screen (carried from Frame 4's world via the crossfade); a custom gold-accented cursor enters and clicks into the "Your niche or specialty" field — Centered, ~45% of frame.
Scene 2 (1.1–2.3s): on "Niche," the field types in "Business mindset coaching" letter-by-letter (a real placeholder from the captured copy); camera performs a small push-in toward that field region.
Scene 3 (2.3–3.4s): on "Ideal client. Their offer," the cursor whip-pans down to the next two fields in quick succession — "Who is your ideal client?" fills with "Women 35–50 who feel stuck in their careers," then "Your main offer & price" fills with "90-day coaching program — $2,500" — each a discrete typed beat, camera chasing the cursor down the card.
Scene 4 (3.4–5.0s): on "their biggest problem," the cursor clicks the "Biggest lead generation problem" dropdown; it springs open (Cartesian: flat, 1px hairline border, no shadow) listing the real options, the cursor selects "My page exists but generates zero leads," the dropdown closes on the choice. Camera settles static, holds on the completed field.

## Frame 6 — Straight onto your calendar

- scene: The booking-link field is filled, then the frame pivots to a calendar surface where a slot instantly fills.
- voiceover: "The moment they submit — it's already on your calendar."
- duration: 3.2s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-benefit-booking.html
- type: benefit_highlight
- persuasion: Friction reduction
- beat: ease
- blueprint: video-text-pivot
- focal: (reconstructed form + calendar surfaces, no captured asset)
- roles: booking-field = cutout (Scene 1) · calendar-slot = cutout (Scene 2, same anchor)

Adapt: the blueprint's "product video" is instead the booking-link form field (a static surface, not real video) — it slides aside into the exact space a calendar surface now fills, keeping the weight-transfer signature as one event, not two; the piece skips the blueprint's Scene 3/4 kinetic-text pivot since the VO is already a single clean line.

Scene 1 (0.0–1.6s): the "Your booking link" field (from the same form card) is centered, holding its real placeholder "calendly.com/yourname" — Centered, ~35% of frame, calm hold as the VO opens.
Scene 2 (1.6–3.4s): on "it's already," the field SLIDES aside (x + scale-down, power3) into the space a calendar surface now fills, appearing at the exact same anchor — one weight-transfer reading as a single event. The calendar shows a simple week grid (Cartesian hairline rules only, no fill blocks) with one slot that snaps to a filled `accent` gold state as it enters.
Scene 3 (3.4–4.5s): hold. The filled calendar slot reads clean and still; a thin `horizontal-accent` ink line draws once beneath it and stays — the frame's single ink accent, used sparingly per Cartesian's rule.

## Frame 7 — What that actually adds up to

- scene: Three short value phrases flash and clear in rapid succession over a plain black field.
- voiceover: "Higher conversion. Zero manual entry. Calls that are already qualified."
- duration: 5.12s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-benefit-montage.html
- type: benefit_highlight
- persuasion: Value stacking
- beat: confidence
- blueprint: kinetic-type-beats
- focal: (typography only, no asset)
- roles: (none — pure type beat)

Adapt: keep the staccato flash-clear signature (Sub-shape B, multi-beat statement build) but scaled down to this beat's 3 phrases instead of the blueprint's usual 8–12 — each phrase still hard-cuts in and clears before the next, at a brisk but not frantic tempo matched to the 3 VO cues.

Scene 1 (0.0–1.4s): flat `text-primary` ground. "HIGHER CONVERSION" hard-cuts in dead-center (`display`-scale, Playfair, ink-on-white-card or reversed to bg-primary on dark — pick reversed-on-dark per this frame's ground), no fade/slide — Centered, ~50% of frame, ~55% negative space.
Scene 2 (1.4–2.9s): hard cut clears it; "ZERO MANUAL ENTRY" replaces it at the same center anchor, same treatment.
Scene 3 (2.9–4.5s): hard cut clears it; "CALLS THAT ARE ALREADY QUALIFIED" lands at center and HOLDS to the end (no further clear) — the longest-held of the three, since it's the beat that pays off the whole cascade.

## Frame 8 — Get yours

- scene: The gold mark locks into a closing lockup; the $497 offer and URL resolve beneath it.
- voiceover: "Your AI lead capture form — part of the $497 Coaching Landing Page. Live in 48 hours."
- duration: 8.256s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/08-cta.html
- type: cta
- persuasion: Risk reversal
- beat: urgency-to-act
- blueprint: logo-assemble-lockup
- asset_candidates: assets/logo-icon.svg — the brand's gold lightning-bolt mark on black
- focal: assets/logo-icon.svg
- roles: logo-icon.svg = cutout (foreground hero mark) · offer-line = supporting

Reproduce: keep the calm text-clear-bloom signature (fits Cartesian's restraint better than a fast push-through) — a centered claim holds, clears to blank, the mark spring-blooms from zero, slides left as the wordmark/offer reveals right, and the balanced lockup holds to the end (the video's longest held beat, per Video Direction).

Scene 1 (0.0–1.3s): flat `bg-primary` ground. "Your AI lead capture form" holds centered, Raleway body-scale, `text-secondary` — a calm, serif-adjacent claim per the blueprint's tagline beat.
Scene 2 (1.3–2.2s): the CLEAR — the line exits (shrink-toward-center + fade), leaving a blank frame for a beat.
Scene 3 (2.2–3.2s): on "$497 Coaching Landing Page," `assets/logo-icon.svg` spring-blooms from ZERO at dead center (power3, minimal overshoot); "$497 · Coaching Landing Page" reveals stacked BELOW it (not to the side — per Cartesian's 9:16 closing-plate behavior: centered in ring, vertically stacked) in `label`-scale gold uppercase tracking.
Scene 4 (3.2–4.5s): on "Live in 48 hours," a small `attribution`-scale line settles beneath that, reading "LIVE IN 48 HOURS." The whole vertically-stacked lockup holds dead static — the video's longest hold — to the end of the clip.
