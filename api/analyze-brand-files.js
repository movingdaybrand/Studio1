export const config = {
  maxDuration: 60,
};

const SYSTEM_PROMPT = `You are a brand identity analyst. You will receive one or more uploaded brand files (logos, screenshots, mockups) and return a structured JSON analysis.

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
- assetReport must include one entry per uploaded file
- downloadCards should suggest 2-3 logical groupings e.g. Logo Package, Color Variants, Social Assets
- usage.do and usage.dont must each have 3-5 plain string rules, no bullet characters
- typography.displayFont and typography.bodyFont must be plain strings (font names only)
- if you cannot detect a font name, make your best educated guess based on visual style
- do not invent colors not visible in the uploaded files
- qualityScore is 1-10 based on resolution, clarity, and usefulness of the asset`;

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

  const assets = body?.assets;
  if (!Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({ error: "No assets provided." });
  }

  // Build content array for GPT-4o vision
  const content = [];

  for (const asset of assets) {
    const { id, name, type, dataUrl } = asset;
    if (!dataUrl || !type) continue;

    // SVGs can't be vision blocks — send as text notice
    if (type === "image/svg+xml" || name?.toLowerCase().endsWith(".svg")) {
      content.push({
        type: "text",
        text: `[SVG file: ${name} (id: ${id}). Assign it a role in selectedAssets and assetReport using its exact filename.]`
      });
      continue;
    }

    content.push({
      type: "image_url",
      image_url: { url: dataUrl, detail: "high" }
    });

    content.push({
      type: "text",
      text: `The image above is: ${name} (id: ${id})`
    });
  }

  content.push({
    type: "text",
    text: `Analyze all uploaded brand files. In selectedAssets, use the exact filenames provided (e.g. "${assets[0]?.name}"). Return the full JSON analysis.`
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
        model: "gpt-4o",
        max_tokens: 2500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: `OpenAI API error: ${response.status}`, detail: errorText });
    }

    openAiResponse = await response.json();
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach OpenAI API.", detail: err.message });
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
    return res.status(422).json({ error: "OpenAI returned non-JSON output.", raw: cleaned });
  }

  // Ensure colors mirrors palette if missing
  if (!parsed.colors?.length && parsed.palette?.length) {
    parsed.colors = parsed.palette;
  }
  if (!parsed.palette?.length && parsed.colors?.length) {
    parsed.palette = parsed.colors;
  }

  return res.status(200).json(parsed);
}
