// Serverless proxy for Imgflip's trending meme templates.
// Keeps things cache-friendly and avoids relying on client-side CORS behavior.
export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.imgflip.com/get_memes');
    const data = await r.json();
    if (!data.success) {
      res.status(502).json({ error: 'upstream_error' });
      return;
    }
    const top = data.data.memes.slice(0, 24).map(m => ({
      id: m.id,
      name: m.name,
      url: m.url,
      width: m.width,
      height: m.height,
      box_count: m.box_count
    }));
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ memes: top });
  } catch (err) {
    res.status(500).json({ error: 'server_error' });
  }
}
