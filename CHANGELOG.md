# Changelog

All notable changes to OptionsBT are documented here.

---

## [1.0.0] — 2026-06-28

**Three phases of work land at once: Settings portal, bug fixes, and a full test suite.**

This is the first formal release of OptionsBT, shipping the complete output of Phases 1–3. The app now has a full Settings hub where you can change your password, configure trading fees, pick a theme, and recover accidentally-deleted sessions. Several display bugs that silently showed wrong P&L numbers are fixed. A 36-test Vitest suite and GitHub Actions CI workflow now run on every push.

The Settings portal is the headline: seven panes covering Profile (display name, email), Security (password change), Plan (free tier details + Pro roadmap), Trading (default capital, strategy, DTE, fees), Appearance (4 themes, 6 accent colors), Data (trash recovery, export, clear actions), and Help (FAQ, keyboard shortcuts, feedback link). Everything saves to localStorage instantly and syncs to your account on Supabase when signed in.

### Added

- **Full Settings portal** — ⚙ Settings tab in the nav bar opens a 7-pane hub:
  - Profile: display name, email, sign out
  - Security: change password (Supabase), 2FA coming soon
  - Plan: free tier feature list, Pro tier preview with notify-me
  - Trading: configure default capital, strategy, DTE, playback speed, and all fee rates
  - Appearance: 4 themes (default, midnight, slate, emerald) + 6 accent colors
  - Data: recover soft-deleted sessions (30-day trash), export sessions CSV, clear journal
  - Help: FAQ accordion, keyboard shortcuts grid, feedback link
- **Strategy tutorial modal** — ? button next to the strategy picker explains the selected strategy with type, benchmark win rate and return targets, rules of thumb, and common mistakes
- **Configurable fees** — commission, assignment fee, and reg fee are now user-settable in Settings → Trading and applied live to all fee calculations
- **Theme system** — 4 visual themes with live preview; accent color changes highlight color across the entire app
- **Vitest unit test suite** — 36 tests covering BSM pricing, Greeks, IV, fee math, SMA/EMA/BB/RSI/MACD/ATR/ADX/OBV/Williams, and utility functions
- **GitHub Actions CI** — runs `bun run test` on every push and pull request (bun 1.3.14)
- **Nav bar scrolls horizontally** on narrow screens so all tabs stay reachable

### Fixed

- Negative Realized P&L and Unrealized P&L displayed as positive in the stats panel (missing minus sign)
- Negative Avg P&L and Total P&L displayed as positive in the journal stats bar (missing minus sign)
- Fee impact calculation was wrong for buy strategies (Long Call, Long Put) — buy-side P&L was being double-charged
- Tutorial modal X button and backdrop click failed to close the overlay
- Trash Restore and Delete buttons silently did nothing (onclick passes a string ID; localStorage stores a number — strict `===` always missed)
- Setting commission to $0 (Robinhood-style) caused the default $0.65 to be substituted (`||` falsy coercion on 0); same for assignment fee and reg fee
- Journal stays up to date after clearing all entries (was showing stale entries until nav away)
- Capital minimum of $1,000 is now enforced in Settings → Trading (HTML `min` alone wasn't being validated in JS)

### Security

- Pinned Supabase JS CDN from the floating `@2` range to `@2.108.2` with a verified SRI hash (`sha384-JWEyvHh+…`)
- HTML-escape company names and tickers before rendering into `innerHTML` in History and Trash panels (prevents XSS from proxy-sourced company name strings)
- Added null guard on password update — guards against `_sbClient` being unavailable if the CDN fails to load

---
