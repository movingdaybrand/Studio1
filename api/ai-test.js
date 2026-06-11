export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Moving Day AI Test</title>

  <style>
    :root {
      --cream: #F1ECDF;
      --paper: #FBF8F0;
      --forest: #1F3D2E;
      --forest-deep: #14291F;
      --sage: #C4D9CB;
      --ink: #15140F;
      --muted: #6B6558;
      --rule: rgba(21, 20, 15, .12);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top right, rgba(196,217,203,.28), transparent 30%),
        linear-gradient(145deg, #07110c, #10241a);
      color: var(--cream);
      min-height: 100vh;
      padding: 32px;
    }

    .wrap {
      max-width: 1180px;
      margin: 0 auto;
    }

    .hero {
      border: 1px solid rgba(241,236,223,.14);
      border-radius: 32px;
      padding: 44px;
      background: rgba(251,248,240,.06);
      margin-bottom: 24px;
      box-shadow: 0 24px 70px rgba(0,0,0,.18);
    }

    .eyebrow {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--sage);
      margin-bottom: 14px;
    }

    h1 {
      font-family: Georgia, serif;
      font-size: clamp(48px, 7vw, 86px);
      line-height: .92;
      font-weight: 400;
      letter-spacing: -.05em;
      margin: 0 0 16px;
    }

    p {
      color: rgba(241,236,223,.72);
      max-width: 720px;
    }

    .panel {
      background: var(--paper);
      color: var(--ink);
      border-radius: 28px;
      padding: 26px;
      box-shadow: 0 24px 70px rgba(0,0,0,.22);
      margin-bottom: 24px;
    }

    .upload {
      border: 1px dashed rgba(31,61,46,.28);
      border-radius: 22px;
      padding: 24px;
      background: #F6F2E8;
      margin-bottom: 18px;
    }

    .upload strong {
      display: block;
      margin-bottom: 8px;
      color: var(--forest);
    }

    input {
      width: 100%;
      margin-top: 12px;
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 13px 18px;
      background: var(--forest);
      color: var(--cream);
      font-weight: 900;
      cursor: pointer;
      letter-spacing: -.01em;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: .5;
      cursor: not-allowed;
      transform: none;
    }

    .results {
      display: grid;
      gap: 14px;
      margin-top: 22px;
    }

    .card {
      border: 1px solid var(--rule);
      border-radius: 20px;
      background: white;
      padding: 20px;
      overflow: hidden;
    }

    .card h3 {
      margin: 0 0 12px;
      font-size: 12px;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: var(--forest);
    }

    .card p {
      color: var(--ink);
    }

    .small {
      color: var(--muted) !important;
      font-size: 13px;
      line-height: 1.5;
      max-width: 900px;
    }

    .big-name {
      font-family: Georgia, serif;
      font-size: 30px;
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
      font-size: 11px;
      font-weight: 800;
      color: var(--forest);
      background: #F6F2E8;
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .swatch {
      width: 132px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--rule);
      background: #fff;
    }

    .swatch i {
      display: block;
      height: 70px;
    }

    .swatch span {
      display: block;
      padding: 9px;
      font-size: 11px;
      font-weight: 900;
      line-height: 1.35;
    }

    .asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 12px;
    }

    .asset-card {
      border: 1px solid rgba(21,20,15,.1);
      background: #FBF8F0;
      border-radius: 16px;
      padding: 14px;
    }

    .asset-card strong {
      display: block;
      color: var(--forest);
      margin-bottom: 6px;
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
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 10px;
    }

    .download-card strong {
      color: var(--ink);
    }

    pre {
      white-space: pre-wrap;
      word-break: break-word;
      background: #10241a;
      color: var(--cream);
      border-radius: 16px;
      padding: 16px;
      font-size: 12px;
      overflow: auto;
      max-height: 620px;
    }

    .error {
      background: #fff3ef;
      border-color: rgba(156,60,60,.24);
    }

    .error h3 {
      color: #9C3C3C;
    }

    @media (max-width: 720px) {
      body {
        padding: 18px;
      }

      .hero,
      .panel {
        padding: 24px;
        border-radius: 22px;
      }
    }
  </style>
</head>

