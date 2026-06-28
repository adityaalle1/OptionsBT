/**
 * Extracts pure math/utility functions from optionsbt.html into a Node.js
 * vm context for unit testing. Only the constant declarations and pure
 * function definitions are pulled — no DOM code.
 */
import { readFileSync } from 'fs'
import { createContext, runInContext } from 'vm'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dir = fileURLToPath(new URL('../../', import.meta.url))
const html = readFileSync(resolve(__dir, 'optionsbt.html'), 'utf8')
const lines = html.split('\n')

// Line ranges (1-indexed) that contain pure, DOM-free functions
const RANGES = [
  [881, 885],    // COMMISSION, REG_FEE constants
  [949, 1036],   // Technical analysis indicator functions
  [1062, 1066],  // fmtAge
  [1315, 1395],  // ncdf, npdf, bsm, calcHV, baseIV, ivForStrike, calcIVR, strikeStep, calcFees
]

const code = RANGES
  .map(([start, end]) => lines.slice(start - 1, end).join('\n'))
  .join('\n\n')

const ctx = { Math, Date, console }
createContext(ctx)
runInContext(code, ctx)

export const {
  ncdf, npdf, bsm,
  calcHV, baseIV, ivForStrike, calcIVR,
  strikeStep, calcFees,
  fmtAge,
  calcSMAArr, calcEMAArr, calcBBArr, calcVWAPArr,
  calcRSIArr, calcMACDArr, calcATRArr, calcADXArr,
  calcOBVArr, calcWilliamsArr,
} = ctx
