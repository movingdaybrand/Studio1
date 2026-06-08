const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function normalizeExt(name = "", ext = "") {
  const fromName = String(name).split(".").pop()?.toLowerCase() || "";
  return String(ext || fromName || "").replace(".", "").toLowerCase();
}

function stripData(asset) {
  const ext = normalizeExt(asset.name, asset.ext);

  return {
    slot: asset.slot || "",
    label: asset.label || "",
    name: asset.name || "",
    type: asset.type || "",
    ext,
    size: asset.size || 0,
    width: asset.width || null,
    height: asset.height || null,
    aspectRatio:
      asset.width && asset.height
        ? Number((asset.width / asset.height).toFixed(3))
        : null,
    qualityScore: asset.qualityScore || null,
    transparency: asset.transparency || "",
    localCategory: asset.category || asset.detectedCategory || "",
    notes: asset.notes || ""
  };
}

function buildPrompt(payload) {
  const assets = (payload.assets || []).map(stripData);
  const assetNames = assets.map(a => a.name).filter(Boolean);

  return `
You are Moving Day Studio's brand asset intake and brand guide placement engine.

Your job is to convert a messy client upload folder into a clean, premium, client-facing brand guide data object.

You are not designing randomly.
You are selecting the best uploaded files for each guide slot based on file metadata.

PROJECT FIELDS:
${JSON.stringify(payload.project || {}, null, 2)}

CURRENT PALETTE:
${JSON.stringify(payload.colors || [], null, 2)}

UPLOADED ASSET METADATA:
${JSON.stringify(assets, null, 2)}

VALID FILENAMES:
${JSON.stringify(assetNames, null, 2)}

Return ONLY valid JSON.
Do not include markdown.
Do not explain the JSON outside the JSON.

Required JSON shape:
{
  "guide": {
    "clientName": "string",
    "category": "string",
    "heroDescription": "string",
    "deliveryDate": "string",
    "assetCount": number
  },
  "selectedAssets": {
    "heroLogo": "exact uploaded filename or empty string",
    "primaryLogo": "exact uploaded filename or empty string",
    "secondaryLogo": "exact uploaded filename or empty string",
    "iconMark": "exact uploaded filename or empty string",
    "iconVariant": "exact uploaded filename or empty string",
    "profileImage": "exact uploaded filename or empty string",
    "websiteHeader": "exact uploaded filename or empty string",
    "businessCard": "exact uploaded filename or empty string",
    "socialPost": "exact uploaded filename or empty string"
  },
  "colors": [
    {
      "hex": "#000000",
      "role": "primary | secondary | accent | neutral | background",
      "reason": "short reason"
    }
  ],
  "typography": {
    "displayFont": "string",
    "bodyFont": "string",
    "reason": "short reason"
  },
  "usage": {
    "do": ["5 short client-facing rules"],
    "dont": ["5 short client-facing rules"]
  },
  "downloadCards": [
    {
      "title": "Logo Files",
      "description": "short client-facing description",
      "files": ["exact uploaded filename"],
      "formats": ["SVG", "PNG", "PDF"]
    }
  ],
  "assetReport": [
    {
      "name": "exact uploaded filename",
      "assetRole": "primary_logo | secondary_logo | icon | profile | social | print | website | photo | source | font | reference | low_quality | misc",
      "placement": "where it should go or why it should not be used",
      "qualityScore": 1,
      "reason": "short reason"
    }
  ],
  "warnings": ["missing assets or quality issues"],
  "confidence": {
    "overall": 1,
    "assetMapping": 1,
    "colors": 1,
    "typography": 1,
    "downloads": 1
  }
}

SCORING SYSTEM:
Use confidence and quality scores from 1 to 10.
1 = unusable or unknown.
5 = acceptable but needs review.
8 = strong.
10 = ideal.

GLOBAL RULES:
- selectedAssets values must be exact filenames from VALID FILENAMES or empty strings.
- Never invent filenames.
- Never use a filename that was not uploaded.
- Never place font files into image slots.
- Never place zip files into image slots.
- Never place screenshots as final logos if SVG, PDF, AI, EPS, or transparent PNG logo files exist.
- Avoid using the same file in multiple selectedAssets slots unless it is clearly the only usable logo.
- If a slot has no strong match, return an empty string.
- Prefer clean, premium, client-facing copy.
- Keep all descriptions concise.

FILE TYPE PRIORITY:
Best logo/source files:
1. SVG
2. AI
3. EPS
4. PDF
5. transparent PNG
6. high-resolution PNG
7. JPG/JPEG only if no better logo exists

Weak logo/source files:
- screenshots
- Canva previews
- thumbnails
- social media exports
- low-resolution JPGs
- images with visible white boxes
- files named screenshot, screen shot, preview, draft, copy, thumbnail, image, unknown, download

PRIMARY LOGO RULES:
primaryLogo should be the best full logo or wordmark.
Prefer filenames containing:
- primary
- logo
- wordmark
- horizontal
- full
- lockup
- main

Do not choose:
- icon only
- favicon
- social post
- mockup
- screenshot
- photo

HERO LOGO RULES:
heroLogo should usually match primaryLogo.
Use heroLogo for the largest brand presentation.
Prefer the cleanest full brand logo.
If no full logo exists, use the strongest mark/icon.

SECONDARY LOGO RULES:
secondaryLogo should be a real alternate logo, stacked version, badge, lockup, or secondary mark.
Prefer filenames containing:
- secondary
- stacked
- alternate
- alt
- badge
- lockup
- vertical

ICON MARK RULES:
iconMark should be a simple symbol, monogram, favicon, app icon, or square mark.
Prefer filenames containing:
- icon
- mark
- favicon
- symbol
- monogram
- avatar
- profile
- badge

PROFILE IMAGE RULES:
profileImage should be square or close to square.
Prefer icon marks, avatars, badges, or social profile-ready files.
Aspect ratio near 1:1 is preferred.

WEBSITE HEADER RULES:
websiteHeader should be a wide image, website screenshot, hero mockup, homepage preview, browser frame, or horizontal brand application.
Prefer filenames containing:
- website
- web
- header
- homepage
- hero
- landing
- browser
- mockup
- desktop
- banner

Do not use a plain logo unless there are no better application files.

BUSINESS CARD / PRINT RULES:
businessCard should be print/stationery/collateral/signage/card/flyer assets.
Prefer filenames containing:
- business card
- card
- print
- stationery
- letterhead
- flyer
- poster
- sign
- sticker
- packaging
- merch

SOCIAL POST RULES:
socialPost should be a social, Instagram, LinkedIn, story, feed, post, or square marketing graphic.
Prefer filenames containing:
- social
- instagram
- ig
- post
- story
- reel
- linkedin
- facebook
- square
- 1080

FONT RULES:
Font files should be classified as font or source only.
Font extensions:
- otf
- ttf
- woff
- woff2

DOWNLOAD CARD RULES:
Create practical client download groups:
- Logo Files: SVG, PNG, PDF, EPS, AI logo/source files.
- Social Assets: profile, icon, social post, square graphics.
- Print / Collateral: business cards, flyers, signage, packaging.
- Brand Source Files: AI, EPS, PDF, SVG, fonts, zipped source packages.
Only include files that actually exist.
Do not put every file into every card.

COLOR RULES:
Use existing payload colors if they are provided and look intentional.
If colors are missing, infer likely colors from filenames, project fields, and asset metadata only.
Return 3 to 5 colors.
Do not default to Moving Day green unless the client brand actually appears to use it.

TYPOGRAPHY RULES:
If uploaded font files exist, use their filenames or inferred family names.
If no fonts exist, suggest premium accessible web-safe or Google-style pairings.
Keep the pairing appropriate to the brand category.

WARNINGS:
Add warnings for:
- no vector logo found
- no transparent logo found
- only screenshots found
- no social assets found
- no print collateral found
- no font files found
- low confidence mapping
- duplicate/unclear filenames
- files that should be manually reviewed

QUALITY GUIDANCE:
High quality:
- SVG, AI, EPS, PDF
- transparent PNG
- large dimensions
- clear logo naming
- clean role-specific naming

Medium quality:
- large JPG/PNG
- mockups
- application graphics
- good screenshots used only for reference

Low quality:
- screenshots used as logos
- tiny dimensions
- unknown filenames
- duplicates
- previews
- drafts
- thumbnails

The app will automatically fall back to local sorting if this response fails.
`.trim();
}

