// api/upload-asset.js — stores one asset (a base64 data URL) in Vercel Blob and returns its
// public URL. Publishing uses this to externalize big images so the published HTML stays small
// and never hits the 4.5 MB request-body cap on /api/publish.
//
// Images/fonts (unlike HTML) are served inline by Blob with their own content-type, so the
// returned URL can be dropped straight into <img src> / CSS url() in the published page.

import { put } from '@vercel/blob';
import { createHash } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { data } = body || {};

    if (!data || typeof data !== 'string') {
      res.status(400).json({ error: 'Missing asset data.' });
      return;
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
      res.status(501).json({ error: 'Blob storage is not configured for this project yet.' });
      return;
    }

    const m = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,(.+)$/is.exec(data);
    if (!m) { res.status(400).json({ error: 'Not a base64 data URL.' }); return; }

    const contentType = m[1].toLowerCase();
    const buf = Buffer.from(m[2], 'base64');
    const ext = (contentType.split('/')[1] || 'bin').replace(/[^a-z0-9]+/gi, '').slice(0, 8) || 'bin';

    // Content-hash the bytes → identical assets dedupe across re-publishes and brands.
    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 16);
    const { url } = await put(`assets/${hash}.${ext}`, buf, {
      access: 'public',
      contentType,
      addRandomSuffix: false,   // stable path keyed by content hash
      allowOverwrite: true,
    });

    res.status(200).json({ url });
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'Upload failed.' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };
