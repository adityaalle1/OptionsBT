# OptionsBT — Options Strategy Backtester

> Practice options trading on real historical data. No account. No risk. No fake prices.

**OptionsBT** is a fully standalone, browser-based options strategy simulator that replays real OHLCV price history bar by bar and lets you open, manage, and close options positions exactly as you would in a live brokerage — commissions, assignment fees, and all.

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

### Realistic Fee Simulation
Fees most simulators skip entirely:
- **$0.65/contract** commission (open and close)
- **$19.95** assignment or exercise fee
- **SEC regulatory fee** — $0.000229 × notional on sells, minimum $0.01
- All fees tracked and shown in analytics

### Assignment & Expiration System
- CSP expires ITM → you get **assigned 100 shares** at the strike
- CC expires ITM → shares **called away**, stock P&L settled
- Long options ITM → **exercised**, intrinsic value realized
- Detailed **expiration notification modal** on every expiry with full P&L breakdown

### Technical Analysis
7+ configurable indicators with a live settings panel:

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

### Performance Scorecard
Letter-grade scorecard (A+ → F) scoring:
- Win Rate (35 pts)
- Annualized Return (25 pts)
- Max Drawdown (15 pts)
- Trade Count (10 pts)
- Risk/Reward Ratio (10 pts)
- Premium Yield (5 pts)

Includes personalized coach's notes based on your actual results.

### Session History
- Every session auto-saved to `localStorage`
- Expandable trade log per session
- One-click replay of any past ticker + strategy + capital

---

## How to Use

1. **Download** `optionsbt.html` — it's a single file, no install needed
2. **Open** it in any modern browser
3. **Type any ticker** (AAPL, NVDA, COST, BAC — anything) and click Load
4. **Select a strategy** from the dropdown
5. **Press ▶ Start** — bars replay at adjustable speed
6. **Pause anytime**, click a strike in the options chain, open a position
7. **Press ★ Score** at the end to grade your performance

No server. No backend. No login. Everything runs in your browser.

---

## Technical Stack

- **Vanilla HTML/CSS/JS** — zero frameworks, zero dependencies except Chart.js for the equity curve
- **Yahoo Finance** public API via CORS proxies (no API key required)
- **Black-Scholes-Merton** implemented from scratch in JS
- **Canvas 2D API** for the chart (no charting library)

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

## License

MIT — do whatever you want with it.

