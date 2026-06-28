# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

**vitest v4** with Node.js environment.

## How to run

```bash
bun run test          # single run
bun run test:watch    # watch mode
```

## Test layers

**Unit tests** (`test/math-utils.test.js`): Pure mathematical functions extracted from `optionsbt.html` via `test/helpers/extract-fns.js`. Covers:
- `ncdf` / `npdf` — normal distribution math
- `bsm` — Black-Scholes-Merton options pricing (price, delta, gamma, theta, vega)
- `strikeStep` — strike price increment lookup
- `calcFees` — commission + regulatory fee calculation
- `fmtAge` — human-readable time formatting
- `calcSMAArr` / `calcOBVArr` — technical indicator arrays

No DOM, no network, no external dependencies. Runs in ~150ms.

**Browser QA** (`/qa`): Full end-to-end testing via the gstack browse binary. Covers all user-facing flows — not suitable for CI.

## Test helper

`test/helpers/extract-fns.js` reads `optionsbt.html` at runtime and extracts specific pure-function line ranges using Node.js `vm`. This means tests always run against the live source — no duplication risk.

## Conventions

- File naming: `test/*.test.js`
- Imports: vitest `describe`, `it`, `expect`
- Assertions: `toBeCloseTo(x, N)` for floats, `toBe` for exact values
- When fixing a bug, add a regression test to `math-utils.test.js` with a comment: `// Regression: ISSUE-NNN`

## Coverage expectations

- When writing new pure functions, add tests to `math-utils.test.js`
- When fixing a bug in a pure function, write a regression test
- DOM-heavy code (rendering, event handlers) is not unit-testable without significant refactor — cover with `/qa` instead
- Never commit code that makes existing tests fail
