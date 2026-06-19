// api/guides.js — lists published Brand Guides. Returns viewer links (/api/guide?g=…) that render,
// not the raw blob URLs (which would download). Newest first.

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

    const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const host = req.headers.host;

    const { blobs } = await list({ prefix: 'guides/' });
    const guides = (blobs || [])
      .filter(b => /\.html$/i.test(b.pathname || ''))
      .map(b => {
        const guideId = String(b.pathname || '').replace(/^guides\//, '').replace(/\.html$/i, '');
        const slug = guideId.replace(/-[a-z0-9]{8,14}$/i, '');           // strip the trailing publish id
        const name = (slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()) || 'Brand';
        return {
          url: `${proto}://${host}/api/guide?g=${guideId}`,             // viewer link (renders inline)
          name,
          uploadedAt: b.uploadedAt,
          size: b.size,
        };
      })
      .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));

    res.status(200).json({ guides });
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'Could not list guides.' });
  }
}
