# OptionsBT — Options Strategy Backtester

> Practice options trading on real historical data. No account. No risk. No fake prices.

**OptionsBT** is a fully standalone, browser-based options strategy simulator that replays real OHLCV price history bar by bar and lets you open, manage, and close options positions exactly as you would in a live brokerage — commissions, assignment fees, and all.

---

## Live App

**Visit:** [https://adityaalle.netlify.app](https://adityaalle.netlify.app) — no install, no download.

Or download `optionsbt.html` and open it locally in any modern browser. All features work offline; cloud sync requires a free account.

---

## Why I Built This

Most options "simulators" use fake prices or synthetic data. Real options premiums are tied to a stock's actual volatility history — NVDA premiums behave nothing like SPY premiums. I wanted a tool where the numbers felt real, so I built one that fetches actual Yahoo Finance historical data and prices every option using Black-Scholes with that stock's own realized volatility.

---

## Features

### 8 Options Strategies
- **The Wheel** — full CSP → assignment → covered call cycle
- **Cash-Secured Put** — income generation / stock acquisition
- **Covered Call** — collect premium against long stock
- **Long Call / Long Put** — directional plays with defined risk
- **Bull Call Spread / Bear Put Spread** — defined-risk directional
- **Iron Condor** — 4-leg premium collection in low-volatility environments

Each strategy has a **? Tutorial** button that explains type, win rate benchmarks, rules of thumb, and common mistakes. Dismissible; won't reshow once seen.

### Account & Cloud Sync
- Sign up / sign in with email — no password manager required, works with magic links
- Sessions, journal entries, and settings sync automatically to Supabase cloud
- Everything saves to `localStorage` first — works fully offline without an account

### Real Historical Data
- Pulls OHLCV data from **Yahoo Finance** for any US stock or ETF
- 1Y, 2Y, or 5Y replay windows
- Automatic fallback across multiple CORS proxies for reliability
- Works for any publicly traded US ticker — not just a preset list

### Realistic Options Pricing
- **Black-Scholes** pricing using each stock's own realized volatility
- **Volatility smile** applied per strike (puts priced higher than equivalent calls, as in real markets)
- Bid/ask spread baked in
- IV Rank calculated from trailing 252-bar HV history

### Configurable Fees
All fee rates are adjustable in **Settings → Trading** and applied live to every calculation:
- Commission: **$0.65/contract** (default) — open and close
- Assignment / exercise fee: **$19.95** (default)
- SEC regulatory fee: **$0.000229 × notional** on sells, minimum $0.01 (default)

Set commission to $0 for Robinhood-style zero-commission simulation.

### Assignment & Expiration System
- CSP expires ITM → you get **assigned 100 shares** at the strike
- CC expires ITM → shares **called away**, stock P&L settled
- Long options ITM → **exercised**, intrinsic value realized
- Detailed **expiration notification modal** on every expiry with full P&L breakdown

### Trade Journal
- Every closed trade is auto-logged with P&L, mood (1–5), tags, and a personal rating
- Filter by strategy, date range, or rating
- Stats bar: overall win rate, total P&L, and avg P&L across all journaled trades
- **CSV export** — all journal entries with full metadata
- Clear all entries from Settings → Data with one tap

### Performance Scorecard
Four components, 25 points each (100 pts total), graded A+ → F:

| Component | What it measures |
|-----------|----------------|
| Returns (Annualized) | Your annualized return vs a benchmark |
| Risk Control (Max Drawdown) | How much drawdown you absorbed |
| Win Rate | Win rate vs the strategy's researched benchmark |
| Discipline (Fees + Frequency) | Fee impact and position frequency |

Includes personalized coach's notes based on your actual results. **PDF export** via browser print.

### Dashboard
- Recent sessions list with ticker, strategy, P&L, and score at a glance
- **Session-level CSV export** — all sessions with dates, returns, win rates, scores, and fees

### Settings Hub
Full 7-pane settings portal accessible from the nav bar (⚙):

| Pane | Contents |
|------|----------|
| Profile | Display name, email, sign out, cloud sync status |
| Security | Change password (Supabase), 2FA coming soon |
| Plan | Free tier feature list, Pro tier preview with notify-me |
| Trading | Default capital, strategy, DTE, playback speed, all fee rates |
| Appearance | 4 themes + 6 accent colors, live preview |
| Data | Trash recovery (30-day), export CSV, clear journal, danger zone |
| Help | FAQ (10 items), keyboard shortcuts, feedback link |

All settings save instantly to `localStorage` and sync to Supabase when signed in.

### Themes & Appearance
- 4 visual themes: **default** (dark navy), **midnight**, **slate**, **emerald**
- 6 accent colors — changes the highlight color across the whole app
- Live preview before applying; persists across sessions

### Technical Analysis
8+ configurable indicators with a live settings panel:

| Indicator | Customizable |
|-----------|-------------|
| SMA | Period, color — add as many as you want |
| EMA | Period, color — add as many as you want |
| Bollinger Bands | Period, std deviation, color |
| VWAP | Color |
| RSI | Period, overbought/oversold levels, color |
| MACD | Fast, slow, signal periods, colors |
| Stochastic | %K, %D, smoothing, OB/OS levels |
| Volume | Sub-panel, color-coded |

### Drawing Tools
- **Click** on chart → horizontal support/resistance line
- **Click + drag** → freeform trendline
- **Right-click** a line → delete it
- 7 colors to choose from, cycle with 🎨 button
- Lines persist through replay

### Zoom & Navigation
- Mouse scroll wheel to zoom in/out
- `+` / `−` buttons or keyboard shortcuts
- Keyboard shortcuts for everything (Space, ←/→, X, D, S, R, C)

### Position Management
- Open multiple positions simultaneously
- Click any position card to select it → close it individually
- "Skip to Expiry" button jumps directly to next expiration
- Mark-to-market unrealized P&L on every bar

### Session History & Trash
- Every session auto-saved to `localStorage` (and cloud if signed in)
- Expandable trade log per session
- One-click replay of any past ticker + strategy + capital
- Accidentally deleted a session? Recover it from **Settings → Data → Trash** (30-day window)

---

## How to Use

### Quickstart (web)

1. Go to [https://adityaalle.netlify.app](https://adityaalle.netlify.app)
2. Type any ticker (AAPL, NVDA, COST, BAC — anything) and click **Load**
3. Select a strategy from the dropdown — tap **?** to learn what it does
4. Press **▶ Start** — bars replay at adjustable speed
5. **Pause anytime**, click a strike in the options chain, open a position
6. Press **★ Score** at the end to grade your performance

### Optional: create a free account

Sign in from the top-right corner to sync your sessions and settings across devices. No credit card. No verification email (unless you enable it).

### Run locally

Download `optionsbt.html` and open it in any modern browser. No server, no build step, no install. All features work; cloud sync requires signing in.

---

## Technical Stack

- **Vanilla HTML/CSS/JS** — zero frontend frameworks, single-file app
- **Yahoo Finance** public API via a Cloudflare Worker CORS proxy
- **Black-Scholes-Merton** implemented from scratch in JS
- **Canvas 2D API** for the chart (no charting library)
- **Chart.js** for the equity curve sub-panel
- **Supabase** for auth and cloud sync (sessions, journal, settings)
- **Vitest** unit test suite (36 tests, covering BSM math, Greeks, IV, fees, indicators)
- **GitHub Actions CI** — runs `bun run test` on every push (bun 1.3.14)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Step back / forward 1 bar |
| `X` | Skip to next expiration |
| `D` | Toggle draw mode |
| `+` / `−` | Zoom in / out |
| `S` | Open scorecard |
| `R` | Reset session |
| `C` | Close selected position |

---

## Limitations & Disclaimers

- **This is a simulator, not financial advice.** Past price history does not predict future returns.
- Options premiums are theoretical (Black-Scholes model). Real premiums depend on live market IV, liquidity, and supply/demand that a model can't fully capture.
- Data is sourced from Yahoo Finance and may have gaps, adjustments, or delays.
- CORS proxies used for data fetching are third-party services and may occasionally be unavailable.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

---

## License

All Rights Reserved. See [LICENSE](LICENSE) for details.
