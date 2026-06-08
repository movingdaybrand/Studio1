const { renderBrandGuide, safeName } = require('../shared/render-brand-guide-core');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const html = renderBrandGuide(body);
    const clientName = body?.guide?.clientName || body?.project?.clientName || body?.clientName || 'brand-guide';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName(clientName)}-brand-identity-guide.html"`);
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Render failed' });
  }
};
