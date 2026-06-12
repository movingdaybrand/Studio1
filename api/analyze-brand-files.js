export const config = {
  maxDuration: 60,
};

const SYSTEM_PROMPT = `You are a brand identity analyst. You will receive one or more uploaded brand files (logos, screenshots, mockups) and return a structured JSON analysis.

You MUST return ONLY valid JSON — no markdown fences, no preamble, no explanation. The response must parse cleanly with JSON.parse().

Return this exact shape:

{
  "brand": {
    "name": "string — detected or inferred brand name",
    "industry": "string — e.g. Law, Accounting, Consulting, Healthcare, Real Estate",
    "tone": ["array", "of", "tone", "words"] 
  },
  "palette": [
    {
      "name": "string — role name e.g. Primary, Secondary, Accent, Background, Text",
      "hex": "#rrggbb",
      "usage": "string — one sentence on where this color is used"
    }
  ],
  "typography": {
    "display": {
      "name": "string — font name or best guess e.g. Playfair Display",
      "weight": "string — e.g. 700 Bold",
      "usage": "string — e.g. Headlines, hero text, cover titles"
    },
    "body": {
      "name": "string — font name or best guess e.g. Inter",
      "weight": "string — e.g. 400 Regular",
      "usage": "string — e.g. Body copy, UI labels, captions"
    }
  },
  "assetAssignments": [
    {
      "fileId": "string — the asset id passed in e.g. asset_1",
      "slot": "string — one of: PrimaryLogo, SecondaryLogo, IconMark, WebsiteHeader, SocialAvatar, BusinessCard, PrintAsset, ExtraAsset",
      "reason": "string — one sentence explaining this assignment"
    }
  ],
  "copySuggestions": {
    "tagline": "string — a short brand tagline under 10 words",
    "heroHeadline": "string — a strong homepage headline under 12 words",
    "elevatorPitch": "string — 1-2 sentence brand description"
  },
  "preflight": [
    {
      "severity": "string — one of: warning, suggestion, note",
      "issue": "string — what the problem is",
      "suggestedFix": "string — what to do about it"
    }
  ]
}

Rules:
- palette must have exactly 5 items
- assetAssignments must include one entry per uploaded asset
- preflight should flag low contrast, missing variants, unclear marks, or weak typography — be specific
- if you cannot detect a font name, make your best educated guess based on visual style
- tone should be 3-5 words like: professional, approachable, modern, classic, bold, minimal, playful, trustworthy
- do not invent colors that are not visible in the uploaded files`;

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
    return res.status(400).json({ error: "No assets provided. Send { assets: [{ id, name, type, dataUrl }] }" });
  }

  // Build the content array for GPT-4o — images + labels
  const content = [];

  for (const asset of assets) {
    const { id, name, type, dataUrl } = asset;

    if (!dataUrl || !type) continue;

    // SVGs can't be sent as image_url blocks — send a text notice instead
    if (type === "image/svg+xml" || name?.toLowerCase().endsWith(".svg")) {
      content.push({
        type: "text",
        text: `[SVG file uploaded: ${name} (id: ${id}). Analyze based on filename and any other uploaded images. Assign it a role in assetAssignments.]`
      });
      continue;
    }

    // OpenAI expects data URLs directly in image_url blocks
    content.push({
      type: "image_url",
      image_url: {
        url: dataUrl,
        detail: "high"
      }
    });

    content.push({
      type: "text",
      text: `The image above is: ${name} (id: ${id})`
    });
  }

  content.push({
    type: "text",
    text: "Analyze all uploaded brand files and return the JSON analysis as specified."
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
        max_tokens: 2000,
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
      return res.status(502).json({ error: `OpenAI API error: ${response.status}`, detail: errorText });
    }

    openAiResponse = await response.json();
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach OpenAI API.", detail: err.message });
  }

  // Extract text from the first choice
  const rawText = openAiResponse?.choices?.[0]?.message?.content || "";

  // Strip markdown fences if the model added them anyway
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

  return res.status(200).json(parsed);
}
