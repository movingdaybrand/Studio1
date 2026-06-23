// api/guide.js — renders a published Brand Guide in the browser.
//
// Vercel Blob force-downloads HTML, so we fetch the stored file server-side and re-serve it with
// Content-Type: text/html (inline) so it displays. Shared link form: /api/guide?g=<slug>-<id>
// (or, with the optional rewrite below, /g/<slug>-<id>).

import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const g = String((req.query && req.query.g) || '').replace(/[^a-z0-9-]+/gi, '').slice(0, 80);
    if (!g) { res.status(400).send('Missing guide id.'); return; }
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
      res.status(501).send('Storage is not configured.'); return;
    }

    const { blobs } = await list({ prefix: `guides/${g}` });
    const hit = (blobs || []).find(b => b.pathname === `guides/${g}.html`) || (blobs || [])[0];
    if (!hit) { res.status(404).send('Guide not found.'); return; }

    const bust = hit.url + (hit.url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(hit.uploadedAt || Date.now());
    const r = await fetch(bust, { cache: 'no-store' });   // server-side fetch ignores the attachment header; bust CDN so re-publishes show instantly
    if (!r.ok) { res.status(502).send('Could not load guide.'); return; }
    const html = await r.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');   // always reflect the latest publish
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('Error loading guide.');
  }
}
