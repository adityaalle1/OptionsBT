# TODOS

Deferred work not in the current Phase 3 scope. Each item should be picked up when the stated condition is met.

---

## T1 — Customer discovery: 5 trader interviews (BLOCKS Tier 2)

**What:** Talk to 5 active day traders (Thinkorswim, tastytrade, or Webull users). Ask one question: "What makes you nervous about trying options for the first time?"

**Why:** Answers determine Tier 2 strategy priority order and tutorial content ordering. Without this, Tier 2 strategy selection is a guess.

**Owner:** You (Aditya).

**Deadline:** Before any Tier 2 feature work starts.

**Fallback:** If 5 interviews take >3 weeks to arrange, proceed with 3 conversations minimum and note the gap.

**Context:** This is captured in the Phase 3 design doc (asalle-main-design-20260627-234640.md) but needs to be an active task so it doesn't get deprioritized once Tier 1 implementation starts.

**Blocked by:** Nothing. Can start immediately.

---

## T2 — Cloudflare Worker rate limiting (WAF rule)

**What:** Add a Cloudflare WAF rate-limiting rule on the Worker (`https://optionsbtproxy.asalle.workers.dev`): 100 requests/minute per IP.

**Why:** Protects against abuse of the Yahoo Finance proxy. Currently no rate limiting — someone could hammer the Worker and burn through Cloudflare free tier or get the Worker banned by Yahoo Finance.

**Owner:** You (Aditya).

**Deadline:** Before public launch / before any significant traffic.

**Context:** This requires the Cloudflare dashboard (not code changes). Free tier WAF supports this. Setting: Security > WAF > Rate Limiting Rules > 100 req/min per IP on the Worker route.

**Blocked by:** Nothing. Independent of Phase 3 feature work.

---

## T3 — Create docs/DESIGN.md (design system reference)

**What:** Extract the token vocabulary and component patterns from `optionsbt.html` into a `docs/DESIGN.md` file. Cover: color tokens (--bg0→--bg4, --t1/t2/t3, accent colors), typography (SF Pro, 13px base, font weights), component patterns (.auth-field, .btn variants, .btn-circle, modal shell, toast), spacing scale.

**Why:** Without a DESIGN.md, future feature work creates new tokens instead of reusing --t2, --bg3, etc. Already happened twice during Phase 3 planning (design review caught `.btn-circle` as a gap). The design system is too important to live only in 4700 lines of HTML.

**Pros:** Future feature sessions reference this file immediately. New contributors don't invent inconsistent components. Design review passes are faster.

**Cons:** Small maintenance overhead — if tokens change in optionsbt.html, DESIGN.md must be updated too.

**Owner:** You (Aditya) or Claude Code.

**Effort:** ~2h human / ~20min CC.

**Blocked by:** Nothing. Can be done any time.

---

## T4 — Tutorial chart PNGs (8 screenshots, one per strategy)

**What:** Produce 8 static PNG screenshots — one per strategy (Wheel, CSP, Covered Call, Long Call, Long Put, Bull Call Spread, Bear Put Spread, Iron Condor). Each PNG: a real historical backtest from the app at a specific date, with entry/exit text annotations added in an image editor. Store in `docs/tutorial-charts/` or inline as base64 in optionsbt.html.

**Why:** The tutorial modal's historical example is a static PNG (per design review decision). If these aren't produced before the tutorial layer ships, users see empty `<img>` tags.

**Pros:** Tutorial layer can ship with real visual examples — the primary credibility feature of Phase 3.

**Cons:** ~1-2h per strategy (8-16h total content work). Requires picking specific historical dates and trades as canonical examples.

**Context:** This is a content task, not engineering. The tutorial layer (T3 in tasks-eng-review) can be built with placeholder images, but can't be released without real charts.

**Depends on / blocked by:** Tutorial text copy must be drafted first (so you know which strategy/date to screenshot for each example). That copy is blocked by at least 3 customer discovery conversations (TODOS T1).

---

## T5 — Screen reader QA for tutorial modal and settings page

**What:** Run VoiceOver (macOS, Cmd+F5) on the tutorial modal and settings page after Tier 1 ships. Verify: modal announced as dialog, strategy name read as label, Got It announced, settings inputs have visible labels, pnl_display toggle is keyboard-operable.

**Why:** The tutorial modal has ARIA attributes specified (`role="dialog"`, `aria-labelledby`, `aria-modal`), but no test has been run. Screen reader support is specified but unverified.

**Pros:** Confirms the ARIA spec was implemented correctly. Catches issues before users report them.

**Cons:** ~30min effort. Low priority unless you have screen-reader users.

**Blocked by:** Tier 1 must ship first.
