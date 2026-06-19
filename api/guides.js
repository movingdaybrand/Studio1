// api/guides.js — lists the Brand Guides that have been published to Vercel Blob.
// Returns [{ url, pathname, name, uploadedAt, size }], newest first.
// Requires the same Blob store / BLOB_READ_WRITE_TOKEN as api/publish.js.

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
    const { blobs } = await list({ prefix: 'guides/' });
    const guides = (blobs || []).map(b => {
      const file = String(b.pathname || '').replace(/^guides\//, '').replace(/\.html$/i, '');
      const slug = file.replace(/-[a-z0-9]{8,14}$/i, '');               // strip the trailing publish id
      const name = (slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()) || 'Brand';
      return { url: b.url, pathname: b.pathname, name, uploadedAt: b.uploadedAt, size: b.size };
    }).sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
    res.status(200).json({ guides });
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'Could not list guides.' });
  }
}
