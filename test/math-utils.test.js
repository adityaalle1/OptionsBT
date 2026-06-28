import { describe, it, expect } from 'vitest'
import {
  ncdf, npdf, bsm,
  calcHV, baseIV, ivForStrike,
  strikeStep, calcFees,
  fmtAge,
  calcSMAArr, calcRSIArr, calcOBVArr,
} from './helpers/extract-fns.js'

// ─── ncdf ───────────────────────────────────────────────────────────────────

describe('ncdf', () => {
  it('returns 0.5 at x=0 (symmetry point)', () => {
    expect(ncdf(0)).toBeCloseTo(0.5, 4)
  })
  it('returns ≈0.8413 at x=1 (one standard deviation)', () => {
    expect(ncdf(1)).toBeCloseTo(0.8413, 3)
  })
  it('returns ≈0.9772 at x=2', () => {
    expect(ncdf(2)).toBeCloseTo(0.9772, 3)
  })
  it('approaches 1 for large positive x', () => {
    expect(ncdf(5)).toBeCloseTo(1, 5)
  })
  it('is symmetric: ncdf(-x) ≈ 1 - ncdf(x)', () => {
    expect(ncdf(-1)).toBeCloseTo(1 - ncdf(1), 5)
  })
})

// ─── npdf ───────────────────────────────────────────────────────────────────

describe('npdf', () => {
  it('peaks at x=0 (≈0.3989)', () => {
    expect(npdf(0)).toBeCloseTo(0.3989, 3)
  })
  it('is symmetric: npdf(-x) === npdf(x)', () => {
    expect(npdf(-1)).toBeCloseTo(npdf(1), 8)
  })
  it('decreases monotonically away from 0', () => {
    expect(npdf(1)).toBeGreaterThan(npdf(2))
    expect(npdf(2)).toBeGreaterThan(npdf(3))
  })
})

// ─── bsm ────────────────────────────────────────────────────────────────────

describe('bsm', () => {
  it('expired ATM call returns max(0, S-K) intrinsic value', () => {
    const res = bsm(100, 100, 0, 0.2, 'call')
    expect(res.price).toBeCloseTo(0, 1)  // ATM at expiry ≈ 0 (or tiny)
  })

  it('expired ITM call returns intrinsic value S-K', () => {
    const res = bsm(110, 100, 0, 0.2, 'call')
    expect(res.price).toBe(10)
  })

  it('expired OTM call returns 0 (or min .01)', () => {
    const res = bsm(90, 100, 0, 0.2, 'call')
    expect(res.price).toBeLessThanOrEqual(0.01)
  })

  it('ATM call with T>0 has positive time value', () => {
    const res = bsm(100, 100, 0.083, 0.2, 'call')  // ~1 month
    expect(res.price).toBeGreaterThan(0)
  })

  it('call delta is between 0 and 1', () => {
    const res = bsm(100, 100, 0.5, 0.25, 'call')
    expect(res.delta).toBeGreaterThan(0)
    expect(res.delta).toBeLessThan(1)
  })

  it('put delta is between -1 and 0', () => {
    const res = bsm(100, 100, 0.5, 0.25, 'put')
    expect(res.delta).toBeLessThan(0)
    expect(res.delta).toBeGreaterThan(-1)
  })

  it('deep ITM call delta approaches 1', () => {
    const res = bsm(200, 100, 0.5, 0.25, 'call')
    expect(res.delta).toBeGreaterThan(0.9)
  })

  it('put-call parity: call - put ≈ S - K*e^(-rT) for ATM', () => {
    const S = 100, K = 100, T = 0.5, iv = 0.25, r = 0.045
    const call = bsm(S, K, T, iv, 'call').price
    const put  = bsm(S, K, T, iv, 'put').price
    const theoretical = S - K * Math.exp(-r * T)
    expect(call - put).toBeCloseTo(theoretical, 0)
  })

  it('vega is positive (more time/vol = more expensive)', () => {
    const res = bsm(100, 100, 0.5, 0.25, 'call')
    expect(res.vega).toBeGreaterThan(0)
  })
})

// ─── strikeStep ─────────────────────────────────────────────────────────────

describe('strikeStep', () => {
  it('returns 0.5 for prices under $5', () => {
    expect(strikeStep(3)).toBe(0.5)
    expect(strikeStep(4.99)).toBe(0.5)
  })
  it('returns 1 for $5-$99', () => {
    expect(strikeStep(5)).toBe(1)
    expect(strikeStep(50)).toBe(1)
    expect(strikeStep(99)).toBe(1)
  })
  it('returns 2.5 for $100-$199', () => {
    expect(strikeStep(100)).toBe(2.5)  // <100 → 1, <200 → 2.5 (100 falls here)
    expect(strikeStep(150)).toBe(2.5)
  })
  it('returns 5 for $200-$499', () => {
    expect(strikeStep(250)).toBe(5)
  })
  it('returns 10 for $500-$999', () => {
    expect(strikeStep(750)).toBe(10)
  })
  it('returns 25 for $1000+', () => {
    expect(strikeStep(1000)).toBe(25)
    expect(strikeStep(5000)).toBe(25)
  })
})

// ─── calcFees ────────────────────────────────────────────────────────────────

describe('calcFees', () => {
  it('buy: commission only (no reg fee on buys)', () => {
    // COMMISSION = 0.65 per contract
    expect(calcFees('buy', 2.50, 1)).toBe(0.65)
    expect(calcFees('buy', 10.00, 2)).toBe(1.30)
  })

  it('sell: commission + reg fee (notional * REG_FEE * 100), rounded to 2dp', () => {
    // premium=2.50, qty=1: reg = max(0.01, 0.000229 * 2.50 * 100) = 0.05725
    // total = (0.65 + 0.05725).toFixed(2) = 0.71
    const fees = calcFees('sell', 2.50, 1)
    expect(fees).toBe(0.71)
  })

  it('sell reg fee has a floor of $0.01', () => {
    // tiny premium: 0.000229 * 0.001 * 100 = 0.0000229 → reg = 0.01
    const fees = calcFees('sell', 0.001, 1)
    expect(fees).toBeCloseTo(0.65 + 0.01, 2)
  })
})

// ─── fmtAge ──────────────────────────────────────────────────────────────────

describe('fmtAge', () => {
  it('formats minutes correctly (< 60 min)', () => {
    expect(fmtAge(5 * 60 * 1000)).toBe('5m ago')
    expect(fmtAge(59 * 60 * 1000)).toBe('59m ago')
  })
  it('formats hours correctly', () => {
    expect(fmtAge(2 * 3600 * 1000)).toBe('2h ago')
    expect(fmtAge(23 * 3600 * 1000)).toBe('23h ago')
  })
  it('formats days correctly', () => {
    expect(fmtAge(2 * 86400 * 1000)).toBe('2d ago')
    expect(fmtAge(30 * 86400 * 1000)).toBe('30d ago')
  })
})

// ─── calcSMAArr ──────────────────────────────────────────────────────────────

describe('calcSMAArr', () => {
  it('returns null for insufficient data', () => {
    const data = [
      { c: 10 }, { c: 20 },
    ]
    const result = calcSMAArr(data, 5)
    expect(result[0]).toBeNull()
    expect(result[1]).toBeNull()
  })

  it('computes correct 3-bar SMA', () => {
    const data = [
      { c: 10 }, { c: 20 }, { c: 30 }, { c: 40 },
    ]
    const result = calcSMAArr(data, 3)
    expect(result[0]).toBeNull()
    expect(result[1]).toBeNull()
    expect(result[2]).toBeCloseTo(20, 5)  // (10+20+30)/3
    expect(result[3]).toBeCloseTo(30, 5)  // (20+30+40)/3
  })

  it('period-1 SMA returns the bar close itself', () => {
    const data = [{ c: 5 }, { c: 15 }, { c: 25 }]
    const result = calcSMAArr(data, 1)
    expect(result[0]).toBe(5)
    expect(result[1]).toBe(15)
    expect(result[2]).toBe(25)
  })
})

// ─── calcOBVArr ──────────────────────────────────────────────────────────────

describe('calcOBVArr', () => {
  it('starts at 0', () => {
    const data = [
      { c: 100, volume: 1000 },
      { c: 105, volume: 1500 },
    ]
    expect(calcOBVArr(data)[0]).toBe(0)
  })

  it('adds volume on up day', () => {
    const data = [
      { c: 100, volume: 1000 },
      { c: 105, volume: 1500 },
    ]
    expect(calcOBVArr(data)[1]).toBe(1500)
  })

  it('subtracts volume on down day', () => {
    const data = [
      { c: 105, volume: 1000 },
      { c: 100, volume: 1500 },
    ]
    expect(calcOBVArr(data)[1]).toBe(-1500)
  })

  it('unchanged on flat day', () => {
    const data = [
      { c: 100, volume: 1000 },
      { c: 100, volume: 1500 },
    ]
    expect(calcOBVArr(data)[1]).toBe(0)
  })
})
