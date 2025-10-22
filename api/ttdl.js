export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, message: 'Masukkan URL TikTok!' });

    // Ambil data dari TikWM API (stabil & lengkap)
    const api = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const { data, msg } = await api.json();

    if (!data) return res.status(404).json({ status: false, message: msg || 'Gagal ambil data!' });

    res.status(200).json({
      status: true,
      creator: "Dezz API",
      result: {
        author: {
          name: data.author?.unique_id,
          nickname: data.author?.nickname,
          avatar: data.author?.avatar
        },
        video: {
          title: data.title,
          hashtag: data.title?.match(/#[\w]+/g) || [],
          music: data.music_info?.title,
          play: data.play,
          wmplay: data.wmplay,
          hdplay: data.hdplay
        },
        stats: {
          views: data.play_count,
          likes: data.digg_count,
          comments: data.comment_count,
          shares: data.share_count
        }
      }
    });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
                                            }