function safeParseJson(text) {
  if (!text || typeof text !== "string") {
    return { error: "Empty model response.", raw: text || "" };
  }

  try {
    return JSON.parse(text);
  } catch (_) {
    // Try to recover if the model accidentally wraps JSON in text.
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sliced = text.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sliced);
      } catch (error) {
        return {
          error: "Model returned JSON-like text, but it could not be parsed.",
          raw: text
        };
      }
    }

    return {
      error: "Model did not return parseable JSON.",
      raw: text
    };
  }
}

function validateSelectedAssets(result, payload) {
  const validNames = new Set((payload.assets || []).map(a => a.name).filter(Boolean));

  if (!result || typeof result !== "object") return result;

  if (!result.selectedAssets || typeof result.selectedAssets !== "object") {
    result.selectedAssets = {};
  }

  const requiredSlots = [
    "heroLogo",
    "primaryLogo",
    "secondaryLogo",
    "iconMark",
    "iconVariant",
    "profileImage",
    "websiteHeader",
    "businessCard",
    "socialPost"
  ];

  for (const slot of requiredSlots) {
    const value = result.selectedAssets[slot];

    if (!value || typeof value !== "string") {
      result.selectedAssets[slot] = "";
      continue;
    }

    if (!validNames.has(value)) {
      result.selectedAssets[slot] = "";
      result.warnings = result.warnings || [];
      result.warnings.push(`Invalid filename removed from ${slot}: ${value}`);
    }
  }

  if (!Array.isArray(result.downloadCards)) {
    result.downloadCards = [];
  }

  result.downloadCards = result.downloadCards.map(card => {
    const files = Array.isArray(card.files)
      ? card.files.filter(file => validNames.has(file))
      : [];

    return {
      title: card.title || "Brand Files",
      description: card.description || "",
      files,
      formats: Array.isArray(card.formats) ? card.formats : []
    };
  });

  if (!Array.isArray(result.assetReport)) {
    result.assetReport = [];
  }

  if (!Array.isArray(result.warnings)) {
    result.warnings = [];
  }

  return result;
}

async function analyzeBrandFiles(payload) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      error: "Missing OPENAI_API_KEY. Add it in Netlify/Vercel environment variables."
    };
  }

  const prompt = buildPrompt(payload);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are a strict JSON brand asset classifier. You only return valid JSON using exact uploaded filenames."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("OpenAI response was not valid JSON.");
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI request failed with ${response.status}`);
  }

  const text =
    data.output_text ||
    data.output
      ?.flatMap(item => item.content || [])
      ?.map(content => content.text || content.output_text || "")
      ?.join("\n") ||
    "{}";

  const parsed = safeParseJson(text);

  if (parsed.error) {
    return parsed;
  }

  return validateSelectedAssets(parsed, payload);
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST" });
  }

  try {
    const body = JSON.parse(event.body || "{}");

    if (!Array.isArray(body.assets)) {
      return json(400, {
        error: "Missing assets array."
      });
    }

    const result = await analyzeBrandFiles(body);

    if (result.error) {
      return json(400, result);
    }

    return json(200, result);
  } catch (error) {
    return json(500, {
      error: error.message || "Analysis failed"
    });
  }
};
