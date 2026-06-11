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
      --rule: rgba(21,20,15,.12);
    }

    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: radial-gradient(circle at top right, rgba(196,217,203,.28), transparent 30%),
        linear-gradient(145deg, #07110c, #10241a);
      color: var(--cream);
      min-height: 100vh;
      padding: 32px;
    }

    .wrap {
      max-width: 1100px;
      margin: 0 auto;
    }

    .hero {
      border: 1px solid rgba(241,236,223,.14);
      border-radius: 32px;
      padding: 44px;
      background: rgba(251,248,240,.06);
      margin-bottom: 24px;
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
      max-width: 640px;
    }

    .panel {
      background: var(--paper);
      color: var(--ink);
      border-radius: 28px;
      padding: 26px;
      box-shadow: 0 24px 70px rgba(0,0,0,.22);
    }

    .upload {
      border: 1px dashed rgba(31,61,46,.28);
      border-radius: 22px;
      padding: 24px;
      background: #F6F2E8;
      margin-bottom: 18px;
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
      font-weight: 800;
      cursor: pointer;
    }

    button:disabled {
      opacity: .5;
      cursor: not-allowed;
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
      padding: 18px;
    }

    .card h3 {
      margin: 0 0 8px;
      font-size: 12px;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: var(--forest);
    }

    .small {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .swatch {
      width: 120px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--rule);
      background: #fff;
    }

    .swatch i {
      display: block;
      height: 60px;
    }

    .swatch span {
      display: block;
      padding: 8px;
      font-size: 11px;
      font-weight: 800;
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
    }
  </style>
</head>

<body>
  <main class="wrap">
    <section class="hero">
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
          <div class="card">
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
      const palette = data.palette || [];
      const assignments = data.assetAssignments || [];
      const copy = data.copySuggestions || {};
      const preflight = data.preflight || [];

      results.innerHTML = \`
        <div class="card">
          <h3>Brand Identity</h3>
          <p><strong>\${escapeHtml(data.brand?.name || "Unknown brand")}</strong></p>
          <p class="small">Industry: \${escapeHtml(data.brand?.industry || "Not detected")}</p>
          <p class="small">Tone: \${(data.brand?.tone || []).map(escapeHtml).join(", ")}</p>
        </div>

        <div class="card">
          <h3>Palette</h3>
          <div class="swatches">
            \${palette.map(color => \`
              <div class="swatch">
                <i style="background:\${escapeHtml(color.hex)}"></i>
                <span>\${escapeHtml(color.name)}<br>\${escapeHtml(color.hex)}</span>
              </div>
            \`).join("")}
          </div>
        </div>

        <div class="card">
          <h3>Asset Placement</h3>
          \${assignments.map(item => \`
            <p class="small">
              <strong>\${escapeHtml(item.slot)}</strong> → \${escapeHtml(item.fileId)}
              <br>\${escapeHtml(item.reason || "")}
            </p>
          \`).join("") || \`<p class="small">No placement recommendations returned.</p>\`}
        </div>

        <div class="card">
          <h3>Copy Suggestions</h3>
          \${Object.entries(copy).map(([key, value]) => \`
            <p class="small">
              <strong>\${escapeHtml(key)}</strong><br>
              \${escapeHtml(value.suggested || "")}
            </p>
          \`).join("") || \`<p class="small">No copy suggestions returned.</p>\`}
        </div>

        <div class="card">
          <h3>Preflight</h3>
          \${preflight.map(item => \`
            <p class="small">
              <strong>\${escapeHtml(item.severity || "note")}</strong>: \${escapeHtml(item.issue || "")}
              <br>\${escapeHtml(item.suggestedFix || "")}
            </p>
          \`).join("") || \`<p class="small">No issues found.</p>\`}
        </div>

        <div class="card">
          <h3>Raw JSON</h3>
          <pre>\${escapeHtml(JSON.stringify(data, null, 2))}</pre>
        </div>
      \`;
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
