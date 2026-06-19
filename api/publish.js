// api/publish.js — uploads a built Brand Guide HTML page to Vercel Blob and returns a public, shareable URL.
//
// Setup (one time):
//   1) npm install @vercel/blob
//   2) In the Vercel dashboard → Storage → create a Blob store (this auto-adds the
//      BLOB_READ_WRITE_TOKEN environment variable to the project).
//   3) Redeploy.
//
// The client posts { html, slug, id }. We write to a stable path (guides/<slug>-<id>.html)
// with allowOverwrite, so re-publishing the same brand updates the SAME link.

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { html, slug, id } = body || {};

    if (!html || typeof html !== 'string') {
      res.status(400).json({ error: 'Missing guide HTML.' });
      return;
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Blob store not connected yet — tell the client so it can fall back to a download.
      res.status(501).json({ error: 'Blob storage is not configured for this project yet.' });
      return;
    }

    const safeSlug = String(slug || 'brand').toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'brand';
    const safeId = String(id || Math.random().toString(36).slice(2, 10))
      .replace(/[^a-z0-9]+/gi, '').slice(0, 16) || 'guide';
    const pathname = `guides/${safeSlug}-${safeId}.html`;

    const { url } = await put(pathname, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,   // stable path → the shared link stays the same on re-publish
      allowOverwrite: true,     // re-publishing updates the existing page
    });

    res.status(200).json({ url });
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'Publish failed.' });
  }
}

// The guide page inlines the logo as a data URL, so allow a larger body (still under Vercel's ~4.5MB request cap).
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
