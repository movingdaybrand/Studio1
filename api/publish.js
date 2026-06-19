// api/publish.js — stores a built Brand Guide HTML in Vercel Blob and returns a *viewer* link.
//
// Vercel Blob force-downloads HTML (content-disposition: attachment), so we never share the raw
// blob URL. Instead we return a link to /api/guide, which re-serves the page inline so it renders.
//
// Setup (one time): npm install @vercel/blob, create a PUBLIC Blob store in Vercel and connect it.

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
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
      res.status(501).json({ error: 'Blob storage is not configured for this project yet.' });
      return;
    }

    const safeSlug = String(slug || 'brand').toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'brand';
    const safeId = String(id || Math.random().toString(36).slice(2, 10))
      .replace(/[^a-z0-9]+/gi, '').slice(0, 16) || 'guide';
    const guideId = `${safeSlug}-${safeId}`;

    await put(`guides/${guideId}.html`, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,   // stable path → the shared link stays the same on re-publish
      allowOverwrite: true,
    });

    // Hand back a viewer link on this deployment's own domain (renders inline; doesn't download).
    const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const host = req.headers.host;
    const url = `${proto}://${host}/api/guide?g=${guideId}`;

    res.status(200).json({ url });
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'Publish failed.' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };
