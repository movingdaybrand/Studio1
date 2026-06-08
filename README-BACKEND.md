# Moving Day Studio Backend Render Layer

This adds a real backend render endpoint so the final exported product is generated from structured guide data instead of only cloning the current browser DOM.

## Files to add

- `shared/render-brand-guide-core.js`
- `api/render-brand-guide.js`
- `netlify/functions/render-brand-guide.js`

## Endpoint

Both Vercel and Netlify can use:

```txt
POST /api/render-brand-guide
```

For Netlify, add this redirect to `netlify.toml`:

```toml
[[redirects]]
  from = "/api/render-brand-guide"
  to = "/.netlify/functions/render-brand-guide"
  status = 200
```

## Frontend usage

Send your current builder state to the endpoint:

```js
async function exportWithBackend(payload) {
  const response = await fetch('/api/render-brand-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(await response.text());

  const html = await response.text();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${payload.guide?.clientName || 'brand'}-brand-identity-guide.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

The payload should include:

```js
{
  guide: {
    clientName,
    category,
    heroDescription,
    deliveryDate,
    sprint,
    timeline,
    assetCount
  },
  selectedAssets: {
    heroLogo,
    primaryLogo,
    secondaryLogo,
    iconMark,
    iconVariant,
    profileImage,
    websiteHeader,
    businessCard,
    socialPost
  },
  colors,
  typography,
  usage,
  downloadCards,
  assets
}
```

Each asset needs at least:

```js
{
  name: 'logo.svg',
  ext: 'svg',
  type: 'image/svg+xml',
  data: 'data:image/svg+xml;base64,...'
}
```
