export const config = {
  maxDuration: 60,
};

const SYSTEM_PROMPT = `You are Moving Day's Brand Concierge and brand identity director. You will receive uploaded brand files and return a structured JSON analysis.

The app may also provide a local preparation report before brand understanding.

Use that local preparation report as trusted context for:
- file counts
- duplicate removal
- file categories
- extensions
- image dimensions
- transparent background detection
- prepared asset set

Your role is brand understanding, not file intake.

Do not contradict the local preparation report unless the visual evidence clearly requires it.

You MUST return ONLY valid JSON — no markdown fences, no preamble, no explanation. The response must parse cleanly with JSON.parse().

Return this exact shape:

{
  "guide": {
    "clientName": "string — detected or inferred brand name",
    "category": "string — industry e.g. Law, Accounting, Fitness, Healthcare, Real Estate",
    "description": "string — 1-2 sentence brand description",
    "assetCount": number
  },
  "palette": [
    {
      "name": "string — role e.g. Primary, Secondary, Accent, Background, Text",
      "hex": "#rrggbb",
      "usage": "string — one sentence on where this color is used"
    }
  ],
  "colors": [
    {
      "name": "string — role name",
      "hex": "#rrggbb",
      "usage": "string"
    }
  ],
  "typography": {
    "displayFont": "string — display/headline font name e.g. Playfair Display, Futura, Garamond",
    "bodyFont": "string — body/UI font name e.g. Inter, Helvetica, Source Sans",
    "display": {
      "name": "string — same as displayFont",
      "weight": "string — e.g. 700 Bold",
      "usage": "string — e.g. Headlines, hero text, cover titles"
    },
    "body": {
      "name": "string — same as bodyFont",
      "weight": "string — e.g. 400 Regular",
      "usage": "string — e.g. Body copy, UI labels, captions"
    }
  },
  "selectedAssets": {
    "heroLogo": "string — filename of best hero/lead asset e.g. logo.png",
    "primaryLogo": "string — filename of primary logo",
    "iconMark": "string — filename of icon or mark",
    "iconVariant": "string — filename of alternate icon if present",
    "profileImage": "string — filename best for profile/avatar use",
    "websiteHeader": "string — filename best for website header"
  },
  "assetAssignments": [
    {
      "fileId": "string — asset id e.g. asset_1",
      "slot": "string — one of: PrimaryLogo, SecondaryLogo, IconMark, WebsiteHeader, SocialAvatar, BusinessCard, PrintAsset, ExtraAsset",
      "reason": "string — one sentence"
    }
  ],
  "assetReport": [
    {
      "name": "string — original filename",
      "assetRole": "string — e.g. Primary Logo, Icon Mark, Secondary Logo",
      "placement": "string — e.g. Website header, Social avatar, Print",
      "reason": "string — one sentence on why",
      "qualityScore": number
    }
  ],
  "usage": {
    "do": ["array of do rules as plain strings, 3-5 items"],
    "dont": ["array of dont rules as plain strings, 3-5 items"]
  },
  "downloadCards": [
    {
      "title": "string — e.g. Logo Package",
      "description": "string — one sentence",
      "formats": ["PNG", "SVG"],
      "files": ["array of filenames"]
    }
  ],
  "copySuggestions": {
    "tagline": "string — short tagline under 10 words",
    "heroHeadline": "string — homepage headline under 12 words",
    "elevatorPitch": "string — 1-2 sentence brand description"
  },
  "preflight": [
    {
      "severity": "string — warning, suggestion, or note",
      "issue": "string",
      "suggestedFix": "string"
    }
  ]
}

Rules:
- palette and colors must both be present and have 5 items each (they can be the same data)
- selectedAssets values must be actual filenames from the uploaded files — use the exact name passed in
- assetReport must include one entry per uploaded file in the prepared asset set
- downloadCards should suggest 2-3 logical groupings e.g. Logo Package, Color Variants, Social Assets
- usage.do and usage.dont must each have 3-5 plain string rules, no bullet characters
- typography.displayFont and typography.bodyFont must be plain strings (font names only)
- if you cannot detect a font name, make your best educated guess based on visual style
- do not invent colors not visible in the uploaded files
- qualityScore is 1-10 based on resolution, clarity, and usefulness of the asset
- customer-facing language should feel calm, professional, and concierge-level
- do not use words like processing, model, JSON, AI, or confidence score inside any customer-facing fields`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY environment variable is not set." });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body." });
  }

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

    const safeName = String(name);
    const safeType = String(type || "unknown");
    const lowerName = safeName.toLowerCase();

    const metadataText = [
      `File: ${safeName}`,
      `ID: ${id || "unknown"}`,
      `Type: ${safeType}`,
      `Category: ${category || "unknown"}`,
      `Extension: ${extension || lowerName.split(".").pop() || "unknown"}`,
      size ? `Size: ${size}` : null,
      width && height ? `Dimensions: ${width}x${height}` : null
    ].filter(Boolean).join("\n");

    if (safeType === "image/svg+xml" || lowerName.endsWith(".svg")) {
      content.push({
        type: "text",
        text:
          `[SVG asset]\n${metadataText}\n` +
          "SVG files are brand assets. Assign this file a role using its exact filename."
      });
      continue;
    }

    if (imageTypes.has(safeType) && dataUrl) {
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

  let openAiResponse;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        max_tokens: 3000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({
        error: `OpenAI API error: ${response.status}`,
        detail: errorText
      });
    }

    openAiResponse = await response.json();
  } catch (err) {
    return res.status(502).json({
      error: "Failed to reach OpenAI API.",
      detail: err.message
    });
  }

  const rawText = openAiResponse?.choices?.[0]?.message?.content || "";

  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return res.status(422).json({
      error: "OpenAI returned non-JSON output.",
      raw: cleaned
    });
  }

  if (!parsed.colors?.length && parsed.palette?.length) {
    parsed.colors = parsed.palette;
  }

  if (!parsed.palette?.length && parsed.colors?.length) {
    parsed.palette = parsed.colors;
  }

  if (parsed.guide) {
    parsed.guide.assetCount =
      preparationReport?.preparedCount ||
      preparationReport?.totalReceived ||
      assets.length;
  }

  return res.status(200).json(parsed);
}
