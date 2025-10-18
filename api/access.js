// api/access.js
// Serverless function for Vercel (no dependencies)
// Kirim IP ke Telegram saat pertama kali orang akses

module.exports = async (req, res) => {
  // Ambil IP pengunjung (via header/proxy)
  const xf = req.headers['x-forwarded-for'];
  const ip =
    (xf && xf.split(',')[0].trim()) ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown';

  // Parse cookie sederhana
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
    .reduce((acc, cur) => {
      const [k, ...v] = cur.split('=');
      acc[k] = decodeURIComponent(v.join('='));
      return acc;
    }, {});

  // Kalau sudah punya cookie → tolak + kirim notif (opsional)
  if (cookies.visited === '1') {
    await sendTelegram(
      `🔁 *Percobaan ulang akses*\nIP: ${ip}\nURL: ${req.url}\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
    );

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(
      JSON.stringify({
        allowed: false,
        message: 'Sudah pernah buka (cookie terdeteksi).',
      })
    );
  }

  // Kalau belum pernah → kasih akses + kirim notif Telegram
  const maxAge = 60 * 60 * 24 * 365; // 1 tahun
  res.setHeader('Set-Cookie', `visited=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`);
  res.setHeader('Content-Type', 'application/json');

  try {
    await sendTelegram(
      `✅ *Akses pertama diterima!*\nIP: ${ip}\nUser-Agent: ${req.headers['user-agent'] || '-'}\nURL: ${req.url}\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
    );
  } catch (err) {
    console.error('Gagal kirim Telegram:', err.message);
  }

  res.status(200).send(
    JSON.stringify({
      allowed: true,
      message: 'Akses diberikan dan IP dikirim ke Telegram.',
    })
  );
};

// =====================
// 🔹 Kirim ke Telegram
// =====================
async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = '7151363875'; // chat ID langsung di-hardcode

  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN belum diatur di environment');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = new URLSearchParams({
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Telegram API error: ${response.status} - ${errText}`);
  }
      }
