module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token  = process.env.GITHUB_TOKEN;
  const owner  = 'pabloCastellanosDATA';
  const repo   = 'dashboard-blaster';
  const branch = 'main';
  const { month } = req.query;
  const path = month ? `history/${month}.json` : 'history/index.json';

  try {
    const r = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache',
        },
      }
    );

    if (r.status === 404) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(month ? null : []);
    }

    if (!r.ok) return res.status(500).json({ error: 'No se pudo leer el archivo' });

    const file    = await r.json();
    const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(content);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
