// api/guide-state.js — returns the editable brand state JSON for a published guide.
// GET /api/guide-state?g={guideId} → the JSON saved by /api/publish-state, or 404 if none.

import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
      res.status(501).json({ error: 'Blob storage is not configured for this project yet.' });
      return;
    }

    const g = String((req.query && req.query.g) || '')
      .replace(/[^a-z0-9-]+/gi, '').slice(0, 60);
    if (!g) { res.status(400).json({ error: 'Missing guide id.' }); return; }

    const target = `guides/${g}-state.json`;
    const { blobs } = await list({ prefix: target });           // exact-path prefix → 0 or 1 match
    const hit = (blobs || []).find(b => b.pathname === target);
    if (!hit || !hit.url) { res.status(404).json({ error: 'No saved state for this guide.' }); return; }

    const r = await fetch(hit.url);                              // fetch the blob's real content
    if (!r.ok) { res.status(502).json({ error: 'Could not read state blob.' }); return; }
    const json = await r.text();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(json);                                 // hand back the raw state JSON
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'Could not load state.' });
  }
}