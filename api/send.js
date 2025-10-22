const API_KEY = 'DezzAP';
let messages = [];

export default function handler(req, res) {
  const key = req.headers['apikey'] || req.query.apikey;
  if (key !== API_KEY) {
    return res.status(403).json({ error: 'API key salah atau tidak ada' });
  }

  if (req.method === 'POST') {
    const { from, text } = req.body;
    if (!from || !text)
      return res.status(400).json({ error: 'from & text wajib diisi' });

    messages.push({ from, text, time: Date.now() });
    return res.status(200).json({ success: true, message: 'Pesan diterima' });
  }

  if (req.method === 'GET') {
    const data = [...messages];
    messages = [];
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'Method tidak diizinkan' });
}
