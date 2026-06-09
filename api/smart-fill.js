// Vercel Serverless Function
// Route: /api/smart-fill

const DEFAULT_COLORS = ['#1F3D2E', '#2D5642', '#C4D9CB', '#F1ECDF', '#15140F'];

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMeta(html = '', property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return '';
}

function getTitle(html = '') {
  const ogTitle = getMeta(html, 'og:title');
  if (ogTitle) return ogTitle;
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? stripHtml(title[1]) : '';
}

function getDescription(html = '') {
  return getMeta(html, 'description') || getMeta(html, 'og:description');
}

function normalizeHex(value, fallback) {
  if (!value) return fallback;
  const cleaned = String(value).trim().replace(/[^#a-fA-F0-9]/g, '');
  const match = cleaned.match(/^#?[0-9a-fA-F]{6}$/);
  return match ? `#${cleaned.replace('#', '').toUpperCase()}` : fallback;
}

function extractJson(text = '') {
  const direct = text.trim();
  try { return JSON.parse(direct); } catch (_) {}
  const fenced = direct.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch (_) {}
  }
  const object = direct.match(/\{[\s\S]*\}/);
  if (object) {
    try { return JSON.parse(object[0]); } catch (_) {}
  }
  return null;
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return await new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 500, { error: 'Missing OPENAI_API_KEY in Vercel Environment Variables.' });
  }

  let url;
  try {
    const body = await readRequestBody(req);
    url = String(body.url || '').trim();
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error('Invalid protocol');
  } catch (_) {
    return sendJson(res, 400, { error: 'Please send a valid website URL.' });
  }

  let html = '';
  try {
    const siteResponse = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'MovingDayBrandGuideBot/1.0',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    html = await siteResponse.text();
  } catch (_) {
    html = '';
  }

  const title = getTitle(html);
  const description = getDescription(html);
  const visibleText = stripHtml(html).slice(0, 6000);

  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: 'You fill a brand guide builder from website text. Return only valid JSON with these exact keys: clientName, category, brandStatement, displayFont, bodyFont, color1, color2, color3, color4, color5. Colors must be 6-digit hex strings. Do not include markdown.'
          },
          {
            role: 'user',
            content: JSON.stringify({ url, title, description, visibleText })
          }
        ],
        temperature: 0.25,
        max_output_tokens: 700
      })
    });

    const apiData = await openAiResponse.json();
    if (!openAiResponse.ok) {
      return sendJson(res, openAiResponse.status, {
        error: apiData?.error?.message || 'OpenAI request failed.'
      });
    }

    const outputText = apiData.output_text || apiData.output?.flatMap(item => item.content || []).map(part => part.text || '').join('\n') || '';
    const parsed = extractJson(outputText) || {};

    return sendJson(res, 200, {
      clientName: parsed.clientName || title || new URL(url).hostname.replace(/^www\./, ''),
      category: parsed.category || 'Brand',
      brandStatement: parsed.brandStatement || description || 'A refined brand system built from the client website and uploaded assets.',
      displayFont: parsed.displayFont || 'Instrument Serif',
      bodyFont: parsed.bodyFont || 'Geist',
      color1: normalizeHex(parsed.color1, DEFAULT_COLORS[0]),
      color2: normalizeHex(parsed.color2, DEFAULT_COLORS[1]),
      color3: normalizeHex(parsed.color3, DEFAULT_COLORS[2]),
      color4: normalizeHex(parsed.color4, DEFAULT_COLORS[3]),
      color5: normalizeHex(parsed.color5, DEFAULT_COLORS[4])
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error?.message || 'Smart Fill failed.'
    });
  }
}
