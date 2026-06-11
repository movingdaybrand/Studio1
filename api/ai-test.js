export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.status(200).send(String.raw`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Moving Day AI Visual Review</title>

  <style>
    :root {
      --cream: #F1ECDF;
      --paper: #FBF8F0;
      --forest: #1F3D2E;
      --forest-deep: #14291F;
      --moss: #2D5642;
      --sage: #C4D9CB;
      --ink: #15140F;
      --muted: #6B6558;
      --clay: #5B3D35;
      --rule: rgba(21, 20, 15, .12);
      --shadow: 0 30px 90px rgba(0,0,0,.24);
      --display: Georgia, "Times New Roman", serif;
      --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }

    body {
      margin: 0;
      font-family: var(--sans);
      background:
        radial-gradient(circle at 88% 0%, rgba(196,217,203,.25), transparent 32%),
        radial-gradient(circle at 10% 4%, rgba(241,236,223,.08), transparent 28%),
        linear-gradient(145deg, #07110c, #10241a);
      color: var(--cream);
      min-height: 100vh;
      padding: 32px;
      -webkit-font-smoothing: antialiased;
    }

    button, input { font: inherit; }
    button { cursor: pointer; }
    img { max-width: 100%; display: block; }

    .wrap { max-width: 1180px; margin: 0 auto; }

    .topbar {
      position: sticky;
      top: 18px;
      z-index: 20;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 10px 12px 10px 16px;
      margin-bottom: 24px;
      border: 1px solid rgba(241,236,223,.14);
      border-radius: 999px;
      background: rgba(7, 17, 12, .66);
      backdrop-filter: blur(18px);
      box-shadow: 0 18px 48px rgba(0,0,0,.18);
    }

    .brand-mini {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .brand-dot {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      background: var(--sage);
      position: relative;
      flex: 0 0 auto;
    }

    .brand-dot:before,
    .brand-dot:after {
      content: "";
      position: absolute;
      top: 8px;
      bottom: 8px;
      width: 9px;
      background: var(--forest-deep);
    }

    .brand-dot:before {
      left: 5px;
      clip-path: polygon(0 0, 100% 50%, 0 100%);
    }

    .brand-dot:after {
      right: 5px;
      clip-path: polygon(100% 0, 0 50%, 100% 100%);
    }

    .brand-mini strong {
      font-size: 11px;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: var(--cream);
      white-space: nowrap;
    }

    .brand-mini span {
      font-size: 10px;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: rgba(241,236,223,.48);
      font-weight: 900;
      white-space: nowrap;
    }

    .top-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .top-pill {
      border: 1px solid rgba(241,236,223,.14);
      background: rgba(241,236,223,.07);
      color: var(--cream);
      border-radius: 999px;
      padding: 9px 12px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      text-decoration: none;
    }

    .hero {
      border: 1px solid rgba(241,236,223,.14);
      border-radius: 34px;
      padding: 44px;
      background:
        radial-gradient(circle at 82% 0%, rgba(196,217,203,.12), transparent 34%),
        rgba(251,248,240,.055);
      margin-bottom: 24px;
      box-shadow: var(--shadow);
      overflow: hidden;
      position: relative;
    }

    .hero:after {
      content: "";
      position: absolute;
      right: -80px;
      top: -80px;
      width: 280px;
      height: 280px;
      border-radius: 999px;
      background: rgba(196,217,203,.08);
      pointer-events: none;
    }

    .eyebrow {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--sage);
      margin-bottom: 14px;
      position: relative;
      z-index: 1;
    }

    h1 {
      font-family: var(--display);
      font-size: clamp(48px, 7vw, 86px);
      line-height: .92;
      font-weight: 400;
      letter-spacing: -.05em;
      margin: 0 0 16px;
      position: relative;
      z-index: 1;
    }

    p {
      color: rgba(241,236,223,.72);
      max-width: 720px;
    }

    .panel {
      background: var(--paper);
      color: var(--ink);
      border-radius: 32px;
      padding: 26px;
      box-shadow: 0 24px 70px rgba(0,0,0,.22);
      margin-bottom: 24px;
    }

    .upload {
      border: 1px dashed rgba(31,61,46,.28);
      border-radius: 24px;
      padding: 24px;
      background: #F6F2E8;
      margin-bottom: 18px;
    }

    .upload strong {
      display: block;
      margin-bottom: 8px;
      color: var(--forest);
    }

    .file-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: center;
      margin-top: 14px;
    }

    input[type="file"] {
      width: 100%;
      color: var(--muted);
    }

    input[type="file"]::file-selector-button {
      border: 1px solid rgba(31,61,46,.16);
      background: white;
      color: var(--forest);
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      cursor: pointer;
      margin-right: 12px;
    }

    .button-primary {
      border: 0;
      border-radius: 999px;
      padding: 13px 18px;
      background: var(--forest);
      color: var(--cream);
      font-weight: 900;
      box-shadow: 0 12px 28px rgba(31,61,46,.16);
      white-space: nowrap;
    }

    .button-primary:hover { transform: translateY(-1px); }

    .button-primary:disabled {
      opacity: .5;
      cursor: not-allowed;
      transform: none;
    }

    .ghost-btn {
      border: 1px solid rgba(31,61,46,.14);
      background: white;
      color: var(--forest);
      border-radius: 999px;
      padding: 10px 12px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    .results {
      display: grid;
      gap: 14px;
      margin-top: 22px;
    }

    .section-card {
      border: 1px solid var(--rule);
      border-radius: 24px;
      background: white;
      overflow: hidden;
    }

    .section-head {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(21,20,15,.08);
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 14px;
    }

    .section-head h3 {
      margin: 0;
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--forest);
    }

    .section-head p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.4;
    }

    .section-body { padding: 20px; }

    .small {
      color: var(--muted) !important;
      font-size: 13px;
      line-height: 1.5;
      max-width: 900px;
    }

    .big-name {
      font-family: var(--display);
      font-size: 34px;
      line-height: 1;
      letter-spacing: -.04em;
      color: var(--ink);
      margin: 2px 0 12px;
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(31,61,46,.14);
      border-radius: 999px;
      padding: 7px 10px;
      font-size: 10px;
      font-weight: 900;
      color: var(--forest);
      background: #F6F2E8;
      letter-spacing: .06em;
      text-transform: uppercase;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .visual-board {
      display: grid;
      grid-template-columns: 1.35fr .8fr;
      gap: 14px;
    }

    .brand-stage {
      min-height: 360px;
      border-radius: 26px;
      overflow: hidden;
      background:
        radial-gradient(circle at 80% 10%, rgba(196,217,203,.26), transparent 32%),
        linear-gradient(135deg, var(--forest), var(--forest-deep));
      color: var(--cream);
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 24px;
      position: relative;
    }

    .stage-label {
      font-size: 10px;
      letter-spacing: .16em;
      text-transform: uppercase;
      font-weight: 900;
      opacity: .58;
      position: relative;
      z-index: 2;
    }

    .stage-logo {
      display: grid;
      place-items: center;
      min-height: 210px;
      position: relative;
      z-index: 2;
    }

    .stage-logo img {
      max-width: 82%;
      max-height: 170px;
      object-fit: contain;
      filter: drop-shadow(0 16px 30px rgba(0,0,0,.22));
    }

    .stage-title {
      font-family: var(--display);
      font-size: 38px;
      line-height: .95;
      letter-spacing: -.04em;
      max-width: 540px;
      position: relative;
      z-index: 2;
    }

    .visual-side {
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 14px;
    }

    .mini-visual {
      min-height: 170px;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(21,20,15,.08);
      background: #F6F2E8;
      display: grid;
      place-items: center;
      padding: 20px;
      position: relative;
    }

    .mini-visual.dark { background: var(--ink); }

    .mini-visual img {
      max-width: 80%;
      max-height: 90px;
      object-fit: contain;
    }

    .mini-visual span {
      position: absolute;
      left: 14px;
      bottom: 12px;
      font-size: 10px;
      letter-spacing: .13em;
      text-transform: uppercase;
      font-weight: 900;
      color: rgba(21,20,15,.46);
    }

    .mini-visual.dark span { color: rgba(241,236,223,.58); }

    .application-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }

    .application-card {
      aspect-ratio: 1;
      min-height: 190px;
      border-radius: 26px;
      overflow: hidden;
      border: 1px solid rgba(21,20,15,.1);
      display: grid;
      place-items: center;
      padding: 24px;
      position: relative;
      background: var(--paper);
    }

    .application-card.profile { background: var(--forest); }
    .application-card.print { background: #F6F2E8; }
    .application-card.dark { background: var(--ink); }

    .application-card.social {
      background:
        radial-gradient(circle at center, rgba(31,61,46,.12), transparent 40%),
        var(--sage);
    }

    .application-card img {
      max-width: 78%;
      max-height: 78%;
      object-fit: contain;
      position: relative;
      z-index: 2;
    }

    .application-card label {
      position: absolute;
      left: 16px;
      bottom: 14px;
      font-size: 10px;
      letter-spacing: .13em;
      text-transform: uppercase;
      color: rgba(21,20,15,.48);
      font-weight: 900;
    }

    .application-card.profile label,
    .application-card.dark label { color: rgba(241,236,223,.58); }

    .swatches {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      border: 1px solid var(--rule);
      border-radius: 22px;
      overflow: hidden;
      margin-top: 10px;
    }

    .swatch {
      min-height: 180px;
      background: #fff;
      position: relative;
      border-right: 1px solid rgba(21,20,15,.08);
    }

    .swatch:last-child { border-right: 0; }

    .swatch span {
      position: absolute;
      left: 14px;
      bottom: 14px;
      font-size: 11px;
      font-weight: 900;
      line-height: 1.35;
      color: var(--ink);
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .swatch.is-dark span { color: var(--cream); }

    .type-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .type-card {
      background: #FBF8F0;
      border: 1px solid rgba(21,20,15,.1);
      border-radius: 22px;
      padding: 24px;
    }

    .type-card small {
      display: block;
      margin-bottom: 22px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .16em;
      font-weight: 900;
      color: var(--forest);
    }

    .type-display {
      font-family: var(--display);
      font-size: clamp(46px, 6vw, 74px);
      letter-spacing: -.06em;
      line-height: .88;
      color: var(--ink);
    }

    .type-body {
      font-size: 25px;
      letter-spacing: -.02em;
      line-height: 1.18;
      color: var(--ink);
      max-width: 450px;
    }

    .asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 12px;
    }

    .asset-card {
      border: 1px solid rgba(21,20,15,.1);
      background: #FBF8F0;
      border-radius: 18px;
      padding: 14px;
      min-width: 0;
    }

    .asset-thumb {
      height: 118px;
      border-radius: 14px;
      border: 1px solid rgba(21,20,15,.08);
      background:
        linear-gradient(45deg, rgba(21,20,15,.04) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(21,20,15,.04) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(21,20,15,.04) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(21,20,15,.04) 75%),
        #fff;
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      display: grid;
      place-items: center;
      padding: 14px;
      margin-bottom: 12px;
      overflow: hidden;
    }

    .asset-thumb.dark { background: var(--ink); }

    .asset-thumb img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }

    .asset-card strong {
      display: block;
      color: var(--forest);
      margin-bottom: 6px;
      overflow-wrap: anywhere;
    }

    .quality {
      display: inline-flex;
      margin-top: 8px;
      border-radius: 999px;
      padding: 5px 8px;
      background: var(--forest);
      color: var(--cream);
      font-size: 10px;
      font-weight: 900;
    }

    .download-card {
      border: 1px solid rgba(21,20,15,.1);
      background: #FBF8F0;
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 10px;
    }

    .download-card strong { color: var(--ink); }

    .download-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .download-cta {
      background: var(--ink);
      color: var(--cream);
      border-radius: 22px;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-top: 16px;
    }

    .download-cta strong {
      display: block;
      font-size: 20px;
      margin-bottom: 4px;
    }

    .download-cta p {
      color: rgba(241,236,223,.72);
      margin: 0;
      font-size: 13px;
    }

    .download-cta button {
      background: #C8B89F;
      color: var(--ink);
      border: 0;
      border-radius: 999px;
      padding: 13px 18px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    details {
      border: 1px solid var(--rule);
      border-radius: 20px;
      background: white;
      overflow: hidden;
    }

    summary {
      cursor: pointer;
      padding: 18px 20px;
      color: var(--forest);
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      font-weight: 900;
    }

    pre {
      white-space: pre-wrap;
      word-break: break-word;
      background: #10241a;
      color: var(--cream);
      margin: 0;
      padding: 16px;
      font-size: 12px;
      overflow: auto;
      max-height: 620px;
    }

    .error {
      background: #fff3ef;
      border-color: rgba(156,60,60,.24);
    }

    .error .section-head h3 { color: #9C3C3C; }

    @media (max-width: 980px) {
      body { padding: 18px; }

      .hero,
      .panel {
        padding: 24px;
        border-radius: 24px;
      }

      .analysis-grid,
      .visual-board,
      .type-grid,
      .download-layout {
        grid-template-columns: 1fr;
      }

      .application-grid,
      .swatches {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .topbar,
      .file-row,
      .download-cta {
        align-items: flex-start;
        flex-direction: column;
      }
    }

    @media (max-width: 560px) {
      .application-grid,
      .swatches {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>

<body>
  <main class="wrap">
    <nav class="topbar">
      <div class="brand-mini">
        <div class="brand-dot"></div>
        <strong>Moving Day</strong>
        <span>AI Review Lab</span>
      </div>

      <div class="top-actions">
        <a class="top-pill" href="/">Back to Builder</a>
        <a class="top-pill" href="/api/analyze-brand-files">API Route</a>
      </div>
    </nav>

    <section class="hero">
      <div class="eyebrow">Moving Day Studio · AI Test</div>
      <h1>AI Brand Analysis Review</h1>
      <p>This is the safe staging room. Analyze uploaded files here first, review the visual system, then decide what should eventually move into the real builder.</p>
    </section>

    <section class="panel">
      <div class="upload">
        <strong>Upload brand files</strong>
        <p class="small">Try logos, screenshots, PNGs, JPGs, or SVGs. The review below will turn the response into visuals, applications, colors, type, file groups, and production notes.</p>

        <div class="file-row">
          <input id="files" type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg" />
          <button id="analyzeBtn" class="button-primary">Analyze Brand</button>
        </div>
      </div>

      <div id="results" class="results"></div>
    </section>
  </main>

  <script>
    const filesInput = document.getElementById("files");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const results = document.getElementById("results");
    let uploadedAssets = [];

    filesInput.addEventListener("change", async function () {
      const files = Array.from(filesInput.files || []);
      uploadedAssets = await Promise.all(files.map(async function (file, index) {
        return {
          id: "asset_" + (index + 1),
          name: file.name,
          type: file.type,
          dataUrl: await fileToDataUrl(file)
        };
      }));
    });

    analyzeBtn.addEventListener("click", async function () {
      const files = Array.from(filesInput.files || []);

      if (!files.length) {
        alert("Upload at least one brand file first.");
        return;
      }

      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Analyzing...";
      results.innerHTML = "";

      try {
        if (!uploadedAssets.length) {
          uploadedAssets = await Promise.all(files.map(async function (file, index) {
            return {
              id: "asset_" + (index + 1),
              name: file.name,
              type: file.type,
              dataUrl: await fileToDataUrl(file)
            };
          }));
        }

        const response = await fetch("/api/analyze-brand-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assets: uploadedAssets })
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        renderResults(data);
      } catch (error) {
        results.innerHTML =
          '<div class="section-card error">' +
            '<div class="section-head">' +
              '<div>' +
                '<h3>Error</h3>' +
                '<p>' + escapeHtml(error.message) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>';
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Brand";
      }
    });

    function fileToDataUrl(file) {
      return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function renderResults(data) {
      const guide = data.guide || {};
      const selectedAssets = data.selectedAssets || {};
      const colors = normalizeColors(data.colors || data.palette || []);
      const typography = data.typography || {};
      const usage = data.usage || {};
      const downloadCards = data.downloadCards || [];
      const assetReport = data.assetReport || [];

      const selectedAssetRows = Object.entries(selectedAssets)
        .filter(function (entry) { return entry[1]; })
        .map(function (entry) {
          return {
            slot: entry[0],
            file: entry[1],
            asset: findAsset(entry[1])
          };
        });

      const heroAsset = pickAsset(selectedAssets.heroLogo, selectedAssets.primaryLogo, selectedAssets.websiteHeader) || firstImageAsset();
      const primaryAsset = pickAsset(selectedAssets.primaryLogo, selectedAssets.heroLogo) || firstImageAsset();
      const iconAsset = pickAsset(selectedAssets.iconMark, selectedAssets.iconVariant, selectedAssets.profileImage) || firstImageAsset();
      const profileAsset = pickAsset(selectedAssets.profileImage, selectedAssets.iconMark, selectedAssets.iconVariant) || iconAsset;
      const websiteAsset = pickAsset(selectedAssets.websiteHeader, selectedAssets.heroLogo, selectedAssets.primaryLogo) || primaryAsset;

      results.innerHTML =
        renderIdentitySection(guide, assetReport) +
        renderVisualSystemSection(guide, heroAsset, primaryAsset, iconAsset) +
        renderApplicationsSection(profileAsset, primaryAsset, iconAsset, websiteAsset) +
        renderColorSection(colors) +
        renderTypeSection(typography, guide) +
        renderSelectedAssetsSection(selectedAssetRows) +
        renderUsageSection(usage) +
        renderDownloadSection(downloadCards) +
        renderAssetReportSection(assetReport) +
        '<details>' +
          '<summary>Show Developer JSON</summary>' +
          '<pre>' + escapeHtml(JSON.stringify(data, null, 2)) + '</pre>' +
        '</details>';
    }

    function renderIdentitySection(guide, assetReport) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Brand Identity</h3>' +
              '<p>Detected client information and working brand summary.</p>' +
            '</div>' +
            '<span class="chip">Review</span>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="big-name">' + escapeHtml(guide.clientName || "Unknown brand") + '</div>' +
            '<p class="small"><strong>Category:</strong> ' + escapeHtml(guide.category || "Not detected") + '</p>' +
            '<p class="small">' + escapeHtml(guide.description || "") + '</p>' +
            '<div class="chip-row">' +
              '<span class="chip">Assets: ' + escapeHtml(guide.assetCount || assetReport.length || 0) + '</span>' +
              '<span class="chip">Source: AI Analysis</span>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderVisualSystemSection(guide, heroAsset, primaryAsset, iconAsset) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Visual System</h3>' +
              '<p>A preview of the strongest marks translated into a brand guide direction.</p>' +
            '</div>' +
            '<button class="ghost-btn">Apply later</button>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="visual-board">' +
              '<div class="brand-stage">' +
                '<div class="stage-label">Hero / Brand Lead</div>' +
                '<div class="stage-logo">' + assetImg(heroAsset, "Hero logo") + '</div>' +
                '<div class="stage-title">' + escapeHtml(guide.clientName || "Brand Identity") + '<br>Visual System</div>' +
              '</div>' +
              '<div class="visual-side">' +
                '<div class="mini-visual">' +
                  assetImg(primaryAsset, "Primary logo") +
                  '<span>Primary Mark</span>' +
                '</div>' +
                '<div class="mini-visual dark">' +
                  assetImg(iconAsset, "Icon mark") +
                  '<span>Icon / Small Use</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderApplicationsSection(profileAsset, primaryAsset, iconAsset, websiteAsset) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Applications</h3>' +
              '<p>Quick previews for how the selected assets could show up in real-world use.</p>' +
            '</div>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="application-grid">' +
              '<div class="application-card profile">' + assetImg(profileAsset, "Profile asset") + '<label>Profile</label></div>' +
              '<div class="application-card print">' + assetImg(primaryAsset, "Print asset") + '<label>Print</label></div>' +
              '<div class="application-card dark">' + assetImg(iconAsset, "Icon asset") + '<label>Favicon</label></div>' +
              '<div class="application-card social">' + assetImg(websiteAsset, "Website asset") + '<label>Website / Social</label></div>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderColorSection(colors) {
      const finalColors = colors.length ? colors : [
        { name: "Ink", hex: "#15140F" },
        { name: "Paper", hex: "#F1ECDF" },
        { name: "Forest", hex: "#1F3D2E" },
        { name: "Sage", hex: "#C4D9CB" },
        { name: "Clay", hex: "#5B3D35" }
      ];

      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Color System</h3>' +
              '<p>Detected or proposed colors organized for guide use.</p>' +
            '</div>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="swatches">' +
              finalColors.slice(0, 5).map(function (color) {
                const hex = color.hex || color.value || color;
                const name = color.name || "Color";
                const isDark = isDarkColor(hex);
                return (
                  '<div class="swatch ' + (isDark ? "is-dark" : "") + '" style="background:' + escapeHtml(hex) + '">' +
                    '<span>' + escapeHtml(name) + '<br>' + escapeHtml(hex) + '</span>' +
                  '</div>'
                );
              }).join("") +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderTypeSection(typography, guide) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Typography</h3>' +
              '<p>Suggested type hierarchy for the guide and handoff page.</p>' +
            '</div>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="type-grid">' +
              '<div class="type-card">' +
                '<small>Display</small>' +
                '<div class="type-display">' + escapeHtml(guide.clientName || "Brand System") + '</div>' +
                '<p class="small"><strong>Detected:</strong> ' + escapeHtml(typography.displayFont || "Unknown / not provided") + '</p>' +
              '</div>' +
              '<div class="type-card">' +
                '<small>Body / UI</small>' +
                '<div class="type-body">Clear usage notes, download labels, file descriptions, and practical brand guidance.</div>' +
                '<p class="small"><strong>Detected:</strong> ' + escapeHtml(typography.bodyFont || "Unknown / not provided") + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderSelectedAssetsSection(selectedAssetRows) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Selected Assets</h3>' +
              '<p>Recommended placements based on uploaded files.</p>' +
            '</div>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="asset-grid">' +
              (
                selectedAssetRows.length
                  ? selectedAssetRows.map(function (item) {
                      return (
                        '<div class="asset-card">' +
                          '<div class="asset-thumb ' + (darkThumb(item.slot) ? "dark" : "") + '">' +
                            assetImg(item.asset, item.file) +
                          '</div>' +
                          '<strong>' + escapeHtml(prettyLabel(item.slot)) + '</strong>' +
                          '<p class="small">' + escapeHtml(item.file) + '</p>' +
                          '<div class="chip-row">' +
                            '<button class="ghost-btn">Apply</button>' +
                            '<button class="ghost-btn">Ignore</button>' +
                          '</div>' +
                        '</div>'
                      );
                    }).join("")
                  : '<p class="small">No selected assets returned.</p>'
              ) +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderUsageSection(usage) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Usage Guidance</h3>' +
              '<p>Starter rules for protecting the identity system.</p>' +
            '</div>' +
          '</div>' +
          '<div class="section-body analysis-grid">' +
            '<div>' +
              '<h4>Do</h4>' +
              ((usage.do || []).length ? (usage.do || []).map(function (item) {
                return '<p class="small">✓ ' + escapeHtml(item) + '</p>';
              }).join("") : '<p class="small">No usage guidance returned.</p>') +
            '</div>' +
            '<div>' +
              '<h4>Don’t</h4>' +
              ((usage.dont || []).length ? (usage.dont || []).map(function (item) {
                return '<p class="small">✕ ' + escapeHtml(item) + '</p>';
              }).join("") : '<p class="small">No restrictions returned.</p>') +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderDownloadSection(downloadCards) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Files / Handoff</h3>' +
              '<p>Download groups generated from the uploaded asset set.</p>' +
            '</div>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="download-layout">' +
              (
                downloadCards.length
                  ? downloadCards.map(function (card) {
                      return (
                        '<div class="download-card">' +
                          '<strong>' + escapeHtml(card.title || "Download Card") + '</strong>' +
                          '<p class="small">' + escapeHtml(card.description || "") + '</p>' +
                          '<div class="chip-row">' +
                            (card.formats || []).map(function (format) {
                              return '<span class="chip">' + escapeHtml(format) + '</span>';
                            }).join("") +
                          '</div>' +
                          '<p class="small"><strong>Files:</strong> ' + (card.files || []).map(escapeHtml).join(", ") + '</p>' +
                        '</div>'
                      );
                    }).join("")
                  : '<p class="small">No download cards returned.</p>'
              ) +
            '</div>' +
            '<div class="download-cta">' +
              '<div>' +
                '<strong>Production package preview</strong>' +
                '<p>This is where generated SVGs, PNG colorways, PDF, favicon, and asset index would be approved before client handoff.</p>' +
              '</div>' +
              '<button>Generate Later</button>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function renderAssetReportSection(assetReport) {
      return (
        '<section class="section-card">' +
          '<div class="section-head">' +
            '<div>' +
              '<h3>Asset Report</h3>' +
              '<p>File-by-file analysis with role, placement, and quality notes.</p>' +
            '</div>' +
          '</div>' +
          '<div class="section-body">' +
            '<div class="asset-grid">' +
              (
                assetReport.length
                  ? assetReport.map(function (asset) {
                      const matched = findAsset(asset.name);
                      return (
                        '<div class="asset-card">' +
                          '<div class="asset-thumb">' + assetImg(matched, asset.name || "Asset") + '</div>' +
                          '<strong>' + escapeHtml(asset.name || "Asset") + '</strong>' +
                          '<p class="small"><strong>Role:</strong> ' + escapeHtml(asset.assetRole || "Unknown") + '</p>' +
                          '<p class="small"><strong>Placement:</strong> ' + escapeHtml(asset.placement || "Not assigned") + '</p>' +
                          '<p class="small">' + escapeHtml(asset.reason || "") + '</p>' +
                          '<span class="quality">Quality ' + escapeHtml(asset.qualityScore || "N/A") + ' / 10</span>' +
                        '</div>'
                      );
                    }).join("")
                  : '<p class="small">No asset report returned.</p>'
              ) +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }

    function normalizeColors(colors) {
      return (colors || [])
        .map(function (color) {
          if (typeof color === "string") {
            return { name: "Color", hex: color };
          }
          return color;
        })
        .filter(function (color) {
          return color && (color.hex || color.value);
        });
    }

    function pickAsset() {
      const names = Array.from(arguments);
      for (const name of names) {
        const asset = findAsset(name);
        if (asset) return asset;
      }
      return null;
    }

    function firstImageAsset() {
      return uploadedAssets.find(function (asset) {
        return String(asset.type || "").startsWith("image/");
      }) || null;
    }

    function findAsset(name) {
      if (!name) return null;
      const normalized = normalizeName(name);
      return uploadedAssets.find(function (asset) {
        return normalizeName(asset.name) === normalized;
      }) || uploadedAssets.find(function (asset) {
        return normalizeName(asset.name).includes(normalized);
      }) || uploadedAssets.find(function (asset) {
        return normalized.includes(normalizeName(asset.name));
      });
    }

    function normalizeName(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function assetImg(asset, alt) {
      if (!asset || !asset.dataUrl) {
        return '<span class="small">' + escapeHtml(alt || "No preview") + '</span>';
      }
      return '<img src="' + asset.dataUrl + '" alt="' + escapeHtml(alt || asset.name) + '">';
    }

    function darkThumb(slot) {
      return /icon|dark|variant/i.test(slot || "");
    }

    function prettyLabel(value) {
      return String(value || "")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, function (char) { return char.toUpperCase(); });
    }

    function isDarkColor(hex) {
      const clean = String(hex || "").replace("#", "");
      if (clean.length !== 6) return false;
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
      return luminance < 140;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
  </script>
</body>
</html>`);
}
