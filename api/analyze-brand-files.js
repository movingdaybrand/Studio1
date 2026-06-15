const preparationReport = body?.preparationReport || null;
const assets = body?.assets;

if (!Array.isArray(assets) || assets.length === 0) {
  return res.status(400).json({ error: "No assets provided." });
}

const imageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif"
]);

const content = [];

if (preparationReport) {
  content.push({
    type: "text",
    text:
      "The Moving Day app has already prepared these files locally before brand understanding. " +
      "Use this preparation report as source context for file metadata, categories, duplicates, dimensions, and prepared asset counts:\n\n" +
      JSON.stringify(preparationReport, null, 2)
  });
}

for (const asset of assets) {
  const { id, name, type, dataUrl, category, extension, size, width, height } = asset;
  if (!name) continue;

  const metadataText = [
    `File: ${name}`,
    `ID: ${id}`,
    `Type: ${type || "unknown"}`,
    `Category: ${category || "unknown"}`,
    `Extension: ${extension || "unknown"}`,
    size ? `Size: ${size}` : null,
    width && height ? `Dimensions: ${width}x${height}` : null
  ].filter(Boolean).join("\n");

  if (type === "image/svg+xml" || name.toLowerCase().endsWith(".svg")) {
    content.push({
      type: "text",
      text:
        `[SVG asset]\n${metadataText}\n` +
        "SVG files are brand assets. Assign this file a role using its exact filename."
    });
    continue;
  }

  if (imageTypes.has(type) && dataUrl) {
    content.push({
      type: "image_url",
      image_url: {
        url: dataUrl,
        detail: "high"
      }
    });

    content.push({
      type: "text",
      text:
        `The image above is this prepared asset:\n${metadataText}\n` +
        "Use the exact filename when referencing this asset."
    });

    continue;
  }

  content.push({
    type: "text",
    text:
      `[Non-visual uploaded asset]\n${metadataText}\n` +
      "Do not attempt to visually inspect this file. Use its filename, extension, and prepared category to infer its brand role."
  });
}

content.push({
  type: "text",
  text:
    "Perform brand understanding from the uploaded visual assets and the local preparation report. " +
    "Return the full structured JSON exactly in the required shape. " +
    "Use exact filenames from the uploaded assets. Do not include markdown."
});
