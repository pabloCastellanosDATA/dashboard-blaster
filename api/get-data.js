module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = 'pabloCastellanosDATA';
  const repo  = 'dashboard-blaster';
  const path  = 'dashboard-data.json';

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: 'No se pudo leer el archivo' });
    }

    const file = await response.json();
    const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(content);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
