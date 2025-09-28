// api/cec-results.js
// Proxies the preliminary results feed to avoid CORS.
const TARGET = 'https://pv-data.cec.md/GetElectionResults.json';

// Only your sites can call this proxy (edit as needed)
const ALLOWED_ORIGINS = [
  'https://deschide-dev.webflow.io',
  'https://deschide.md',
  'https://www.deschide.md',
];

const SECRET = process.env.CEC_PROXY_KEY || ''; // set in Vercel → Settings → Environment Variables

module.exports = async (req, res) => {
  // Optional key protection
  if (SECRET) {
    const key = (req.query.key || '').toString();
    if (key !== SECRET) return res.status(401).json({ error: 'unauthorized' });
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
    return res.status(204).end();
  }

  try {
    const r = await fetch(TARGET, { headers: { Accept: 'application/json' } });
    const body = await r.text(); // pass-through
    const origin = req.headers.origin || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=10'); // small cache
    return res.status(r.ok ? 200 : r.status).send(body);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    res.setHeader('Vary', 'Origin');
    return res.status(502).json({ error: 'proxy_fetch_failed' });
  }
};
