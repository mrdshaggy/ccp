export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  let queryData;
  if (req.body && typeof req.body === 'object') {
    queryData = req.body.data;
  } else if (typeof req.body === 'string') {
    queryData = new URLSearchParams(req.body).get('data');
  }

  if (!queryData) return res.status(400).json({ error: 'Missing data param' });

  const upstream = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; tsinoshchuk/1.0)',
    },
    body: 'data=' + encodeURIComponent(queryData),
  });

  const text = await upstream.text();
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
  res.status(upstream.status).end(text);
}
