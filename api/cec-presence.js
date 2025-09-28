const TARGET = 'https://pv-data.cec.md/GetElectionPresence.json';

// Domains allowed to use this proxy
const ALLOWED_ORIGINS = [
  'https://deschide-dev.webflow.io',
  'https://deschide.md',
  'https://www.deschide.md'
];

const SECRET = process.env.CEC_PROXY_KEY || '';

module.exports = async (req, res) => {
  if (SECRET) {
    const key = (req.query.key || '').toString();
    if (key !== SECRET) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
    res.status(204).end();
    return;
  }

  try {
    const r = await fetch(TARGET, { headers: { 'Accept': 'application/json' } });
    const body = await r.text();
    const origin = req.headers.origin || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=10');
    res.status(r.ok ? 200 : r.status).send(body);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    res.setHeader('Vary', 'Origin');
    res.status(502).json({ error: 'proxy_fetch_failed' });
  }
};
