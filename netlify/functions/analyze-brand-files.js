
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

function stripData(asset) {
  return {
    slot: asset.slot,
    label: asset.label,
    name: asset.name,
    type: asset.type,
    ext: asset.ext,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    qualityScore: asset.qualityScore,
    transparency: asset.transparency
  };
}

function buildPrompt(payload) {
  const assets = (payload.assets || []).map(stripData);
  return `You are Moving Day Studio's brand asset intake and guide-building engine.

Goal: convert a messy client upload folder into a polished brand identity guide data object.

Project fields:
${JSON.stringify(payload.project || {}, null, 2)}

Current palette:
${JSON.stringify(payload.colors || [], null, 2)}

Uploaded assets metadata:
${JSON.stringify(assets, null, 2)}

Return ONLY valid JSON. Do not include markdown.

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
    "heroLogo": "exact uploaded filename",
    "primaryLogo": "exact uploaded filename",
    "iconMark": "exact uploaded filename",
    "iconVariant": "exact uploaded filename",
    "profileImage": "exact uploaded filename",
    "websiteHeader": "exact uploaded filename",
    "businessCard": "exact uploaded filename",
    "socialPost": "exact uploaded filename"
  },
  "colors": [
    {"hex":"#000000","role":"primary","reason":"short reason"}
  ],
  "typography": {
    "displayFont":"string",
    "bodyFont":"string"
  },
  "usage": {
    "do": ["5 short client-facing rules"],
    "dont": ["5 short client-facing rules"]
  },
  "downloadCards": [
    {"title":"Logo Files","description":"short", "files":["exact filename"], "formats":["SVG","PNG"]}
  ],
  "assetReport": [
    {"name":"exact filename", "assetRole":"primary_logo | icon | social | print | website | source | font | reference", "placement":"where it should go", "qualityScore": 1, "reason":"short"}
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

Rules:
- Use exact uploaded filenames for selectedAssets and downloadCards.files.
- Prefer SVG, PDF, AI, EPS, and transparent PNGs for logo/source roles.
- Do not choose screenshots as final logos if better logo files exist.
- If you cannot infer a slot, use an empty string.
- Keep copy premium, concise, and client-facing.
- The app will automatically fall back to local sorting if this response fails.`;
}

async function analyzeBrandFiles(payload) {
  if (!process.env.OPENAI_API_KEY) {
    return { error: "Missing OPENAI_API_KEY. Add it in Netlify/Vercel environment variables." };
  }

  const prompt = buildPrompt(payload);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt }
          ]
        }
      ],
      text: { format: { type: "json_object" } }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI request failed with ${response.status}`);
  }

  const text = data.output_text || data.output?.flatMap(o => o.content || []).map(c => c.text || c.output_text || "").join("\n") || "{}";
  try {
    return JSON.parse(text);
  } catch (error) {
    return { error: "Model did not return parseable JSON.", raw: text };
  }
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod !== "POST") return json(405, { error: "Use POST" });
  try {
    const body = JSON.parse(event.body || "{}");
    const result = await analyzeBrandFiles(body);
    if (result.error) return json(400, result);
    return json(200, result);
  } catch (error) {
    return json(500, { error: error.message || "Analysis failed" });
  }
};
