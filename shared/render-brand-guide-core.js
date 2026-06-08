function esc(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeName(value = 'brand-guide') {
  return String(value || 'brand-guide')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'brand-guide';
}

function normalizeHex(hex, fallback) {
  const value = String(hex || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(value)) return `#${value.toUpperCase()}`;
  return fallback;
}

function hexToRgb(hex) {
  const clean = normalizeHex(hex, '#000000').replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToCmyk(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  if (k >= 1) return '0, 0, 0, 100';
  const c = Math.round(((1 - rp - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gp - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bp - k) / (1 - k)) * 100);
  return `${c}, ${m}, ${y}, ${Math.round(k * 100)}`;
}

function readableTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#171511' : '#F6F1E7';
}

function dataUrl(asset) {
  return asset?.data || asset?.dataUrl || asset?.url || asset?.file_url || '';
}

function extOf(name = '') {
  return String(name).split('.').pop().toUpperCase();
}

function findAsset(payload, name) {
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  if (!name) return null;
  return assets.find(asset => asset.name === name) || null;
}

function firstExisting(payload, names = []) {
  for (const name of names) {
    const found = findAsset(payload, name);
    if (found && dataUrl(found)) return found;
  }
  return null;
}

function assetImg(asset, className = 'asset-img', alt = '') {
  if (!asset || !dataUrl(asset)) return '';
  return `<img class="${className}" src="${dataUrl(asset)}" alt="${esc(alt || asset.name)}" />`;
}

function downloadLink(asset, label = 'Download') {
  if (!asset || !dataUrl(asset)) return '';
  const ext = extOf(asset.name);
  return `<a class="dl-mini" href="${dataUrl(asset)}" download="${esc(asset.name)}"><span>${esc(ext)}</span>${esc(label)}</a>`;
}

function normalizePayload(input = {}) {
  const guide = input.guide || input.project || {};
  const selected = input.selectedAssets || input.selections || {};
  const colors = Array.isArray(input.colors) && input.colors.length
    ? input.colors
    : ['#1F3D2E', '#2D5642', '#C4D9CB', '#F1ECDF', '#15140F'];
  const normalizedColors = colors.slice(0, 5).map((item, index) => {
    const hex = normalizeHex(typeof item === 'string' ? item : item.hex, ['#1F3D2E', '#2D5642', '#C4D9CB', '#F1ECDF', '#15140F'][index] || '#111111');
    return {
      hex,
      role: typeof item === 'object' && item.role ? item.role : ['Primary', 'Secondary', 'Accent', 'Background', 'Ink'][index] || 'Brand',
      reason: typeof item === 'object' && item.reason ? item.reason : 'Brand system color.'
    };
  });

  return {
    clientName: guide.clientName || guide.brandName || input.clientName || 'Client Brand',
    category: guide.category || input.category || 'Brand Identity System',
    heroDescription: guide.heroDescription || guide.tagline || input.tagline || 'A polished identity guide built from the approved client asset package.',
    deliveryDate: guide.deliveryDate || guide.date || input.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    sprint: guide.sprint || input.sprint || 'Brand Cleanup',
    timeline: guide.timeline || input.timeline || '7 days',
    assetCount: guide.assetCount || input.assetCount || (Array.isArray(input.assets) ? input.assets.length : 0),
    selected,
    colors: normalizedColors,
    typography: input.typography || { displayFont: 'Instrument Serif', bodyFont: 'Geist' },
    usage: input.usage || { do: [], dont: [] },
    downloadCards: Array.isArray(input.downloadCards) ? input.downloadCards : [],
    assets: Array.isArray(input.assets) ? input.assets : []
  };
}

function renderPalette(colors) {
  return `
<section>
  <p class="section-label">02 — Color System</p>
  <h2 class="section-title">A palette built<br><span>from the brand.</span></h2>
  <p class="section-sub">The selected colors are normalized into a usable system for web, social, print, and client-facing brand applications.</p>
  <div class="palette-row">
    ${colors.map(color => `<div class="swatch" style="background:${color.hex};color:${readableTextColor(color.hex)}"><span>${esc(color.role)}</span></div>`).join('')}
  </div>
  <div class="color-details">
    ${colors.map(color => {
      const rgb = hexToRgb(color.hex);
      return `<div class="color-detail"><div class="color-dot" style="background:${color.hex}"></div><div class="color-detail-name">${esc(color.role)}</div><div class="color-detail-values">${color.hex}<br>RGB ${rgb.r}, ${rgb.g}, ${rgb.b}<br>CMYK ${rgbToCmyk(color.hex)}</div></div>`;
    }).join('')}
  </div>
</section>`;
}

function renderLogoSystem(payload, normalized) {
  const selected = normalized.selected;
  const hero = firstExisting(payload, [selected.primaryLogo, selected.heroLogo, selected.secondaryLogo, selected.iconMark]);
  const secondary = firstExisting(payload, [selected.secondaryLogo, selected.iconVariant, selected.iconMark]);
  const icon = firstExisting(payload, [selected.iconMark, selected.profileImage, selected.iconVariant]);
  const cells = [];
  if (hero) cells.push(`<div class="logo-cell main light"><div class="logo-stage">${assetImg(hero, 'logo-img', 'Primary logo')}</div><div class="cell-footer"><span>Primary Logo</span>${downloadLink(hero)}</div></div>`);
  if (secondary) cells.push(`<div class="logo-cell dark"><div class="logo-stage">${assetImg(secondary, 'logo-img', 'Secondary logo')}</div><div class="cell-footer"><span>Secondary System</span>${downloadLink(secondary)}</div></div>`);
  if (icon) cells.push(`<div class="logo-cell accent"><div class="logo-stage icon-stage">${assetImg(icon, 'logo-img icon-img', 'Icon mark')}</div><div class="cell-footer"><span>Icon / Mark</span>${downloadLink(icon)}</div></div>`);
  if (!cells.length) return '';

  return `
<section>
  <p class="section-label">01 — Logo System</p>
  <h2 class="section-title">The core marks,<br><span>organized for use.</span></h2>
  <p class="section-sub">The logo package is presented as a practical identity system: primary mark, supporting variation, and compact icon where available.</p>
  <div class="logo-grid ${cells.length === 1 ? 'single' : ''}">${cells.join('')}</div>
</section>`;
}

function renderTypography(normalized) {
  const display = normalized.typography.displayFont || 'Instrument Serif';
  const body = normalized.typography.bodyFont || 'Geist';
  return `
<section>
  <p class="section-label">03 — Typography</p>
  <h2 class="section-title">One system.<br><span>Two voices.</span></h2>
  <p class="section-sub">The display voice carries brand moments and high-impact statements. The supporting voice keeps longer copy, captions, and interface details clear.</p>
  <div class="type-grid">
    <div class="type-cell dark">
      <div class="type-role">Display / Headlines</div>
      <div class="spec-big">${esc(normalized.clientName)}</div>
      <div class="spec-glyphs">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz 0123456789</div>
      <div class="type-name">${esc(display)}</div>
      <div class="type-meta">Recommended display usage</div>
      <div class="type-usage"><strong>Use for:</strong> headlines, brand moments, section titles, social statements, and hero copy.</div>
    </div>
    <div class="type-cell">
      <div class="type-role">Secondary / Supporting</div>
      <div class="spec-light">${esc(normalized.heroDescription)}</div>
      <div class="spec-glyphs light">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz 0123456789</div>
      <div class="type-name">${esc(body)}</div>
      <div class="type-meta">Recommended body/support usage</div>
      <div class="type-usage"><strong>Use for:</strong> captions, labels, descriptions, website text, and small UI copy.</div>
    </div>
  </div>
</section>`;
}

function renderInUse(payload, normalized) {
  const selected = normalized.selected;
  const profile = firstExisting(payload, [selected.profileImage, selected.iconMark, selected.iconVariant]);
  const website = firstExisting(payload, [selected.websiteHeader, selected.heroLogo, selected.primaryLogo]);
  const print = firstExisting(payload, [selected.businessCard, selected.secondaryLogo, selected.primaryLogo]);
  const social = firstExisting(payload, [selected.socialPost, selected.iconMark, selected.heroLogo]);
  const cards = [
    profile && `<div class="mockup m-profile"><div class="avatar">${assetImg(profile, 'mock-img', 'Profile application')}</div><div class="mock-label">Profile Avatar</div>${downloadLink(profile)}</div>`,
    website && `<div class="mockup m-web"><div class="browser"><div class="browser-bar"><i></i><i></i><i></i></div><div class="browser-logo">${assetImg(website, 'mock-img', 'Website header')}</div></div><div class="mock-label">Website Header</div>${downloadLink(website)}</div>`,
    print && `<div class="mockup m-card"><div class="print-card">${assetImg(print, 'mock-img', 'Print application')}</div><div class="mock-label">Print / Card</div>${downloadLink(print)}</div>`,
    social && `<div class="mockup m-social"><div class="social-statement">${assetImg(social, 'mock-img', 'Social application')}<p>${esc(normalized.heroDescription)}</p></div><div class="mock-label">Social Statement</div>${downloadLink(social)}</div>`
  ].filter(Boolean);

  if (!cards.length) return '';
  return `
<section>
  <p class="section-label">04 — In Use</p>
  <h2 class="section-title">How it looks<br><span>in the real world.</span></h2>
  <p class="section-sub">Real placements built from the approved files: icon as profile avatar, logo as site header, brand on print, and a social-ready statement.</p>
  <div class="mockup-row">${cards.join('')}</div>
</section>`;
}

function renderUsage(normalized) {
  const dos = normalized.usage.do?.length ? normalized.usage.do : [
    'Use approved logo files without stretching, skewing, or rebuilding them.',
    'Keep strong contrast between logo and background.',
    'Use the primary palette consistently across web, print, and social.',
    'Leave enough clear space around the logo.',
    'Use the display type for brand moments, not long body copy.'
  ];
  const donts = normalized.usage.dont?.length ? normalized.usage.dont : [
    'Do not place the logo on cluttered backgrounds without contrast.',
    'Do not recolor the mark outside the approved palette.',
    'Do not use screenshots as final logo files.',
    'Do not compress, blur, or export low-resolution versions.',
    'Do not mix unrelated fonts into the system.'
  ];

  return `
<section>
  <p class="section-label">05 — Usage</p>
  <h2 class="section-title">Keep it clean,<br><span>consistent, and useful.</span></h2>
  <div class="usage-grid">
    <div class="usage-card do"><div class="usage-tag">Do</div><ul>${dos.slice(0, 5).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="usage-card dont"><div class="usage-tag">Don’t</div><ul>${donts.slice(0, 5).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>
</section>`;
}

function renderDownloads(payload, normalized) {
  const cards = normalized.downloadCards.length ? normalized.downloadCards : [
    { title: 'Logo Files', description: 'Primary, secondary, and icon files for everyday brand use.', files: [normalized.selected.primaryLogo, normalized.selected.secondaryLogo, normalized.selected.iconMark].filter(Boolean) },
    { title: 'Application Assets', description: 'Social, website, profile, and print-ready brand placements.', files: [normalized.selected.profileImage, normalized.selected.websiteHeader, normalized.selected.businessCard, normalized.selected.socialPost].filter(Boolean) },
    { title: 'Source Package', description: 'All usable uploaded source files included in this delivery.', files: (payload.assets || []).map(a => a.name).filter(Boolean) }
  ];

  const rendered = cards.map(card => {
    const files = (card.files || []).map(name => findAsset(payload, name)).filter(asset => asset && dataUrl(asset));
    if (!files.length) return '';
    return `<div class="download-card"><div class="download-icon">${esc((card.title || 'Files').slice(0, 1))}</div><h3>${esc(card.title || 'Brand Files')}</h3><p>${esc(card.description || 'Download approved brand files.')}</p><div class="download-list">${files.map(file => `<a href="${dataUrl(file)}" download="${esc(file.name)}"><span>${esc(file.name)}</span><b>${esc(extOf(file.name))}</b></a>`).join('')}</div></div>`;
  }).filter(Boolean).join('');

  if (!rendered) return '';
  return `
<section>
  <p class="section-label">06 — Files</p>
  <h2 class="section-title">Final files,<br><span>ready to use.</span></h2>
  <p class="section-sub">The final package is organized into practical download groups so the client knows what to use and where to use it.</p>
  <div class="download-grid">${rendered}</div>
</section>`;
}

function renderBrandGuide(payload = {}) {
  const normalized = normalizePayload(payload);
  const primary = normalized.colors[0]?.hex || '#1F3D2E';
  const secondary = normalized.colors[1]?.hex || '#2D5642';
  const accent = normalized.colors[2]?.hex || '#C4D9CB';
  const paper = normalized.colors[3]?.hex || '#F1ECDF';
  const ink = normalized.colors[4]?.hex || '#15140F';
  const heroLogo = firstExisting(payload, [normalized.selected.heroLogo, normalized.selected.primaryLogo, normalized.selected.iconMark]);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(normalized.clientName)} · Brand Identity Guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<style>
:root{--primary:${primary};--secondary:${secondary};--accent:${accent};--paper:${paper};--ink:${ink};--cream:#F6F1E7;--line:rgba(21,20,15,.14);--display:'Instrument Serif',Georgia,serif;--sans:'Geist',system-ui,sans-serif;}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:var(--sans);background:var(--paper);color:var(--ink);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}img{max-width:100%;display:block}a{color:inherit}body:before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.22;mix-blend-mode:multiply;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.07 0 0 0 0 0.07 0 0 0 0 0.055 0 0 0 0.13 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}.container{max-width:1120px;margin:0 auto;padding:0 42px}header{position:sticky;top:0;z-index:10;background:rgba(246,241,231,.82);backdrop-filter:blur(16px);border-bottom:1px solid rgba(21,20,15,.1)}.header-inner{max-width:1200px;margin:0 auto;padding:14px 42px;display:flex;align-items:center;justify-content:space-between;gap:24px}.studio-word{font-family:var(--display);font-size:23px;letter-spacing:-.03em;color:var(--primary)}.client-label{font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:rgba(21,20,15,.48);font-weight:700}.hero{background:linear-gradient(135deg,var(--primary),var(--secondary));color:var(--cream);padding:96px 0 84px;overflow:hidden;position:relative}.hero:after{content:'';position:absolute;right:-12vw;top:-18vw;width:44vw;height:44vw;border-radius:50%;background:var(--accent);opacity:.18}.hero .container{position:relative;z-index:1}.hero-logo{width:min(320px,64vw);min-height:80px;display:flex;align-items:center;margin-bottom:32px}.hero-logo img{max-width:320px;max-height:140px;filter:drop-shadow(0 18px 38px rgba(0,0,0,.22))}.eyebrow,.section-label{font-size:11px;text-transform:uppercase;letter-spacing:.18em;font-weight:800}.eyebrow{color:rgba(246,241,231,.62);margin-bottom:20px}.hero h1{font-family:var(--display);font-size:clamp(58px,9vw,118px);line-height:.88;font-weight:400;letter-spacing:-.045em;max-width:900px}.hero h1 em{font-style:italic;color:var(--accent)}.hero p{font-family:var(--display);font-size:clamp(22px,2.8vw,34px);line-height:1.12;color:rgba(246,241,231,.78);max-width:760px;margin-top:28px}.hero-meta{display:flex;gap:36px;flex-wrap:wrap;margin-top:52px;padding-top:26px;border-top:1px solid rgba(246,241,231,.16)}.hero-meta span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:rgba(246,241,231,.42);font-weight:800;margin-bottom:4px}.hero-meta b{font-size:14px;color:var(--cream);font-weight:500}section{padding:86px 0;border-bottom:1px solid var(--line)}.section-label{color:var(--primary);margin-bottom:18px}.section-title{font-family:var(--display);font-size:clamp(38px,5.5vw,70px);line-height:.94;font-weight:400;letter-spacing:-.03em;max-width:760px;margin-bottom:18px}.section-title span{font-style:italic;color:var(--primary)}.section-sub{max-width:720px;color:rgba(21,20,15,.68);line-height:1.75;margin-bottom:42px}.logo-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2px}.logo-grid.single{grid-template-columns:1fr}.logo-cell{min-height:260px;padding:28px;background:#fbf8f0;border:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between}.logo-cell.dark{background:var(--primary);color:var(--cream)}.logo-cell.accent{background:var(--accent);color:${readableTextColor(accent)}}.logo-stage{flex:1;display:flex;align-items:center;justify-content:center;padding:24px}.logo-img{max-width:82%;max-height:150px;object-fit:contain;filter:drop-shadow(0 14px 28px rgba(0,0,0,.16))}.icon-img{max-width:150px}.cell-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:10px;text-transform:uppercase;letter-spacing:.14em;font-weight:800;color:currentColor;opacity:.72}.dl-mini{display:inline-flex;gap:7px;align-items:center;text-decoration:none;border:1px solid currentColor;border-radius:999px;padding:6px 9px;opacity:.8}.dl-mini span{font-weight:900}.palette-row{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid var(--line);overflow:hidden}.swatch{aspect-ratio:1;position:relative}.swatch span{position:absolute;left:14px;bottom:12px;font-size:10px;text-transform:uppercase;letter-spacing:.13em;font-weight:900}.color-details{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:20px}.color-detail{background:rgba(255,255,255,.38);border:1px solid rgba(21,20,15,.1);padding:16px;min-height:134px}.color-dot{width:30px;height:30px;border-radius:50%;border:1px solid rgba(21,20,15,.12);margin-bottom:12px}.color-detail-name{font-weight:700;font-size:13px;margin-bottom:6px}.color-detail-values{font:500 11px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(21,20,15,.56)}.type-grid,.usage-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px}.type-cell,.usage-card{background:#fbf8f0;border:1px solid var(--line);padding:38px}.type-cell.dark{background:var(--primary);color:var(--cream)}.type-role,.usage-tag{font-size:10px;text-transform:uppercase;letter-spacing:.16em;font-weight:900;color:currentColor;opacity:.56;margin-bottom:22px}.spec-big{font-family:var(--display);font-size:clamp(44px,6vw,76px);line-height:.9;margin-bottom:22px}.spec-light{font-family:var(--display);font-size:35px;line-height:1.05;margin-bottom:22px;color:var(--primary)}.type-cell.dark .spec-light{color:var(--accent)}.spec-glyphs{font-size:13px;letter-spacing:.04em;opacity:.68;margin-bottom:26px}.type-name{font-weight:700;margin-bottom:4px}.type-meta,.type-usage{font-size:12px;color:currentColor;opacity:.62}.type-usage{border-top:1px solid rgba(128,128,128,.22);padding-top:16px;margin-top:16px}.mockup-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.mockup{aspect-ratio:1;border-radius:28px;position:relative;overflow:hidden;border:1px solid rgba(21,20,15,.12);box-shadow:0 24px 70px rgba(21,20,15,.10);padding:34px;display:flex;align-items:center;justify-content:center}.m-profile{background:var(--primary)}.m-web{background:#efe7d8}.m-card{background:var(--secondary)}.m-social{background:var(--accent);color:${readableTextColor(accent)}}.avatar{width:54%;aspect-ratio:1;border-radius:50%;background:rgba(246,241,231,.12);display:grid;place-items:center;padding:34px}.mock-img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 16px 30px rgba(0,0,0,.18))}.browser{width:86%;background:#fbf8f0;border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.15);overflow:hidden}.browser-bar{height:34px;display:flex;gap:7px;align-items:center;padding-left:14px;border-bottom:1px solid rgba(21,20,15,.1)}.browser-bar i{width:8px;height:8px;border-radius:50%;background:rgba(21,20,15,.22)}.browser-logo{min-height:150px;display:grid;place-items:center;padding:26px}.print-card{width:74%;aspect-ratio:1.55;background:#fbf8f0;border-radius:18px;display:grid;place-items:center;padding:26px;transform:rotate(-4deg);box-shadow:0 20px 50px rgba(0,0,0,.22)}.social-statement{width:82%;text-align:center}.social-statement img{margin:0 auto 22px;max-height:160px}.social-statement p{font-family:var(--display);font-size:28px;line-height:1.02}.mock-label{position:absolute;left:26px;bottom:22px;font-size:9px;text-transform:uppercase;letter-spacing:.16em;font-weight:900;opacity:.45}.mockup .dl-mini{position:absolute;right:22px;top:22px;background:rgba(246,241,231,.86);color:var(--primary);opacity:1}.usage-card.do{border-top:3px solid var(--primary)}.usage-card.dont{border-top:3px solid #963C32}.usage-card ul{list-style:none;display:grid;gap:12px}.usage-card li{position:relative;padding-left:20px;color:rgba(21,20,15,.68);line-height:1.5}.usage-card.do li:before{content:'✓';position:absolute;left:0;color:var(--primary);font-weight:900}.usage-card.dont li:before{content:'×';position:absolute;left:0;color:#963C32;font-weight:900}.download-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.download-card{background:#fbf8f0;border:1px solid var(--line);padding:26px;min-height:260px;display:flex;flex-direction:column}.download-icon{width:42px;height:42px;background:var(--primary);color:var(--cream);display:grid;place-items:center;font-family:var(--display);font-size:24px;margin-bottom:18px}.download-card h3{font-size:16px;margin-bottom:8px}.download-card p{font-size:13px;color:rgba(21,20,15,.58);line-height:1.5;margin-bottom:18px}.download-list{margin-top:auto;display:grid;gap:8px}.download-list a{display:flex;align-items:center;justify-content:space-between;gap:12px;text-decoration:none;border-top:1px solid rgba(21,20,15,.1);padding-top:8px;font-size:12px;color:var(--primary);font-weight:700}.download-list span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(21,20,15,.64);font-weight:600}.download-list b{font-size:10px;letter-spacing:.1em}footer{background:var(--primary);color:var(--cream);padding:34px 0}.footer-inner{max-width:1120px;margin:0 auto;padding:0 42px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}.footer-inner span{font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:rgba(246,241,231,.48);font-weight:800}@media(max-width:860px){.container,.header-inner,.footer-inner{padding-left:24px;padding-right:24px}.logo-grid,.type-grid,.usage-grid,.mockup-row,.download-grid{grid-template-columns:1fr}.palette-row{grid-template-columns:repeat(3,1fr)}.color-details{grid-template-columns:repeat(2,1fr)}.hero{padding:72px 0}.hero h1{font-size:54px}.section-title{font-size:42px}}@media print{header,.dl-mini{display:none!important}body:before{display:none}section{break-inside:avoid}}
</style>
</head>
<body>
<header><div class="header-inner"><div class="studio-word">Moving Day Studio</div><div class="client-label">${esc(normalized.clientName)} · Brand Guide</div></div></header>
<main>
<section class="hero"><div class="container">
  ${heroLogo ? `<div class="hero-logo">${assetImg(heroLogo, 'hero-logo-img', normalized.clientName)}</div>` : ''}
  <div class="eyebrow">Brand Identity Guide</div>
  <h1>${esc(normalized.clientName)}<br><em>identity system.</em></h1>
  <p>${esc(normalized.heroDescription)}</p>
  <div class="hero-meta"><div><span>Category</span><b>${esc(normalized.category)}</b></div><div><span>Delivered</span><b>${esc(normalized.deliveryDate)}</b></div><div><span>Sprint</span><b>${esc(normalized.sprint)}</b></div><div><span>Assets</span><b>${esc(normalized.assetCount)}</b></div></div>
</div></section>
${renderLogoSystem(payload, normalized)}
${renderPalette(normalized.colors)}
${renderTypography(normalized)}
${renderInUse(payload, normalized)}
${renderUsage(normalized)}
${renderDownloads(payload, normalized)}
</main>
<footer><div class="footer-inner"><div>${esc(normalized.clientName)} · Brand Identity Guide</div><span>Built by Moving Day Studio</span></div></footer>
</body>
</html>`;
}

module.exports = { renderBrandGuide, safeName };
