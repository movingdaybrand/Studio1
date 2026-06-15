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
  ],
  "recommendations": [
    {
      "title": "string — specific recommendation based on the actual uploaded files",
      "summary": "string — one concise customer-facing sentence",
      "reason": "string — why this recommendation matters",
      "sourceFiles": ["array of exact filenames that influenced this recommendation"],
      "nextAction": "string — what the user should confirm or do next"
    }
  ]
}

Rules:
- palette and colors must both be present and have 5 items each. They can be the same data.
- selectedAssets values must be actual filenames from the uploaded files. Use the exact names passed in.
- assetReport must include one entry per uploaded file in the prepared asset set.
- downloadCards should suggest 2-3 logical groupings, such as Logo Package, Color Variants, Social Assets, Reference Files, or Brand Home Files.
- usage.do and usage.dont must each have 3-5 plain string rules. Do not use bullet characters.
- typography.displayFont and typography.bodyFont must be plain strings with font names only.
- If you cannot detect a font name, make your best educated guess based on visual style.
- Do not invent colors not visible in the uploaded files.
- qualityScore is 1-10 based on resolution, clarity, and usefulness of the asset.
- customer-facing language should feel calm, professional, specific, and concierge-level.
- recommendations must include exactly 3 items.
- recommendations must be specific to the uploaded files.
- Do not use generic recommendation titles like "Primary identity", "Color system", or "Asset preparation" unless no better file-specific recommendation can be made.
- Each recommendation should feel like it came from a senior brand director reviewing the actual assets.
- Reference exact filenames when useful.
- Good recommendations explain which asset should lead the system, which files are references, what should be cleaned or confirmed, what is missing, and what should happen next.
- Avoid generic software language.
- Avoid saying only "I found X colors" unless paired with a real recommendation.
- Do not use words like processing, model, JSON, AI, confidence score, or algorithm inside any customer-facing fields.
`;

function cleanModelJson(rawText) {
  const cleaned = String(rawText || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Model response could not be parsed as JSON.");
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function buildFallbackRecommendations(parsed, assets, preparationReport) {
  const filenames = assets
    .map(asset => asset?.name)
    .filter(Boolean);

  const selected = parsed?.selectedAssets || {};
  const palette = asArray(parsed?.palette?.length ? parsed.palette : parsed?.colors);
  const preflight = asArray(parsed?.preflight);

  const primaryLogo =
    selected.primaryLogo ||
    selected.heroLogo ||
    selected.iconMark ||
    filenames.find(name => /logo|mark|icon|brand/i.test(name)) ||
    "";

  const referenceFile =
    filenames.find(name => /guide|guideline|brand|pdf|deck|presentation|reference/i.test(name)) ||
    "";

  const preparedCount =
    preparationReport?.preparedFileCount ||
    preparationReport?.preparedCount ||
    preparationReport?.totalReceived ||
    assets.length;

  const fallback = [];

  if (primaryLogo) {
    fallback.push({
      title: `Confirm ${primaryLogo} as the lead identity.`,
      summary: `${primaryLogo} appears to be the strongest starting point for the Brand Home.`,
      reason: "The lead identity should anchor the rest of the system before colors, usage rules, and downloads are prepared.",
      sourceFiles: [primaryLogo],
      nextAction: "Confirm whether this file should lead the brand system."
    });
  } else {
    fallback.push({
      title: "Confirm the lead identity asset.",
      summary: "The uploaded files need one clear logo or mark to anchor the Brand Home.",
      reason: "A primary identity asset keeps the final system organized and prevents the guide from feeling like a file dump.",
      sourceFiles: filenames.slice(0, 2),
      nextAction: "Add or confirm the main logo before publishing."
    });
  }

  if (palette.length) {
    const primaryColor = palette[0]?.name || palette[0]?.hex || "the strongest visible color";
    fallback.push({
      title: "Confirm the primary color direction.",
      summary: `${primaryColor} appears to be the strongest color anchor for this brand.`,
      reason: "A confirmed color hierarchy helps separate primary brand moments from supporting backgrounds and accents.",
      sourceFiles: filenames.slice(0, 3),
      nextAction: "Confirm the primary, secondary, and supporting colors."
    });
  } else {
    fallback.push({
      title: "Build a starter color system.",
      summary: "The upload does not show a complete color system yet.",
      reason: "A starter palette will make the Brand Home feel polished even when the source files are incomplete.",
      sourceFiles: filenames.slice(0, 3),
      nextAction: "Approve a starter palette pulled from the strongest visual assets."
    });
  }

  if (preflight.length) {
    const item = preflight[0];
    fallback.push({
      title: normalizeText(item.issue, "Review one item before publishing."),
      summary: normalizeText(item.suggestedFix, "One item should be reviewed before the Brand Home is prepared."),
      reason: "Resolving this now will make the final deliverable cleaner and easier to trust.",
      sourceFiles: filenames.slice(0, 3),
      nextAction: "Review this item before preparing the Brand Home."
    });
  } else if (referenceFile) {
    fallback.push({
      title: `Use ${referenceFile} as source material.`,
      summary: `${referenceFile} should guide the Brand Home, not compete with the primary visual assets.`,
      reason: "Reference files are useful for direction, but the final Brand Home should prioritize usable logos, marks, colors, and downloads.",
      sourceFiles: [referenceFile],
      nextAction: "Keep this file as a reference while organizing the final visual assets."
    });
  } else {
    fallback.push({
      title: "Organize the asset library before publishing.",
      summary: `${preparedCount} file${preparedCount === 1 ? "" : "s"} can now be arranged into a cleaner Brand Home.`,
      reason: "The customer experience should show the system, not every raw upload at once.",
      sourceFiles: filenames.slice(0, 3),
      nextAction: "Prepare the first Brand Home layout."
    });
  }

  return fallback;
}

function normalizeRecommendations(parsed, assets, preparationReport) {
  const fallback = buildFallbackRecommendations(parsed, assets, preparationReport);
  const incoming = asArray(parsed?.recommendations)
    .filter(item => item && typeof item === "object");

  const combined = [...incoming, ...fallback].slice(0, 3);

  return combined.map((item, index) => ({
    title: normalizeText(item.title, fallback[index]?.title || "Review this recommendation."),
    summary: normalizeText(item.summary, fallback[index]?.summary || item.reason || item.nextAction || ""),
    reason: normalizeText(item.reason, fallback[index]?.reason || ""),
    sourceFiles: asArray(item.sourceFiles).filter(Boolean),
    nextAction: normalizeText(item.nextAction, fallback[index]?.nextAction || "")
  }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY environment variable is not set."
    });
  }

  let body;

  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({
      error: "Invalid JSON body."
    });
  }

  const preparationReport = body?.preparationReport || null;
  const assets = body?.assets;

  if (!Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({
      error: "No assets provided."
    });
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
    const {
      id,
      name,
      type,
      dataUrl,
      category,
      extension,
      size,
      width,
      height
    } = asset || {};

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
    ]
      .filter(Boolean)
      .join("\n");

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
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        temperature: 0.25,
        max_tokens: 3000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content
          }
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

  let parsed;

  try {
    parsed = cleanModelJson(rawText);
  } catch {
    return res.status(422).json({
      error: "OpenAI returned non-JSON output.",
      raw: rawText
    });
  }

  if (!parsed.colors?.length && parsed.palette?.length) {
    parsed.colors = parsed.palette;
  }

  if (!parsed.palette?.length && parsed.colors?.length) {
    parsed.palette = parsed.colors;
  }

  if (!Array.isArray(parsed.colors)) {
    parsed.colors = [];
  }

  if (!Array.isArray(parsed.palette)) {
    parsed.palette = [];
  }

  if (!parsed.guide || typeof parsed.guide !== "object") {
    parsed.guide = {};
  }

  parsed.guide.assetCount =
    preparationReport?.preparedFileCount ||
    preparationReport?.preparedCount ||
    preparationReport?.totalReceived ||
    assets.length;

  parsed.recommendations = normalizeRecommendations(parsed, assets, preparationReport);

  if (!Array.isArray(parsed.preflight)) {
    parsed.preflight = [];
  }

  if (!Array.isArray(parsed.assetReport)) {
    parsed.assetReport = [];
  }

  if (!Array.isArray(parsed.assetAssignments)) {
    parsed.assetAssignments = [];
  }

  if (!Array.isArray(parsed.downloadCards)) {
    parsed.downloadCards = [];
  }

  if (!parsed.usage || typeof parsed.usage !== "object") {
    parsed.usage = {
      do: [],
      dont: []
    };
  }

  if (!Array.isArray(parsed.usage.do)) {
    parsed.usage.do = [];
  }

  if (!Array.isArray(parsed.usage.dont)) {
    parsed.usage.dont = [];
  }

  return res.status(200).json(parsed);
}
