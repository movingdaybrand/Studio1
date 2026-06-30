// api/publish-state.js — stores the editable brand state JSON beside a published guide,
// at guides/{guideId}-state.json. The /api/guides listing ignores it (it filters to .html),
// so this is purely additive: the client-facing HTML flow is untouched.

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { state, slug, id } = body || {};

    if (!state) {
      res.status(400).json({ error: 'Missing brand state.' });
      return;
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
      res.status(501).json({ error: 'Blob storage is not configured for this project yet.' });
      return;
    }

    const safeSlug = String(slug || 'brand').toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'brand';
    const safeId = String(id || Math.random().toString(36).slice(2, 10))
      .replace(/[^a-z0-9]+/gi, '').slice(0, 16) || 'guide';
    const guideId = `${safeSlug}-${safeId}`;

    const json = typeof state === 'string' ? state : JSON.stringify(state);

    await put(`guides/${guideId}-state.json`, json, {
      access: 'public',
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,   // stable path → overwrites in place on re-publish, matching the HTML
      allowOverwrite: true,
    });

    res.status(200).json({ ok: true, guideId });
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'State publish failed.' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };