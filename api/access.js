// api/access.js
// Vercel Serverless Function (Node). No dependencies.

module.exports = (req, res) => {
  // parse cookie sederhana
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map(c => c.trim()).filter(Boolean).reduce((acc, cur) => {
    const [k, ...v] = cur.split('=');
    acc[k] = decodeURIComponent(v.join('='));
    return acc;
  }, {});

  // jika cookie visited ada -> tolak
  if (cookies.visited === '1') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({
      allowed: false,
      message: 'Sudah pernah buka (cookie terdeteksi).'
    }));
  }

  // belum pernah -> set cookie visited dan izinkan
  // Max-Age 1 tahun (ubah kalau perlu)
  const maxAge = 60 * 60 * 24 * 365; // detik
  // Atur cookie (tidak HttpOnly supaya client-side bisa baca jika mau)
  res.setHeader('Set-Cookie', `visited=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({
    allowed: true,
    message: 'Akses diberikan dan sudah dicatat.'
  }));
};
