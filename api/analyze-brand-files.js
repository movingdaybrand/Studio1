export const config = {
  maxDuration: 60,
};

const SYSTEM_PROMPT = `You are the Brand Concierge and Creative Director for Moving Day. Your job is not to describe files. Your job is to understand the company, make confident creative decisions, and prepare the strongest possible Brand Home from the uploaded evidence.

Treat every uploaded file as EVIDENCE of a real company, not as a file to catalogue. Even one or two logo images are enough to understand a brand: read them, infer what the brand visually expresses, and commit to the visual decisions a senior creative director would stand behind — without fabricating facts about the company. Never stall on missing information — recommend the strongest professional default instead.

OCR / READING VISIBLE TEXT — do this first:
- Read ALL visible text in every image: wordmarks, taglines, "EST." lines, locations, web addresses, phone numbers, social handles.
- If a mark reads "O'Sullivan Landscaping", set clientName to "O'Sullivan Landscaping".
- If text reads "EST. 23 | Warwick, RI", infer establishedYear "2023" and location "Warwick, RI" (expand 2-digit years sensibly: 'EST 23' → 2023, 'EST 98' → 1998).
- Infer industry from the imagery and words (e.g. a tree/mower mark + "Landscaping" → Landscaping; a scale/columns → Law).
- If only logos are uploaded with no other context, STILL build a complete starter Brand Home from what the marks tell you.

DECISIONS, NOT DESCRIPTIONS — BUT NEVER INVENT FACTS:
- Be confident and decisive about what you can actually SEE: which mark leads, logo tone and contrast, the colour palette from the real pixels, the typeface when visible, and the name read from the artwork's text. Frame these as decisions already made ("Primary identity selected"), not tentative suggestions.
- NEVER fabricate facts about the company. State an industry, audience, product, activity, or positioning ONLY when the marks or visible text genuinely evidence it (a tree + mower + "Landscaping" → Landscaping is fair). An ambiguous name plus a symbol is NOT evidence of a specific industry — a bolt mark and a one-word name do NOT tell you the company does "fitness" or "workouts", and you must not claim it does.
- When the evidence does not pin down what the company does, describe what the brand visually EXPRESSES — its energy, tone, and character — instead of inventing a specific industry, audience, product, or backstory. A confident, honest read of the design beats a confident, invented narrative.
- Prefer a confident value when the evidence supports it; when it does not, choose a GENERAL, honest one rather than a fabricated specific. An invented specific is worse than an honest generality. This is the Moving Day principle: never invent, always reveal.

The app may also provide a local preparation report before brand understanding.

Use that local preparation report as trusted context for:
- file counts
- duplicate removal
- file categories and per-asset confidence
- extensions
- image dimensions and aspect ratios
- transparent background detection
- the local color reading (each asset's dominant colours, and report.localPalette)
- the cleaned-up display names the app assigned to messy files
- the prepared asset set

The report includes a "foundation" object (mainLogo, mainIcon, mainWordmark, guideline, typography) — the app's best local picks. Treat these as the default choices and confirm them unless the visual evidence clearly points elsewhere. Weight the report's per-asset "confidence" when deciding which guesses to trust. Use report.localPalette as the starting point for the colour system, refining it rather than inventing unrelated colours. When you refer to a file in any customer-facing text, use its cleaned display name, never the messy original filename.

Your role is brand understanding, not file intake.

Do not contradict the local preparation report unless the visual evidence clearly requires it.

══════════════════════════════════════════════════════════════════════
HOW TO CLASSIFY ASSETS — LOOK AT THE IMAGE, NOT THE FILENAME
══════════════════════════════════════════════════════════════════════
Classify every asset by what you actually SEE in the image. Filenames are an
unreliable, weak hint only — they are frequently generic ("logo.png",
"final_v2.png", "asset1.jpg"), wrong, or copied. When the filename and the
image disagree, TRUST THE IMAGE. Never assign a role from the filename alone
when an image is available.

Decide each visual asset's type from its content:

- "Primary Logo": the full brand signature / lockup — usually the symbol (mark)
  AND the brand name (wordmark) together. This is the lead identity.
- "Icon Mark": the symbol or emblem ALONE, with no words. Often compact and
  near-square, and still reads at small sizes (favicon, app icon, avatar).
- "Wordmark": the brand NAME set in type, with no symbol — a logotype.
- "Logo Variant": the same logo rendered as a single-color / monochrome /
  knockout version (e.g. all-black or all-white) meant for placing on
  backgrounds. Note it as a variant, not a separate brand.
- "Photography": a photograph or real-world image (people, product, building,
  scene). Not a logo.
- "Pattern": a texture, repeating motif, or graphic background element.
- "Document": a guideline PDF, deck, presentation, or reference file.
- "Font": a typeface file (otf/ttf/woff).
- "Other": anything that does not fit the above.

For every LOGO-type asset (Primary Logo, Icon Mark, Wordmark, Logo Variant),
also report:
- "tone": the dominant ink/artwork color of the logo itself —
  "dark" (the logo is a dark color on transparency/light),
  "light" (the logo is white or very light), or
  "mixed" (full color / both).
- "transparentBackground": true if the artwork sits on a transparent or
  knocked-out background, false if it has a baked-in solid background.

CONTRAST / PLACEMENT — never make a logo disappear:
- A "dark" logo must be shown on a LIGHT or NEUTRAL background.
- A "light" logo must be shown on a DARK or BRAND-COLOR background.
- NEVER recommend placing a dark logo on a dark color, or a light logo on a
  light color. In particular, do not place a dark primary logo on the primary
  brand color when the primary color is dark — pick a contrasting background
  instead, or call for a knockout variant.
- Each logo's "recommendedBackground" must CONTRAST with its tone:
  "light" | "neutral" | "dark" | "brand-color".

══════════════════════════════════════════════════════════════════════

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
  "logoSystem": {
    "primaryLogo": {
      "file": "string — exact filename, or empty if none",
      "type": "string — Primary Logo | Icon Mark | Wordmark | Logo Variant",
      "tone": "string — dark | light | mixed",
      "transparentBackground": true,
      "recommendedBackground": "string — light | neutral | dark | brand-color"
    },
    "iconMark": {
      "file": "string — exact filename, or empty if none",
      "type": "string — Icon Mark",
      "tone": "string — dark | light | mixed",
      "transparentBackground": true,
      "recommendedBackground": "string — light | neutral | dark | brand-color"
    },
    "wordmark": {
      "file": "string — exact filename, or empty if none",
      "type": "string — Wordmark",
      "tone": "string — dark | light | mixed",
      "transparentBackground": true,
      "recommendedBackground": "string — light | neutral | dark | brand-color"
    }
  },
  "assetAssignments": [
    {
      "fileId": "string — asset id e.g. asset_1",
      "slot": "string — one of: PrimaryLogo, SecondaryLogo, IconMark, WebsiteHeader, SocialAvatar, BusinessCard, PrintAsset, ExtraAsset",
      "reason": "string — one sentence grounded in what the image shows"
    }
  ],
  "assetReport": [
    {
      "name": "string — original filename",
      "assetType": "string — Primary Logo | Icon Mark | Wordmark | Logo Variant | Photography | Pattern | Document | Font | Other",
      "assetRole": "string — e.g. Primary Logo, Icon Mark, Secondary Logo",
      "tone": "string — for logos: dark | light | mixed; otherwise n/a",
      "transparentBackground": true,
      "recommendedBackground": "string — for logos: light | neutral | dark | brand-color; otherwise n/a",
      "placement": "string — e.g. Website header, Social avatar, Print",
      "reason": "string — one sentence on why, based on the IMAGE content",
      "confidence": number,
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
- Classify every asset by visual evidence first. Filenames are weak hints and may be wrong; when the filename and image disagree, trust the image.
- assetType in assetReport must be set from the IMAGE content for visual assets, not the filename.
- assetReport must include one entry per uploaded file in the prepared asset set.
- For every logo-type asset, set tone (dark/light/mixed) and a recommendedBackground that CONTRASTS with that tone. A dark logo gets a light or neutral background; a light logo gets a dark or brand-color background. Never place a dark logo on a dark color or a light logo on a light color.
- logoSystem must identify the best primaryLogo, iconMark, and wordmark from the actual artwork. If one is genuinely absent, leave its file empty rather than forcing a wrong file.
- palette and colors must both be present and have 5 items each. They can be the same data.
- selectedAssets values must be actual filenames from the uploaded files. Use the exact names passed in.
- downloadCards should suggest 2-3 logical groupings, such as Logo Package, Color Variants, Social Assets, Reference Files, or Brand Home Files.
- usage.do and usage.dont must each have 3-5 plain string rules. Do not use bullet characters.
- typography.displayFont and typography.bodyFont must be plain strings with font names only.
- If you cannot detect a font name, make your best educated guess based on visual style.
- Do not invent colors not visible in the uploaded files.
- confidence is 0 to 1 and reflects how sure you are of the asset's type from the image (lower it for SVGs and non-visual files you could not actually see).
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

══════════════════════════════════════════════════════════════════════
ADDITIONAL BRAND INTELLIGENCE — the Creative Director layer
══════════════════════════════════════════════════════════════════════
ALSO include the following top-level fields, in addition to everything above.
Do not remove or rename any field above. These extend the analysis; they do
not replace it. Keep all of this calm and concierge-level — no scores, no
technical terms.

"brand": {
  "name": "string — same as guide.clientName",
  "industry": "string — same as guide.category",
  "positioning": "string — one sentence on where this brand sits in its market",
  "personality": ["3-5 single-word traits specific to THIS brand, e.g. refined, energetic, grounded"],
  "voice": "string — one sentence on how the brand should sound",
  "visualDirection": "string — 1-2 sentences of forward art-direction for this brand",
  "website": "string — if any uploaded artwork shows a web address (business card, packaging, signage, footer), return it normalized as https://domain; otherwise null"
},
"colorSystem": {
  "primary":    { "hex": "#rrggbb", "name": "string" },
  "secondary":  { "hex": "#rrggbb", "name": "string" },
  "accent":     { "hex": "#rrggbb", "name": "string" },
  "neutral":    { "hex": "#rrggbb", "name": "string" },
  "background": { "hex": "#rrggbb", "name": "string — recommended page background, usually a clean near-white" },
  "text":       { "hex": "#rrggbb", "name": "string — recommended body text color, legible on the background" },
  "light":      { "hex": "#rrggbb", "name": "string — lightest brand tone" },
  "dark":       { "hex": "#rrggbb", "name": "string — darkest brand tone, suited to deep hero grounds" },
  "accessibility": "string — one calm sentence on legibility/contrast, no scores",
  "recommendation": "string — one sentence only if the palette should be refined; otherwise empty"
},
"typographySystem": {
  "display":  { "name": "string", "usage": "string" },
  "heading":  { "name": "string", "usage": "string" },
  "body":     { "name": "string", "usage": "string" },
  "accent":   { "name": "string — optional, may be empty", "usage": "string" },
  "fallbacks": "string — a web-safe fallback stack, e.g. Georgia, serif",
  "hierarchy": "string — one sentence on how the type scale should be used",
  "recommendation": "string — if a font is missing or weak, suggest a high-quality alternative; otherwise empty"
},
"guidePlan": {
  "sections": [
    {
      "section": "string — one of: Logo System, Color Palette, Typography, Photography, Social Applications, Packaging, Apparel, Email Signatures, Athletics, Environmental Graphics, Patterns, Presentations, Usage, Files",
      "include": true,
      "reason": "string — why, grounded in the prepared assets or clear brand context"
    }
  ]
},
"brandHomeImprovements": ["2-4 calm, specific, customer-facing suggestions for the customer's Brand Home"],
"brandWorld": {
  "worldName": "string — an evocative-but-restrained name for this brand's environment",
  "mood": "string — 2-4 words for the overall mood of the space",
  "coreFeeling": "string — 2-4 words for how it should feel to be inside this brand",
  "environmentType": "string — e.g. quiet gallery, sunlit studio, stone atrium, editorial library (premium architecture, never sci-fi or literal rooms)",
  "environmentSummary": "string — one calm sentence describing the space",
  "lighting": { "primary": "string", "secondary": "string", "atmosphere": "string" },
  "materials": ["2-4 material words, e.g. frosted glass, brushed brass, warm paper, concrete, wood"],
  "glassStyle": "string — how frosted/clear the glass reads, e.g. soft frost, clear with a faint tint",
  "surfaceStyle": "string — the dominant surface character, e.g. matte paper, polished stone, brushed metal",
  "motion": ["2-3 motion words, e.g. slow drift, soft parallax, gentle settle"],
  "cameraBehavior": "string — how movement feels, e.g. slow dolly, gentle push-in, calm glide",
  "depth": "string — sense of depth, e.g. shallow and intimate, deep and architectural",
  "geometry": { "logoInfluence": "string — how the logo's forms inform the space", "shapeLanguage": "string — e.g. soft radii, sharp verticals" },
  "colorMapping": {
    "background": "#rrggbb — a near-white or pale tint of the palette (the page stays light)",
    "glass": "#rrggbb — a pale tint for frosted surfaces",
    "glow": "#rrggbb — a light tint of the signature color for ambient bloom",
    "accent": "#rrggbb — the readable signature accent (from the palette)",
    "shadow": "#rrggbb — a deep brand tone for depth/shadows"
  },
  "destinations": {
    "identity":     { "name": "Identity",      "environmentName": "Arrival",     "feeling": "string", "visualTreatment": "string" },
    "assets":       { "name": "Assets",        "environmentName": "Archive",     "feeling": "string", "visualTreatment": "string" },
    "guide":        { "name": "Brand Guide",   "environmentName": "Gallery",     "feeling": "string", "visualTreatment": "string" },
    "typography":   { "name": "Typography",    "environmentName": "Library",     "feeling": "string", "visualTreatment": "string" },
    "deliverables": { "name": "Deliverables",  "environmentName": "Departure",   "feeling": "string", "visualTreatment": "string" },
    "founderTools": { "name": "Founder Tools", "environmentName": "Control Room","feeling": "string", "visualTreatment": "string" }
  }
}

Rules for these additional fields:
- brandWorld is an environmental design system, not fantasy writing. Keep it premium, concrete, and design-directable. colorMapping hex values must come from the real palette; background/glass/glow stay LIGHT (the home is light-first), accent is the readable signature color, shadow is the deepest brand tone. Each destination keeps its fixed environmentName but gets a feeling and visualTreatment specific to THIS brand. If brand info is thin, derive a refined world from the available colors and files.
- ALSO return a "designStrategy" object that tells the app how to design this brand's applications (business cards, social posts, banners) so the user never has to decide. Shape: "designStrategy": { "personality": "bold|refined|editorial|warm|classic|technical", "leadColor": "#rrggbb — the color that should lead dark/branded surfaces (usually the deepest or signature tone)", "accentColor": "#rrggbb — the pop/highlight color", "cardLayout": "centered|left|split", "postLayout": "badge|gradient|type", "corner": "round|sharp", "voice": "one short, confident, human sentence describing this brand's application style — no AI or technical language" }. Pick values that genuinely fit THIS brand's character and palette; if info is thin, derive a tasteful strategy from the colors.
- ALSO return an "environmentProfile" object — the machine-readable atmosphere the app applies automatically to subtly adapt the Brand Home's light, glass, and motion to THIS brand (never a theme, never layout, never washing the UI). Use ONLY these enum values: "environmentProfile": { "mood": "editorial|modern|natural|energetic|clinical|scholarly|expressive", "lighting": "warm|cool|bright|natural", "material": "glass|stone|wood|metal|paper", "motion": "slow|responsive|calm|drift", "intensity": a number 0.25-0.95 for how strongly the atmosphere expresses (restrained brands low, energetic brands high) }. Choose from the brand's real industry, mood, and palette — e.g. luxury/fashion → editorial · warm · paper · slow; technology → modern · cool · metal · responsive; outdoor → natural · natural · wood · drift; healthcare → clinical · bright · glass · calm; education → scholarly · warm · paper · calm; sports → energetic · cool · metal · responsive (still premium, never aggressive). If unsure, choose the calmest fit.
- colorSystem hex values must come from the real uploaded colors (reuse palette where possible). background defaults to a clean near-white and text to a legible dark, unless the brand clearly dictates otherwise. Never wash the whole guide in one color — the page stays light; brand color lives in accents, hero grounds, and swatches.
- Only set guidePlan.sections.include = true for sections actually supported by the prepared assets or clear brand context: add Photography only when photography exists, Packaging only when packaging files exist, Apparel only for apparel, Athletics only for sports brands, Environmental Graphics only for signage/vehicle wraps, Email Signatures only when present. Always include Logo System, Color Palette, Typography, Usage, and Files. NEVER include every possible section.
- personality, voice, positioning, and visualDirection must be specific to THIS brand, never generic boilerplate.
- Keep every customer-facing string calm and concierge-level. Confidence and scores remain internal (assetReport only); never surface them here.

══════════════════════════════════════════════════════════════════════
BRAND UNDERSTANDING — REQUIRED TOP-LEVEL BLOCK (the Brand Home contract)
══════════════════════════════════════════════════════════════════════
ALSO return these exact top-level fields. This is what the Brand Home is built
from. Fill EVERY field with a confident, professional value — prefer a strong
recommendation over an empty string. Reuse what you already decided above
(guide.clientName, brand.*, palette, logoSystem, typographySystem) so nothing
contradicts. identity.* values are exact filenames from the uploaded set (or
empty only if that role genuinely has no candidate). palette roles are
"Primary | Secondary | Accent | Neutral | Background | Text". typography.detected
lists fonts actually found in files; typography.recommended is your confident
pick to use when no font files exist. decisions are completed, confident
statements ("Primary identity selected"), never questions. missing lists what
would strengthen the brand. nextActions are 2-4 confident next steps.

"clientName": "string — the company name, read from the marks",
"industry": "string — inferred industry",
"location": "string — city/region if visible, else a confident empty string",
"establishedYear": "string — 4-digit year if visible (expand 2-digit), else empty",
"brandSummary": "string — 1-2 confident sentences on who this company is",
"confidence": 0.0,
"identity": {
  "primaryLogo": "string — filename of the lead lockup/logo",
  "secondaryLogo": "string — filename of an alternate logo, else empty",
  "iconMark": "string — filename of the symbol/icon alone, else empty",
  "wordmark": "string — filename of the name-only logotype, else empty",
  "badge": "string — filename of a badge/emblem/crest, else empty"
},
"palette": [ { "name": "Forest Green", "hex": "#1c3d2a", "role": "Primary" } ],
"typography": {
  "detected": [ { "name": "string", "role": "Display|Body" } ],
  "recommended": [ { "name": "Inter", "role": "Body" } ]
},
"personality": ["3-5 single-word traits for THIS brand"],
"visualThemes": ["2-4 short visual theme phrases, e.g. 'grounded & natural', 'crisp editorial'"],
"assetPlan": {
  "logos": ["filenames that are logos/marks"],
  "supportingAssets": ["filenames that support the brand (photos, patterns, docs)"],
  "duplicates": ["filenames that duplicate another asset"],
  "ignore": ["filenames not useful to the brand system"]
},
"brandHomeSections": {
  "identity": "string — one calm sentence introducing the identity room",
  "colors": "string — one sentence on the colour system",
  "typography": "string — one sentence on the typographic direction",
  "voice": "string — one sentence on how the brand sounds",
  "usage": "string — one sentence on how to use the marks well",
  "downloads": "string — one sentence on what's ready to download"
},
"decisions": ["completed, confident decisions already made — e.g. 'Primary identity selected', 'Visual system established', 'Brand Home prepared'"],
"missing": ["what would strengthen the brand, phrased calmly — empty array if nothing"],
"nextActions": ["2-4 confident next steps for the customer"]

Rules for the brand-understanding block:
- Fill it from the same evidence — never contradict guide/brand/palette/logoSystem above.
- Prefer recommended values over empty values. Do not write "not found" / "unknown".
- If only logos were uploaded, still produce a complete starter Brand Home here.
- decisions must read as done, not as recommendations.
- Return clean JSON only — no markdown, no commentary.

══════════════════════════════════════════════════════════════════════
PRESENTATION LAYER — the studio writes the Brand Home (REQUIRED)
══════════════════════════════════════════════════════════════════════
ALSO return a "presentation" object. This is the client-facing writing that
makes the Brand Home read like a real brand studio prepared it for THIS specific
company — not a template. Write thoughtful, specific, confident editorial copy.
Reference the company by name, its industry, its actual marks and colours. Never
use the word "template". Never write "not found". Never hedge. Make the calls.

"presentation": {
  "headline": "string — a warm, confident headline for the prepared Brand Home, e.g. 'O'Sullivan Landscaping, brought together.'",
  "subheadline": "string — one calm sentence framing what was prepared",
  "overview": "string — 2-3 sentences introducing the brand the way a studio would open a presentation: who they are, what the system expresses, how it should feel",
  "sections": [
    {
      "id": "overview | identity | color | typography | visual | usage | assets | downloads",
      "title": "string — an editorial section title written for THIS brand (e.g. 'Primary Identity', not 'Primary Logo')",
      "intro": "string — 1-2 sentence editorial intro specific to this company",
      "rationale": "string — the visual/creative reasoning behind the decisions in this section",
      "usage": "string — confident, concrete recommended usage (where these pieces should lead)",
      "confidence": 0.0,
      "inferred": "string — what you inferred from the uploaded assets for this section",
      "refine": "string — what can be refined later, phrased as an easy next step, never as a gap"
    }
  ]
}

Return EXACTLY these eight sections in this order, with these ids:
1. "overview"    → "Brand Overview"
2. "identity"    → "Identity System"
3. "color"       → "Color System"
4. "typography"  → "Typography Direction"
5. "visual"      → "Visual Language"
6. "usage"       → "Usage Guidance"
7. "assets"      → "Asset Library"
8. "downloads"   → "Download Package"

Rules for the presentation:
- Every section's copy must be specific to this company — its name, industry, marks, and palette — never generic boilerplate.
- Titles are editorial, not labels: prefer "Primary Identity" over "Primary Logo", "Color System" over "Colors".
- Example identity intro: "O'Sullivan Landscaping's primary mark combines a local, landscape-driven symbol with a confident uppercase wordmark. It should lead most customer-facing materials — signage, web headers, invoices, and social profiles."
- Example color intro: "The palette is rooted in natural greens, open-sky blue, earth brown, and warm gold — a local, outdoors feel that still reads polished enough for professional service work."
- confidence is 0-1 per section; it stays internal, never shown as a number.
- refine is always an invitation ("add a wide lockup when you have one"), never a deficiency.
- If only one or two logos were uploaded, still write all eight sections confidently from what the marks reveal.
- Clean JSON only.
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

// Pick a contrasting background from a logo tone, so a logo is never placed
// where it would disappear. Used to backfill logoSystem if the model omits it.
function backgroundForTone(tone) {
  const t = String(tone || "").toLowerCase();
  if (t === "light") return "dark";
  if (t === "dark") return "light";
  return "neutral";
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

// Ensure logoSystem exists and every logo carries a contrasting background,
// even if the model under-fills it — so renderers always have safe placement data.
function normalizeLogoSystem(parsed) {
  const report = asArray(parsed?.assetReport);
  const selected = parsed?.selectedAssets || {};

  function findByType(...types) {
    const wanted = types.map(t => t.toLowerCase());
    return report.find(r => wanted.includes(String(r?.assetType || "").toLowerCase()));
  }

  function slot(existing, fallbackFile, fallbackType) {
    const e = existing && typeof existing === "object" ? existing : {};
    const fromReport =
      findByType(fallbackType) ||
      report.find(r => String(r?.name || "") === String(e.file || fallbackFile || ""));
    const tone = normalizeText(e.tone, fromReport ? normalizeText(fromReport.tone, "mixed") : "mixed");
    return {
      file: normalizeText(e.file, fallbackFile || ""),
      type: normalizeText(e.type, fallbackType),
      tone,
      transparentBackground:
        typeof e.transparentBackground === "boolean"
          ? e.transparentBackground
          : (typeof fromReport?.transparentBackground === "boolean" ? fromReport.transparentBackground : true),
      recommendedBackground: normalizeText(
        e.recommendedBackground,
        normalizeText(fromReport?.recommendedBackground, backgroundForTone(tone))
      )
    };
  }

  const incoming = parsed?.logoSystem && typeof parsed.logoSystem === "object" ? parsed.logoSystem : {};

  return {
    primaryLogo: slot(incoming.primaryLogo, selected.primaryLogo || selected.heroLogo, "Primary Logo"),
    iconMark: slot(incoming.iconMark, selected.iconMark, "Icon Mark"),
    wordmark: slot(incoming.wordmark, selected.iconVariant, "Wordmark")
  };
}

/* ── Website enrichment (two-pass) ──────────────────────────────────────────
   Pass 1 (vision) may return a URL printed in the artwork as brand.website.
   Here we normalize it, fetch the homepage server-side, pull a few high-signal
   facts, and (optionally) run a small text-only refine call to blend them in.
   Every step is best-effort: any failure leaves the Pass-1 analysis untouched. */
function decodeEntities(s) {
  return String(s || "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;/gi, "'").replace(/&nbsp;/g, " ");
}

function normalizeUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  let u = raw.trim().replace(/^["'<([]+|["'>)\]]+$/g, "");
  if (!u) return null;
  if (/\s/.test(u)) u = u.split(/\s+/)[0];
  if (!/^https?:\/\//i.test(u)) {
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) u = "https://" + u;
    else return null;
  }
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (!url.hostname.includes(".")) return null;
    return url.origin + url.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function metaContent(html, key) {
  const safe = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp('<meta[^>]+(?:name|property)=["\']' + safe + '["\'][^>]*>', "i");
  const tag = html.match(re);
  if (!tag) return "";
  const c = tag[0].match(/content=["']([^"']*)["']/i);
  return c ? decodeEntities(c[1]).replace(/\s+/g, " ").trim() : "";
}

async function fetchSiteContext(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 5000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "MovingDayBrandBot/1.0 (+https://movingdaybrand.com)",
        Accept: "text/html,application/xhtml+xml"
      }
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (ct && !/text\/html|application\/xhtml/i.test(ct)) return null;
    let html = await r.text();
    if (html.length > 300000) html = html.slice(0, 300000);
    const title = decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "")
      .replace(/\s+/g, " ").trim().slice(0, 160);
    const description = (metaContent(html, "description") || metaContent(html, "og:description")).slice(0, 300);
    const ogImage = metaContent(html, "og:image").slice(0, 500);
    const siteName = metaContent(html, "og:site_name").slice(0, 120);
    const themeColor = metaContent(html, "theme-color").slice(0, 32);
    const h1 = decodeEntities(((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ").trim().slice(0, 160);
    if (!title && !description && !siteName && !h1) return null;
    return { url, title, description, ogImage, siteName, themeColor, h1 };
  } catch {
    clearTimeout(t);
    return null;
  }
}

async function refineWithSite(parsed, site, apiKey, model) {
  const current = {
    clientName: parsed?.guide?.clientName || parsed?.brand?.name || "",
    category: parsed?.guide?.category || parsed?.brand?.industry || "",
    tagline: parsed?.copySuggestions?.tagline || "",
    description: parsed?.guide?.description || "",
    positioning: parsed?.brand?.positioning || ""
  };
  const system =
    "You refine a brand summary using facts scraped from the brand's own website. Stay truthful to the site and never invent. " +
    'Return ONLY JSON: {"clientName":"","brandName":"","tagline":"","category":"","description":"","positioning":"","extraColors":[{"hex":"#rrggbb","name":""}]}. ' +
    "Leave any field as \"\" if the website does not clearly improve it. Use extraColors only for a colour the site clearly signals; otherwise [].";
  const user =
    "CURRENT SUMMARY:\n" + JSON.stringify(current) +
    "\n\nWEBSITE FACTS:\n" + JSON.stringify(site) +
    "\n\nRefine only where the website gives better signal.";
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }]
      })
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content || "";
    try { return JSON.parse(txt); } catch { return null; }
  } catch {
    clearTimeout(t);
    return null;
  }
}

async function maybeEnrichFromWebsite(parsed, apiKey, model) {
  const url = normalizeUrl((parsed && parsed.brand && parsed.brand.website) || (parsed && parsed.website) || "");
  parsed.websiteEnriched = false;
  if (!url) return;
  parsed.brand = parsed.brand || {};
  parsed.brand.website = url;

  const site = await fetchSiteContext(url, 5000);
  if (!site) return;
  parsed.websiteContext = site;

  const addColor = (hex, name) => {
    const h = String(hex || "").trim();
    if (!/^#?[0-9a-f]{6}$/i.test(h)) return;
    const norm = h[0] === "#" ? h : "#" + h;
    parsed.colors = Array.isArray(parsed.colors) ? parsed.colors : [];
    parsed.palette = Array.isArray(parsed.palette) ? parsed.palette : [];
    if (parsed.colors.some(c => String(c.hex || "").toLowerCase() === norm.toLowerCase())) return;
    if (parsed.colors.length >= 6) return;
    const entry = { hex: norm, name: name || "Web" };
    parsed.colors.push(entry);
    parsed.palette.push(entry);
  };

  if (site.themeColor) addColor(site.themeColor, "Web");
  if (site.ogImage) parsed.websitePreview = site.ogImage;

  const ref = apiKey ? await refineWithSite(parsed, site, apiKey, model) : null;
  if (ref) {
    const set = v => typeof v === "string" && v.trim();
    parsed.guide = parsed.guide || {};
    parsed.brand = parsed.brand || {};
    parsed.copySuggestions = parsed.copySuggestions || {};
    if (set(ref.clientName)) parsed.guide.clientName = ref.clientName.trim();
    if (set(ref.brandName)) {
      parsed.brand.name = ref.brandName.trim();
      if (!set(parsed.guide.clientName)) parsed.guide.clientName = ref.brandName.trim();
    }
    if (set(ref.category)) {
      parsed.guide.category = ref.category.trim();
      parsed.brand.industry = ref.category.trim();
    }
    if (set(ref.tagline)) parsed.copySuggestions.tagline = ref.tagline.trim();
    if (set(ref.description)) parsed.guide.description = ref.description.trim();
    if (set(ref.positioning)) parsed.brand.positioning = ref.positioning.trim();
    if (Array.isArray(ref.extraColors)) ref.extraColors.slice(0, 3).forEach(c => addColor(c && c.hex, (c && c.name) || "Web"));
    parsed.websiteEnriched = true;
  }
}

/* ── brandWorld: environmental design system (always present, derived if the model is thin) ── */
function _hexToRgb(h){ h=String(h||"").replace("#",""); if(h.length===3) h=h.split("").map(x=>x+x).join(""); const n=parseInt(h||"000000",16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function _rgb2hex(r,g,b){ const c=x=>("0"+Math.max(0,Math.min(255,Math.round(x))).toString(16)).slice(-2); return "#"+c(r)+c(g)+c(b); }
function _mix(a,b,t){ const A=_hexToRgb(a),B=_hexToRgb(b); return _rgb2hex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t); }
function _lighten(h,t){ return _mix(h,"#ffffff",t); }
function _darken(h,t){ return _mix(h,"#0b0b0c",t); }
function _lum(h){ const c=_hexToRgb(h); return 0.299*c[0]+0.587*c[1]+0.114*c[2]; }
function _sat(h){ const c=_hexToRgb(h),mx=Math.max(...c),mn=Math.min(...c); return mx?(mx-mn)/mx:0; }
function _normHex(h){ if(typeof h!=="string"||!/^#?[0-9a-f]{6}$/i.test(h.trim())) return null; h=h.trim(); return (h[0]==="#"?h:"#"+h).toLowerCase(); }

const DEFAULT_WORLD = {
  worldName:"Moving Day", mood:"calm, premium", coreFeeling:"calm, premium, considered",
  environmentType:"quiet sunlit gallery",
  environmentSummary:"A quiet, light-filled space with frosted glass and soft sage light.",
  lighting:{ primary:"soft daylight", secondary:"low sage glow", atmosphere:"still and bright" },
  materials:["frosted glass","warm paper","brushed stone"],
  glassStyle:"soft frost", surfaceStyle:"matte warm paper",
  motion:["slow drift","gentle settle"],
  cameraBehavior:"calm glide", depth:"shallow and intimate",
  geometry:{ logoInfluence:"rounded, humanist forms", shapeLanguage:"soft radii" },
  colorMapping:{ background:"#f4f2ec", glass:"#eef1ea", glow:"#cfe0d2", accent:"#2c5a3c", shadow:"#14291f" },
  destinations:{
    identity:{ name:"Identity", environmentName:"Arrival", feeling:"a calm welcome", visualTreatment:"soft light, centered logo" },
    assets:{ name:"Assets", environmentName:"Archive", feeling:"ordered and quiet", visualTreatment:"shelved, gridded calm" },
    guide:{ name:"Brand Guide", environmentName:"Gallery", feeling:"considered and spacious", visualTreatment:"gallery walls, generous margins" },
    typography:{ name:"Typography", environmentName:"Library", feeling:"studied and warm", visualTreatment:"specimen pages, quiet rows" },
    deliverables:{ name:"Deliverables", environmentName:"Departure", feeling:"ready and resolved", visualTreatment:"packed, labeled, set to leave" },
    founderTools:{ name:"Founder Tools", environmentName:"Control Room", feeling:"precise and in-control", visualTreatment:"instrument-panel restraint" }
  }
};

function buildFallbackBrandWorld(parsed){
  const cols=((parsed && (parsed.colors||parsed.palette)) || []).map(c=>_normHex(c && c.hex)).filter(Boolean);
  const w=JSON.parse(JSON.stringify(DEFAULT_WORLD));
  const name=(parsed && parsed.guide && parsed.guide.clientName) || (parsed && parsed.brand && parsed.brand.name) || "";
  if(name) w.worldName=name;
  if(!cols.length) return w;
  const bySat=[...cols].sort((a,b)=>_sat(b)-_sat(a));
  const byLum=[...cols].sort((a,b)=>_lum(a)-_lum(b));
  let accent=bySat[0];
  if(_lum(accent)>196) accent=_darken(accent,0.34); else if(_lum(accent)<40) accent=_lighten(accent,0.30);
  const deep=_lum(byLum[0])<82 ? byLum[0] : _darken(bySat[0],0.62);
  w.colorMapping={ background:_lighten(bySat[0],0.92), glass:_lighten(bySat[0],0.84), glow:_lighten(bySat[0],0.5), accent, shadow:deep };
  return w;
}

function normalizeBrandWorld(parsed){
  const fb=buildFallbackBrandWorld(parsed);
  const bw=(parsed && parsed.brandWorld && typeof parsed.brandWorld==="object") ? parsed.brandWorld : {};
  const out=Object.assign({}, fb, bw);
  out.lighting=Object.assign({}, fb.lighting, bw.lighting||{});
  out.geometry=Object.assign({}, fb.geometry, bw.geometry||{});
  out.colorMapping=Object.assign({}, fb.colorMapping, bw.colorMapping||{});
  for(const k of Object.keys(out.colorMapping)){ out.colorMapping[k]=_normHex(out.colorMapping[k]) || fb.colorMapping[k]; }
  // the home is light-first: never let the model drag background/glass/glow dark
  if(_lum(out.colorMapping.background)<210) out.colorMapping.background=fb.colorMapping.background;
  if(_lum(out.colorMapping.glass)<170) out.colorMapping.glass=fb.colorMapping.glass;
  if(_lum(out.colorMapping.glow)<120) out.colorMapping.glow=fb.colorMapping.glow;
  out.materials=Array.isArray(bw.materials)&&bw.materials.length ? bw.materials.slice(0,4) : fb.materials;
  out.motion=Array.isArray(bw.motion)&&bw.motion.length ? bw.motion.slice(0,3) : fb.motion;
  out.destinations=(out.destinations && typeof out.destinations==="object") ? out.destinations : {};
  for(const key of Object.keys(fb.destinations)){
    const d=(bw.destinations && bw.destinations[key]) || {};
    out.destinations[key]={
      name: fb.destinations[key].name,
      environmentName: fb.destinations[key].environmentName,
      feeling: (typeof d.feeling==="string" && d.feeling.trim()) ? d.feeling.trim() : fb.destinations[key].feeling,
      visualTreatment: (typeof d.visualTreatment==="string" && d.visualTreatment.trim()) ? d.visualTreatment.trim() : fb.destinations[key].visualTreatment
    };
  }
  return out;
}

/* ── designStrategy: how to design this brand's applications (always present, derived if the model is thin) ── */
const DS_PERSONALITY=["bold","refined","editorial","warm","classic","technical"];
const DS_CARD=["centered","left","split"], DS_POST=["badge","gradient","type"], DS_CORNER=["round","sharp"];
const DS_VOICE={
  bold:"Bold and high-contrast — built to be seen.",
  refined:"Quiet, refined, and confident — nothing shouts.",
  editorial:"Editorial and considered — type-led and calm.",
  warm:"Warm and approachable — friendly without trying too hard.",
  classic:"Clean and timeless — the kind of look that lasts.",
  technical:"Precise and modern — structured and sharp."
};
function buildFallbackDesignStrategy(parsed){
  const cols=((parsed && (parsed.colors||parsed.palette)) || []).map(c=>_normHex(c && c.hex)).filter(Boolean);
  if(!cols.length) return { personality:"refined", leadColor:"#14291f", accentColor:"#2c5a3c", cardLayout:"centered", postLayout:"gradient", corner:"round", voice:DS_VOICE.refined };
  const bySat=[...cols].sort((a,b)=>_sat(b)-_sat(a)), byLum=[...cols].sort((a,b)=>_lum(a)-_lum(b));
  const sig=bySat[0], deepest=byLum[0];
  const sat=_sat(sig), contrast=_lum(byLum[byLum.length-1])-_lum(byLum[0]);
  let personality = (sat>0.55 && contrast>120) ? "bold" : (sat<0.25 ? "refined" : "classic");
  const leadColor = _lum(deepest)<92 ? deepest : _darken(sig,0.6);
  let accent=bySat.find(c=>c!==leadColor && _sat(c)>0.25) || sig;
  if(_lum(accent)>200) accent=_darken(accent,0.3);
  const cardLayout = personality==="bold" ? "left" : "centered";
  const postLayout = personality==="bold" ? "badge" : "gradient";
  const corner = personality==="bold" ? "sharp" : "round";
  return { personality, leadColor, accentColor:accent, cardLayout, postLayout, corner, voice:DS_VOICE[personality] };
}
function normalizeDesignStrategy(parsed){
  const fb=buildFallbackDesignStrategy(parsed);
  const ds=(parsed && parsed.designStrategy && typeof parsed.designStrategy==="object") ? parsed.designStrategy : {};
  const pick=(v,allow,def)=> (typeof v==="string" && allow.includes(v.trim().toLowerCase())) ? v.trim().toLowerCase() : def;
  const out={
    personality: pick(ds.personality,DS_PERSONALITY,fb.personality),
    leadColor: _normHex(ds.leadColor) || fb.leadColor,
    accentColor: _normHex(ds.accentColor) || fb.accentColor,
    cardLayout: pick(ds.cardLayout,DS_CARD,fb.cardLayout),
    postLayout: pick(ds.postLayout,DS_POST,fb.postLayout),
    corner: pick(ds.corner,DS_CORNER,fb.corner),
    voice: (typeof ds.voice==="string" && ds.voice.trim()) ? ds.voice.trim().slice(0,120) : fb.voice
  };
  return out;
}

/* ── environmentProfile: machine-readable atmosphere the app applies automatically (always present, derived if the model is thin) ── */
const EP_MOOD=["editorial","modern","natural","energetic","clinical","scholarly","expressive","refined"];
const EP_LIGHT=["warm","cool","bright","natural"];
const EP_MAT=["glass","stone","wood","metal","paper"];
const EP_MOTION=["slow","responsive","calm","drift"];
function buildFallbackEnvironmentProfile(parsed){
  const cols=((parsed && (parsed.colors||parsed.palette)) || []).map(c=>_normHex(c && c.hex)).filter(Boolean)
    .filter(h=>!/^#(000000|ffffff)$/i.test(h));
  const pers=((parsed && parsed.designStrategy && parsed.designStrategy.personality) || "refined");
  let lighting="natural", material="stone", mood="refined";
  if(cols.length){
    let hx=0,hy=0,s=0,l=0,n=0;
    for(const h of cols){ const c=_hexToRgb(h), mx=Math.max(...c), mn=Math.min(...c), d=mx-mn;
      const li=(mx+mn)/510, sa=mx?d/mx:0; let hue=0;
      if(d){ if(mx===c[0]) hue=((c[1]-c[2])/d)%6; else if(mx===c[1]) hue=(c[2]-c[0])/d+2; else hue=(c[0]-c[1])/d+4; hue*=60; if(hue<0)hue+=360; }
      hx+=Math.cos(hue*Math.PI/180); hy+=Math.sin(hue*Math.PI/180); s+=sa; l+=li; n++;
    }
    const hue=((Math.atan2(hy/n,hx/n)*180/Math.PI)+360)%360, sat=s/n, light=l/n;
    if(light>0.72 && sat<0.32) lighting="bright";
    else if(hue<70||hue>=330) lighting="warm";
    else if(hue>=180&&hue<300) lighting="cool";
    else lighting="natural";
    mood = sat>0.5 ? (pers==="bold"?"energetic":"expressive")
         : (lighting==="bright"?"clinical":(lighting==="warm"?"editorial":"modern"));
    material = lighting==="warm"?"paper" : lighting==="cool"?"metal" : lighting==="bright"?"glass" : "stone";
  }
  const motion = (pers==="bold"||pers==="technical") ? "responsive" : ((pers==="classic"||pers==="warm")?"calm":"slow");
  const intensity = (pers==="bold"||pers==="technical") ? 0.8 : ((pers==="classic"||pers==="warm")?0.55:0.45);
  return { mood, lighting, material, motion, intensity };
}
function normalizeEnvironmentProfile(parsed){
  const fb=buildFallbackEnvironmentProfile(parsed);
  const ep=(parsed && parsed.environmentProfile && typeof parsed.environmentProfile==="object") ? parsed.environmentProfile : {};
  const pick=(v,allow,def)=> (typeof v==="string" && allow.includes(v.trim().toLowerCase())) ? v.trim().toLowerCase() : def;
  let intensity=Number(ep.intensity); if(!isFinite(intensity)) intensity=fb.intensity;
  intensity=Math.max(0.25,Math.min(0.95,intensity));
  return {
    mood: pick(ep.mood,EP_MOOD,fb.mood),
    lighting: pick(ep.lighting,EP_LIGHT,fb.lighting),
    material: pick(ep.material,EP_MAT,fb.material),
    motion: pick(ep.motion,EP_MOTION,fb.motion),
    intensity: Math.round(intensity*100)/100,
    accent: _normHex(ep.accent) || (((parsed && (parsed.colors||parsed.palette)) || [])[0]||{}).hex || ""
  };
}

// Guarantee the Brand Home contract: fill every new field with a confident value,
// deriving from what the model already returned, and back-fill legacy fields so
// existing consumers (builder apply, ZIP, export, manual editing) never break.
function normalizeBrandUnderstanding(parsed, assets, preparationReport){
  const S = (v, d="") => (typeof v === "string" && v.trim()) ? v.trim() : d;
  const arr = v => Array.isArray(v) ? v.filter(Boolean) : [];
  const g = (parsed.guide && typeof parsed.guide === "object") ? parsed.guide : (parsed.guide = {});
  const b = (parsed.brand && typeof parsed.brand === "object") ? parsed.brand : {};
  const ls = (parsed.logoSystem && typeof parsed.logoSystem === "object") ? parsed.logoSystem : {};
  const sel = (parsed.selectedAssets && typeof parsed.selectedAssets === "object") ? parsed.selectedAssets : {};
  const ts = (parsed.typographySystem && typeof parsed.typographySystem === "object") ? parsed.typographySystem : {};
  const pal = arr(parsed.palette).length ? parsed.palette : arr(parsed.colors);

  // identity & metadata
  parsed.clientName = S(parsed.clientName, S(g.clientName, S(b.name)));
  parsed.industry = S(parsed.industry, S(g.category, S(b.industry)));
  parsed.location = S(parsed.location);
  parsed.establishedYear = S(parsed.establishedYear);
  parsed.brandSummary = S(parsed.brandSummary, S(g.description, S(b.positioning)));
  let conf = Number(parsed.confidence); if (!isFinite(conf)) conf = 0;
  parsed.confidence = Math.max(0, Math.min(1, conf || 0.7));

  // keep legacy guide in sync so the builder/apply path keeps working
  g.clientName = g.clientName || parsed.clientName;
  g.category = g.category || parsed.industry;
  g.description = g.description || parsed.brandSummary;

  // identity slots (filenames) — derive from logoSystem / selectedAssets
  const id = (parsed.identity && typeof parsed.identity === "object") ? parsed.identity : {};
  parsed.identity = {
    primaryLogo: S(id.primaryLogo, S(ls.primaryLogo && ls.primaryLogo.file, S(sel.primaryLogo, S(sel.heroLogo)))),
    secondaryLogo: S(id.secondaryLogo, S(sel.iconVariant)),
    iconMark: S(id.iconMark, S(ls.iconMark && ls.iconMark.file, S(sel.iconMark))),
    wordmark: S(id.wordmark, S(ls.wordmark && ls.wordmark.file)),
    badge: S(id.badge)
  };

  // palette with roles
  const ROLES = ["Primary","Secondary","Accent","Neutral","Background","Text"];
  parsed.palette = arr(pal).slice(0,6).map((c,i) => ({
    name: S(c && c.name, "Colour " + (i+1)),
    hex: _normHex(c && (c.hex || c.value)) || "#15140f",
    role: S(c && (c.role || c.name), ROLES[i] || "Accent"),
    usage: S(c && c.usage)
  }));
  if (!parsed.palette.length && parsed.identity) parsed.palette = [{ name:"Ink", hex:"#15140f", role:"Primary" }];

  // typography — detected vs recommended
  const tIn = (parsed.typography && typeof parsed.typography === "object") ? parsed.typography : {};
  const detected = arr(tIn.detected);
  let recommended = arr(tIn.recommended);
  if (!recommended.length) {
    const disp = S(ts.display && ts.display.name, S(parsed.typographyDisplay));
    const body = S(ts.body && ts.body.name, "Inter");
    recommended = [
      { name: disp || "Fraunces", role: "Display" },
      { name: body || "Inter", role: "Body" }
    ];
  }
  parsed.typography = Object.assign({}, tIn, { detected, recommended });

  parsed.personality = arr(parsed.personality).length ? parsed.personality : arr(b.personality);
  parsed.visualThemes = arr(parsed.visualThemes);

  // asset plan — derive from assetReport if absent
  const ap = (parsed.assetPlan && typeof parsed.assetPlan === "object") ? parsed.assetPlan : {};
  const report = arr(parsed.assetReport);
  parsed.assetPlan = {
    logos: arr(ap.logos).length ? ap.logos : report.filter(r => /logo|mark|wordmark|icon|badge/i.test(S(r.assetType))).map(r => r.name).filter(Boolean),
    supportingAssets: arr(ap.supportingAssets).length ? ap.supportingAssets : report.filter(r => /photo|pattern|document/i.test(S(r.assetType))).map(r => r.name).filter(Boolean),
    duplicates: arr(ap.duplicates),
    ignore: arr(ap.ignore)
  };

  // brand home section copy
  const bh = (parsed.brandHomeSections && typeof parsed.brandHomeSections === "object") ? parsed.brandHomeSections : {};
  const nm = parsed.clientName || "this brand";
  parsed.brandHomeSections = {
    identity: S(bh.identity, "The lead identity for " + nm + ", ready to use."),
    colors: S(bh.colors, "A colour system drawn from the marks."),
    typography: S(bh.typography, "A typographic direction set for clarity and character."),
    voice: S(bh.voice, S(b.voice, "A calm, confident brand voice.")),
    usage: S(bh.usage, "Clear rules so the marks always read well."),
    downloads: S(bh.downloads, "Your logos, colours, and type — ready to download.")
  };

  // decisions (completed) / missing / nextActions
  parsed.decisions = arr(parsed.decisions);
  if (!parsed.decisions.length) {
    const d = ["Primary identity selected"];
    if (parsed.identity.secondaryLogo || parsed.identity.badge || parsed.identity.iconMark) d.push("Supporting badge organized");
    if (parsed.palette.length) d.push("Color system established");
    d.push("Typography direction prepared");
    d.push("Brand Home content written");
    parsed.decisions = d;
  }
  parsed.missing = arr(parsed.missing);
  parsed.nextActions = arr(parsed.nextActions).length
    ? parsed.nextActions
    : arr(parsed.recommendations).map(r => S(r.nextAction)).filter(Boolean).slice(0,4);
  if (!parsed.nextActions.length) parsed.nextActions = ["Confirm the foundation", "Open your Brand Home"];

  return parsed;
}

// Guarantee the presentation layer: a complete, brand-specific studio write-up
// for all eight sections, derived from the understanding when the model is thin.
function normalizePresentation(parsed){
  const S = (v, d="") => (typeof v === "string" && v.trim()) ? v.trim() : d;
  const arr = v => Array.isArray(v) ? v.filter(Boolean) : [];
  const nm = parsed.clientName || "this brand";
  const ind = parsed.industry || "";
  const indLc = ind ? ind.toLowerCase() : "its field";
  const bh = parsed.brandHomeSections || {};
  const palNames = arr(parsed.palette).map(c => c.name).filter(Boolean);
  const palText = palNames.length ? palNames.slice(0,4).join(", ") : "a focused set of brand tones";
  const rec = arr(parsed.typography && parsed.typography.recommended);
  const disp = S(rec.find(r => /display|head/i.test(r.role || ""))?.name, "a confident display face");
  const body = S(rec.find(r => /body|text/i.test(r.role || ""))?.name, "a clean, readable body face");
  const traits = arr(parsed.personality).slice(0,3).join(", ") || "considered and grounded";
  const themes = arr(parsed.visualThemes).slice(0,2).join(" · ");

  const DEF = {
    overview:   { title:"Brand Overview",        intro:S(parsed.brandSummary, nm + " is a " + indLc + " brand with a clear, ownable identity."), rationale:"Everything here was drawn from the marks " + nm + " already uses, so the system reads as one voice.", usage:"Lead with this overview when introducing the brand to a new client, partner, or teammate." },
    identity:   { title:"Identity System",       intro:S(bh.identity, nm + "'s primary mark is the lead signature of the brand and should front most customer-facing materials."), rationale:"The primary lockup carries the most recognition, so it anchors the system; supporting marks step in where space is tight.", usage:"Use the primary identity on signage, web headers, invoices, and social profiles; reserve the icon for compact placements." },
    color:      { title:"Color System",          intro:S(bh.colors, "The palette is built from " + palText + " — drawn straight from the marks."), rationale:"These colours come from " + nm + "'s own artwork, so the system stays authentic rather than imposed.", usage:"Let the primary colour lead, support with the secondary tones, and keep neutrals for type and backgrounds." },
    typography: { title:"Typography Direction",  intro:S(bh.typography, "A pairing of " + disp + " for display and " + body + " for body sets a clear, confident voice."), rationale:"Display carries character at large sizes; the body face keeps everything legible and calm.", usage:"Use display for headlines and hero moments, and the body face for running copy, captions, and UI." },
    visual:     { title:"Visual Language",       intro:(themes ? "The visual language reads " + themes + " — " : "") + "a look that feels " + traits + ".", rationale:"The personality of " + nm + " guides texture, spacing, and imagery so every touchpoint feels related.", usage:"Apply this language to photography, layouts, and social so the brand feels consistent everywhere." },
    usage:      { title:"Usage Guidance",        intro:S(bh.usage, "Clear, simple rules keep " + nm + "'s identity strong wherever it appears."), rationale:"Consistency is what makes a brand feel established; these guardrails protect the marks without slowing anyone down.", usage:"Give the marks room, keep contrast strong, and avoid stretching, recolouring, or crowding them." },
    assets:     { title:"Asset Library",         intro:"Every uploaded asset has been organised, named, and sorted into a clean library.", rationale:"A tidy library means the right file is always one click away — primary marks, variants, and supporting assets in their place.", usage:"Pull from here whenever you need a logo, colour, or asset for a new piece." },
    downloads:  { title:"Download Package",      intro:S(bh.downloads, "Your logos, colours, and type are packaged and ready to hand off."), rationale:"Everything is exported in the formats a printer, developer, or partner will ask for.", usage:"Download the package to share the brand, or publish the Brand Home as a living link." }
  };
  const ORDER = ["overview","identity","color","typography","visual","usage","assets","downloads"];

  const inModel = {};
  const p = (parsed.presentation && typeof parsed.presentation === "object") ? parsed.presentation : {};
  arr(p.sections).forEach(s => { if (s && s.id) inModel[String(s.id).toLowerCase()] = s; });

  const sections = ORDER.map(id => {
    const m = inModel[id] || {};
    const d = DEF[id];
    let conf = Number(m.confidence); if (!isFinite(conf)) conf = parsed.confidence || 0.85;
    return {
      id,
      title: S(m.title, d.title),
      intro: S(m.intro, d.intro),
      rationale: S(m.rationale, d.rationale),
      usage: S(m.usage, d.usage),
      confidence: Math.max(0, Math.min(1, conf)),
      inferred: S(m.inferred, "Read from the assets " + nm + " uploaded."),
      refine: S(m.refine, "Add more brand material anytime and this section sharpens automatically.")
    };
  });

  parsed.presentation = {
    headline: S(p.headline, nm + ", brought together."),
    subheadline: S(p.subheadline, "A starter brand system, prepared from your assets."),
    overview: S(p.overview, S(parsed.brandSummary, nm + "'s identity, colour, and type — organised into one calm, client-ready system.")),
    sections
  };
  return parsed;
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

  // ── Narrow specialist mode: the Identity Lead reads ONE (or few) marks, fast.
  // Returns just the identity slice and skips the full analysis + website enrichment + post-processing.
  if (body?.mode === "identity") {
    const IDENTITY_PROMPT = `You are the Identity specialist for Moving Day. Look only at the uploaded mark(s) and report the identity essentials. Never invent facts about the company. Return ONLY valid JSON, no markdown, in exactly this shape:
{
  "name": "string — the brand name read from the artwork's text, or empty if not legible",
  "tagline": "string — a tagline/line if one is visibly present, else empty",
  "primaryTone": "dark | light | mixed — the mark's overall tone",
  "recommendedBackground": "#rrggbb — a background that CONTRASTS with the mark so it never disappears",
  "palette": [ { "name": "string", "hex": "#rrggbb", "role": "Primary|Secondary|Accent|Neutral|Background|Text" } ],
  "typeface": "string — the visible typeface if identifiable from the mark, else empty"
}
Read colours from the real pixels. Return 3-6 palette entries. If something is not legible, use an empty string rather than guessing.`;

    const idContent = [];
    for (const asset of assets) {
      const { type, dataUrl } = asset || {};
      if (imageTypes.has(String(type || "")) && dataUrl) {
        idContent.push({ type: "image_url", image_url: { url: dataUrl, detail: "high" } });
      }
    }
    if (!idContent.length) {
      return res.status(400).json({ error: "Identity mode needs at least one raster image of the mark." });
    }
    idContent.push({ type: "text", text: "Read the identity essentials from the mark(s) above. Return only the JSON shape specified." });

    try {
      const idResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          temperature: 0.2,
          max_tokens: 900,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: IDENTITY_PROMPT },
            { role: "user", content: idContent }
          ]
        })
      });
      if (!idResp.ok) {
        const t = await idResp.text();
        console.error("[analyze-brand-files:identity] OpenAI " + idResp.status + ": " + t);
        return res.status(502).json({ error: `OpenAI API error: ${idResp.status}`, detail: t });
      }
      const idJson = await idResp.json();
      const idRaw = idJson?.choices?.[0]?.message?.content || "";
      let idOut;
      try { idOut = cleanModelJson(idRaw); } catch {
        return res.status(422).json({ error: "Identity mode returned non-JSON.", raw: idRaw });
      }
      if (!Array.isArray(idOut.palette)) idOut.palette = [];
      idOut.mode = "identity";
      return res.status(200).json(idOut);
    } catch (err) {
      console.error("[analyze-brand-files:identity] fetch failed: " + err.message);
      return res.status(502).json({ error: "Failed to reach OpenAI API.", detail: err.message });
    }
  }

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
      `File (weak hint only): ${safeName}`,
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
          `[SVG asset — not rasterized, so you cannot see it directly]\n${metadataText}\n` +
          "Infer its role from filename, extension, and prepared category, and set a LOWER confidence because you could not visually inspect it. Reference it by its exact filename."
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
          "The image above is a prepared brand asset. Classify it by what you SEE — full logo lockup, " +
          "icon/symbol mark, wordmark/logotype, monochrome or knockout variant, photograph, pattern, or reference document. " +
          "The filename below is only a weak hint and may be generic or wrong; trust the image over the filename.\n" +
          `${metadataText}\n` +
          "Reference this asset by its exact filename in your output. If it is a logo, report its tone (dark, light, or mixed), " +
          "whether it has a transparent background, and a recommendedBackground that CONTRASTS with its tone so it never disappears."
      });

      continue;
    }

    content.push({
      type: "text",
      text:
        `[Non-visual uploaded asset — you cannot see it]\n${metadataText}\n` +
        "Do not attempt to visually inspect this file. Infer its brand role from filename, extension, and prepared category, and set a LOWER confidence."
    });
  }

  content.push({
    type: "text",
    text:
      "Perform brand understanding from the uploaded visual assets and the local preparation report. " +
      "Classify each asset by its image content, not its filename. Identify the primary logo, icon mark, and wordmark from the actual artwork, " +
      "and give every logo a tone and a contrasting recommendedBackground. " +
      "If any artwork shows a web address, return it as brand.website (normalized https://…), else null. " +
      "Return the full structured JSON exactly in the required shape. Use exact filenames. Do not include markdown."
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
        max_tokens: 8000,
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
      console.error("[analyze-brand-files] OpenAI " + response.status + ": " + errorText);

      return res.status(502).json({
        error: `OpenAI API error: ${response.status}`,
        detail: errorText
      });
    }

    openAiResponse = await response.json();
  } catch (err) {
    console.error("[analyze-brand-files] fetch to OpenAI failed: " + err.message);
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

  // Always provide safe, contrasting logo placement data for the renderers.
  parsed.logoSystem = normalizeLogoSystem(parsed);

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

  // Two-pass website enrichment — best-effort, never blocks intake.
  // Off when the request opts out (websiteLookup:false) or env WEBSITE_ENRICHMENT=off.
  const websiteLookup = body?.websiteLookup !== false && process.env.WEBSITE_ENRICHMENT !== "off";
  if (websiteLookup) {
    try {
      await maybeEnrichFromWebsite(parsed, apiKey, process.env.OPENAI_MODEL || "gpt-4o");
    } catch (e) {
      parsed.websiteEnriched = false;
    }
  } else {
    parsed.websiteEnriched = false;
  }

  // brandWorld is always present and complete — derived from the palette if the model was thin.
  parsed.brandWorld = normalizeBrandWorld(parsed);
  // designStrategy tells the app how to design this brand's applications — always present.
  parsed.designStrategy = normalizeDesignStrategy(parsed);

  // Brand Home contract: guarantee the new understanding fields + back-fill legacy.
  parsed = normalizeBrandUnderstanding(parsed, assets, preparationReport);
  // Presentation layer: studio-written copy for every Brand Home section.
  parsed = normalizePresentation(parsed);

  return res.status(200).json(parsed);
}