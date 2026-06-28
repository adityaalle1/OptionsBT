/**
 * OptionsBT Cloudflare Worker — server-side data proxy
 * Replaces all CORS proxy hacks with a reliable server-side fetch.
 * Endpoint: GET /chart?ticker=AAPL&range=2y
 */

const ALLOWED_ORIGINS = [
  'https://adityaalle.netlify.app',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(data, status = 200, extra = {}, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json', ...extra },
  });
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const ticker = (url.searchParams.get('ticker') || '').toUpperCase().trim();
    const range  = url.searchParams.get('range') || '2y';

    if (!ticker || !/^[A-Z0-9.\-\^=]{1,15}$/.test(ticker)) {
      return json({ error: 'Invalid or missing ticker' }, 400, {}, origin);
    }

    const validRanges = ['1y', '2y', '5y', '10y', 'max'];
    const safeRange = validRanges.includes(range) ? range : '2y';

    // Check Cloudflare edge cache first
    const cacheKey = new Request(`https://cache.optionsbt.internal/${ticker}/${safeRange}`);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const body = await cached.json();
      return json(body, 200, { 'X-Cache': 'HIT' }, origin);
    }

    // Try Yahoo Finance query1 then query2 as fallback
    const hosts = ['query1', 'query2'];
    let lastErr = 'fetch failed';

    for (const host of hosts) {
      const yahooUrl =
        `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
        `?interval=1d&range=${safeRange}&includePrePost=false`;

      try {
        const resp = await fetch(yahooUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://finance.yahoo.com/',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!resp.ok) { lastErr = `Yahoo ${host} returned HTTP ${resp.status}`; continue; }

        const data = await resp.json();
        const result = data?.chart?.result?.[0];

        if (!result?.timestamp) {
          lastErr = data?.chart?.error?.description || 'No data in response';
          continue;
        }

        // Cache at the edge for 1 hour
        const cacheResp = new Response(JSON.stringify(data), {
          headers: { 'Cache-Control': 'public, max-age=3600', 'Content-Type': 'application/json' },
        });
        ctx.waitUntil(cache.put(cacheKey, cacheResp));

        return json(data, 200, {
          'Cache-Control': 'public, max-age=3600',
          'X-Cache': 'MISS',
          'X-Source': host,
        }, origin);
      } catch (e) {
        lastErr = e.message;
      }
    }

    return json({ error: lastErr }, 502, {}, origin);
  },
};
