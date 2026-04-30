module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token  = process.env.GITHUB_TOKEN;
  const owner  = 'pabloCastellanosDATA';
  const repo   = 'dashboard-blaster';
  const branch = 'main';

  if (!token) return res.status(500).json({ error: 'Token no configurado' });

  const snapshot = req.body;
  const { key } = snapshot;
  if (!key) return res.status(400).json({ error: 'Falta key del mes' });

  async function ghGet(path) {
    const r = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
    );
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`GitHub GET ${path}: ${r.status}`);
    return r.json();
  }

  async function ghPut(path, content, sha, message) {
    const body = {
      message,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      branch,
    };
    if (sha) body.sha = sha;
    const r = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    if (!r.ok) { const e = await r.json(); throw new Error(e.message); }
    return r.json();
  }

  try {
    // 1. Guardar snapshot completo del mes
    const snapshotPath = `history/${key}.json`;
    const existing = await ghGet(snapshotPath);
    await ghPut(snapshotPath, snapshot, existing?.sha, `history: cierre mes ${key}`);

    // 2. Actualizar índice (solo metadatos, sin arrays diarios)
    const indexPath = 'history/index.json';
    const indexFile = await ghGet(indexPath);
    let index = [];
    if (indexFile) {
      index = JSON.parse(Buffer.from(indexFile.content, 'base64').toString('utf-8'));
    }

    const entry = {
      key,
      label:             snapshot.label,
      closedAt:          snapshot.closedAt,
      totals:            snapshot.totals,
      digitalTotals:     snapshot.digitalTotals,
      consolidadoTotals: snapshot.consolidadoTotals,
    };

    const idx = index.findIndex(e => e.key === key);
    if (idx >= 0) index[idx] = entry;
    else          index.push(entry);
    index.sort((a, b) => b.key.localeCompare(a.key));

    await ghPut(indexPath, index, indexFile?.sha, `history: update index ${key}`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
