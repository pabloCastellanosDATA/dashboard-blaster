// Serverless function — el token queda en el servidor, nunca en el navegador
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token   = process.env.GITHUB_TOKEN;
  const owner   = 'pabloCastellanosDATA';
  const repo    = 'dashboard-blaster';
  const path    = 'dashboard-data.json';
  const branch  = 'main';

  if (!token) {
    return res.status(500).json({ error: 'Token no configurado en el servidor' });
  }

  try {
    const content = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');

    // Obtener SHA del archivo actual (necesario para actualizarlo)
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
    );

    let sha = null;
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    // Guardar el archivo actualizado
    const putRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `update: datos dashboard ${new Date().toISOString().split('T')[0]}`,
          content,
          branch,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: err.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