<body>
  <main class="wrap">
    <section class="hero">
      <div class="eyebrow">Moving Day Studio · AI Test</div>
      <h1>AI Brand Analysis Test</h1>
      <p>This page is separate from your real builder. Test the AI response here first. Nothing touches your main guide.</p>
    </section>

    <section class="panel">
      <div class="upload">
        <strong>Upload brand files</strong>
        <p class="small">Try logos, screenshots, PNGs, JPGs, or SVGs. This test sends the files to your backend and returns structured brand recommendations.</p>
        <input id="files" type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg" />
      </div>

      <button id="analyzeBtn">Analyze Brand</button>

      <div id="results" class="results"></div>
    </section>
  </main>

  <script>
    const filesInput = document.getElementById("files");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const results = document.getElementById("results");

    analyzeBtn.addEventListener("click", async () => {
      const files = Array.from(filesInput.files || []);

      if (!files.length) {
        alert("Upload at least one brand file first.");
        return;
      }

      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Analyzing...";
      results.innerHTML = "";

      try {
        const assets = await Promise.all(files.map(fileToDataUrl));

        const response = await fetch("/api/analyze-brand-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assets: assets.map((asset, index) => ({
              id: \`asset_\${index + 1}\`,
              name: files[index].name,
              type: files[index].type,
              dataUrl: asset
            }))
          })
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        renderResults(data);
      } catch (error) {
        results.innerHTML = \`
          <div class="card error">
            <h3>Error</h3>
            <p class="small">\${escapeHtml(error.message)}</p>
          </div>
        \`;
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Brand";
      }
    });

    function fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function renderResults(data) {
      const guide = data.guide || {};
      const selectedAssets = data.selectedAssets || {};
      const colors = data.colors || data.palette || [];
      const typography = data.typography || {};
      const usage = data.usage || {};
      const downloadCards = data.downloadCards || [];
      const assetReport = data.assetReport || [];

      const selectedAssetRows = Object.entries(selectedAssets)
        .filter(([key, value]) => value)
        .map(([key, value]) => ({
          slot: key,
          file: value
        }));

      results.innerHTML = \`
        <div class="card">
          <h3>Brand Identity</h3>
          <div class="big-name">\${escapeHtml(guide.clientName || "Unknown brand")}</div>
          <p class="small"><strong>Category:</strong> \${escapeHtml(guide.category || "Not detected")}</p>
          <p class="small">\${escapeHtml(guide.description || "")}</p>
          <div class="chip-row">
            <span class="chip">Assets: \${escapeHtml(guide.assetCount || assetReport.length || 0)}</span>
            <span class="chip">Source: AI Analysis</span>
          </div>
        </div>

        <div class="card">
          <h3>Selected Assets</h3>
          <div class="asset-grid">
            \${selectedAssetRows.map(item => \`
              <div class="asset-card">
                <strong>\${escapeHtml(prettyLabel(item.slot))}</strong>
                <p class="small">\${escapeHtml(item.file)}</p>
              </div>
            \`).join("") || \`<p class="small">No selected assets returned.</p>\`}
          </div>
        </div>

        <div class="card">
          <h3>Palette</h3>
          <div class="swatches">
            \${colors.map(color => {
              const hex = color.hex || color.value || color;
              const name = color.name || "Color";
              return \`
                <div class="swatch">
                  <i style="background:\${escapeHtml(hex)}"></i>
                  <span>\${escapeHtml(name)}<br>\${escapeHtml(hex)}</span>
                </div>
              \`;
            }).join("") || \`<p class="small">No colors returned.</p>\`}
          </div>
        </div>

        <div class="card">
          <h3>Typography</h3>
          <p class="small"><strong>Display:</strong> \${escapeHtml(typography.displayFont || "Not detected")}</p>
          <p class="small"><strong>Body:</strong> \${escapeHtml(typography.bodyFont || "Not detected")}</p>
        </div>

        <div class="card">
          <h3>Usage Guidance</h3>
          <p class="small"><strong>Do</strong></p>
          \${(usage.do || []).map(item => \`<p class="small">✓ \${escapeHtml(item)}</p>\`).join("") || \`<p class="small">No usage guidance returned.</p>\`}

          <p class="small" style="margin-top:12px;"><strong>Don’t</strong></p>
          \${(usage.dont || []).map(item => \`<p class="small">✕ \${escapeHtml(item)}</p>\`).join("") || \`<p class="small">No restrictions returned.</p>\`}
        </div>

        <div class="card">
          <h3>Download Cards</h3>
          \${downloadCards.map(card => \`
            <div class="download-card">
              <strong>\${escapeHtml(card.title || "Download Card")}</strong>
              <p class="small">\${escapeHtml(card.description || "")}</p>
              <div class="chip-row">
                \${(card.formats || []).map(format => \`<span class="chip">\${escapeHtml(format)}</span>\`).join("")}
              </div>
              <p class="small"><strong>Files:</strong> \${(card.files || []).map(escapeHtml).join(", ")}</p>
            </div>
          \`).join("") || \`<p class="small">No download cards returned.</p>\`}
        </div>

        <div class="card">
          <h3>Asset Report</h3>
          <div class="asset-grid">
            \${assetReport.map(asset => \`
              <div class="asset-card">
                <strong>\${escapeHtml(asset.name || "Asset")}</strong>
                <p class="small"><strong>Role:</strong> \${escapeHtml(asset.assetRole || "Unknown")}</p>
                <p class="small"><strong>Placement:</strong> \${escapeHtml(asset.placement || "Not assigned")}</p>
                <p class="small">\${escapeHtml(asset.reason || "")}</p>
                <span class="quality">Quality \${escapeHtml(asset.qualityScore || "N/A")} / 10</span>
              </div>
            \`).join("") || \`<p class="small">No asset report returned.</p>\`}
          </div>
        </div>

        <div class="card">
          <h3>Raw JSON</h3>
          <pre>\${escapeHtml(JSON.stringify(data, null, 2))}</pre>
        </div>
      \`;
    }

    function prettyLabel(value) {
      return String(value || "")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, char => char.toUpperCase());
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
